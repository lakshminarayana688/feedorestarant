import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { legalService } from '../../services/legalService';
import { authService } from '../../services/authService';
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const { setScreen, restaurant } = useApp();
  const [statusText, setStatusText] = useState('Initializing secure portal...');

  const determineNextScreen = useCallback(async () => {
    setStatusText('Checking account and permission status...');

    // 1. Check if user already authenticated
    const userRes = await authService.getCurrentUser();
    const isAuthenticated = userRes.success && !!userRes.data;

    if (isAuthenticated) {
      const regStatus = restaurant.regStatus || 'DRAFT';
      if (regStatus === 'APPROVED' || regStatus === 'ACTIVE') {
        setScreen('dashboard');
        return;
      } else if (regStatus === 'UNDER_REVIEW' || regStatus === 'REJECTED') {
        setScreen('verification_status');
        return;
      } else if (restaurant.restaurantName) {
        setScreen('dashboard');
        return;
      }
    }

    // 2. Check if permissions setup already completed
    const permissionsDone = localStorage.getItem('feedo_permissions_setup_done') === 'true';
    if (permissionsDone) {
      setScreen('login');
      return;
    }

    // 3. New flow starts at Welcome Screen
    setScreen('welcome');
  }, [setScreen, restaurant.regStatus, restaurant.restaurantName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      determineNextScreen();
    }, 2000);

    return () => clearTimeout(timer);
  }, [determineNextScreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-feedo-950 flex flex-col items-center justify-between p-8 text-white relative overflow-hidden select-none">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-feedo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header with Skip Intro */}
      <div className="w-full flex justify-end z-10">
        <button
          type="button"
          onClick={determineNextScreen}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 bg-slate-900/50 backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Skip Intro</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center FEEDO Brand */}
      <div className="flex flex-col items-center text-center max-w-sm z-10 animate-in fade-in zoom-in duration-700">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/40 border border-amber-400/30 bg-slate-900 p-2">
            <img
              src="/feedo-logo.png"
              alt="FEEDO"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-950 shadow-md">
            PARTNER
          </span>
        </div>

        <h1 className="text-4xl font-black tracking-tight text-white mb-1.5 font-heading">
          FEEDO <span className="text-feedo-400">Partner</span>
        </h1>
        <p className="text-slate-300 text-sm font-medium mb-1">
          Restaurant Partner App
        </p>
        <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
          Grow your culinary business with FEEDO marketplace &amp; instant delivery fleet
        </p>

        {/* Loading shimmer bar */}
        <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-8 mb-3">
          <div className="h-full bg-gradient-to-r from-amber-400 via-feedo-500 to-emerald-400 rounded-full animate-[pulse_1.2s_ease-in-out_infinite] w-full" />
        </div>
        <p className="text-[11px] text-slate-400 animate-pulse font-medium">
          {statusText}
        </p>
      </div>

      {/* Footer */}
      <div className="text-center z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Compliant with FSSAI &bull; DPDP Act 2023 &bull; IT Act 2000</span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
