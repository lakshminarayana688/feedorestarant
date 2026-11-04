class MenuItemAddOn {
  final String id;
  final String name;
  final double price;

  MenuItemAddOn({
    required this.id,
    required this.name,
    required this.price,
  });

  factory MenuItemAddOn.fromJson(Map<String, dynamic> json) {
    return MenuItemAddOn(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
    };
  }
}

class MenuItemModel {
  final String id;
  final String name;
  final String description;
  final String category;
  final double price;
  final double? discountPrice;
  final String imageUrl;
  final bool isVeg;
  final bool isAvailable;
  final int preparationTimeMinutes;
  final double rating;
  final int votes;
  final bool isBestSeller;
  final List<MenuItemAddOn> addOns;

  MenuItemModel({
    required this.id,
    required this.name,
    required this.description,
    required this.category,
    required this.price,
    this.discountPrice,
    required this.imageUrl,
    this.isVeg = true,
    this.isAvailable = true,
    this.preparationTimeMinutes = 15,
    this.rating = 4.5,
    this.votes = 80,
    this.isBestSeller = false,
    this.addOns = const [],
  });

  factory MenuItemModel.fromJson(Map<String, dynamic> json) {
    return MenuItemModel(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'Main Course',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discountPrice: (json['discountPrice'] as num?)?.toDouble() ?? (json['discount_price'] as num?)?.toDouble(),
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String? ?? '',
      isVeg: json['isVeg'] as bool? ?? json['is_veg'] as bool? ?? true,
      isAvailable: json['isAvailable'] as bool? ?? json['is_available'] as bool? ?? true,
      preparationTimeMinutes: json['preparationTimeMinutes'] as int? ?? json['preparation_time_minutes'] as int? ?? 15,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      votes: json['votes'] as int? ?? 0,
      isBestSeller: json['isBestSeller'] as bool? ?? json['is_best_seller'] as bool? ?? false,
      addOns: (json['addOns'] as List<dynamic>?)
              ?.map((e) => MenuItemAddOn.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'price': price,
      'discountPrice': discountPrice,
      'imageUrl': imageUrl,
      'isVeg': isVeg,
      'isAvailable': isAvailable,
      'preparationTimeMinutes': preparationTimeMinutes,
      'rating': rating,
      'votes': votes,
      'isBestSeller': isBestSeller,
      'addOns': addOns.map((e) => e.toJson()).toList(),
    };
  }

  MenuItemModel copyWith({
    String? id,
    String? name,
    String? description,
    String? category,
    double? price,
    double? discountPrice,
    String? imageUrl,
    bool? isVeg,
    bool? isAvailable,
    int? preparationTimeMinutes,
    double? rating,
    int? votes,
    bool? isBestSeller,
    List<MenuItemAddOn>? addOns,
  }) {
    return MenuItemModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      category: category ?? this.category,
      price: price ?? this.price,
      discountPrice: discountPrice ?? this.discountPrice,
      imageUrl: imageUrl ?? this.imageUrl,
      isVeg: isVeg ?? this.isVeg,
      isAvailable: isAvailable ?? this.isAvailable,
      preparationTimeMinutes: preparationTimeMinutes ?? this.preparationTimeMinutes,
      rating: rating ?? this.rating,
      votes: votes ?? this.votes,
      isBestSeller: isBestSeller ?? this.isBestSeller,
      addOns: addOns ?? this.addOns,
    );
  }
}
