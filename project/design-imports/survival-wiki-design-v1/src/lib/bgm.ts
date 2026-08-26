let bgmCtx: AudioContext | null = null;
let bgmGain: GainNode | null = null;
let isBgmPlaying = false;
let bgmInterval: ReturnType<typeof setInterval> | null = null;
let bgmMasterVolume = 0.35;
let isBgmMuted = false;

function getBgmContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!bgmCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      bgmCtx = new AudioContextClass();
    }
  }
  if (bgmCtx && bgmCtx.state === 'suspended') {
    bgmCtx.resume().catch(() => {});
  }
  return bgmCtx;
}

export function setBgmVolume(vol: number) {
  bgmMasterVolume = Math.max(0, Math.min(1, vol));
  if (bgmGain && bgmCtx) {
    bgmGain.gain.setValueAtTime(isBgmMuted ? 0 : bgmMasterVolume * 0.3, bgmCtx.currentTime);
  }
}

export function getBgmVolume(): number {
  return bgmMasterVolume;
}

export function setBgmMuted(muted: boolean) {
  isBgmMuted = muted;
  if (bgmGain && bgmCtx) {
    bgmGain.gain.setValueAtTime(muted ? 0 : bgmMasterVolume * 0.3, bgmCtx.currentTime);
  }
}

export function getBgmMuted(): boolean {
  return isBgmMuted;
}

// Chords: Em9 -> Cmaj7 -> Dadd9 -> Bm7 (Nostalgic 16-bit retro RPG chord progression)
const CHORD_PROGRESSION = [
  { bass: 82.41, notes: [164.81, 246.94, 293.66, 392.00, 493.88] }, // E
  { bass: 65.41, notes: [130.81, 196.00, 246.94, 329.63, 392.00] }, // C
  { bass: 73.42, notes: [146.83, 220.00, 293.66, 369.99, 440.00] }, // D
  { bass: 61.74, notes: [123.47, 185.00, 246.94, 293.66, 369.99] }, // B
];

let chordIndex = 0;

function playChordStep(ctx: AudioContext, master: GainNode) {
  const now = ctx.currentTime;
  const chord = CHORD_PROGRESSION[chordIndex];
  chordIndex = (chordIndex + 1) % CHORD_PROGRESSION.length;

  // Bass line (warm sub triangle)
  const bassOsc = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bassOsc.type = 'triangle';
  bassOsc.frequency.setValueAtTime(chord.bass, now);
  bassGain.gain.setValueAtTime(0, now);
  bassGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
  bassGain.gain.exponentialRampToValueAtTime(0.01, now + 3.8);

  bassOsc.connect(bassGain);
  bassGain.connect(master);
  bassOsc.start(now);
  bassOsc.stop(now + 4);

  // Arpeggio notes (16bit pulse / square)
  chord.notes.forEach((freq, i) => {
    const noteOsc = ctx.createOscillator();
    const noteGain = ctx.createGain();
    const noteTime = now + (i * 0.4);

    noteOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
    noteOsc.frequency.setValueAtTime(freq, noteTime);

    noteGain.gain.setValueAtTime(0, noteTime);
    noteGain.gain.linearRampToValueAtTime(0.12, noteTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

    noteOsc.connect(noteGain);
    noteGain.connect(master);
    noteOsc.start(noteTime);
    noteOsc.stop(noteTime + 1.3);
  });
}

export function playWorldBgm() {
  if (isBgmPlaying) return;
  const ctx = getBgmContext();
  if (!ctx) return;

  isBgmPlaying = true;
  bgmGain = ctx.createGain();
  bgmGain.gain.setValueAtTime(0, ctx.currentTime);
  bgmGain.gain.linearRampToValueAtTime(isBgmMuted ? 0 : bgmMasterVolume * 0.3, ctx.currentTime + 1.5);
  bgmGain.connect(ctx.destination);

  chordIndex = 0;
  playChordStep(ctx, bgmGain);

  bgmInterval = setInterval(() => {
    if (bgmCtx && bgmGain && isBgmPlaying) {
      playChordStep(bgmCtx, bgmGain);
    }
  }, 3600);
}

export function stopWorldBgm(fadeMs = 500) {
  if (!isBgmPlaying) return;
  isBgmPlaying = false;
  if (bgmInterval) {
    clearInterval(bgmInterval);
    bgmInterval = null;
  }

  if (bgmGain && bgmCtx) {
    const fadeSec = fadeMs / 1000;
    bgmGain.gain.linearRampToValueAtTime(0.001, bgmCtx.currentTime + fadeSec);
    setTimeout(() => {
      bgmGain?.disconnect();
      bgmGain = null;
    }, fadeMs + 50);
  }
}
