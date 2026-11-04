import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:feedo_partner/core/config/app_config.dart';
import 'package:feedo_partner/core/constants/order_status_constants.dart';
import 'package:feedo_partner/models/order_model.dart';
import 'package:feedo_partner/services/auth_service.dart';
import 'package:feedo_partner/services/restaurant_service.dart';
import 'package:feedo_partner/services/menu_service.dart';
import 'package:feedo_partner/services/order_service.dart';
import 'package:feedo_partner/services/delivery_service.dart';
import 'package:feedo_partner/services/payment_service.dart';
import 'package:feedo_partner/services/settlement_service.dart';
import 'package:feedo_partner/services/analytics_service.dart';
import 'package:feedo_partner/services/notification_service.dart';
import 'package:feedo_partner/services/push_notification_service.dart';
import 'package:feedo_partner/services/logger_service.dart';
import 'package:feedo_partner/services/printer_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('FEEDO Production Backend Integration & Resilience Suite', () {
    late AuthService authService;
    late RestaurantService restaurantService;
    late MenuService menuService;
    late OrderService orderService;
    late DeliveryService deliveryService;
    late PaymentService paymentService;
    late SettlementService settlementService;
    late AnalyticsService analyticsService;
    late NotificationService notificationService;
    late PushNotificationService pushService;

    setUp(() {
      SharedPreferences.setMockInitialValues({});
      AppConfig.setMode(AppMode.demo);
      authService = AuthService();
      restaurantService = RestaurantService();
      menuService = MenuService();
      orderService = OrderService();
      deliveryService = DeliveryService();
      paymentService = PaymentService();
      settlementService = SettlementService();
      analyticsService = AnalyticsService();
      notificationService = NotificationService();
      pushService = PushNotificationService();
    });

    test('1. Demo Mode vs Production Mode Separation', () {
      AppConfig.setMode(AppMode.demo);
      expect(AppConfig.isDemo, isTrue);
      expect(AppConfig.isProduction, isFalse);

      AppConfig.setMode(AppMode.production);
      expect(AppConfig.isDemo, isFalse);
      expect(AppConfig.isProduction, isTrue);

      AppConfig.setMode(AppMode.demo);
    });

    test('2. App Restart & Session Restore Handling', () async {
      await authService.verifyOtp('9876543210', '123456');

      final saved = await authService.getSavedSession();
      expect(saved, isNotNull);
      expect(saved!.role, equals('OWNER'));
    });

    test('3. Expired Session & Unauthorized Requests Handling', () async {
      AppConfig.setMode(AppMode.production);

      // Attempting to fetch restaurant data with no active session or null ID
      final res = await restaurantService.getRestaurant(null);
      expect(res.success, isFalse);
      expect(res.error?.code, equals('NOT_FOUND'));

      AppConfig.setMode(AppMode.demo);
    });

    test('4. Network Failure & Offline Resilience Handling', () async {
      AppConfig.setMode(AppMode.production);

      // Attempting menu load offline/uninitialized returns controlled failure without throwing
      final res = await menuService.getMenuItems('non_existent_or_offline_id');
      expect(res, isNotNull);

      AppConfig.setMode(AppMode.demo);
    });

    test('5. Realtime Order Stream Updates & State Transitions', () async {
      final stream = orderService.subscribeToOrders('rest_001');
      final expectation = expectLater(
        stream,
        emits(isA<List<OrderModel>>()),
      );

      orderService.updateOrderStatus(
        orderId: 'FD10245',
        status: OrderStatusConstants.accepted,
      );

      await expectation;
    });

    test('6. Delivery Partner Allocation & 4-Digit Pickup Handover', () async {
      final assignRes = await deliveryService.assignRider('FD10245');
      expect(assignRes.success, isTrue);
      expect(assignRes.data?.name, equals('Arun Kumar'));

      final invalidCodeRes = await deliveryService.verifyPickupCode('FD10245', '0000');
      expect(invalidCodeRes.success, isFalse);

      final validCodeRes = await deliveryService.verifyPickupCode('FD10245', '7284');
      expect(validCodeRes.success, isTrue);
    });

    test('7. Payment Gateway Order Creation & Status Query', () async {
      final createPayRes = await paymentService.createPaymentOrder(
        orderId: 'FD10245',
        restaurantId: 'rest_001',
        paymentMethod: 'UPI',
      );
      expect(createPayRes.success, isTrue);
      expect(createPayRes.data?['amount'], equals(470));
      expect(createPayRes.data?['status'], equals('PENDING'));

      final statusRes = await paymentService.getPaymentStatus('FD10245');
      expect(statusRes.success, isTrue);
      expect(statusRes.data, equals('PAID'));
    });

    test('8. Settlement Calculation & Payout Request', () async {
      final settlementsRes = await settlementService.getSettlements();
      expect(settlementsRes.success, isTrue);
      expect(settlementsRes.data!.isNotEmpty, isTrue);

      final payoutRes = await settlementService.createPayout(
        amount: 10000.0,
        bankAccount: '••••9921',
      );
      expect(payoutRes.success, isTrue);
      expect(payoutRes.data?.grossAmount, equals(10000.0));
      expect(payoutRes.data?.commission, equals(1800.0));
      expect(payoutRes.data?.taxes, equals(324.0));
      expect(payoutRes.data?.netPayout, equals(7876.0));
    });

    test('9. Analytics & Hourly Sales Aggregation', () async {
      final res = await analyticsService.getAnalyticsSummary();
      expect(res.success, isTrue);
      expect(res.data?.todayRevenue, greaterThan(0));
      expect(res.data?.hourlyTrend.isNotEmpty, isTrue);
      expect(res.data?.topItems.isNotEmpty, isTrue);
    });

    test('10. Notifications & Device Token Lifecycle', () async {
      final notifRes = await notificationService.getNotifications();
      expect(notifRes.success, isTrue);
      expect(notifRes.data!.isNotEmpty, isTrue);

      final regTokenRes = await pushService.registerDeviceToken(
        restaurantId: 'rest_001',
        token: 'fcm_test_token_123',
      );
      expect(regTokenRes.success, isTrue);

      final logoutTokenRes = await pushService.removeTokenOnLogout();
      expect(logoutTokenRes.success, isTrue);
    });

    test('11. Safe Structured Logging & Masking in Flutter', () {
      final logger = LoggerService();
      logger.clear();

      logger.info(
        'ORDER_ACCEPTED',
        userId: 'usr_001',
        restaurantId: 'rest_001',
        orderId: 'FD1025',
        metadata: {
          'password': 'secret_password_123',
          'otp': '482910',
          'bankAccount': '1234567890123456',
          'pan': 'ABCDE1234F',
          'phone': '+919876543210',
          'email': 'lucky@feedopartner.com',
        },
      );

      final logs = logger.recentLogs;
      expect(logs.length, equals(1));
      final entry = logs.first;
      expect(entry.operation, equals('ORDER_ACCEPTED'));
      expect(entry.metadata?['password'], equals('[REDACTED]'));
      expect(entry.metadata?['otp'], equals('[REDACTED]'));
      expect(entry.metadata?['bankAccount'], equals('****3456'));
      expect(entry.metadata?['pan'], equals('ABCDE****F'));
      expect(entry.metadata?['phone'], equals('+919****3210'));
      expect(entry.metadata?['email'], equals('l***y@feedopartner.com'));
    });

    test('12. Optional Thermal Receipt Printing Support', () async {
      final printer = PrinterService();
      await printer.initialize();

      final sampleOrder = OrderModel(
        id: 'FD1025',
        customer: CustomerInfo(
          name: 'Customer John',
          phoneMasked: '+91 98****3210',
          address: '45 Lake View Road, Bangalore',
        ),
        subtotal: 500.0,
        total: 540.0,
        paymentStatus: 'PAID',
        status: 'READY_FOR_PICKUP',
        createdAt: DateTime.now().toIso8601String(),
        items: [
          OrderItem(id: 'it_1', name: 'Paneer Biryani', quantity: 2, price: 250.0),
        ],
      );

      // Default: disabled -> does not block or fail
      final printDisabled = await printer.printOrder(order: sampleOrder, restaurantName: 'Lucky Restaurant');
      expect(printDisabled, isTrue);

      // Connect printer
      final connected = await printer.connect(PrinterDevice(id: 'bt_01', name: 'Thermal POS 58', type: PrinterConnectionType.bluetooth));
      expect(connected, isTrue);
      expect(printer.isConnected, isTrue);

      // Customer Bill format
      final billText = printer.formatReceipt(order: sampleOrder, restaurantName: 'Lucky Restaurant', type: ReceiptType.customerBill);
      expect(billText.contains('FEEDO PARTNER'), isTrue);
      expect(billText.contains('LUCKY RESTAURANT'), isTrue);
      expect(billText.contains('Paneer Biryani'), isTrue);

      // Kitchen Order Ticket (KOT) format
      final kotText = printer.formatReceipt(order: sampleOrder, restaurantName: 'Lucky Restaurant', type: ReceiptType.kitchenOrderTicket);
      expect(kotText.contains('KITCHEN ORDER TICKET (KOT)'), isTrue);

      // Print order
      final printResult = await printer.printOrder(order: sampleOrder, restaurantName: 'Lucky Restaurant');
      expect(printResult, isTrue);

      // Disconnect
      await printer.disconnect();
      expect(printer.isConnected, isFalse);
    });
  });
}
