import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { legalService } from '../../services/legalService';
import { Phone, ArrowRight, ShieldCheck, Store, UtensilsCrossed, AlertCircle } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setScreen, restaurant, updateRestaurant, showToast, isDemoMode } = useApp();
  const [mobileNumber, setMobileNumber] = useState('9876543210');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Ensure permissions setup is completed before displaying login
    const hasPermissions = localStorage.getItem('feedo_permissions_setup_done') === 'true';
    if (!hasPermissions) {
      setScreen('welcome');
      return;
    }
  }, [setScreen]);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmed = mobileNumber.trim();
    if (!trimmed) {
      showToast('Please enter your 10-digit mobile number', 'error');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(trimmed)) {
      showToast('Please enter a valid 10-digit Indian mobile number', 'error');
      return;
    }

    setIsLoading(true);
    const cleanPhone = `+91 ${trimmed.slice(0, 5)} ${trimmed.slice(5)}`;
    updateRestaurant({ ownerPhone: cleanPhone });

    try {
      const res = await authService.sendOtp(cleanPhone);
      if (res.success) {
        showToast(res.data?.message || (isDemoMode ? 'OTP sent (Demo code: 123456)' : 'OTP sent to your phone'), 'info');
        setScreen('otp');
      } else {
        showToast(res.error?.message || 'Failed to send OTP', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error sending OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center p-2 shadow-sm">
              <img
                src="/feedo-logo.png"
                alt="FEEDO"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-3xl font-black tracking-tight text-slate-900 font-heading">
              FEEDO
            </span>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full uppercase tracking-wider">
              Restaurant Partner
            </span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
              Mobile Login
            </span>
          </div>
          <p className="text-xs text-slate-500">Sign in to your restaurant management portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleContinue} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Mobile Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-600 text-sm font-bold border-r border-slate-200 pr-2.5">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 10-digit number"
                className="w-full pl-24 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold text-sm tracking-wider focus:outline-hidden focus:border-feedo-500 focus:bg-white transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              We will send a 6-digit verification OTP to this mobile number.
            </p>
          </div>

          <button
            type="submit"
            id="login-continue-btn"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isLoading
                ? 'bg-feedo-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 shadow-lg shadow-feedo-500/25 active:scale-98'
            }`}
          >
            <span>{isLoading ? 'Sending OTP...' : 'Get OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] font-medium text-slate-400">
            or
          </span>
        </div>

        {/* Register Restaurant CTA */}
        <div className="text-center space-y-3">
          <button
            type="button"
            onClick={() => setScreen('register')}
            className="w-full py-3 px-4 rounded-2xl border border-feedo-200 bg-feedo-50/50 hover:bg-feedo-50 text-feedo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Register New Restaurant</span>
          </button>

          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Official FEEDO Partner Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
