import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../demo/demo_data.dart';
import '../models/settlement_model.dart';
import '../services/settlement_service.dart';

final settlementServiceProvider = Provider<SettlementService>((ref) {
  return SettlementService();
});

class FinanceState {
  final List<SettlementModel> settlements;
  final bool isLoading;
  final String? error;

  FinanceState({
    required this.settlements,
    this.isLoading = false,
    this.error,
  });

  double get totalSettled => settlements
      .where((s) => s.status == 'SETTLED')
      .fold(0.0, (sum, s) => sum + s.netPayout);

  double get pendingPayout => settlements
      .where((s) => s.status == 'PROCESSING')
      .fold(0.0, (sum, s) => sum + s.netPayout);

  FinanceState copyWith({
    List<SettlementModel>? settlements,
    bool? isLoading,
    String? error,
  }) {
    return FinanceState(
      settlements: settlements ?? this.settlements,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class FinanceNotifier extends StateNotifier<FinanceState> {
  final SettlementService _service;

  FinanceNotifier(this._service)
      : super(FinanceState(settlements: DemoData.initialSettlements)) {
    loadSettlements();
  }

  Future<void> loadSettlements() async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.getSettlements();
    if (res.success && res.data != null) {
      state = state.copyWith(settlements: res.data, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
    }
  }

  Future<bool> requestInstantPayout(double amount, String bankAccount) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.createPayout(amount: amount, bankAccount: bankAccount);
    if (res.success && res.data != null) {
      state = state.copyWith(
        settlements: [res.data!, ...state.settlements],
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }
}

final financeProvider = StateNotifierProvider<FinanceNotifier, FinanceState>((ref) {
  final service = ref.watch(settlementServiceProvider);
  return FinanceNotifier(service);
});
