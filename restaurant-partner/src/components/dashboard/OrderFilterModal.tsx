import React from 'react';
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Utensils,
  CreditCard,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface DashboardFilterOptions {
  status: string; // 'ALL' | 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED'
  sortBy: 'NEWEST' | 'PRICE_HIGH' | 'PRICE_LOW';
  dietary: 'ALL' | 'VEG' | 'NON_VEG';
  paymentMode: 'ALL' | 'ONLINE' | 'COD';
}

interface OrderFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: DashboardFilterOptions;
  onChangeFilters: (filters: DashboardFilterOptions) => void;
  onResetFilters: () => void;
  matchingCount: number;
}

export const OrderFilterModal: React.FC<OrderFilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onChangeFilters,
  onResetFilters,
  matchingCount,
}) => {
  if (!isOpen) return null;

  const STATUS_OPTIONS = [
    { id: 'ALL', label: 'All Statuses' },
    { id: 'NEW', label: 'New Orders' },
    { id: 'PREPARING', label: 'Preparing' },
    { id: 'READY', label: 'Ready for Pickup' },
    { id: 'COMPLETED', label: 'Delivered' },
    { id: 'CANCELLED', label: 'Cancelled' },
  ];

  const SORT_OPTIONS: Array<{ id: DashboardFilterOptions['sortBy']; label: string }> = [
    { id: 'NEWEST', label: 'Newest First' },
    { id: 'PRICE_HIGH', label: 'Order Value: High to Low' },
    { id: 'PRICE_LOW', label: 'Order Value: Low to High' },
  ];

  const DIETARY_OPTIONS: Array<{ id: DashboardFilterOptions['dietary']; label: string }> = [
    { id: 'ALL', label: 'All Items' },
    { id: 'VEG', label: 'Pure Veg Only' },
    { id: 'NON_VEG', label: 'Includes Non-Veg' },
  ];

  const PAYMENT_OPTIONS: Array<{ id: DashboardFilterOptions['paymentMode']; label: string }> = [
    { id: 'ALL', label: 'All Payment Types' },
    { id: 'ONLINE', label: 'Prepaid Online (UPI/Card)' },
    { id: 'COD', label: 'Cash on Delivery (COD)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFC700] flex items-center justify-center shadow-xs text-slate-900">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">Filter &amp; Sort Orders</h3>
              <p className="text-xs text-slate-500">Customize order list and queue views</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* 1. Sort By */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-600" />
              <span>Sort Orders By</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = filters.sortBy === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, sortBy: opt.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300/40 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Order Status */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
              Order Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = filters.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, status: opt.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Food Type / Dietary */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dietary Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {DIETARY_OPTIONS.map((opt) => {
                const isSelected = filters.dietary === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, dietary: opt.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300/40 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Payment Mode */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              <span>Payment Type</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = filters.paymentMode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeFilters({ ...filters, paymentMode: opt.id })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-300/40 font-bold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Show {matchingCount} Order{matchingCount === 1 ? '' : 's'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilterModal;
