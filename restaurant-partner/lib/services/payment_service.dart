import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../models/api_response.dart';

class PaymentService {
  /// Fetch authoritative payment status directly from database
  Future<ApiResponse<String>> getPaymentStatus(String orderId) async {
    try {
      if (AppConfig.isDemo) {
        return ApiResponse.success('PAID', mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client
          .from('orders')
          .select('payment_status')
          .eq('id', orderId)
          .single();

      final status = res['payment_status'] as String? ?? 'PENDING';
      return ApiResponse.success(status, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Could not retrieve payment status.', details: e.toString());
    }
  }

  /// Initialize a payment gateway order via backend Edge Function (Secrets are NEVER exposed)
  Future<ApiResponse<Map<String, dynamic>>> createPaymentOrder({
    required String orderId,
    required String restaurantId,
    String paymentMethod = 'UPI',
  }) async {
    try {
      if (AppConfig.isDemo) {
        return ApiResponse.success({
          'order_id': orderId,
          'payment_order_id': 'order_${orderId}_demo',
          'amount': 470,
          'amount_in_paise': 47000,
          'currency': 'INR',
          'key_id': 'rzp_test_feedo_public_key',
          'status': 'PENDING',
        }, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'create-payment-order',
        body: {
          'order_id': orderId,
          'restaurant_id': restaurantId,
          'payment_method': paymentMethod,
        },
      );

      if (res.status >= 400) {
        return ApiResponse.failure('Payment order creation failed.', code: 'PAYMENT_INIT_ERROR');
      }

      return ApiResponse.success(Map<String, dynamic>.from(res.data), mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error initializing payment order.', details: e.toString());
    }
  }
}

