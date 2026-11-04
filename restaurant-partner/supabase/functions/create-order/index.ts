// supabase/functions/create-order/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { maskPhone } from '../_shared/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const {
      restaurant_id,
      customer_name,
      customer_phone,
      customer_address,
      items, // [{ menu_item_id: string, quantity: number, special_instructions?: string }]
      special_instructions,
      payment_method = 'UPI',
    } = body;

    if (!restaurant_id || !customer_name || !customer_phone || !customer_address || !Array.isArray(items) || items.length === 0) {
      return createErrorResponse('Invalid order request. Missing restaurant or order items', 422);
    }

    // 1. Verify restaurant status & verification
    const { data: restaurant, error: restErr } = await adminClient
      .from('restaurants')
      .select('id, name, status, verification_status, is_online')
      .eq('id', restaurant_id)
      .single();

    if (restErr || !restaurant) {
      return createErrorResponse('Restaurant not found', 404);
    }

    if (restaurant.verification_status !== 'approved' || restaurant.status !== 'active') {
      return createErrorResponse('Restaurant is not currently accepting live orders', 400);
    }

    // 2. Fetch official menu items from database to prevent price tampering
    const menuItemIds = items.map((i: any) => i.menu_item_id);
    const { data: dbMenuItems, error: menuErr } = await adminClient
      .from('menu_items')
      .select('id, name, price, discount_price, is_available, is_veg')
      .in('id', menuItemIds)
      .eq('restaurant_id', restaurant_id);

    if (menuErr || !dbMenuItems || dbMenuItems.length !== menuItemIds.length) {
      return createErrorResponse('One or more selected menu items are invalid or not found', 400);
    }

    // Check item availability & calculate totals server-side
    let subtotal = 0;
    const orderItemsToInsert: any[] = [];

    for (const itemReq of items) {
      const dbItem = dbMenuItems.find(m => m.id === itemReq.menu_item_id);
      if (!dbItem || !dbItem.is_available) {
        return createErrorResponse(`Item "${dbItem?.name || 'Selected item'}" is currently out of stock`, 400);
      }

      const qty = Math.max(1, parseInt(itemReq.quantity, 10) || 1);
      const unitPrice = dbItem.discount_price !== null && dbItem.discount_price !== undefined ? Number(dbItem.discount_price) : Number(dbItem.price);
      const itemTotal = unitPrice * qty;
      subtotal += itemTotal;

      orderItemsToInsert.push({
        menu_item_id: dbItem.id,
        item_name_snapshot: dbItem.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        is_veg: dbItem.is_veg,
        special_instructions: itemReq.special_instructions || null,
      });
    }

    const deliveryFee = 40.0;
    const platformFee = 10.0;
    const tax = Math.round((subtotal * 0.05) * 100) / 100; // 5% GST
    const discount = 0.0;
    const totalAmount = subtotal + deliveryFee + platformFee + tax - discount;

    const orderId = 'FD' + Math.floor(10000 + Math.random() * 90000);
    const orderNumber = '#' + orderId;
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    // 3. Insert Order Record
    const { data: newOrder, error: orderInsertErr } = await adminClient
      .from('orders')
      .insert({
        id: orderId,
        restaurant_id,
        customer_name_snapshot: customer_name.trim(),
        customer_phone_masked: maskPhone(customer_phone),
        customer_address_snapshot: customer_address.trim(),
        order_number: orderNumber,
        status: 'PLACED',
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        tax,
        discount,
        total_amount: totalAmount,
        payment_status: 'PENDING',
        payment_method,
        pickup_code: pickupCode,
        prep_minutes: 18,
        special_instructions: special_instructions || null,
      })
      .select()
      .single();

    if (orderInsertErr || !newOrder) {
      console.error('Order insert error:', orderInsertErr);
      return createErrorResponse('Failed to create order record', 500);
    }

    // 4. Insert Snapshot Order Items
    const itemsWithOrderId = orderItemsToInsert.map(i => ({ ...i, order_id: orderId }));
    const { error: itemsInsertErr } = await adminClient
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsInsertErr) {
      console.error('Order items insert error:', itemsInsertErr);
    }

    // 5. Audit Log
    await adminClient.from('audit_logs').insert({
      restaurant_id,
      action: 'ORDER_PLACED',
      resource_type: 'orders',
      resource_id: orderId,
      metadata: { total_amount: totalAmount, items_count: items.length },
    });

    return createSuccessResponse({
      order_id: orderId,
      order_number: orderNumber,
      total_amount: totalAmount,
      pickup_code: pickupCode,
      status: 'PLACED',
    }, 201);
  } catch (err: any) {
    console.error('Unhandled create-order exception:', err);
    return createErrorResponse('An internal error occurred while creating order', 500);
  }
});
