import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SalesOverviewCard } from '../../components/dashboard/SalesOverviewCard';
import {
  IndianRupee,
  TrendingUp,
  Download,
  Building,
  CheckCircle2,
  Lock,
  Clock,
  Search,
  ArrowUpRight,
  ArrowLeft,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  Calendar,
  ShieldCheck,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  getNextEligibleSettlementDate,
  calculateSettlementBreakdown,
  isBankAccountInCoolingPeriod,
  SettlementSchedule,
} from '../../services/settlementService';

export const FinanceScreen: React.FC = () => {
  const { restaurant, settlements, orders, showToast, currentUserRole, setScreen } = useApp();
  const [transactionSearch, setTransactionSearch] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<'ALL' | 'COMPLETED' | 'IN_PROGRESS'>('ALL');

  // Simulation state for verifying Sunday / Bank Holiday rollover & Bank cooling
  const [simulatedDay, setSimulatedDay] = useState<'AUTO' | 'SUNDAY' | 'HOLIDAY'>('AUTO');
  const [showBankUpdateModal, setShowBankUpdateModal] = useState(false);
  const [coolingUpdatedAt, setCoolingUpdatedAt] = useState<number | null>(null);
  const [updateStep, setUpdateStep] = useState<'FORM' | 'OTP' | 'ACTIVE'>('FORM');
  const [updateOtp, setUpdateOtp] = useState('');
  const [newBankDetails, setNewBankDetails] = useState({
    accountNumber: '',
    confirmAccount: '',
    ifscCode: '',
    holderName: restaurant.name || 'Restaurant Partner',
  });

  // Role Gate: Finance & Earnings is strictly OWNER or ADMIN
  if (currentUserRole !== 'OWNER' && currentUserRole !== 'ADMIN') {
    return (
      <div className="p-6 sm:p-12 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 text-slate-500 mx-auto flex items-center justify-center">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-slate-900">Finance & Banking Restricted</h2>
        <p className="text-xs text-slate-500 leading-relaxed font-sans">
          Access to settlement ledgers, bank payout details, and restaurant financial transaction records is restricted strictly to the <strong>Restaurant Owner</strong>.
        </p>
        <button
          onClick={() => setScreen('dashboard')}
          className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Calculations for Earnings metrics
  const completedSettlementsList = useMemo(() => {
    return settlements.filter((s) => s.status === 'SETTLED');
  }, [settlements]);

  const pendingSettlementsList = useMemo(() => {
    return settlements.filter((s) => s.status === 'PROCESSING' || s.status === 'UPCOMING');
  }, [settlements]);

  const completedAmount = useMemo(() => {
    return completedSettlementsList.reduce((sum, s) => sum + s.netPayout, 0);
  }, [completedSettlementsList]);

  const pendingAmount = useMemo(() => {
    return pendingSettlementsList.reduce((sum, s) => sum + s.netPayout, 0);
  }, [pendingSettlementsList]);

  const totalEarnings = completedAmount + pendingAmount;
  const availableBalance = pendingAmount > 0 ? pendingAmount : 7041.15;

  // Masked bank information
  const bankLast4 = restaurant.bankAccount.slice(-4) || '9921';
  const maskedAccount = `•••• •••• •••• ${bankLast4}`;
  const maskedIfsc = `${restaurant.ifscCode.slice(0, 4)}•••••••`;

  // Compute Next Eligible Settlement Date (handling Sundays and Bank Holidays)
  const settlementSchedule: SettlementSchedule = useMemo(() => {
    let baseDate = new Date();
    if (simulatedDay === 'SUNDAY') {
      // Simulate Saturday orders where next day would be Sunday
      const sat = new Date();
      sat.setDate(sat.getDate() + (6 - sat.getDay()));
      baseDate = sat;
    } else if (simulatedDay === 'HOLIDAY') {
      // Simulate Day before Republic Day (Jan 25, candidate Jan 26) or Gandhi Jayanti (Oct 1)
      baseDate = new Date(2026, 9, 1); // 01 Oct 2026 -> Candidate 02 Oct is Gandhi Jayanti
    }
    return getNextEligibleSettlementDate(baseDate);
  }, [simulatedDay]);

  // Compute live Cycle Itemized Settlement Breakdown
  const liveGrossRevenue = pendingSettlementsList.length > 0
    ? pendingSettlementsList.reduce((acc, s) => acc + s.grossAmount, 0)
    : 8940;

  const settlementBreakdown = useMemo(() => {
    return calculateSettlementBreakdown({
      grossOrderRevenue: liveGrossRevenue,
      commissionRate: 0.20, // 20% (agreed commission tier within 20%–25% range)
      merchantIncentives: 150, // Contractual merchant promotion bonus
    });
  }, [liveGrossRevenue]);

  // Bank cooling status
  const coolingStatus = useMemo(() => {
    return isBankAccountInCoolingPeriod(coolingUpdatedAt || undefined);
  }, [coolingUpdatedAt]);

  // Settlement Status Display
  const currentSettlementStatus = useMemo(() => {
    if (coolingStatus.isInCooling) {
      return {
        label: 'ON HOLD (24h Verification Cooling)',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        dotClass: 'bg-amber-500',
      };
    }
    if (settlementSchedule.isDeferred) {
      return {
        label: 'CARRIED FORWARD (Next Business Day)',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
        dotClass: 'bg-blue-500',
      };
    }
    return {
      label: 'CLEARING READY (Daily Automated)',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500',
    };
  }, [coolingStatus.isInCooling, settlementSchedule.isDeferred]);

  // Filtered order transactions
  const filteredTransactions = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(transactionSearch.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(transactionSearch.toLowerCase());

      if (!matchesSearch) return false;

      if (transactionFilter === 'COMPLETED') {
        return order.status === 'DELIVERED' || order.status === 'PICKED_UP';
      }
      if (transactionFilter === 'IN_PROGRESS') {
        return order.status !== 'DELIVERED' && order.status !== 'PICKED_UP';
      }
      return true;
    });
  }, [orders, transactionSearch, transactionFilter]);

  // Handle Dual-Factor Authorization submission
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankDetails.accountNumber || !newBankDetails.ifscCode) {
      showToast('Please enter complete bank account and IFSC details', 'error');
      return;
    }
    if (newBankDetails.accountNumber !== newBankDetails.confirmAccount) {
      showToast('Bank account numbers do not match', 'error');
      return;
    }
    setUpdateStep('OTP');
    showToast('Dual-factor authorization code sent to registered owner mobile number', 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateOtp.trim().length !== 6) {
      showToast('Please enter the 6-digit verification OTP', 'error');
      return;
    }
    // Apply 24h cooling period
    const now = Date.now();
    setCoolingUpdatedAt(now);
    setUpdateStep('ACTIVE');
    setShowBankUpdateModal(false);
    showToast('2FA Verified: Mandatory 24-hour verification cooling period initiated. Payouts safely on hold.', 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in select-none">
      {/* =========================================================
          1. HEADER SECTION
      ========================================================= */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
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
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200/80">
                Merchant ID: FD-BLR-{bankLast4}
              </span>
              <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Direct Bank Settlement Active
              </span>
              {coolingStatus.isInCooling && (
                <span className="text-xs text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  24h Cooling Hold Active ({coolingStatus.remainingHours}h remaining)
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 tracking-tight">
              Earnings & Settlements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Daily settlement cadence by 10:00 AM IST on the next business day with transparent deductions and Sunday/Holiday carry-forward protection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => showToast('Financial statement exported to PDF & CSV', 'success')}
            className="py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download Statement</span>
          </button>
        </div>
      </header>

      {/* =========================================================
          1b. SALES OVERVIEW (moved from Dashboard)
      ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <SalesOverviewCard />
      </section>

      {/* =========================================================
          2. FOUR ESSENTIAL EARNINGS METRIC CARDS
      ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Metric Card 1: Total Earnings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-feedo-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                ₹{totalEarnings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <ArrowUpRight className="w-3 h-3" />
                +18.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Net income after platform commission (20%–25%)</p>
          </div>
        </div>

        {/* Metric Card 2: Available Balance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Available Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-emerald-600">
                ₹{availableBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Clearing Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Auto-clearing {settlementSchedule.formattedDate.split(',')[0]} 10:00 AM IST
            </p>
          </div>
        </div>

        {/* Metric Card 3: Pending Settlements */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Settlements
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                ₹{pendingAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                {pendingSettlementsList.length} Batch
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">In automated NEFT clearing queue</p>
          </div>
        </div>

        {/* Metric Card 4: Completed Settlements */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Completed Settlements
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                ₹{completedAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                {completedSettlementsList.length} Batches
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Transferred to {restaurant.bankName.split(' ')[0]}</p>
          </div>
        </div>
      </div>

      {/* =========================================================
          3. COMPREHENSIVE SETTLEMENT POLICY & CALCULATION BREAKDOWN
      ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-6">
        {/* Section Header with Simulation Controller */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Daily Settlement Cadence & Bank Clearing
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Next-business-day 10:00 AM IST payout schedule directly into verified bank account.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Calendar Scenario Simulator Selector for Demonstration & Verification */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-xs font-sans">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-400 text-[10px] uppercase font-bold">Simulate:</span>
              <button
                type="button"
                onClick={() => setSimulatedDay('AUTO')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  simulatedDay === 'AUTO' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDay('SUNDAY')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  simulatedDay === 'SUNDAY' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulate Saturday batch -> Scheduled Sunday carryover to Monday"
              >
                Sunday Batch
              </button>
              <button
                type="button"
                onClick={() => setSimulatedDay('HOLIDAY')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  simulatedDay === 'HOLIDAY' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulate Bank Holiday (Oct 2 Gandhi Jayanti) carryover"
              >
                Bank Holiday Batch
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowBankUpdateModal(true);
                setUpdateStep('FORM');
              }}
              className="text-xs font-bold text-feedo-600 hover:text-feedo-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
            >
              Update Bank Details (2FA) →
            </button>
          </div>
        </div>

        {/* Carry-Forward Notification Banner (Sunday / Bank Holiday) */}
        {settlementSchedule.isDeferred && (
          <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold font-heading text-sm text-amber-950 flex items-center gap-2">
                <span>Sunday / Bank Holiday Payout Carry-Forward Active</span>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                  Protected Earnings
                </span>
              </div>
              <p className="leading-relaxed text-amber-900 font-sans">
                {settlementSchedule.deferralSummary}
              </p>
              <div className="text-[11px] text-amber-800 font-medium">
                • <strong>Sunday Policy:</strong> Zero payouts on Sundays. Automatically carried forward to next available business day.
                <br />
                • <strong>Bank Holiday Policy:</strong> Zero payouts on banking holidays. Accumulated earnings are never cancelled or forfeited.
              </div>
            </div>
          </div>
        )}

        {/* 24-Hour Cooling Notice Banner if Active */}
        {coolingStatus.isInCooling && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold font-heading text-sm text-blue-950 flex items-center gap-2">
                <span>Bank Account 24-Hour Verification Cooling Period Active</span>
                <span className="text-[10px] font-bold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded-full">
                  {coolingStatus.remainingHours}h {coolingStatus.remainingMinutes}m Remaining
                </span>
              </div>
              <p className="leading-relaxed text-blue-900 font-sans">
                To prevent financial fraud, bank detail updates require dual-factor authorization and enforce a mandatory 24-hour verification cooling period. Payouts to the newly updated account are safely kept on hold until verification completes and will resume automatically on the next eligible business day.
              </p>
            </div>
          </div>
        )}

        {/* 11 Required Settlement Information Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Next Settlement Date */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Next Settlement Date
            </span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{settlementSchedule.formattedDate}</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              {settlementSchedule.isDeferred
                ? `Rolled over (${settlementSchedule.deferralReasons.join(', ')})`
                : 'Next regular business day'}
            </span>
          </div>

          {/* Card 2: Expected Settlement Time */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Expected Settlement Time
            </span>
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-feedo-600 shrink-0" />
              <span>{settlementSchedule.formattedTime}</span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              Automated NEFT / IMPS clearing cut-off
            </span>
          </div>

          {/* Card 3: Settlement Status */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Settlement Status
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentSettlementStatus.dotClass}`} />
              <span className="font-bold text-slate-900 text-xs">
                {currentSettlementStatus.label.split('(')[0].trim()}
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border ${currentSettlementStatus.badgeClass}`}>
              {coolingStatus.isInCooling
                ? 'On Hold (24h Cooling)'
                : settlementSchedule.isDeferred
                ? 'Carried Forward'
                : 'Eligible for Clearing'}
            </span>
          </div>

          {/* Card 4: Bank Account Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Bank Account Details
            </span>
            <div className="font-bold text-slate-900 text-sm truncate">
              {restaurant.bankName}
            </div>
            <div className="font-mono text-xs text-slate-600 flex items-center gap-2">
              <span>{maskedAccount}</span>
              <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded font-sans">
                {maskedIfsc}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Settlement Calculation Breakdown Table */}
        <div className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white">
          <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider">
                Transparent Settlement Calculation Breakdown
              </h4>
            </div>
            <span className="text-[11px] font-mono font-medium text-slate-500">
              FEEDO Commission: 20%–25% • Razorpay Gateway: 2%
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-3 font-sans text-xs">
            <div className="space-y-2 divide-y divide-slate-100">
              {/* 1. Gross Food Order Revenue */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="font-bold text-slate-800">1. Gross Food Order Revenue</span>
                  <span className="text-[10px] text-slate-400 block">
                    Cumulative customer order totals fulfilled in settlement cycle
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{settlementBreakdown.grossFoodOrderRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 2. FEEDO Platform Commission (20%–25%) */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">
                    2. FEEDO Platform Commission ({settlementBreakdown.commissionRatePercent}%)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Calculated on net food bill within agreed 20%–25% tier (excl. taxes & delivery)
                  </span>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  −₹{settlementBreakdown.platformCommission.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 3. Razorpay Payment Gateway Charge (2%) */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">
                    3. Razorpay Payment Gateway Charge ({settlementBreakdown.razorpayChargeRatePercent}%)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Separate 2% processing charge applied to eligible Razorpay-processed transactions
                  </span>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  −₹{settlementBreakdown.razorpayGatewayCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 4. Applicable GST on charges */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">
                    4. Applicable GST on Charges ({settlementBreakdown.gstRatePercent}%)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Statutory GST charged on FEEDO commission & Razorpay gateway charges (eligible for ITC)
                  </span>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  −₹{settlementBreakdown.gstOnCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 5. Applicable statutory TCS/TDS deductions */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">
                    5. Applicable Statutory TCS/TDS Deductions ({settlementBreakdown.tcsTdsRatePercent}%)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Sec 52 CGST Act / Sec 194-O statutory withholdings deposited with Govt
                  </span>
                </div>
                <span className="font-mono font-semibold text-rose-600">
                  −₹{settlementBreakdown.statutoryTcsTds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 6. Contractual Merchant Incentives/Credits */}
              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-bold text-slate-800">6. Contractual Merchant Incentives/Credits</span>
                  <span className="text-[10px] text-slate-400 block">
                    Contractual performance credits, marketing bonus & kitchen subsidies
                  </span>
                </div>
                <span className="font-mono font-bold text-emerald-600">
                  +₹{settlementBreakdown.merchantIncentives.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* 7. Final Net Restaurant Payout */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-slate-200">
                <div>
                  <span className="font-bold font-heading text-sm text-slate-900">
                    7. Final Net Restaurant Payout
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium block">
                    Direct credit to verified bank account by {settlementSchedule.formattedDate}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-black text-lg text-emerald-600 block">
                    ₹{settlementBreakdown.netPayableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">
                    Zero Transfer Fee
                  </span>
                </div>
              </div>
            </div>

            {/* Statutory Formula Explanation Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Statutory Settlement Formula:</span>
              </div>
              <p className="font-mono text-[10px] text-slate-700 leading-relaxed bg-white p-2 rounded-lg border border-slate-200/60">
                Final Net Restaurant Payout = Gross Food Order Revenue − FEEDO Platform Commission (20%–25%) − Razorpay Payment Gateway Charge (2%) − Applicable GST on charges − Applicable Statutory TCS/TDS deductions + Contractual Merchant Incentives/Credits
              </p>
              <p className="text-[10px] text-slate-500">
                GST and other applicable statutory taxes are charged on FEEDO platform service commission and payment gateway charges as legally applicable. FEEDO provides appropriate invoices with applicable tax details and input tax credit information wherever eligible under applicable GST laws.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. TRANSACTION HISTORY SECTION
      ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-feedo-600" />
              <h3 className="text-base font-bold font-heading text-slate-900">
                Transaction History
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Itemized order payout ledger with gross billings, platform commission (20%–25%), and net credits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={transactionSearch}
                onChange={(e) => setTransactionSearch(e.target.value)}
                placeholder="Search by order or customer..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-feedo-500 w-48 sm:w-56"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/80">
              {(['ALL', 'COMPLETED', 'IN_PROGRESS'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  type="button"
                  onClick={() => setTransactionFilter(filterKey)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    transactionFilter === filterKey
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {filterKey === 'ALL'
                    ? 'All'
                    : filterKey === 'COMPLETED'
                    ? 'Completed'
                    : 'In Fulfillment'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">Order ID</th>
                <th className="pb-3 px-3">Customer & Location</th>
                <th className="pb-3 px-3">Time</th>
                <th className="pb-3 px-3">Gross Amount</th>
                <th className="pb-3 px-3">Commission (20%–25%)</th>
                <th className="pb-3 px-3">Net Earnings</th>
                <th className="pb-3 px-3">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 8).map((order) => {
                  const gross = Number(order.total) || 0;
                  const commission = Math.round(gross * 0.20 * 100) / 100;
                  const net = gross - commission;
                  const isDelivered = order.status === 'DELIVERED' || order.status === 'PICKED_UP';

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        #{order.id}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-slate-800 block">
                          {order.customer.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{order.customer.area}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                        {order.createdAt}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-900">
                        ₹{gross.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-500">
                        -₹{commission.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-extrabold text-emerald-600">
                        ₹{net.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isDelivered ? '✓ Completed' : order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No order transactions found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================
          5. SETTLEMENT HISTORY SECTION
      ========================================================= */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-feedo-600" />
              <h3 className="text-base font-bold font-heading text-slate-900">
                Settlement History
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Immutable bank payout transaction records with verified UTR clearing numbers.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">Settlement UTR Ref</th>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Cycle Period</th>
                <th className="pb-3 px-3">Gross Sales</th>
                <th className="pb-3 px-3">Commission (20%–25%)</th>
                <th className="pb-3 px-3">Taxes</th>
                <th className="pb-3 px-3">Net Bank Payout</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3 text-right">Settlement Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {settlements.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    {record.payoutRef}
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{record.date}</td>
                  <td className="py-3.5 px-3 text-slate-500">{record.period}</td>
                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                    ₹{record.grossAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-600">
                    -₹{record.commission.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-slate-500">
                    -₹{record.taxes.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3 font-mono font-black text-emerald-600 text-sm">
                    ₹{record.netPayout.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'SETTLED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {record.status === 'SETTLED' ? '✓ Settled' : '⏳ Processing'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        showToast(`Settlement receipt ${record.payoutRef} downloaded`, 'success')
                      }
                      className="text-xs font-bold text-feedo-600 hover:text-feedo-700 hover:underline cursor-pointer"
                    >
                      View Receipt →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================
          6. DUAL-FACTOR BANK UPDATE & 24-HOUR COOLING MODAL
      ========================================================= */}
      {showBankUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900">
                    Update Primary Settlement Bank
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Anti-Fraud Dual-Factor Authorization & 24h Cooling Hold
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBankUpdateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mandatory Fraud Protection Notice */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5 font-sans">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Mandatory Fraud Prevention Protocol</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900">
                • Changes to bank account numbers or IFSC details require dual-factor authorization (2FA).
                <br />
                • A mandatory <strong>24-hour verification cooling period</strong> applies upon updating.
                <br />
                • Payouts to the newly updated account remain on hold until successful verification.
                <br />
                • Settlements resume according to the normal business-day payout schedule.
              </p>
            </div>

            {updateStep === 'FORM' ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    New Account Number
                  </label>
                  <input
                    type="password"
                    value={newBankDetails.accountNumber}
                    onChange={(e) =>
                      setNewBankDetails({ ...newBankDetails, accountNumber: e.target.value })
                    }
                    placeholder="Enter new bank account number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-feedo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Confirm Account Number
                  </label>
                  <input
                    type="text"
                    value={newBankDetails.confirmAccount}
                    onChange={(e) =>
                      setNewBankDetails({ ...newBankDetails, confirmAccount: e.target.value })
                    }
                    placeholder="Re-enter bank account number"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-feedo-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    value={newBankDetails.ifscCode}
                    onChange={(e) =>
                      setNewBankDetails({ ...newBankDetails, ifscCode: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-feedo-500 font-mono uppercase"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowBankUpdateModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Request 2FA OTP</span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-sans">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px]">
                  Dual-Factor OTP has been dispatched via SMS to the verified Restaurant Owner phone number.
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Enter 6-Digit Authorization Code
                  </label>
                  <input
                    type="text"
                    value={updateOtp}
                    onChange={(e) => setUpdateOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="0 0 0 0 0 0"
                    maxLength={6}
                    className="w-full text-center text-lg tracking-widest px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-feedo-500 font-mono font-bold"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block text-center">
                    Enter 123456 or any 6-digit code for 2FA verification
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUpdateStep('FORM')}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Verify & Initiate 24h Cooling Period
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceScreen;
