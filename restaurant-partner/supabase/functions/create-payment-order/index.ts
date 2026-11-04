// supabase/functions/create-payment-order/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') || 'rzp_test_feedo_public_key';

  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body = await req.json();
    const { order_id, restaurant_id, payment_method = 'UPI' } = body;

    if (!order_id || !restaurant_id) {
      return createErrorResponse('Missing required fields (order_id, restaurant_id)', 422);
    }

    // 1. Fetch Order from database
    const { data: order, error: orderErr } = await adminClient
      .from('orders')
      .select('id, restaurant_id, total_amount, payment_status, payment_method, status')
      .eq('id', order_id)
      .eq('restaurant_id', restaurant_id)
      .single();

    if (orderErr || !order) {
      return createErrorResponse('Order not found', 404);
    }

    // 2. Prevent creating payment order for already paid or cancelled orders
    if (order.payment_status === 'PAID') {
      return createErrorResponse('Order has already been paid', 400);
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return createErrorResponse(`Cannot initialize payment for order in '${order.status}' status`, 400);
    }

    const amountInPaise = Math.round(Number(order.total_amount) * 100);
    const paymentOrderId = `order_${order_id}_${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Update order payment method and mark as PENDING
    await adminClient
      .from('orders')
      .update({
        payment_method,
        payment_status: 'PENDING',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    // 4. Audit Log
    await adminClient.from('audit_logs').insert({
      restaurant_id,
      action: 'PAYMENT_ORDER_INITIALIZED',
      resource_type: 'orders',
      resource_id: order_id,
      metadata: {
        payment_order_id: paymentOrderId,
        amount: order.total_amount,
        amount_in_paise: amountInPaise,
        currency: 'INR',
        payment_method,
      },
    });

    // 5. Return Public Checkout parameters (Secrets are NEVER returned)
    return createSuccessResponse({
      order_id,
      payment_order_id: paymentOrderId,
      amount: order.total_amount,
      amount_in_paise: amountInPaise,
      currency: 'INR',
      key_id: razorpayKeyId,
      status: 'PENDING',
    }, 201);
  } catch (err: any) {
    console.error('Unhandled create-payment-order exception:', err);
    return createErrorResponse('Internal error creating payment order', 500);
  }
});
