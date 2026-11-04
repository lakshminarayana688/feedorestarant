import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/analytics_model.dart';
import '../services/analytics_service.dart';

final analyticsServiceProvider = Provider<AnalyticsService>((ref) {
  return AnalyticsService();
});

class AnalyticsState {
  final AnalyticsSummary? summary;
  final bool isLoading;
  final String? error;

  AnalyticsState({
    this.summary,
    this.isLoading = false,
    this.error,
  });

  AnalyticsState copyWith({
    AnalyticsSummary? summary,
    bool? isLoading,
    String? error,
  }) {
    return AnalyticsState(
      summary: summary ?? this.summary,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class AnalyticsNotifier extends StateNotifier<AnalyticsState> {
  final AnalyticsService _service;

  AnalyticsNotifier(this._service) : super(AnalyticsState()) {
    loadAnalytics();
  }

  Future<void> loadAnalytics() async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.getAnalyticsSummary();
    if (res.success && res.data != null) {
      state = state.copyWith(summary: res.data, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
    }
  }
}

final analyticsProvider = StateNotifierProvider<AnalyticsNotifier, AnalyticsState>((ref) {
  final service = ref.watch(analyticsServiceProvider);
  return AnalyticsNotifier(service);
});
