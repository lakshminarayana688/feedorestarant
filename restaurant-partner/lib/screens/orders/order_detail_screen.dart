import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/order_status_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../demo/demo_rider_simulator.dart';
import '../../models/order_model.dart';
import '../../providers/order_provider.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/pickup_verification_dialog.dart';
import '../../widgets/status_badge.dart';

class OrderDetailScreen extends ConsumerWidget {
  final String orderId;

  const OrderDetailScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orderState = ref.watch(orderProvider);
    final orderList = orderState.orders.where((o) => o.id == orderId).toList();

    if (orderList.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Details')),
        body: const Center(child: Text('Order not found')),
      );
    }

    final order = orderList.first;

    return Scaffold(
      appBar: AppBar(
        title: Text('Order #${order.id}', style: AppTypography.h3),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(child: StatusBadge(status: order.status)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rider tracking card if rider is assigned
            if (order.rider != null || order.status == OrderStatusConstants.readyForPickup || order.status == OrderStatusConstants.pickedUp) ...[
              DemoRiderSimulator(
                order: order,
                onArrived: () {
                  ref.read(orderProvider.notifier).simulateRiderArrival();
                },
                onDelivered: () {
                  ref.read(orderProvider.notifier).markDelivered(order.id);
                },
              ),
              const SizedBox(height: 16),
            ],

            // Customer Details Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.person_outline_rounded, color: AppColors.primary, size: 20),
                        SizedBox(width: 8),
                        Text('Customer & Delivery Address', style: AppTypography.h3),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(order.customer.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text('Phone: ${order.customer.phoneMasked}', style: AppTypography.subtitle2),
                    const SizedBox(height: 6),
                    Text('${order.customer.address}, ${order.customer.area}', style: AppTypography.bodyMedium),
                    const SizedBox(height: 4),
                    Text('${order.customer.distanceKm} km from kitchen', style: AppTypography.caption),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Order Items & Instructions Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.restaurant_rounded, color: AppColors.primary, size: 20),
                        SizedBox(width: 8),
                        Text('Items Ordered', style: AppTypography.h3),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ...order.items.map((item) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 6),
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
                              Text('${item.quantity}x', style: const TextStyle(fontWeight: FontWeight.w700)),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(item.name, style: AppTypography.bodyMedium),
                              ),
                              Text(
                                '₹${(item.price * item.quantity).toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.w700),
                              ),
                            ],
                          ),
                        )),
                    if (order.specialInstructions != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: AppColors.warningLight,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.warning.withOpacity(0.3)),
                        ),
                        child: Text(
                          'Chef Note: ${order.specialInstructions}',
                          style: const TextStyle(fontSize: 12, color: Color(0xFF92400E), fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Bill Summary Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Bill Summary', style: AppTypography.h3),
                    const SizedBox(height: 12),
                    _buildBillRow('Item Subtotal', '₹${order.subtotal.toStringAsFixed(2)}'),
                    _buildBillRow('Taxes & GST', '₹${order.taxes.toStringAsFixed(2)}'),
                    _buildBillRow('Packaging & Platform', '₹${(order.deliveryFee + order.platformFee).toStringAsFixed(2)}'),
                    if (order.discount > 0)
                      _buildBillRow('Promo Discount', '-₹${order.discount.toStringAsFixed(2)}', isDiscount: true),
                    const Divider(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Total Bill Paid', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        Text(
                          '₹${order.total.toStringAsFixed(2)}',
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryDark),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text('Payment: ${order.paymentMethod} (${order.paymentStatus})', style: AppTypography.caption),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Order Action Button
            _buildBottomAction(context, ref, order),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildBillRow(String label, String value, {bool isDiscount = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Text(
            value,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isDiscount ? AppColors.success : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomAction(BuildContext context, WidgetRef ref, OrderModel order) {
    final status = order.status;

    if (status == OrderStatusConstants.created || status == 'PLACED') {
      return Row(
        children: [
          Expanded(
            child: CustomButton(
              text: 'Reject',
              isOutlined: true,
              color: AppColors.error,
              onPressed: () {
                ref.read(orderProvider.notifier).rejectOrder(order.id, 'Busy');
                Navigator.of(context).pop();
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: CustomButton(
              text: 'Accept Order',
              onPressed: () {
                ref.read(orderProvider.notifier).acceptOrder(order.id);
              },
            ),
          ),
        ],
      );
    }

    if (status == OrderStatusConstants.accepted || status == OrderStatusConstants.restaurantAccepted) {
      return CustomButton(
        text: 'Start Preparing Food',
        color: AppColors.statusPreparing,
        icon: Icons.soup_kitchen_rounded,
        onPressed: () {
          ref.read(orderProvider.notifier).startPreparing(order.id);
        },
      );
    }

    if (status == OrderStatusConstants.preparing) {
      return CustomButton(
        text: 'Mark Food Ready for Pickup',
        color: AppColors.success,
        icon: Icons.inventory_2_rounded,
        onPressed: () {
          ref.read(orderProvider.notifier).markFoodReady(order.id);
        },
      );
    }

    if (status == OrderStatusConstants.readyForPickup) {
      return CustomButton(
        text: 'Verify Pickup Code & Handover',
        color: AppColors.statusPickedUp,
        icon: Icons.qr_code_scanner_rounded,
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
      );
    }

    if (status == OrderStatusConstants.pickedUp || status == OrderStatusConstants.outForDelivery) {
      return CustomButton(
        text: 'Mark as Delivered (Demo)',
        color: AppColors.statusDelivered,
        icon: Icons.task_alt_rounded,
        onPressed: () {
          ref.read(orderProvider.notifier).markDelivered(order.id);
        },
      );
    }

    return const SizedBox.shrink();
  }
}
