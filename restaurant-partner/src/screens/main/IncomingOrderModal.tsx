import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { VegIndicator } from '../../components/common/VegIndicator';
import {
  Bell,
  MapPin,
  AlertTriangle,
  X,
  CheckCircle2,
  Volume2,
  VolumeX,
  Utensils,
  Eye,
} from 'lucide-react';

export const IncomingOrderModal: React.FC = () => {
  const {
    incomingOrder,
    setIncomingOrder,
    setSelectedOrder,
    startPreparingOrder,
    stopOrderSound,
    setScreen,
  } = useApp();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    return () => {
      stopOrderSound();
    };
  }, [incomingOrder, stopOrderSound]);

  if (!incomingOrder) return null;

  const handleDismiss = () => {
    stopOrderSound();
    setIncomingOrder(null);
  };

  const handleViewOrder = () => {
    stopOrderSound();
    setSelectedOrder(incomingOrder);
    setIncomingOrder(null);
    setScreen('orders');
  };

  const handleStartCooking = () => {
    stopOrderSound();
    startPreparingOrder(incomingOrder.id);
    setSelectedOrder({ ...incomingOrder, status: 'PREPARING' });
    setIncomingOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-feedo-500 overflow-hidden flex flex-col incoming-order-card">
        {/* Header - Order Assigned */}
        <div className="bg-gradient-to-r from-feedo-600 via-feedo-500 to-amber-500 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-full">
                  ASSIGNED TO KITCHEN
                </span>
                <span className="text-xs font-mono font-bold">#{incomingOrder.id}</span>
              </div>
              <h2 className="text-lg font-black mt-0.5">Order Assigned to Restaurant</h2>
            </div>
          </div>

          {/* Sound Control & Close */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!isMuted) {
                  stopOrderSound();
                  setIsMuted(true);
                } else {
                  setIsMuted(false);
                }
              }}
              title={isMuted ? 'Alert Sound Muted' : 'Silence Ringing Alert'}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-white/80" />
                  <span className="text-[10px] font-bold text-white/80 hidden sm:inline">Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-200 hidden sm:inline">Ringing</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white transition-all cursor-pointer"
              title="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {/* Customer Info */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <h3 className="text-xs font-bold text-slate-800">{incomingOrder.customer.name}</h3>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{incomingOrder.customer.area}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {incomingOrder.paymentStatus} ({incomingOrder.paymentMethod})
              </span>
              <p className="text-[11px] font-bold text-slate-700 mt-1">₹{incomingOrder.total}</p>
            </div>
          </div>

          {/* Special Cooking Instructions Alert */}
          {incomingOrder.specialInstructions && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Special Customer Request:</p>
                <p className="text-xs italic mt-0.5">"{incomingOrder.specialInstructions}"</p>
              </div>
            </div>
          )}

          {/* Ordered Items List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ordered Items</h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white p-2">
              {incomingOrder.items.map((item) => (
                <div key={item.id} className="py-2 px-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <VegIndicator isVeg={item.isVeg} size="sm" />
                    <span className="font-bold text-slate-900">
                      {item.quantity} × {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-800 font-mono">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span>₹{incomingOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery & Platform Fee</span>
              <span>₹{incomingOrder.deliveryFee + incomingOrder.platformFee}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200 text-sm">
              <span>Order Total (Paid)</span>
              <span className="text-feedo-600 font-black">₹{incomingOrder.total}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Assigned with No Accept or Request required */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={handleViewOrder}
            className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>View in Queue</span>
          </button>

          <button
            type="button"
            onClick={handleStartCooking}
            className="flex-[2] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Utensils className="w-5 h-5" />
            <span>START COOKING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
