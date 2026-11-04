import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Smartphone,
  Download,
  QrCode,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  FileCode,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('FEEDO Partner app installed successfully!', 'success');
      }
      setDeferredPrompt(null);
    } else {
      showToast('To install: open in Chrome/Edge on your Android phone and tap "Add to Home screen" / "Install App"!', 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-feedo-950 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-feedo-500/20 border border-feedo-500/30 flex items-center justify-center text-feedo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-feedo-400 uppercase tracking-wider">Android Mobile App</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <h2 className="text-xl font-black mt-0.5">Download FEEDO Partner Mobile App</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs text-slate-700">
          {/* Method 1: Instant PWA Install on Android Phone (Recommended) */}
          <div className="p-5 bg-gradient-to-br from-feedo-50 via-amber-50 to-orange-50 border-2 border-feedo-300 rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-feedo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  Method 1: Instant 1-Click Install on Android / iOS (Fastest)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-feedo-500 text-white px-2 py-0.5 rounded-full">
                Recommended
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Install the complete FEEDO Partner App directly to your Android device home screen with full offline support, instant order notifications, and standalone full-screen experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleInstallPwa}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white font-bold rounded-2xl shadow-md shadow-feedo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install FEEDO Partner App Now</span>
              </button>
            </div>
          </div>

          {/* Method 2: Capacitor Native Android APK Build */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <FileCode className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                Method 2: Native Android APK (Capacitor / Android Studio)
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              The project is configured with <code>@capacitor/core</code> and <code>@capacitor/android</code>. You can generate a native signed <code>.apk</code> in 3 simple commands:
            </p>

            <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl font-mono text-[11px] space-y-2">
              <p className="text-slate-400"># 1. Build web production bundle:</p>
              <p className="text-emerald-400 font-bold">npm run build</p>
              <p className="text-slate-400"># 2. Add and sync Android project:</p>
              <p className="text-emerald-400 font-bold">npx cap add android</p>
              <p className="text-emerald-400 font-bold">npx cap sync</p>
              <p className="text-slate-400"># 3. Open in Android Studio & Build APK:</p>
              <p className="text-emerald-400 font-bold">npx cap open android</p>
            </div>
          </div>

          {/* Method 3: Cloud 1-Click APK Generator (PWABuilder) */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-black text-slate-900">
                Method 3: Cloud 1-Click APK Package (PWABuilder)
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              You can deploy this web app or host it on Vercel/Netlify, then paste your URL into <strong>PWABuilder.com</strong> (Microsoft's free tool) to download a ready-to-install Android <code>.apk</code> or Google Play <code>.aab</code> package without installing Android Studio!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            Package ID: <code>com.feedo.restaurantpartner</code>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
