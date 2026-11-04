// supabase/functions/create-payout/index.ts
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
    const { restaurant_id, period_start, period_end } = body;

    if (!restaurant_id || !period_start || !period_end) {
      return createErrorResponse('Missing required settlement fields (restaurant_id, period_start, period_end)', 422);
    }

    // Must be OWNER of the restaurant
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId } = authContext;

    // Generate unique settlement reference
    const settlementRef = `SET-${period_start.replace(/-/g, '')}-${restaurant_id.slice(0, 4).toUpperCase()}`;

    // Check for existing settlement in this period (idempotency)
    const { data: existingPayout } = await adminClient
      .from('payouts')
      .select('id, settlement_reference, status, net_amount')
      .eq('restaurant_id', restaurant_id)
      .eq('settlement_reference', settlementRef)
      .maybeSingle();

    if (existingPayout) {
      return createSuccessResponse({
        message: 'Settlement record already exists for this period',
        payout: existingPayout,
      });
    }

    // Calculate completed orders in period
    const { data: deliveredOrders, error: ordersErr } = await adminClient
      .from('orders')
      .select('total_amount')
      .eq('restaurant_id', restaurant_id)
      .eq('status', 'DELIVERED')
      .eq('payment_status', 'PAID')
      .gte('created_at', `${period_start}T00:00:00Z`)
      .lte('created_at', `${period_end}T23:59:59Z`);

    if (ordersErr) {
      return createErrorResponse('Failed to aggregate period orders', 500);
    }

    const grossAmount = (deliveredOrders || []).reduce((sum, o) => sum + Number(o.total_amount), 0);
    const commission = Math.round(grossAmount * 0.18 * 100) / 100; // 18% Platform Commission
    const tax = Math.round(commission * 0.18 * 100) / 100; // 18% GST on Commission
    const netAmount = Math.max(0, grossAmount - commission - tax);

    // Insert payout in PENDING state
    const { data: newPayout, error: payoutErr } = await adminClient
      .from('payouts')
      .insert({
        restaurant_id,
        settlement_reference: settlementRef,
        amount: grossAmount,
        commission,
        tax,
        net_amount: netAmount,
        status: 'PENDING',
        period_start,
        period_end,
      })
      .select()
      .single();

    if (payoutErr || !newPayout) {
      console.error('Payout creation error:', payoutErr);
      return createErrorResponse('Failed to create payout record', 500);
    }

    // Audit Log
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'PAYOUT_CREATED',
      resource_type: 'payouts',
      resource_id: newPayout.id,
      metadata: { settlement_reference: settlementRef, gross: grossAmount, net: netAmount },
    });

    return createSuccessResponse(newPayout, 201);
  } catch (err: any) {
    console.error('Unhandled create-payout exception:', err);
    return createErrorResponse('An internal error occurred while creating payout', 500);
  }
});
