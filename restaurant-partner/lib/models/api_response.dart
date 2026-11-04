class ApiResponse<T> {
  final bool success;
  final T? data;
  final ApiError? error;
  final ApiMetadata? metadata;

  ApiResponse({
    required this.success,
    this.data,
    this.error,
    this.metadata,
  });

  factory ApiResponse.success(T data, {String? mode}) {
    return ApiResponse<T>(
      success: true,
      data: data,
      metadata: ApiMetadata(
        timestamp: DateTime.now().toIso8601String(),
        mode: mode ?? 'DEMO',
      ),
    );
  }

  factory ApiResponse.failure(String message, {String code = 'API_ERROR', dynamic details}) {
    return ApiResponse<T>(
      success: false,
      error: ApiError(code: code, message: message, details: details),
      metadata: ApiMetadata(
        timestamp: DateTime.now().toIso8601String(),
        mode: 'DEMO',
      ),
    );
  }
}

class ApiError {
  final String code;
  final String message;
  final dynamic details;

  ApiError({
    required this.code,
    required this.message,
    this.details,
  });

  factory ApiError.fromJson(Map<String, dynamic> json) {
    return ApiError(
      code: json['code'] as String? ?? 'UNKNOWN_ERROR',
      message: json['message'] as String? ?? 'An unexpected error occurred.',
      details: json['details'],
    );
  }
}

class ApiMetadata {
  final String timestamp;
  final String mode;
  final String? requestId;

  ApiMetadata({
    required this.timestamp,
    required this.mode,
    this.requestId,
  });
}
