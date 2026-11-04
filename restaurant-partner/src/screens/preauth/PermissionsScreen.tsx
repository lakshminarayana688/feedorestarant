import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import {
  permissionService,
  PermissionKey,
  PermissionStatus,
  PERMISSION_DEFINITIONS,
} from '../../services/permissionService';
import {
  Bell,
  Camera,
  MapPin,
  Mic,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Shield,
  Settings,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SinglePermissionConfig {
  key: PermissionKey;
  stepNumber: number;
  progressText: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  explanation: string;
  allowButtonText: string;
  nextStepText: string;
}

const PERMISSION_STEPS: SinglePermissionConfig[] = [
  {
    key: 'notifications',
    stepNumber: 1,
    progressText: 'Permission 1 of 4',
    title: 'Enable Notifications',
    icon: Bell,
    explanation: 'Notifications help the restaurant receive new order alerts and important updates.',
    allowButtonText: 'Allow Notifications',
    nextStepText: 'Proceed to Camera',
  },
  {
    key: 'camera',
    stepNumber: 2,
    progressText: 'Permission 2 of 4',
    title: 'Allow Camera Access',
    icon: Camera,
    explanation: 'Camera is used for relevant restaurant verification and document capture.',
    allowButtonText: 'Allow Camera',
    nextStepText: 'Proceed to Location',
  },
  {
    key: 'location',
    stepNumber: 3,
    progressText: 'Permission 3 of 4',
    title: 'Enable Location Access',
    icon: MapPin,
    explanation: 'Location access is used to verify restaurant storefront coordinates and calibrate delivery radius for customer operations.',
    allowButtonText: 'Allow Location',
    nextStepText: 'Proceed to Microphone',
  },
  {
    key: 'microphone',
    stepNumber: 4,
    progressText: 'Permission 4 of 4',
    title: 'Allow Microphone Access',
    icon: Mic,
    explanation: 'Microphone access is used for hands-free kitchen voice commands and voice communication with the FEEDO AI Dispatch Support Agent.',
    allowButtonText: 'Allow Microphone',
    nextStepText: 'Proceed to Login',
  },
];

export const PermissionsScreen: React.FC = () => {
  const { setScreen, showToast, restaurant } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [currentStatus, setCurrentStatus] = useState<PermissionStatus>('prompt');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const step = PERMISSION_STEPS[currentStepIndex];
  const Icon = step.icon;
  const isGranted = currentStatus === 'granted';
  const isBlocked = currentStatus === 'blocked';
  const isDenied = currentStatus === 'denied';

  // Probe permission status for current active step
  const probeCurrentPermission = useCallback(async () => {
    const status = await permissionService.probeStatus(step.key);
    setCurrentStatus(status);
  }, [step.key]);

  useEffect(() => {
    probeCurrentPermission();

    // Auto-detect when user returns to app after changing browser/system settings
    const handleFocus = () => {
      probeCurrentPermission();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [probeCurrentPermission]);

  // Advance to next permission or to Login after final step
  const handleProceedToNext = () => {
    if (currentStepIndex < PERMISSION_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentStatus('prompt');
      setShowSettingsModal(false);
    } else {
      // Completed all 4 permissions
      localStorage.setItem('feedo_permissions_setup_done', 'true');
      permissionService.syncToSupabase(restaurant?.id);
      showToast('All permissions configured successfully!', 'success');
      setScreen('login');
    }
  };

  // Handle Allow Permission click
  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const res = await permissionService.requestPermission(step.key);
      setCurrentStatus(res.status);

      if (res.success && res.status === 'granted') {
        showToast(`✓ ${step.title} granted!`, 'success');
        permissionService.syncToSupabase(restaurant?.id);

        // Smooth transition to next permission screen after brief confirmation
        setTimeout(() => {
          handleProceedToNext();
        }, 600);
      } else if (res.status === 'blocked') {
        setShowSettingsModal(true);
        showToast('Permission blocked in browser settings. Please enable via address bar settings.', 'warning');
      } else {
        showToast(res.message || 'Permission was not granted.', 'info');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  // Optional manual recheck / retry
  const handleRetry = async () => {
    await probeCurrentPermission();
    if (currentStatus === 'granted') {
      handleProceedToNext();
    } else {
      await handleAllow();
    }
  };

  const renderStatusBadge = () => {
    switch (currentStatus) {
      case 'granted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Granted / Enabled</span>
          </span>
        );
      case 'blocked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Blocked in Settings</span>
          </span>
        );
      case 'denied':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Not Enabled / Denied</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <span>Action Required</span>
          </span>
        );
    }
  };

  const progressPercent = ((step.stepNumber) / PERMISSION_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center py-6">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
          {/* Brand & Progress Header */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 shadow-xs shrink-0">
                  <img
                    src="/feedo-logo.png"
                    alt="FEEDO"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-slate-900 font-heading">
                    FEEDO
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.2 rounded-md ml-1.5">
                    Partner
                  </span>
                </div>
              </div>

              {/* Progress Indicator */}
              <span className="text-xs font-black uppercase tracking-wider text-feedo-700 bg-feedo-50 border border-feedo-200 px-3 py-1 rounded-full">
                {step.progressText}
              </span>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-feedo-500 to-feedo-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Individual Permission Card (One at a time) */}
          <div className="flex flex-col items-center text-center py-4 space-y-4">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                isGranted
                  ? 'bg-emerald-100 text-emerald-700 shadow-emerald-500/20'
                  : isBlocked
                  ? 'bg-amber-100 text-amber-700 shadow-amber-500/20'
                  : 'bg-feedo-50 text-feedo-600 border border-feedo-100 shadow-feedo-500/10'
              }`}
            >
              <Icon className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {step.title}
                </h1>
              </div>
              <div className="flex justify-center pt-0.5">
                {renderStatusBadge()}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 max-w-sm leading-relaxed px-2">
              {step.explanation}
            </p>
          </div>

          {/* Denied / Blocked Explanation Alert */}
          {(isDenied || isBlocked) && (
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left space-y-2 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Permission Required</span>
              </div>
              <p className="leading-relaxed">
                {isBlocked
                  ? 'This permission is blocked in your browser settings. Please enable it via the address bar lock icon to continue.'
                  : 'To guarantee reliable restaurant operations, this permission is needed. Please click the button below to allow access.'}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {isGranted ? (
              <button
                type="button"
                id={`btn-allow-${step.key}`}
                onClick={handleProceedToNext}
                className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Granted &bull; {step.nextStepText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : isBlocked ? (
              <div className="space-y-2">
                <button
                  type="button"
                  id={`btn-settings-${step.key}`}
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Open Settings Instructions</span>
                </button>

                <button
                  type="button"
                  id={`btn-retry-${step.key}`}
                  onClick={handleRetry}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Permission Status Again</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                id={`btn-allow-${step.key}`}
                disabled={isRequesting}
                onClick={handleAllow}
                className="w-full py-4 px-6 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-feedo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isRequesting ? 'Requesting Permission...' : step.allowButtonText}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Zero-Trust Privacy */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 py-2 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5" />
        <span>FEEDO Zero-Trust Permission Security &bull; Step {step.stepNumber} of 4</span>
      </div>

      {/* Settings Instructions Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Enable in Browser Settings
                  </h3>
                  <p className="text-[11px] text-slate-500">{step.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700 leading-relaxed">
              <p className="font-semibold text-slate-900">Follow these steps:</p>
              <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                <li>Click the <strong>lock</strong> or <strong>tune</strong> icon beside the URL in the browser address bar.</li>
                <li>Find <strong>{step.title.replace('Allow ', '').replace('Enable ', '')}</strong> in the permissions list.</li>
                <li>Toggle the setting to <strong>Allow</strong>.</li>
                <li>Return to this tab; the permission will be automatically detected.</li>
              </ol>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSettingsModal(false);
                  handleRetry();
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Done, Check Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
