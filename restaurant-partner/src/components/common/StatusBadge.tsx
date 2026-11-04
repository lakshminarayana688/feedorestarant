import React from 'react';
import { OrderStatus } from '../../types/order';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'CREATED':
      case 'PAYMENT_CONFIRMED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          label: 'New Order',
        };
      case 'RESTAURANT_ACCEPTED':
      case 'ACCEPTED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          label: 'Assigned',
        };
      case 'PREPARING':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          dot: 'bg-orange-500 animate-pulse',
          label: 'Preparing',
        };
      case 'READY_FOR_PICKUP':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'Food Ready',
        };
      case 'RIDER_ASSIGNED':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dot: 'bg-indigo-500',
          label: 'Rider Assigned',
        };
      case 'RIDER_ARRIVED':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          dot: 'bg-purple-500 animate-pulse',
          label: 'Rider Arrived',
        };
      case 'PICKUP_VERIFIED':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          dot: 'bg-teal-500',
          label: 'Pickup Verified',
        };
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          dot: 'bg-cyan-500 animate-pulse',
          label: 'Out for Delivery',
        };
      case 'DELIVERED':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
          label: 'Delivered',
        };
      case 'RESTAURANT_REJECTED':
      case 'CUSTOMER_CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          label: status === 'RESTAURANT_REJECTED' ? 'Rejected' : 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const { bg, dot, label } = getBadgeStyle();
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm font-semibold' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-medium ${bg} ${sizeClasses}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
