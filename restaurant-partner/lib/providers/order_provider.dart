import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/order_status_constants.dart';
import '../demo/demo_data.dart';
import '../models/order_model.dart';
import '../services/order_service.dart';
import '../services/order_sound_service.dart';

final orderServiceProvider = Provider<OrderService>((ref) {
  return OrderService();
});


class OrderState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;
  final String activeFilter; // 'ALL', 'NEW', 'PREPARING', 'READY', 'PICKED_UP', 'DELIVERED', 'CANCELLED'

  OrderState({
    required this.orders,
    this.isLoading = false,
    this.error,
    this.activeFilter = 'ALL',
  });

  List<OrderModel> get filteredOrders {
    if (activeFilter == 'ALL') return orders;
    if (activeFilter == 'NEW') {
      return orders.where((o) => o.status == OrderStatusConstants.created || o.status == 'PLACED').toList();
    }
    if (activeFilter == 'PREPARING') {
      return orders.where((o) => o.status == OrderStatusConstants.accepted || o.status == OrderStatusConstants.preparing || o.status == 'RESTAURANT_ACCEPTED').toList();
    }
    if (activeFilter == 'READY') {
      return orders.where((o) => o.status == OrderStatusConstants.readyForPickup).toList();
    }
    if (activeFilter == 'PICKED_UP') {
      return orders.where((o) => o.status == OrderStatusConstants.pickedUp || o.status == OrderStatusConstants.outForDelivery).toList();
    }
    if (activeFilter == 'DELIVERED') {
      return orders.where((o) => o.status == OrderStatusConstants.delivered).toList();
    }
    if (activeFilter == 'CANCELLED') {
      return orders.where((o) => o.status == OrderStatusConstants.cancelled || o.status == OrderStatusConstants.rejected || o.status == 'CUSTOMER_CANCELLED' || o.status == 'RESTAURANT_REJECTED').toList();
    }
    return orders;
  }

  int get newOrdersCount => orders.where((o) => o.status == OrderStatusConstants.created || o.status == 'PLACED').length;
  int get preparingCount => orders.where((o) => o.status == OrderStatusConstants.accepted || o.status == OrderStatusConstants.preparing || o.status == 'RESTAURANT_ACCEPTED').length;
  int get readyCount => orders.where((o) => o.status == OrderStatusConstants.readyForPickup).length;
  int get todayCompletedCount => orders.where((o) => o.status == OrderStatusConstants.delivered).length;
  double get todayRevenue => orders.where((o) => o.status != OrderStatusConstants.cancelled && o.status != OrderStatusConstants.rejected).fold(0.0, (sum, o) => sum + o.total);

  OrderState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
    String? activeFilter,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      activeFilter: activeFilter ?? this.activeFilter,
    );
  }
}

class OrderNotifier extends StateNotifier<OrderState> {
  final OrderService _orderService;
  StreamSubscription<List<OrderModel>>? _subscription;

  OrderNotifier(this._orderService)
      : super(OrderState(orders: DemoData.initialOrders)) {
    OrderSoundService().seedKnownOrderIds(DemoData.initialOrders.map((o) => o.id));
    loadOrders();
    _subscribeRealtime();
  }

  void _subscribeRealtime() {
    _subscription?.cancel();
    _subscription = _orderService.subscribeToOrders('rest_001').listen((updatedList) {
      for (final order in updatedList) {
        if (order.status == OrderStatusConstants.created || order.status == 'PLACED') {
          OrderSoundService().notifyNewOrderIfNew(order.id);
        }
      }
      state = state.copyWith(orders: updatedList);
    });
  }

  void setFilter(String filter) {
    state = state.copyWith(activeFilter: filter);
  }

  Future<void> loadOrders() async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _orderService.getOrders();
    if (res.success && res.data != null) {
      OrderSoundService().seedKnownOrderIds(res.data!.map((o) => o.id));
      state = state.copyWith(orders: res.data, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
    }
  }


  Future<bool> acceptOrder(String orderId) async {
    return _transitionStatus(orderId, OrderStatusConstants.accepted);
  }

  Future<bool> rejectOrder(String orderId, String reason) async {
    return _transitionStatus(orderId, OrderStatusConstants.rejected, rejectionReason: reason);
  }

  Future<bool> startPreparing(String orderId) async {
    return _transitionStatus(orderId, OrderStatusConstants.preparing);
  }

  Future<bool> markFoodReady(String orderId) async {
    return _transitionStatus(orderId, OrderStatusConstants.readyForPickup);
  }

  Future<bool> verifyPickupAndHandover(String orderId, String pickupCode) async {
    final res = await _orderService.updateOrderStatus(
      orderId: orderId,
      status: OrderStatusConstants.pickedUp,
      deliveryState: OrderStatusConstants.deliveryHandoverCompleted,
      pickupCode: pickupCode,
    );
    if (res.success && res.data != null) {
      _updateLocalOrder(res.data!);
      return true;
    }
    return false;
  }

  Future<bool> markOutForDelivery(String orderId) async {
    return _transitionStatus(orderId, OrderStatusConstants.outForDelivery);
  }

  Future<bool> markDelivered(String orderId) async {
    return _transitionStatus(orderId, OrderStatusConstants.delivered);
  }

  Future<bool> _transitionStatus(String orderId, String status, {String? rejectionReason}) async {
    final res = await _orderService.updateOrderStatus(
      orderId: orderId,
      status: status,
      rejectionReason: rejectionReason,
    );
    if (res.success && res.data != null) {
      _updateLocalOrder(res.data!);
      return true;
    }
    return false;
  }

  void _updateLocalOrder(OrderModel updated) {
    final list = List<OrderModel>.from(state.orders);
    final index = list.indexWhere((o) => o.id == updated.id);
    if (index != -1) {
      list[index] = updated;
      state = state.copyWith(orders: list);
    }
  }

  void triggerSimulatedNewOrder() {
    final newId = 'FD${10246 + state.orders.length}';
    final simulatedOrder = OrderModel(
      id: newId,
      customer: CustomerInfo(
        name: 'Rahul Sharma',
        phoneMasked: '+91 98*** **512',
        address: 'Flat 104, Sunrise Apts, 100ft Rd',
        area: 'Indiranagar',
        distanceKm: 1.5,
        orderCount: 4,
      ),
      items: [
        OrderItem(
          id: 'it_sim_1',
          name: 'Royal Hyderabadi Dum Biryani',
          category: 'Biryani',
          price: 340.0,
          quantity: 1,
          isVeg: false,
        ),
        OrderItem(
          id: 'it_sim_2',
          name: 'Butter Garlic Naan',
          category: 'Breads',
          price: 65.0,
          quantity: 2,
          isVeg: true,
        ),
      ],
      subtotal: 470.0,
      deliveryFee: 35.0,
      platformFee: 5.0,
      taxes: 23.5,
      total: 533.5,
      paymentStatus: 'PAID',
      paymentMethod: 'UPI (PhonePe)',
      status: OrderStatusConstants.created,
      deliveryState: OrderStatusConstants.deliveryUnassigned,
      pickupCode: '7284',
      createdAt: DateTime.now().toIso8601String(),
      prepTargetMinutes: 20,
      timeline: [
        OrderTimelineEvent(
          status: OrderStatusConstants.created,
          title: 'Order Placed',
          description: 'Payment confirmed via PhonePe',
          time: 'Just now',
          completed: true,
          current: true,
        ),
      ],
    );

    OrderSoundService().notifyNewOrderIfNew(simulatedOrder.id);
    _orderService.addDemoOrder(simulatedOrder);

  }


  void simulateRiderArrival() {
    final list = List<OrderModel>.from(state.orders);
    final readyIndex = list.indexWhere((o) => o.status == OrderStatusConstants.readyForPickup || o.status == OrderStatusConstants.preparing);
    if (readyIndex != -1) {
      final updated = list[readyIndex].copyWith(
        deliveryState: OrderStatusConstants.deliveryRiderArrived,
        rider: DemoData.demoRider,
        riderArrivedAt: DateTime.now().toIso8601String(),
      );
      list[readyIndex] = updated;
      state = state.copyWith(orders: list);
    }
  }

  void resetDemoOrders() {
    _orderService.resetDemoOrders();
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }
}

final orderProvider = StateNotifierProvider<OrderNotifier, OrderState>((ref) {
  final service = ref.watch(orderServiceProvider);
  return OrderNotifier(service);
});
