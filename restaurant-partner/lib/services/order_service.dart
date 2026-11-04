import 'dart:async';
import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../core/constants/order_status_constants.dart';
import '../demo/demo_data.dart';
import '../models/api_response.dart';
import '../models/order_model.dart';

class OrderService {
  List<OrderModel> _demoOrders = List.from(DemoData.initialOrders);
  final StreamController<List<OrderModel>> _orderStreamController = StreamController<List<OrderModel>>.broadcast();

  List<OrderModel> get demoOrders => List.unmodifiable(_demoOrders);

  Stream<List<OrderModel>> subscribeToOrders(String restaurantId) {
    if (AppConfig.isDemo) {
      _orderStreamController.add(_demoOrders);
      return _orderStreamController.stream;
    }

    if (!SupabaseConfig.isInitialized) {
      SupabaseConfig.initialize();
    }

    return SupabaseConfig.client
        .from('orders')
        .stream(primaryKey: ['id'])
        .eq('restaurant_id', restaurantId)
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => OrderModel.fromJson(json)).toList());
  }

  Future<ApiResponse<List<OrderModel>>> getOrders([String? restaurantId]) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        return ApiResponse.success(_demoOrders, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final id = restaurantId ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];
      if (id == null) {
        return ApiResponse.success([], mode: 'PRODUCTION');
      }

      final res = await SupabaseConfig.client
          .from('orders')
          .select()
          .eq('restaurant_id', id)
          .order('created_at', ascending: false);

      final list = (res as List<dynamic>).map((e) => OrderModel.fromJson(e)).toList();
      return ApiResponse.success(list, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to load orders.', details: e.toString());
    }
  }

  Future<ApiResponse<OrderModel>> updateOrderStatus({
    required String orderId,
    required String status,
    String? deliveryState,
    String? pickupCode,
    String? rejectionReason,
  }) async {
    try {
      if (AppConfig.isDemo) {
        final index = _demoOrders.indexWhere((o) => o.id == orderId);
        if (index == -1) {
          return ApiResponse.failure('Order not found.', code: 'NOT_FOUND');
        }

        // Validate pickup code on handoff
        if (status == OrderStatusConstants.pickedUp) {
          if (pickupCode != AppConfig.demoPickupCode && pickupCode != '7284') {
            return ApiResponse.failure('Invalid 4-digit pickup code.', code: 'INVALID_PICKUP_CODE');
          }
        }

        final current = _demoOrders[index];
        final updated = current.copyWith(
          status: status,
          deliveryState: deliveryState ?? current.deliveryState,
          rejectionReason: rejectionReason ?? current.rejectionReason,
          acceptedAt: status == OrderStatusConstants.accepted ? DateTime.now().toIso8601String() : current.acceptedAt,
          prepStartedAt: status == OrderStatusConstants.preparing ? DateTime.now().toIso8601String() : current.prepStartedAt,
          readyAt: status == OrderStatusConstants.readyForPickup ? DateTime.now().toIso8601String() : current.readyAt,
          pickedUpAt: status == OrderStatusConstants.pickedUp ? DateTime.now().toIso8601String() : current.pickedUpAt,
          deliveredAt: status == OrderStatusConstants.delivered ? DateTime.now().toIso8601String() : current.deliveredAt,
          packagingDone: status == OrderStatusConstants.readyForPickup || current.packagingDone,
        );

        _demoOrders[index] = updated;
        _orderStreamController.add(_demoOrders);
        return ApiResponse.success(updated, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'update-order-status',
        body: {
          'order_id': orderId,
          'status': status,
          'delivery_state': deliveryState,
          'pickup_code': pickupCode,
          'rejection_reason': rejectionReason,
        },
      );

      if (res.status >= 400) {
        final err = res.data != null && res.data['error'] != null ? res.data['error']['message'] : 'Status transition rejected';
        return ApiResponse.failure(err.toString(), code: 'TRANSITION_ERROR');
      }

      final updated = OrderModel.fromJson(res.data['data'] ?? res.data);
      return ApiResponse.success(updated, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error updating order status: ${e.toString()}', details: e.toString());
    }
  }

  void addDemoOrder(OrderModel order) {
    _demoOrders.insert(0, order);
    _orderStreamController.add(_demoOrders);
  }

  void resetDemoOrders() {
    _demoOrders = List.from(DemoData.initialOrders);
    _orderStreamController.add(_demoOrders);
  }
}
