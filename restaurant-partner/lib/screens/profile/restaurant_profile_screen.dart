import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/restaurant_provider.dart';
import '../../widgets/common_app_bar.dart';
import 'kyc_screen.dart';

class RestaurantProfileScreen extends ConsumerWidget {
  const RestaurantProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(restaurantProvider).details;

    return Scaffold(
      appBar: const CommonAppBar(title: 'Restaurant Profile'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Restaurant Banner & Logo Card
            Card(
              clipBehavior: Clip.antiAlias,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Image.network(
                    restaurant.coverUrl,
                    height: 140,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 28,
                              backgroundImage: NetworkImage(restaurant.logoUrl),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(restaurant.restaurantName, style: AppTypography.h2),
                                  Text(
                                    '${restaurant.restaurantType} • ${restaurant.city}',
                                    style: AppTypography.subtitle2,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(restaurant.description, style: AppTypography.bodyMedium),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 6,
                          children: restaurant.cuisines
                              .map((c) => Chip(
                                    label: Text(c, style: const TextStyle(fontSize: 11)),
                                    backgroundColor: AppColors.surfaceVariant,
                                    padding: EdgeInsets.zero,
                                  ))
                              .toList(),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // KYC Status Notice
            InkWell(
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const KycScreen()),
                );
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.successLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.success.withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_rounded, color: AppColors.success, size: 24),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('KYC Verification: ${restaurant.regStatus}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.success)),
                          const SizedBox(height: 2),
                          const Text('FSSAI & PAN documents verified. Tap to view details.', style: TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right_rounded, color: AppColors.success),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Location & Address Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.location_on_outlined, color: AppColors.primary, size: 20),
                        SizedBox(width: 8),
                        Text('Kitchen Location', style: AppTypography.h3),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(restaurant.address, style: AppTypography.bodyMedium),
                    const SizedBox(height: 4),
                    Text('${restaurant.landmark}, ${restaurant.city} - ${restaurant.pincode}', style: AppTypography.subtitle2),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Owner Details Card
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
                        Text('Owner & Contact Information', style: AppTypography.h3),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildInfoRow('Owner Name', restaurant.ownerName),
                    _buildInfoRow('Phone', restaurant.ownerPhone),
                    _buildInfoRow('Email', restaurant.ownerEmail),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 32),
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
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
        ],
      ),
    );
  }
}
