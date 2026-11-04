class OrderItem {
  final String id;
  final String name;
  final String category;
  final double price;
  final int quantity;
  final bool isVeg;
  final String? imageUrl;
  final String? notes;
  final List<String>? addOns;

  OrderItem({
    required this.id,
    required this.name,
    this.category = 'Main Course',
    required this.price,
    this.quantity = 1,
    this.isVeg = true,
    this.imageUrl,
    this.notes,
    this.addOns,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      category: json['category'] as String? ?? 'Main Course',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      isVeg: json['isVeg'] as bool? ?? json['is_veg'] as bool? ?? true,
      imageUrl: json['imageUrl'] as String? ?? json['image_url'] as String?,
      notes: json['notes'] as String?,
      addOns: (json['addOns'] as List<dynamic>?)?.map((e) => e.toString()).toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'category': category,
      'price': price,
      'quantity': quantity,
      'isVeg': isVeg,
      'imageUrl': imageUrl,
      'notes': notes,
      'addOns': addOns,
    };
  }
}

class CustomerInfo {
  final String name;
  final String phoneMasked;
  final String address;
  final String area;
  final double distanceKm;
  final int orderCount;

  CustomerInfo({
    required this.name,
    required this.phoneMasked,
    required this.address,
    this.area = 'Indiranagar',
    this.distanceKm = 2.4,
    this.orderCount = 5,
  });

  factory CustomerInfo.fromJson(Map<String, dynamic> json) {
    return CustomerInfo(
      name: json['name'] as String? ?? 'Customer',
      phoneMasked: json['phoneMasked'] as String? ?? json['phone_masked'] as String? ?? '+91 98*** **123',
      address: json['address'] as String? ?? '',
      area: json['area'] as String? ?? '',
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? (json['distance_km'] as num?)?.toDouble() ?? 2.0,
      orderCount: json['orderCount'] as int? ?? json['order_count'] as int? ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phoneMasked': phoneMasked,
      'address': address,
      'area': area,
      'distanceKm': distanceKm,
      'orderCount': orderCount,
    };
  }
}

class DeliveryPartner {
  final String id;
  final String name;
  final String phoneMasked;
  final String vehicleNumber;
  final String vehicleModel;
  final double rating;
  final double distanceKm;
  final int etaMinutes;
  final String photoUrl;
  final double? latitude;
  final double? longitude;

  DeliveryPartner({
    required this.id,
    required this.name,
    required this.phoneMasked,
    this.vehicleNumber = 'KA 03 HM 4821',
    this.vehicleModel = 'Hero Splendor',
    this.rating = 4.8,
    this.distanceKm = 1.2,
    this.etaMinutes = 5,
    this.photoUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    this.latitude = 12.9716,
    this.longitude = 77.5946,
  });

  factory DeliveryPartner.fromJson(Map<String, dynamic> json) {
    return DeliveryPartner(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Rider',
      phoneMasked: json['phoneMasked'] as String? ?? json['phone_masked'] as String? ?? '+91 98*** **456',
      vehicleNumber: json['vehicleNumber'] as String? ?? json['vehicle_number'] as String? ?? '',
      vehicleModel: json['vehicleModel'] as String? ?? json['vehicle_model'] as String? ?? 'Bike',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      distanceKm: (json['distanceKm'] as num?)?.toDouble() ?? 1.0,
      etaMinutes: json['etaMinutes'] as int? ?? json['eta_minutes'] as int? ?? 5,
      photoUrl: json['photoUrl'] as String? ?? json['photo_url'] as String? ?? '',
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'phoneMasked': phoneMasked,
      'vehicleNumber': vehicleNumber,
      'vehicleModel': vehicleModel,
      'rating': rating,
      'distanceKm': distanceKm,
      'etaMinutes': etaMinutes,
      'photoUrl': photoUrl,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  DeliveryPartner copyWith({
    String? id,
    String? name,
    String? phoneMasked,
    String? vehicleNumber,
    String? vehicleModel,
    double? rating,
    double? distanceKm,
    int? etaMinutes,
    String? photoUrl,
    double? latitude,
    double? longitude,
  }) {
    return DeliveryPartner(
      id: id ?? this.id,
      name: name ?? this.name,
      phoneMasked: phoneMasked ?? this.phoneMasked,
      vehicleNumber: vehicleNumber ?? this.vehicleNumber,
      vehicleModel: vehicleModel ?? this.vehicleModel,
      rating: rating ?? this.rating,
      distanceKm: distanceKm ?? this.distanceKm,
      etaMinutes: etaMinutes ?? this.etaMinutes,
      photoUrl: photoUrl ?? this.photoUrl,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
    );
  }
}

class OrderTimelineEvent {
  final String status;
  final String title;
  final String description;
  final String time;
  final bool completed;
  final bool? current;

  OrderTimelineEvent({
    required this.status,
    required this.title,
    required this.description,
    required this.time,
    this.completed = true,
    this.current,
  });

  factory OrderTimelineEvent.fromJson(Map<String, dynamic> json) {
    return OrderTimelineEvent(
      status: json['status'] as String? ?? '',
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      time: json['time'] as String? ?? '',
      completed: json['completed'] as bool? ?? true,
      current: json['current'] as bool?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'status': status,
      'title': title,
      'description': description,
      'time': time,
      'completed': completed,
      'current': current,
    };
  }
}

class OrderModel {
  final String id;
  final CustomerInfo customer;
  final List<OrderItem> items;
  final double subtotal;
  final double deliveryFee;
  final double platformFee;
  final double taxes;
  final double discount;
  final double total;
  final String paymentStatus; // 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'REFUNDED', 'COD'
  final String paymentMethod;
  final String status; // 'CREATED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'REJECTED', 'CANCELLED'
  final String? deliveryState; // 'UNASSIGNED', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PICKUP_VERIFIED', 'HANDOVER_COMPLETED'
  final String? specialInstructions;
  final String? rejectionReason;
  final String pickupCode;
  final String createdAt;
  final String? acceptedAt;
  final int prepMinutes;
  final String? prepStartedAt;
  final int prepTargetMinutes;
  final String? readyAt;
  final DeliveryPartner? rider;
  final String? riderAssignedAt;
  final String? riderArrivedAt;
  final String? pickedUpAt;
  final String? outForDeliveryAt;
  final String? deliveredAt;
  final bool packagingDone;
  final List<OrderTimelineEvent> timeline;

  OrderModel({
    required this.id,
    required this.customer,
    required this.items,
    required this.subtotal,
    this.deliveryFee = 35.0,
    this.platformFee = 5.0,
    this.taxes = 24.5,
    this.discount = 0.0,
    required this.total,
    this.paymentStatus = 'PAID',
    this.paymentMethod = 'Online (UPI)',
    this.status = 'CREATED',
    this.deliveryState = 'UNASSIGNED',
    this.specialInstructions,
    this.rejectionReason,
    this.pickupCode = '7284',
    required this.createdAt,
    this.acceptedAt,
    this.prepMinutes = 18,
    this.prepStartedAt,
    this.prepTargetMinutes = 20,
    this.readyAt,
    this.rider,
    this.riderAssignedAt,
    this.riderArrivedAt,
    this.pickedUpAt,
    this.outForDeliveryAt,
    this.deliveredAt,
    this.packagingDone = false,
    this.timeline = const [],
  });

  bool get isNew => status == 'CREATED' || status == 'PLACED';
  bool get isPreparing => status == 'ACCEPTED' || status == 'PREPARING' || status == 'RESTAURANT_ACCEPTED';
  bool get isReady => status == 'READY_FOR_PICKUP';
  bool get isPickedUp => status == 'PICKED_UP' || status == 'OUT_FOR_DELIVERY';
  bool get isDelivered => status == 'DELIVERED';
  bool get isCancelled => status == 'CANCELLED' || status == 'REJECTED' || status == 'CUSTOMER_CANCELLED' || status == 'RESTAURANT_REJECTED';

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id'] as String? ?? '',
      customer: CustomerInfo.fromJson(json['customer'] as Map<String, dynamic>? ?? {}),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? (json['delivery_fee'] as num?)?.toDouble() ?? 35.0,
      platformFee: (json['platformFee'] as num?)?.toDouble() ?? (json['platform_fee'] as num?)?.toDouble() ?? 5.0,
      taxes: (json['taxes'] as num?)?.toDouble() ?? 0.0,
      discount: (json['discount'] as num?)?.toDouble() ?? 0.0,
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      paymentStatus: json['paymentStatus'] as String? ?? json['payment_status'] as String? ?? 'PAID',
      paymentMethod: json['paymentMethod'] as String? ?? json['payment_method'] as String? ?? 'UPI',
      status: json['status'] as String? ?? 'CREATED',
      deliveryState: json['deliveryState'] as String? ?? json['delivery_state'] as String? ?? 'UNASSIGNED',
      specialInstructions: json['specialInstructions'] as String? ?? json['special_instructions'] as String?,
      rejectionReason: json['rejectionReason'] as String? ?? json['rejection_reason'] as String?,
      pickupCode: json['pickupCode'] as String? ?? json['pickup_code'] as String? ?? '7284',
      createdAt: json['createdAt'] as String? ?? json['created_at'] as String? ?? DateTime.now().toIso8601String(),
      acceptedAt: json['acceptedAt'] as String? ?? json['accepted_at'] as String?,
      prepMinutes: json['prepMinutes'] as int? ?? json['prep_minutes'] as int? ?? 18,
      prepStartedAt: json['prepStartedAt'] as String? ?? json['prep_started_at'] as String?,
      prepTargetMinutes: json['prepTargetMinutes'] as int? ?? json['prep_target_minutes'] as int? ?? 20,
      readyAt: json['readyAt'] as String? ?? json['ready_at'] as String?,
      rider: json['rider'] != null ? DeliveryPartner.fromJson(json['rider'] as Map<String, dynamic>) : null,
      riderAssignedAt: json['riderAssignedAt'] as String? ?? json['rider_assigned_at'] as String?,
      riderArrivedAt: json['riderArrivedAt'] as String? ?? json['rider_arrived_at'] as String?,
      pickedUpAt: json['pickedUpAt'] as String? ?? json['picked_up_at'] as String?,
      outForDeliveryAt: json['outForDeliveryAt'] as String? ?? json['out_for_delivery_at'] as String?,
      deliveredAt: json['deliveredAt'] as String? ?? json['delivered_at'] as String?,
      packagingDone: json['packagingDone'] as bool? ?? json['packaging_done'] as bool? ?? false,
      timeline: (json['timeline'] as List<dynamic>?)
              ?.map((e) => OrderTimelineEvent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customer': customer.toJson(),
      'items': items.map((e) => e.toJson()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'platformFee': platformFee,
      'taxes': taxes,
      'discount': discount,
      'total': total,
      'paymentStatus': paymentStatus,
      'paymentMethod': paymentMethod,
      'status': status,
      'deliveryState': deliveryState,
      'specialInstructions': specialInstructions,
      'rejectionReason': rejectionReason,
      'pickupCode': pickupCode,
      'createdAt': createdAt,
      'acceptedAt': acceptedAt,
      'prepMinutes': prepMinutes,
      'prepStartedAt': prepStartedAt,
      'prepTargetMinutes': prepTargetMinutes,
      'readyAt': readyAt,
      'rider': rider?.toJson(),
      'riderAssignedAt': riderAssignedAt,
      'riderArrivedAt': riderArrivedAt,
      'pickedUpAt': pickedUpAt,
      'outForDeliveryAt': outForDeliveryAt,
      'deliveredAt': deliveredAt,
      'packagingDone': packagingDone,
      'timeline': timeline.map((e) => e.toJson()).toList(),
    };
  }

  OrderModel copyWith({
    String? id,
    CustomerInfo? customer,
    List<OrderItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? platformFee,
    double? taxes,
    double? discount,
    double? total,
    String? paymentStatus,
    String? paymentMethod,
    String? status,
    String? deliveryState,
    String? specialInstructions,
    String? rejectionReason,
    String? pickupCode,
    String? createdAt,
    String? acceptedAt,
    int? prepMinutes,
    String? prepStartedAt,
    int? prepTargetMinutes,
    String? readyAt,
    DeliveryPartner? rider,
    String? riderAssignedAt,
    String? riderArrivedAt,
    String? pickedUpAt,
    String? outForDeliveryAt,
    String? deliveredAt,
    bool? packagingDone,
    List<OrderTimelineEvent>? timeline,
  }) {
    return OrderModel(
      id: id ?? this.id,
      customer: customer ?? this.customer,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      platformFee: platformFee ?? this.platformFee,
      taxes: taxes ?? this.taxes,
      discount: discount ?? this.discount,
      total: total ?? this.total,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      status: status ?? this.status,
      deliveryState: deliveryState ?? this.deliveryState,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      pickupCode: pickupCode ?? this.pickupCode,
      createdAt: createdAt ?? this.createdAt,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      prepMinutes: prepMinutes ?? this.prepMinutes,
      prepStartedAt: prepStartedAt ?? this.prepStartedAt,
      prepTargetMinutes: prepTargetMinutes ?? this.prepTargetMinutes,
      readyAt: readyAt ?? this.readyAt,
      rider: rider ?? this.rider,
      riderAssignedAt: riderAssignedAt ?? this.riderAssignedAt,
      riderArrivedAt: riderArrivedAt ?? this.riderArrivedAt,
      pickedUpAt: pickedUpAt ?? this.pickedUpAt,
      outForDeliveryAt: outForDeliveryAt ?? this.outForDeliveryAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      packagingDone: packagingDone ?? this.packagingDone,
      timeline: timeline ?? this.timeline,
    );
  }
}
