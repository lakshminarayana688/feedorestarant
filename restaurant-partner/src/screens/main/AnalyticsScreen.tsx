import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Award,
  ArrowLeft,
} from 'lucide-react';
import {
  AreaChart,
  BarChart,
  PieChart,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  Bar,
  Pie,
  Cell,
  Line,
} from 'recharts';

// ── Demo data ──────────────────────────────────────────────────────────────────

const revenueTrend7 = [
  { day: 'Mon', revenue: 10450 },
  { day: 'Tue', revenue: 11200 },
  { day: 'Wed', revenue: 12850 },
  { day: 'Thu', revenue: 14600 },
  { day: 'Fri', revenue: 16920 },
  { day: 'Sat', revenue: 18450 },
  { day: 'Sun', revenue: 21500 },
];

const revenueTrend30 = Array.from({ length: 30 }, (_, i) => ({
  day: `D${i + 1}`,
  revenue: Math.round(8000 + Math.random() * 14000 + i * 200),
}));

const peakHoursData = [
  { hour: '10am', orders: 8 },
  { hour: '11am', orders: 12 },
  { hour: '12pm', orders: 24 },
  { hour: '1pm',  orders: 28 },
  { hour: '2pm',  orders: 15 },
  { hour: '3pm',  orders: 8 },
  { hour: '4pm',  orders: 6 },
  { hour: '5pm',  orders: 10 },
  { hour: '6pm',  orders: 18 },
  { hour: '7pm',  orders: 32 },
  { hour: '8pm',  orders: 38 },
  { hour: '9pm',  orders: 25 },
  { hour: '10pm', orders: 14 },
];

const categoryData = [
  { name: 'Biryani',   value: 35 },
  { name: 'Starters',  value: 20 },
  { name: 'Main',      value: 18 },
  { name: 'Breads',    value: 12 },
  { name: 'Beverages', value: 10 },
  { name: 'Others',    value: 5 },
];

const completionTrend = [
  { day: 'Mon', rate: 91 },
  { day: 'Tue', rate: 93 },
  { day: 'Wed', rate: 89 },
  { day: 'Thu', rate: 95 },
  { day: 'Fri', rate: 92 },
  { day: 'Sat', rate: 94 },
  { day: 'Sun', rate: 97 },
];

const PIE_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'];

const topDishes = [
  { name: 'Hyderabadi Dum Biryani', orders: 42, share: 35 },
  { name: 'Chicken 65',             orders: 35, share: 25 },
  { name: 'Paneer Butter Masala',   orders: 28, share: 18 },
  { name: 'Garlic Naan',            orders: 20, share: 13 },
  { name: 'Mango Lassi',            orders: 15, share: 9 },
];

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name?: string }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-slate-300">
          {p.name ? `${p.name}: ` : ''}
          {typeof p.value === 'number' && p.name !== 'orders' && p.name !== 'rate'
            ? `₹${p.value.toLocaleString('en-IN')}`
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────────

export const AnalyticsScreen: React.FC = () => {
  const { menuItems, orders, setScreen } = useApp();
  const [filter, setFilter] = useState<'today' | '7days' | '30days'>('7days');

  const validOrders = orders.filter(
    (o) => o.status !== 'RESTAURANT_REJECTED' && o.status !== 'CUSTOMER_CANCELLED'
  );
  const totalOrdersCount = orders.length;
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;
  const avgPrepTime = '15.2 min';

  const topItems = menuItems.slice(0, 5).map((item, idx) => {
    const counts = [42, 35, 28, 20, 15];
    const count = counts[idx] || 10;
    const revenue = count * item.price;
    return {
      name: item.name,
      count,
      revenue,
      share: Math.max(10, Math.round(35 - idx * 6)),
    };
  });

  const revenueTrendData = filter === '30days' ? revenueTrend30 : revenueTrend7;
  const demoLabel =
    filter === 'today'
      ? 'Demo Data • Today'
      : filter === '7days'
      ? 'Demo Data • Last 7 Days'
      : 'Demo Data • Last 30 Days';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* ── Header ── */}
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Business Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Operational metrics, sales volume, peak hours, and customer retention metrics.
            </p>
          </div>
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
          {(['today', '7days', '30days'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilter(period)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all capitalize cursor-pointer ${
                filter === period
                  ? 'bg-feedo-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {period === 'today' ? 'Today' : period === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <h3 className="text-2xl font-black text-slate-900">{totalOrdersCount}</h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Live Synced
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
          <h3 className="text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString('en-IN')}</h3>
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Net Sales
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg. Order Value</span>
          <h3 className="text-2xl font-black text-slate-900">₹{avgOrderValue}</h3>
          <span className="text-[11px] text-slate-400">Calculated per checkout</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Prep Time</span>
          <h3 className="text-2xl font-black text-slate-900">{avgPrepTime}</h3>
          <span className="text-[11px] font-bold text-emerald-600">⚡ Dispatch ready</span>
        </div>
      </div>

      {/* ── Revenue Trend ── */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Trend</h3>
            <p className="text-xs text-slate-500">Daily revenue over selected period</p>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            {demoLabel}
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#EF4444"
                strokeWidth={2.5}
                fill="url(#revenueGrad)"
                dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#EF4444' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Peak Hours + Category Revenue ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Peak Hours</h3>
              <p className="text-xs text-slate-500">Hourly order volume (10am–10pm)</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Demo Data
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" name="orders" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Pie */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Category Revenue</h3>
              <p className="text-xs text-slate-500">Revenue share by menu category</p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Demo Data
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Share']}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-xs text-slate-700 flex-1 truncate">{cat.name}</span>
                  <span className="text-xs font-bold text-slate-900">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Completion Rate + Top Selling Dishes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">Order Completion Rate</h3>
            <p className="text-xs text-slate-500">% of orders fulfilled successfully</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-4xl font-black text-feedo-500">94%</span>
              <p className="text-[11px] text-emerald-600 font-bold mt-1">↑ +2% vs last week</p>
            </div>
            <div className="flex-1 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={completionTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <Line
                    type="monotone"
                    dataKey="rate"
                    name="rate"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#EF4444', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: 'Accepted', value: '97%', color: 'text-emerald-600' },
              { label: 'On-time', value: '91%', color: 'text-blue-600' },
              { label: 'Rejected', value: '3%',  color: 'text-rose-600' },
            ].map((s) => (
              <div key={s.label} className="text-center bg-slate-50 rounded-xl p-2 border border-slate-100">
                <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-400 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Dishes */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Top Selling Dishes</h3>
              <p className="text-xs text-slate-500">By order count &amp; revenue share</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="space-y-3">
            {(topItems.length >= 3 ? topItems : topDishes).map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 truncate flex-1 mr-2">
                    <span className="text-slate-400 mr-1">#{idx + 1}</span>
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-500 shrink-0">
                    {item.orders} orders
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.share}%` }}
                    className="bg-feedo-500 h-full rounded-full"
                  />
                </div>
                <p className="text-[10px] text-slate-400">{item.share}% of sales</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo watermark */}
      <p className="text-center text-[11px] text-slate-300 font-medium pb-2">
        📊 {demoLabel} — Analytics powered by Feedo Partner Intelligence
      </p>
    </div>
  );
};
