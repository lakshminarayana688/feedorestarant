import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../models/api_response.dart';
import '../models/analytics_model.dart';

class AnalyticsService {
  Future<ApiResponse<AnalyticsSummary>> getAnalyticsSummary([String? restaurantId]) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        final summary = AnalyticsSummary(
          todayRevenue: 28450.0,
          todayOrders: 42,
          kitchenPending: 4,
          completedOrders: 36,
          cancelledOrders: 2,
          averageOrderValue: 677.38,
          averageRating: 4.8,
          hourlyTrend: [
            HourlySalesData(hour: '11 AM', orders: 3, revenue: 1950.0),
            HourlySalesData(hour: '12 PM', orders: 8, revenue: 5400.0),
            HourlySalesData(hour: '1 PM', orders: 12, revenue: 8200.0),
            HourlySalesData(hour: '2 PM', orders: 9, revenue: 6100.0),
            HourlySalesData(hour: '3 PM', orders: 4, revenue: 2600.0),
            HourlySalesData(hour: '4 PM', orders: 2, revenue: 1400.0),
            HourlySalesData(hour: '5 PM', orders: 4, revenue: 2800.0),
          ],
          topItems: [
            TopSellingItem(id: 'item_1', name: 'Royal Hyderabadi Dum Biryani', count: 28, revenue: 9520.0, isVeg: false),
            TopSellingItem(id: 'item_2', name: 'Paneer Butter Masala', count: 18, revenue: 4680.0, isVeg: true),
            TopSellingItem(id: 'item_3', name: 'Crispy Garlic Chicken Tikka', count: 14, revenue: 4480.0, isVeg: false),
            TopSellingItem(id: 'item_4', name: 'Butter Garlic Naan', count: 42, revenue: 2730.0, isVeg: true),
          ],
        );
        return ApiResponse.success(summary, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke('order-analytics');

      if (res.status >= 400) {
        return ApiResponse.failure('Analytics computation failed.', code: 'ANALYTICS_ERROR');
      }

      final data = res.data;
      final summary = AnalyticsSummary(
        todayRevenue: (data['today_revenue'] as num?)?.toDouble() ?? 0.0,
        todayOrders: data['today_orders'] as int? ?? 0,
        kitchenPending: data['kitchen_pending'] as int? ?? 0,
        completedOrders: data['completed_orders'] as int? ?? 0,
        cancelledOrders: data['cancelled_orders'] as int? ?? 0,
        averageOrderValue: (data['average_order_value'] as num?)?.toDouble() ?? 0.0,
        averageRating: (data['average_rating'] as num?)?.toDouble() ?? 4.5,
        hourlyTrend: ((data['hourly_trend'] as List<dynamic>?) ?? [])
            .map((e) => HourlySalesData.fromJson(e))
            .toList(),
        topItems: ((data['top_items'] as List<dynamic>?) ?? [])
            .map((e) => TopSellingItem.fromJson(e))
            .toList(),
      );

      return ApiResponse.success(summary, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to load restaurant analytics.', details: e.toString());
    }
  }
}
