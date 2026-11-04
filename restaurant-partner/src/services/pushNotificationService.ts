// src/services/pushNotificationService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { invokeEdgeFunction } from '../utils/supabase';

export interface PushNotificationPayload {
  restaurantId: string;
  type:
    | 'NEW_ORDER'
    | 'ORDER_ACCEPTED'
    | 'FOOD_READY'
    | 'RIDER_ASSIGNED'
    | 'RIDER_ARRIVED'
    | 'SETTLEMENT_PROCESSED'
    | 'ORDER_CANCELLED';
  orderId?: string;
  title?: string;
  body?: string;
  data?: Record<string, any>;
}

export const pushNotificationService = {
  /**
   * Registers client device token with backend Edge Function
   */
  async registerDeviceToken(
    restaurantId: string,
    deviceToken: string,
    deviceType: 'android' | 'ios' | 'web' = 'web'
  ): Promise<ApiResponse<any>> {
    localStorage.setItem('feedo_device_token', deviceToken);
    localStorage.setItem('feedo_registered_restaurant', restaurantId);

    if (isDemoMode()) {
      return createSuccessResponse({
        registered: true,
        device_token: deviceToken,
        mode: 'DEMO',
      });
    }

    const res = await invokeEdgeFunction(
      'register-device-token',
      {
        action: 'register',
        restaurant_id: restaurantId,
        device_token: deviceToken,
        device_type: deviceType,
        app_version: '1.0.0',
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to register device token');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * Handles device token refresh
   */
  async handleTokenRefresh(
    restaurantId: string,
    newDeviceToken: string,
    oldDeviceToken?: string
  ): Promise<ApiResponse<any>> {
    const oldToken = oldDeviceToken || localStorage.getItem('feedo_device_token') || '';
    localStorage.setItem('feedo_device_token', newDeviceToken);

    if (isDemoMode()) {
      return createSuccessResponse({ refreshed: true, mode: 'DEMO' });
    }

    const res = await invokeEdgeFunction(
      'register-device-token',
      {
        action: 'refresh',
        restaurant_id: restaurantId,
        device_token: newDeviceToken,
        old_device_token: oldToken,
        device_type: 'web',
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to refresh device token');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * De-registers device token on logout
   */
  async removeTokenOnLogout(restaurantId?: string): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('feedo_device_token');
    const restId = restaurantId || localStorage.getItem('feedo_registered_restaurant');

    localStorage.removeItem('feedo_device_token');
    localStorage.removeItem('feedo_registered_restaurant');

    if (!token || !restId || isDemoMode()) {
      return createSuccessResponse({ removed: true, mode: 'DEMO' });
    }

    const res = await invokeEdgeFunction(
      'register-device-token',
      {
        action: 'remove',
        restaurant_id: restId,
        device_token: token,
      },
      restId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to remove device token');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * Dispatches push notification via backend Edge Function (Service Role / Trigger)
   */
  async dispatchPushNotification(payload: PushNotificationPayload): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        dispatched: true,
        type: payload.type,
        order_id: payload.orderId,
        title: payload.title,
        recipients_count: 1,
      });
    }

    const res = await invokeEdgeFunction(
      'send-push-notification',
      {
        restaurant_id: payload.restaurantId,
        type: payload.type,
        order_id: payload.orderId,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      },
      payload.restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to dispatch push notification');
    }

    return createSuccessResponse(res.data);
  },
};
