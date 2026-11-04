import React, { useState } from 'react';
import { useApp, ScreenName } from '../../context/AppContext';
import {
  Home,
  ShoppingBag,
  Tag,
  BarChart3,
  User,
  Star,
  TicketPercent,
  Users,
  Settings,
  Headphones,
  Bell,
  Store,
  X,
  Utensils,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentScreen, setScreen, orders } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);

  const activeOrdersCount = orders.filter((o) =>
    ['PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PLACED'].includes(o.status)
  ).length;

  type PrimaryTab = { id: ScreenName; label: string; icon: React.FC<{ className?: string }> };

  const primaryTabs: PrimaryTab[] = [
    { id: 'dashboard', label: 'Home',    icon: Home        },
    { id: 'orders',    label: 'Order',   icon: ShoppingBag },
    { id: 'offers',    label: 'Offer',   icon: Tag         },
    { id: 'analytics', label: 'Chart',   icon: BarChart3   },
    { id: 'profile',   label: 'Profile', icon: User        },
  ];

  const moreItems: { id: ScreenName; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'menu',                 label: 'Menu',        icon: Utensils   },
    { id: 'reviews',              label: 'Reviews',     icon: Star       },
    { id: 'staff',                label: 'Staff',       icon: Users      },
    { id: 'earnings',             label: 'Earnings',    icon: BarChart3  },
    { id: 'settings',             label: 'Settings',    icon: Settings   },
    { id: 'support',              label: 'Support',     icon: Headphones },
    { id: 'notifications_center', label: 'Alerts',      icon: Bell       },
    { id: 'profile',              label: 'Profile',     icon: Store      },
  ];

  const isPrimary    = primaryTabs.some((t) => t.id === currentScreen);
  const isMoreActive = !isPrimary && moreItems.some((t) => t.id === currentScreen);

  const handleNav = (id: ScreenName) => { setScreen(id); setMoreOpen(false); };

  return (
    <>
      {/* ── Bottom Bar ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 pt-2 pb-safe pb-3">

          {primaryTabs.map((tab) => {
            const Icon   = tab.icon;
            const isActive   = currentScreen === tab.id;
            const showBadge  = tab.id === 'orders' && activeOrdersCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => { setMoreOpen(false); setScreen(tab.id); }}
                className="flex flex-col items-center gap-0.5 min-w-[52px] relative group"
              >
                {/* Active pill indicator */}
                {isActive && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-[#FFC700]" />
                )}
                <div
                  className={`relative w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${
                    isActive
                      ? 'bg-[#FFC700] shadow-md shadow-amber-200 scale-105'
                      : 'bg-transparent group-hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-slate-900 stroke-[2.5]' : 'text-slate-400 stroke-2'
                    }`}
                  />
                  {showBadge && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm">
                      {activeOrdersCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold transition-colors ${
                    isActive ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* ── More Bottom Sheet ──────────────────────────────────── */}
      {moreOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          {/* Sheet */}
          <div className="md:hidden fixed bottom-[64px] left-0 right-0 z-50 bg-white rounded-t-[2rem] border-t border-slate-100 shadow-2xl p-5 animate-in slide-in-from-bottom-4">
            <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">More Options</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {moreItems.map((item) => {
                const Icon     = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#FFC700] text-slate-900 shadow-sm shadow-amber-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold leading-tight text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
};
