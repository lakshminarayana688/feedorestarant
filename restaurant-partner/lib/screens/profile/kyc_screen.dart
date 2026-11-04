import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../providers/restaurant_provider.dart';
import '../../widgets/custom_button.dart';

class KycScreen extends ConsumerStatefulWidget {
  const KycScreen({super.key});

  @override
  ConsumerState<KycScreen> createState() => _KycScreenState();
}

class _KycScreenState extends ConsumerState<KycScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _panController;
  late TextEditingController _fssaiController;
  late TextEditingController _gstController;

  @override
  void initState() {
    super.initState();
    final rest = ref.read(restaurantProvider).details;
    _panController = TextEditingController(text: rest.panNumber);
    _fssaiController = TextEditingController(text: rest.fssaiNumber);
    _gstController = TextEditingController(text: rest.gstNumber ?? '');
  }

  @override
  void dispose() {
    _panController.dispose();
    _fssaiController.dispose();
    _gstController.dispose();
    super.dispose();
  }

  void _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    final success = await ref.read(restaurantProvider.notifier).submitKyc(
          panNumber: _panController.text.trim(),
          fssaiNumber: _fssaiController.text.trim(),
          gstNumber: _gstController.text.trim().isNotEmpty ? _gstController.text.trim() : null,
        );

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('KYC documents submitted for verification!'),
          backgroundColor: AppColors.success,
        ),
      );
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final rest = ref.watch(restaurantProvider).details;

    return Scaffold(
      appBar: AppBar(title: const Text('KYC & Verification', style: AppTypography.h3)),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppColors.infoLight,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.info.withOpacity(0.2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.shield_outlined, color: AppColors.info, size: 28),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'All documents are encrypted with AES-256 and stored in compliant Supabase backend vaults. Zero client exposure.',
                        style: TextStyle(fontSize: 12, color: AppColors.info, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              const Text('FSSAI Food License Number *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _fssaiController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(hintText: '14-digit FSSAI number (e.g. 11223344556677)'),
                validator: (val) => val == null || val.trim().isEmpty ? 'FSSAI number is required' : null,
              ),
              const SizedBox(height: 16),

              const Text('Business / Owner PAN Number *', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _panController,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(hintText: '10-character PAN (e.g. ABCDE1234F)'),
                validator: (val) => val == null || val.trim().isEmpty ? 'PAN is required' : null,
              ),
              const SizedBox(height: 16),

              const Text('GSTIN Number (Optional)', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _gstController,
                textCapitalization: TextCapitalization.characters,
                decoration: const InputDecoration(hintText: '15-digit GSTIN (e.g. 29ABCDE1234F1Z5)'),
              ),
              const SizedBox(height: 24),

              // Linked Settlement Account Display
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Settlement Bank Account', style: AppTypography.h3),
                      const SizedBox(height: 10),
                      _buildDetailRow('Bank Name', rest.bankName),
                      _buildDetailRow('Account Number', rest.bankAccount),
                      _buildDetailRow('IFSC Code', rest.ifscCode),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 32),

              CustomButton(
                text: 'Save & Update KYC',
                onPressed: _handleSubmit,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
        ],
      ),
    );
  }
}
