import React from 'react';
import { useApp, ScreenName } from '../../context/AppContext';
import {
  Sparkles,
  Zap,
  RotateCcw,
  Smartphone,
  Monitor,
  Bike,
  ChevronDown,
  Shield,
  Activity,
  Volume2,
} from 'lucide-react';

export const DemoToolbar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    simulateNewIncomingOrder,
    testOrderSound,
    setIsRiderSimulatorOpen,
    viewMode,
    setViewMode,
    resetAllDemoData,
    appMode,
    setAppMode,
    isDemoMode,
  } = useApp();

  // The Demo Controller must only appear in DEMO MODE
  if (!isDemoMode) {
    return (
      <div className="bg-slate-900 text-slate-300 text-xs px-3 py-1.5 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-slate-100 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> PRODUCTION MODE ACTIVE (Live Supabase & Edge Functions)
          </span>
        </div>
        <button
          onClick={() => setAppMode('DEMO')}
          className="text-[11px] font-bold text-feedo-400 hover:text-feedo-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors cursor-pointer"
        >
          Switch to Demo Mode
        </button>
      </div>
    );
  }

  const screens: { id: ScreenName; label: string; group: string }[] = [
    // Pre-Auth / Onboarding
    { id: 'splash', label: '1. Splash Screen', group: 'Onboarding & Registration' },
    { id: 'onboarding', label: '2. Onboarding Slides', group: 'Onboarding & Registration' },
    { id: 'login', label: '3. Mobile Login (OTP: 123456)', group: 'Onboarding & Registration' },
    { id: 'otp', label: '4. OTP Verification', group: 'Onboarding & Registration' },
    { id: 'register', label: '5. Restaurant Registration', group: 'Onboarding & Registration' },
    { id: 'documents', label: '6. Document Uploads', group: 'Onboarding & Registration' },
    { id: 'verification_status', label: '7. Verification Status', group: 'Onboarding & Registration' },
    { id: 'approval', label: '8. Approval Celebration', group: 'Onboarding & Registration' },
    { id: 'setup', label: '9. Restaurant Setup', group: 'Onboarding & Registration' },
    // Main Section
    { id: 'dashboard', label: '10. Overview Dashboard', group: 'Main Operations' },
    { id: 'orders', label: '11. Live Orders Hub', group: 'Main Operations' },
    { id: 'menu', label: '12. Menu Manager', group: 'Main Operations' },
    { id: 'analytics', label: '13. Analytics & Growth', group: 'Main Operations' },
    { id: 'offers', label: '14. Promotions & Offers', group: 'Main Operations' },
    { id: 'settings', label: '15. Settings & Automation', group: 'Main Operations' },
    // Business Tools
    { id: 'inventory', label: '16. Inventory & Stock', group: 'Business Tools' },
    { id: 'earnings', label: '17. Finance & Settlements', group: 'Business Tools' },
    { id: 'reviews', label: '18. Reviews & Ratings', group: 'Business Tools' },
    { id: 'profile', label: '19. Restaurant Profile', group: 'Business Tools' },
    { id: 'documents_compliance', label: '20. Compliance & Docs', group: 'Business Tools' },
    { id: 'staff', label: '21. Staff & Operations', group: 'Business Tools' },
    { id: 'notifications_center', label: '22. Notifications Center', group: 'Business Tools' },
    { id: 'support', label: '23. FEEDO Support Hub', group: 'Business Tools' },
    // Platform Administration
    { id: 'admin', label: '24. FEEDO Platform Admin Console', group: 'Platform Administration' },
  ];

  return (
    <div className="bg-slate-950 text-white text-xs px-3 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xl sticky top-0 z-50 select-none">
      {/* Brand & Screen Dropdown */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/30 to-feedo-500/20 text-amber-400 font-black px-2.5 py-1 rounded-lg border border-amber-500/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>DEMO MODE CONTROLLER</span>
        </div>

        {/* Screen Jump Selector */}
        <div className="relative inline-flex items-center">
          <select
            value={currentScreen}
            onChange={(e) => setScreen(e.target.value as ScreenName)}
            className="bg-slate-900 text-slate-100 text-xs font-bold py-1.5 pl-3 pr-8 rounded-xl border border-slate-700 hover:border-slate-500 focus:outline-hidden focus:border-feedo-500 cursor-pointer appearance-none"
          >
            <optgroup label="Onboarding & Registration">
              {screens.filter((s) => s.group === 'Onboarding & Registration').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Main Restaurant Operations">
              {screens.filter((s) => s.group === 'Main Operations').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Business Tools">
              {screens.filter((s) => s.group === 'Business Tools').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Platform Administration">
              {screens.filter((s) => s.group === 'Platform Administration').map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Quick Interactive Actions */}
      <div className="flex items-center gap-2">
        {/* Simulate Order CTA */}
        <button
          onClick={simulateNewIncomingOrder}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-feedo-500 hover:from-amber-600 hover:to-feedo-600 text-white font-black text-xs shadow-md shadow-feedo-500/25 transition-all cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>+ Simulate Customer Order</span>
        </button>

        {/* Test Order Sound CTA */}
        <button
          onClick={testOrderSound}
          title="Test Order Assignment Notification Sound"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 font-bold text-xs shadow-xs transition-all cursor-pointer"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Test Order Sound</span>
        </button>

        {/* Rider Companion Modal Toggle */}
        <button
          onClick={() => setIsRiderSimulatorOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Rider Simulator</span>
        </button>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-900 rounded-xl p-0.5 border border-slate-700">
          <button
            onClick={() => setViewMode('responsive')}
            title="Full Fluid Desktop View"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'responsive'
                ? 'bg-feedo-500 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('mobile_frame')}
            title="Mobile Smartphone Frame Simulator"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              viewMode === 'mobile_frame'
                ? 'bg-feedo-500 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone Frame</span>
          </button>
        </div>

        {/* Mode Switcher */}
        <button
          onClick={() => setAppMode('PRODUCTION')}
          title="Switch to Live Production Mode"
          className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700 transition-colors cursor-pointer"
        >
          Go Live
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetAllDemoData}
          title="Reset all demo data"
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
