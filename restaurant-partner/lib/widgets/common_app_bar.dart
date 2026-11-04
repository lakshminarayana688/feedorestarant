import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/app_config.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';
import '../providers/app_provider.dart';
import '../providers/restaurant_provider.dart';

class CommonAppBar extends ConsumerWidget implements PreferredSizeWidget {
  final String? title;
  final bool showOnlineToggle;
  final List<Widget>? actions;

  const CommonAppBar({
    super.key,
    this.title,
    this.showOnlineToggle = true,
    this.actions,
  });

  @override
  Size get preferredSize => const Size.fromHeight(64);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final restaurant = ref.watch(restaurantProvider).details;
    final isOnline = restaurant.isOnline;
    final appMode = ref.watch(appModeProvider);

    return AppBar(
      titleSpacing: 16,
      title: title != null
          ? Text(title!, style: AppTypography.h3)
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        restaurant.restaurantName,
                        style: AppTypography.h3,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (appMode == AppMode.demo) ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryLight,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'DEMO',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  '${restaurant.city} • ID: ${restaurant.id ?? "rest_001"}',
                  style: AppTypography.caption,
                ),
              ],
            ),
      actions: [
        if (showOnlineToggle)
          Container(
            margin: const EdgeInsets.only(right: 8),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: isOnline ? AppColors.success : AppColors.textMuted,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 4),
                Text(
                  isOnline ? 'ONLINE' : 'OFFLINE',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: isOnline ? AppColors.success : AppColors.textMuted,
                  ),
                ),
                Transform.scale(
                  scale: 0.75,
                  child: Switch(
                    value: isOnline,
                    activeColor: AppColors.success,
                    onChanged: (val) {
                      ref.read(restaurantProvider.notifier).toggleOnlineStatus(val);
                    },
                  ),
                ),
              ],
            ),
          ),
        ...?actions,
        const SizedBox(width: 8),
      ],
    );
  }
}
