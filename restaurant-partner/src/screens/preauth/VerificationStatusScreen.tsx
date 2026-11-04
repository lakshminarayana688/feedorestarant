import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Store,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export const VerificationStatusScreen: React.FC = () => {
  const { restaurant, updateRestaurant, simulateApproval, setScreen, isPrototypeMode, showToast } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const status = restaurant.regStatus || 'UNDER_REVIEW';
  const isRejected = status === 'REJECTED';
  const isApproved = status === 'APPROVED' || status === 'ACTIVE';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Status refreshed from FEEDO verification server.', 'info');
    }, 800);
  };

  const handleResubmit = () => {
    updateRestaurant({ regStatus: 'DRAFT' });
    showToast('Please update required documents and submit for verification.', 'info');
    setScreen('documents');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 text-center">
        {/* Animated Badge */}
        {isRejected ? (
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-rose-500/10">
            <AlertTriangle className="w-10 h-10" />
          </div>
        ) : isApproved ? (
          <div className="w-20 h-20 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-md shadow-amber-500/10 animate-bounce-slow">
            <Clock className="w-10 h-10" />
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          {isRejected
            ? 'KYC Verification Rejected'
            : isApproved
            ? 'KYC Verification Approved'
            : 'Under FEEDO Review'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-8">
          Application for <strong className="text-slate-800">{restaurant.restaurantName}</strong>
        </p>

        {/* Rejection Alert Notice */}
        {isRejected && (
          <div className="mb-8 p-5 bg-rose-50/80 border-2 border-rose-200 rounded-2xl text-left space-y-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs sm:text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>Reason for Rejection / Resubmission Required</span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed bg-white p-3.5 rounded-xl border border-rose-200">
              {restaurant.kycRejectionReason ||
                'The captured FSSAI Certificate was blurry or illegible. Please retake a clear live photo of the original certificate with unblocked license number and business address.'}
            </p>
            <p className="text-[11px] text-rose-700">
              You can correct and resubmit your documents without creating a new application.
            </p>
          </div>
        )}

        {/* Verification Timeline Card */}
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-4 mb-8">
          {/* Step 1 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Restaurant Registration</h4>
              <p className="text-[11px] text-slate-500">Completed with owner &amp; address details</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
              ✓
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Documents Submitted</h4>
              <p className="text-[11px] text-slate-500">FSSAI live camera capture &amp; Aadhaar uploaded</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                isRejected
                  ? 'bg-rose-500 text-white'
                  : isApproved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              {isRejected ? '✕' : isApproved ? '✓' : '●'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={`text-xs font-bold ${
                    isRejected ? 'text-rose-700' : isApproved ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  FEEDO Compliance Audit
                </h4>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isRejected
                      ? 'bg-rose-100 text-rose-800'
                      : isApproved
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isRejected ? 'Rejected' : isApproved ? 'Approved' : 'Under Review'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isRejected
                  ? 'Action required: Resubmit corrected documents'
                  : isApproved
                  ? 'Documents successfully validated and verified'
                  : 'FSSAI validity and hygiene check in progress'}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                isApproved ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
              }`}
            >
              {isApproved ? '✓' : '○'}
            </div>
            <div>
              <h4 className={`text-xs font-bold ${isApproved ? 'text-slate-900' : 'text-slate-400'}`}>
                Restaurant Activation &amp; Dashboard
              </h4>
              <p className="text-[11px] text-slate-400">
                {isApproved ? 'Store ready to receive customer orders' : 'Pending verification completion'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isRejected ? (
            <button
              type="button"
              id="resubmit-documents-btn"
              onClick={handleResubmit}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-feedo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Resubmit Corrected Documents</span>
            </button>
          ) : isApproved ? (
            <button
              type="button"
              id="go-to-dashboard-btn"
              onClick={() => setScreen('dashboard')}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Restaurant Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setScreen('documents')}
                className="w-full py-3 px-4 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer"
              >
                View Submitted Documents
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="w-full py-3 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Checking Status...' : 'Refresh Status'}</span>
              </button>

              {isPrototypeMode && (
                /* Prototype Fast-Forward Demo Simulator */
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-left space-y-2 mt-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Prototype Review Shortcut:</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    In production, manual document vetting takes 24 hours. For prototype testing, you can simulate instant FEEDO approval:
                  </p>
                  <button
                    type="button"
                    onClick={simulateApproval}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulate Approval Now</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationStatusScreen;
