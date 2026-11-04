// supabase/functions/assign-rider/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors } from '../_shared/cors.ts';
import { createErrorResponse, createSuccessResponse } from '../_shared/auth.ts';
import { maskPhone } from '../_shared/crypto.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return createErrorResponse('Method not allowed', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const adminClient = createClient(supabaseUrl, serviceKey);

  try {
    const body = await req.json();
    const {
      order_id,
      action = 'ASSIGN_RIDER', // 'ASSIGN_RIDER' | 'RIDER_ARRIVED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
      rider_id,
      rider_name,
      rider_phone,
      rider_vehicle_number,
      rider_vehicle_model = 'Hero Splendor (Black)',
      rider_rating = 4.8,
      rider_eta_minutes = 8,
      rider_photo_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    } = body;

    if (!order_id) {
      return createErrorResponse('Missing required order_id', 422);
    }

    // 1. Fetch Order from database
    const { data: order, error: orderErr } = await adminClient
      .from('orders')
      .select('id, restaurant_id, status, pickup_code')
      .eq('id', order_id)
      .single();

    if (orderErr || !order) {
      return createErrorResponse(`Order '${order_id}' not found`, 404);
    }

    if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
      return createErrorResponse(`Cannot assign rider to cancelled or rejected order (${order.status})`, 400);
    }

    const nowIso = new Date().toISOString();

    // 2. Process Action
    if (action === 'RIDER_ARRIVED') {
      // Trigger RIDER_ARRIVED push notification
      await adminClient.functions.invoke('send-push-notification', {
        body: {
          restaurant_id: order.restaurant_id,
          type: 'RIDER_ARRIVED',
          order_id,
          data: { rider_name: rider_name || 'Assigned Rider', pickup_code: order.pickup_code },
        },
      });

      await adminClient.from('audit_logs').insert({
        restaurant_id: order.restaurant_id,
        action: 'RIDER_ARRIVED_AT_STORE',
        resource_type: 'orders',
        resource_id: order_id,
        metadata: { arrived_at: nowIso, rider_id: rider_id || null },
      });

      return createSuccessResponse({
        order_id,
        action: 'RIDER_ARRIVED',
        delivery_state: 'RIDER_ARRIVED',
        message: 'Rider arrival recorded and restaurant alerted',
      });
    }

    if (action === 'ASSIGN_RIDER') {
      if (!rider_name) {
        return createErrorResponse('Missing rider details (rider_name required for assignment)', 422);
      }

      const maskedPhone = rider_phone ? maskPhone(rider_phone) : '+91 91*** **890';

      // Audit Log for assignment
      await adminClient.from('audit_logs').insert({
        restaurant_id: order.restaurant_id,
        action: 'RIDER_ASSIGNED',
        resource_type: 'orders',
        resource_id: order_id,
        metadata: {
          rider_id: rider_id || `rdr_${Date.now()}`,
          rider_name,
          vehicle: rider_vehicle_number,
          eta_minutes: rider_eta_minutes,
        },
      });

      // Send Push Notification to Restaurant App
      await adminClient.functions.invoke('send-push-notification', {
        body: {
          restaurant_id: order.restaurant_id,
          type: 'RIDER_ASSIGNED',
          order_id,
          data: {
            rider_name,
            vehicle_number: rider_vehicle_number,
            eta_minutes: rider_eta_minutes,
          },
        },
      });

      return createSuccessResponse({
        order_id,
        delivery_state: 'RIDER_ASSIGNED',
        rider: {
          id: rider_id || `rdr_${Date.now()}`,
          name: rider_name,
          phoneMasked: maskedPhone,
          vehicleNumber: rider_vehicle_number || 'KA 05 AB 1234',
          vehicleModel: rider_vehicle_model,
          rating: Number(rider_rating) || 4.8,
          etaMinutes: Number(rider_eta_minutes) || 8,
          photoUrl: rider_photo_url,
        },
      });
    }

    return createErrorResponse(`Unsupported rider action: '${action}'`, 400);
  } catch (err: any) {
    console.error('Unhandled assign-rider exception:', err);
    return createErrorResponse('Internal error processing rider assignment', 500);
  }
});
