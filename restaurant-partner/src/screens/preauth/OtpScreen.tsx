import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/authService';
import { ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, RefreshCw } from 'lucide-react';
import { soundEffects } from '../../utils/audio';

export const OtpScreen: React.FC = () => {
  const { setScreen, restaurant, showToast, isDemoMode } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    const lastChar = clean.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = lastChar;
    setOtp(newOtp);

    // Auto-focus next input
    if (lastChar && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < pasted.length; i++) {
        newOtp[i] = pasted[i];
      }
      setOtp(newOtp);
      const targetIndex = Math.min(pasted.length, 5);
      document.getElementById(`otp-${targetIndex}`)?.focus();
    }
  };

  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifying || loginSuccess) return;

    const entered = otp.join('');
    if (entered.length < 6) {
      showToast('Please enter the complete 6-digit OTP', 'error');
      return;
    }

    setIsVerifying(true);
    const phone = restaurant.ownerPhone || '+91 98765 43210';

    try {
      const res = await authService.verifyOtp(phone, entered);

      if (!res.success) {
        showToast(res.error?.message || 'Invalid or expired OTP code', 'error');
        setIsVerifying(false);
        return;
      }

      setLoginSuccess(true);
      soundEffects.playAcceptTone();
      showToast('Login successful! Redirecting to Dashboard...', 'success');

      // Navigate to existing FEEDO Restaurant Partner dashboard
      setTimeout(() => {
        setScreen('dashboard');
      }, 700);
    } catch (err: any) {
      showToast(err?.message || 'Verification failed. Please check network connection.', 'error');
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    const phone = restaurant.ownerPhone || '+91 98765 43210';

    try {
      const res = await authService.sendOtp(phone);
      if (res.success) {
        setTimer(30);
        showToast('New verification OTP sent to your phone', 'info');
      } else {
        showToast(res.error?.message || 'Failed to resend OTP', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error resending OTP', 'error');
    } finally {
      setIsResending(false);
    }
  };

  const fillDemoOtp = () => {
    setOtp(['1', '2', '3', '4', '5', '6']);
    showToast('Demo OTP 123456 auto-filled', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setScreen('login')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mobile Login</span>
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex p-3 bg-feedo-50 text-feedo-600 rounded-2xl mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Enter Verification Code</h2>
          <p className="text-xs text-slate-500 mt-1">
            6-digit OTP sent to <span className="font-bold text-slate-800">{restaurant.ownerPhone || '+91 98765 43210'}</span>
          </p>
        </div>

        {/* Prototype Demo Code Shortcut (in Demo Mode) */}
        {isDemoMode && (
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
            <div className="text-xs text-amber-900">
              <span className="font-bold">Prototype Demo Code:</span> <code className="bg-amber-100 px-1.5 py-0.5 rounded font-bold">123456</code>
            </div>
            <button
              type="button"
              onClick={fillDemoOtp}
              className="text-xs font-bold text-feedo-700 bg-white px-2.5 py-1 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-50 cursor-pointer"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* 6-digit Inputs */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isVerifying}
                className="w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-2xl text-slate-900 focus:outline-hidden focus:border-feedo-500 focus:bg-white transition-all shadow-2xs"
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <button
            type="submit"
            id="otp-verify-btn"
            disabled={isVerifying || loginSuccess}
            className={`w-full py-3.5 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              loginSuccess
                ? 'bg-emerald-600 shadow-lg shadow-emerald-600/25'
                : isVerifying
                ? 'bg-feedo-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 shadow-lg shadow-feedo-500/25 active:scale-98'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {loginSuccess
                ? 'Login Successful! Loading...'
                : isVerifying
                ? 'Verifying Code...'
                : 'Verify & Continue'}
            </span>
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-6 text-center">
          {timer > 0 ? (
            <p className="text-xs text-slate-400">
              Resend OTP in <span className="font-bold text-feedo-600">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-xs font-bold text-feedo-600 hover:text-feedo-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
              <span>{isResending ? 'Resending...' : 'Resend OTP'}</span>
            </button>
          )}
        </div>

        {/* Security Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Encrypted Session &bull; Supabase Auth Protected</span>
        </div>
      </div>
    </div>
  );
};

export default OtpScreen;
