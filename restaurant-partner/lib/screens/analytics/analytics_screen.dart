import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/analytics_provider.dart';
import '../../widgets/common_app_bar.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/state_views.dart';

class AnalyticsScreen extends ConsumerStatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  ConsumerState<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends ConsumerState<AnalyticsScreen> {
  String _selectedRange = 'Today';
  final List<String> _ranges = ['Today', 'Yesterday', 'Last 7 Days', 'This Month'];

  @override
  Widget build(BuildContext context) {
    final analyticsState = ref.watch(analyticsProvider);

    if (analyticsState.isLoading) {
      return const Scaffold(
        appBar: CommonAppBar(title: 'Business Analytics'),
        body: LoadingView(message: 'Computing sales insights...'),
      );
    }

    final summary = analyticsState.summary;
    if (summary == null) {
      return Scaffold(
        appBar: const CommonAppBar(title: 'Business Analytics'),
        body: ErrorView(
          message: analyticsState.error ?? 'Failed to load metrics',
          onRetry: () => ref.read(analyticsProvider.notifier).loadAnalytics(),
        ),
      );
    }

    return Scaffold(
      appBar: const CommonAppBar(title: 'Business Analytics'),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => ref.read(analyticsProvider.notifier).loadAnalytics(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Date Range Chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _ranges.map((r) {
                    final isSelected = r == _selectedRange;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text(r),
                        selected: isSelected,
                        selectedColor: AppColors.primary,
                        labelStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? Colors.white : AppColors.textPrimary,
                        ),
                        backgroundColor: Colors.white,
                        side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                        onSelected: (_) => setState(() => _selectedRange = r),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 16),

              // KPI Cards Grid
              GridView.count(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                childAspectRatio: 1.25,
                children: [
                  StatCard(
                    title: 'Gross Revenue',
                    value: '₹${summary.todayRevenue.toStringAsFixed(0)}',
                    icon: Icons.currency_rupee_rounded,
                    iconColor: AppColors.primary,
                    trend: '+14.2%',
                  ),
                  StatCard(
                    title: 'Completed Orders',
                    value: '${summary.completedOrders}',
                    icon: Icons.check_circle_outline_rounded,
                    iconColor: AppColors.success,
                    subtitle: '${summary.cancelledOrders} cancelled',
                  ),
                  StatCard(
                    title: 'Average Order Value',
                    value: '₹${summary.averageOrderValue.toStringAsFixed(0)}',
                    icon: Icons.receipt_long_rounded,
                    iconColor: AppColors.info,
                  ),
                  StatCard(
                    title: 'Customer Rating',
                    value: '${summary.averageRating} ★',
                    icon: Icons.star_rounded,
                    iconColor: AppColors.warning,
                    subtitle: 'From verified orders',
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Top Selling Items Card
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_fire_department_rounded, color: AppColors.primary, size: 20),
                          SizedBox(width: 8),
                          Text('Top Selling Dishes', style: AppTypography.h3),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...summary.topItems.map((item) {
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 14,
                                height: 14,
                                decoration: BoxDecoration(
                                  border: Border.all(
                                    color: item.isVeg ? AppColors.veg : AppColors.nonVeg,
                                    width: 1.5,
                                  ),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                                child: Center(
                                  child: Container(
                                    width: 6,
                                    height: 6,
                                    decoration: BoxDecoration(
                                      color: item.isVeg ? AppColors.veg : AppColors.nonVeg,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(item.name, style: AppTypography.bodyMedium),
                              ),
                              Text(
                                '${item.count} orders',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12, color: AppColors.textSecondary),
                              ),
                              const SizedBox(width: 12),
                              Text(
                                '₹${item.revenue.toStringAsFixed(0)}',
                                style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Hourly Sales Trends
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.access_time_rounded, color: AppColors.info, size: 20),
                          SizedBox(width: 8),
                          Text('Hourly Order Peak Hours', style: AppTypography.h3),
                        ],
                      ),
                      const SizedBox(height: 12),
                      ...summary.hourlyTrend.map((h) {
                        final maxRev = 10000.0;
                        final factor = (h.revenue / maxRev).clamp(0.05, 1.0);

                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              SizedBox(
                                width: 50,
                                child: Text(h.hour, style: AppTypography.caption),
                              ),
                              Expanded(
                                child: Stack(
                                  children: [
                                    Container(
                                      height: 18,
                                      decoration: BoxDecoration(
                                        color: AppColors.surfaceVariant,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                    ),
                                    FractionallySizedBox(
                                      widthFactor: factor,
                                      child: Container(
                                        height: 18,
                                        decoration: BoxDecoration(
                                          color: AppColors.primary.withOpacity(0.8),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 10),
                              SizedBox(
                                width: 60,
                                child: Text(
                                  '₹${h.revenue.toStringAsFixed(0)}',
                                  textAlign: TextAlign.end,
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
