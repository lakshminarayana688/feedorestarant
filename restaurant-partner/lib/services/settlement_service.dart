import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../demo/demo_data.dart';
import '../models/api_response.dart';
import '../models/settlement_model.dart';

class SettlementService {
  final List<SettlementModel> _demoSettlements = List.from(DemoData.initialSettlements);

  Future<ApiResponse<List<SettlementModel>>> getSettlements([String? restaurantId]) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        return ApiResponse.success(_demoSettlements, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final id = restaurantId ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];
      if (id == null) {
        return ApiResponse.success([], mode: 'PRODUCTION');
      }

      final res = await SupabaseConfig.client
          .from('settlements')
          .select()
          .eq('restaurant_id', id)
          .order('date', ascending: false);

      final list = (res as List<dynamic>).map((e) => SettlementModel.fromJson(e)).toList();
      return ApiResponse.success(list, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to fetch settlement records.', details: e.toString());
    }
  }

  Future<ApiResponse<SettlementModel>> createPayout({
    required double amount,
    required String bankAccount,
  }) async {
    try {
      if (AppConfig.isDemo) {
        final commission = amount * 0.18;
        final taxes = commission * 0.18;
        final net = amount - commission - taxes;

        final newSettlement = SettlementModel(
          id: 'set_${DateTime.now().millisecondsSinceEpoch}',
          date: 'Today',
          period: 'Current Batch',
          grossAmount: amount,
          commission: commission,
          taxes: taxes,
          netPayout: net,
          status: 'PROCESSING',
          payoutRef: 'HDFC_REQ_${DateTime.now().millisecondsSinceEpoch}',
        );

        _demoSettlements.insert(0, newSettlement);
        return ApiResponse.success(newSettlement, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client.functions.invoke(
        'process-payout',
        body: {
          'amount': amount,
          'bank_account': bankAccount,
          'idempotency_key': 'payout_${DateTime.now().millisecondsSinceEpoch}',
        },
      );

      if (res.status >= 400) {
        return ApiResponse.failure('Payout processing failed.', code: 'PAYOUT_ERROR');
      }

      return ApiResponse.success(SettlementModel.fromJson(res.data), mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Error submitting payout request.', details: e.toString());
    }
  }
}
