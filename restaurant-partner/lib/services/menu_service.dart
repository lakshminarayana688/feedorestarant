import '../core/config/app_config.dart';
import '../core/config/supabase_config.dart';
import '../demo/demo_data.dart';
import '../models/api_response.dart';
import '../models/menu_item_model.dart';

class MenuService {
  final List<MenuItemModel> _demoItems = List.from(DemoData.initialMenuItems);

  Future<ApiResponse<List<MenuItemModel>>> getMenuItems([String? restaurantId]) async {
    try {
      if (AppConfig.isDemo) {
        await Future.delayed(const Duration(milliseconds: 300));
        return ApiResponse.success(_demoItems, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final id = restaurantId ?? SupabaseConfig.client.auth.currentUser?.userMetadata?['restaurant_id'];
      if (id == null) {
        return ApiResponse.success([], mode: 'PRODUCTION');
      }

      final res = await SupabaseConfig.client
          .from('menu_items')
          .select()
          .eq('restaurant_id', id)
          .order('name');

      final list = (res as List<dynamic>).map((e) => MenuItemModel.fromJson(e)).toList();
      return ApiResponse.success(list, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to load menu items.', details: e.toString());
    }
  }

  Future<ApiResponse<MenuItemModel>> addMenuItem(MenuItemModel item) async {
    try {
      if (AppConfig.isDemo) {
        _demoItems.add(item);
        return ApiResponse.success(item, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client
          .from('menu_items')
          .insert(item.toJson())
          .select()
          .single();

      return ApiResponse.success(MenuItemModel.fromJson(res), mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to add dish to menu.', details: e.toString());
    }
  }

  Future<ApiResponse<MenuItemModel>> updateMenuItem(MenuItemModel item) async {
    try {
      if (AppConfig.isDemo) {
        final index = _demoItems.indexWhere((i) => i.id == item.id);
        if (index != -1) {
          _demoItems[index] = item;
        }
        return ApiResponse.success(item, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      final res = await SupabaseConfig.client
          .from('menu_items')
          .update(item.toJson())
          .eq('id', item.id)
          .select()
          .single();

      return ApiResponse.success(MenuItemModel.fromJson(res), mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to update dish details.', details: e.toString());
    }
  }

  Future<ApiResponse<bool>> deleteMenuItem(String itemId) async {
    try {
      if (AppConfig.isDemo) {
        _demoItems.removeWhere((i) => i.id == itemId);
        return ApiResponse.success(true, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      await SupabaseConfig.client.from('menu_items').delete().eq('id', itemId);
      return ApiResponse.success(true, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to delete item.', details: e.toString());
    }
  }

  Future<ApiResponse<bool>> toggleItemAvailability(String itemId, bool isAvailable) async {
    try {
      if (AppConfig.isDemo) {
        final index = _demoItems.indexWhere((i) => i.id == itemId);
        if (index != -1) {
          _demoItems[index] = _demoItems[index].copyWith(isAvailable: isAvailable);
        }
        return ApiResponse.success(isAvailable, mode: 'DEMO');
      }

      if (!SupabaseConfig.isInitialized) {
        await SupabaseConfig.initialize();
      }

      await SupabaseConfig.client
          .from('menu_items')
          .update({'is_available': isAvailable})
          .eq('id', itemId);

      return ApiResponse.success(isAvailable, mode: 'PRODUCTION');
    } catch (e) {
      return ApiResponse.failure('Failed to update availability.', details: e.toString());
    }
  }
}
