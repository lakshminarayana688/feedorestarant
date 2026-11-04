import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpeningHour } from '../../types/restaurant';
import {
  CheckCircle2,
  Clock,
  Store,
  Camera,
  Image,
  ArrowRight,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';

export const RestaurantSetupScreen: React.FC = () => {
  const { restaurant, updateRestaurant, completeSetup, showToast } = useApp();

  const [hours, setHours] = useState<OpeningHour[]>(restaurant.openingHours);
  const [description, setDescription] = useState(restaurant.description);

  const toggleDay = (dayIndex: number) => {
    const updated = [...hours];
    updated[dayIndex].isOpen = !updated[dayIndex].isOpen;
    setHours(updated);
  };

  const handleFinish = () => {
    updateRestaurant({
      openingHours: hours,
      description,
      isOnline: true,
    });
    completeSetup();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
        {/* Header & Progress */}
        <div className="border-b border-slate-100 pb-6 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Final Restaurant Setup
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure your store operating hours and profile visuals before launching online.
              </p>
            </div>
            <span className="text-xs font-black text-feedo-600 bg-feedo-50 px-3 py-1 rounded-full border border-feedo-200">
              80% Completed
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-feedo-500 to-emerald-500 h-full w-4/5 rounded-full transition-all duration-500" />
          </div>
        </div>

        <div className="space-y-8">
          {/* SECTION 1: PROFILE & VISUALS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-feedo-500" />
              <span>1. Store Profile & Photos</span>
            </h3>

            {/* Cover photo preview */}
            <div className="relative h-40 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
              <img
                src={restaurant.coverUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => showToast('Cover photo updated', 'success')}
                  className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-xl shadow flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Change Cover Photo
                </button>
              </div>
            </div>

            {/* Logo + Basic details */}
            <div className="flex items-start gap-4">
              <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-white shadow-md -mt-10 bg-white shrink-0">
                <img
                  src={restaurant.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">{restaurant.restaurantName}</h4>
                <p className="text-xs text-slate-500">{restaurant.cuisines.join(', ')} • {restaurant.city}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Restaurant Description / Tagline
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:border-feedo-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* SECTION 2: OPENING HOURS */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-feedo-500" />
              <span>2. Weekly Opening Hours</span>
            </h3>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 divide-y divide-slate-200/80">
              {hours.map((hour, idx) => (
                <div key={hour.day} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <div className="w-28">
                    <span className="text-xs font-bold text-slate-800">{hour.day}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {hour.isOpen ? (
                      <span className="font-mono text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {hour.openTime} — {hour.closeTime}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Closed all day</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleDay(idx)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      hour.isOpen
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {hour.isOpen ? 'Open' : 'Closed'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: DELIVERY SETTINGS */}
          <div className="space-y-3 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bike className="w-4 h-4 text-feedo-500" />
              <span>3. Delivery & Dispatch Parameters</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Standard Prep Time</span>
                <span className="text-slate-500">Default 15-20 minutes kitchen prep</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Delivery Partner Radius</span>
                <span className="text-slate-500">Up to 8.5 km radius around Koramangala</span>
              </div>
            </div>
          </div>
        </div>

        {/* Launch CTA */}
        <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            You can modify these settings anytime in your profile.
          </p>
          <button
            type="button"
            onClick={handleFinish}
            className="py-3.5 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Launch Restaurant & Go Online</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
