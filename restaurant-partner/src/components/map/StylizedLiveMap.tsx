import React, { useState } from 'react';
import { Store, Navigation, MapPin, Bike, Compass, ShieldCheck } from 'lucide-react';
import { DeliveryPartner } from '../../types/order';

interface StylizedLiveMapProps {
  rider?: DeliveryPartner;
  status: string;
  customerAddress?: string;
  restaurantAddress?: string;
}

export const StylizedLiveMap: React.FC<StylizedLiveMapProps> = ({
  rider,
  status,
  customerAddress = 'Bellandur, Bengaluru',
  restaurantAddress = 'Koramangala 4th Block, Bengaluru',
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const isHeadingToRestaurant = ['PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED'].includes(status);
  const isAtRestaurant = status === 'RIDER_ARRIVED' || status === 'PICKUP_VERIFIED';
  const isOutForDelivery = status === 'PICKED_UP' || status === 'OUT_FOR_DELIVERY';
  const isDelivered = status === 'DELIVERED';

  // Compute animated rider coordinate on the vector track
  let riderX = 220;
  let riderY = 280;
  let riderStatusText = 'Rider heading to restaurant';

  if (isHeadingToRestaurant) {
    riderX = 180;
    riderY = 240;
    riderStatusText = `${rider?.name || 'Rider'} is 1.2 km away (ETA ${rider?.etaMinutes || 6}m)`;
  } else if (isAtRestaurant) {
    riderX = 120;
    riderY = 160;
    riderStatusText = `${rider?.name || 'Rider'} is waiting at restaurant counter`;
  } else if (isOutForDelivery) {
    riderX = 310;
    riderY = 130;
    riderStatusText = `${rider?.name || 'Rider'} on way to customer (${rider?.distanceKm || 3.2} km)`;
  } else if (isDelivered) {
    riderX = 420;
    riderY = 90;
    riderStatusText = 'Order safely delivered!';
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner">
      {/* Map Surface Background */}
      <svg
        className="w-full h-72 sm:h-80 select-none"
        viewBox="0 0 500 350"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* City Block Grid / Roads */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
          </pattern>
          <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>

        <rect width="500" height="350" fill="#0f172a" />
        <rect width="500" height="350" fill="url(#grid)" />

        {/* Stylized River / Park Zone */}
        <path
          d="M 0,320 Q 150,280 260,330 T 500,300"
          fill="none"
          stroke="#0e7490"
          strokeWidth="24"
          strokeOpacity="0.2"
        />
        <circle cx="380" cy="220" r="45" fill="#065f46" fillOpacity="0.15" />

        {/* Main Road Avenues */}
        <path d="M 40,320 L 460,80" stroke="#334155" strokeWidth="10" strokeLinecap="round" />
        <path d="M 120,340 L 120,40" stroke="#334155" strokeWidth="8" />
        <path d="M 30,160 L 480,160" stroke="#334155" strokeWidth="8" />
        <path d="M 320,340 L 320,40" stroke="#334155" strokeWidth="6" />
        <path d="M 420,340 L 420,40" stroke="#334155" strokeWidth="6" />

        {/* Active Route Path */}
        <path
          d="M 180,240 Q 140,200 120,160 T 260,140 T 420,90"
          fill="none"
          stroke="url(#routeGrad)"
          strokeWidth="4"
          strokeDasharray="6,6"
          className="animate-pulse"
        />

        {/* 1. RESTAURANT PIN (X: 120, Y: 160) */}
        <g transform="translate(120, 160)">
          <circle cx="0" cy="0" r="18" fill="#ea580c" fillOpacity="0.25" className="animate-ping" />
          <circle cx="0" cy="0" r="14" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">🍽</text>
          <g transform="translate(-50, -32)">
            <rect width="100" height="22" rx="6" fill="#1e293b" stroke="#f97316" strokeWidth="1" />
            <text x="50" y="14" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Lucky Family Rest.</text>
          </g>
        </g>

        {/* 2. CUSTOMER PIN (X: 420, Y: 90) */}
        <g transform="translate(420, 90)">
          <circle cx="0" cy="0" r="16" fill="#10b981" fillOpacity="0.3" />
          <circle cx="0" cy="0" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">🏠</text>
          <g transform="translate(-40, -30)">
            <rect width="80" height="20" rx="6" fill="#1e293b" stroke="#10b981" strokeWidth="1" />
            <text x="40" y="13" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">Customer (Bellandur)</text>
          </g>
        </g>

        {/* 3. MOVING RIDER PIN */}
        <g transform={`translate(${riderX}, ${riderY})`} className="transition-all duration-1000 ease-in-out">
          <circle cx="0" cy="0" r="20" fill="#6366f1" fillOpacity="0.3" className="animate-ping" />
          <circle cx="0" cy="0" r="16" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🏍</text>
          <g transform="translate(-45, 24)">
            <rect width="90" height="20" rx="6" fill="#312e81" stroke="#818cf8" strokeWidth="1" />
            <text x="45" y="13" textAnchor="middle" fill="#e0e7ff" fontSize="8" fontWeight="bold">
              {rider?.name || 'Arun Kumar'}
            </text>
          </g>
        </g>
      </svg>

      {/* Floating Status Glass Overlay */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 text-white shadow-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
            <Bike className="w-5 h-5 animate-bounce-slow" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-100">{rider?.name || 'Delivery Partner'}</span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-semibold px-1.5 py-0.5 rounded">
                ★ {rider?.rating || 4.8}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 truncate">{riderStatusText}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block">Vehicle</span>
          <span className="text-xs font-mono font-bold text-amber-400">{rider?.vehicleNumber || 'KA 05 AB 1234'}</span>
        </div>
      </div>

      {/* Footer controls */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 backdrop-blur-xs flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> FEEDO Live Tracking
        </span>
        <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700 backdrop-blur-xs">
          Simulated GPS 🟢
        </span>
      </div>
    </div>
  );
};
