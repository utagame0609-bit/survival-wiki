import { getStoredReverbAmount } from './soundReverb';

let audioCtx: AudioContext | null = null;
let isSoundMuted = false;
let globalSoundVolume = 0.8;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setSoundMuted(muted: boolean) {
  isSoundMuted = muted;
}

export function getSoundMuted(): boolean {
  return isSoundMuted;
}

export function setSoundVolume(vol: number) {
  globalSoundVolume = Math.max(0, Math.min(1, vol));
}

export function getSoundVolume(): number {
  return globalSoundVolume;
}

function createNoiseBuffer(ctx: AudioContext, duration = 0.2): AudioBuffer {
  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function applyReverbAndGain(ctx: AudioContext, node: AudioNode, stopTime: number) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(globalSoundVolume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const reverbLevel = getStoredReverbAmount();
  if (reverbLevel > 0.05) {
    const delay = ctx.createDelay();
    delay.delayTime.setValueAtTime(0.08, ctx.currentTime);
    const feedback = ctx.createGain();
    feedback.gain.setValueAtTime(reverbLevel * 0.45, ctx.currentTime);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, ctx.currentTime);

    node.connect(masterGain);
    node.connect(delay);
    delay.connect(filter);
    filter.connect(feedback);
    feedback.connect(delay);
    feedback.connect(masterGain);
  } else {
    node.connect(masterGain);
  }
}

// 1. Confirm Sound (16-bit high double arpeggio chime)
export function playConfirmSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [587.33, 880, 1174.66]; // D5, A5, D6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.045);
    
    gain.gain.setValueAtTime(0, now + i * 0.045);
    gain.gain.linearRampToValueAtTime(0.18, now + i * 0.045 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.12);

    osc.connect(gain);
    applyReverbAndGain(ctx, gain, now + i * 0.045 + 0.15);

    osc.start(now + i * 0.045);
    osc.stop(now + i * 0.045 + 0.15);
  });
}

// 2. Cancel / Back Sound (descending 2-note blip)
export function playCancelSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [659.25, 440]; // E5, A4
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.05);

    gain.gain.setValueAtTime(0, now + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.16, now + i * 0.05 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.1);

    osc.connect(gain);
    applyReverbAndGain(ctx, gain, now + i * 0.05 + 0.12);

    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.12);
  });
}

// 3. Delete Sound (low crunch 16-bit noise impact)
export function playDeleteSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Low tone
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

  gain.gain.setValueAtTime(0.22, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.25);
  osc.start(now);
  osc.stop(now + 0.25);

  // Noise crunch
  const noise = ctx.createBufferSource();
  noise.buffer = createNoiseBuffer(ctx, 0.18);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, now);
  filter.frequency.linearRampToValueAtTime(200, now + 0.18);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  noise.connect(filter);
  filter.connect(noiseGain);
  applyReverbAndGain(ctx, noiseGain, now + 0.2);
  noise.start(now);
}

// 4. Error / Warning Sound
export function playErrorSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  [0, 0.08].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now + offset);
    osc.frequency.setValueAtTime(200, now + offset + 0.04);

    gain.gain.setValueAtTime(0.18, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

    osc.connect(gain);
    applyReverbAndGain(ctx, gain, now + offset + 0.08);
    osc.start(now + offset);
    osc.stop(now + offset + 0.08);
  });
}

// 5. Modal Open / Close
export function playModalOpenSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(740, now + 0.08);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.12);
  osc.start(now);
  osc.stop(now + 0.12);
}

export function playModalCloseSound() {
  playCancelSound();
}

export function playCloseSound() {
  playCancelSound();
}

// 6. Save Sound (Triumphant 4-note retro arpeggio)
export function playSaveSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now + i * 0.06);

    gain.gain.setValueAtTime(0, now + i * 0.06);
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.06 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

    osc.connect(gain);
    applyReverbAndGain(ctx, gain, now + i * 0.06 + 0.25);
    osc.start(now + i * 0.06);
    osc.stop(now + i * 0.06 + 0.25);
  });
}

// 7. Tab Switch Sound
export function playTabSwitchSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(660, now + 0.03);

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.08);
  osc.start(now);
  osc.stop(now + 0.08);
}

// 8. Toggle Sound
export function playToggleSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(700, now);
  osc.frequency.setValueAtTime(900, now + 0.02);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.06);
  osc.start(now);
  osc.stop(now + 0.06);
}

// 9. Card Open Sound
export function playCardOpenSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(500, now);
  osc.frequency.exponentialRampToValueAtTime(1000, now + 0.07);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.1);
  osc.start(now);
  osc.stop(now + 0.1);
}

// 10. Chest Open Sound (Retro mystery chest fanfare)
export function playChestOpenSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const arpeggio = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
  arpeggio.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gain.gain.setValueAtTime(0, now + idx * 0.05);
    gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.05 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + (idx === arpeggio.length - 1 ? 0.35 : 0.12));

    osc.connect(gain);
    applyReverbAndGain(ctx, gain, now + idx * 0.05 + 0.4);
    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + 0.4);
  });
}

// 11. New Record Sound
export function playNewRecordSound() {
  playSaveSound();
}

// 12. Cursor Move Sound
export function playCursorMoveSound() {
  if (isSoundMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.connect(gain);
  applyReverbAndGain(ctx, gain, now + 0.03);
  osc.start(now);
  osc.stop(now + 0.03);
}

// 13. Add Sound
export function playAddSound() {
  playConfirmSound();
}
