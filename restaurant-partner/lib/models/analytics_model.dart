class HourlySalesData {
  final String hour;
  final int orders;
  final double revenue;

  HourlySalesData({
    required this.hour,
    required this.orders,
    required this.revenue,
  });

  factory HourlySalesData.fromJson(Map<String, dynamic> json) {
    return HourlySalesData(
      hour: json['hour'] as String? ?? json['timeLabel'] as String? ?? '',
      orders: json['orders'] as int? ?? 0,
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'hour': hour,
      'orders': orders,
      'revenue': revenue,
    };
  }
}

class TopSellingItem {
  final String id;
  final String name;
  final int count;
  final double revenue;
  final bool isVeg;

  TopSellingItem({
    required this.id,
    required this.name,
    required this.count,
    required this.revenue,
    this.isVeg = true,
  });

  factory TopSellingItem.fromJson(Map<String, dynamic> json) {
    return TopSellingItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      count: json['count'] as int? ?? 0,
      revenue: (json['revenue'] as num?)?.toDouble() ?? 0.0,
      isVeg: json['isVeg'] as bool? ?? json['is_veg'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'count': count,
      'revenue': revenue,
      'isVeg': isVeg,
    };
  }
}

class AnalyticsSummary {
  final double todayRevenue;
  final int todayOrders;
  final int kitchenPending;
  final int completedOrders;
  final int cancelledOrders;
  final double averageOrderValue;
  final double averageRating;
  final List<HourlySalesData> hourlyTrend;
  final List<TopSellingItem> topItems;

  AnalyticsSummary({
    required this.todayRevenue,
    required this.todayOrders,
    required this.kitchenPending,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.averageOrderValue,
    required this.averageRating,
    required this.hourlyTrend,
    required this.topItems,
  });
}
