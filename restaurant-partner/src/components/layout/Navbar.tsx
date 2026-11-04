import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Menu,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    restaurant,
    notifications,
    setIsNotificationsOpen,
    setScreen,
    currentUserRole,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Button + FEEDO Brand Lockup + Restaurant Info */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              id="hamburger-nav-btn"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              title={isMobileDrawerOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Navigation Menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            {/* FEEDO Brand Logo (Fork Pin + FEEDO wordmark) */}
            <div
              className="flex items-center gap-2 cursor-pointer shrink-0"
              onClick={() => setScreen('dashboard')}
              title="FEEDO Dashboard"
            >
              <img
                src="/feedo-logo.png"
                alt="FEEDO"
                className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
              />
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-heading">
                FEEDO
              </span>
            </div>

            <div className="h-5 w-px bg-slate-200 hidden sm:block shrink-0" />

            {/* Restaurant Info */}
            <div className="min-w-0 hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-xs sm:text-sm font-bold text-slate-700 leading-tight truncate">
                  {restaurant.restaurantName}
                </h1>
                <span className="hidden md:inline-flex items-center gap-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                  ★ {restaurant.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Operational Controls & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Real Notifications Bell */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              title="Notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Avatar / Role */}
            <button
              onClick={() => setScreen('profile')}
              title="Restaurant Profile & Settings"
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer"
            >
              <img
                src={restaurant.logoUrl}
                alt="Restaurant"
                className="w-7 h-7 rounded-xl object-cover border border-slate-200"
              />
              <div className="hidden md:block text-left">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {restaurant.ownerName.split(' ')[0]}
                </span>
                <span className="text-[10px] font-semibold text-feedo-600 block uppercase">
                  {currentUserRole}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
