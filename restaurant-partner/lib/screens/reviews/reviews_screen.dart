import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../models/review_model.dart';
import '../../providers/review_provider.dart';
import '../../widgets/common_app_bar.dart';

class ReviewsScreen extends ConsumerWidget {
  const ReviewsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewState = ref.watch(reviewProvider);
    final reviews = reviewState.reviews;

    return Scaffold(
      appBar: const CommonAppBar(title: 'Customer Reviews'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Rating Summary Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${reviewState.averageRating.toStringAsFixed(1)} ★',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text('Based on ${reviews.length} ratings', style: AppTypography.caption),
                      ],
                    ),
                    const SizedBox(width: 24),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('98% Positive Feedback', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          SizedBox(height: 4),
                          Text(
                            'Customers love the hygiene, fast prep, and authentic flavors!',
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),

            const Text('Recent Feedback', style: AppTypography.h3),
            const SizedBox(height: 12),

            ...reviews.map((r) => _buildReviewCard(context, ref, r)),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewCard(BuildContext context, WidgetRef ref, ReviewModel r) {
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
                Text(r.customerName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.warningLight,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: AppColors.warning),
                      const SizedBox(width: 2),
                      Text(
                        '${r.rating}',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, color: Color(0xFF92400E)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(r.date, style: AppTypography.caption),
            const SizedBox(height: 10),
            Text(r.comment, style: AppTypography.bodyMedium),
            const SizedBox(height: 10),

            // Tags
            if (r.tags.isNotEmpty) ...[
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: r.tags.map((t) => Chip(
                      label: Text(t, style: const TextStyle(fontSize: 10)),
                      padding: EdgeInsets.zero,
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      backgroundColor: AppColors.surfaceVariant,
                    )).toList(),
              ),
              const SizedBox(height: 10),
            ],

            // Reply section
            if (r.reply != null) ...[
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.surfaceVariant,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Partner Response:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                    const SizedBox(height: 2),
                    Text(r.reply!.text, style: const TextStyle(fontSize: 12)),
                  ],
                ),
              ),
            ] else ...[
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => _showReplyDialog(context, ref, r.id),
                  icon: const Icon(Icons.reply_rounded, size: 16),
                  label: const Text('Reply to Customer', style: TextStyle(fontSize: 12)),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showReplyDialog(BuildContext context, WidgetRef ref, String reviewId) {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Reply to Review', style: AppTypography.h3),
        content: TextField(
          controller: controller,
          maxLines: 3,
          decoration: const InputDecoration(hintText: 'Write a polite thank you or acknowledgment...'),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              final text = controller.text.trim();
              if (text.isNotEmpty) {
                ref.read(reviewProvider.notifier).replyToReview(reviewId, text);
              }
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            child: const Text('Post Reply'),
          ),
        ],
      ),
    );
  }
}
