class OfferModel {
  final String id;
  final String title;
  final String code;
  final String type; // 'PERCENTAGE', 'FLAT', 'BOGO'
  final double discountValue;
  final double? maxDiscount;
  final double minOrderValue;
  final String validTill;
  final bool isActive;
  final int totalRedemptions;

  OfferModel({
    required this.id,
    required this.title,
    required this.code,
    this.type = 'PERCENTAGE',
    required this.discountValue,
    this.maxDiscount,
    this.minOrderValue = 199.0,
    required this.validTill,
    this.isActive = true,
    this.totalRedemptions = 0,
  });

  factory OfferModel.fromJson(Map<String, dynamic> json) {
    return OfferModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      code: json['code'] as String? ?? '',
      type: json['type'] as String? ?? 'PERCENTAGE',
      discountValue: (json['discountValue'] as num?)?.toDouble() ?? (json['discount_value'] as num?)?.toDouble() ?? 0.0,
      maxDiscount: (json['maxDiscount'] as num?)?.toDouble() ?? (json['max_discount'] as num?)?.toDouble(),
      minOrderValue: (json['minOrderValue'] as num?)?.toDouble() ?? (json['min_order_value'] as num?)?.toDouble() ?? 199.0,
      validTill: json['validTill'] as String? ?? json['valid_till'] as String? ?? '',
      isActive: json['isActive'] as bool? ?? json['is_active'] as bool? ?? true,
      totalRedemptions: json['totalRedemptions'] as int? ?? json['total_redemptions'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'code': code,
      'type': type,
      'discountValue': discountValue,
      'maxDiscount': maxDiscount,
      'minOrderValue': minOrderValue,
      'validTill': validTill,
      'isActive': isActive,
      'totalRedemptions': totalRedemptions,
    };
  }

  OfferModel copyWith({
    String? id,
    String? title,
    String? code,
    String? type,
    double? discountValue,
    double? maxDiscount,
    double? minOrderValue,
    String? validTill,
    bool? isActive,
    int? totalRedemptions,
  }) {
    return OfferModel(
      id: id ?? this.id,
      title: title ?? this.title,
      code: code ?? this.code,
      type: type ?? this.type,
      discountValue: discountValue ?? this.discountValue,
      maxDiscount: maxDiscount ?? this.maxDiscount,
      minOrderValue: minOrderValue ?? this.minOrderValue,
      validTill: validTill ?? this.validTill,
      isActive: isActive ?? this.isActive,
      totalRedemptions: totalRedemptions ?? this.totalRedemptions,
    );
  }
}
