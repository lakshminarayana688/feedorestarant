class OpeningHour {
  final String day;
  final bool isOpen;
  final String openTime;
  final String closeTime;

  OpeningHour({
    required this.day,
    this.isOpen = true,
    this.openTime = '11:00 AM',
    this.closeTime = '11:00 PM',
  });

  factory OpeningHour.fromJson(Map<String, dynamic> json) {
    return OpeningHour(
      day: json['day'] as String? ?? 'Monday',
      isOpen: json['isOpen'] as bool? ?? true,
      openTime: json['openTime'] as String? ?? '11:00 AM',
      closeTime: json['closeTime'] as String? ?? '11:00 PM',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'day': day,
      'isOpen': isOpen,
      'openTime': openTime,
      'closeTime': closeTime,
    };
  }

  OpeningHour copyWith({
    String? day,
    bool? isOpen,
    String? openTime,
    String? closeTime,
  }) {
    return OpeningHour(
      day: day ?? this.day,
      isOpen: isOpen ?? this.isOpen,
      openTime: openTime ?? this.openTime,
      closeTime: closeTime ?? this.closeTime,
    );
  }
}

class VerificationDocument {
  final String id;
  final String name;
  final String description;
  final bool isRequired;
  final String status; // 'NOT_UPLOADED', 'UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'
  final String? fileName;
  final String? fileSize;
  final String? uploadedAt;
  final String? previewUrl;

  VerificationDocument({
    required this.id,
    required this.name,
    required this.description,
    this.isRequired = true,
    this.status = 'NOT_UPLOADED',
    this.fileName,
    this.fileSize,
    this.uploadedAt,
    this.previewUrl,
  });

  factory VerificationDocument.fromJson(Map<String, dynamic> json) {
    return VerificationDocument(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      isRequired: json['isRequired'] as bool? ?? true,
      status: json['status'] as String? ?? 'NOT_UPLOADED',
      fileName: json['fileName'] as String?,
      fileSize: json['fileSize'] as String?,
      uploadedAt: json['uploadedAt'] as String?,
      previewUrl: json['previewUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'isRequired': isRequired,
      'status': status,
      'fileName': fileName,
      'fileSize': fileSize,
      'uploadedAt': uploadedAt,
      'previewUrl': previewUrl,
    };
  }
}

class RestaurantDetails {
  final String? id;
  final String ownerName;
  final String ownerPhone;
  final String ownerEmail;
  final String? altPhone;

  final String restaurantName;
  final String restaurantType;
  final List<String> cuisines;
  final String address;
  final String city;
  final String state;
  final String pincode;
  final String landmark;

  final String fssaiNumber;
  final String panNumber;
  final String? gstNumber;
  final String bankAccount;
  final String bankName;
  final String ifscCode;

  final String logoUrl;
  final String coverUrl;
  final String description;
  final double rating;
  final int totalReviews;

  final bool isOnline;
  final bool autoAcceptOrders;
  final bool newOrderSound;
  final List<OpeningHour> openingHours;
  final String regStatus; // 'UNREGISTERED', 'DOCS_SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE'

  RestaurantDetails({
    this.id,
    required this.ownerName,
    required this.ownerPhone,
    required this.ownerEmail,
    this.altPhone,
    required this.restaurantName,
    this.restaurantType = 'Restaurant',
    this.cuisines = const ['Biryani', 'North Indian'],
    required this.address,
    this.city = 'Bengaluru',
    this.state = 'Karnataka',
    this.pincode = '560001',
    this.landmark = 'Near Metro Station',
    this.fssaiNumber = '11223344556677',
    this.panNumber = 'ABCDE1234F',
    this.gstNumber,
    this.bankAccount = '••••••••4321',
    this.bankName = 'HDFC Bank',
    this.ifscCode = 'HDFC0001234',
    this.logoUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
    this.coverUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    this.description = 'Authentic flavours, freshly prepared with secret spices.',
    this.rating = 4.6,
    this.totalReviews = 1248,
    this.isOnline = true,
    this.autoAcceptOrders = false,
    this.newOrderSound = true,
    this.openingHours = const [],
    this.regStatus = 'APPROVED',
  });

  factory RestaurantDetails.fromJson(Map<String, dynamic> json) {
    return RestaurantDetails(
      id: json['id'] as String?,
      ownerName: json['ownerName'] as String? ?? json['owner_name'] as String? ?? '',
      ownerPhone: json['ownerPhone'] as String? ?? json['owner_phone'] as String? ?? '',
      ownerEmail: json['ownerEmail'] as String? ?? json['owner_email'] as String? ?? '',
      altPhone: json['altPhone'] as String? ?? json['alt_phone'] as String?,
      restaurantName: json['restaurantName'] as String? ?? json['name'] as String? ?? 'FEEDO Partner Kitchen',
      restaurantType: json['restaurantType'] as String? ?? 'Restaurant',
      cuisines: (json['cuisines'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? ['Biryani'],
      address: json['address'] as String? ?? '',
      city: json['city'] as String? ?? 'Bengaluru',
      state: json['state'] as String? ?? 'Karnataka',
      pincode: json['pincode'] as String? ?? '',
      landmark: json['landmark'] as String? ?? '',
      fssaiNumber: json['fssaiNumber'] as String? ?? json['fssai_number'] as String? ?? '',
      panNumber: json['panNumber'] as String? ?? json['pan_number'] as String? ?? '',
      gstNumber: json['gstNumber'] as String? ?? json['gst_number'] as String?,
      bankAccount: json['bankAccount'] as String? ?? json['bank_account_number'] as String? ?? '',
      bankName: json['bankName'] as String? ?? json['bank_name'] as String? ?? '',
      ifscCode: json['ifscCode'] as String? ?? json['ifsc_code'] as String? ?? '',
      logoUrl: json['logoUrl'] as String? ?? json['logo_url'] as String? ?? '',
      coverUrl: json['coverUrl'] as String? ?? json['cover_url'] as String? ?? '',
      description: json['description'] as String? ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.5,
      totalReviews: json['totalReviews'] as int? ?? json['total_reviews'] as int? ?? 0,
      isOnline: json['isOnline'] as bool? ?? json['is_online'] as bool? ?? true,
      autoAcceptOrders: json['autoAcceptOrders'] as bool? ?? false,
      newOrderSound: json['newOrderSound'] as bool? ?? true,
      openingHours: (json['openingHours'] as List<dynamic>?)
              ?.map((e) => OpeningHour.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      regStatus: json['regStatus'] as String? ?? json['reg_status'] as String? ?? 'APPROVED',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ownerName': ownerName,
      'ownerPhone': ownerPhone,
      'ownerEmail': ownerEmail,
      'altPhone': altPhone,
      'restaurantName': restaurantName,
      'restaurantType': restaurantType,
      'cuisines': cuisines,
      'address': address,
      'city': city,
      'state': state,
      'pincode': pincode,
      'landmark': landmark,
      'fssaiNumber': fssaiNumber,
      'panNumber': panNumber,
      'gstNumber': gstNumber,
      'bankAccount': bankAccount,
      'bankName': bankName,
      'ifscCode': ifscCode,
      'logoUrl': logoUrl,
      'coverUrl': coverUrl,
      'description': description,
      'rating': rating,
      'totalReviews': totalReviews,
      'isOnline': isOnline,
      'autoAcceptOrders': autoAcceptOrders,
      'newOrderSound': newOrderSound,
      'openingHours': openingHours.map((e) => e.toJson()).toList(),
      'regStatus': regStatus,
    };
  }

  RestaurantDetails copyWith({
    String? id,
    String? ownerName,
    String? ownerPhone,
    String? ownerEmail,
    String? altPhone,
    String? restaurantName,
    String? restaurantType,
    List<String>? cuisines,
    String? address,
    String? city,
    String? state,
    String? pincode,
    String? landmark,
    String? fssaiNumber,
    String? panNumber,
    String? gstNumber,
    String? bankAccount,
    String? bankName,
    String? ifscCode,
    String? logoUrl,
    String? coverUrl,
    String? description,
    double? rating,
    int? totalReviews,
    bool? isOnline,
    bool? autoAcceptOrders,
    bool? newOrderSound,
    List<OpeningHour>? openingHours,
    String? regStatus,
  }) {
    return RestaurantDetails(
      id: id ?? this.id,
      ownerName: ownerName ?? this.ownerName,
      ownerPhone: ownerPhone ?? this.ownerPhone,
      ownerEmail: ownerEmail ?? this.ownerEmail,
      altPhone: altPhone ?? this.altPhone,
      restaurantName: restaurantName ?? this.restaurantName,
      restaurantType: restaurantType ?? this.restaurantType,
      cuisines: cuisines ?? this.cuisines,
      address: address ?? this.address,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      landmark: landmark ?? this.landmark,
      fssaiNumber: fssaiNumber ?? this.fssaiNumber,
      panNumber: panNumber ?? this.panNumber,
      gstNumber: gstNumber ?? this.gstNumber,
      bankAccount: bankAccount ?? this.bankAccount,
      bankName: bankName ?? this.bankName,
      ifscCode: ifscCode ?? this.ifscCode,
      logoUrl: logoUrl ?? this.logoUrl,
      coverUrl: coverUrl ?? this.coverUrl,
      description: description ?? this.description,
      rating: rating ?? this.rating,
      totalReviews: totalReviews ?? this.totalReviews,
      isOnline: isOnline ?? this.isOnline,
      autoAcceptOrders: autoAcceptOrders ?? this.autoAcceptOrders,
      newOrderSound: newOrderSound ?? this.newOrderSound,
      openingHours: openingHours ?? this.openingHours,
      regStatus: regStatus ?? this.regStatus,
    );
  }
}
