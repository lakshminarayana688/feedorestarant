import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../providers/order_provider.dart';
import '../../widgets/common_app_bar.dart';
import '../../widgets/order_card.dart';
import '../../widgets/state_views.dart';
import 'order_detail_screen.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderState = ref.watch(orderProvider);
    final activeFilter = orderState.activeFilter;

    final filters = [
      {'key': 'ALL', 'label': 'All', 'count': orderState.orders.length},
      {'key': 'NEW', 'label': 'New', 'count': orderState.newOrdersCount},
      {'key': 'PREPARING', 'label': 'Preparing', 'count': orderState.preparingCount},
      {'key': 'READY', 'label': 'Ready', 'count': orderState.readyCount},
      {'key': 'PICKED_UP', 'label': 'Picked Up', 'count': orderState.orders.where((o) => o.isPickedUp).length},
      {'key': 'DELIVERED', 'label': 'Delivered', 'count': orderState.todayCompletedCount},
      {'key': 'CANCELLED', 'label': 'Cancelled', 'count': orderState.orders.where((o) => o.isCancelled).length},
    ];

    return Scaffold(
      appBar: const CommonAppBar(title: 'Orders Management'),
      body: Column(
        children: [
          // Filter Chips Horizontal Bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: filters.map((f) {
                  final isSelected = f['key'] == activeFilter;
                  final count = f['count'] as int;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilterChip(
                      selected: isSelected,
                      showCheckmark: false,
                      label: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            f['label'] as String,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                            ),
                          ),
                          if (count > 0) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                              decoration: BoxDecoration(
                                color: isSelected ? Colors.white.withOpacity(0.25) : AppColors.surfaceVariant,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                '$count',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? Colors.white : AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      backgroundColor: Colors.white,
                      selectedColor: AppColors.primary,
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      onSelected: (_) {
                        ref.read(orderProvider.notifier).setFilter(f['key'] as String);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1),

          // Orders List
          Expanded(
            child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () => ref.read(orderProvider.notifier).loadOrders(),
              child: orderState.filteredOrders.isEmpty
                  ? EmptyView(
                      title: 'No Orders in this category',
                      description: 'Orders will update dynamically as status transitions occur.',
                      actionLabel: 'Show All Orders',
                      onAction: () => ref.read(orderProvider.notifier).setFilter('ALL'),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      itemCount: orderState.filteredOrders.length,
                      itemBuilder: (context, index) {
                        final order = orderState.filteredOrders[index];
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
            ),
          ),
        ],
      ),
    );
  }
}
