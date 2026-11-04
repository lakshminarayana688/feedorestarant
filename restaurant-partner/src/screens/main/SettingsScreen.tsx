import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  VolumeX,
  Store,
  LogOut,
  Bell,
  Lock,
} from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const {
    restaurant,
    updateRestaurant,
    orderSoundSettings,
    updateOrderSoundSettings,
    isAudioUnlocked,
    unlockAudio,
    testOrderSound,
    setScreen,
    showToast,
    setIsSignOutModalOpen,
  } = useApp();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Partner Settings
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your restaurant notifications, security, and account preferences.
        </p>
      </div>

      <div className="space-y-6">

        {/* 1. ORDER NOTIFICATIONS & ALERT SOUND */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-feedo-500" />
              <span>Order Notifications &amp; Alert Sound</span>
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                restaurant.newOrderSound
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {restaurant.newOrderSound ? '🔊 Audio Alerts ON' : '🔇 Muted'}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Browser Autoplay Permission Status / Enable Order Sound */}
            {!isAudioUnlocked && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <VolumeX className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Browser Audio Permission Required</p>
                    <p className="text-[11px] text-amber-700">Click below to allow FEEDO order arrival chimes to play in the background.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await unlockAudio();
                    if (ok) {
                      showToast('Browser audio successfully enabled for order alerts!', 'success');
                    }
                  }}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0 cursor-pointer transition-colors"
                >
                  Enable Order Sound
                </button>
              </div>
            )}

            {/* New Order Sound ON/OFF */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <span>New Order Sound Alert</span>
                  {restaurant.newOrderSound ? (
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Play distinct, crystal-clear 2.5s chime when a new customer order is assigned
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !restaurant.newOrderSound;
                  updateRestaurant({ newOrderSound: next });
                  updateOrderSoundSettings({ enabled: next });
                  showToast(`New order sound alert ${next ? 'ENABLED' : 'MUTED'}`, next ? 'success' : 'info');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  restaurant.newOrderSound ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    restaurant.newOrderSound ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Volume & Test Sound */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 max-w-sm">
                <label className="font-bold text-slate-800 block mb-1">Alert Volume</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={orderSoundSettings.volume}
                    onChange={(e) => {
                      const vol = parseFloat(e.target.value);
                      updateOrderSoundSettings({ volume: vol });
                    }}
                    className="w-full accent-feedo-500 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold text-slate-600 w-10 text-right">
                    {Math.round(orderSoundSettings.volume * 100)}%
                  </span>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={testOrderSound}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5 text-feedo-600" />
                  <span>Test Alert Sound</span>
                </button>
              </div>
            </div>

            {/* Auto Accept */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Auto-Accept Customer Orders</h4>
                <p className="text-[11px] text-slate-500">
                  Automatically accept incoming orders without waiting for manual kitchen confirmation
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = !restaurant.autoAcceptOrders;
                  updateRestaurant({ autoAcceptOrders: next });
                  showToast(`Auto-accept is now ${next ? 'ENABLED' : 'DISABLED'}`, next ? 'success' : 'info');
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  restaurant.autoAcceptOrders ? 'bg-emerald-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    restaurant.autoAcceptOrders ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>


        {/* 2. SECURITY & ACCESS PIN */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-feedo-500" />
            <span>App Lock &amp; Financial Security</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Require PIN for Payout Withdrawals</h4>
                <p className="text-[11px] text-slate-500">Require 4-digit security PIN before modifying bank or requesting early settlements</p>
              </div>
              <span className="text-emerald-700 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div>
                <h4 className="font-bold text-slate-800">Mask Customer Contact Numbers</h4>
                <p className="text-[11px] text-slate-500">Protect diner privacy by displaying masked phone numbers (+91 98*** **234)</p>
              </div>
              <span className="text-emerald-700 bg-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Always Active
              </span>
            </div>
          </div>
        </div>

        {/* 3. SWITCH ACCOUNT / LOGOUT */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Store className="w-4 h-4 text-feedo-500" />
            <span>Store Session Management</span>
          </h3>

          <div className="flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-slate-800">Logged in as: {restaurant.restaurantName}</h4>
              <p className="text-[11px] text-slate-400 font-mono">Owner Mobile: {restaurant.ownerPhone}</p>
            </div>
            <button
              onClick={() => setIsSignOutModalOpen(true)}
              className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
