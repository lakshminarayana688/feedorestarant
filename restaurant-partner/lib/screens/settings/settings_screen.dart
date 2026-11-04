import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/restaurant_provider.dart';
import '../../services/order_sound_service.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(restaurantProvider).details;

    return Scaffold(
      appBar: AppBar(title: const Text('Store Settings', style: AppTypography.h3)),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Order Notifications & Audio Alerts', style: AppTypography.h3),
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Column(
                  children: [
                    SwitchListTile(
                      title: const Text('New Order Sound Alert', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      subtitle: const Text('Play distinctive restaurant chime when new order is assigned', style: AppTypography.caption),
                      activeColor: AppColors.primary,
                      value: restaurant.newOrderSound,
                      onChanged: (val) {
                        OrderSoundService().setSoundEnabled(val);
                        ref.read(restaurantProvider.notifier).updateDetails(
                              restaurant.copyWith(newOrderSound: val),
                            );
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(val ? 'Order sound alert enabled' : 'Order sound muted'),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                    ),
                    const Divider(),
                    ListTile(
                      title: const Text('Notification Sound', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      subtitle: const Text('FEEDO Distinct Harmonic Chime (E5-G5-C6-E6)', style: AppTypography.caption),
                      trailing: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        onPressed: () async {
                          await OrderSoundService().testSound();
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('🔔 Playing FEEDO order alert sound'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          }
                        },
                        icon: const Icon(Icons.volume_up_rounded, size: 16),
                        label: const Text('Test Sound', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const Divider(),
                    SwitchListTile(
                      title: const Text('Auto-Accept Orders', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      subtitle: const Text('Automatically accept new orders without manual kitchen confirmation', style: AppTypography.caption),
                      activeColor: AppColors.primary,
                      value: restaurant.autoAcceptOrders,
                      onChanged: (val) {
                        ref.read(restaurantProvider.notifier).updateDetails(
                              restaurant.copyWith(autoAcceptOrders: val),
                            );
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),


            const Text('Weekly Operating Hours', style: AppTypography.h3),
            const SizedBox(height: 12),
            Card(
              child: Column(
                children: restaurant.openingHours.map((h) {
                  return ListTile(
                    title: Text(h.day, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    trailing: Text(
                      h.isOpen ? '${h.openTime} - ${h.closeTime}' : 'Closed',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: h.isOpen ? AppColors.textPrimary : AppColors.error,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 24),

            // System Information
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('App Information', style: AppTypography.h3),
                    const SizedBox(height: 8),
                    _buildInfoRow('Version', AppConfig.appVersion),
                    _buildInfoRow('Mode', AppConfig.isDemo ? 'DEMO MODE (Offline Simulation)' : 'PRODUCTION (Supabase Cloud)'),
                    _buildInfoRow('Architecture', 'Flutter 3.47 + Dart 3.13 + Riverpod'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
        ],
      ),
    );
  }
}
