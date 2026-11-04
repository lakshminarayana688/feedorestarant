// src/services/restaurantService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { RestaurantDetails } from '../types/restaurant';
import { initialRestaurantDetails } from '../data/sampleData';
import { getSupabaseClient, invokeEdgeFunction } from '../utils/supabase';

export const restaurantService = {
  /**
   * Fetch restaurant profile
   */
  async getRestaurant(restaurantId?: string): Promise<ApiResponse<RestaurantDetails>> {
    if (isDemoMode()) {
      return createSuccessResponse(initialRestaurantDetails);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      let query = client.from('restaurants').select('*');
      if (restaurantId) {
        query = query.eq('id', restaurantId);
      }
      const { data, error } = await query.limit(1).maybeSingle();

      if (error || !data) {
        return createErrorResponse('NOT_FOUND', 'Restaurant profile not found');
      }

      const mapped: RestaurantDetails = {
        id: data.id,
        ownerName: 'Owner',
        ownerPhone: data.phone || '',
        ownerEmail: data.email || '',
        restaurantName: data.name || '',
        restaurantType: data.restaurant_type || 'Restaurant',
        cuisines: data.cuisines || [],
        address: data.address || '',
        city: data.city || 'Bengaluru',
        state: data.state || 'Karnataka',
        pincode: data.pincode || '560034',
        landmark: '',
        fssaiNumber: '21223004000891',
        panNumber: 'AABCL9921D',
        bankAccount: '•••• •••• •••• 9921',
        bankName: 'HDFC Bank Ltd',
        ifscCode: 'HDFC0000053',
        logoUrl: '',
        coverUrl: '',
        description: '',
        rating: Number(data.rating) || 4.8,
        totalReviews: data.total_reviews || 0,
        isOnline: Boolean(data.is_online),
        autoAcceptOrders: Boolean(data.auto_accept_orders),
        newOrderSound: Boolean(data.new_order_sound),
        openingHours: initialRestaurantDetails.openingHours,
        regStatus: data.verification_status === 'approved' ? 'APPROVED' : 'UNDER_REVIEW',
      };

      return createSuccessResponse(mapped);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to fetch restaurant');
    }
  },

  /**
   * Register new restaurant via Edge Function
   */
  async createRestaurant(payload: {
    name: string;
    legal_name: string;
    phone: string;
    email: string;
    restaurant_type?: string;
    cuisines?: string[];
    address: string;
    city?: string;
    state?: string;
    pincode: string;
  }): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        id: 'demo-rest-uuid',
        ...payload,
        status: 'pending',
        verification_status: 'pending',
      });
    }

    const res = await invokeEdgeFunction('create-restaurant', payload);
    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to create restaurant');
    }
    return createSuccessResponse(res.data);
  },

  /**
   * Update restaurant settings, opening hours, or online status
   */
  async updateRestaurant(
    restaurantId: string,
    updates: {
      is_online?: boolean;
      auto_accept_orders?: boolean;
      new_order_sound?: boolean;
      cuisines?: string[];
      address?: string;
      pincode?: string;
    }
  ): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({ restaurant_id: restaurantId, ...updates });
    }

    const res = await invokeEdgeFunction(
      'update-restaurant',
      { restaurant_id: restaurantId, ...updates },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to update restaurant');
    }
    return createSuccessResponse(res.data);
  },

  /**
   * Submit statutory KYC details
   */
  async submitKyc(payload: {
    restaurant_id: string;
    pan_number: string;
    gst_number?: string;
    fssai_number: string;
    fssai_expiry_date?: string;
  }): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        restaurant_id: payload.restaurant_id,
        pan_last4: payload.pan_number.slice(-4),
        fssai_number: payload.fssai_number,
        verification_status: 'under_review',
      });
    }

    const res = await invokeEdgeFunction('submit-kyc', payload, payload.restaurant_id);
    if (!res.success) {
      return createErrorResponse('VALIDATION_ERROR', res.error || 'KYC submission failed');
    }
    return createSuccessResponse(res.data);
  },

  /**
   * Update payout bank account
   */
  async updateBankAccount(payload: {
    restaurant_id: string;
    account_holder_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
  }): Promise<ApiResponse<any>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        restaurant_id: payload.restaurant_id,
        bank_name: payload.bank_name,
        account_last4: payload.account_number.slice(-4),
        verification_status: 'pending',
      });
    }

    const res = await invokeEdgeFunction('update-bank-account', payload, payload.restaurant_id);
    if (!res.success) {
      return createErrorResponse('VALIDATION_ERROR', res.error || 'Bank update failed');
    }
    return createSuccessResponse(res.data);
  },
};
