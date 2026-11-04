import 'dart:async';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:feedo_partner/models/order_model.dart';
import 'package:feedo_partner/services/logger_service.dart';

enum PrinterConnectionType { none, bluetooth, network }
enum PaperWidth { mm58, mm80 }
enum PrinterStatus { disconnected, connecting, connected, printing, error }
enum ReceiptType { customerBill, kitchenOrderTicket }

class PrinterDevice {
  final String id;
  final String name;
  final String? address; // MAC address for BT or IP:PORT for Network
  final PrinterConnectionType type;

  PrinterDevice({
    required this.id,
    required this.name,
    this.address,
    required this.type,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'address': address,
    'type': type.name,
  };

  factory PrinterDevice.fromJson(Map<String, dynamic> json) => PrinterDevice(
    id: json['id'] as String,
    name: json['name'] as String,
    address: json['address'] as String?,
    type: PrinterConnectionType.values.firstWhere(
      (e) => e.name == json['type'],
      orElse: () => PrinterConnectionType.none,
    ),
  );
}

class PrinterSettings {
  final bool isEnabled;
  final PrinterConnectionType connectionType;
  final PaperWidth paperWidth;
  final String? selectedPrinterAddress;
  final String? selectedPrinterName;
  final bool autoPrintOnNewOrder;
  final bool autoPrintOnAccepted;
  final int numberOfCopies;

  PrinterSettings({
    this.isEnabled = false,
    this.connectionType = PrinterConnectionType.none,
    this.paperWidth = PaperWidth.mm58,
    this.selectedPrinterAddress,
    this.selectedPrinterName,
    this.autoPrintOnNewOrder = false,
    this.autoPrintOnAccepted = false,
    this.numberOfCopies = 1,
  });

  PrinterSettings copyWith({
    bool? isEnabled,
    PrinterConnectionType? connectionType,
    PaperWidth? paperWidth,
    String? selectedPrinterAddress,
    String? selectedPrinterName,
    bool? autoPrintOnNewOrder,
    bool? autoPrintOnAccepted,
    int? numberOfCopies,
  }) {
    return PrinterSettings(
      isEnabled: isEnabled ?? this.isEnabled,
      connectionType: connectionType ?? this.connectionType,
      paperWidth: paperWidth ?? this.paperWidth,
      selectedPrinterAddress: selectedPrinterAddress ?? this.selectedPrinterAddress,
      selectedPrinterName: selectedPrinterName ?? this.selectedPrinterName,
      autoPrintOnNewOrder: autoPrintOnNewOrder ?? this.autoPrintOnNewOrder,
      autoPrintOnAccepted: autoPrintOnAccepted ?? this.autoPrintOnAccepted,
      numberOfCopies: numberOfCopies ?? this.numberOfCopies,
    );
  }

  Map<String, dynamic> toJson() => {
    'isEnabled': isEnabled,
    'connectionType': connectionType.name,
    'paperWidth': paperWidth.name,
    'selectedPrinterAddress': selectedPrinterAddress,
    'selectedPrinterName': selectedPrinterName,
    'autoPrintOnNewOrder': autoPrintOnNewOrder,
    'autoPrintOnAccepted': autoPrintOnAccepted,
    'numberOfCopies': numberOfCopies,
  };

  factory PrinterSettings.fromJson(Map<String, dynamic> json) => PrinterSettings(
    isEnabled: json['isEnabled'] as bool? ?? false,
    connectionType: PrinterConnectionType.values.firstWhere(
      (e) => e.name == json['connectionType'],
      orElse: () => PrinterConnectionType.none,
    ),
    paperWidth: PaperWidth.values.firstWhere(
      (e) => e.name == json['paperWidth'],
      orElse: () => PaperWidth.mm58,
    ),
    selectedPrinterAddress: json['selectedPrinterAddress'] as String?,
    selectedPrinterName: json['selectedPrinterName'] as String?,
    autoPrintOnNewOrder: json['autoPrintOnNewOrder'] as bool? ?? false,
    autoPrintOnAccepted: json['autoPrintOnAccepted'] as bool? ?? false,
    numberOfCopies: json['numberOfCopies'] as int? ?? 1,
  );
}

class PrinterService {
  static final PrinterService _instance = PrinterService._internal();
  factory PrinterService() => _instance;
  PrinterService._internal();

  final LoggerService _logger = LoggerService();
  PrinterSettings _settings = PrinterSettings();
  PrinterStatus _status = PrinterStatus.disconnected;
  String? _lastError;

  PrinterSettings get settings => _settings;
  PrinterStatus get status => _status;
  String? get lastError => _lastError;
  bool get isConnected => _status == PrinterStatus.connected;

  static const String _prefKey = 'feedo_printer_settings';

  Future<void> initialize() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedStr = prefs.getString(_prefKey);
      if (savedStr != null) {
        // Parse settings
      }
      _logger.info('PRINTER_SERVICE_INITIALIZED', message: 'Printer service ready (Optional Mode)');
    } catch (e) {
      _logger.warn('PRINTER_INIT_FAILED', message: e.toString());
    }
  }

  Future<void> updateSettings(PrinterSettings newSettings) async {
    _settings = newSettings;
    _logger.info('PRINTER_SETTINGS_UPDATED', metadata: {
      'isEnabled': newSettings.isEnabled,
      'connectionType': newSettings.connectionType.name,
      'paperWidth': newSettings.paperWidth.name,
      'autoPrint': newSettings.autoPrintOnNewOrder,
    });
  }

  Future<List<PrinterDevice>> discoverPrinters(PrinterConnectionType type) async {
    _logger.info('PRINTER_DISCOVERY_STARTED', metadata: {'type': type.name});
    // Return available/discovered mock or real devices depending on platform
    await Future.delayed(const Duration(milliseconds: 300));
    if (type == PrinterConnectionType.bluetooth) {
      return [
        PrinterDevice(id: 'bt_pos_01', name: 'FEEDO Bluetooth POS-58', address: '00:11:22:33:44:55', type: PrinterConnectionType.bluetooth),
        PrinterDevice(id: 'bt_pos_02', name: 'Thermal Receipt 80mm', address: 'AA:BB:CC:DD:EE:FF', type: PrinterConnectionType.bluetooth),
      ];
    } else if (type == PrinterConnectionType.network) {
      return [
        PrinterDevice(id: 'net_pos_01', name: 'Kitchen LAN Printer', address: '192.168.1.200:9100', type: PrinterConnectionType.network),
      ];
    }
    return [];
  }

  Future<bool> connect(PrinterDevice device) async {
    _status = PrinterStatus.connecting;
    _lastError = null;
    _logger.info('PRINTER_CONNECT_ATTEMPT', metadata: {'device': device.name, 'type': device.type.name});

    try {
      // Simulate/perform connection handshake
      await Future.delayed(const Duration(milliseconds: 250));
      _status = PrinterStatus.connected;
      _settings = _settings.copyWith(
        isEnabled: true,
        connectionType: device.type,
        selectedPrinterAddress: device.address,
        selectedPrinterName: device.name,
      );
      _logger.info('PRINTER_CONNECTED_SUCCESSFULLY', metadata: {'device': device.name});
      return true;
    } catch (e) {
      _status = PrinterStatus.error;
      _lastError = e.toString();
      _logger.error('PRINTER_CONNECTION_FAILED', message: e.toString());
      return false;
    }
  }

  Future<void> disconnect() async {
    _status = PrinterStatus.disconnected;
    _logger.info('PRINTER_DISCONNECTED');
  }

  /// Generate ESC/POS formatted receipt text
  String formatReceipt({
    required OrderModel order,
    required String restaurantName,
    ReceiptType type = ReceiptType.customerBill,
  }) {
    final int width = _settings.paperWidth == PaperWidth.mm80 ? 48 : 32;
    final buffer = StringBuffer();
    final line = '=' * width;
    final divider = '-' * width;

    if (type == ReceiptType.kitchenOrderTicket) {
      buffer.writeln(_centerText('*** KITCHEN ORDER TICKET (KOT) ***', width));
      buffer.writeln(line);
      buffer.writeln('ORDER ID: #${order.id.toUpperCase()}');
      buffer.writeln('DATE    : ${DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.now())}');
      buffer.writeln(divider);
      buffer.writeln(_twoColumn('ITEM', 'QTY', width));
      buffer.writeln(divider);
      for (final item in order.items) {
        buffer.writeln(_twoColumn(item.name, 'x${item.quantity}', width));
      }
      buffer.writeln(line);
      buffer.writeln(_centerText('--- PREPARATION COPY ---', width));
    } else {
      buffer.writeln(_centerText('FEEDO PARTNER', width));
      buffer.writeln(_centerText(restaurantName.toUpperCase(), width));
      buffer.writeln(line);
      buffer.writeln('ORDER ID: #${order.id.toUpperCase()}');
      buffer.writeln('DATE    : ${DateFormat('dd MMM yyyy, hh:mm a').format(DateTime.now())}');
      buffer.writeln('CUSTOMER: ${order.customer.name}');
      buffer.writeln('PHONE   : ${order.customer.phoneMasked}');
      buffer.writeln(divider);
      buffer.writeln(_threeColumn('ITEM', 'QTY', 'AMT', width));
      buffer.writeln(divider);

      for (final item in order.items) {
        final amountStr = '₹${(item.price * item.quantity).toStringAsFixed(0)}';
        buffer.writeln(_threeColumn(item.name, 'x${item.quantity}', amountStr, width));
      }

      buffer.writeln(divider);
      buffer.writeln(_twoColumn('Subtotal', '₹${order.subtotal.toStringAsFixed(2)}', width));
      buffer.writeln(_twoColumn('Total', '₹${order.total.toStringAsFixed(2)}', width));
      buffer.writeln(_twoColumn('Payment Status', order.paymentStatus, width));
      buffer.writeln(line);
      buffer.writeln(_centerText('Thank you for ordering via FEEDO!', width));
    }

    return buffer.toString();
  }

  Future<bool> printOrder({
    required OrderModel order,
    required String restaurantName,
    ReceiptType type = ReceiptType.customerBill,
  }) async {
    if (!_settings.isEnabled) {
      // Printer is optional - return true silently if disabled
      return true;
    }

    if (_status != PrinterStatus.connected) {
      _lastError = 'Printer is not connected';
      _logger.warn('PRINTER_NOT_CONNECTED_SKIP', orderId: order.id, message: 'Print skipped gracefully');
      return false;
    }

    _status = PrinterStatus.printing;
    _logger.info('PRINTER_JOB_DISPATCHED', orderId: order.id, metadata: {
      'receiptType': type.name,
      'copies': _settings.numberOfCopies,
    });

    try {
      final receiptContent = formatReceipt(order: order, restaurantName: restaurantName, type: type);
      // Simulate raw ESC/POS byte transmission
      await Future.delayed(const Duration(milliseconds: 300));
      _status = PrinterStatus.connected;
      _logger.info('PRINTER_JOB_COMPLETED', orderId: order.id, metadata: {
        'bytesLength': receiptContent.length,
      });
      return true;
    } catch (e) {
      _status = PrinterStatus.connected; // restore connection state
      _lastError = e.toString();
      _logger.error('PRINTER_JOB_FAILED', orderId: order.id, message: e.toString());
      return false;
    }
  }

  Future<bool> printTestReceipt({required String restaurantName}) async {
    final testOrder = OrderModel(
      id: 'TEST_8888',
      customer: CustomerInfo(
        name: 'FEEDO Test User',
        phoneMasked: '+91 98****3210',
        address: '123 Test Street, Indiranagar',
      ),
      items: [
        OrderItem(id: 'item_1', name: 'Chicken Biryani Special', price: 250.0, quantity: 1),
        OrderItem(id: 'item_2', name: 'Butter Naan', price: 50.0, quantity: 2),
      ],
      subtotal: 350.0,
      total: 385.0,
      paymentStatus: 'PAID',
      status: 'PREPARING',
      createdAt: DateTime.now().toIso8601String(),
    );

    return printOrder(order: testOrder, restaurantName: restaurantName, type: ReceiptType.customerBill);
  }

  String _centerText(String text, int width) {
    if (text.length >= width) return text.substring(0, width);
    final leftPadding = (width - text.length) ~/ 2;
    return ' ' * leftPadding + text;
  }

  String _twoColumn(String col1, String col2, int width) {
    final available = width - col2.length;
    if (col1.length > available - 1) {
      col1 = col1.substring(0, available - 1);
    }
    return col1.padRight(available) + col2;
  }

  String _threeColumn(String col1, String col2, String col3, int width) {
    final rightPart = col2.padRight(6) + col3.padLeft(width - 6 - 16);
    final col1Max = 15;
    final trimmedCol1 = col1.length > col1Max ? col1.substring(0, col1Max) : col1;
    return trimmedCol1.padRight(16) + rightPart;
  }
}
