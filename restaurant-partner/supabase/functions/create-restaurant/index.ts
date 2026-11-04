// supabase/functions/create-restaurant/index.ts
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
    const authContext = await authenticateAndAuthorize(req);
    if (authContext instanceof Response) return authContext;

    const body = await req.json();
    const {
      name,
      legal_name,
      phone,
      email,
      restaurant_type = 'Restaurant',
      cuisines = [],
      address,
      city = 'Bengaluru',
      state = 'Karnataka',
      pincode,
    } = body;

    // Strict validation
    if (!name || !legal_name || !phone || !email || !address || !pincode) {
      return createErrorResponse('Missing required restaurant registration fields', 422);
    }

    const { adminClient, userId } = authContext;

    // 1. Create Restaurant record
    const { data: restaurant, error: restError } = await adminClient
      .from('restaurants')
      .insert({
        owner_id: userId,
        name: name.trim(),
        legal_name: legal_name.trim(),
        phone: phone.trim(),
        email: email.trim().toLowerCase(),
        restaurant_type,
        cuisines,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        status: 'pending',
        verification_status: 'pending',
        is_online: false,
      })
      .select()
      .single();

    if (restError || !restaurant) {
      console.error('Restaurant creation error:', restError);
      return createErrorResponse('Failed to create restaurant record', 500);
    }

    // 2. Link user as OWNER in restaurant_users
    const { error: memberError } = await adminClient
      .from('restaurant_users')
      .insert({
        restaurant_id: restaurant.id,
        user_id: userId,
        role: 'OWNER',
        status: 'active',
      });

    if (memberError) {
      console.error('Restaurant owner linking error:', memberError);
    }

    // 3. Log Audit event
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id: restaurant.id,
      action: 'RESTAURANT_CREATED',
      resource_type: 'restaurants',
      resource_id: restaurant.id,
      metadata: { restaurant_name: restaurant.name, legal_name: restaurant.legal_name },
    });

    return createSuccessResponse(restaurant, 201);
  } catch (err: any) {
    console.error('Unhandled create-restaurant exception:', err);
    return createErrorResponse('An internal error occurred while creating restaurant', 500);
  }
});
