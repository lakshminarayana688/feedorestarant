import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  Store,
  Bell,
  Clock,
  TrendingUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const WelcomeScreen: React.FC = () => {
  const { setScreen } = useApp();

  const handleGetStarted = () => {
    // Proceed to Step 3: Notification Permission
    setScreen('permissions');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-3 shadow-md mb-4">
              <img
                src="/feedo-logo.png"
                alt="FEEDO"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-heading">
                FEEDO
              </span>
              <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full">
                Partner
              </span>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Welcome to FEEDO Partner
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs">
              Manage your kitchen orders, track live dispatch, and grow your restaurant business seamlessly.
            </p>
          </div>

          {/* Key Capabilities Showcase */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-900">
                  Instant Order Alerts
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Real-time kitchen order dispatch alerts with loud audio chimes so your staff never miss an order.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-900">
                  Daily 10:00 AM Settlements
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Direct next-day bank account payouts with transparent deductions and zero hidden charges.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-900">
                  Fleet &amp; Menu Control
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Real-time rider coordination with 4-digit pickup handover verification and live dish toggles.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy & Trust Badge */}
          <div className="flex items-center justify-center gap-2 py-1 text-[11px] font-semibold text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session &bull; Verified Partner Portal</span>
          </div>

          {/* Get Started Action */}
          <div className="pt-2">
            <button
              type="button"
              id="welcome-get-started-btn"
              onClick={handleGetStarted}
              className="w-full py-4 px-6 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-feedo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 py-2">
        FEEDO Restaurant Partner Portal &bull; Version 1.0.0
      </div>
    </div>
  );
};

