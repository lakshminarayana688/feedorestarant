// supabase/functions/update-order-status/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';

const VALID_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED', 'REJECTED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
  REJECTED: [],
};

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { order_id, restaurant_id, next_status, reason, pickup_code } = body;

    if (!order_id || !restaurant_id || !next_status) {
      return createErrorResponse('Missing required fields (order_id, restaurant_id, next_status)', 422);
    }

    // Authenticate and verify membership
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId, role } = authContext;

    // Fetch current order state
    const { data: currentOrder, error: orderErr } = await adminClient
      .from('orders')
      .select('id, status, restaurant_id, pickup_code')
      .eq('id', order_id)
      .eq('restaurant_id', restaurant_id)
      .single();

    if (orderErr || !currentOrder) {
      return createErrorResponse('Order not found for this restaurant', 404);
    }

    // Role-specific constraints
    if (role === 'KITCHEN') {
      if (!['PREPARING', 'READY'].includes(next_status)) {
        return createErrorResponse('Kitchen role can only set status to PREPARING or READY', 403);
      }
    }

    if (role === 'CASHIER') {
      if (['PREPARING', 'READY'].includes(next_status)) {
        return createErrorResponse('Cashier role cannot change kitchen preparation status', 403);
      }
    }

    // Validate Transition
    const allowedNext = VALID_TRANSITIONS[currentOrder.status] || [];
    if (!allowedNext.includes(next_status)) {
      return createErrorResponse(
        `Invalid status transition from '${currentOrder.status}' to '${next_status}'`,
        400
      );
    }

    // If verifying pickup, validate code strictly
    if (next_status === 'PICKED_UP') {
      if (!pickup_code || String(pickup_code).trim() !== String(currentOrder.pickup_code).trim()) {
        return createErrorResponse('Invalid or missing 4-digit pickup code entered for handover', 400);
      }
    }

    const updates: Record<string, any> = {
      status: next_status,
      updated_at: new Date().toISOString(),
    };

    if (next_status === 'ACCEPTED') updates.accepted_at = new Date().toISOString();
    if (next_status === 'PREPARING') updates.prepared_at = new Date().toISOString();
    if (next_status === 'READY') updates.ready_at = new Date().toISOString();
    if (next_status === 'PICKED_UP') updates.picked_up_at = new Date().toISOString();
    if (next_status === 'DELIVERED') updates.delivered_at = new Date().toISOString();
    if (next_status === 'REJECTED') {
      updates.rejection_reason = reason || 'Restaurant busy';
      updates.cancelled_at = new Date().toISOString();
    }
    if (next_status === 'CANCELLED') {
      updates.cancellation_reason = reason || 'Cancelled by staff';
      updates.cancelled_at = new Date().toISOString();
    }

    const { data: updatedOrder, error: updateErr } = await adminClient
      .from('orders')
      .update(updates)
      .eq('id', order_id)
      .select()
      .single();

    if (updateErr) {
      return createErrorResponse('Failed to update order status', 500);
    }

    // Audit Log
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'ORDER_STATUS_UPDATED',
      resource_type: 'orders',
      resource_id: order_id,
      metadata: {
        from_status: currentOrder.status,
        to_status: next_status,
        role,
        reason: reason || null,
      },
    });

    return createSuccessResponse(updatedOrder);
  } catch (err: any) {
    console.error('Unhandled update-order-status exception:', err);
    return createErrorResponse('An internal error occurred while updating order status', 500);
  }
});
