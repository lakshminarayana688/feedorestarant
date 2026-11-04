// src/services/orderService.ts
import { isDemoMode } from './config';
import { ApiResponse, createSuccessResponse, createErrorResponse } from './types';
import { Order, OrderStatus, PaymentStatus } from '../types/order';
import { initialOrders } from '../data/initialOrders';
import { getSupabaseClient, invokeEdgeFunction } from '../utils/supabase';

export const orderService = {
  /**
   * Fetch all orders for restaurant
   */
  async getOrders(restaurantId?: string): Promise<ApiResponse<Order[]>> {
    if (isDemoMode()) {
      return createSuccessResponse(initialOrders);
    }

    const client = getSupabaseClient();
    if (!client) {
      return createErrorResponse('NETWORK_ERROR', 'Supabase client not configured');
    }

    try {
      let query = client
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (restaurantId) {
        query = query.eq('restaurant_id', restaurantId);
      }

      const { data, error } = await query;

      if (error) {
        return createErrorResponse('BAD_REQUEST', error.message);
      }

      const orders: Order[] = (data || []).map((row: any) => ({
        id: row.id,
        customer: {
          name: row.customer_name_snapshot || 'Customer',
          phoneMasked: row.customer_phone_masked || '+91 98*** **000',
          address: row.customer_address_snapshot || 'Bengaluru',
          area: 'Nearby',
          distanceKm: 2.5,
          orderCount: 1,
        },
        items: (row.order_items || []).map((it: any) => ({
          id: it.id,
          name: it.item_name_snapshot,
          category: 'Main Course',
          price: Number(it.unit_price) || 0,
          quantity: it.quantity || 1,
          isVeg: Boolean(it.is_veg),
          notes: it.special_instructions,
        })),
        subtotal: Number(row.subtotal) || 0,
        deliveryFee: Number(row.delivery_fee) || 0,
        platformFee: Number(row.platform_fee) || 10,
        taxes: Number(row.tax) || 0,
        discount: Number(row.discount) || 0,
        total: Number(row.total_amount) || 0,
        paymentStatus: (row.payment_status || 'PENDING') as PaymentStatus,
        paymentMethod: row.payment_method || 'UPI',
        status: (row.status || 'CREATED') as OrderStatus,
        specialInstructions: row.special_instructions,
        pickupCode: row.pickup_code || '7284',
        createdAt: new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        prepMinutes: row.prep_minutes || 18,
        prepTargetMinutes: 20,
        packagingDone: false,
        timeline: [
          { status: 'CREATED', title: 'Order Placed', description: 'Customer created order in database', time: 'Just now', completed: true },
        ],
      }));

      return createSuccessResponse(orders);
    } catch (err: any) {
      return createErrorResponse('INTERNAL_ERROR', err.message || 'Failed to fetch orders');
    }
  },

  /**
   * Transition order status via Edge Function (Enforcing State Machine & Roles)
   */
  async updateOrderStatus(
    orderId: string,
    restaurantId: string,
    nextStatus: OrderStatus,
    pickupCode?: string,
    reason?: string
  ): Promise<ApiResponse<any>> {
    // Map UI status alias to DB status enum
    const statusMap: Record<string, string> = {
      CREATED: 'PLACED',
      PLACED: 'PLACED',
      PAYMENT_CONFIRMED: 'PLACED',
      RESTAURANT_ACCEPTED: 'ACCEPTED',
      ACCEPTED: 'ACCEPTED',
      PREPARING: 'PREPARING',
      READY_FOR_PICKUP: 'READY',
      READY: 'READY',
      RIDER_ASSIGNED: 'READY',
      RIDER_ARRIVED: 'READY',
      PICKUP_VERIFIED: 'READY',
      PICKED_UP: 'PICKED_UP',
      OUT_FOR_DELIVERY: 'PICKED_UP',
      DELIVERED: 'DELIVERED',
      RESTAURANT_REJECTED: 'REJECTED',
      REJECTED: 'REJECTED',
      CUSTOMER_CANCELLED: 'CANCELLED',
      CANCELLED: 'CANCELLED',
    };

    const dbNextStatus = statusMap[nextStatus] || nextStatus;

    if (isDemoMode()) {
      return createSuccessResponse({
        order_id: orderId,
        status: nextStatus,
        db_status: dbNextStatus,
        updated_at: new Date().toISOString(),
      });
    }

    const res = await invokeEdgeFunction(
      'update-order-status',
      {
        order_id: orderId,
        restaurant_id: restaurantId,
        next_status: dbNextStatus,
        pickup_code: pickupCode,
        reason,
      },
      restaurantId
    );

    if (!res.success) {
      return createErrorResponse('BAD_REQUEST', res.error || 'Failed to update order status');
    }

    return createSuccessResponse(res.data);
  },

  /**
   * Subscribe to live Realtime order events
   */
  subscribeToOrders(
    restaurantId: string,
    onNewOrder: (order: any) => void,
    onStatusUpdate: (order: any) => void
  ): () => void {
    if (isDemoMode()) {
      return () => {};
    }

    const client = getSupabaseClient();
    if (!client) {
      return () => {};
    }

    const channel = client
      .channel(`orders:${restaurantId || 'all'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => onNewOrder(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => onStatusUpdate(payload.new)
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  },
};
