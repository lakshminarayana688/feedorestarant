// src/services/authService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { getSupabaseClient } from '../utils/supabase';

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF' | 'KITCHEN' | 'CASHIER';
}

export const authService = {
  /**
   * Request OTP for login
   */
  async sendOtp(phone: string): Promise<ApiResponse<{ message: string; demoCode?: string }>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        message: 'Demo OTP sent (Code: 123456)',
        demoCode: '123456',
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { error } = await client.auth.signInWithOtp({
        phone: phone.trim(),
      });

      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }

      return createSuccessResponse({ message: 'OTP sent to mobile number' });
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to send OTP');
    }
  },

  /**
   * Verify OTP and establish session
   */
  async verifyOtp(phone: string, token: string): Promise<ApiResponse<{ session: any; user: UserProfile }>> {
    if (isDemoMode()) {
      if (token !== '123456' && token.length === 6) {
        // Accept demo code or any valid 6 digits in demo mode
      }
      return createSuccessResponse({
        session: { access_token: 'demo-token-xyz' },
        user: {
          id: 'demo-owner-id',
          email: 'lucky.family.blr@feedopartner.com',
          phone,
          fullName: 'Lakshmi Narayana',
          role: 'OWNER',
        },
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      const { data, error } = await client.auth.verifyOtp({
        phone: phone.trim(),
        token: token.trim(),
        type: 'sms',
      });

      if (error || !data.user) {
        return createErrorResponse('UNAUTHORIZED', error?.message || 'Invalid or expired OTP code');
      }

      const userProfile: UserProfile = {
        id: data.user.id,
        email: data.user.email || '',
        phone: data.user.phone || phone,
        fullName: (data.user.user_metadata as any)?.full_name || 'Restaurant Partner',
        role: 'OWNER',
      };

      return createSuccessResponse({
        session: data.session,
        user: userProfile,
      });
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'OTP verification failed');
    }
  },

  /**
   * Retrieve current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfile | null>> {
    if (isDemoMode()) {
      return createSuccessResponse({
        id: 'demo-owner-id',
        email: 'lucky.family.blr@feedopartner.com',
        phone: '+91 98765 43210',
        fullName: 'Lakshmi Narayana',
        role: 'OWNER',
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createSuccessResponse(null);
    }

    try {
      const { data: { user }, error } = await client.auth.getUser();
      if (error || !user) {
        return createSuccessResponse(null);
      }

      return createSuccessResponse({
        id: user.id,
        email: user.email || '',
        phone: user.phone || '',
        fullName: (user.user_metadata as any)?.full_name || 'Partner',
        role: 'OWNER',
      });
    } catch (err: any) {
      return createErrorResponse('SESSION_EXPIRED', 'Failed to retrieve session');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<boolean>> {
    if (isDemoMode()) {
      return createSuccessResponse(true);
    }

    const client = getSupabaseClient();
    if (client) {
      await client.auth.signOut();
    }
    return createSuccessResponse(true);
  },
};
