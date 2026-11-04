import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../demo/demo_data.dart';
import '../models/menu_item_model.dart';
import '../services/menu_service.dart';

final menuServiceProvider = Provider<MenuService>((ref) {
  return MenuService();
});

class MenuState {
  final List<MenuItemModel> items;
  final bool isLoading;
  final String? error;
  final String selectedCategory;

  MenuState({
    required this.items,
    this.isLoading = false,
    this.error,
    this.selectedCategory = 'All',
  });

  List<String> get categories {
    final set = {'All'};
    for (final i in items) {
      set.add(i.category);
    }
    return set.toList();
  }

  List<MenuItemModel> get filteredItems {
    if (selectedCategory == 'All') return items;
    return items.where((i) => i.category == selectedCategory).toList();
  }

  MenuState copyWith({
    List<MenuItemModel>? items,
    bool? isLoading,
    String? error,
    String? selectedCategory,
  }) {
    return MenuState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      selectedCategory: selectedCategory ?? this.selectedCategory,
    );
  }
}

class MenuNotifier extends StateNotifier<MenuState> {
  final MenuService _service;

  MenuNotifier(this._service)
      : super(MenuState(items: DemoData.initialMenuItems)) {
    loadMenu();
  }

  void setCategory(String category) {
    state = state.copyWith(selectedCategory: category);
  }

  Future<void> loadMenu() async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.getMenuItems();
    if (res.success && res.data != null) {
      state = state.copyWith(items: res.data, isLoading: false);
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
    }
  }

  Future<bool> toggleAvailability(String itemId, bool isAvailable) async {
    final list = List<MenuItemModel>.from(state.items);
    final index = list.indexWhere((i) => i.id == itemId);
    if (index != -1) {
      final prev = list[index];
      list[index] = prev.copyWith(isAvailable: isAvailable);
      state = state.copyWith(items: list);

      final res = await _service.toggleItemAvailability(itemId, isAvailable);
      if (!res.success) {
        list[index] = prev;
        state = state.copyWith(items: list);
        return false;
      }
      return true;
    }
    return false;
  }

  Future<bool> addItem(MenuItemModel item) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.addMenuItem(item);
    if (res.success && res.data != null) {
      state = state.copyWith(
        items: [...state.items, res.data!],
        isLoading: false,
      );
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }

  Future<bool> updateItem(MenuItemModel item) async {
    state = state.copyWith(isLoading: true, error: null);
    final res = await _service.updateMenuItem(item);
    if (res.success && res.data != null) {
      final list = List<MenuItemModel>.from(state.items);
      final index = list.indexWhere((i) => i.id == item.id);
      if (index != -1) {
        list[index] = res.data!;
      }
      state = state.copyWith(items: list, isLoading: false);
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: res.error?.message);
      return false;
    }
  }

  Future<bool> deleteItem(String itemId) async {
    final res = await _service.deleteMenuItem(itemId);
    if (res.success) {
      state = state.copyWith(
        items: state.items.where((i) => i.id != itemId).toList(),
      );
      return true;
    }
    return false;
  }
}

final menuProvider = StateNotifierProvider<MenuNotifier, MenuState>((ref) {
  final service = ref.watch(menuServiceProvider);
  return MenuNotifier(service);
});
