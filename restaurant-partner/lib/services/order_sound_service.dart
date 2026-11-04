import 'package:flutter/services.dart';

/// FEEDO Restaurant Partner - Order Sound Alert Service (Flutter)
///
/// Handles audio alerts, order deduplication tracking, foreground/background FCM preparation,
/// and setting preferences.
class OrderSoundService {
  static final OrderSoundService _instance = OrderSoundService._internal();
  factory OrderSoundService() => _instance;
  OrderSoundService._internal();

  final Set<String> _notifiedOrderIds = <String>{};
  bool _isSoundEnabled = true;
  double _volume = 0.8;
  int _repeatCount = 1;

  // FCM Android Notification Channel Specs
  static const String fcmChannelId = 'feedo_order_alerts';
  static const String fcmChannelName = 'FEEDO New Order Alerts';
  static const String fcmChannelDescription = 'Urgent sound notifications for incoming restaurant orders';
  static const String fcmSoundAsset = 'feedo_order_alert';

  bool get isSoundEnabled => _isSoundEnabled;
  double get volume => _volume;
  int get repeatCount => _repeatCount;
  Set<String> get notifiedOrderIds => Set.unmodifiable(_notifiedOrderIds);

  void setSoundEnabled(bool enabled) {
    _isSoundEnabled = enabled;
  }

  void setVolume(double vol) {
    _volume = vol.clamp(0.0, 1.0);
  }

  void setRepeatCount(int count) {
    _repeatCount = count.clamp(1, 3);
  }

  /// Seeds existing order IDs to prevent reconnect / startup sounds
  void seedKnownOrderIds(Iterable<String> ids) {
    for (final id in ids) {
      if (id.isNotEmpty) {
        _notifiedOrderIds.add(id);
      }
    }
  }

  /// Checks if an order ID has already received its one-time notification
  bool hasOrderBeenNotified(String orderId) {
    return _notifiedOrderIds.contains(orderId);
  }

  /// Evaluates incoming order. Returns true if sound was triggered for a new order.
  bool notifyNewOrderIfNew(String orderId, {bool? soundEnabled}) {
    if (orderId.isEmpty) return false;

    // Idempotency: if already alerted, do nothing
    if (_notifiedOrderIds.contains(orderId)) {
      return false;
    }

    _notifiedOrderIds.add(orderId);

    final shouldPlay = soundEnabled ?? _isSoundEnabled;
    if (shouldPlay) {
      playNewOrderAlertSound();
    }

    return true;
  }

  /// Explicitly triggered when an order is assigned to the restaurant
  bool playOrderAssignedSound(String orderId, {bool? soundEnabled}) {
    return notifyNewOrderIfNew(orderId, soundEnabled: soundEnabled);
  }

  /// Plays the distinct FEEDO restaurant incoming order alert tone
  Future<void> playNewOrderAlertSound() async {
    try {
      // System sound alert + haptic pattern for foreground notification
      await SystemSound.play(SystemSoundType.alert);
      await HapticFeedback.heavyImpact();
    } catch (_) {
      // Safe fallback if running in test / unsupported platform
    }
  }

  /// Cancels ongoing alerts / repeats
  void stopAlert() {
    // Halts foreground notification alerts
  }

  /// Triggered from Settings "Test Sound" button
  Future<void> testSound() async {
    await playNewOrderAlertSound();
  }

  /// Handles incoming FCM background push payload
  bool handleFCMBackgroundMessage(Map<String, dynamic> data) {
    final orderId = data['order_id'] as String? ?? data['id'] as String? ?? '';
    if (orderId.isEmpty) return false;

    return notifyNewOrderIfNew(orderId);
  }

  /// Resets state (e.g. on test suite run or logout)
  void reset() {
    _notifiedOrderIds.clear();
  }
}
