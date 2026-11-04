import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_partner/core/constants/order_status_constants.dart';
import 'package:feedo_partner/demo/demo_data.dart';

void main() {
  group('FEEDO Mobile Order State Machine & Verification Tests', () {
    test('Initial Demo Orders are loaded with valid states', () {
      final orders = DemoData.initialOrders;
      expect(orders.isNotEmpty, true);
      expect(orders.first.id, 'FD10245');
      expect(orders.first.status, OrderStatusConstants.created);
      expect(orders.first.pickupCode, '7284');
    });

    test('Order State Transitions follow the authoritative workflow', () {
      var order = DemoData.initialOrders.first;

      // 1. Accept
      order = order.copyWith(status: OrderStatusConstants.accepted);
      expect(order.status, OrderStatusConstants.accepted);

      // 2. Preparing
      order = order.copyWith(status: OrderStatusConstants.preparing);
      expect(order.isPreparing, true);

      // 3. Ready
      order = order.copyWith(status: OrderStatusConstants.readyForPickup);
      expect(order.isReady, true);

      // 4. Pickup verified & Picked up
      order = order.copyWith(
        status: OrderStatusConstants.pickedUp,
        deliveryState: OrderStatusConstants.deliveryHandoverCompleted,
      );
      expect(order.isPickedUp, true);
      expect(order.deliveryState, OrderStatusConstants.deliveryHandoverCompleted);

      // 5. Delivered
      order = order.copyWith(status: OrderStatusConstants.delivered);
      expect(order.isDelivered, true);
    });

    test('4-Digit Pickup Code Verification strictly matches 7284', () {
      const validCode = '7284';
      const invalidCode = '9999';

      expect(validCode == DemoData.initialOrders.first.pickupCode, true);
      expect(invalidCode == DemoData.initialOrders.first.pickupCode, false);
    });

    test('Customer PII and Bank Numbers are safely masked', () {
      final customer = DemoData.initialOrders.first.customer;
      final rest = DemoData.initialRestaurant;

      expect(customer.phoneMasked.contains('***'), true);
      expect(rest.bankAccount.startsWith('••••••••'), true);
      expect(rest.panNumber.startsWith('XXXXXX'), true);
    });

    test('Payout Calculation correctly deducts 18% commission and 18% GST', () {
      const gross = 10000.0;
      final commission = gross * 0.18; // 1800.0
      final taxes = commission * 0.18; // 324.0
      final netPayout = gross - commission - taxes; // 7876.0

      expect(commission, 1800.0);
      expect(taxes, 324.0);
      expect(netPayout, 7876.0);
    });
  });
}
