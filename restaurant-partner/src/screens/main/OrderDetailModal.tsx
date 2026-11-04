import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types/order';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VegIndicator } from '../../components/common/VegIndicator';
import { StylizedLiveMap } from '../../components/map/StylizedLiveMap';
import {
  X,
  Clock,
  MapPin,
  Phone,
  Bike,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  KeyRound,
  ShieldCheck,
  Utensils,
  Store,
  PackageCheck,
  CheckCheck,
  ArrowRight,
  Copy,
  Eye,
  EyeOff,
} from 'lucide-react';
import { soundEffects } from '../../utils/audio';
import { FeedoDispatchAgentModal } from '../../components/chat/FeedoDispatchAgentModal';

export const OrderDetailModal: React.FC = () => {
  const {
    selectedOrder,
    setSelectedOrder,
    startPreparingOrder,
    markFoodReady,
    markRiderArrived,
    verifyPickup,
    confirmHandover,
    startOutForDelivery,
    markDelivered,
    restaurant,
    isPrototypeMode,
    currentUserRole,
    showToast,
  } = useApp();

  const [verifyMode, setVerifyMode] = useState<'OTP' | 'QR'>('OTP');
  const [typedOtp, setTypedOtp] = useState('');
  const [showCode, setShowCode] = useState(true);
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  const [isAiSupportOpen, setIsAiSupportOpen] = useState(false);

  if (!selectedOrder) return null;

  const togglePacked = (itemId: string) => {
    setPackedItems((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const handleCopyCode = () => {
    if (!selectedOrder?.pickupCode) return;
    navigator.clipboard.writeText(selectedOrder.pickupCode);
    showToast(`Pickup code ${selectedOrder.pickupCode} copied! Share with delivery partner.`, 'success');
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedOtp || typedOtp.trim().length !== 4) {
      showToast('INVALID PICKUP CODE: Please enter the 4-digit code.', 'error');
      return;
    }
    verifyPickup(selectedOrder.id, typedOtp.trim());
  };

  const isPreparing = selectedOrder.status === 'PREPARING';
  const isReady = selectedOrder.status === 'READY_FOR_PICKUP';
  const isRiderArrived = selectedOrder.status === 'RIDER_ARRIVED';
  const isVerified = selectedOrder.status === 'PICKUP_VERIFIED';
  const isPickedUp = selectedOrder.status === 'PICKED_UP' || selectedOrder.status === 'OUT_FOR_DELIVERY';
  const isDelivered = selectedOrder.status === 'DELIVERED';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 font-mono">
                  #{selectedOrder.id}
                </h2>
                <StatusBadge status={selectedOrder.status} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Placed at {selectedOrder.createdAt} • {selectedOrder.paymentMethod}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAiSupportOpen(true)}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-[#FFC700] text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
              title="Open AI Dispatcher Sandeep for this order"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">AI Dispatch</span>
              <span>Help</span>
            </button>
            <button
              onClick={() => setSelectedOrder(null)}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* 1. STATUS LIFECYCLE ACTION BANNER */}
          {(selectedOrder.status === 'RESTAURANT_ACCEPTED' || selectedOrder.status === 'ACCEPTED') && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-blue-900">Order Assigned to Kitchen</h4>
                <p className="text-xs text-blue-700">Order assigned directly to your restaurant. Click start preparing to initiate kitchen countdown.</p>
              </div>
              <button
                onClick={() => startPreparingOrder(selectedOrder.id)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Utensils className="w-4 h-4" />
                <span>START PREPARING</span>
              </button>
            </div>
          )}

          {isPreparing && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">Kitchen Preparing</h4>
                </div>
                <div className="flex items-center gap-1.5 font-mono font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-xl text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Est. Prep Time: {selectedOrder.prepMinutes || 18} mins</span>
                </div>
              </div>

              <p className="text-xs text-orange-800">
                Chefs are cooking. Check off items below once packed and mark Food Ready.
              </p>

              <button
                onClick={() => markFoodReady(selectedOrder.id)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>FOOD READY & PACKED</span>
              </button>
            </div>
          )}

          {isReady && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-emerald-900">Food Ready at Dispatch Counter</h4>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  READY FOR PICKUP
                </span>
              </div>
              <p className="text-xs text-emerald-800">
                Package is on the pickup counter. Communicate the unique 4-digit code to delivery partner {selectedOrder.rider?.name || 'Arun Kumar'} only after they arrive at the counter.
              </p>

              {/* Order Specific Pickup Code Box */}
              <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Unique Pickup Code
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black font-mono tracking-widest text-emerald-800">
                      {showCode ? (selectedOrder.pickupCode || '----') : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCode(!showCode)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                      title={showCode ? 'Hide Code' : 'Reveal Code'}
                    >
                      {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Share / Copy Code</span>
                </button>
              </div>

              {!selectedOrder.riderArrivedAt && isPrototypeMode && (
                <button
                  onClick={() => markRiderArrived(selectedOrder.id)}
                  className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-3 py-2 rounded-xl w-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Bike className="w-4 h-4" />
                  <span>Simulate Rider Arun Kumar Arrived at Counter</span>
                </button>
              )}
            </div>
          )}

          {/* RIDER ARRIVAL & SECURE PICKUP VERIFICATION (Requirement #25 & #26 & #27) */}
          {(isRiderArrived || isVerified) && (
            <div className="p-5 bg-gradient-to-br from-indigo-50 via-slate-50 to-amber-50 border-2 border-indigo-200 rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-indigo-950">
                      {isVerified ? '✓ Pickup Handover Verified' : 'Delivery Partner Arrived for Pickup'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedOrder.rider?.name || 'Arun Kumar'} is at the restaurant counter
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-lg">
                  {selectedOrder.rider?.vehicleNumber}
                </span>
              </div>

              {!isVerified ? (
                <div className="bg-white p-4 rounded-2xl border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Display Pickup OTP to Rider:</span>
                    <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                      <button
                        type="button"
                        onClick={() => setVerifyMode('OTP')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                          verifyMode === 'OTP' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        4-Digit OTP
                      </button>
                      <button
                        type="button"
                        onClick={() => setVerifyMode('QR')}
                        className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                          verifyMode === 'QR' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'
                        }`}
                      >
                        QR Code
                      </button>
                    </div>
                  </div>

                  {verifyMode === 'OTP' ? (
                    <div className="text-center py-3 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-[11px] text-amber-800 uppercase tracking-wider font-semibold">
                          Secure 4-Digit Pickup Code
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCode(!showCode)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer"
                          title={showCode ? 'Hide Code' : 'Reveal Code'}
                        >
                          {showCode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-slate-900">
                          {showCode ? (selectedOrder.pickupCode || '----') : '••••'}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors cursor-pointer"
                          title="Share / Copy Code"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <QrCode className="w-24 h-24 text-slate-800" />
                      <span className="text-[10px] text-slate-500 mt-1 font-mono">
                        SCAN_FD_{selectedOrder.id}_{selectedOrder.pickupCode}
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleVerifyOtpSubmit} className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-digit code"
                      value={typedOtp}
                      onChange={(e) => setTypedOtp(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-slate-900 tracking-widest"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                    >
                      VERIFY & HANDOVER
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 font-semibold">
                    <CheckCheck className="w-5 h-5 text-emerald-700" />
                    <span>Rider identity and OTP {selectedOrder.pickupCode} verified successfully!</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      confirmHandover(selectedOrder.id);
                      startOutForDelivery(selectedOrder.id);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRM HANDOVER & DISPATCH</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* OUT FOR DELIVERY & LIVE MAP */}
          {(isPickedUp || isDelivered) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Live Dispatch Tracking
                </h4>
                {isPickedUp && isPrototypeMode && (
                  <button
                    onClick={() => markDelivered(selectedOrder.id)}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                  >
                    ✓ Simulate Delivery Completed
                  </button>
                )}
              </div>
              <StylizedLiveMap
                rider={selectedOrder.rider}
                status={selectedOrder.status}
                customerAddress={selectedOrder.customer.address}
                restaurantAddress={restaurant.address}
              />
            </div>
          )}

          {/* 2. ORDERED ITEMS CHECKLIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Ordered Items ({selectedOrder.items.length})
            </h4>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {selectedOrder.items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => togglePacked(item.id)}
                  className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!packedItems[item.id] || selectedOrder.packagingDone}
                      onChange={() => togglePacked(item.id)}
                      className="w-4 h-4 text-feedo-600 rounded border-slate-300 focus:ring-feedo-500 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <VegIndicator isVeg={item.isVeg} size="sm" />
                        <span className="text-xs font-bold text-slate-900">
                          {item.quantity} × {item.name}
                        </span>
                      </div>
                      {item.notes && (
                        <p className="text-[11px] text-amber-700 italic mt-0.5">Note: {item.notes}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. CUSTOMER & DELIVERY INFO (Role-Protected PII) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-feedo-600" /> Customer Information
              </h4>
              <p className="font-bold text-slate-900">
                {selectedOrder.customer.name.split(' ')[0]} {selectedOrder.customer.name.split(' ')[1]?.[0] || ''}.
              </p>
              {currentUserRole !== 'KITCHEN' ? (
                <>
                  <p className="text-slate-500 font-mono">{selectedOrder.customer.phoneMasked || '+91 98******10'}</p>
                  <p className="text-slate-600 leading-tight">Delivery Area: {selectedOrder.customer.area || 'Bellandur'}</p>
                </>
              ) : (
                <p className="text-slate-500 italic">Delivery Area: {selectedOrder.customer.area || 'Bellandur'}</p>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-indigo-600" /> Delivery Partner
              </h4>
              {selectedOrder.rider ? (
                <>
                  <p className="font-bold text-slate-900 flex items-center justify-between">
                    <span>{selectedOrder.rider.name}</span>
                    <span className="text-amber-500">★ {selectedOrder.rider.rating}</span>
                  </p>
                  <p className="text-slate-500">{selectedOrder.rider.vehicleModel}</p>
                  <p className="font-mono text-slate-700 font-semibold">{selectedOrder.rider.vehicleNumber}</p>
                </>
              ) : (
                <p className="text-slate-400 italic">Rider assignment will trigger upon acceptance</p>
              )}
            </div>
          </div>

          {/* 4. BILL SUMMARY */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <h4 className="font-bold text-slate-800 mb-2">Payment Breakdown</h4>
            <div className="flex justify-between text-slate-600">
              <span>Item Subtotal</span>
              <span>₹{selectedOrder.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes & GST (5%)</span>
              <span>₹{selectedOrder.taxes}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>₹{selectedOrder.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Platform Fee</span>
              <span>₹{selectedOrder.platformFee}</span>
            </div>
            {selectedOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Discount</span>
                <span>- ₹{selectedOrder.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-200 text-sm">
              <span>Total Amount</span>
              <span className="text-feedo-600 font-black">₹{selectedOrder.total}</span>
            </div>
          </div>

          {/* 5. ORDER TIMELINE */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Order Timeline
            </h4>
            <div className="space-y-3 pl-2 border-l-2 border-slate-200">
              {selectedOrder.timeline.map((event, idx) => (
                <div key={idx} className="relative pl-4">
                  <span
                    className={`absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                      event.completed ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold ${event.completed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {event.title}
                    </span>
                    <span className="text-[10px] text-slate-400">{event.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAiSupportOpen(true)}
            className="text-xs font-bold text-amber-900 hover:text-slate-950 flex items-center gap-1.5 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Need Help with this Order? Ask AI Dispatcher Sandeep</span>
          </button>
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* AI Dispatch Agent Modal */}
      <FeedoDispatchAgentModal
        isOpen={isAiSupportOpen}
        onClose={() => setIsAiSupportOpen(false)}
        initialOrderId={selectedOrder.id}
      />
    </div>
  );
};
