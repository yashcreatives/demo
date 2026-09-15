/**
 * Web Audio API synthesized high-fidelity concierge chime & loud kitchen notification bell.
 * Engineered for maximum audibility, clarity, and richness in restaurant and kitchen environments.
 */
let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtxClass) {
      audioCtx = new AudioCtxClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * LOUD, ATTENTION-GRABBING KITCHEN NOTIFICATION CHIME FOR ADMIN
 * High-volume triple-strike brass bell + electronic alert with dynamics compression
 * to ensure maximum audibility across a bustling kitchen.
 */
export function playAdminLoudOrderChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Dynamics compressor for maximum loudness and punch without digital clipping
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-18, now);
    compressor.knee.setValueAtTime(10, now);
    compressor.ratio.setValueAtTime(8, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    // Master gain set to MAXIMUM punch
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.0, now);
    masterGain.connect(compressor);

    // 3 rapid, loud piercing restaurant bell strikes
    const strikes = [
      { delay: 0.0, baseFreq: 880, secondFreq: 1318.5, thirdFreq: 1760 },  // A5, E6, A6
      { delay: 0.22, baseFreq: 1046.5, secondFreq: 1568, thirdFreq: 2093 }, // C6, G6, C7
      { delay: 0.44, baseFreq: 1318.5, secondFreq: 1760, thirdFreq: 2637 }, // E6, A6, E7
      { delay: 0.70, baseFreq: 1046.5, secondFreq: 1568, thirdFreq: 2093 }, // Echo resonance
    ];

    strikes.forEach((strike) => {
      const strikeTime = now + strike.delay;

      [strike.baseFreq, strike.secondFreq, strike.thirdFreq].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // Combination of triangle and sawtooth for piercing kitchen audibility
        osc.type = idx === 0 ? 'triangle' : idx === 1 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, strikeTime);

        // Instant sharp attack, rich loud body, sustained decay
        const peakGain = idx === 0 ? 0.6 : idx === 1 ? 0.45 : 0.35;
        gainNode.gain.setValueAtTime(0.001, strikeTime);
        gainNode.gain.linearRampToValueAtTime(peakGain, strikeTime + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, strikeTime + (idx === 0 ? 1.8 : 1.4));

        osc.connect(gainNode);
        gainNode.connect(masterGain);

        osc.start(strikeTime);
        osc.stop(strikeTime + 2.0);
      });
    });

    // Haptic vibration feedback for mobile/tablet admin devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 400]);
      } catch {}
    }
  } catch (err) {
    console.warn('Admin loud chime could not play:', err);
  }
}

/**
 * Standard concierge bell for incoming orders
 */
export function playOrderReceivedChime(): void {
  playAdminLoudOrderChime();
}

/**
 * Melodic success chime for order confirmation
 */
export function playSuccessChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);
    masterGain.connect(ctx.destination);

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const startTime = now + i * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.7);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Live order status transition chime for customer
 */
export function playStatusUpdateChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18); // C6 upward cheerful sweep

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.65, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.8);
  } catch {
    // Graceful fallback
  }
}
