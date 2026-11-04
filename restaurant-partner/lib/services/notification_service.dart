import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../models/api_response.dart';

class NotificationItem {
  final String id;
  final String title;
  final String body;
  final String type; // 'ORDER', 'RIDER', 'SETTLEMENT', 'SYSTEM'
  final DateTime timestamp;
  final bool isRead;

  NotificationItem({
    required this.id,
    required this.title,
    required this.body,
    required this.type,
    required this.timestamp,
    this.isRead = false,
  });

  factory NotificationItem.fromJson(Map<String, dynamic> json) {
    return NotificationItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? json['message'] as String? ?? '',
      type: json['type'] as String? ?? 'SYSTEM',
      timestamp: json['timestamp'] != null ? DateTime.parse(json['timestamp']) : DateTime.now(),
      isRead: json['isRead'] as bool? ?? json['is_read'] as bool? ?? false,
    );
  }
}

class NotificationService {
  final List<NotificationItem> _demoNotifications = [
    NotificationItem(
      id: 'notif_1',
      title: '🔔 New Order #FD10245',
      body: 'Royal Hyderabadi Dum Biryani (x2), Total ₹935.00',
      type: 'ORDER',
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
    ),
    NotificationItem(
      id: 'notif_2',
      title: '🛵 Rider Arrived at Store',
      body: 'Arun Kumar is at pickup bay for order #FD10243',
      type: 'RIDER',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    NotificationItem(
      id: 'notif_3',
      title: '💰 Weekly Settlement Processed',
      body: '₹38,198.60 credited to HDFC Bank A/C ••••4321',
      type: 'SETTLEMENT',
      timestamp: DateTime.now().subtract(const Duration(hours: 48)),
      isRead: true,
    ),
  ];

  Future<ApiResponse<List<NotificationItem>>> getNotifications() async {
    try {
      if (AppConfig.isDemo) {
        return ApiResponse.success(_demoNotifications, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client
          .from('notifications')
          .select()
          .order('created_at', ascending: false);

      final list = (res as List<dynamic>).map((e) => NotificationItem.fromJson(e)).toList();
      return ApiResponse.success(list, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to load notifications.', details: e.toString());
    }
  }

  Future<ApiResponse<bool>> markAllAsRead() async {
    return ApiResponse.success(true);
  }
}
