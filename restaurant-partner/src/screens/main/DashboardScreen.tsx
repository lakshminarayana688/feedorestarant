import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  CheckCircle,
  XCircle,
  Star,
  ChevronRight,
  Zap,
  Clock,
  Package,
  TrendingUp,
  CheckCircle2,
  Flame,
  Search,
  SlidersHorizontal,
  Heart,
  Filter,
} from 'lucide-react';
import { OrderFilterModal, DashboardFilterOptions } from '../../components/dashboard/OrderFilterModal';

const QUICK_CATEGORIES = ['All', 'New Orders', 'Preparing', 'Ready', 'Completed'];

export const DashboardScreen: React.FC = () => {
  const {
    restaurant,
    toggleOnlineStatus,
    orders,
    setSelectedOrder,
    setScreen,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<DashboardFilterOptions>({
    status: 'ALL',
    sortBy: 'NEWEST',
    dietary: 'ALL',
    paymentMode: 'ALL',
  });

  const hasActiveFilters =
    filterOptions.status !== 'ALL' ||
    filterOptions.sortBy !== 'NEWEST' ||
    filterOptions.dietary !== 'ALL' ||
    filterOptions.paymentMode !== 'ALL';

  const activeOrders = useMemo(() =>
    orders.filter((o) =>
      ['PLACED', 'PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)
    ), [orders]);

  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === 'DELIVERED'), [orders]);
  const cancelledOrders = useMemo(() =>
    orders.filter((o) => ['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED'].includes(o.status)), [orders]);

  const filteredOrders = useMemo(() => {
    let list = orders;

    // 1. Status filter (modal filter takes precedence if set, otherwise category pill)
    if (filterOptions.status !== 'ALL') {
      if (filterOptions.status === 'NEW') list = list.filter(o => ['PLACED', 'PAYMENT_CONFIRMED'].includes(o.status));
      else if (filterOptions.status === 'PREPARING') list = list.filter(o => o.status === 'PREPARING');
      else if (filterOptions.status === 'READY') list = list.filter(o => o.status === 'READY_FOR_PICKUP');
      else if (filterOptions.status === 'COMPLETED') list = list.filter(o => o.status === 'DELIVERED');
      else if (filterOptions.status === 'CANCELLED') list = list.filter(o => ['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED'].includes(o.status));
    } else {
      if (activeCategory === 'All') list = activeOrders;
      else if (activeCategory === 'New Orders') list = list.filter(o => ['PLACED', 'PAYMENT_CONFIRMED'].includes(o.status));
      else if (activeCategory === 'Preparing') list = list.filter(o => o.status === 'PREPARING');
      else if (activeCategory === 'Ready') list = list.filter(o => o.status === 'READY_FOR_PICKUP');
      else if (activeCategory === 'Completed') list = deliveredOrders;
    }

    // 2. Dietary filter
    if (filterOptions.dietary === 'VEG') {
      list = list.filter(o => o.items.every(i => i.isVeg));
    } else if (filterOptions.dietary === 'NON_VEG') {
      list = list.filter(o => o.items.some(i => !i.isVeg));
    }

    // 3. Payment mode filter
    if (filterOptions.paymentMode === 'ONLINE') {
      list = list.filter(o => o.paymentStatus !== 'COD' && o.paymentMethod !== 'Cash on Delivery');
    } else if (filterOptions.paymentMode === 'COD') {
      list = list.filter(o => o.paymentStatus === 'COD' || o.paymentMethod === 'Cash on Delivery');
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q)) ||
        o.customer.name.toLowerCase().includes(q)
      );
    }

    // 5. Sorting
    if (filterOptions.sortBy === 'PRICE_HIGH') {
      list = [...list].sort((a, b) => b.total - a.total);
    } else if (filterOptions.sortBy === 'PRICE_LOW') {
      list = [...list].sort((a, b) => a.total - b.total);
    }

    return list;
  }, [orders, activeOrders, deliveredOrders, activeCategory, searchQuery, filterOptions]);

  return (
    <div className="min-h-screen bg-[#F8F8F8]">

      {/* ── Top Header ─────────────────────────────────────── */}
      <div className="bg-white px-4 pt-5 pb-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium">Welcome back 👋</p>
            <h1 className="text-lg font-black text-slate-900 leading-tight">
              {restaurant.restaurantName || 'Lucky Family Restaurant'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleOnlineStatus}
              title={restaurant.isOnline ? 'Switch kitchen to Offline' : 'Switch kitchen to Online'}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer hover:shadow-xs active:scale-95 select-none ${
                restaurant.isOnline
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${restaurant.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {restaurant.isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
        </div>

        {/* ── Search Bar ── */}
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search orders here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs text-slate-700 placeholder-slate-400 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            title="Filter & sort order queue"
            aria-label="Filter & sort order queue"
            className="relative w-10 h-10 flex items-center justify-center bg-[#FFC700] hover:bg-[#e6b400] active:scale-95 rounded-2xl shadow-sm shadow-amber-200 shrink-0 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-900" />
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-slate-900 border-2 border-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 pb-28">

        {/* ── Hero Banner: Kitchen / Promo ─────────────────── */}
        <div className="relative bg-slate-900 rounded-3xl overflow-hidden h-40 shadow-xl shadow-slate-900/20">
          <img
            src="https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=800&q=80"
            alt="Kitchen"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          {/* Discount badge */}
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-[#FFC700] rounded-2xl px-3 py-1.5 shadow-lg">
              <p className="text-[9px] font-bold text-slate-900 uppercase tracking-wide">Delicious Savings</p>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {activeOrders.length > 0 ? activeOrders.length : '0'}
                </span>
                <span className="text-[10px] font-bold text-slate-700 ml-1">
                  {activeOrders.length > 0 ? 'Active' : 'Orders'}
                </span>
              </div>
            </div>
          </div>
          <div className="relative z-10 p-4 h-full flex flex-col justify-end">
            <h2 className="text-white font-black text-base leading-tight">
              {activeOrders.length > 0
                ? `${activeOrders.length} Active Order${activeOrders.length > 1 ? 's' : ''}`
                : 'Kitchen Ready'}
            </h2>
            <div className="flex items-center justify-between mt-2">
              <p className="text-slate-300 text-[11px]">
                {activeOrders.length > 0
                  ? 'Tap to manage live kitchen queue'
                  : restaurant.isOnline ? 'Accepting new orders' : 'Restaurant is currently offline'}
              </p>
              <button
                onClick={() => setScreen('orders')}
                className="flex items-center gap-1.5 bg-[#FFC700] text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" /> View All
              </button>
            </div>
          </div>
        </div>

        {/* ── Category Filter Pills ────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900">Order Queue</h2>
            <button onClick={() => setScreen('orders')} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-0.5">
              See All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#FFC700] text-slate-900 shadow-sm shadow-amber-200'
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-amber-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Quick Stats Row ──────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active',    value: activeOrders.length,    icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
            { label: 'Completed', value: deliveredOrders.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
            { label: 'Cancelled', value: cancelledOrders.length, icon: XCircle,     color: 'text-rose-600',    bg: 'bg-rose-50',    border: 'border-rose-100'    },
          ].map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-2xl p-3.5 border ${border} shadow-sm text-center`}>
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Live Order Cards (filtered) ──────────────────── */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <Package className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-black text-slate-900 font-mono">#{order.id.slice(0, 8)}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      order.status === 'PREPARING'         ? 'bg-orange-100 text-orange-700' :
                      order.status === 'READY_FOR_PICKUP'  ? 'bg-blue-100 text-blue-700'    :
                      order.status === 'DELIVERED'         ? 'bg-emerald-100 text-emerald-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-slate-600">₹{order.total}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl py-10 text-center border border-slate-100 shadow-sm">
              <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-200" />
              <p className="text-xs text-slate-400">No orders in this category</p>
              <p className="text-[10px] text-slate-300 mt-0.5">Kitchen queue is clear</p>
            </div>
          )}
        </div>

        {/* ── Quick Performance Summary ────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-slate-900">Quick Performance</h2>
            <button onClick={() => setScreen('analytics')} className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-0.5">
              Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Orders',    value: orders.length,  sub: 'All time', icon: ShoppingBag, color: 'text-blue-600',    bg: 'bg-blue-50'    },
              { label: 'Completion Rate', value: orders.length > 0 ? `${Math.round((deliveredOrders.length / orders.length) * 100)}%` : '0%', sub: 'Delivered', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Avg Order Value', value: orders.length > 0 ? `₹${Math.round(orders.reduce((s, o) => s + (Number(o.total) || 0), 0) / orders.length)}` : '₹0', sub: 'Per checkout', icon: CheckCircle2, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'Rating',          value: `★ ${restaurant.rating}`, sub: 'Customer rating', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 flex items-center gap-3">
                <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-900">{value}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{label}</p>
                  <p className="text-[9px] text-slate-300">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Reviews ───────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-slate-900">Recent Reviews</h2>
            <button onClick={() => setScreen('reviews')} className="text-xs font-bold text-amber-600 hover:underline">See All</button>
          </div>
          <div className="flex items-center gap-1 mb-3">
            {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
            <span className="text-xs font-black text-slate-900 ml-1">{restaurant.rating}</span>
            <span className="text-[10px] text-slate-400 ml-1">Overall rating</span>
          </div>
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-1 mb-1.5">
                {[1,2,3,4,5].map((s) => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                <span className="text-[10px] text-slate-400 ml-auto">2h ago</span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "Authentic dum aroma and succulent meat portions. Packaging was completely spill-proof."
              </p>
              <p className="text-[10px] font-bold text-slate-800 mt-1.5">— Kavita Sundaram</p>
            </div>
          </div>
        </div>

        {/* ── Active Promotions ────────────────────────────── */}
        <div className="bg-slate-900 rounded-3xl p-5 relative overflow-hidden shadow-xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC700]/20 rounded-full -mr-12 -mt-12" />
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#FFC700]/10 rounded-full -ml-8 -mb-8" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-black text-white">Active Promotions</h2>
              <button onClick={() => setScreen('offers')} className="ml-auto text-[10px] text-amber-300 hover:underline font-bold">
                Manage →
              </button>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 mb-3 border border-white/10 backdrop-blur-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Weekend Feast Campaign</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">
                    20% off · Code: <span className="text-[#FFC700] font-mono font-bold">FEAST20</span>
                  </p>
                </div>
                <div className="bg-[#FFC700] rounded-xl px-2.5 py-1 ml-3 shrink-0">
                  <p className="text-[10px] font-black text-slate-900">30%</p>
                  <p className="text-[8px] text-slate-700 font-bold">OFF</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">ACTIVE</span>
                <span className="text-[9px] text-slate-400">Ends Sunday midnight</span>
              </div>
            </div>
            <button
              onClick={() => setScreen('offers')}
              className="w-full py-2.5 bg-[#FFC700] text-slate-900 font-bold text-xs rounded-2xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
            >
              + Create New Promotion
            </button>
          </div>
        </div>

        {/* ── Quick Nav Shortcuts ──────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Earnings', screen: 'earnings'  as const, icon: '💰', desc: 'Sales & settlements', color: 'hover:bg-amber-50 hover:border-amber-200'  },
            { label: 'Support',  screen: 'support'   as const, icon: '🎧', desc: 'Help & tickets',     color: 'hover:bg-blue-50 hover:border-blue-200'    },
            { label: 'Analytics',screen: 'analytics' as const, icon: '📊', desc: 'Business insights',  color: 'hover:bg-emerald-50 hover:border-emerald-200' },
          ].map(({ label, screen, icon, desc, color }) => (
            <button
              key={label}
              onClick={() => setScreen(screen)}
              className={`bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm ${color} transition-all text-center active:scale-95`}
            >
              <p className="text-2xl mb-1.5">{icon}</p>
              <p className="text-[10px] font-bold text-slate-800">{label}</p>
              <p className="text-[9px] text-slate-400">{desc}</p>
            </button>
          ))}
        </div>

        {/* ── FEEDO Promise Footer Banner ─────────────────── */}
        <div className="pt-2">
          <div className="w-full rounded-3xl overflow-hidden shadow-md">
            <img
              src="/feedo-footer.svg?v=2"
              alt="FEEDO Promise - Deliver Smarter • Earn Clearly"
              className="w-full h-auto block"
            />
          </div>
        </div>

      </div>

      {/* ── Filter & Sort Modal ──────────────────────────── */}
      <OrderFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filterOptions}
        onChangeFilters={setFilterOptions}
        onResetFilters={() =>
          setFilterOptions({
            status: 'ALL',
            sortBy: 'NEWEST',
            dietary: 'ALL',
            paymentMode: 'ALL',
          })
        }
        matchingCount={filteredOrders.length}
      />
    </div>
  );
};
export default DashboardScreen;
