let soundEnabled = true;
let soundVolume = 50;

try {
  const storedEnabled = localStorage.getItem('survival-wiki:sound-enabled');
  if (storedEnabled !== null) soundEnabled = storedEnabled === 'true';
  const storedVolume = localStorage.getItem('survival-wiki:sound-volume');
  if (storedVolume !== null) soundVolume = Number(storedVolume);
} catch {
  // ignore
}

export function isSoundEnabled(): boolean {
  return soundEnabled;
}

export function toggleSound(): boolean {
  soundEnabled = !soundEnabled;
  try {
    localStorage.setItem('survival-wiki:sound-enabled', String(soundEnabled));
  } catch {
    // ignore
  }
  return soundEnabled;
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(volume: number): number {
  soundVolume = Math.max(0, Math.min(100, volume));
  try {
    localStorage.setItem('survival-wiki:sound-volume', String(soundVolume));
  } catch {
    // ignore
  }
  return soundVolume;
}

function playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.15) {
  if (!soundEnabled || soundVolume === 0) return;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const actualVol = (soundVolume / 50) * gainLevel;
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
    gain.gain.setValueAtTime(actualVol, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch {
    // AudioContext blocked or not supported
  }
}

export function playConfirmSound() {
  playTone(587.33, 'triangle', 0.08, 0, 0.18); // D5
  playTone(880, 'sine', 0.12, 0.06, 0.2); // A5
}

export function playToggleSound() {
  playTone(659.25, 'sine', 0.06, 0, 0.15); // E5
  playTone(987.77, 'sine', 0.08, 0.04, 0.18); // B5
}

export function playModalOpenSound() {
  playTone(440, 'triangle', 0.08, 0, 0.16);
  playTone(659.25, 'triangle', 0.1, 0.05, 0.18);
  playTone(880, 'sine', 0.14, 0.1, 0.2);
}

export function playModalCloseSound() {
  playTone(659.25, 'sine', 0.07, 0, 0.15);
  playTone(440, 'triangle', 0.1, 0.05, 0.15);
}

export function playCloseSound() {
  playModalCloseSound();
}

export function playAddSound() {
  playTone(523.25, 'square', 0.07, 0, 0.12);
  playTone(659.25, 'square', 0.07, 0.06, 0.14);
  playTone(783.99, 'triangle', 0.12, 0.12, 0.18);
}

export function playSaveSound() {
  playTone(523.25, 'sine', 0.08, 0, 0.15);
  playTone(659.25, 'sine', 0.08, 0.07, 0.17);
  playTone(1046.5, 'sine', 0.18, 0.14, 0.22);
}

export function playCancelSound() {
  playTone(440, 'sine', 0.06, 0, 0.12);
  playTone(329.63, 'sine', 0.09, 0.05, 0.12);
}

export function playDeleteSound() {
  playTone(300, 'sawtooth', 0.1, 0, 0.15);
  playTone(180, 'sawtooth', 0.18, 0.08, 0.2);
}

export function playErrorSound() {
  playTone(220, 'sawtooth', 0.12, 0, 0.22);
  playTone(164.81, 'sawtooth', 0.2, 0.08, 0.24);
}

export function playChestOpenSound() {
  playTone(392, 'square', 0.06, 0, 0.1);
  playTone(523.25, 'square', 0.06, 0.05, 0.12);
  playTone(659.25, 'square', 0.08, 0.1, 0.14);
  playTone(1046.5, 'sine', 0.2, 0.16, 0.22);
}

export function playCardOpenSound() {
  playTone(520, 'sine', 0.06, 0, 0.14);
  playTone(780, 'sine', 0.09, 0.04, 0.16);
}
