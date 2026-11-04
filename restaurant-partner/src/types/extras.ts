export interface DailySalesData {
  timeLabel: string;
  orders: number;
  revenue: number;
}

export interface SettlementRecord {
  id: string;
  date: string;
  period: string;
  grossAmount: number;
  commission: number;
  taxes: number;
  netPayout: number;
  status: 'SETTLED' | 'PROCESSING' | 'UPCOMING';
  payoutRef: string;
}

export interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  orderedItems: string[];
  reply?: {
    text: string;
    repliedAt: string;
  };
  tags: string[];
}

export interface OfferItem {
  id: string;
  title: string;
  code: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BOGO';
  discountValue: number; // 20 (for 20%) or 50 (for ₹50)
  maxDiscount?: number;
  minOrderValue: number;
  validTill: string;
  isActive: boolean;
  totalRedemptions: number;
}
