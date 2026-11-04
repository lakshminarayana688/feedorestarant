import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../demo/demo_controller_widget.dart';
import '../../providers/app_provider.dart';
import '../../providers/order_provider.dart';
import '../../providers/restaurant_provider.dart';
import '../../widgets/common_app_bar.dart';
import '../../widgets/order_card.dart';
import '../../widgets/stat_card.dart';
import '../orders/order_detail_screen.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderState = ref.watch(orderProvider);
    final restaurant = ref.watch(restaurantProvider).details;

    return Scaffold(
      appBar: const CommonAppBar(),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () async {
          await ref.read(orderProvider.notifier).loadOrders();
          await ref.read(restaurantProvider.notifier).loadRestaurant();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const DemoControllerWidget(),

              // Quick Status Banner if restaurant is offline
              if (!restaurant.isOnline) ...[
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.errorLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.power_settings_new_rounded, color: AppColors.error, size: 20),
                      const SizedBox(width: 10),
                      const Expanded(
                        child: Text(
                          'Your restaurant is currently OFFLINE. Customers cannot place new orders.',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.error),
                        ),
                      ),
                      TextButton(
                        onPressed: () => ref.read(restaurantProvider.notifier).toggleOnlineStatus(true),
                        style: TextButton.styleFrom(
                          backgroundColor: AppColors.error,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          minimumSize: Size.zero,
                        ),
                        child: const Text('Go Online', style: TextStyle(fontSize: 11)),
                      ),
                    ],
                  ),
                ),
              ],

              // Key KPI Metrics Grid
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Today\'s Overview', style: AppTypography.h3),
                    const SizedBox(height: 12),
                    GridView.count(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      childAspectRatio: 1.25,
                      children: [
                        StatCard(
                          title: 'Today\'s Sales',
                          value: '₹${orderState.todayRevenue.toStringAsFixed(0)}',
                          icon: Icons.currency_rupee_rounded,
                          iconColor: AppColors.primary,
                          trend: '+12.4%',
                        ),
                        StatCard(
                          title: 'Total Orders',
                          value: '${orderState.orders.length}',
                          icon: Icons.shopping_bag_outlined,
                          iconColor: AppColors.info,
                          subtitle: '${orderState.todayCompletedCount} delivered',
                        ),
                        StatCard(
                          title: 'In Cooking',
                          value: '${orderState.preparingCount}',
                          icon: Icons.soup_kitchen_rounded,
                          iconColor: AppColors.statusPreparing,
                          onTap: () {
                            ref.read(orderProvider.notifier).setFilter('PREPARING');
                            ref.read(navigationIndexProvider.notifier).setIndex(AppConstants.tabOrders);
                          },
                        ),
                        StatCard(
                          title: 'Ready for Rider',
                          value: '${orderState.readyCount}',
                          icon: Icons.inventory_2_outlined,
                          iconColor: AppColors.success,
                          onTap: () {
                            ref.read(orderProvider.notifier).setFilter('READY');
                            ref.read(navigationIndexProvider.notifier).setIndex(AppConstants.tabOrders);
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Live Orders Queue
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Text('Live Orders Queue', style: AppTypography.h3),
                        const SizedBox(width: 8),
                        if (orderState.newOrdersCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '${orderState.newOrdersCount} NEW',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.white),
                            ),
                          ),
                      ],
                    ),
                    TextButton(
                      onPressed: () {
                        ref.read(orderProvider.notifier).setFilter('ALL');
                        ref.read(navigationIndexProvider.notifier).setIndex(AppConstants.tabOrders);
                      },
                      child: const Text('View All'),
                    ),
                  ],
                ),
              ),

              if (orderState.orders.isEmpty) ...[
                const Padding(
                  padding: EdgeInsets.all(32),
                  child: Center(
                    child: Text('No active orders right now. New orders will appear in realtime!'),
                  ),
                ),
              ] else ...[
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: orderState.orders.take(4).length,
                  itemBuilder: (context, index) {
                    final order = orderState.orders[index];
                    return OrderCard(
                      order: order,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => OrderDetailScreen(orderId: order.id),
                          ),
                        );
                      },
                    );
                  },
                ),
              ],

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
