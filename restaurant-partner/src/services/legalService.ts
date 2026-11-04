// src/services/legalService.ts
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';

export const LEGAL_VERSIONS = {
  terms: 'v2.4',
  privacy: 'v2.4',
  effectiveDate: 'March 1, 2026',
};

export interface LegalAcceptanceRecord {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  termsVersion: string;
  privacyVersion: string;
  acceptedAt: string;
  userId?: string;
  restaurantId?: string;
}

export const legalService = {
  getTermsVersion: () => LEGAL_VERSIONS.terms,
  getPrivacyVersion: () => LEGAL_VERSIONS.privacy,
  getEffectiveDate: () => LEGAL_VERSIONS.effectiveDate,

  /**
   * Check local legal status
   */
  getLegalStatus: () => {
    const termsViewed = localStorage.getItem('feedo_terms_viewed') === 'true';
    const privacyViewed = localStorage.getItem('feedo_privacy_viewed') === 'true';
    const termsAccepted = localStorage.getItem('feedo_terms_accepted') === 'true';
    const privacyAccepted = localStorage.getItem('feedo_privacy_accepted') === 'true';
    const acceptedVersion = localStorage.getItem('feedo_legal_version');

    const isCurrentVersion = acceptedVersion === LEGAL_VERSIONS.terms;
    const isFullyAccepted = termsAccepted && privacyAccepted && isCurrentVersion;

    return {
      termsViewed,
      privacyViewed,
      termsAccepted,
      privacyAccepted,
      isFullyAccepted,
      acceptedAt: localStorage.getItem('feedo_legal_accepted_at'),
    };
  },

  markTermsViewed: () => {
    localStorage.setItem('feedo_terms_viewed', 'true');
  },

  markPrivacyViewed: () => {
    localStorage.setItem('feedo_privacy_viewed', 'true');
  },

  /**
   * Persist legal acceptance both locally and in Supabase
   */
  recordAcceptance: async (userId?: string, restaurantId?: string): Promise<{ success: boolean; error?: string }> => {
    const timestamp = new Date().toISOString();

    // 1. Local Storage persistence
    localStorage.setItem('feedo_terms_viewed', 'true');
    localStorage.setItem('feedo_privacy_viewed', 'true');
    localStorage.setItem('feedo_terms_accepted', 'true');
    localStorage.setItem('feedo_privacy_accepted', 'true');
    localStorage.setItem('feedo_legal_accepted_at', timestamp);
    localStorage.setItem('feedo_legal_version', LEGAL_VERSIONS.terms);

    // 2. Supabase persistence if available
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.from('partner_legal_acceptances').insert({
          user_id: userId || null,
          restaurant_id: restaurantId || null,
          terms_accepted: true,
          privacy_accepted: true,
          terms_version: LEGAL_VERSIONS.terms,
          privacy_version: LEGAL_VERSIONS.privacy,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          accepted_at: timestamp,
        });
      } catch (err: any) {
        console.warn('Could not record legal acceptance to Supabase (offline or table pending):', err?.message);
      }
    }

    return { success: true };
  },
};

