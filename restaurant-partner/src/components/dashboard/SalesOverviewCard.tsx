import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Calendar,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TimeframePeriod = 'week' | 'month' | 'year';

interface BarDataPoint {
  key: string;
  label: string;
  shortLabel: string;
  subLabel?: string;
  amount: number;
  orderCount: number;
  isCurrent?: boolean;
}

interface PeriodConfig {
  title: string;
  dateRange: string;
  comparisonText: string;
  growthPct: number;
  data: BarDataPoint[];
  totalOrders: number;
  totalOrdersGrowth: number;
  avgOrderValue: number;
  aovGrowth: number;
  completedOrders: number;
  completedRate: number;
  completedGrowth: number;
  cancelledOrders: number;
  cancelledRate: number;
  cancelledGrowth: number;
}

export const SalesOverviewCard: React.FC = () => {
  const { orders } = useApp();
  const [period, setPeriod] = useState<TimeframePeriod>('week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [selectedRangePreset, setSelectedRangePreset] = useState<string>('current');

  // Real orders calculation for current day addition
  const liveTodayRevenue = useMemo(() => {
    return orders
      .filter((o) => o.status !== 'RESTAURANT_REJECTED' && o.status !== 'CUSTOMER_CANCELLED')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [orders]);

  const liveTodayOrdersCount = orders.length;

  // Datasets for Week, Month, Year
  const periodConfigs: Record<TimeframePeriod, PeriodConfig> = useMemo(() => {
    const todayExtraRev = liveTodayRevenue > 0 ? liveTodayRevenue : 0;
    const todayExtraOrders = liveTodayOrdersCount > 0 ? liveTodayOrdersCount : 0;

    return {
      week: {
        title: 'Weekly Sales',
        dateRange:
          selectedRangePreset === 'previous'
            ? '17 Oct 2026 – 23 Oct 2026'
            : '24 Oct 2026 – 30 Oct 2026',
        comparisonText: 'vs previous week',
        growthPct: 14.8,
        data: [
          {
            key: 'mon',
            label: 'Monday',
            shortLabel: 'Mon',
            subLabel: '24 Oct',
            amount: 10450,
            orderCount: 18,
          },
          {
            key: 'tue',
            label: 'Tuesday',
            shortLabel: 'Tue',
            subLabel: '25 Oct',
            amount: 11200,
            orderCount: 19,
          },
          {
            key: 'wed',
            label: 'Wednesday',
            shortLabel: 'Wed',
            subLabel: '26 Oct',
            amount: 12850,
            orderCount: 22,
          },
          {
            key: 'thu',
            label: 'Thursday',
            shortLabel: 'Thu',
            subLabel: '27 Oct',
            amount: 14600,
            orderCount: 25,
          },
          {
            key: 'fri',
            label: 'Friday',
            shortLabel: 'Fri',
            subLabel: '28 Oct',
            amount: 16920,
            orderCount: 29,
          },
          {
            key: 'sat',
            label: 'Saturday',
            shortLabel: 'Sat',
            subLabel: '29 Oct',
            amount: 18450,
            orderCount: 31,
          },
          {
            key: 'sun',
            label: 'Sunday',
            shortLabel: 'Sun',
            subLabel: '30 Oct',
            amount: 21500 + todayExtraRev,
            orderCount: 36 + todayExtraOrders,
            isCurrent: true,
          },
        ],
        totalOrders: 180 + todayExtraOrders,
        totalOrdersGrowth: 12.4,
        avgOrderValue: 594,
        aovGrowth: 4.8,
        completedOrders: 172 + todayExtraOrders,
        completedRate: 95.6,
        completedGrowth: 14.2,
        cancelledOrders: 8,
        cancelledRate: 4.4,
        cancelledGrowth: -2.1,
      },
      month: {
        title: 'Monthly Sales',
        dateRange:
          selectedRangePreset === 'previous'
            ? '01 Sep 2026 – 30 Sep 2026'
            : '01 Oct 2026 – 31 Oct 2026',
        comparisonText: 'vs previous month',
        growthPct: 18.6,
        data: [
          {
            key: 'w1',
            label: 'Week 1',
            shortLabel: 'W1',
            subLabel: '01 - 07 Oct',
            amount: 98400,
            orderCount: 168,
          },
          {
            key: 'w2',
            label: 'Week 2',
            shortLabel: 'W2',
            subLabel: '08 - 14 Oct',
            amount: 112600,
            orderCount: 192,
          },
          {
            key: 'w3',
            label: 'Week 3',
            shortLabel: 'W3',
            subLabel: '15 - 21 Oct',
            amount: 124500,
            orderCount: 214,
          },
          {
            key: 'w4',
            label: 'Week 4',
            shortLabel: 'W4',
            subLabel: '22 - 31 Oct',
            amount: 148200 + todayExtraRev,
            orderCount: 252 + todayExtraOrders,
            isCurrent: true,
          },
        ],
        totalOrders: 826 + todayExtraOrders,
        totalOrdersGrowth: 16.5,
        avgOrderValue: 586,
        aovGrowth: 3.2,
        completedOrders: 794 + todayExtraOrders,
        completedRate: 96.1,
        completedGrowth: 17.8,
        cancelledOrders: 32,
        cancelledRate: 3.9,
        cancelledGrowth: -1.4,
      },
      year: {
        title: 'Annual Sales',
        dateRange: '01 Jan 2026 – 31 Dec 2026',
        comparisonText: 'vs previous year',
        growthPct: 24.2,
        data: [
          { key: 'jan', label: 'January', shortLabel: 'Jan', amount: 320000, orderCount: 550 },
          { key: 'feb', label: 'February', shortLabel: 'Feb', amount: 345000, orderCount: 590 },
          { key: 'mar', label: 'March', shortLabel: 'Mar', amount: 380000, orderCount: 650 },
          { key: 'apr', label: 'April', shortLabel: 'Apr', amount: 395000, orderCount: 680 },
          { key: 'may', label: 'May', shortLabel: 'May', amount: 420000, orderCount: 720 },
          { key: 'jun', label: 'June', shortLabel: 'Jun', amount: 440000, orderCount: 760 },
          { key: 'jul', label: 'July', shortLabel: 'Jul', amount: 465000, orderCount: 800 },
          { key: 'aug', label: 'August', shortLabel: 'Aug', amount: 485000, orderCount: 830 },
          { key: 'sep', label: 'September', shortLabel: 'Sep', amount: 510000, orderCount: 880 },
          {
            key: 'oct',
            label: 'October',
            shortLabel: 'Oct',
            amount: 545000 + todayExtraRev,
            orderCount: 940 + todayExtraOrders,
            isCurrent: true,
          },
          { key: 'nov', label: 'November', shortLabel: 'Nov', amount: 490000, orderCount: 840 },
          { key: 'dec', label: 'December', shortLabel: 'Dec', amount: 520000, orderCount: 880 },
        ],
        totalOrders: 9120 + todayExtraOrders,
        totalOrdersGrowth: 21.4,
        avgOrderValue: 588,
        aovGrowth: 6.1,
        completedOrders: 8765 + todayExtraOrders,
        completedRate: 96.1,
        completedGrowth: 23.0,
        cancelledOrders: 355,
        cancelledRate: 3.9,
        cancelledGrowth: -3.2,
      },
    };
  }, [liveTodayRevenue, liveTodayOrdersCount, selectedRangePreset]);

  const currentConfig = periodConfigs[period];

  // Calculate total sales amount for the active period
  const totalSalesAmount = useMemo(() => {
    return currentConfig.data.reduce((sum, item) => sum + item.amount, 0);
  }, [currentConfig]);

  // Identify highest performing sales day
  const { maxAmount, maxIndex, maxItem } = useMemo(() => {
    let max = 0;
    let idx = 0;
    currentConfig.data.forEach((item, i) => {
      if (item.amount > max) {
        max = item.amount;
        idx = i;
      }
    });
    return {
      maxAmount: max,
      maxIndex: idx,
      maxItem: currentConfig.data[idx],
    };
  }, [currentConfig]);

  // Active highlighted item (hovered, or selected, or defaults to highest)
  const activeFocusIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activeFocusItem =
    activeFocusIndex !== null ? currentConfig.data[activeFocusIndex] : maxItem;

  // Grid line step values (0%, 25%, 50%, 75%, 100%)
  const yAxisTicks = useMemo(() => {
    const ceilMax = Math.ceil((maxAmount * 1.15) / 1000) * 1000;
    return [
      { label: `₹${(ceilMax / 1000).toFixed(0)}k`, pct: 100, val: ceilMax },
      { label: `₹${((ceilMax * 0.75) / 1000).toFixed(0)}k`, pct: 75, val: ceilMax * 0.75 },
      { label: `₹${((ceilMax * 0.5) / 1000).toFixed(0)}k`, pct: 50, val: ceilMax * 0.5 },
      { label: `₹${((ceilMax * 0.25) / 1000).toFixed(0)}k`, pct: 25, val: ceilMax * 0.25 },
      { label: '₹0', pct: 0, val: 0 },
    ];
  }, [maxAmount]);

  const chartCeil = yAxisTicks[0].val || 1;

  return (
    <div className="space-y-6">
      {/* =========================================================
          MAIN SALES OVERVIEW CARD
      ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs relative transition-all">
        {/* Top Header: Title, Date Range Selector, Period Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 tracking-tight">
                Sales Overview
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-feedo-50 text-feedo-700 border border-feedo-200/70">
                <Sparkles className="w-3 h-3 text-feedo-500" />
                Live Analytics
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Track revenue velocity, peak ordering windows, and day-by-day sales performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Interactive Date Range Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100/90 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              >
                <Calendar className="w-3.5 h-3.5 text-feedo-600" />
                <span className="font-medium text-slate-800">{currentConfig.dateRange}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isDateRangeOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDateRangeOpen && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 block">
                    Select Comparison Window
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRangePreset('current');
                      setIsDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      selectedRangePreset === 'current'
                        ? 'bg-feedo-50 text-feedo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Current Active Window</span>
                    {selectedRangePreset === 'current' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-feedo-500" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRangePreset('previous');
                      setIsDateRangeOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center justify-between ${
                      selectedRangePreset === 'previous'
                        ? 'bg-feedo-50 text-feedo-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Previous Equivalent Cycle</span>
                    {selectedRangePreset === 'previous' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-feedo-500" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Week / Month / Year Segmented Pills */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              {(['week', 'month', 'year'] as const).map((p) => {
                const isActive = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPeriod(p);
                      setHoveredIndex(null);
                      setSelectedIndex(null);
                    }}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total Sales Summary & Growth Indicator */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Total {period === 'week' ? 'Weekly' : period === 'month' ? 'Monthly' : 'Annual'} Sales
            </span>
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 tracking-tight">
                ₹{totalSalesAmount.toLocaleString('en-IN')}
              </span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{currentConfig.growthPct}%</span>
                <span className="text-[10px] font-normal text-emerald-600 hidden sm:inline">
                  {currentConfig.comparisonText}
                </span>
              </div>
            </div>
          </div>

          {/* Highest-Performing Sales Day Badge */}
          {maxItem && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gradient-to-r from-feedo-50/80 via-amber-50/60 to-white rounded-2xl border border-feedo-200/80 self-start sm:self-auto">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-feedo-600 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-feedo-700 block">
                  Peak Sales Period
                </span>
                <span className="text-xs font-extrabold text-slate-900 font-heading">
                  {maxItem.label}: ₹{maxItem.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({maxItem.orderCount} orders)
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================
            PROFESSIONAL INTERACTIVE VERTICAL BAR CHART
        ========================================================= */}
        <div className="pt-6">
          {/* Active Hover / Selection Tooltip Header Pill */}
          <div className="mb-4 flex items-center justify-between text-xs min-h-[28px]">
            <span className="text-slate-400 font-medium">
              Hover or click bars to inspect period metrics
            </span>
            {activeFocusItem && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-semibold shadow-xs animate-in fade-in">
                <span className="text-amber-400 font-bold">{activeFocusItem.label}:</span>
                <span className="font-mono font-bold">
                  ₹{activeFocusItem.amount.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-400">({activeFocusItem.orderCount} orders)</span>
                {activeFocusItem.amount === maxAmount && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-feedo-500 text-white uppercase tracking-wider">
                    ★ Peak
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Chart Canvas with Subtle Grid Lines */}
          <div className="relative h-64 sm:h-72 w-full pt-4 pb-8 flex flex-col justify-between">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
              {yAxisTicks.map((tick, i) => (
                <div key={i} className="w-full flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 w-10 text-right shrink-0 select-none">
                    {tick.label}
                  </span>
                  <div className="flex-1 border-b border-dashed border-slate-200" />
                </div>
              ))}
            </div>

            {/* Vertical Bars Container */}
            <div className="relative z-10 h-full flex items-end justify-between gap-2 sm:gap-4 pl-12 pr-2">
              {currentConfig.data.map((item, idx) => {
                const isHighest = item.amount === maxAmount;
                const isHovered = hoveredIndex === idx;
                const isSelected = selectedIndex === idx;
                const isFocused = isHovered || isSelected;

                // Height percentage normalized to chart ceiling
                const heightPct = Math.max(8, Math.round((item.amount / chartCeil) * 100));

                return (
                  <div
                    key={item.key}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => setSelectedIndex(selectedIndex === idx ? null : idx)}
                    className="flex-1 h-full flex flex-col items-center justify-end relative group cursor-pointer"
                  >
                    {/* Floating Tooltip (Appears above the bar on hover or select) */}
                    {isFocused && (
                      <div className="absolute -top-12 z-30 pointer-events-none flex flex-col items-center animate-in fade-in zoom-in-95 duration-150">
                        <div className="bg-slate-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5">
                          <span className="font-bold text-amber-300">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            • {item.orderCount} orders
                          </span>
                        </div>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1" />
                      </div>
                    )}

                    {/* Peak Day Star Pill on Bar */}
                    {isHighest && !isFocused && (
                      <div className="absolute -top-6 z-20 pointer-events-none">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-feedo-600 bg-feedo-50 border border-feedo-200 px-1.5 py-0.5 rounded-full shadow-2xs">
                          ★ Peak
                        </span>
                      </div>
                    )}

                    {/* The Rounded Vertical Bar */}
                    <div className="w-full max-w-[48px] h-full flex items-end">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-xl transition-all duration-500 ease-out relative overflow-hidden ${
                          isHighest
                            ? 'bg-gradient-to-t from-feedo-600 via-feedo-500 to-amber-400 shadow-md shadow-feedo-500/25 ring-2 ring-feedo-400/40'
                            : isFocused
                            ? 'bg-gradient-to-t from-slate-400 to-slate-300 ring-2 ring-slate-400/50'
                            : 'bg-slate-100 border-t border-x border-slate-200/80 group-hover:bg-slate-200/80'
                        } ${isFocused ? 'scale-y-[1.02] origin-bottom' : ''}`}
                      >
                        {/* Shimmer / Accent highlight line */}
                        <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-t-xl" />
                      </div>
                    </div>

                    {/* X-Axis Day / Month Label */}
                    <div className="mt-2 text-center select-none">
                      <span
                        className={`text-xs block font-heading ${
                          isHighest
                            ? 'font-bold text-feedo-600'
                            : isFocused
                            ? 'font-bold text-slate-900'
                            : 'font-medium text-slate-500 group-hover:text-slate-800'
                        }`}
                      >
                        {item.shortLabel}
                      </span>
                      {item.subLabel && (
                        <span className="text-[9px] text-slate-400 hidden sm:block">
                          {item.subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOUR COMPACT SALES METRICS CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric 1: Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-feedo-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                {currentConfig.totalOrders.toLocaleString('en-IN')}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                +{currentConfig.totalOrdersGrowth}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{currentConfig.comparisonText}</p>
          </div>
        </div>

        {/* Metric 2: Average Order Value */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Average Order Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                ₹{currentConfig.avgOrderValue}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                +{currentConfig.aovGrowth}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{currentConfig.comparisonText}</p>
          </div>
        </div>

        {/* Metric 3: Completed Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                {currentConfig.completedOrders.toLocaleString('en-IN')}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                +{currentConfig.completedGrowth}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{currentConfig.completedRate}% fulfillment rate</span>
              <span className="text-emerald-600 font-semibold">High reliability</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Cancelled Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Cancelled Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                {currentConfig.cancelledOrders}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowDownRight className="w-3 h-3" />
                {currentConfig.cancelledGrowth}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{currentConfig.cancelledRate}% cancellation rate</span>
              <span className="text-slate-400">Low reject trend</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

