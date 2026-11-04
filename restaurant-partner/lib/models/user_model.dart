class UserModel {
  final String id;
  final String phone;
  final String? email;
  final String? name;
  final String role;
  final String? restaurantId;
  final DateTime? lastLoginAt;

  UserModel({
    required this.id,
    required this.phone,
    this.email,
    this.name,
    this.role = 'OWNER',
    this.restaurantId,
    this.lastLoginAt,
  });

  bool get isOwner => role == 'OWNER';
  bool get isManager => role == 'MANAGER' || role == 'OWNER';
  bool get isKitchen => role == 'KITCHEN';

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String?,
      name: json['name'] as String?,
      role: json['role'] as String? ?? 'OWNER',
      restaurantId: json['restaurantId'] as String? ?? json['restaurant_id'] as String?,
      lastLoginAt: json['lastLoginAt'] != null ? DateTime.tryParse(json['lastLoginAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone': phone,
      'email': email,
      'name': name,
      'role': role,
      'restaurantId': restaurantId,
      'lastLoginAt': lastLoginAt?.toIso8601String(),
    };
  }

  UserModel copyWith({
    String? id,
    String? phone,
    String? email,
    String? name,
    String? role,
    String? restaurantId,
    DateTime? lastLoginAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      phone: phone ?? this.phone,
      email: email ?? this.email,
      name: name ?? this.name,
      role: role ?? this.role,
      restaurantId: restaurantId ?? this.restaurantId,
      lastLoginAt: lastLoginAt ?? this.lastLoginAt,
    );
  }
}
