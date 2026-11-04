import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RestaurantType } from '../../types/restaurant';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Store,
  FileCheck,
  CheckCircle2,
  Building,
  MapPin,
  Landmark,
} from 'lucide-react';

export const RegistrationScreen: React.FC = () => {
  const { setScreen, restaurant, updateRestaurant, showToast } = useApp();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State initialized with realistic sample
  const [form, setForm] = useState({
    ownerName: restaurant.ownerName || 'Lakshmi Narayana',
    ownerPhone: restaurant.ownerPhone || '+91 98765 43210',
    ownerEmail: restaurant.ownerEmail || 'lakshmi.blr@feedopartner.com',
    altPhone: restaurant.altPhone || '+91 80 2553 4900',

    restaurantName: restaurant.restaurantName || 'Lucky Family Restaurant',
    restaurantType: restaurant.restaurantType || ('Restaurant' as RestaurantType),
    cuisines: restaurant.cuisines || ['Biryani', 'South Indian', 'North Indian'],
    address: restaurant.address || 'No. 42, 80 Feet Road, 4th Block, Koramangala',
    city: restaurant.city || 'Bengaluru',
    state: restaurant.state || 'Karnataka',
    pincode: restaurant.pincode || '560034',
    landmark: restaurant.landmark || 'Opposite Sony World Signal',

    fssaiNumber: restaurant.fssaiNumber || '21223004000891',
    panNumber: restaurant.panNumber || 'AABCL9921D',
    aadhaarNumber: restaurant.aadhaarNumber || '5642 9921 4430',
    gstNumber: restaurant.gstNumber || '29AABCL9921D1Z5',
    bankAccount: restaurant.bankAccount || '5010023489921',
    bankName: restaurant.bankName || 'HDFC Bank Ltd',
    ifscCode: restaurant.ifscCode || 'HDFC0000053',
  });

  const restaurantTypes: RestaurantType[] = [
    'Restaurant',
    'Cafe',
    'Bakery',
    'Fast Food',
    'Cloud Kitchen',
    'Sweet Shop',
    'Juice Shop',
  ];

  const availableCuisines = [
    'Biryani',
    'South Indian',
    'North Indian',
    'Chinese',
    'Fast Food',
    'Snacks',
    'Beverages',
    'Desserts',
    'Tandoor',
  ];

  const toggleCuisine = (cuisine: string) => {
    if (form.cuisines.includes(cuisine)) {
      setForm({ ...form, cuisines: form.cuisines.filter((c) => c !== cuisine) });
    } else {
      setForm({ ...form, cuisines: [...form.cuisines, cuisine] });
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.ownerName || !form.ownerPhone || !form.ownerEmail) {
        showToast('Please fill all required owner details', 'error');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.restaurantName || !form.address || !form.city || !form.pincode) {
        showToast('Please fill all required restaurant details', 'error');
        return;
      }
      if (form.cuisines.length === 0) {
        showToast('Please select at least one cuisine', 'error');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!form.fssaiNumber || (!form.aadhaarNumber && !form.panNumber) || !form.bankAccount || !form.ifscCode) {
        showToast('Please fill all business & bank details', 'error');
        return;
      }
      updateRestaurant({ ...form });
      showToast('Registration details saved! Proceed to document upload.', 'success');
      setScreen('documents');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
          <div>
            <button
              onClick={() => {
                if (step > 1) setStep((step - 1) as 1 | 2 | 3);
                else setScreen('login');
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Restaurant Registration
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Step {step} of 3 • {step === 1 ? 'Owner Info' : step === 2 ? 'Restaurant Details' : 'Business & Bank'}
            </p>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === num
                    ? 'bg-feedo-500 text-white shadow-md shadow-feedo-500/30'
                    : step > num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > num ? '✓' : num}
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNextStep} className="space-y-6">
          {/* STEP 1: OWNER DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-feedo-600 bg-feedo-50 p-3 rounded-2xl border border-feedo-100">
                <User className="w-4 h-4" />
                <span>Step 1: Restaurant Owner / Partner Details</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="e.g. Lakshmi Narayana"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.ownerPhone}
                    onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Alternate Phone
                  </label>
                  <input
                    type="text"
                    value={form.altPhone}
                    onChange={(e) => setForm({ ...form, altPhone: e.target.value })}
                    placeholder="+91 80 2553 4900"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  placeholder="owner@restaurant.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                />
              </div>
            </div>
          )}

          {/* STEP 2: RESTAURANT DETAILS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-feedo-600 bg-feedo-50 p-3 rounded-2xl border border-feedo-100">
                <Store className="w-4 h-4" />
                <span>Step 2: Restaurant & Cuisine Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.restaurantName}
                    onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                    placeholder="e.g. Lucky Family Restaurant"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Restaurant Type *
                  </label>
                  <select
                    value={form.restaurantType}
                    onChange={(e) => setForm({ ...form, restaurantType: e.target.value as RestaurantType })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  >
                    {restaurantTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cuisine Tag Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cuisines Served (Select all that apply) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableCuisines.map((c) => {
                    const isSelected = form.cuisines.includes(c);
                    return (
                      <button
                        type="button"
                        key={c}
                        onClick={() => toggleCuisine(c)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-feedo-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Complete Street Address *
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Shop No, Building Name, Street"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Landmark</label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUSINESS & BANK DETAILS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-sm font-bold text-feedo-600 bg-feedo-50 p-3 rounded-2xl border border-feedo-100">
                <Landmark className="w-4 h-4" />
                <span>Step 3: Food License, Tax & Bank Payout Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    14-digit FSSAI License *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={form.fssaiNumber}
                    onChange={(e) => setForm({ ...form, fssaiNumber: e.target.value })}
                    placeholder="21223004000891"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    12-digit Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={form.aadhaarNumber}
                    onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })}
                    placeholder="1234 5678 9012"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  GSTIN (Goods & Services Tax) <span className="text-slate-400 font-normal">(Optional for small outlets)</span>
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={form.gstNumber}
                  onChange={(e) => setForm({ ...form, gstNumber: e.target.value.toUpperCase() })}
                  placeholder="29AABCL9921D1Z5"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Bank Account Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.bankAccount}
                    onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
                    placeholder="5010023489921"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={form.ifscCode}
                    onChange={(e) => setForm({ ...form, ifscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC0000053"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-hidden transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bottom CTA */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-slate-100">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
              >
                Previous
              </button>
            )}

            <button
              type="submit"
              className="ml-auto py-3.5 px-6 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-feedo-500/25 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>{step === 3 ? 'Proceed to Document Upload' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
