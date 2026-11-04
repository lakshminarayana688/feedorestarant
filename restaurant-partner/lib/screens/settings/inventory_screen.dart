import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/menu_provider.dart';

class InventoryScreen extends ConsumerWidget {
  const InventoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final menuState = ref.watch(menuProvider);
    final items = menuState.items;
    final outOfStockCount = items.where((i) => !i.isAvailable).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory & Stock', style: AppTypography.h3),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: outOfStockCount > 0 ? AppColors.warningLight : AppColors.successLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: outOfStockCount > 0
                      ? AppColors.warning.withOpacity(0.3)
                      : AppColors.success.withOpacity(0.3),
                ),
              ),
              child: Row(
                children: [
                  Icon(
                    outOfStockCount > 0 ? Icons.warning_amber_rounded : Icons.check_circle_outline_rounded,
                    color: outOfStockCount > 0 ? AppColors.warning : AppColors.success,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      outOfStockCount > 0
                          ? '$outOfStockCount dishes currently marked OUT OF STOCK'
                          : 'All menu items are currently IN STOCK and available to order!',
                      style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                        color: outOfStockCount > 0 ? const Color(0xFF92400E) : AppColors.success,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Fast Stock Toggle', style: AppTypography.h3),
            const SizedBox(height: 8),
            const Text(
              'Toggle items OFF immediately if ingredients run out during peak hours.',
              style: AppTypography.caption,
            ),
            const SizedBox(height: 12),

            Card(
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return SwitchListTile(
                    title: Row(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(
                            border: Border.all(
                              color: item.isVeg ? AppColors.veg : AppColors.nonVeg,
                              width: 1.5,
                            ),
                            borderRadius: BorderRadius.circular(2),
                          ),
                          child: Center(
                            child: Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                color: item.isVeg ? AppColors.veg : AppColors.nonVeg,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            item.name,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                              color: item.isAvailable ? AppColors.textPrimary : AppColors.textMuted,
                            ),
                          ),
                        ),
                      ],
                    ),
                    subtitle: Text(
                      '${item.category} • ₹${item.price.toStringAsFixed(0)}',
                      style: AppTypography.caption,
                    ),
                    value: item.isAvailable,
                    activeColor: AppColors.success,
                    onChanged: (val) {
                      ref.read(menuProvider.notifier).toggleAvailability(item.id, val);
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}
