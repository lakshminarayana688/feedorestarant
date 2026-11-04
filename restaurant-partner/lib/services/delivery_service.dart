// lib/services/delivery_service.dart
import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../demo/demo_data.dart';
import '../models/api_response.dart';
import '../models/order_model.dart';

/// FEEDO Delivery Service & Fleet Adapter (Flutter)
///
/// Handles authoritative delivery partner tracking, pickup code verification,
/// rider arrival events, and fleet provider abstraction.
class DeliveryService {
  /// Assigns rider to order (In Demo mode uses simulator; In Prod driven by FEEDO Admin / Dispatch engine)
  Future<ApiResponse<DeliveryPartner>> assignRider(String orderId) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        return ApiResponse.success(DemoData.demoRider, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'assign-rider',
        body: {
          'order_id': orderId,
          'action': 'ASSIGN_RIDER',
          'rider_name': 'Arun Kumar',
          'rider_phone': '+919198765432',
          'rider_vehicle_number': 'KA 05 AB 1234',
          'rider_vehicle_model': 'Hero Splendor (Black)',
          'rider_rating': 4.8,
          'rider_eta_minutes': 8,
        },
      );

      if (res.status >= 400) {
        final err = res.data != null && res.data['error'] != null ? res.data['error']['message'] : 'Rider allocation failed';
        return ApiResponse.failure(err.toString(), code: 'RIDER_ERROR');
      }

      final riderData = res.data['data'] != null ? res.data['data']['rider'] : res.data['rider'];
      return ApiResponse.success(DeliveryPartner.fromJson(riderData), mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error allocating delivery partner.', details: e.toString());
    }
  }

  /// Authoritative backend pickup code verification for handover.
  /// (Frontend NEVER authorizes handover on its own)
  Future<ApiResponse<bool>> verifyPickupCode(
    String orderId,
    String code, {
    String? restaurantId,
  }) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        final valid = code.trim() == AppConfig.demoPickupCode || code.trim() == '7284';
        if (valid) {
          return ApiResponse.success(true, mode: 'DEMO');
        } else {
          return ApiResponse.failure('Invalid 4-digit pickup code.', code: 'INVALID_CODE');
        }
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final restId = restaurantId ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];

      final res = await SupabaseConfig.client.functions.invoke(
        'verify-pickup-code',
        body: {
          'order_id': orderId,
          'restaurant_id': restId,
          'pickup_code': code.trim(),
        },
      );

      if (res.status >= 400) {
        final errMsg = res.data != null && res.data['error'] != null ? res.data['error']['message'] : 'Pickup code verification failed';
        return ApiResponse.failure(errMsg.toString(), code: 'INVALID_CODE');
      }

      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error validating pickup code.', details: e.toString());
    }
  }

  /// Records rider arrival at the restaurant counter
  Future<ApiResponse<bool>> recordRiderArrival(String orderId) async {
    try {
      if (AppConfig.isDemo) {
        return ApiResponse.success(true, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'assign-rider',
        body: {
          'order_id': orderId,
          'action': 'RIDER_ARRIVED',
        },
      );

      if (res.status >= 400) {
        return ApiResponse.failure('Failed to record rider arrival.', code: 'ARRIVAL_ERROR');
      }

      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error recording rider arrival.', details: e.toString());
    }
  }
}
