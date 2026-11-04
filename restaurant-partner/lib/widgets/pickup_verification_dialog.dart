import 'package:flutter/material.dart';
import '../core/config/app_config.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_typography.dart';

class PickupVerificationDialog extends StatefulWidget {
  final String orderId;
  final ValueChanged<String> onVerified;

  const PickupVerificationDialog({
    super.key,
    required this.orderId,
    required this.onVerified,
  });

  @override
  State<PickupVerificationDialog> createState() => _PickupVerificationDialogState();
}

class _PickupVerificationDialogState extends State<PickupVerificationDialog> {
  final TextEditingController _codeController = TextEditingController();
  String? _error;

  void _verify() {
    final code = _codeController.text.trim();
    if (code.length != 4) {
      setState(() {
        _error = 'Please enter complete 4-digit pickup code';
      });
      return;
    }

    widget.onVerified(code);
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.primaryLight,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.verified_user_rounded, color: AppColors.primary, size: 22),
          ),
          const SizedBox(width: 12),
          const Text('Verify Pickup Code', style: AppTypography.h3),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Ask the delivery rider for their 4-digit verification code to complete handover for Order #${widget.orderId}:',
            style: AppTypography.bodyMedium,
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _codeController,
            keyboardType: TextInputType.number,
            maxLength: 4,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, letterSpacing: 8),
            decoration: InputDecoration(
              hintText: '••••',
              errorText: _error,
              counterText: '',
            ),
            onChanged: (val) {
              if (_error != null) setState(() => _error = null);
              if (val.length == 4) _verify();
            },
          ),
          if (AppConfig.isDemo) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.infoLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lightbulb_outline, size: 14, color: AppColors.info),
                  SizedBox(width: 6),
                  Text(
                    'Demo Hint: Rider Arun\'s code is 7284',
                    style: TextStyle(fontSize: 11, color: AppColors.info, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _verify,
          style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
          child: const Text('Confirm Handover'),
        ),
      ],
    );
  }
}
