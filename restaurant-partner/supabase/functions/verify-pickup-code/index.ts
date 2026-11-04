// supabase/functions/verify-pickup-code/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { order_id, restaurant_id, pickup_code } = body;

    if (!order_id || !pickup_code) {
      return createErrorResponse('Missing required fields (order_id, pickup_code)', 422);
    }

    // 1. Authenticate user & verify restaurant membership
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId, role } = authContext;

    // 2. Fetch order state from database
    const { data: order, error: orderErr } = await adminClient
      .from('orders')
      .select('id, status, restaurant_id, pickup_code, customer_name_snapshot, total_amount')
      .eq('id', order_id)
      .eq('restaurant_id', restaurant_id || authContext.restaurantId)
      .single();

    if (orderErr || !order) {
      return createErrorResponse('Order not found for this restaurant (Multi-tenant check failed)', 404);
    }

    // 3. Duplicate Handover Protection
    if (order.status === 'PICKED_UP' || order.status === 'DELIVERED') {
      return createErrorResponse('Duplicate handover blocked: Order has already been picked up / delivered', 400);
    }

    // 4. Validate Order State Machine
    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return createErrorResponse(`Cannot handover cancelled/rejected order (Current status: '${order.status}')`, 400);
    }

    if (order.status !== 'READY' && order.status !== 'PREPARING') {
      return createErrorResponse(`Invalid order state for handover: Order must be PREPARING or READY (Current: '${order.status}')`, 400);
    }

    // 5. Authoritative 4-Digit Pickup Code Verification
    const cleanEntered = String(pickup_code).trim();
    const cleanExpected = String(order.pickup_code).trim();

    if (cleanEntered !== cleanExpected) {
      // Record failed attempt in audit log
      await adminClient.from('audit_logs').insert({
        user_id: userId,
        restaurant_id: order.restaurant_id,
        action: 'PICKUP_CODE_VERIFICATION_FAILED',
        resource_type: 'orders',
        resource_id: order_id,
        metadata: { entered_code_length: cleanEntered.length, role },
      });

      return createErrorResponse('Invalid 4-digit pickup code entered. Handover rejected.', 400);
    }

    // 6. Update Order Status to PICKED_UP
    const nowIso = new Date().toISOString();
    const { data: updatedOrder, error: updateErr } = await adminClient
      .from('orders')
      .update({
        status: 'PICKED_UP',
        picked_up_at: nowIso,
        updated_at: nowIso,
      })
      .eq('id', order_id)
      .select()
      .single();

    if (updateErr || !updatedOrder) {
      console.error('Failed to update order status to PICKED_UP:', updateErr);
      return createErrorResponse('Failed to record order handover in database', 500);
    }

    // 7. Record Immutable Audit Trail
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id: order.restaurant_id,
      action: 'ORDER_HANDOVER_VERIFIED',
      resource_type: 'orders',
      resource_id: order_id,
      metadata: {
        verified_by_role: role,
        picked_up_at: nowIso,
        customer: order.customer_name_snapshot,
      },
    });

    return createSuccessResponse({
      verified: true,
      order_id,
      status: 'PICKED_UP',
      picked_up_at: nowIso,
      message: 'Pickup code verified successfully. Order handed over to delivery partner.',
    });
  } catch (err: any) {
    console.error('Unhandled verify-pickup-code exception:', err);
    return createErrorResponse('Internal error verifying pickup code', 500);
  }
});
