import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  permissionService,
  PermissionDefinition,
  PermissionKey,
} from '../../services/permissionService';
import {
  Bell,
  Camera,
  Volume2,
  MapPin,
  Image,
  Mic,
  CheckCircle2,
  X,
  AlertTriangle,
  Settings,
} from 'lucide-react';

const ICON_MAP: Record<PermissionKey, React.ComponentType<{ className?: string }>> = {
  notifications: Bell,
  camera: Camera,
  audio: Volume2,
  location: MapPin,
  photos: Image,
  microphone: Mic,
};

export const PermissionReminderDialog: React.FC = () => {
  const { showToast, unlockAudio, currentScreen } = useApp();
  const [activeReminder, setActiveReminder] = useState<PermissionDefinition | null>(null);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);
  const [showSettingsHelp, setShowSettingsHelp] = useState<boolean>(false);

  // Check for pending reminder on mount or screen change
  useEffect(() => {
    // Avoid showing reminder on the permissions setup screen itself
    if (currentScreen === 'permissions' || currentScreen === 'splash') {
      setActiveReminder(null);
      return;
    }

    // Delay slightly so app loads cleanly before showing reminder
    const timer = setTimeout(() => {
      const next = permissionService.getNextReminder();
      setActiveReminder(next);
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentScreen]);

  if (!activeReminder) return null;

  const Icon = ICON_MAP[activeReminder.key] || Bell;
  const currentRecord = permissionService.getRecord(activeReminder.key);
  const isBlocked = currentRecord.status === 'blocked';

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      const res = await permissionService.requestPermission(activeReminder.key, {
        unlockAudioFn: unlockAudio,
      });

      if (res.success && res.status === 'granted') {
        showToast(`✓ ${activeReminder.name} permission enabled!`, 'success');
        setActiveReminder(null);
      } else if (res.status === 'blocked') {
        setShowSettingsHelp(true);
      } else {
        showToast(res.message, 'info');
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleNotNow = () => {
    // Dismiss for the current session (never interrupt repeatedly in the same session)
    permissionService.dismissReminderForSession(activeReminder.key);
    setActiveReminder(null);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full mx-auto p-2 sm:p-0 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/90 p-5 space-y-4 font-sans select-none">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200 text-feedo-600 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 font-heading">
                  {activeReminder.name}
                </span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                    activeReminder.isRequired
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {activeReminder.isRequired ? 'Recommended' : 'Optional'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{activeReminder.category}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNotNow}
            title="Dismiss for this session"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          {activeReminder.description}
        </p>

        {/* Browser Settings Help if Blocked */}
        {(isBlocked || showSettingsHelp) && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>Permission Blocked in Browser</span>
            </div>
            <p className="leading-normal">{activeReminder.settingsInstruction}</p>
          </div>
        )}

        {/* Actions: Allow and Not Now */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            id={`reminder-notnow-${activeReminder.key}`}
            onClick={handleNotNow}
            className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Not Now
          </button>

          {isBlocked || showSettingsHelp ? (
            <button
              type="button"
              id={`reminder-check-${activeReminder.key}`}
              onClick={async () => {
                const updated = await permissionService.probeStatus(activeReminder.key);
                if (updated === 'granted') {
                  showToast(`✓ ${activeReminder.name} enabled!`, 'success');
                  setActiveReminder(null);
                } else {
                  showToast('Still blocked. Please update browser site settings.', 'info');
                }
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Check Again
            </button>
          ) : (
            <button
              type="button"
              id={`reminder-allow-${activeReminder.key}`}
              disabled={isRequesting}
              onClick={handleAllow}
              className="px-4 py-2 bg-gradient-to-r from-feedo-500 to-feedo-600 hover:from-feedo-600 hover:to-feedo-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              {isRequesting ? (
                <span>Requesting...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Allow</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionReminderDialog;

