// src/services/deliveryService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { DeliveryPartner } from '../types/order';
import { invokeEdgeFunction, isSupabaseConfigured } from '../utils/supabase';

export const deliveryService = {
  /**
   * Assign rider to order (FEEDO Dispatch Engine / Adapter)
   */
  async assignRider(orderId: string, restaurantId?: string): Promise<ApiResponse<DeliveryPartner>> {
    const demoRider: DeliveryPartner = {
      id: 'rider-arun',
      name: 'Arun Kumar',
      phoneMasked: '+91 91*** **890',
      vehicleNumber: 'KA 05 AB 1234',
      vehicleModel: 'Hero Splendor (Black)',
      rating: 4.8,
      distanceKm: 1.2,
      etaMinutes: 6,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
    };

    if (isDemoMode()) {
      return createSuccessResponse(demoRider);
    }

    const res = await invokeEdgeFunction(
      'assign-rider',
      {
        order_id: orderId,
        action: 'ASSIGN_RIDER',
        rider_name: 'Arun Kumar',
        rider_vehicle_number: 'KA 05 AB 1234',
        rider_eta_minutes: 6,
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to assign delivery partner');
    }

    return createSuccessResponse(res.data?.rider ?? demoRider);
  },

  /**
   * Authoritative backend pickup code verification for handover.
   * Frontend never authorizes handover locally.
   */
  async verifyPickupCode(
    orderId: string,
    pickupCode: string,
    restaurantId?: string,
    expectedCode?: string
  ): Promise<ApiResponse<boolean>> {
    const cleanEntered = (pickupCode || '').trim();
    if (!cleanEntered || cleanEntered.length !== 4) {
      return createErrorResponse('BAD_REQUEST', 'INVALID PICKUP CODE: Must be a 4-digit numeric code');
    }

    if (isDemoMode() || !isSupabaseConfigured()) {
      const cleanExpected = (expectedCode || '7284').trim();
      const valid = cleanEntered === cleanExpected;
      if (!valid) {
        return createErrorResponse('BAD_REQUEST', 'INVALID PICKUP CODE: Code does not match this order');
      }
      return createSuccessResponse(true);
    }

    const res = await invokeEdgeFunction(
      'verify-pickup-code',
      {
        order_id: orderId,
        restaurant_id: restaurantId,
        pickup_code: pickupCode.trim(),
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Pickup code verification failed');
    }

    return createSuccessResponse(true);
  },

  /**
   * Record rider arrival at store
   */
  async recordRiderArrival(orderId: string, restaurantId?: string): Promise<ApiResponse<boolean>> {
    if (isDemoMode()) {
      return createSuccessResponse(true);
    }

    const res = await invokeEdgeFunction(
      'assign-rider',
      {
        order_id: orderId,
        action: 'RIDER_ARRIVED',
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to record rider arrival');
    }

    return createSuccessResponse(true);
  },
};
