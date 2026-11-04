import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../models/api_response.dart';
import '../models/user_model.dart';

class AuthService {
  static const String _userPrefKey = 'feedo_partner_user_session';

  Future<ApiResponse<bool>> sendOtp(String phone) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 600));
        return ApiResponse.success(true, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final formattedPhone = phone.startsWith('+91') ? phone : '+91$phone';
      await SupabaseConfig.client.auth.signInWithOtp(phone: formattedPhone);
      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure(
        'Failed to send OTP. Please check your phone number.',
        details: e.toString(),
      );
    }
  }

  Future<ApiResponse<UserModel>> verifyOtp(String phone, String otp) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 600));
        if (otp == AppConfig.demoOtp || otp == '123456') {
          final user = UserModel(
            id: 'usr_demo_001',
            phone: phone.isNotEmpty ? phone : AppConfig.demoPhone,
            name: 'Lakshmi Narayana',
            email: 'partner@feedofood.com',
            role: 'OWNER',
            restaurantId: AppConfig.demoRestaurantId,
            lastLoginAt: DateTime.now(),
          );
          await _saveSession(user);
          return ApiResponse.success(user, mode: 'DEMO');
        } else {
          return ApiResponse.failure('Invalid OTP. In demo mode, please enter 123456.', code: 'INVALID_OTP');
        }
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final formattedPhone = phone.startsWith('+91') ? phone : '+91$phone';
      final res = await SupabaseConfig.client.auth.verifyOTP(
        phone: formattedPhone,
        token: otp,
        type: OtpType.sms,
      );

      if (res.user == null) {
        return ApiResponse.failure('OTP verification failed.', code: 'AUTH_FAILED');
      }

      final user = UserModel(
        id: res.user!.id,
        phone: res.user!.phone ?? phone,
        email: res.user!.email,
        role: (res.user!.userMetadata?['role'] as String?) ?? 'OWNER',
        restaurantId: res.user!.userMetadata?['restaurant_id'] as String?,
        lastLoginAt: DateTime.now(),
      );

      await _saveSession(user);
      return ApiResponse.success(user, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure(
        'OTP verification error: ${e.toString()}',
        details: e.toString(),
      );
    }
  }

  Future<UserModel?> getSavedSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = prefs.getString(_userPrefKey);
      if (jsonStr != null) {
        return UserModel.fromJson(jsonDecode(jsonStr));
      }
    } catch (_) {}
    return null;
  }

  Future<void> _saveSession(UserModel user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_userPrefKey, jsonEncode(user.toJson()));
    } catch (_) {}
  }

  Future<void> logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userPrefKey);
      if (AppConfig.isProduction && SupabaseConfig.isInitialized) {
        await SupabaseConfig.client.auth.signOut();
      }
    } catch (_) {}
  }
}
