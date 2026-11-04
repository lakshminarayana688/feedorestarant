import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut, X } from 'lucide-react';

export const SignOutConfirmModal: React.FC = () => {
  const { isSignOutModalOpen, setIsSignOutModalOpen, confirmSignOut } = useApp();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isSignOutModalOpen) return null;

  const handleConfirm = async () => {
    setIsSigningOut(true);
    try {
      await confirmSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="signout-modal-title"
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 text-center animate-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsSignOutModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <LogOut className="w-7 h-7" />
        </div>

        {/* Title */}
        <h3 id="signout-modal-title" className="text-lg font-black text-slate-900">
          Sign Out
        </h3>

        {/* Message */}
        <p className="text-sm font-semibold text-slate-700 mt-2">
          Are you sure you want to sign out?
        </p>
        <p className="text-xs text-slate-500 mt-1">
          You will be redirected to the login screen and will need to verify your registered mobile number to sign back in.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => setIsSignOutModalOpen(false)}
            disabled={isSigningOut}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            No, Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSigningOut}
            className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isSigningOut ? 'Signing out...' : 'Yes, Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
