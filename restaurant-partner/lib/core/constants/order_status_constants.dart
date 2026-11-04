class OrderStatusConstants {
  // Order Core Statuses
  static const String created = 'CREATED';
  static const String accepted = 'ACCEPTED';
  static const String preparing = 'PREPARING';
  static const String readyForPickup = 'READY_FOR_PICKUP';
  static const String pickedUp = 'PICKED_UP';
  static const String outForDelivery = 'OUT_FOR_DELIVERY';
  static const String delivered = 'DELIVERED';
  static const String rejected = 'REJECTED';
  static const String cancelled = 'CANCELLED';

  // Legacy/UI Compatibility Aliases
  static const String paymentConfirmed = 'PAYMENT_CONFIRMED';
  static const String restaurantAccepted = 'RESTAURANT_ACCEPTED';
  static const String riderAssigned = 'RIDER_ASSIGNED';
  static const String riderArrived = 'RIDER_ARRIVED';
  static const String pickupVerified = 'PICKUP_VERIFIED';
  static const String restaurantRejected = 'RESTAURANT_REJECTED';
  static const String customerCancelled = 'CUSTOMER_CANCELLED';

  // Delivery Sub-states
  static const String deliveryUnassigned = 'UNASSIGNED';
  static const String deliveryRiderAssigned = 'RIDER_ASSIGNED';
  static const String deliveryRiderArrived = 'RIDER_ARRIVED';
  static const String deliveryPickupVerified = 'PICKUP_VERIFIED';
  static const String deliveryHandoverCompleted = 'HANDOVER_COMPLETED';

  // Payment Statuses
  static const String paymentPending = 'PENDING';
  static const String paymentAuthorized = 'AUTHORIZED';
  static const String paymentPaid = 'PAID';
  static const String paymentFailed = 'FAILED';
  static const String paymentRefunded = 'REFUNDED';
  static const String paymentCod = 'COD';

  static String getDisplayLabel(String status) {
    switch (status) {
      case created:
      case 'PLACED':
        return 'New Order';
      case accepted:
      case restaurantAccepted:
        return 'Accepted';
      case preparing:
        return 'Preparing';
      case readyForPickup:
        return 'Food Ready';
      case pickedUp:
        return 'Picked Up';
      case outForDelivery:
        return 'Out for Delivery';
      case delivered:
        return 'Delivered';
      case rejected:
      case restaurantRejected:
        return 'Rejected';
      case cancelled:
      case customerCancelled:
        return 'Cancelled';
      case riderAssigned:
        return 'Rider Assigned';
      case riderArrived:
        return 'Rider Arrived';
      default:
        return status;
    }
  }
}
