import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { legalService, LEGAL_VERSIONS } from '../../services/legalService';
import {
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Scale,
} from 'lucide-react';

export const LegalAcceptanceScreen: React.FC = () => {
  const { setScreen, showToast, addAuditLog, restaurant } = useApp();

  // Exactly two mandatory checkboxes, neither automatically selected
  const [agreedTerms, setAgreedTerms] = useState<boolean>(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const canProceed = agreedTerms && agreedPrivacy && !isSubmitting;

  const handleAcceptAndContinue = async () => {
    if (!agreedTerms || !agreedPrivacy) {
      showToast('Please check both mandatory boxes to accept the Terms & Conditions and Privacy Policy.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Record acceptance locally and in Supabase
      await legalService.recordAcceptance(undefined, restaurant?.id);

      addAuditLog({
        action: 'LEGAL_POLICIES_ACCEPTED',
        category: 'AUTH',
        actor: restaurant?.ownerName || 'Partner Applicant',
        actorRole: 'OWNER',
        details: `Accepted Terms & Conditions (${LEGAL_VERSIONS.terms}) and Privacy Policy (${LEGAL_VERSIONS.privacy}) with digital signature timestamp.`,
        status: 'SUCCESS',
      });

      showToast('Legal compliance acceptance recorded successfully.', 'success');
      setScreen('permissions');
    } catch (err: any) {
      showToast('Failed to record legal acceptance: ' + (err?.message || 'Please try again'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center p-3 shadow-lg mx-auto mb-4">
            <img
              src="/feedo-logo.png"
              alt="FEEDO"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold mb-2">
            <Scale className="w-3.5 h-3.5 text-amber-600" />
            <span>Step 4 of 8: Formal Legal Assent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Terms &amp; Privacy Acceptance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Please confirm your explicit agreement to both statutory documents before proceeding to device permissions and onboarding.
          </p>
        </div>

        {/* Document Inspection Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setScreen('terms')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-feedo-400 bg-slate-50 hover:bg-feedo-50/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-4 h-4 text-feedo-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-feedo-700">
                  Terms &amp; Conditions
                </span>
                <span className="text-[10px] text-slate-500">24 Sections &bull; {LEGAL_VERSIONS.terms}</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-feedo-600 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => setScreen('privacy')}
            className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 text-left transition-colors flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate group-hover:text-emerald-700">
                  Privacy Policy
                </span>
                <span className="text-[10px] text-slate-500">22 Sections &bull; {LEGAL_VERSIONS.privacy}</span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
          </button>
        </div>

        {/* Mandatory Agreement Checkboxes */}
        <div className="space-y-4 mb-8">
          {/* Checkbox 1: Terms & Conditions */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              agreedTerms ? 'border-feedo-500 bg-feedo-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-terms"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-feedo-600 focus:ring-feedo-500 cursor-pointer accent-feedo-600 shrink-0"
              />
              <div className="text-xs sm:text-sm text-slate-800 leading-snug">
                <span className="font-bold text-slate-900 block">
                  I have read and agree to the Terms &amp; Conditions.
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mandatory agreement covering FSSAI compliance, 4-digit pickup code handovers, daily 10:00 AM bank settlements, and merchant responsibilities.
                </p>
              </div>
            </label>
          </div>

          {/* Checkbox 2: Privacy Policy */}
          <div
            className={`p-4 rounded-2xl border-2 transition-all ${
              agreedPrivacy ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                id="checkbox-privacy"
                checked={agreedPrivacy}
                onChange={(e) => setAgreedPrivacy(e.target.checked)}
                className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
              />
              <div className="text-xs sm:text-sm text-slate-800 leading-snug">
                <span className="font-bold text-slate-900 block">
                  I have read and agree to the Privacy Policy.
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mandatory agreement covering DPDP Act 2023 compliance, masked customer communications, encrypted banking data, and FSSAI live camera capture.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Action Button & Security Notice */}
        <div className="space-y-4">
          <button
            type="button"
            id="accept-and-continue-btn"
            disabled={!canProceed}
            onClick={handleAcceptAndContinue}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              canProceed
                ? 'bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white shadow-lg shadow-feedo-500/25 active:scale-98'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-75'
            }`}
          >
            <span>{isSubmitting ? 'Recording Agreement...' : 'Accept & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-2 text-center">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Digital assent is timestamped and recorded under Indian IT &amp; DPDP Statutes.</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-xl mx-auto w-full text-center text-xs text-slate-400 py-3">
        FEEDO Technologies Private Limited &bull; Legal Compliance Division
      </div>
    </div>
  );
};

export default LegalAcceptanceScreen;

