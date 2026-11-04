// src/services/paymentService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { PaymentStatus } from '../types/order';
import { getSupabaseClient, invokeEdgeFunction } from '../utils/supabase';

export interface PaymentOrderInitResponse {
  order_id: string;
  payment_order_id: string;
  amount: number;
  amount_in_paise: number;
  currency: string;
  key_id: string;
  status: PaymentStatus;
}

export const paymentService = {
  /**
   * Initialize a payment gateway order (Razorpay / Stripe / UPI)
   */
  async createPaymentOrder(
    orderId: string,
    restaurantId: string,
    paymentMethod: string = 'UPI'
  ): Promise<ApiResponse<PaymentOrderInitResponse>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        order_id: orderId,
        payment_order_id: `order_${orderId}_demo`,
        amount: 470,
        amount_in_paise: 47000,
        currency: 'INR',
        key_id: 'rzp_test_feedo_public_key',
        status: 'PENDING',
      });
    }

    const res = await invokeEdgeFunction(
      'create-payment-order',
      { order_id: orderId, restaurant_id: restaurantId, payment_method: paymentMethod },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to initialize payment order');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * Check authoritative payment status for order directly from database
   */
  async getPaymentStatus(
    orderId: string
  ): Promise<ApiResponse<{ status: PaymentStatus; method: string; totalAmount: number }>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        status: 'PAID',
        method: 'UPI (Google Pay)',
        totalAmount: 470,
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { data, error } = await client
        .from('orders')
        .select('payment_status, payment_method, total_amount')
        .eq('id', orderId)
        .single();

      if (error || !data) {
        return createErrorResponse('NOT_FOUND', 'Payment record not found');
      }

      return createSuccessResponse({
        status: (data.payment_status || 'PENDING') as PaymentStatus,
        method: data.payment_method || 'UPI',
        totalAmount: Number(data.total_amount) || 0,
      });
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to check payment status');
    }
  },

  /**
   * Process and verify payment gateway webhook event
   */
  async processPaymentWebhook(payload: any, signature?: string): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({ processed: true, event_id: payload.event_id || 'demo_evt' });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { data, error } = await client.functions.invoke('process-payment-webhook', {
        body: payload,
        headers: signature ? { 'x-feedo-signature': signature } : {},
      });

      if (error) {
        return createErrorResponse('UNAUTHORIZED', error.message || 'Webhook processing failed');
      }

      return createSuccessResponse(data?.data ?? data);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Error processing webhook');
    }
  },
};

