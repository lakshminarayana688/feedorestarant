import 'package:flutter_test/flutter_test.dart';
import 'package:feedo_partner/services/order_sound_service.dart';
import 'package:feedo_partner/services/push_notification_service.dart';

void main() {
  group('OrderSoundService Tests (Flutter)', () {
    late OrderSoundService service;

    setUp(() {
      service = OrderSoundService();
      service.reset();
      service.setSoundEnabled(true);
    });

    test('1. New order arrives -> notifyNewOrderIfNew returns true', () {
      final result = service.notifyNewOrderIfNew('FD1025');
      expect(result, isTrue);
      expect(service.hasOrderBeenNotified('FD1025'), isTrue);
    });

    test('2. Same order status update -> sound does not replay', () {
      service.notifyNewOrderIfNew('FD1025');
      // Simulate status transition update for same order
      final updateResult = service.notifyNewOrderIfNew('FD1025');
      expect(updateResult, isFalse);
    });

    test('3. Duplicate event for same order -> sound does not replay', () {
      service.notifyNewOrderIfNew('FD1025');
      final dupResult = service.notifyNewOrderIfNew('FD1025');
      expect(dupResult, isFalse);
    });

    test('4. Genuinely new order arrives -> sound plays and returns true', () {
      service.notifyNewOrderIfNew('FD1025');
      final newOrderResult = service.notifyNewOrderIfNew('FD1026');
      expect(newOrderResult, isTrue);
      expect(service.hasOrderBeenNotified('FD1026'), isTrue);
    });

    test('5. Sound disabled -> new order is tracked but sound is disabled', () {
      service.setSoundEnabled(false);
      final result = service.notifyNewOrderIfNew('FD1027');
      expect(result, isTrue);
      expect(service.hasOrderBeenNotified('FD1027'), isTrue);
    });

    test('6. Test Sound triggers successfully without errors', () async {
      await expectLater(service.testSound(), completes);
    });

    test('7. Seeded existing orders on reconnect do not trigger sound', () {
      final existingIds = ['FD1001', 'FD1002', 'FD1003'];
      service.seedKnownOrderIds(existingIds);

      for (final id in existingIds) {
        expect(service.hasOrderBeenNotified(id), isTrue);
        final attempt = service.notifyNewOrderIfNew(id);
        expect(attempt, isFalse);
      }
    });

    test('8. Order assigned to restaurant triggers playOrderAssignedSound', () {
      final assignResult = service.playOrderAssignedSound('FD1099');
      expect(assignResult, isTrue);
      expect(service.hasOrderBeenNotified('FD1099'), isTrue);
      service.stopAlert();
    });

    test('9. FCM background payload parses and routes order notification', () {
      final payload = {'order_id': 'FD_FCM_99', 'type': 'NEW_ORDER'};
      final handled = service.handleFCMBackgroundMessage(payload);
      expect(handled, isTrue);

      final dupHandled = service.handleFCMBackgroundMessage(payload);
      expect(dupHandled, isFalse);
    });

    test('9. FCM PushMessage parses deep links and payload fields correctly', () {
      final payload = {
        'title': '🔔 New Order #FD10245',
        'body': 'New order from Rahul • ₹470.00',
        'data': {
          'type': 'NEW_ORDER',
          'order_id': 'FD10245',
          'deep_link': 'feedopartner://order/FD10245',
          'channel_id': 'feedo_order_alerts',
        }
      };

      final msg = PushMessage.fromMap(payload);
      expect(msg.title, equals('🔔 New Order #FD10245'));
      expect(msg.orderId, equals('FD10245'));
      expect(msg.deepLink, equals('feedopartner://order/FD10245'));
      expect(msg.channelId, equals('feedo_order_alerts'));
    });

    test('10. PushNotificationService deep link routing parses orders and settlements', () {
      final pushService = PushNotificationService();
      String? routedScreen;
      String? routedOrderId;

      final orderPayload = {
        'data': {
          'type': 'NEW_ORDER',
          'order_id': 'FD10245',
          'deep_link': 'feedopartner://order/FD10245',
        }
      };

      pushService.handleNotificationTap(orderPayload, onNavigate: (screen, orderId) {
        routedScreen = screen;
        routedOrderId = orderId;
      });

      expect(routedScreen, equals('orders'));
      expect(routedOrderId, equals('FD10245'));

      final settlementPayload = {
        'data': {
          'type': 'SETTLEMENT_PROCESSED',
          'deep_link': 'feedopartner://settlements',
        }
      };

      pushService.handleNotificationTap(settlementPayload, onNavigate: (screen, orderId) {
        routedScreen = screen;
        routedOrderId = orderId;
      });

      expect(routedScreen, equals('settlements'));
      expect(routedOrderId, isNull);
    });
  });
}

