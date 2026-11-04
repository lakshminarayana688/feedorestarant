import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OfferItem } from '../../types/extras';
import {
  Tag,
  Plus,
  Sparkles,
  Percent,
  Gift,
  Clock,
  CheckCircle2,
  X,
  TrendingUp,
  Award,
  ArrowLeft,
} from 'lucide-react';

export const OffersScreen: React.FC = () => {
  const { offers, createOffer, toggleOfferActive, showToast, setScreen } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT' | 'BOGO',
    discountValue: 20,
    maxDiscount: 100,
    minOrderValue: 299,
    validTill: '31 Oct 2026',
  });

  const handleCreateOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.title) {
      showToast('Please enter offer title and coupon code', 'error');
      return;
    }

    createOffer({
      ...form,
      isActive: true,
      maxDiscount: form.type === 'PERCENTAGE' ? form.maxDiscount : undefined,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Promotions & Customer Offers
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create attractive discount coupons, Happy Hour boosts, and meal combos to increase diner cart sizes.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2.5 px-5 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-feedo-500/20 flex items-center gap-2 self-start sm:self-auto transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Offer</span>
        </button>
      </div>

      {/* Featured Banner: Happy Hour Boost (Gradient Orange to Rose) */}
      <div className="bg-gradient-to-r from-feedo-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FEEDO Spotlight Campaign</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Happy Hour Boost: 4 PM — 7 PM Rush
          </h2>
          <p className="text-xs text-rose-100 leading-relaxed">
            Auto-apply 15% OFF on starters & beverages during tea-time lull to double your off-peak order conversions.
          </p>
        </div>

        <button
          onClick={() => showToast('Happy Hour Boost campaign activated for 4 PM - 7 PM slot!', 'success')}
          className="px-6 py-3 bg-white text-rose-600 hover:bg-rose-50 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer shrink-0"
        >
          Activate Happy Hour Boost
        </button>
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between space-y-4 ${
              offer.isActive
                ? 'border-feedo-200 shadow-2xs hover:shadow-md'
                : 'border-slate-200 bg-slate-50/70 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="font-mono text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                  {offer.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    offer.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {offer.isActive ? '🟢 Active' : '⏸ Paused'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1">{offer.title}</h3>
              <p className="text-xs text-slate-500 mb-3">
                {offer.type === 'PERCENTAGE' && `${offer.discountValue}% OFF (Max ₹${offer.maxDiscount})`}
                {offer.type === 'FLAT' && `Flat ₹${offer.discountValue} OFF on orders above ₹${offer.minOrderValue}`}
                {offer.type === 'BOGO' && 'Buy One Get One Free Special Feast'}
              </p>

              <div className="space-y-1 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Min Order Value:</span>
                  <span className="font-bold text-slate-800">₹{offer.minOrderValue}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valid Until:</span>
                  <span className="font-bold text-slate-800">{offer.validTill}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Redemptions:</span>
                  <span className="font-mono font-bold text-feedo-600">{offer.totalRedemptions} times</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => toggleOfferActive(offer.id)}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  offer.isActive ? 'text-rose-600 hover:underline' : 'text-emerald-600 hover:underline'
                }`}
              >
                {offer.isActive ? 'Pause Coupon' : 'Resume Coupon'}
              </button>

              <button
                onClick={() => showToast(`Coupon ${offer.code} link copied for marketing`, 'info')}
                className="text-xs font-bold text-feedo-600 hover:underline"
              >
                Share Link ↗
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Create New Promo Offer</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Offer Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. 20% OFF on Weekend Feasts"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Promo Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FEEDO20"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                    <option value="BOGO">Buy 1 Get 1</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-feedo-500 hover:bg-feedo-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Save & Launch Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
