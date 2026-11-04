/**
 * FEEDO Order Lifecycle States
 */
export type CoreOrderStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED';

/**
 * Delivery Handover Sub-States & Events
 */
export type DeliverySubState =
  | 'UNASSIGNED'
  | 'RIDER_ASSIGNED'
  | 'RIDER_ARRIVED'
  | 'PICKUP_VERIFIED'
  | 'HANDOVER_COMPLETED';

/**
 * Authoritative Backend Payment Statuses (Separated from Order Lifecycle)
 */
export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

/**
 * Full UI OrderStatus (Maintains full backward compatibility with UI components & badge tags)
 */
export type OrderStatus =
  | CoreOrderStatus
  | 'PAYMENT_CONFIRMED'
  | 'RESTAURANT_ACCEPTED'
  | 'RIDER_ASSIGNED'
  | 'RIDER_ARRIVED'
  | 'PICKUP_VERIFIED'
  | 'RESTAURANT_REJECTED'
  | 'CUSTOMER_CANCELLED';

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  imageUrl?: string;
  notes?: string;
  addOns?: string[];
}

export interface CustomerInfo {
  name: string;
  phoneMasked: string; // e.g. +91 98*** **234
  address: string;
  area: string;
  distanceKm: number;
  orderCount: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phoneMasked: string;
  vehicleNumber: string;
  vehicleModel: string;
  rating: number;
  distanceKm: number;
  etaMinutes: number;
  photoUrl: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  description: string;
  time: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string; // e.g. "FD10245"
  customer: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  taxes: number;
  discount: number;
  total: number;
  paymentStatus: PaymentStatus | 'COD';
  paymentMethod: string;
  status: OrderStatus;
  deliveryState?: DeliverySubState;
  specialInstructions?: string;
  rejectionReason?: string;
  pickupCode: string; // e.g. "7284"
  createdAt: string;
  acceptedAt?: string;
  prepMinutes: number;
  prepStartedAt?: string;
  prepTargetMinutes: number;
  readyAt?: string;
  rider?: DeliveryPartner;
  riderAssignedAt?: string;
  riderArrivedAt?: string;
  pickedUpAt?: string;
  outForDeliveryAt?: string;
  deliveredAt?: string;
  packagingDone: boolean;
  timeline: OrderTimelineEvent[];
}
