// src/services/permissionService.ts
import { getSupabaseClient, isSupabaseConfigured } from '../utils/supabase';

export type PermissionKey =
  | 'notifications'
  | 'camera'
  | 'audio'
  | 'location'
  | 'photos'
  | 'microphone';

export type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'blocked' | 'unsupported';
export type UserDecision = 'allowed' | 'not_allowed' | 'not_now' | 'undecided';

export interface PermissionDefinition {
  key: PermissionKey;
  name: string;
  category: string;
  description: string;
  isRequired: boolean; // Essential vs Optional
  settingsInstruction: string;
}

export interface PermissionStateRecord {
  key: PermissionKey;
  status: PermissionStatus;
  userDecision: UserDecision;
  remindOnNextVisit: boolean;
  lastUpdated: string;
}

export const PERMISSION_DEFINITIONS: Record<PermissionKey, PermissionDefinition> = {
  notifications: {
    key: 'notifications',
    name: 'Notifications',
    category: 'Order & Settlement Alerts',
    description: 'Instant alerts for new customer orders, rider arrivals, kitchen cancellations, and daily 10:00 AM settlements.',
    isRequired: true,
    settingsInstruction: 'Click the lock or tune icon beside the URL in your browser address bar -> Permissions -> Notifications -> Allow.',
  },
  camera: {
    key: 'camera',
    name: 'Camera',
    category: 'FSSAI & QR Verification',
    description: 'Required for live camera capture of original FSSAI certificate, storefront facade photos, and scanning rider pickup QR codes.',
    isRequired: true,
    settingsInstruction: 'Click the lock icon in your browser address bar -> Permissions -> Camera -> Allow.',
  },
  audio: {
    key: 'audio',
    name: 'Sound / Audio Alerts',
    category: 'Kitchen Order Ringtone',
    description: 'Continuous loud ringtones and audio chimes when high-priority customer orders are placed so kitchen staff never miss a meal.',
    isRequired: true,
    settingsInstruction: 'Click anywhere on screen or tap the sound unlock button to enable browser audio autoplay.',
  },
  location: {
    key: 'location',
    name: 'Location',
    category: 'Premises Verification',
    description: 'Verifies physical restaurant storefront coordinates, sets customer delivery radius, and calculates live rider transit times.',
    isRequired: false,
    settingsInstruction: 'Click the lock icon in your browser address bar -> Permissions -> Location -> Allow.',
  },
  photos: {
    key: 'photos',
    name: 'Photos & Media Storage',
    category: 'Menu & Cheque Uploads',
    description: 'Allows selecting high-resolution dish pictures, digital menu images, and bank passbook/cancelled cheque files from device storage.',
    isRequired: true,
    settingsInstruction: 'Allow device file and photo storage access when the file picker opens on your device.',
  },
  microphone: {
    key: 'microphone',
    name: 'Microphone (Voice Support)',
    category: 'Optional Voice Features',
    description: 'Supports hands-free kitchen voice commands and voice communication with the FEEDO AI Dispatch Support Agent.',
    isRequired: false,
    settingsInstruction: 'Click the lock icon in your browser address bar -> Permissions -> Microphone -> Allow.',
  },
};

export const ALL_PERMISSION_KEYS: PermissionKey[] = [
  'notifications',
  'camera',
  'audio',
  'location',
  'photos',
  'microphone',
];

// In-memory session dismissal tracker (prevents continuous nagging in same session)
const sessionDismissed: Record<PermissionKey, boolean> = {
  notifications: false,
  camera: false,
  audio: false,
  location: false,
  photos: false,
  microphone: false,
};

export const permissionService = {
  /**
   * Get cached permission record from localStorage
   */
  getRecord(key: PermissionKey): PermissionStateRecord {
    const status = (localStorage.getItem(`feedo_perm_status_${key}`) as PermissionStatus) || 'prompt';
    const userDecision = (localStorage.getItem(`feedo_perm_decision_${key}`) as UserDecision) || 'undecided';
    const remindOnNextVisit = localStorage.getItem(`feedo_perm_remind_${key}`) === 'true';
    const lastUpdated = localStorage.getItem(`feedo_perm_updated_${key}`) || new Date().toISOString();

    return {
      key,
      status,
      userDecision,
      remindOnNextVisit,
      lastUpdated,
    };
  },

  /**
   * Save permission state
   */
  saveRecord(record: PermissionStateRecord): void {
    localStorage.setItem(`feedo_perm_status_${record.key}`, record.status);
    localStorage.setItem(`feedo_perm_decision_${record.key}`, record.userDecision);
    localStorage.setItem(`feedo_perm_remind_${record.key}`, record.remindOnNextVisit ? 'true' : 'false');
    localStorage.setItem(`feedo_perm_updated_${record.key}`, new Date().toISOString());
  },

  /**
   * Probe actual browser/device permission status
   */
  async probeStatus(key: PermissionKey, isAudioUnlocked: boolean = false): Promise<PermissionStatus> {
    const record = this.getRecord(key);

    switch (key) {
      case 'notifications': {
        if (!('Notification' in window)) return 'unsupported';
        if (Notification.permission === 'granted') {
          this.markGranted('notifications');
          return 'granted';
        }
        if (Notification.permission === 'denied') {
          return 'blocked';
        }
        return record.userDecision === 'not_allowed' ? 'denied' : 'prompt';
      }

      case 'audio': {
        if (isAudioUnlocked) {
          this.markGranted('audio');
          return 'granted';
        }
        return record.userDecision === 'not_allowed' ? 'denied' : 'prompt';
      }

      case 'location': {
        if (!('geolocation' in navigator)) return 'unsupported';
        if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
          try {
            const res = await navigator.permissions.query({ name: 'geolocation' });
            if (res.state === 'granted') {
              this.markGranted('location');
              return 'granted';
            }
            if (res.state === 'denied') return 'blocked';
          } catch {
            // query may throw on some browsers
          }
        }
        return record.status === 'granted' ? 'granted' : (record.userDecision === 'not_allowed' ? 'denied' : 'prompt');
      }

      case 'camera': {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unsupported';
        if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
          try {
            const res = await navigator.permissions.query({ name: 'camera' as PermissionName });
            if (res.state === 'granted') {
              this.markGranted('camera');
              return 'granted';
            }
            if (res.state === 'denied') return 'blocked';
          } catch {
            // query camera may not be supported in some environments
          }
        }
        return record.status === 'granted' ? 'granted' : (record.userDecision === 'not_allowed' ? 'denied' : 'prompt');
      }

      case 'microphone': {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return 'unsupported';
        if (typeof navigator !== 'undefined' && 'permissions' in navigator && navigator.permissions?.query) {
          try {
            const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            if (res.state === 'granted') {
              this.markGranted('microphone');
              return 'granted';
            }
            if (res.state === 'denied') return 'blocked';
          } catch {
            // ignore
          }
        }
        return record.status === 'granted' ? 'granted' : (record.userDecision === 'not_allowed' ? 'denied' : 'prompt');
      }

      case 'photos': {
        const hasFileApi = typeof window !== 'undefined' && 'FileReader' in window && 'Blob' in window;
        if (!hasFileApi) return 'unsupported';
        return record.status === 'granted' ? 'granted' : (record.userDecision === 'not_allowed' ? 'denied' : 'prompt');
      }

      default:
        return 'prompt';
    }
  },

  /**
   * User clicks Allow: Request device capability and update state
   */
  async requestPermission(
    key: PermissionKey,
    helpers?: { unlockAudioFn?: () => Promise<boolean> }
  ): Promise<{ success: boolean; status: PermissionStatus; message: string }> {
    switch (key) {
      case 'notifications': {
        if (!('Notification' in window)) {
          this.saveRecord({
            key,
            status: 'unsupported',
            userDecision: 'allowed',
            remindOnNextVisit: false,
            lastUpdated: new Date().toISOString(),
          });
          return { success: false, status: 'unsupported', message: 'Notifications not supported in this browser.' };
        }
        try {
          const result = await Notification.requestPermission();
          if (result === 'granted') {
            this.markGranted('notifications');
            return { success: true, status: 'granted', message: 'Notifications enabled for new orders and settlements!' };
          }
          if (result === 'denied') {
            this.saveRecord({
              key,
              status: 'blocked',
              userDecision: 'allowed',
              remindOnNextVisit: true,
              lastUpdated: new Date().toISOString(),
            });
            return {
              success: false,
              status: 'blocked',
              message: 'Notifications blocked in browser settings. Please enable via address bar settings.',
            };
          }
          return { success: false, status: 'prompt', message: 'Permission dismissed.' };
        } catch {
          return { success: false, status: 'denied', message: 'Failed to request notification permission.' };
        }
      }

      case 'camera': {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return { success: false, status: 'unsupported', message: 'Camera not available on this device.' };
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          this.markGranted('camera');
          return { success: true, status: 'granted', message: 'Camera enabled for FSSAI certificate capture and QR scanning!' };
        } catch (err: any) {
          const isBlocked = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
          const newStatus: PermissionStatus = isBlocked ? 'blocked' : 'denied';
          this.saveRecord({
            key,
            status: newStatus,
            userDecision: 'allowed',
            remindOnNextVisit: true,
            lastUpdated: new Date().toISOString(),
          });
          return {
            success: false,
            status: newStatus,
            message: isBlocked
              ? 'Camera access blocked in browser settings. Please click lock icon in URL bar to enable.'
              : 'Could not access camera.',
          };
        }
      }

      case 'audio': {
        try {
          if (helpers?.unlockAudioFn) {
            const ok = await helpers.unlockAudioFn();
            if (ok) {
              this.markGranted('audio');
              return { success: true, status: 'granted', message: 'Kitchen order audio ringtone enabled!' };
            }
          }
          this.markGranted('audio');
          return { success: true, status: 'granted', message: 'Kitchen audio alerts enabled!' };
        } catch {
          return { success: false, status: 'denied', message: 'Audio autoplay could not be unlocked.' };
        }
      }

      case 'location': {
        if (!('geolocation' in navigator)) {
          return { success: false, status: 'unsupported', message: 'Geolocation is not supported.' };
        }
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              this.markGranted('location');
              resolve({ success: true, status: 'granted', message: 'Premises location verified!' });
            },
            (err) => {
              const isBlocked = err.code === 1; // PERMISSION_DENIED
              const newStatus: PermissionStatus = isBlocked ? 'blocked' : 'denied';
              this.saveRecord({
                key,
                status: newStatus,
                userDecision: 'allowed',
                remindOnNextVisit: true,
                lastUpdated: new Date().toISOString(),
              });
              resolve({
                success: false,
                status: newStatus,
                message: isBlocked
                  ? 'Location blocked in site settings. Enable via browser address bar.'
                  : 'Location request timed out.',
              });
            },
            { timeout: 8000, enableHighAccuracy: true }
          );
        });
      }

      case 'photos': {
        const hasFileApi = typeof window !== 'undefined' && 'FileReader' in window && 'Blob' in window;
        if (hasFileApi) {
          this.markGranted('photos');
          return { success: true, status: 'granted', message: 'Photo & media storage access granted!' };
        }
        return { success: false, status: 'unsupported', message: 'File access not supported.' };
      }

      case 'microphone': {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return { success: false, status: 'unsupported', message: 'Microphone not available.' };
        }
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          this.markGranted('microphone');
          return { success: true, status: 'granted', message: 'Voice support microphone enabled!' };
        } catch (err: any) {
          const isBlocked = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
          const newStatus: PermissionStatus = isBlocked ? 'blocked' : 'denied';
          this.saveRecord({
            key,
            status: newStatus,
            userDecision: 'allowed',
            remindOnNextVisit: true,
            lastUpdated: new Date().toISOString(),
          });
          return {
            success: false,
            status: newStatus,
            message: isBlocked
              ? 'Microphone blocked in site settings. Enable via browser address bar.'
              : 'Could not access microphone.',
          };
        }
      }
    }
  },

  /**
   * User clicks Don't Allow: marks as Not Enabled / Denied and sets remindOnNextVisit
   */
  handleDontAllow(key: PermissionKey): { status: PermissionStatus; message: string } {
    const current = this.getRecord(key);
    const newStatus: PermissionStatus = current.status === 'blocked' ? 'blocked' : 'denied';

    this.saveRecord({
      key,
      status: newStatus,
      userDecision: 'not_allowed',
      remindOnNextVisit: true, // Will remind on next visit/login where needed
      lastUpdated: new Date().toISOString(),
    });

    const def = PERMISSION_DEFINITIONS[key];
    const message = def.isRequired
      ? `${def.name} not enabled. A reminder will appear when using related features.`
      : `${def.name} disabled. You can still use the app normally without this optional feature.`;

    return { status: newStatus, message };
  },

  /**
   * Mark permission granted permanently
   */
  markGranted(key: PermissionKey): void {
    this.saveRecord({
      key,
      status: 'granted',
      userDecision: 'allowed',
      remindOnNextVisit: false, // Stop requesting that permission forever
      lastUpdated: new Date().toISOString(),
    });
    sessionDismissed[key] = true;
  },

  /**
   * Dismiss reminder for the current session (when user clicks "Not Now")
   */
  dismissReminderForSession(key: PermissionKey): void {
    sessionDismissed[key] = true;
  },

  /**
   * Get the single highest priority permission to remind the user about:
   * Rules:
   * - Never display multiple dialogs simultaneously.
   * - Only reminds if not granted and not dismissed in current session.
   * - Essential permissions (notifications, audio, camera) are prioritized.
   */
  getNextReminder(): PermissionDefinition | null {
    // Check if session reminder cooldown applies (e.g. wait at least 15s between reminders)
    for (const key of ALL_PERMISSION_KEYS) {
      if (sessionDismissed[key]) continue;

      const record = this.getRecord(key);
      if (record.status === 'granted' || record.status === 'unsupported') continue;

      // If user chose "not_allowed" and remindOnNextVisit is true, or essential permission is missing
      if (record.remindOnNextVisit || (PERMISSION_DEFINITIONS[key].isRequired && record.userDecision === 'undecided')) {
        return PERMISSION_DEFINITIONS[key];
      }
    }
    return null;
  },

  /**
   * Synchronize permission status with Supabase if client is active
   */
  async syncToSupabase(restaurantId?: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured() || !restaurantId) return;

    try {
      const summary = ALL_PERMISSION_KEYS.reduce((acc, key) => {
        acc[key] = this.getRecord(key).status;
        return acc;
      }, {} as Record<string, string>);

      await client.from('audit_logs').insert({
        restaurant_id: restaurantId,
        action: 'PERMISSIONS_SYNCED',
        category: 'SYSTEM',
        details: JSON.stringify(summary),
        created_at: new Date().toISOString(),
      });
    } catch {
      // Non-blocking telemetry
    }
  },
};

