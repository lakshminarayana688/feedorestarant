import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bike,
  X,
  MapPin,
  CheckCircle2,
  Navigation,
  Phone,
  ShieldAlert,
  ArrowRight,
  KeyRound,
  Store,
  CheckCheck,
} from 'lucide-react';

export const RiderCompanionModal: React.FC = () => {
  const {
    isRiderSimulatorOpen,
    setIsRiderSimulatorOpen,
    orders,
    restaurant,
    markRiderArrived,
    verifyPickup,
    confirmHandover,
    startOutForDelivery,
    markDelivered,
    showToast,
    isPrototypeMode,
  } = useApp();

  const [enteredOtp, setEnteredOtp] = useState('');

  if (!isPrototypeMode || !isRiderSimulatorOpen) return null;

  // Find the active order for the rider
  const activeOrder = orders.find((o) =>
    ['PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(
      o.status
    )
  ) || orders[0];

  const handleVerifyOtp = () => {
    if (!activeOrder) return;
    const success = verifyPickup(activeOrder.id, enteredOtp);
    if (success) {
      setEnteredOtp('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Device Frame Notch Header */}
        <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-200">FEEDO Rider App</span>
          </div>
          <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-700/50">
            Companion Simulator
          </span>
          <button
            onClick={() => setIsRiderSimulatorOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Rider Profile Card */}
        <div className="p-4 bg-gradient-to-b from-indigo-950/80 to-slate-900 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Rider"
              className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white truncate">Arun Kumar</h3>
                <span className="text-xs font-bold text-amber-400">★ 4.8</span>
              </div>
              <p className="text-xs text-slate-300">Hero Splendor • KA 05 AB 1234</p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">🟢 Online • Ready for Deliveries</p>
            </div>
          </div>
        </div>

        {/* Active Delivery Card */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeOrder ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <Bike className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              No active deliveries right now. Simulate or accept an order to test rider actions.
            </div>
          ) : (
            <>
              {/* Order Overview Pill */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-feedo-400">
                    Order #{activeOrder.id}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                    Earnings: ₹65
                  </span>
                </div>

                {/* Pickup Location */}
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <Store className="w-4 h-4 text-feedo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">{restaurant.restaurantName}</p>
                    <p className="text-[11px] text-slate-400">{restaurant.address}</p>
                  </div>
                </div>

                {/* Drop Location */}
                <div className="flex items-start gap-2.5 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-100">{activeOrder.customer.name}</p>
                    <p className="text-[11px] text-slate-400">{activeOrder.customer.address}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Phase:</span>
                  <span className="font-bold text-indigo-300">{activeOrder.status}</span>
                </div>
              </div>

              {/* RIDER ACTIONS BASED ON STAGE */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rider Actions</h4>

                {/* Step 1: Rider is on way / not marked arrived */}
                {['PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED'].includes(activeOrder.status) && (
                  <button
                    onClick={() => markRiderArrived(activeOrder.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>I HAVE ARRIVED AT RESTAURANT</span>
                  </button>
                )}

                {/* Step 2: Rider arrived, enter pickup code */}
                {['RIDER_ARRIVED', 'READY_FOR_PICKUP'].includes(activeOrder.status) && (
                  <div className="bg-slate-800/90 p-3.5 rounded-xl border border-slate-700 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <KeyRound className="w-4 h-4" />
                      <span>Ask Restaurant for Pickup OTP</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Restaurant display code is: <strong className="text-amber-400 font-mono text-xs">{activeOrder.pickupCode}</strong>
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4-digit OTP"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-center font-mono font-bold tracking-widest text-white focus:outline-hidden focus:border-indigo-500"
                      />
                      <button
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Verify OTP
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Verified, Handover & Out for delivery */}
                {activeOrder.status === 'PICKUP_VERIFIED' && (
                  <div className="space-y-2">
                    <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                      <span>OTP Verified! Ready for pickup handover.</span>
                    </div>
                    <button
                      onClick={() => {
                        confirmHandover(activeOrder.id);
                        startOutForDelivery(activeOrder.id);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                    >
                      <Bike className="w-4 h-4" />
                      <span>PICKED UP & START DELIVERY</span>
                    </button>
                  </div>
                )}

                {/* Step 4: Out for delivery */}
                {['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(activeOrder.status) && (
                  <button
                    onClick={() => markDelivered(activeOrder.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MARK ORDER AS DELIVERED</span>
                  </button>
                )}

                {/* Step 5: Delivered */}
                {activeOrder.status === 'DELIVERED' && (
                  <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-center text-xs text-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                    <p className="font-bold">Delivery Completed Successfully!</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">₹65 added to rider daily earnings</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Use this panel to simulate real delivery partner interactions seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};
