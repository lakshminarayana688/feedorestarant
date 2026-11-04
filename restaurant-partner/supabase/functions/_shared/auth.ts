// supabase/functions/_shared/auth.ts
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from './cors.ts';

export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN' | 'CASHIER';

export interface AuthenticatedContext {
  supabaseClient: SupabaseClient;
  adminClient: SupabaseClient;
  userId: string;
  userEmail: string;
  restaurantId?: string;
  role?: UserRole;
}

export function createErrorResponse(message: string, status = 400, details?: any) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      ...(details ? { details } : {})
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

export function createSuccessResponse(data: any, status = 200) {
  return new Response(
    JSON.stringify({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Authenticate incoming request and verify restaurant membership and role
 */
export async function authenticateAndAuthorize(
  req: Request,
  options?: {
    requiredRestaurantId?: string;
    allowedRoles?: UserRole[];
    requireAdminServiceRole?: boolean;
  }
): Promise<AuthenticatedContext | Response> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return createErrorResponse('Missing or invalid Authorization header', 401);
  }

  const token = authHeader.replace('Bearer ', '').trim();

  // Create User client scoped to their JWT
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  // Create internal admin client for privileged checks
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);

  // 1. Verify User Session
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
  if (userError || !user) {
    return createErrorResponse('Invalid or expired authentication session', 401);
  }

  // 2. If a specific restaurant is required, verify multi-tenant membership and role
  const targetRestaurantId =
    options?.requiredRestaurantId || req.headers.get('x-restaurant-id') || undefined;

  let role: UserRole | undefined;

  if (targetRestaurantId) {
    const { data: membership, error: memberError } = await adminClient
      .from('restaurant_users')
      .select('role, status')
      .eq('restaurant_id', targetRestaurantId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (memberError || !membership) {
      // Check if user is the direct owner in restaurants table
      const { data: restRow } = await adminClient
        .from('restaurants')
        .select('owner_id')
        .eq('id', targetRestaurantId)
        .maybeSingle();

      if (restRow && restRow.owner_id === user.id) {
        role = 'OWNER';
      } else {
        // Record security violation audit
        await adminClient.from('audit_logs').insert({
          user_id: user.id,
          restaurant_id: targetRestaurantId,
          action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          resource_type: 'restaurant',
          resource_id: targetRestaurantId,
          metadata: { reason: 'User not an active member of restaurant' },
        });

        return createErrorResponse(
          'Access denied: You are not authorized for this restaurant',
          403
        );
      }
    } else {
      role = membership.role as UserRole;
    }

    // 3. Verify Role Requirements
    if (options?.allowedRoles && options.allowedRoles.length > 0) {
      if (!role || !options.allowedRoles.includes(role)) {
        await adminClient.from('audit_logs').insert({
          user_id: user.id,
          restaurant_id: targetRestaurantId,
          action: 'INSUFFICIENT_ROLE_PRIVILEGE',
          resource_type: 'restaurant',
          resource_id: targetRestaurantId,
          metadata: { userRole: role, requiredRoles: options.allowedRoles },
        });

        return createErrorResponse(
          `Forbidden: Role '${role}' lacks required permissions (${options.allowedRoles.join(', ')})`,
          403
        );
      }
    }
  }

  return {
    supabaseClient,
    adminClient,
    userId: user.id,
    userEmail: user.email || '',
    restaurantId: targetRestaurantId,
    role,
  };
}
