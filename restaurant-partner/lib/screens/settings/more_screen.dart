import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';
import '../../providers/restaurant_provider.dart';
import '../../widgets/common_app_bar.dart';
import '../auth/login_screen.dart';
import '../finance/finance_screen.dart';
import '../profile/kyc_screen.dart';
import '../profile/restaurant_profile_screen.dart';
import '../promotions/promotions_screen.dart';
import '../reviews/reviews_screen.dart';
import 'help_support_screen.dart';
import 'inventory_screen.dart';
import 'settings_screen.dart';

class MoreScreen extends ConsumerWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(restaurantProvider).details;
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: const CommonAppBar(title: 'More Options'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Restaurant Header Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
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
                          Text(restaurant.restaurantName, style: AppTypography.h3),
                          const SizedBox(height: 2),
                          Text(
                            '${user?.role ?? "OWNER"} • ${restaurant.city}',
                            style: AppTypography.subtitle2,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Navigation List
            Card(
              child: Column(
                children: [
                  _buildMenuItem(
                    icon: Icons.local_offer_outlined,
                    title: 'Promotions & Offers',
                    subtitle: 'Manage discount codes and festival campaigns',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const PromotionsScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.inventory_2_outlined,
                    title: 'Inventory & Stock Alert',
                    subtitle: 'Bulk mark items out of stock or update portions',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const InventoryScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.account_balance_wallet_outlined,
                    title: 'Finance & Settlements',
                    subtitle: 'Weekly payout history and instant withdrawals',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const FinanceScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.star_outline_rounded,
                    title: 'Customer Reviews',
                    subtitle: 'View ratings and respond to customer feedback',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ReviewsScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.storefront_outlined,
                    title: 'Restaurant Profile & Address',
                    subtitle: 'Update cuisines, logo, description, and address',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const RestaurantProfileScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.verified_user_outlined,
                    title: 'KYC & Bank Accounts',
                    subtitle: 'FSSAI food license, PAN, and settlement account',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const KycScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.settings_outlined,
                    title: 'Store Settings',
                    subtitle: 'Auto-accept orders, audio alarms, opening hours',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const SettingsScreen()),
                    ),
                  ),
                  const Divider(),
                  _buildMenuItem(
                    icon: Icons.help_outline_rounded,
                    title: 'Help & Partner Support',
                    subtitle: '24/7 dedicated partner helpline and FAQs',
                    onTap: () => Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const HelpSupportScreen()),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Logout Button
            Card(
              child: ListTile(
                leading: const Icon(Icons.logout_rounded, color: AppColors.error),
                title: const Text('Logout Session', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w700)),
                onTap: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(builder: (_) => const LoginScreen()),
                      (route) => false,
                    );
                  }
                },
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.surfaceVariant,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
      subtitle: Text(subtitle, style: AppTypography.caption),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
      onTap: onTap,
    );
  }
}
