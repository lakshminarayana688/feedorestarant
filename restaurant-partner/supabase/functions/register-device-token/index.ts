// supabase/functions/register-device-token/index.ts
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
    const {
      action = 'register', // 'register' | 'refresh' | 'remove'
      restaurant_id,
      device_token,
      old_device_token,
      device_type = 'android',
      device_id,
      app_version = '1.0.0',
    } = body;

    if (!restaurant_id || (!device_token && action !== 'refresh')) {
      return createErrorResponse('Missing required token parameters (restaurant_id, device_token)', 422);
    }

    // Authenticate user and verify restaurant membership
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurant_id,
      allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient, userId } = authContext;

    // 1. Handle Token Removal on Logout
    if (action === 'remove' || action === 'logout') {
      const { error: deleteErr } = await adminClient
        .from('restaurant_device_tokens')
        .delete()
        .eq('restaurant_id', restaurant_id)
        .eq('device_token', device_token);

      if (deleteErr) {
        console.error('Error removing device token:', deleteErr);
        return createErrorResponse('Failed to remove device token on logout', 500);
      }

      await adminClient.from('audit_logs').insert({
        user_id: userId,
        restaurant_id,
        action: 'DEVICE_TOKEN_REMOVED',
        resource_type: 'device_tokens',
        resource_id: device_token.slice(-8),
        metadata: { device_type, device_id: device_id || null, reason: 'logout' },
      });

      return createSuccessResponse({ message: 'Device token removed successfully on logout', action: 'remove' });
    }

    // 2. Handle Token Refresh
    if (action === 'refresh') {
      if (!device_token) {
        return createErrorResponse('Missing new device_token for refresh', 422);
      }

      // If old token is provided, remove or replace it
      if (old_device_token && old_device_token !== device_token) {
        await adminClient
          .from('restaurant_device_tokens')
          .delete()
          .eq('restaurant_id', restaurant_id)
          .eq('device_token', old_device_token);
      }

      const { data: refreshed, error: refreshErr } = await adminClient
        .from('restaurant_device_tokens')
        .upsert(
          {
            restaurant_id,
            user_id: userId,
            device_token,
            device_type,
            device_id: device_id || null,
            app_version,
            is_active: true,
            last_seen_at: new Date().toISOString(),
          },
          { onConflict: 'restaurant_id, device_token' }
        )
        .select()
        .single();

      if (refreshErr) {
        console.error('Error refreshing device token:', refreshErr);
        return createErrorResponse('Failed to refresh device token', 500);
      }

      await adminClient.from('audit_logs').insert({
        user_id: userId,
        restaurant_id,
        action: 'DEVICE_TOKEN_REFRESHED',
        resource_type: 'device_tokens',
        resource_id: device_token.slice(-8),
        metadata: { device_type, device_id: device_id || null },
      });

      return createSuccessResponse({ message: 'Device token refreshed successfully', token: refreshed });
    }

    // 3. Handle Token Registration (Default)
    const { data: registeredToken, error: upsertErr } = await adminClient
      .from('restaurant_device_tokens')
      .upsert(
        {
          restaurant_id,
          user_id: userId,
          device_token,
          device_type,
          device_id: device_id || null,
          app_version,
          is_active: true,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: 'restaurant_id, device_token' }
      )
      .select()
      .single();

    if (upsertErr) {
      console.error('Error registering device token:', upsertErr);
      return createErrorResponse('Failed to register device token', 500);
    }

    // Write audit log
    await adminClient.from('audit_logs').insert({
      user_id: userId,
      restaurant_id,
      action: 'DEVICE_TOKEN_REGISTERED',
      resource_type: 'device_tokens',
      resource_id: device_token.slice(-8),
      metadata: { device_type, device_id: device_id || null, app_version },
    });

    return createSuccessResponse(
      { message: 'Device token registered successfully', token: registeredToken },
      201
    );
  } catch (err: any) {
    console.error('Unhandled register-device-token exception:', err);
    return createErrorResponse('Internal server error managing device token', 500);
  }
});
