import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

enum LogLevel { info, warn, error, success }

class LogEntry {
  final String timestamp;
  final String eventId;
  final String? userId;
  final String? restaurantId;
  final String? orderId;
  final String operation;
  final LogLevel level;
  final String? errorCode;
  final String? message;
  final Map<String, dynamic>? metadata;

  LogEntry({
    required this.timestamp,
    required this.eventId,
    this.userId,
    this.restaurantId,
    this.orderId,
    required this.operation,
    required this.level,
    this.errorCode,
    this.message,
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'timestamp': timestamp,
      'eventId': eventId,
      if (userId != null) 'userId': userId,
      if (restaurantId != null) 'restaurantId': restaurantId,
      if (orderId != null) 'orderId': orderId,
      'operation': operation,
      'status': level.name.toUpperCase(),
      if (errorCode != null) 'errorCode': errorCode,
      if (message != null) 'message': message,
      if (metadata != null) 'metadata': metadata,
    };
  }

  @override
  String toString() => jsonEncode(toJson());
}

class LoggerService {
  static final LoggerService _instance = LoggerService._internal();
  factory LoggerService() => _instance;
  LoggerService._internal();

  static const _uuid = Uuid();
  final List<LogEntry> _recentLogs = [];
  static const int _maxInMemoryLogs = 200;

  List<LogEntry> get recentLogs => List.unmodifiable(_recentLogs);

  /// Safe field masking to prevent PII / secret leakage in production logs
  static String maskValue(String key, dynamic rawValue) {
    if (rawValue == null) return '';
    final str = rawValue.toString().trim();
    if (str.isEmpty) return '';

    final lowerKey = key.toLowerCase();

    // 1. Absolute redactions (Secrets, passwords, OTPs, Tokens, Keys)
    if (lowerKey.contains('password') ||
        lowerKey.contains('otp') ||
        lowerKey.contains('token') ||
        lowerKey.contains('secret') ||
        lowerKey.contains('signature') ||
        lowerKey.contains('jwt') ||
        lowerKey.contains('auth') ||
        lowerKey.contains('key')) {
      return '[REDACTED]';
    }

    // 2. Bank Account Masking (Show only last 4 digits)
    if (lowerKey.contains('bank') || lowerKey.contains('account')) {
      if (str.length <= 4) return '****';
      return '****${str.substring(str.length - 4)}';
    }

    // 3. PAN / Tax ID Masking (Show first 5 and last 1, mask middle 4)
    if (lowerKey.contains('pan') || lowerKey.contains('tax_id')) {
      if (str.length == 10) {
        return '${str.substring(0, 5)}****${str.substring(9)}';
      }
      return '****';
    }

    // 4. Phone Number Masking (Show first 2 and last 4)
    if (lowerKey.contains('phone') || lowerKey.contains('mobile')) {
      if (str.length >= 10) {
        return '${str.substring(0, 4)}****${str.substring(str.length - 4)}';
      }
      return '****';
    }

    // 5. Email Masking (e.g. l***y@feedo.com)
    if (lowerKey.contains('email') && str.contains('@')) {
      final parts = str.split('@');
      final name = parts[0];
      final domain = parts[1];
      final maskedName = name.length > 2
          ? '${name[0]}***${name[name.length - 1]}'
          : '***';
      return '$maskedName@$domain';
    }

    return str;
  }

  static Map<String, dynamic> sanitizeMap(Map<String, dynamic> raw) {
    final sanitized = <String, dynamic>{};
    for (final entry in raw.entries) {
      if (entry.value is Map<String, dynamic>) {
        sanitized[entry.key] = sanitizeMap(entry.value as Map<String, dynamic>);
      } else if (entry.value is List) {
        sanitized[entry.key] = (entry.value as List).map((e) {
          if (e is Map<String, dynamic>) return sanitizeMap(e);
          return e;
        }).toList();
      } else {
        sanitized[entry.key] = maskValue(entry.key, entry.value);
      }
    }
    return sanitized;
  }

  void log({
    required String operation,
    required LogLevel level,
    String? userId,
    String? restaurantId,
    String? orderId,
    String? errorCode,
    String? message,
    Map<String, dynamic>? metadata,
  }) {
    final entry = LogEntry(
      timestamp: DateTime.now().toUtc().toIso8601String(),
      eventId: _uuid.v4(),
      userId: userId,
      restaurantId: restaurantId,
      orderId: orderId,
      operation: operation,
      level: level,
      errorCode: errorCode,
      message: message,
      metadata: metadata != null ? sanitizeMap(metadata) : null,
    );

    _recentLogs.add(entry);
    if (_recentLogs.length > _maxInMemoryLogs) {
      _recentLogs.removeAt(0);
    }

    if (kDebugMode) {
      debugPrint('[FEEDO_LOG][${entry.level.name.toUpperCase()}] ${entry.operation}: ${entry.message ?? ''} ${entry.metadata ?? ''}');
    }
  }

  void info(String operation, {String? userId, String? restaurantId, String? orderId, String? message, Map<String, dynamic>? metadata}) {
    log(operation: operation, level: LogLevel.info, userId: userId, restaurantId: restaurantId, orderId: orderId, message: message, metadata: metadata);
  }

  void warn(String operation, {String? userId, String? restaurantId, String? orderId, String? errorCode, String? message, Map<String, dynamic>? metadata}) {
    log(operation: operation, level: LogLevel.warn, userId: userId, restaurantId: restaurantId, orderId: orderId, errorCode: errorCode, message: message, metadata: metadata);
  }

  void error(String operation, {String? userId, String? restaurantId, String? orderId, String? errorCode, String? message, dynamic exception, StackTrace? stackTrace, Map<String, dynamic>? metadata}) {
    final meta = metadata != null ? Map<String, dynamic>.from(metadata) : <String, dynamic>{};
    if (exception != null) {
      meta['exception'] = exception.toString();
    }
    if (stackTrace != null) {
      meta['stackTrace'] = stackTrace.toString().split('\n').take(4).join(' | ');
    }
    log(
      operation: operation,
      level: LogLevel.error,
      userId: userId,
      restaurantId: restaurantId,
      orderId: orderId,
      errorCode: errorCode ?? 'ERR_UNKNOWN',
      message: message ?? exception?.toString(),
      metadata: meta,
    );
  }

  /// Global Error Initializer for Uncaught Flutter Crashes & Platform Errors
  void initializeCrashMonitoring() {
    FlutterError.onError = (FlutterErrorDetails details) {
      FlutterError.presentError(details);
      error(
        'FLUTTER_UNCAUGHT_CRASH',
        errorCode: 'ERR_FLUTTER_CRASH',
        message: details.exceptionAsString(),
        stackTrace: details.stack,
        metadata: {
          'library': details.library,
          'context': details.context?.toString(),
        },
      );
    };

    PlatformDispatcher.instance.onError = (Object errorObj, StackTrace stack) {
      error(
        'PLATFORM_UNCAUGHT_EXCEPTION',
        errorCode: 'ERR_PLATFORM_EXCEPTION',
        message: errorObj.toString(),
        stackTrace: stack,
      );
      return true;
    };

    info('CRASH_MONITORING_INITIALIZED', message: 'Flutter global crash handlers active');
  }

  /// Clear log buffer (useful for unit tests)
  void clear() {
    _recentLogs.clear();
  }
}
