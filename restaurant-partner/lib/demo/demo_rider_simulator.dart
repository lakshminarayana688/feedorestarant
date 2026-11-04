import 'dart:async';
import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../models/order_model.dart';
import 'demo_data.dart';

class DemoRiderSimulator extends StatefulWidget {
  final OrderModel order;
  final VoidCallback? onArrived;
  final VoidCallback? onDelivered;

  const DemoRiderSimulator({
    super.key,
    required this.order,
    this.onArrived,
    this.onDelivered,
  });

  @override
  State<DemoRiderSimulator> createState() => _DemoRiderSimulatorState();
}

class _DemoRiderSimulatorState extends State<DemoRiderSimulator> {
  Timer? _timer;
  int _secondsLeft = 30;
  double _progress = 0.2;

  @override
  void initState() {
    super.initState();
    _startSim();
  }

  void _startSim() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        if (_secondsLeft > 0) {
          _secondsLeft--;
          _progress = (30 - _secondsLeft) / 30.0;
        } else {
          _timer?.cancel();
          if (widget.order.deliveryState == 'RIDER_ASSIGNED') {
            widget.onArrived?.call();
          } else if (widget.order.status == 'OUT_FOR_DELIVERY') {
            widget.onDelivered?.call();
          }
        }
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final rider = widget.order.rider ?? DemoData.demoRider;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundImage: NetworkImage(rider.photoUrl),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      rider.name,
                      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                    ),
                    Text(
                      '${rider.vehicleModel} • ${rider.vehicleNumber}',
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star_rounded, size: 16, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Text(
                      rider.rating.toString(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 12,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          LinearProgressIndicator(
            value: _progress,
            backgroundColor: AppColors.surfaceVariant,
            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
            borderRadius: BorderRadius.circular(4),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'ETA: ${(_secondsLeft / 6).ceil()} mins (${_secondsLeft}s sim)',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primary),
              ),
              Text(
                '${rider.distanceKm} km away',
                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
