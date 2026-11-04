import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'core/config/supabase_config.dart';
import 'services/logger_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize safe crash monitoring & structured logging
  LoggerService().initializeCrashMonitoring();

  // Initialize Supabase client gracefully (offline/demo safe)
  await SupabaseConfig.initialize();

  runApp(
    const ProviderScope(
      child: FeedoPartnerApp(),
    ),
  );
}
