import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UtensilsCrossed,
  BookOpen,
  DollarSign,
  Landmark,
  Bike,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge: string;
}

export const OnboardingScreen: React.FC = () => {
  const { setScreen } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);

  const slides: OnboardingSlide[] = [
    {
      title: 'Manage Restaurant Orders',
      subtitle: 'Real-time kitchen order dispatch & prep tracking.',
      description: 'Receive instant audio-alerted orders, view item modifications, manage kitchen prep timers, and package meals with seamless checklists.',
      icon: UtensilsCrossed,
      color: 'from-orange-500 to-amber-500',
      badge: 'Order Management',
    },
    {
      title: 'Manage Restaurant Menu',
      subtitle: 'Instant dish listings, pricing & dietary tags.',
      description: 'Easily add, edit, or toggle dish availability in seconds. Configure Pure Veg, Non-Veg, Egg tags, add-on variants, and promotional combos.',
      icon: BookOpen,
      color: 'from-feedo-500 to-rose-500',
      badge: 'Live Menu Control',
    },
    {
      title: 'Track Restaurant Earnings',
      subtitle: 'Transparent gross bills, commissions & net revenues.',
      description: 'Monitor daily, weekly, and monthly revenues with real-time financial ledgers. Zero hidden fees with clear breakdowns of commissions and GST.',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Financial Transparency',
    },
    {
      title: 'Manage Daily Settlements',
      subtitle: 'Automated 10:00 AM next-day bank payouts.',
      description: 'All fulfilled orders are settled automatically via direct NEFT/IMPS bank transfer every morning by 10:00 AM with complete UTR audit trails.',
      icon: Landmark,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Daily Settlements',
    },
    {
      title: 'Coordinate Delivery Partner Pickups',
      subtitle: 'Secure 4-digit unique pickup code handovers.',
      description: 'Track assigned FEEDO delivery riders in real-time. Verify independent 4-digit pickup codes before handing over tamper-evident food packages.',
      icon: Bike,
      color: 'from-indigo-500 to-violet-600',
      badge: 'Delivery Partner Fleet',
    },
    {
      title: 'Monitor Restaurant Performance',
      subtitle: 'Operational ratings, reviews & customer analytics.',
      description: 'Analyze peak ordering hours, popular customer dishes, customer ratings, repeat patron rates, and kitchen turnaround efficiency.',
      icon: BarChart3,
      color: 'from-amber-600 to-feedo-600',
      badge: 'Store Analytics',
    },
  ];

  const handleFinishOnboarding = () => {
    localStorage.setItem('feedo_onboarding_completed', 'true');
    setScreen('login');
  };

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  const current = slides[activeSlide];
  const Icon = current.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-8 max-w-lg mx-auto">
      {/* Top Header with Skip */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center p-1.5 shadow-xs">
            <img
              src="/feedo-logo.png"
              alt="FEEDO"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <span className="font-black text-slate-900 text-sm font-heading">FEEDO Partner</span>
            <span className="text-[10px] font-bold text-slate-400 block -mt-0.5">Step 6 of 8: Feature Overview</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFinishOnboarding}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 py-1.5 px-3 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
        >
          Skip Intro
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="py-6 flex flex-col items-center text-center">
        {/* Animated Icon Card */}
        <div
          className={`w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-tr ${current.color} flex items-center justify-center text-white shadow-xl mb-6 transform transition-all duration-500`}
        >
          <Icon className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.8]" />
        </div>

        <span className="inline-block px-3 py-1 bg-feedo-50 text-feedo-700 text-xs font-bold rounded-full mb-2.5 border border-feedo-200">
          {current.badge}
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">
          {current.title}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-feedo-600 mb-2.5">
          {current.subtitle}
        </p>
        <p className="text-xs text-slate-600 max-w-xs sm:max-w-sm leading-relaxed">
          {current.description}
        </p>

        {/* Carousel Indicator Dots */}
        <div className="flex items-center gap-1.5 mt-6">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? 'w-8 bg-feedo-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-3">
          {activeSlide > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="py-3.5 px-5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            id="onboarding-next-btn"
            onClick={handleNext}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-feedo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{activeSlide === slides.length - 1 ? 'Continue to Login' : 'Next'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400 text-center">
          Slide {activeSlide + 1} of {slides.length} &bull; FEEDO Restaurant Partner App
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
