import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../demo/demo_data.dart';
import '../models/review_model.dart';

class ReviewState {
  final List<ReviewModel> reviews;
  final bool isLoading;
  final String? error;

  ReviewState({
    required this.reviews,
    this.isLoading = false,
    this.error,
  });

  double get averageRating {
    if (reviews.isEmpty) return 4.8;
    return reviews.fold(0.0, (sum, r) => sum + r.rating) / reviews.length;
  }

  ReviewState copyWith({
    List<ReviewModel>? reviews,
    bool? isLoading,
    String? error,
  }) {
    return ReviewState(
      reviews: reviews ?? this.reviews,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class ReviewNotifier extends StateNotifier<ReviewState> {
  ReviewNotifier() : super(ReviewState(reviews: DemoData.initialReviews));

  void replyToReview(String reviewId, String replyText) {
    final list = List<ReviewModel>.from(state.reviews);
    final index = list.indexWhere((r) => r.id == reviewId);
    if (index != -1) {
      list[index] = list[index].copyWith(
        reply: ReviewReply(text: replyText, repliedAt: 'Just now'),
      );
      state = state.copyWith(reviews: list);
    }
  }
}

final reviewProvider = StateNotifierProvider<ReviewNotifier, ReviewState>((ref) {
  return ReviewNotifier();
});
