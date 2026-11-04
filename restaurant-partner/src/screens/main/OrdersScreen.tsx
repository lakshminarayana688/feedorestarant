import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types/order';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VegIndicator } from '../../components/common/VegIndicator';
import {
  Search,
  Clock,
  Bike,
  CheckCircle2,
  Zap,
  Eye,
  Utensils,
  PackageCheck,
  KeyRound,
  Volume2,
  ShoppingBag,
  XCircle,
  BarChart3,
  CalendarDays,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { FeedoDispatchAgentModal } from '../../components/chat/FeedoDispatchAgentModal';

type TabType = 'ALL' | 'NEW' | 'PREPARING' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED';
type DateRange = 'today' | '7days' | '30days' | 'all';

export const OrdersScreen: React.FC = () => {
  const {
    setScreen,
    orders,
    setSelectedOrder,
    testOrderSound,
    startPreparingOrder,
    markFoodReady,
    verifyPickup,
    confirmHandover,
    startOutForDelivery,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [isDispatchAgentOpen, setIsDispatchAgentOpen] = useState(false);

  // ── Date-filtered orders ──────────────────────────────────────
  const dateFilteredOrders = useMemo(() => {
    if (dateRange === 'all') return orders;
    const now = new Date();
    return orders.filter((o) => {
      // createdAt is a string like "10:32 AM" or could be a date string — 
      // since demo data uses time strings, we include all for non-today ranges
      // and use index-based simulation for today vs history
      if (dateRange === 'today') return true; // all demo orders are "today"
      if (dateRange === '7days') return true;
      if (dateRange === '30days') return true;
      return true;
    });
  }, [orders, dateRange]);

  // ── Summary statistics (from date-filtered orders) ───────────
  const stats = useMemo(() => {
    const total     = dateFilteredOrders.length;
    const completed = dateFilteredOrders.filter((o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP').length;
    const cancelled = dateFilteredOrders.filter((o) =>
      ['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED', 'EXPIRED'].includes(o.status)
    ).length;
    const restaurantCancelled = dateFilteredOrders.filter((o) => o.status === 'RESTAURANT_REJECTED').length;
    const customerCancelled   = dateFilteredOrders.filter((o) => o.status === 'CUSTOMER_CANCELLED').length;

    const days = dateRange === 'today' ? 1 : dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : Math.max(1, total);
    const avgPerDay = total > 0 ? parseFloat((total / days).toFixed(1)) : 0;

    return { total, completed, cancelled, avgPerDay, restaurantCancelled, customerCancelled };
  }, [dateFilteredOrders, dateRange]);

  // ── Tab-filtered orders ───────────────────────────────────────
  const filteredOrders = useMemo(() => {
    return dateFilteredOrders.filter((order) => {
      let matchesTab = true;
      switch (activeTab) {
        case 'NEW':       matchesTab = ['CREATED', 'PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED'].includes(order.status); break;
        case 'PREPARING': matchesTab = order.status === 'PREPARING'; break;
        case 'READY':     matchesTab = ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PICKUP_VERIFIED'].includes(order.status); break;
        case 'PICKED_UP': matchesTab = ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(order.status); break;
        case 'DELIVERED': matchesTab = order.status === 'DELIVERED'; break;
        case 'CANCELLED': matchesTab = ['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED', 'EXPIRED'].includes(order.status); break;
        default:          matchesTab = true;
      }
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [dateFilteredOrders, activeTab, searchQuery]);

  const getTabCount = (tab: TabType): number => {
    switch (tab) {
      case 'NEW':       return dateFilteredOrders.filter((o) => ['CREATED', 'PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED'].includes(o.status)).length;
      case 'PREPARING': return dateFilteredOrders.filter((o) => o.status === 'PREPARING').length;
      case 'READY':     return dateFilteredOrders.filter((o) => ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PICKUP_VERIFIED'].includes(o.status)).length;
      case 'PICKED_UP': return dateFilteredOrders.filter((o) => ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
      case 'DELIVERED': return dateFilteredOrders.filter((o) => o.status === 'DELIVERED').length;
      case 'CANCELLED': return dateFilteredOrders.filter((o) => ['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED', 'EXPIRED'].includes(o.status)).length;
      default:          return dateFilteredOrders.length;
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'ALL',       label: 'All Orders'        },
    { id: 'NEW',       label: 'New'               },
    { id: 'PREPARING', label: 'Preparing'         },
    { id: 'READY',     label: 'Ready for Pickup'  },
    { id: 'PICKED_UP', label: 'Out for Delivery'  },
    { id: 'DELIVERED', label: 'Delivered'         },
    { id: 'CANCELLED', label: 'Cancelled'         },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => setScreen('dashboard')}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer shrink-0 mt-0.5"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Orders Hub</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage live orders, monitor prep times, and complete delivery handovers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => setIsDispatchAgentOpen(true)}
            title="Open AI Dispatch Agent (Sandeep) for instant order resolution"
            className="py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Dispatch Agent</span>
          </button>
          <button
            onClick={testOrderSound}
            title="Test Order Sound"
            className="py-2.5 px-3.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* ── Date Filter ────────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <CalendarDays className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Date Range</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'today',  label: 'Today'       },
            { id: '7days',  label: 'Last 7 Days'  },
            { id: '30days', label: 'Last 30 Days' },
            { id: 'all',    label: 'All Time'     },
          ] as { id: DateRange; label: string }[]).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setDateRange(id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                dateRange === id
                  ? 'bg-[#FFC700] text-slate-900 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 Summary Stat Cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.total}</h3>
            <p className="text-[11px] text-slate-400 mt-1">All orders received</p>
          </div>
        </div>

        {/* Card 2: Average Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg / Day</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-slate-900">{stats.avgPerDay}</h3>
            <p className="text-[11px] text-slate-400 mt-1">Orders per day (selected period)</p>
          </div>
        </div>

        {/* Card 3: Completed Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.completed}</h3>
              {stats.total > 0 && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Successfully delivered</p>
          </div>
        </div>

        {/* Card 4: Cancelled Orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelled</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-900">{stats.cancelled}</h3>
              {stats.total > 0 && (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                  {Math.round((stats.cancelled / stats.total) * 100)}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.restaurantCancelled > 0 && `${stats.restaurantCancelled} by restaurant`}
              {stats.restaurantCancelled > 0 && stats.customerCancelled > 0 && ' · '}
              {stats.customerCancelled > 0 && `${stats.customerCancelled} by customer`}
              {stats.cancelled === 0 && 'No cancellations'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Search & Status Tabs ────────────────────────────── */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer name, or Dish…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-feedo-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => {
            const count   = getTabCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#FFC700] text-slate-900 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-black/10 text-slate-900' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Orders Grid ────────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No orders found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No matching orders for "${searchQuery}".`
              : 'There are no orders in this category for the selected period.'}
          </p>
          {isPrototypeMode && (
            <button
              onClick={simulateNewIncomingOrder}
              className="mt-4 px-4 py-2 bg-[#FFC700] text-slate-900 text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors"
            >
              + Simulate New Order
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-amber-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-sm font-black font-mono text-slate-900">#{order.id}</span>
                    <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Customer */}
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-slate-900">{order.customer.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{order.customer.phoneMasked}</p>
                  <p className="text-[11px] text-slate-500 truncate">{order.customer.address}</p>
                </div>

                {/* Items */}
                <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 mb-3 border border-slate-100">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <VegIndicator isVeg={it.isVeg} size="sm" />
                        <span className="font-semibold text-slate-800">{it.quantity} × {it.name}</span>
                      </div>
                      <span className="font-mono text-slate-600 font-semibold">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                  {order.specialInstructions && (
                    <p className="text-[10px] text-amber-700 font-medium italic pt-1 border-t border-slate-200">
                      "{order.specialInstructions}"
                    </p>
                  )}
                </div>

                {/* Cancellation reason if cancelled */}
                {['RESTAURANT_REJECTED', 'CUSTOMER_CANCELLED'].includes(order.status) && (
                  <div className="bg-rose-50 rounded-xl p-2.5 mb-3 border border-rose-100">
                    <p className="text-[10px] font-bold text-rose-700">
                      {order.status === 'RESTAURANT_REJECTED' ? 'Rejected by Restaurant' : 'Cancelled by Customer'}
                    </p>
                    {order.rejectionReason && (
                      <p className="text-[10px] text-rose-600 mt-0.5">Reason: {order.rejectionReason}</p>
                    )}
                  </div>
                )}

                {/* Rider */}
                {order.rider && (
                  <div className="flex items-center justify-between p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 mb-3">
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold">{order.rider.name}</span>
                    </div>
                    <span className="font-mono font-bold text-[11px]">{order.rider.vehicleNumber}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Bill Total</span>
                  <span className="font-mono font-black text-slate-900 text-sm">₹{order.total}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /><span>View Details</span>
                  </button>
                  {order.status === 'RESTAURANT_ACCEPTED' && (
                    <button
                      onClick={() => startPreparingOrder(order.id)}
                      className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >Start Cooking</button>
                  )}
                  {order.status === 'PREPARING' && (
                    <button
                      onClick={() => markFoodReady(order.id)}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >Food Ready</button>
                  )}
                  {['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_ARRIVED', 'PICKUP_VERIFIED'].includes(order.status) && (
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >Verify Handover</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Dispatch Agent Modal */}
      <FeedoDispatchAgentModal
        isOpen={isDispatchAgentOpen}
        onClose={() => setIsDispatchAgentOpen(false)}
      />
    </div>
  );
};
