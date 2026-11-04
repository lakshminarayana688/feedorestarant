import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../demo/demo_data.dart';
import '../models/restaurant_model.dart';
import '../services/restaurant_service.dart';

final restaurantServiceProvider = Provider<RestaurantService>((ref) {
  return RestaurantService();
});

class RestaurantState {
  final RestaurantDetails details;
  final bool isLoading;
  final String? error;

  RestaurantState({
    required this.details,
    this.isLoading = false,
    this.error,
  });

  RestaurantState copyWith({
    RestaurantDetails? details,
    bool? isLoading,
    String? error,
  }) {
    return RestaurantState(
      details: details ?? this.details,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

class RestaurantNotifier extends StateNotifier<RestaurantState> {
  final RestaurantService _service;

  RestaurantNotifier(this._service)
      : super(RestaurantState(details: DemoData.initialRestaurant)) {
    loadRestaurant();
  }

  Future<void> loadRestaurant() async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.getRestaurant();
    if (res.success && res.data != null) {
      state = state.copyWith(details: res.data, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
    }
  }

  Future<bool> toggleOnlineStatus(bool isOnline) async {
    final prev = state.details.isOnline;
    state = state.copyWith(details: state.details.copyWith(isOnline: isOnline));
    final res = await _service.toggleOnlineStatus(isOnline);
    if (!res.success) {
      state = state.copyWith(details: state.details.copyWith(isOnline: prev));
      return false;
    }
    return true;
  }

  Future<bool> updateDetails(RestaurantDetails details) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.updateRestaurant(details);
    if (res.success && res.data != null) {
      state = state.copyWith(details: res.data, isLoading: false);
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }

  Future<bool> submitKyc({required String panNumber, required String fssaiNumber, String? gstNumber}) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.submitKyc(
      panNumber: panNumber,
      fssaiNumber: fssaiNumber,
      gstNumber: gstNumber,
    );
    if (res.success) {
      state = state.copyWith(
        details: state.details.copyWith(
          panNumber: panNumber,
          fssaiNumber: fssaiNumber,
          gstNumber: gstNumber,
          regStatus: 'UNDER_REVIEW',
        ),
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }

  Future<bool> updateBankAccount({required String accountNumber, required String bankName, required String ifscCode}) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.updateBankAccount(
      accountNumber: accountNumber,
      bankName: bankName,
      ifscCode: ifscCode,
    );
    if (res.success) {
      final masked = accountNumber.length > 4
          ? '••••••••${accountNumber.substring(accountNumber.length - 4)}'
          : accountNumber;
      state = state.copyWith(
        details: state.details.copyWith(
          bankAccount: masked,
          bankName: bankName,
          ifscCode: ifscCode,
        ),
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }
}

final restaurantProvider = StateNotifierProvider<RestaurantNotifier, RestaurantState>((ref) {
  final service = ref.watch(restaurantServiceProvider);
  return RestaurantNotifier(service);
});
