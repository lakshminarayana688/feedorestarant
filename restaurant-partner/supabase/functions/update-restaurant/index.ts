// supabase/functions/update-restaurant/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT') {
    return createErrorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();
    const { restaurant_id, is_online, auto_accept_orders, new_order_sound, cuisines, address, pincode } = body;

    if (!restaurant_id) {
      return createErrorResponse('Missing required restaurant_id', 400);
    }

    // Must be OWNER or MANAGER
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER', 'MANAGER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId, role } = authContext;

    // Check verification status before allowing online toggle
    const { data: currentRest, error: fetchErr } = await adminClient
      .from('restaurants')
      .select('verification_status, status')
      .eq('id', restaurant_id)
      .single();

    if (fetchErr || !currentRest) {
      return createErrorResponse('Restaurant not found', 404);
    }

    if (is_online === true && currentRest.verification_status !== 'approved') {
      return createErrorResponse(
        'Cannot go ONLINE: Restaurant verification is not yet approved by FEEDO compliance team',
        403
      );
    }

    if (currentRest.status === 'suspended') {
      return createErrorResponse('Cannot modify status: Restaurant account is suspended by platform', 403);
    }

    const updates: Record<string, any> = {};
    if (typeof is_online === 'boolean') updates.is_online = is_online;
    if (typeof auto_accept_orders === 'boolean') updates.auto_accept_orders = auto_accept_orders;
    if (typeof new_order_sound === 'boolean') updates.new_order_sound = new_order_sound;
    if (Array.isArray(cuisines)) updates.cuisines = cuisines;
    if (address) updates.address = address.trim();
    if (pincode) updates.pincode = pincode.trim();

    const { data: updatedRestaurant, error: updateErr } = await adminClient
      .from('restaurants')
      .update(updates)
      .eq('id', restaurant_id)
      .select()
      .single();

    if (updateErr) {
      return createErrorResponse('Failed to update restaurant details', 500);
    }

    // Audit Log
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'RESTAURANT_UPDATED',
      resource_type: 'restaurants',
      resource_id: restaurant_id,
      metadata: { updated_fields: Object.keys(updates), user_role: role },
    });

    return createSuccessResponse(updatedRestaurant);
  } catch (err: any) {
    console.error('Unhandled update-restaurant exception:', err);
    return createErrorResponse('An internal error occurred while updating restaurant', 500);
  }
});
