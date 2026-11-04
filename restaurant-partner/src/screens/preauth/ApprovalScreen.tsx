import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, ArrowRight, Store, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ApprovalScreen: React.FC = () => {
  const { setScreen, restaurant } = useApp();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center animate-in zoom-in-95 duration-500">
        {/* Large Success Icon */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 border-4 border-emerald-200">
          <CheckCircle2 className="w-14 h-14" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-4 border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Official FEEDO Partner Merchant</span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Congratulations! 🎉
        </h1>
        <p className="text-sm font-bold text-feedo-600 mb-2">
          Your restaurant has been approved on FEEDO.
        </p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed">
          <strong className="text-slate-800">{restaurant.restaurantName}</strong> is now officially verified. Complete a few final store setup settings to start receiving customer orders!
        </p>

        {/* Benefits Card */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 mb-8 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Menu & live pricing unlocked</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Instant delivery partner allocation enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-500 font-bold">✓</span>
            <span>Direct daily payouts to HDFC Bank ****9921</span>
          </div>
        </div>

        <button
          onClick={() => setScreen('setup')}
          className="w-full py-4 px-6 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-feedo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Complete Restaurant Setup</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
