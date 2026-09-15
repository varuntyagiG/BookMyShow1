/**
 * Theatrical Synthesized Audio FX Utility
 * Uses native Web Audio API (zero external MP3/WAV assets, 0 network latency).
 * Subtle, ultra-soft, premium clicks and chimes like Apple/Netflix.
 */

let audioCtx = null;
let soundEnabled = false;

// Initialize from localStorage safely (defaults to silent)
try {
  const saved = localStorage.getItem('bms_sound_fx');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch (_) {}

const listeners = new Set();

function notifyListeners() {
  listeners.forEach((fn) => fn(soundEnabled));
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem('bms_sound_fx', soundEnabled ? 'true' : 'false');
  } catch (_) {}
  notifyListeners();
}

export function toggleSound() {
  setSoundEnabled(!soundEnabled);
  if (soundEnabled) {
    playPop();
  }
  return soundEnabled;
}

export function subscribeSoundChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Soft cinema seat selection click (warm, deep tactile pop)
 */
export function playSeatClick() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    
    // Frequency drop for tactile click
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.045);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (_) {}
}

/**
 * Crisp, pleasant UI button / filter pop
 */
export function playPop() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch (_) {}
}

/**
 * 3D Card flip swoosh
 */
export function playFlip() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (_) {}
}

/**
 * Golden victory chime on booking confirmation (2-note luxury chord)
 */
export function playChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major chord

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const delay = idx * 0.06;
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.07, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.5);
    });
  } catch (_) {}
}

/**
 * Iconic Netflix-style "Ta-Dum" cinematic chord
 */
export function playTudum() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Hit 1: Initial deep bass punch (at t = 0)
    const punchOsc = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punchOsc.type = 'triangle';
    punchOsc.frequency.setValueAtTime(120, now);
    punchOsc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    punchGain.gain.setValueAtTime(0.22, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    punchOsc.connect(punchGain);
    punchGain.connect(ctx.destination);
    punchOsc.start(now);
    punchOsc.stop(now + 0.22);

    // Hit 2: The resonant, dramatic cinematic swell (at t = 0.12)
    const swellTime = now + 0.12;
    const baseFreqs = [73.42, 110.0, 146.83, 220.0]; // D2, A2, D3, A3 power chord
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(freq, swellTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, swellTime);
      filter.frequency.exponentialRampToValueAtTime(200, swellTime + 1.2);

      const vol = 0.08 / (idx + 1);
      gain.gain.setValueAtTime(0.001, swellTime);
      gain.gain.linearRampToValueAtTime(vol, swellTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, swellTime + 1.3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(swellTime);
      osc.stop(swellTime + 1.35);
    });
  } catch (_) {}
}

