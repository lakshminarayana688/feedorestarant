import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/offer_model.dart';
import '../../providers/offer_provider.dart';
import '../../widgets/common_app_bar.dart';

class PromotionsScreen extends ConsumerWidget {
  const PromotionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final offerState = ref.watch(offerProvider);

    return Scaffold(
      appBar: const CommonAppBar(title: 'Discounts & Offers'),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.local_offer_rounded, color: Colors.white),
        label: const Text('Create Offer', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        onPressed: () => _showCreateOfferDialog(context, ref),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.primary.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.campaign_rounded, color: AppColors.primary, size: 28),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Boost Restaurant Visibility', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        SizedBox(height: 2),
                        Text(
                          'Restaurants with active promotions get up to 35% more orders during lunch & dinner hours.',
                          style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            const Text('Active Promo Codes', style: AppTypography.h3),
            const SizedBox(height: 12),

            ...offerState.offers.map((offer) {
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 6),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.surfaceVariant,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Text(
                              offer.code,
                              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, letterSpacing: 0.5),
                            ),
                          ),
                          Switch(
                            value: offer.isActive,
                            activeColor: AppColors.success,
                            onChanged: (val) {
                              ref.read(offerProvider.notifier).toggleOfferStatus(offer.id, val);
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(offer.title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      const SizedBox(height: 4),
                      Text(
                        'Min Order: ₹${offer.minOrderValue.toStringAsFixed(0)} • Valid till ${offer.validTill}',
                        style: AppTypography.caption,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        '${offer.totalRedemptions} redemptions so far',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.primaryDark),
                      ),
                    ],
                  ),
                ),
              );
            }),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  void _showCreateOfferDialog(BuildContext context, WidgetRef ref) {
    final titleController = TextEditingController();
    final codeController = TextEditingController();
    final discountController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create New Promotion', style: AppTypography.h3),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleController, decoration: const InputDecoration(labelText: 'Offer Title')),
            const SizedBox(height: 10),
            TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Promo Code (e.g. FESTIVE30)')),
            const SizedBox(height: 10),
            TextField(
              controller: discountController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Discount % or Flat ₹ (e.g. 20)'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final title = titleController.text.trim();
              final code = codeController.text.trim();
              final val = double.tryParse(discountController.text) ?? 20.0;
              if (title.isNotEmpty && code.isNotEmpty) {
                ref.read(offerProvider.notifier).addOffer(OfferModel(
                      id: 'off_${DateTime.now().millisecondsSinceEpoch}',
                      title: title,
                      code: code.toUpperCase(),
                      discountValue: val,
                      validTill: '30 Nov 2026',
                    ));
              }
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Launch Offer'),
          ),
        ],
      ),
    );
  }
}
