import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  ShieldCheck,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Plus,
  Calendar,
} from 'lucide-react';

export const DocumentsScreen: React.FC = () => {
  const { documents, updateDocument, showToast } = useApp();

  const docCompliance = [
    {
      id: 'doc-fssai',
      name: 'FSSAI Food Hygiene License',
      expDate: '15 Oct 2027',
      status: 'VERIFIED',
      badge: '✓ 100% Compliant',
      type: 'Statutory Food License',
      isExpiringSoon: false,
    },
    {
      id: 'doc-gst',
      name: 'GST Tax Registration Certificate',
      expDate: 'Lifetime Active',
      status: 'VERIFIED',
      badge: '✓ Tax Verified',
      type: 'Commercial Tax',
      isExpiringSoon: false,
    },
    {
      id: 'doc-fire',
      name: 'Fire & Safety NOC Certificate',
      expDate: '28 Nov 2026',
      status: 'VERIFIED',
      badge: '⚠️ Expiring in 60 Days',
      type: 'Premises Safety',
      isExpiringSoon: true,
    },
    {
      id: 'doc-insurance',
      name: 'Commercial Kitchen Insurance',
      expDate: '10 Jan 2027',
      status: 'VERIFIED',
      badge: '✓ Insured',
      type: 'Liability Policy',
      isExpiringSoon: false,
    },
  ];

  const timeline = [
    { title: 'FSSAI License 21223004000891 Verified', time: '18 Sep 2026, 11:20 AM', status: 'Approved' },
    { title: 'GST Certificate 29AABCL9921D1Z5 Verified', time: '17 Sep 2026, 03:45 PM', status: 'Approved' },
    { title: 'Bank Passbook Cleared for Settlements', time: '16 Sep 2026, 09:30 AM', status: 'Approved' },
    { title: 'Initial Document Bundle Submitted', time: '15 Sep 2026, 02:10 PM', status: 'Submitted' },
  ];

  const handleUpload = (docName: string) => {
    showToast(`New document uploaded for "${docName}". Under verification.`, 'success');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Documents & Compliance Verification
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Maintain valid municipal licenses, food hygiene certificates, and regulatory compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Overall Compliance: 100% Verified</span>
        </div>
      </div>

      {/* Expiring Soon Alert */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">Upcoming Renewal Notice: Fire & Safety NOC</h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Expires on 28 Nov 2026. Please upload renewed certificate before expiry to prevent merchant suspension.
            </p>
          </div>
        </div>
        <button
          onClick={() => handleUpload('Fire NOC')}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs self-start sm:self-auto transition-colors cursor-pointer"
        >
          Upload Renewal
        </button>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {docCompliance.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-feedo-50 text-feedo-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <span className="text-[11px] text-slate-400">{doc.type}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    doc.isExpiringSoon
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {doc.badge}
                </span>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100 mb-4">
                <div className="flex justify-between text-slate-600">
                  <span>Expiration Date:</span>
                  <span className="font-bold text-slate-800">{doc.expDate}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Verification Audit:</span>
                  <span className="font-bold text-emerald-600">✓ Approved & On File</span>
                </div>
              </div>

              {/* Drag-Drop / Upload Area Placeholder */}
              <div
                onClick={() => handleUpload(doc.name)}
                className="border-2 border-dashed border-slate-200 hover:border-feedo-500 rounded-2xl p-4 text-center cursor-pointer transition-colors group"
              >
                <Upload className="w-5 h-5 text-slate-400 group-hover:text-feedo-600 mx-auto mb-1 transition-colors" />
                <span className="text-xs font-bold text-slate-700 block">Click to upload new version</span>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => showToast(`Viewing digital copy for ${doc.name}`, 'info')}
                className="text-xs font-bold text-feedo-600 hover:underline flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Document</span>
              </button>
              <span className="text-[11px] text-slate-400 font-mono">KYC-AUTH-OK</span>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Checklist & Document History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Checklist */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Mandatory Compliance Checklist
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { label: 'FSSAI 14-Digit Registration on food packages', done: true },
              { label: 'Display of FSSAI license inside kitchen premises', done: true },
              { label: 'Pest control & hygiene sanitization logs (Monthly)', done: true },
              { label: 'Clean food-grade packaging compliance', done: true },
              { label: 'Kitchen staff health cards on record', done: true },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-slate-800 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Document History Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Verification Activity History
          </h3>

          <div className="space-y-4 pl-2 border-l-2 border-slate-100">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative pl-4">
                <span className="absolute -left-[9px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-0.5">
                  <span>{item.time}</span>
                  <span className="text-emerald-600 font-bold">✓ {item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Agreements & Privacy Policies */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Statutory Agreements &amp; Privacy Policies
            </h3>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
              Active &bull; v2.4
            </span>
          </div>

          <p className="text-xs text-slate-500">
            You can review your verified merchant terms and data protection policies anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setScreen('terms')}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-feedo-400 bg-slate-50 hover:bg-feedo-50/30 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-feedo-700">
                  Terms &amp; Conditions
                </span>
                <span className="text-[11px] text-slate-500">24 Sections &bull; Version 2.4</span>
              </div>
              <span className="text-xs font-bold text-feedo-600 group-hover:translate-x-0.5 transition-transform">View →</span>
            </button>

            <button
              type="button"
              onClick={() => setScreen('privacy')}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 text-left transition-colors flex items-center justify-between group cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700">
                  Privacy Policy
                </span>
                <span className="text-[11px] text-slate-500">22 Sections &bull; Version 2.4</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">View →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
