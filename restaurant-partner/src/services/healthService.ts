// src/services/healthService.ts
import { isDemoMode, getAppMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { getSupabaseClient } from '../utils/supabase';

export interface HealthCheckResult {
  status: 'HEALTHY' | 'DEGRADED' | 'DISCONNECTED';
  mode: 'DEMO' | 'PRODUCTION';
  version: string;
  database: 'CONNECTED' | 'LOCAL_DEMO' | 'ERROR';
  latencyMs?: number;
  timestamp: string;
}

export const healthService = {
  /**
   * Check API & Database health
   */
  async checkHealth(): Promise<ApiResponse<HealthCheckResult>> {
    const start = performance.now();

    if (isDemoMode()) {
      return createSuccessResponse({
        status: 'HEALTHY',
        mode: 'DEMO',
        version: '1.0.0-rc',
        database: 'LOCAL_DEMO',
        latencyMs: 1,
        timestamp: new Date().toISOString(),
      });
    }

    const client = getSupabaseClient();
    if (!client) {
      return createSuccessResponse({
        status: 'DISCONNECTED',
        mode: 'PRODUCTION',
        version: '1.0.0-rc',
        database: 'ERROR',
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const { error } = await client.from('restaurants').select('id').limit(1);
      const latency = Math.round(performance.now() - start);

      if (error) {
        return createSuccessResponse({
          status: 'DEGRADED',
          mode: 'PRODUCTION',
          version: '1.0.0-rc',
          database: 'ERROR',
          latencyMs: latency,
          timestamp: new Date().toISOString(),
        });
      }

      return createSuccessResponse({
        status: 'HEALTHY',
        mode: 'PRODUCTION',
        version: '1.0.0-rc',
        database: 'CONNECTED',
        latencyMs: latency,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      return createErrorResponse('NETWORK_ERROR', 'Backend health check failed');
    }
  },

  /**
   * Retrieve platform build & version
   */
  getVersion(): { version: string; release: string; mode: string } {
    return {
      version: '1.0.0',
      release: '2026.09-Production-Ready',
      mode: getAppMode(),
    };
  },
};
