// supabase/functions/process-payout/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const authHeader = req.headers.get('Authorization') || '';
  const isServiceRole = serviceKey && authHeader.includes(serviceKey);

  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const { payout_id, utr_reference, status = 'COMPLETED', restaurant_id } = body;

    if (!payout_id || !utr_reference) {
      return createErrorResponse('Missing required fields (payout_id, utr_reference)', 422);
    }

    // 1. Fetch current payout to verify restaurant and status
    const { data: currentPayout, error: fetchErr } = await adminClient
      .from('payouts')
      .select('id, restaurant_id, status, net_amount, settlement_reference, utr_reference')
      .eq('id', payout_id)
      .single();

    if (fetchErr || !currentPayout) {
      return createErrorResponse('Payout record not found', 404);
    }

    // Idempotency: If already COMPLETED, return current state without duplicate processing
    if (currentPayout.status === 'COMPLETED') {
      return createSuccessResponse({
        message: 'Payout has already been processed (idempotent)',
        payout: currentPayout,
      });
    }

    let actorUserId = 'system-settlement-service';

    // If not using service role key, authenticate user as OWNER of the payout's restaurant
    if (!isServiceRole) {
      const authContext = await authenticateAndAuthorize(req, {
        requiredRestaurantId: currentPayout.restaurant_id,
        allowedRoles: ['OWNER'],
      });
      if (authContext instanceof Response) return authContext;
      actorUserId = authContext.userId;
    }

    // 2. Update payout settlement status
    const { data: updatedPayout, error: updateErr } = await adminClient
      .from('payouts')
      .update({
        status,
        utr_reference: utr_reference.trim(),
        processed_at: new Date().toISOString(),
      })
      .eq('id', payout_id)
      .select()
      .single();

    if (updateErr || !updatedPayout) {
      return createErrorResponse('Failed to update payout settlement status', 500);
    }

    // 3. Audit Log
    await adminClient.from('audit_logs').insert({
      user_id: actorUserId !== 'system-settlement-service' ? actorUserId : null,
      restaurant_id: updatedPayout.restaurant_id,
      action: 'PAYOUT_COMPLETED',
      resource_type: 'payouts',
      resource_id: payout_id,
      metadata: {
        settlement_reference: currentPayout.settlement_reference,
        utr_reference,
        status,
        net_amount: updatedPayout.net_amount,
      },
    });

    return createSuccessResponse(updatedPayout);
  } catch (err: any) {
    console.error('Unhandled process-payout exception:', err);
    return createErrorResponse('Internal error processing payout settlement', 500);
  }
});
