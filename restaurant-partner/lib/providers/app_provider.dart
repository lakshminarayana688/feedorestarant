import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/config/app_config.dart';

class AppModeNotifier extends StateNotifier<AppMode> {
  AppModeNotifier() : super(AppConfig.currentMode);

  void setMode(AppMode mode) {
    AppConfig.setMode(mode);
    state = mode;
  }

  void toggleMode() {
    final next = state == AppMode.demo ? AppMode.production : AppMode.demo;
    setMode(next);
  }
}

final appModeProvider = StateNotifierProvider<AppModeNotifier, AppMode>((ref) {
  return AppModeNotifier();
});

class NavigationIndexNotifier extends StateNotifier<int> {
  NavigationIndexNotifier() : super(0);

  void setIndex(int index) {
    state = index;
  }
}

final navigationIndexProvider = StateNotifierProvider<NavigationIndexNotifier, int>((ref) {
  return NavigationIndexNotifier();
});
