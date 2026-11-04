// src/services/orderSoundService.ts
/**
 * FEEDO Restaurant Partner - Loud Order Assignment Sound Service
 * 
 * Provides a strong, loud, distinctive multi-tone restaurant notification sound
 * triggered immediately when a new customer order is assigned to the restaurant.
 * 
 * Features:
 * - High-audibility POS kitchen alert: penetrating twin-chirp + harmonic bell strike
 * - DynamicsCompressor for maximum loudness and clarity without distortion
 * - Continuous repeating alert until order is accepted, rejected, cancelled, or expires
 * - Safety maximum alert duration (60 seconds)
 * - Immediate stop on accept / reject / cancel / expiration
 * - Strict order deduplication persisted in sessionStorage across refreshes and React re-renders
 * - Dedicated "Test Order Sound" preview
 * - Autoplay unlocking with pending-alert queue and zero-dependency HTML5 Audio WAV fallback
 */

export interface OrderSoundSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
  repeatCount: number; // 1, 2, or 3
}

const DEFAULT_SETTINGS: OrderSoundSettings = {
  enabled: true,
  volume: 1.0, // Default to max loudness for kitchen environments
  repeatCount: 2,
};

const STORAGE_KEY_SETTINGS = 'feedo_order_sound_settings';
const STORAGE_KEY_NOTIFIED_ORDERS = 'feedo_notified_orders';

// Helper to write strings into ArrayBuffer for WAV header
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Synthesizes a loud, high-impact multi-tone WAV chime into base64 Data-URI
 * for bulletproof HTML5 audio fallback when Web Audio is blocked
 */
function generateOrderChimeWavUri(): string {
  try {
    const sampleRate = 22050;
    const duration = 2.4;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      let sample = 0;

      // Phase 1: High penetrating attention twin-chirps
      if (t >= 0.00 && t < 0.15) {
        sample += 0.55 * Math.sin(2 * Math.PI * 880 * t); // A5
      }
      if (t >= 0.15 && t < 0.30) {
        sample += 0.60 * Math.sin(2 * Math.PI * 1108.73 * (t - 0.15)); // C#6
      }
      if (t >= 0.30 && t < 0.45) {
        sample += 0.65 * Math.sin(2 * Math.PI * 1318.51 * (t - 0.30)); // E6
      }

      // Phase 2: Resonant multi-harmonic bell chime strike (A major triad)
      if (t >= 0.45) {
        const decay1 = Math.exp(-(t - 0.45) * 2.2);
        const decay2 = Math.exp(-(t - 0.45) * 2.8);
        const decay3 = Math.exp(-(t - 0.45) * 3.5);

        sample += 0.50 * Math.sin(2 * Math.PI * 880 * t) * decay1; // A5 fundamental
        sample += 0.45 * Math.sin(2 * Math.PI * 1108.73 * t) * decay2; // C#6
        sample += 0.55 * Math.sin(2 * Math.PI * 1318.51 * t) * decay1; // E6 bell peak
        sample += 0.35 * Math.sin(2 * Math.PI * 1760 * t) * decay3; // A6 chime sparkle
        sample += 0.30 * Math.sin(2 * Math.PI * 440 * t) * decay1; // A4 warm body
        sample += 0.20 * Math.sin(2 * Math.PI * 220 * t) * decay2; // A3 sub-bass
      }

      // Soft limiting
      const clamped = Math.max(-0.95, Math.min(0.95, sample));
      view.setInt16(44 + i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7FFF, true);
    }

    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return 'data:audio/wav;base64,' + (typeof btoa !== 'undefined' ? btoa(binary) : '');
  } catch {
    return '';
  }
}

class OrderSoundService {
  private ctx: AudioContext | null = null;
  private notifiedOrderIds = new Set<string>();
  private isUnlocked = false;
  private hasPendingAlert = false;
  private pendingOrderId: string | null = null;

  // Repetition & Duration Timers
  private repeatIntervalTimer: number | null = null;
  private maxDurationTimer: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeGainNodes: GainNode[] = [];

  private isAlertRinging = false;
  private currentRingingOrderId: string | null = null;

  // Maximum continuous alert duration: 60 seconds (stops automatically if unattended)
  private readonly MAX_ALERT_DURATION_MS = 60000;
  // Repetition cadence: re-rings every 3.2 seconds
  private readonly REPEAT_INTERVAL_MS = 3200;

  private settings: OrderSoundSettings = DEFAULT_SETTINGS;
  private unlockListeners: Array<(unlocked: boolean) => void> = [];
  private cachedWavUri: string | null = null;

  constructor() {
    this.loadSettings();
    this.loadPersistedNotifiedOrders();
    if (typeof window !== 'undefined') {
      this.attachUnlockListeners();
    }
  }

  private loadSettings(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
          this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
      }
    } catch {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  private loadPersistedNotifiedOrders(): void {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem(STORAGE_KEY_NOTIFIED_ORDERS);
        if (stored) {
          const list: string[] = JSON.parse(stored);
          list.forEach((id) => this.notifiedOrderIds.add(id));
        }
      }
    } catch {
      // Ignore session storage parse errors
    }
  }

  private persistNotifiedOrder(orderId: string): void {
    this.notifiedOrderIds.add(orderId);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(
          STORAGE_KEY_NOTIFIED_ORDERS,
          JSON.stringify(Array.from(this.notifiedOrderIds))
        );
      }
    } catch {
      // Ignore storage errors
    }
  }

  public saveSettings(newSettings: Partial<OrderSoundSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(this.settings));
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getSettings(): OrderSoundSettings {
    return { ...this.settings };
  }

  /**
   * Register a callback triggered when audio context is unlocked by user interaction
   */
  public addUnlockListener(cb: (unlocked: boolean) => void): () => void {
    this.unlockListeners.push(cb);
    cb(this.isAudioUnlocked());
    return () => {
      this.unlockListeners = this.unlockListeners.filter((l) => l !== cb);
    };
  }

  private notifyUnlockListeners(unlocked: boolean): void {
    this.unlockListeners.forEach((cb) => {
      try {
        cb(unlocked);
      } catch {
        // Safe listener invocation
      }
    });
  }

  /**
   * Initializes or returns active Web Audio Context
   */
  public getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'running') {
      this.isUnlocked = true;
    }

    return this.ctx;
  }

  /**
   * Explicitly unlock audio context on user gesture (e.g., button click, tap)
   */
  public async unlockAudio(): Promise<boolean> {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.isUnlocked = ctx.state === 'running';
      this.notifyUnlockListeners(this.isUnlocked);

      // If an order arrived while locked, play it immediately on first interaction
      if (this.isUnlocked && this.hasPendingAlert) {
        this.hasPendingAlert = false;
        const pendingId = this.pendingOrderId;
        this.pendingOrderId = null;
        if (pendingId) {
          this.startContinuousAlert(pendingId);
        } else {
          this.playSingleChime();
        }
      }

      return this.isUnlocked;
    } catch {
      return false;
    }
  }

  public isAudioUnlocked(): boolean {
    if (!this.ctx) return false;
    return this.ctx.state === 'running';
  }

  public isCurrentlyRinging(): boolean {
    return this.isAlertRinging;
  }

  public getRingingOrderId(): string | null {
    return this.currentRingingOrderId;
  }

  private attachUnlockListeners(): void {
    const unlockHandler = async () => {
      await this.unlockAudio();
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('click', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  /**
   * Seed known order IDs to prevent existing orders from triggering alerts on app start/reconnect
   */
  public seedKnownOrderIds(orderIds: string[]): void {
    for (const id of orderIds) {
      if (id) {
        this.persistNotifiedOrder(id);
      }
    }
  }

  /**
   * Check whether an order ID has already received its one-time incoming alert
   */
  public hasOrderBeenNotified(orderId: string): boolean {
    return this.notifiedOrderIds.has(orderId);
  }

  /**
   * Primary entry point when a new order is ASSIGNED to this restaurant.
   * Returns true if sound was triggered for a brand new assigned order.
   * Prevents duplicate alerts on React re-renders or refreshes.
   */
  public notifyNewOrderIfNew(orderId: string, isSoundEnabled?: boolean): boolean {
    if (!orderId) return false;

    // Strict idempotency: if already alerted or seeded, ignore completely
    if (this.notifiedOrderIds.has(orderId)) {
      return false;
    }

    // Mark as notified and persist in session to avoid duplicate race conditions or refresh repeats
    this.persistNotifiedOrder(orderId);

    const soundActive = isSoundEnabled !== undefined ? isSoundEnabled : this.settings.enabled;
    if (soundActive) {
      this.playOrderAssignedSound(orderId);
    }

    return true;
  }

  /**
   * Plays the loud new-order alert sound and repeats continuously until accepted/rejected/expired
   */
  public playOrderAssignedSound(orderId?: string, customVolume?: number): void {
    const soundActive = this.settings.enabled;
    if (!soundActive) return;

    if (orderId) {
      this.persistNotifiedOrder(orderId);
    }

    this.startContinuousAlert(orderId, customVolume);
  }

  /**
   * Backwards-compatible alias for playing new order alert
   */
  public playNewOrderAlert(customVolume?: number): void {
    this.playOrderAssignedSound(undefined, customVolume);
  }

  /**
   * Starts repeating the loud alert chime every 3.2s until accepted, rejected, cancelled, or 60s timeout
   */
  private startContinuousAlert(orderId?: string, customVolume?: number): void {
    this.stopAlert(); // Clear previous timers

    this.isAlertRinging = true;
    this.currentRingingOrderId = orderId || null;
    this.pendingOrderId = orderId || null;

    const effectiveVolume = customVolume !== undefined ? customVolume : this.settings.volume;

    // Play first iteration immediately
    this.playSingleChime(effectiveVolume);

    // Schedule repeating cadence
    this.repeatIntervalTimer = window.setInterval(() => {
      if (!this.isAlertRinging) {
        if (this.repeatIntervalTimer) clearInterval(this.repeatIntervalTimer);
        return;
      }
      this.playSingleChime(effectiveVolume);
    }, this.REPEAT_INTERVAL_MS);

    // Maximum alert duration safety timeout: stops after 60s if completely unattended
    this.maxDurationTimer = window.setTimeout(() => {
      this.stopAlert();
    }, this.MAX_ALERT_DURATION_MS);
  }

  /**
   * Synthesizes and plays a single, strong, loud multi-tone alert sequence
   */
  public playSingleChime(customVolume?: number): void {
    const soundActive = this.settings.enabled;
    if (!soundActive) return;

    const effectiveVolume = customVolume !== undefined ? customVolume : this.settings.volume;
    const ctx = this.getAudioContext();

    if (ctx && ctx.state === 'suspended') {
      ctx.resume().then(() => {
        this.isUnlocked = true;
        this.notifyUnlockListeners(true);
        this.executeLoudChime(ctx, effectiveVolume);
      }).catch(() => {
        // Autoplay policy prevented immediate playback: queue alert
        this.hasPendingAlert = true;
        this.playHtml5ChimeFallback(effectiveVolume);
      });
      return;
    }

    if (ctx && ctx.state === 'running') {
      this.executeLoudChime(ctx, effectiveVolume);
    } else {
      this.hasPendingAlert = true;
      this.playHtml5ChimeFallback(effectiveVolume);
    }
  }

  /**
   * Synthesizes the distinctive, loud multi-tone restaurant alert
   * Uses DynamicsCompressorNode for maximum kitchen-grade punch
   */
  private executeLoudChime(ctx: AudioContext, volume: number): void {
    try {
      const now = ctx.currentTime;

      // Master Compressor to prevent clipping while maximizing audible energy
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, now);
      compressor.knee.setValueAtTime(10, now);
      compressor.ratio.setValueAtTime(10, now);
      compressor.attack.setValueAtTime(0.003, now);
      compressor.release.setValueAtTime(0.18, now);
      compressor.connect(ctx.destination);

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.min(1.0, volume * 1.1), now);
      masterGain.connect(compressor);
      this.activeGainNodes.push(masterGain);

      // Multi-tone definition: [freq, startTimeOffset, duration, waveform, gainFactor]
      const notes: Array<[number, number, number, OscillatorType, number]> = [
        // Phase 1: High-urgency penetrating twin chirps
        [880.00,  0.00, 0.14, 'triangle', 0.85], // A5
        [1108.73, 0.14, 0.14, 'triangle', 0.90], // C#6
        [1318.51, 0.28, 0.14, 'sine',     0.95], // E6

        // Phase 2: Loud acoustic bell strike & resonant chord
        [880.00,  0.42, 1.80, 'triangle', 0.90], // A5 fundamental
        [1108.73, 0.44, 1.60, 'sine',     0.85], // C#6 harmonic
        [1318.51, 0.46, 2.00, 'sine',     1.00], // E6 bell peak
        [1760.00, 0.48, 1.20, 'sine',     0.65], // A6 chime sparkle
        [440.00,  0.42, 1.80, 'triangle', 0.50], // A4 body resonance
        [220.00,  0.42, 1.50, 'sine',     0.35], // A3 low-end punch
      ];

      notes.forEach(([freq, offset, duration, type, factor]) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = type;
          osc.frequency.setValueAtTime(freq, now + offset);

          const peakGain = 0.45 * factor;
          gain.gain.setValueAtTime(0.0001, now + offset);
          gain.gain.exponentialRampToValueAtTime(peakGain, now + offset + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + duration);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + offset);
          osc.stop(now + offset + duration);

          this.activeOscillators.push(osc);
          osc.onended = () => {
            this.activeOscillators = this.activeOscillators.filter((o) => o !== osc);
          };
        } catch {
          // Oscillator safety
        }
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * HTML5 Audio fallback using synthetic WAV Data URI
   */
  private playHtml5ChimeFallback(volume: number): void {
    try {
      if (typeof window === 'undefined') return;
      if (!this.cachedWavUri) {
        this.cachedWavUri = generateOrderChimeWavUri();
      }
      if (this.cachedWavUri) {
        const audio = new Audio(this.cachedWavUri);
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.play().catch(() => {
          this.hasPendingAlert = true;
        });
      }
    } catch {
      // Audio fallback safety
    }
  }

  /**
   * Dedicated "Test Order Sound" button trigger
   * Plays the distinctive loud alert immediately so the user can hear it
   */
  public testSound(): void {
    this.unlockAudio();
    this.playSingleChime(this.settings.volume);
  }

  /**
   * Stops the alert immediately when an order is accepted, rejected, cancelled, or expires
   */
  public stopAlert(): void {
    // Clear repeating interval
    if (this.repeatIntervalTimer !== null) {
      clearInterval(this.repeatIntervalTimer);
      this.repeatIntervalTimer = null;
    }

    // Clear maximum duration timeout
    if (this.maxDurationTimer !== null) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }

    // Rapidly ramp down gain nodes to avoid speaker click, then halt oscillators
    if (this.ctx && this.ctx.state === 'running') {
      const now = this.ctx.currentTime;
      this.activeGainNodes.forEach((g) => {
        try {
          g.gain.setValueAtTime(g.gain.value, now);
          g.gain.linearRampToValueAtTime(0.0001, now + 0.04);
        } catch {
          // Ignore
        }
      });
    }
    this.activeGainNodes = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.activeOscillators = [];

    this.isAlertRinging = false;
    this.currentRingingOrderId = null;
    this.hasPendingAlert = false;
    this.pendingOrderId = null;
  }

  /**
   * Reset notification state (for testing or logging out)
   */
  public resetNotifiedOrders(): void {
    this.notifiedOrderIds.clear();
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem(STORAGE_KEY_NOTIFIED_ORDERS);
      }
    } catch {
      // Ignore
    }
    this.stopAlert();
  }
}

export const orderSoundService = new OrderSoundService();
