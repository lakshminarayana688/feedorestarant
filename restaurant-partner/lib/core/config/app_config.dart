enum AppMode {
  demo,
  production,
}

class AppConfig {
  static const String appName = 'FEEDO Restaurant Partner';
  static const String appVersion = '1.0.0';

  // Default mode is demo for safe presentation/simulation
  static AppMode currentMode = AppMode.demo;

  static bool get isDemo => currentMode == AppMode.demo;
  static bool get isProduction => currentMode == AppMode.production;

  static void setMode(AppMode mode) {
    currentMode = mode;
  }

  // Demo Credentials & Simulation Constants
  static const String demoPhone = '9876543210';
  static const String demoOtp = '123456';
  static const String demoPickupCode = '7284';
  static const String demoRestaurantId = 'rest_001';
}
