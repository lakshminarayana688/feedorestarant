// src/services/config.ts
import { isSupabaseConfigured } from '../utils/supabase';

export type AppMode = 'DEMO' | 'PRODUCTION';

const STORAGE_KEY = 'feedo_app_mode';

/**
 * Determine current operating mode.
 * Default is DEMO unless explicitly configured via VITE_DEMO_MODE=false or user toggle.
 */
export const getAppMode = (): AppMode => {
  const savedMode = localStorage.getItem(STORAGE_KEY);
  if (savedMode === 'PRODUCTION' || savedMode === 'DEMO') {
    return savedMode;
  }

  const envDemo = (import.meta as any).env?.VITE_DEMO_MODE;
  if (envDemo === 'false') {
    return 'PRODUCTION';
  }

  // If Supabase credentials are fully configured and user explicitly chooses production
  if (isSupabaseConfigured() && (import.meta as any).env?.VITE_PROTOTYPE_MODE === 'false') {
    return 'PRODUCTION';
  }

  return 'DEMO';
};

export const isDemoMode = (): boolean => {
  return getAppMode() === 'DEMO';
};

export const isProductionMode = (): boolean => {
  return getAppMode() === 'PRODUCTION';
};

export const setAppMode = (mode: AppMode): void => {
  localStorage.setItem(STORAGE_KEY, mode);
};
