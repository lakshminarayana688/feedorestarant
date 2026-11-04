// src/services/analyticsService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { invokeEdgeFunction } from '../utils/supabase';

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export const analyticsService = {
  /**
   * Fetch audit logs via Edge Function
   */
  async getAuditLogs(
    restaurantId: string,
    filters?: { limit?: number; action?: string; resource_type?: string }
  ): Promise<ApiResponse<AuditLogEntry[]>> {
    if (isDemoMode()) {
      const demoLogs: AuditLogEntry[] = [
        { id: 'log-1', action: 'ORDER_STATUS_CHANGED', resource_type: 'orders', resource_id: 'FD10245', metadata: { from: 'PREPARING', to: 'READY' }, created_at: new Date().toISOString() },
        { id: 'log-2', action: 'PAYMENT_WEBHOOK_PROCESSED', resource_type: 'orders', resource_id: 'FD10245', metadata: { amount: 470, status: 'PAID' }, created_at: new Date().toISOString() },
        { id: 'log-3', action: 'RESTAURANT_ONLINE_TOGGLED', resource_type: 'restaurants', resource_id: restaurantId, metadata: { is_online: true }, created_at: new Date().toISOString() },
      ];
      return createSuccessResponse(demoLogs);
    }

    const res = await invokeEdgeFunction(
      'audit-log',
      { restaurant_id: restaurantId, ...filters },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('FORBIDDEN', res.error || 'Failed to retrieve audit log');
    }

    return createSuccessResponse(res.data);
  },
};
