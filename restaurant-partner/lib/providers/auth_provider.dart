import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

class AuthState {
  final UserModel? user;
  final bool isLoading;
  final String? error;
  final bool otpSent;
  final String? pendingPhone;

  AuthState({
    this.user,
    this.isLoading = false,
    this.error,
    this.otpSent = false,
    this.pendingPhone,
  });

  bool get isAuthenticated => user != null;

  AuthState copyWith({
    UserModel? user,
    bool? isLoading,
    String? error,
    bool? otpSent,
    String? pendingPhone,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      otpSent: otpSent ?? this.otpSent,
      pendingPhone: pendingPhone ?? this.pendingPhone,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState()) {
    _checkInitialSession();
  }

  Future<void> _checkInitialSession() async {
    state = state.copyWith(isLoading: true);
    final user = await _authService.getSavedSession();
    if (user != null) {
      state = state.copyWith(user: user, isLoading: false);
    } else {
      // Default to demo session for quick presentation
      final demoUser = UserModel(
        id: 'usr_demo_001',
        phone: '9876543210',
        name: 'Lakshmi Narayana',
        email: 'partner@feedofood.com',
        role: 'OWNER',
        restaurantId: 'rest_001',
      );
      state = state.copyWith(user: demoUser, isLoading: false);
    }
  }

  Future<bool> sendOtp(String phone) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _authService.sendOtp(phone);
    if (res.success) {
      state = state.copyWith(isLoading: false, otpSent: true, pendingPhone: phone);
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message ?? 'Failed to send OTP');
      return false;
    }
  }

  Future<bool> verifyOtp(String otp) async {
    final phone = state.pendingPhone ?? '9876543210';
    state = state.copyWith(isLoading: true, error: null);
    final res = await _authService.verifyOtp(phone, otp);
    if (res.success && res.data != null) {
      state = state.copyWith(user: res.data, isLoading: false, otpSent: false, pendingPhone: null);
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message ?? 'Invalid OTP code');
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});
