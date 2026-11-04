// src/services/notificationService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse } from './types';
import { AppNotification } from '../context/AppContext';

export const notificationService = {
  /**
   * Fetch user notifications
   */
  async getNotifications(): Promise<ApiResponse<AppNotification[]>> {
    const defaultNotifs: AppNotification[] = [
      { id: 'notif-1', title: 'New Order Received', message: 'Order #FD10245 received from Rahul Kumar', time: '11:42 AM', type: 'ORDER', read: false },
      { id: 'notif-2', title: 'Rider Assigned', message: 'Arun Kumar is on his way to your restaurant', time: '11:45 AM', type: 'RIDER', read: false },
      { id: 'notif-3', title: 'Daily Settlement Processed', message: '₹14,207 transferred to HDFC Bank ****9921', time: '10:00 AM', type: 'PAYMENT', read: true },
    ];
    return createSuccessResponse(defaultNotifs);
  },

  /**
   * Mark notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    return createSuccessResponse(true);
  },
};
