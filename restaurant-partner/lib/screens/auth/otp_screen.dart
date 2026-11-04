import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/config/app_config.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_button.dart';

class OtpScreen extends ConsumerStatefulWidget {
  final String phone;

  const OtpScreen({super.key, required this.phone});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final TextEditingController _otpController = TextEditingController();
  int _secondsRemaining = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    if (AppConfig.isDemo) {
      _otpController.text = AppConfig.demoOtp;
    }
    _startCountdown();
  }

  void _startCountdown() {
    _secondsRemaining = 30;
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_secondsRemaining > 0) {
          _secondsRemaining--;
        } else {
          _timer?.cancel();
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _handleVerify() async {
    final otp = _otpController.text.trim();
    if (otp.length < 6) return;

    final success = await ref.read(authProvider.notifier).verifyOtp(otp);
    if (success && mounted) {
      Navigator.of(context).popUntil((route) => route.isFirst);
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Enter 6-Digit OTP', style: AppTypography.h1),
              const SizedBox(height: 8),
              RichText(
                text: TextSpan(
                  style: AppTypography.subtitle1,
                  children: [
                    const TextSpan(text: 'We sent a verification code to '),
                    TextSpan(
                      text: '+91 ${widget.phone}',
                      style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // OTP Field
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, letterSpacing: 12),
                decoration: InputDecoration(
                  hintText: '••••••',
                  counterText: '',
                  errorText: authState.error,
                ),
                onChanged: (val) {
                  if (val.length == 6) _handleVerify();
                },
              ),

              if (AppConfig.isDemo) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.key_rounded, size: 16, color: AppColors.primary),
                      const SizedBox(width: 8),
                      const Expanded(
                        child: Text(
                          'Demo Mode OTP is: 123456',
                          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                        ),
                      ),
                      TextButton(
                        onPressed: () => _otpController.text = AppConfig.demoOtp,
                        style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: Size.zero),
                        child: const Text('Auto-Fill', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    _secondsRemaining > 0
                        ? 'Resend OTP in ${_secondsRemaining}s'
                        : 'Didn\'t receive code?',
                    style: AppTypography.bodySmall,
                  ),
                  TextButton(
                    onPressed: _secondsRemaining == 0
                        ? () {
                            ref.read(authProvider.notifier).sendOtp(widget.phone);
                            _startCountdown();
                          }
                        : null,
                    child: const Text('Resend Code'),
                  ),
                ],
              ),

              const SizedBox(height: 32),
              CustomButton(
                text: 'Verify & Continue',
                isLoading: authState.isLoading,
                onPressed: _handleVerify,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
