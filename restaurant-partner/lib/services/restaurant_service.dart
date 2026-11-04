import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../demo/demo_data.dart';
import '../models/api_response.dart';
import '../models/restaurant_model.dart';

class RestaurantService {
  RestaurantDetails _cachedDetails = DemoData.initialRestaurant;

  Future<ApiResponse<RestaurantDetails>> getRestaurant([String? restaurantId]) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 400));
        return ApiResponse.success(_cachedDetails, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final id = restaurantId ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];
      if (id == null) {
        return ApiResponse.failure('Restaurant ID not found in current session.', code: 'NOT_FOUND');
      }

      final res = await SupabaseConfig.client
          .from('restaurants')
          .select()
          .eq('id', id)
          .single();

      final details = RestaurantDetails.fromJson(res);
      _cachedDetails = details;
      return ApiResponse.success(details, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure(
        'Failed to fetch restaurant details.',
        details: e.toString(),
      );
    }
  }

  Future<ApiResponse<RestaurantDetails>> updateRestaurant(RestaurantDetails details) async {
    try {
      _cachedDetails = details;

      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 500));
        return ApiResponse.success(_cachedDetails, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'update-restaurant',
        body: details.toJson(),
      );

      if (res.status >= 400) {
        return ApiResponse.failure('Failed to update restaurant profile.', code: 'SERVER_ERROR');
      }

      return ApiResponse.success(details, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure(
        'Error updating restaurant details.',
        details: e.toString(),
      );
    }
  }

  Future<ApiResponse<bool>> toggleOnlineStatus(bool isOnline) async {
    try {
      _cachedDetails = _cachedDetails.copyWith(isOnline: isOnline);

      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        return ApiResponse.success(isOnline, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final id = _cachedDetails.id ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];
      if (id != null) {
        await SupabaseConfig.client
            .from('restaurants')
            .update({'is_online': isOnline})
            .eq('id', id);
      }

      return ApiResponse.success(isOnline, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to toggle operational status.', details: e.toString());
    }
  }

  Future<ApiResponse<bool>> submitKyc({
    required String panNumber,
    required String fssaiNumber,
    String? gstNumber,
  }) async {
    try {
      _cachedDetails = _cachedDetails.copyWith(
        panNumber: panNumber,
        fssaiNumber: fssaiNumber,
        gstNumber: gstNumber,
        regStatus: 'UNDER_REVIEW',
      );

      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 600));
        return ApiResponse.success(true, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'submit-kyc',
        body: {
          'pan_number': panNumber,
          'fssai_number': fssaiNumber,
          'gst_number': gstNumber,
        },
      );

      if (res.status >= 400) {
        return ApiResponse.failure('KYC submission failed.', code: 'KYC_FAILED');
      }

      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error submitting KYC documents.', details: e.toString());
    }
  }

  Future<ApiResponse<bool>> updateBankAccount({
    required String accountNumber,
    required String bankName,
    required String ifscCode,
  }) async {
    try {
      final masked = accountNumber.length > 4
          ? '••••••••${accountNumber.substring(accountNumber.length - 4)}'
          : accountNumber;

      _cachedDetails = _cachedDetails.copyWith(
        bankAccount: masked,
        bankName: bankName,
        ifscCode: ifscCode,
      );

      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 500));
        return ApiResponse.success(true, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'update-bank-account',
        body: {
          'account_number': accountNumber,
          'bank_name': bankName,
          'ifsc_code': ifscCode,
        },
      );

      if (res.status >= 400) {
        return ApiResponse.failure('Bank account update failed.', code: 'BANK_UPDATE_FAILED');
      }

      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error updating bank credentials.', details: e.toString());
    }
  }
}
