import React, { useEffect } from 'react';
import { useApp, ScreenName, UserRole } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Utensils,
  BarChart3,
  Wallet,
  TicketPercent,
  Star,
  Settings,
  LogOut,
  Users,
  Bell,
  Headphones,
  Store,
  X,
} from 'lucide-react';

interface NavItem {
  id: ScreenName;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: string | number;
  allowedRoles?: UserRole[];
}

export const Sidebar: React.FC = () => {
  const {
    currentScreen,
    setScreen,
    orders,
    restaurant,
    currentUserRole,
    isMobileDrawerOpen,
    setIsMobileDrawerOpen,
    setIsSignOutModalOpen,
  } = useApp();

  // Prevent background scrolling when navigation drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  const activeOrdersCount = orders.filter((o) =>
    ['PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PLACED'].includes(o.status)
  ).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'] },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: activeOrdersCount > 0 ? activeOrdersCount : undefined, allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'] },
    { id: 'menu', label: 'Restaurant Menu', icon: Utensils, allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, allowedRoles: ['OWNER', 'MANAGER'] },
    { id: 'earnings', label: 'Earnings', icon: Wallet, allowedRoles: ['OWNER', 'MANAGER'] },
    { id: 'offers', label: 'Promotions', icon: TicketPercent, allowedRoles: ['OWNER', 'MANAGER'] },
    { id: 'reviews', label: 'Reviews', icon: Star, allowedRoles: ['OWNER', 'MANAGER'] },
    { id: 'staff', label: 'Staff Management', icon: Users, allowedRoles: ['OWNER', 'MANAGER'] },
    { id: 'notifications_center', label: 'Notifications', icon: Bell, allowedRoles: ['OWNER', 'MANAGER', 'STAFF', 'KITCHEN', 'CASHIER'] },
    { id: 'support', label: 'Support', icon: Headphones, allowedRoles: ['OWNER', 'MANAGER', 'STAFF'] },
    { id: 'profile', label: 'Restaurant Profile', icon: Store, allowedRoles: ['OWNER', 'MANAGER'] },
  ];

  const visibleNav = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(currentUserRole)
  );

  const handleNavClick = (screenId: ScreenName) => {
    setScreen(screenId);
    if (isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    setIsSignOutModalOpen(true);
    if (isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  };

  return (
    <>
      {/* =========================================================
          NAVIGATION SIDEBAR / DRAWER (Desktop, Tablet & Mobile)
          Opened via Hamburger (☰) button in header
      ========================================================= */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 select-none">
          {/* Semi-transparent dark overlay (Click outside to close) */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Slide-out White Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-[85vw] sm:w-80 md:w-80 max-w-[340px] min-w-[280px] h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-250 ease-out">
            {/* Header (Fixed) */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src="/feedo-logo.png"
                  alt="FEEDO"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
                />
                <span className="text-xl font-black tracking-tight text-slate-900 font-heading">
                  FEEDO
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md ml-1">
                  Partner
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                title="Close Navigation"
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation List (Scrolls independently) */}
            <nav className="flex-1 px-3.5 py-3 space-y-1.5 overflow-y-auto overscroll-contain">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full h-12 flex items-center gap-3.5 px-3.5 rounded-2xl text-sm transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FFC700] text-slate-900 font-bold shadow-xs'
                        : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-[22px] h-[22px] shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                    <span className="truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-slate-900 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Subtle divider before Settings */}
              <div className="my-2 border-t border-slate-100" />

              {/* Settings Nav Item */}
              <button
                id="nav-settings"
                onClick={() => handleNavClick('settings')}
                className={`w-full h-12 flex items-center gap-3.5 px-3.5 rounded-2xl text-sm transition-all cursor-pointer ${
                  currentScreen === 'settings'
                    ? 'bg-[#FFC700] text-slate-900 font-bold shadow-xs'
                    : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Settings className={`w-[22px] h-[22px] shrink-0 ${currentScreen === 'settings' ? 'text-slate-900' : 'text-slate-500'}`} />
                <span className="truncate">Settings</span>
              </button>
            </nav>

            {/* Profile Section (Fixed at bottom) */}
            <div className="p-3.5 border-t border-slate-100 bg-white shrink-0">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-amber-100 border-2 border-[#FFC700] overflow-hidden shrink-0">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 overflow-hidden min-w-0 text-left">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {restaurant.restaurantName || 'The Golden Grill'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium truncate">
                    {currentUserRole === 'OWNER' ? 'Owner' : 'Manager'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  aria-label="Sign Out"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
export default Sidebar;
