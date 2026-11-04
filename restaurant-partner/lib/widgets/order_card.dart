import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/constants/order_status_constants.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../models/order_model.dart';
import '../providers/order_provider.dart';
import 'pickup_verification_dialog.dart';
import 'status_badge.dart';

class OrderCard extends ConsumerWidget {
  final OrderModel order;
  final VoidCallback? onTap;

  const OrderCard({
    super.key,
    required this.order,
    this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Order ID, Time, Status Badge
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            '#${order.id}',
                            style: AppTypography.h3.copyWith(fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '• ${order.paymentMethod}',
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
                      Text(
                        '${order.customer.name} • ${order.customer.area}',
                        style: AppTypography.subtitle2,
                      ),
                    ],
                  ),
                  StatusBadge(status: order.status),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 10),

              // Items summary
              Column(
                children: order.items.map((item) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
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
                        Text(
                          '${item.quantity}x',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.name,
                            style: AppTypography.bodyMedium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Text(
                          '₹${(item.price * item.quantity).toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),

              if (order.specialInstructions != null && order.specialInstructions!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, size: 14, color: AppColors.warning),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Note: ${order.specialInstructions}',
                          style: const TextStyle(fontSize: 11, color: Color(0xFF92400E), fontWeight: FontWeight.w500),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 10),

              // Bottom footer: Total + Action Buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Bill', style: AppTypography.caption),
                      Text(
                        '₹${order.total.toStringAsFixed(2)}',
                        style: AppTypography.h3.copyWith(color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                  _buildActionButtons(context, ref),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref) {
    final status = order.status;

    if (status == OrderStatusConstants.created || status == 'PLACED') {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          OutlinedButton(
            onPressed: () {
              _showRejectDialog(context, ref);
            },
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
            child: const Text('Reject', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () {
              ref.read(orderProvider.notifier).acceptOrder(order.id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            ),
            child: const Text('Accept Order', style: TextStyle(fontSize: 12)),
          ),
        ],
      );
    }

    if (status == OrderStatusConstants.accepted || status == OrderStatusConstants.restaurantAccepted) {
      return ElevatedButton.icon(
        onPressed: () {
          ref.read(orderProvider.notifier).startPreparing(order.id);
        },
        icon: const Icon(Icons.soup_kitchen_rounded, size: 16),
        label: const Text('Start Cooking', style: TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.statusPreparing,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        ),
      );
    }

    if (status == OrderStatusConstants.preparing) {
      return ElevatedButton.icon(
        onPressed: () {
          ref.read(orderProvider.notifier).markFoodReady(order.id);
        },
        icon: const Icon(Icons.check_circle_outline, size: 16),
        label: const Text('Mark Ready', style: TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.success,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        ),
      );
    }

    if (status == OrderStatusConstants.readyForPickup) {
      return ElevatedButton.icon(
        onPressed: () {
          showDialog(
            context: context,
            builder: (ctx) => PickupVerificationDialog(
              orderId: order.id,
              onVerified: (code) {
                ref.read(orderProvider.notifier).verifyPickupAndHandover(order.id, code);
              },
            ),
          );
        },
        icon: const Icon(Icons.qr_code_scanner_rounded, size: 16),
        label: const Text('Verify Handover', style: TextStyle(fontSize: 12)),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.statusPickedUp,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        ),
      );
    }

    if (status == OrderStatusConstants.pickedUp || status == OrderStatusConstants.outForDelivery) {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.infoLight,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.two_wheeler_rounded, size: 14, color: AppColors.info),
            const SizedBox(width: 4),
            Text(
              order.rider != null ? 'With ${order.rider!.name}' : 'Rider Out for Delivery',
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.info),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  void _showRejectDialog(BuildContext context, WidgetRef ref) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reject Order', style: AppTypography.h3),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Please provide a reason for rejecting this customer order:'),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              decoration: const InputDecoration(
                hintText: 'e.g. Out of ingredients / Kitchen closing',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final reason = controller.text.trim().isNotEmpty ? controller.text.trim() : 'Restaurant busy';
              ref.read(orderProvider.notifier).rejectOrder(order.id, reason);
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
            child: const Text('Confirm Reject'),
          ),
        ],
      ),
    );
  }
}
