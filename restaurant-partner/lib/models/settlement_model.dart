class SettlementModel {
  final String id;
  final String date;
  final String period;
  final double grossAmount;
  final double commission;
  final double taxes;
  final double netPayout;
  final String status; // 'SETTLED', 'PROCESSING', 'UPCOMING'
  final String payoutRef;

  SettlementModel({
    required this.id,
    required this.date,
    required this.period,
    required this.grossAmount,
    required this.commission,
    required this.taxes,
    required this.netPayout,
    this.status = 'SETTLED',
    required this.payoutRef,
  });

  factory SettlementModel.fromJson(Map<String, dynamic> json) {
    return SettlementModel(
      id: json['id'] as String? ?? '',
      date: json['date'] as String? ?? '',
      period: json['period'] as String? ?? '',
      grossAmount: (json['grossAmount'] as num?)?.toDouble() ?? (json['gross_amount'] as num?)?.toDouble() ?? 0.0,
      commission: (json['commission'] as num?)?.toDouble() ?? 0.0,
      taxes: (json['taxes'] as num?)?.toDouble() ?? 0.0,
      netPayout: (json['netPayout'] as num?)?.toDouble() ?? (json['net_payout'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'SETTLED',
      payoutRef: json['payoutRef'] as String? ?? json['payout_ref'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'period': period,
      'grossAmount': grossAmount,
      'commission': commission,
      'taxes': taxes,
      'netPayout': netPayout,
      'status': status,
      'payoutRef': payoutRef,
    };
  }
}
