class ReviewReply {
  final String text;
  final String repliedAt;

  ReviewReply({
    required this.text,
    required this.repliedAt,
  });

  factory ReviewReply.fromJson(Map<String, dynamic> json) {
    return ReviewReply(
      text: json['text'] as String? ?? '',
      repliedAt: json['repliedAt'] as String? ?? json['replied_at'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'text': text,
      'repliedAt': repliedAt,
    };
  }
}

class ReviewModel {
  final String id;
  final String customerName;
  final double rating;
  final String date;
  final String comment;
  final List<String> orderedItems;
  final ReviewReply? reply;
  final List<String> tags;

  ReviewModel({
    required this.id,
    required this.customerName,
    required this.rating,
    required this.date,
    required this.comment,
    this.orderedItems = const [],
    this.reply,
    this.tags = const [],
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String? ?? '',
      customerName: json['customerName'] as String? ?? json['customer_name'] as String? ?? 'Customer',
      rating: (json['rating'] as num?)?.toDouble() ?? 5.0,
      date: json['date'] as String? ?? '',
      comment: json['comment'] as String? ?? '',
      orderedItems: (json['orderedItems'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      reply: json['reply'] != null ? ReviewReply.fromJson(json['reply'] as Map<String, dynamic>) : null,
      tags: (json['tags'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerName': customerName,
      'rating': rating,
      'date': date,
      'comment': comment,
      'orderedItems': orderedItems,
      'reply': reply?.toJson(),
      'tags': tags,
    };
  }

  ReviewModel copyWith({
    String? id,
    String? customerName,
    double? rating,
    String? date,
    String? comment,
    List<String>? orderedItems,
    ReviewReply? reply,
    List<String>? tags,
  }) {
    return ReviewModel(
      id: id ?? this.id,
      customerName: customerName ?? this.customerName,
      rating: rating ?? this.rating,
      date: date ?? this.date,
      comment: comment ?? this.comment,
      orderedItems: orderedItems ?? this.orderedItems,
      reply: reply ?? this.reply,
      tags: tags ?? this.tags,
    );
  }
}
