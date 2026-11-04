import 'package:flutter/material.dart';
import '../core/constants/order_status_constants.dart';
import '../core/theme/app_colors.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final bool isSmall;

  const StatusBadge({
    super.key,
    required this.status,
    this.isSmall = false,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    IconData icon;
    String label = OrderStatusConstants.getDisplayLabel(status);

    switch (status) {
      case OrderStatusConstants.created:
      case 'PLACED':
        bg = AppColors.primaryLight;
        fg = AppColors.primary;
        icon = Icons.fiber_new_rounded;
        break;
      case OrderStatusConstants.accepted:
      case OrderStatusConstants.restaurantAccepted:
        bg = AppColors.infoLight;
        fg = AppColors.info;
        icon = Icons.check_circle_outline_rounded;
        break;
      case OrderStatusConstants.preparing:
        bg = const Color(0xFFF3E8FF);
        fg = AppColors.statusPreparing;
        icon = Icons.soup_kitchen_rounded;
        break;
      case OrderStatusConstants.readyForPickup:
        bg = AppColors.successLight;
        fg = AppColors.success;
        icon = Icons.inventory_2_rounded;
        break;
      case OrderStatusConstants.pickedUp:
      case OrderStatusConstants.outForDelivery:
        bg = const Color(0xFFE0F2FE);
        fg = AppColors.statusPickedUp;
        icon = Icons.delivery_dining_rounded;
        break;
      case OrderStatusConstants.delivered:
        bg = AppColors.successLight;
        fg = AppColors.statusDelivered;
        icon = Icons.task_alt_rounded;
        break;
      case OrderStatusConstants.rejected:
      case OrderStatusConstants.restaurantRejected:
      case OrderStatusConstants.cancelled:
      case OrderStatusConstants.customerCancelled:
        bg = AppColors.errorLight;
        fg = AppColors.error;
        icon = Icons.cancel_outlined;
        break;
      default:
        bg = AppColors.surfaceVariant;
        fg = AppColors.textSecondary;
        icon = Icons.info_outline;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: isSmall ? 12 : 14, color: fg),
          const SizedBox(width: 4),
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: isSmall ? 10 : 11,
              fontWeight: FontWeight.w700,
              color: fg,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
