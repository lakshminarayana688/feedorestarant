import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/app_config.dart';
import '../core/theme/app_colors.dart';
import '../providers/app_provider.dart';
import '../providers/order_provider.dart';

class DemoControllerWidget extends ConsumerWidget {
  const DemoControllerWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appMode = ref.watch(appModeProvider);
    if (appMode == AppMode.production) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: AppColors.successLight,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.success.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_done_rounded, size: 16, color: AppColors.success),
            const SizedBox(width: 6),
            const Text(
              'LIVE PRODUCTION MODE (Supabase Cloud)',
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.success),
            ),
            const Spacer(),
            TextButton(
              onPressed: () => ref.read(appModeProvider.notifier).toggleMode(),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('Switch to Demo', style: TextStyle(fontSize: 11)),
            ),
          ],
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.secondary,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.15),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'DEMO CONTROLLER',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Simulate Events',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.cloud_sync, color: Colors.white70, size: 18),
                tooltip: 'Switch to Production Mode',
                onPressed: () => ref.read(appModeProvider.notifier).toggleMode(),
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 18),
                tooltip: 'Reset Demo Data',
                onPressed: () {
                  ref.read(orderProvider.notifier).resetDemoOrders();
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Demo state reset to initial catalog!')),
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildActionChip(
                  icon: Icons.add_circle_outline,
                  label: '+ New Order',
                  color: AppColors.primary,
                  onTap: () {
                    ref.read(orderProvider.notifier).triggerSimulatedNewOrder();
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('🔔 Simulated new incoming order placed!'),
                        backgroundColor: AppColors.primary,
                        duration: Duration(seconds: 2),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 8),
                _buildActionChip(
                  icon: Icons.two_wheeler_rounded,
                  label: 'Arrive Rider',
                  color: AppColors.info,
                  onTap: () {
                    ref.read(orderProvider.notifier).simulateRiderArrival();
                  },
                ),
                const SizedBox(width: 8),
                _buildActionChip(
                  icon: Icons.lock_clock,
                  label: 'Use Code 7284',
                  color: AppColors.warning,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Demo 4-Digit Pickup Code: 7284 (OTP: 123456)'),
                        duration: Duration(seconds: 3),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionChip({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          border: Border.all(color: color.withOpacity(0.4)),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
