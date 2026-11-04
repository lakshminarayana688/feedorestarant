// supabase/functions/audit-log/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { authenticateAndAuthorize, createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const url = new URL(req.url);
    let bodyParams: Record<string, any> = {};
    if (req.method === 'POST') {
      try {
        bodyParams = await req.json();
      } catch (_) {
        bodyParams = {};
      }
    }

    const restaurantId =
      bodyParams.restaurant_id ||
      url.searchParams.get('restaurant_id') ||
      req.headers.get('x-restaurant-id') ||
      '';

    if (!restaurantId) {
      return createErrorResponse('Missing restaurant_id parameter', 400);
    }

    // Only OWNER and MANAGER can view audit logs
    const authContext = await authenticateAndAuthorize(req, {
      requiredRestaurantId: restaurantId,
      allowedRoles: ['OWNER', 'MANAGER'],
    });
    if (authContext instanceof Response) return authContext;

    const { adminClient } = authContext;

    const limit = Math.min(
      100,
      parseInt(bodyParams.limit || url.searchParams.get('limit') || '50', 10)
    );
    const action = bodyParams.action || url.searchParams.get('action');
    const resourceType = bodyParams.resource_type || url.searchParams.get('resource_type');
    const userId = bodyParams.user_id || url.searchParams.get('user_id');

    let query = adminClient
      .from('audit_logs')
      .select('id, user_id, action, resource_type, resource_id, metadata, created_at')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action', action);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: logs, error: logErr } = await query;

    if (logErr) {
      return createErrorResponse('Failed to retrieve audit logs', 500);
    }

    return createSuccessResponse(logs || []);
  } catch (err: any) {
    console.error('Unhandled audit-log query exception:', err);
    return createErrorResponse('Internal error fetching audit logs', 500);
  }
});
