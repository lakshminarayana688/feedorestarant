import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Bike,
  Building,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Send,
  Sliders,
  DollarSign,
  AlertTriangle,
  FileCheck,
  Utensils,
  ExternalLink,
  UserCheck,
  Lock,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const AdminScreen: React.FC = () => {
  const {
    restaurant,
    documents,
    orders,
    settlements,
    auditLogs,
    adminApproveRestaurant,
    adminSuspendRestaurant,
    adminUpdateCommissionRate,
    adminForceOrderStatus,
    adminReleaseSettlement,
    currentUserRole,
    setCurrentUserRole,
    showToast,
    setScreen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'KYC' | 'DISPATCH' | 'FINANCE' | 'AUDIT'>('KYC');
  const [auditCategory, setAuditCategory] = useState<string>('ALL');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [selectedCommission, setSelectedCommission] = useState<number>(restaurant.commissionRate || 18);

  // Filtered audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesCat = auditCategory === 'ALL' || log.category === auditCategory;
      const matchesSearch =
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.actor.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.details.toLowerCase().includes(auditSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [auditLogs, auditCategory, auditSearch]);

  const handleApplyCommission = (rate: number) => {
    setSelectedCommission(rate);
    adminUpdateCommissionRate(rate);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in select-none">
      {/* =========================================================
          1. ADMIN CONSOLE HEADER & GOD-MODE BADGE
      ========================================================= */}
      <header className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-br from-feedo-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-3.5 h-3.5" />
                FEEDO SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Environment: Central Ops Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-white tracking-tight">
              Platform Administration & Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans max-w-2xl">
              Authoritative control center for merchant compliance approval, live rider dispatch overrides, financial settlement releases, and security audit logs.
            </p>
          </div>

          {/* Quick Active Store Status Card */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Target Merchant
              </span>
              <h3 className="text-sm font-bold text-white font-heading truncate max-w-xs">
                {restaurant.restaurantName || 'Lucky Family Restaurant'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    restaurant.isSuspended
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : restaurant.regStatus === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {restaurant.isSuspended ? 'SUSPENDED' : restaurant.regStatus}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Commission: {restaurant.commissionRate || 18}%
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
              {restaurant.regStatus !== 'ACTIVE' ? (
                <button
                  type="button"
                  onClick={adminApproveRestaurant}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Store & KYC</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => adminSuspendRestaurant(!restaurant.isSuspended)}
                  className={`px-3.5 py-1.5 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                    restaurant.isSuspended
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {restaurant.isSuspended ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reactivate Store</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Suspend Store</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          2. ROLE SWITCHER & ENVIRONMENT SHORTCUT BAR
      ========================================================= */}
      <section className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-feedo-600" />
          <span className="text-xs font-bold font-heading text-slate-900">
            Active Simulator Role:
          </span>
          <span className="text-xs font-mono font-bold text-feedo-600 bg-feedo-50 px-2 py-0.5 rounded-md border border-feedo-200">
            {currentUserRole}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Switch Persona:</span>
          {(['ADMIN', 'OWNER', 'MANAGER', 'KITCHEN', 'CASHIER', 'STAFF'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setCurrentUserRole(r);
                showToast(`Switched active persona to ${r}`, 'info');
              }}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                currentUserRole === r
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </section>

      {/* =========================================================
          3. TABBED OPERATIONS CONSOLE
      ========================================================= */}
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('KYC')}
            className={`px-4 py-2.5 font-heading text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'KYC'
                ? 'border-b-2 border-feedo-600 text-feedo-600 bg-white font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Merchant KYC Compliance</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DISPATCH')}
            className={`px-4 py-2.5 font-heading text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'DISPATCH'
                ? 'border-b-2 border-feedo-600 text-feedo-600 bg-white font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Live Dispatch & Order Overrides</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('FINANCE')}
            className={`px-4 py-2.5 font-heading text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'FINANCE'
                ? 'border-b-2 border-feedo-600 text-feedo-600 bg-white font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Settlement Releases & Commissions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT')}
            className={`px-4 py-2.5 font-heading text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'AUDIT'
                ? 'border-b-2 border-feedo-600 text-feedo-600 bg-white font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Audit Log Trail</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
              {auditLogs.length}
            </span>
          </button>
        </div>

        {/* TAB 1: KYC & COMPLIANCE */}
        {activeTab === 'KYC' && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">
                  Merchant Document Verification & Government IDs
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify FSSAI licensing, Aadhaar card, GST registration, bank passbook, and premise photos.
                </p>
              </div>

              <button
                type="button"
                onClick={adminApproveRestaurant}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark All Documents Verified</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-900 font-heading">
                        {doc.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.status === 'VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{doc.description}</p>
                    {doc.fileName && (
                      <span className="text-[10px] font-mono text-slate-400 mt-2 block truncate">
                        File: {doc.fileName} ({doc.fileSize || '1.2 MB'})
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400">
                      Uploaded: {doc.uploadedAt || 'Today'}
                    </span>
                    <button
                      type="button"
                      onClick={() => showToast(`Document ${doc.name} inspected & verified`, 'info')}
                      className="text-feedo-600 font-bold hover:underline cursor-pointer"
                    >
                      View Attachment →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: LIVE DISPATCH & ORDER OVERRIDES */}
        {activeTab === 'DISPATCH' && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">
                  Live Dispatch Management & State Machine Overrides
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Force transitions for stuck orders, trigger rider dispatches, and emergency bypass.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Order ID</th>
                    <th className="pb-3 px-3">Customer</th>
                    <th className="pb-3 px-3">Amount</th>
                    <th className="pb-3 px-3">Current State</th>
                    <th className="pb-3 px-3">Assigned Rider</th>
                    <th className="pb-3 px-3 text-right">Force State Machine Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => (
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
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                        ₹{order.total}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === 'DELIVERED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'PREPARING'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {order.rider ? (
                          <div className="flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-feedo-600" />
                            <span>{order.rider.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {order.status !== 'READY_FOR_PICKUP' && order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => adminForceOrderStatus(order.id, 'READY_FOR_PICKUP')}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-bold rounded-lg border border-amber-200 cursor-pointer"
                            >
                              Force Ready
                            </button>
                          )}
                          {order.status !== 'PICKED_UP' && order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => adminForceOrderStatus(order.id, 'PICKED_UP')}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded-lg border border-indigo-200 cursor-pointer"
                            >
                              Force Handover
                            </button>
                          )}
                          {order.status !== 'DELIVERED' && (
                            <button
                              type="button"
                              onClick={() => adminForceOrderStatus(order.id, 'DELIVERED')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Force Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: SETTLEMENT RELEASES & COMMISSIONS */}
        {activeTab === 'FINANCE' && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold font-heading text-slate-900">
                Settlement Clearing & Commission Governance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authoritative release of pending settlement batches and platform fee settings.
              </p>
            </div>

            {/* Platform Commission Adjuster */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold font-heading text-slate-900 uppercase tracking-wider">
                    FEEDO Platform Commission Rate
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Standard fee deducted automatically on all completed customer orders.
                  </p>
                </div>
                <span className="text-xl font-black font-heading text-feedo-600">
                  {restaurant.commissionRate || 18}%
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {[12, 15, 18, 20, 22].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => handleApplyCommission(rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      (restaurant.commissionRate || 18) === rate
                        ? 'bg-feedo-500 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {rate}% {rate === 18 ? '(Default)' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Settlement Release Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Batch ID</th>
                    <th className="pb-3 px-3">Period</th>
                    <th className="pb-3 px-3">Gross Sales</th>
                    <th className="pb-3 px-3">Commission</th>
                    <th className="pb-3 px-3">Net Payout</th>
                    <th className="pb-3 px-3">Current Status</th>
                    <th className="pb-3 px-3 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{s.payoutRef}</td>
                      <td className="py-3 px-3 text-slate-500">{s.period}</td>
                      <td className="py-3 px-3 font-mono text-slate-800">
                        ₹{s.grossAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        -₹{s.commission.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                        ₹{s.netPayout.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'SETTLED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {s.status !== 'SETTLED' ? (
                          <button
                            type="button"
                            onClick={() => adminReleaseSettlement(s.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer transition-colors"
                          >
                            Release NEFT Settlement →
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Cleared to Bank</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 4: IMMUTABLE AUDIT LOG TRAIL */}
        {activeTab === 'AUDIT' && (
          <section className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold font-heading text-slate-900">
                  Authoritative Security Audit Log Trail
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Append-only immutable record of all lifecycle events, permissions, and financial actions.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    placeholder="Search audit trail..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-feedo-500 w-44 sm:w-52"
                  />
                </div>

                <select
                  value={auditCategory}
                  onChange={(e) => setAuditCategory(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="AUTH">Authentication</option>
                  <option value="ORDER">Orders</option>
                  <option value="PAYMENT">Payments & Payouts</option>
                  <option value="DISPATCH">Dispatch & Riders</option>
                  <option value="KYC">KYC & Compliance</option>
                  <option value="ADMIN">Admin Governance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3 px-3">Timestamp</th>
                    <th className="pb-3 px-3">Action Event</th>
                    <th className="pb-3 px-3">Category</th>
                    <th className="pb-3 px-3">Actor / Principal</th>
                    <th className="pb-3 px-3">Details & Audit Payload</th>
                    <th className="pb-3 px-3 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-slate-500 font-mono whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {log.action}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                            {log.category}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">{log.actor}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{log.actorRole}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs sm:max-w-md truncate">
                          {log.details}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            ✓ {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No audit events found matching query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
export default AdminScreen;

