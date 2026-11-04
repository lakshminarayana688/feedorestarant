import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, X, Moon, Clock, Check } from 'lucide-react';

export const OfflineModal: React.FC = () => {
  const { isOfflineModalOpen, setIsOfflineModalOpen, updateRestaurant, showToast } = useApp();
  const [selectedDuration, setSelectedDuration] = useState<'today' | '1hour' | '2hours' | 'indefinite'>('today');

  if (!isOfflineModalOpen) return null;

  const handleConfirmOffline = () => {
    updateRestaurant({ isOnline: false });
    setIsOfflineModalOpen(false);
    const label =
      selectedDuration === 'today'
        ? 'Rest of today'
        : selectedDuration === '1hour'
        ? 'For 1 hour'
        : selectedDuration === '2hours'
        ? 'For 2 hours'
        : 'Indefinitely';
    showToast(`Restaurant is now OFFLINE (${label}). Customers cannot place new orders.`, 'warning');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        <button
          onClick={() => setIsOfflineModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Switch to Offline?</h3>
            <p className="text-xs text-slate-500">Stop receiving customer orders</p>
          </div>
        </div>

        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 mb-5 text-xs text-amber-900 leading-relaxed">
          <p className="font-semibold flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" /> Note:
          </p>
          Your restaurant will appear closed to customers on the FEEDO customer app. Any active preparing orders must still be completed.
        </div>

        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-600">Turn offline until:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedDuration('today')}
              className={`py-2 px-3 text-xs font-medium rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                selectedDuration === 'today'
                  ? 'border-feedo-500 bg-feedo-50 text-feedo-800 font-bold ring-2 ring-feedo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Rest of today</span>
              {selectedDuration === 'today' && <Check className="w-3.5 h-3.5 text-feedo-600" />}
            </button>
            <button
              type="button"
              onClick={() => setSelectedDuration('1hour')}
              className={`py-2 px-3 text-xs font-medium rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                selectedDuration === '1hour'
                  ? 'border-feedo-500 bg-feedo-50 text-feedo-800 font-bold ring-2 ring-feedo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>For 1 hour</span>
              {selectedDuration === '1hour' && <Check className="w-3.5 h-3.5 text-feedo-600" />}
            </button>
            <button
              type="button"
              onClick={() => setSelectedDuration('2hours')}
              className={`py-2 px-3 text-xs font-medium rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                selectedDuration === '2hours'
                  ? 'border-feedo-500 bg-feedo-50 text-feedo-800 font-bold ring-2 ring-feedo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>For 2 hours</span>
              {selectedDuration === '2hours' && <Check className="w-3.5 h-3.5 text-feedo-600" />}
            </button>
            <button
              type="button"
              onClick={() => setSelectedDuration('indefinite')}
              className={`py-2 px-3 text-xs font-medium rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                selectedDuration === 'indefinite'
                  ? 'border-feedo-500 bg-feedo-50 text-feedo-800 font-bold ring-2 ring-feedo-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>Until turned ON</span>
              {selectedDuration === 'indefinite' && <Check className="w-3.5 h-3.5 text-feedo-600" />}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsOfflineModalOpen(false)}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Stay Online
          </button>
          <button
            type="button"
            onClick={handleConfirmOffline}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            Yes, Go Offline
          </button>
        </div>
      </div>
    </div>
  );
};
