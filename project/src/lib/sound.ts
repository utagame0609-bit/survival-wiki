export type SoundType =
  | 'confirm'
  | 'cancel'
  | 'hover'
  | 'tabSwitch'
  | 'footstep'
  | 'cardOpen'
  | 'cardClose'
  | 'modalOpen'
  | 'modalClose'
  | 'add'
  | 'save'
  | 'delete'
  | 'toggle'
  | 'error';

type SoundProfile = {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  endFrequency?: number;
  secondFrequency?: number;
  secondDelay?: number;
  noise?: boolean;
};

const SOUND_PROFILES: Record<SoundType, SoundProfile> = {
  confirm: { frequency: 880, duration: 0.06, volume: 0.22, type: 'square', secondFrequency: 1760, secondDelay: 0.045 },
  cancel: { frequency: 659.25, endFrequency: 329.63, duration: 0.14, volume: 0.12, type: 'square' },
  hover: { frequency: 1200, endFrequency: 600, duration: 0.03, volume: 0.05, type: 'triangle' },
  tabSwitch: { frequency: 320, endFrequency: 640, duration: 0.06, volume: 0.18, type: 'triangle' },
  footstep: { frequency: 155, endFrequency: 85, duration: 0.11, volume: 0.32, type: 'triangle', noise: true },
  cardOpen: { frequency: 250, endFrequency: 500, duration: 0.09, volume: 0.15, type: 'sine' },
  cardClose: { frequency: 450, endFrequency: 200, duration: 0.07, volume: 0.12, type: 'sine' },
  modalOpen: { frequency: 523.25, duration: 0.14, volume: 0.12, type: 'sine', secondFrequency: 659.25, secondDelay: 0.05 },
  modalClose: { frequency: 659.25, duration: 0.1, volume: 0.1, type: 'sine', secondFrequency: 440, secondDelay: 0.04 },
  add: { frequency: 587.33, duration: 0.18, volume: 0.15, type: 'sine', secondFrequency: 880, secondDelay: 0.07 },
  save: { frequency: 783.99, duration: 0.11, volume: 0.12, type: 'sine', secondFrequency: 1046.5, secondDelay: 0.06 },
  delete: { frequency: 440, endFrequency: 65, duration: 0.28, volume: 0.16, type: 'sawtooth', noise: true },
  toggle: { frequency: 900, endFrequency: 300, duration: 0.02, volume: 0.08, type: 'square' },
  error: { frequency: 220, endFrequency: 65, duration: 0.24, volume: 0.18, type: 'sawtooth', noise: true },
};

const SOUND_VOLUME_KEY = 'survival-wiki-se-volume';
const SOUND_ENABLED_KEY = 'survival-wiki-se-enabled';
const DEFAULT_SOUND_VOLUME = 50;

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let enabled = true;
let soundVolume = DEFAULT_SOUND_VOLUME;

function readStoredSettings(): void {
  if (typeof window === 'undefined') return;
  const storedVolume = window.localStorage.getItem(SOUND_VOLUME_KEY);
  if (storedVolume !== null) {
    const parsedVolume = Number(storedVolume);
    if (Number.isFinite(parsedVolume)) soundVolume = Math.min(100, Math.max(0, parsedVolume));
  }
  const storedEnabled = window.localStorage.getItem(SOUND_ENABLED_KEY);
  if (storedEnabled !== null) enabled = storedEnabled === 'true';
}

readStoredSettings();

function getMasterGainValue(): number {
  return soundVolume / DEFAULT_SOUND_VOLUME;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(getMasterGainValue(), audioContext.currentTime);
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
}

function playTone(profile: SoundProfile): void {
  const context = getAudioContext();
  if (!context || !masterGain) return;
  if (context.state === 'suspended') void context.resume();

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = profile.type;
  oscillator.frequency.setValueAtTime(profile.frequency, now);
  if (profile.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(profile.endFrequency, now + profile.duration);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(profile.volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(now);
  oscillator.stop(now + profile.duration + 0.01);

  if (profile.noise) {
    const bufferSize = Math.floor(context.sampleRate * profile.duration);
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

    const noiseSource = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noiseSource.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + profile.duration);
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.24, now + 0.004);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + profile.duration + 0.01);
  }

  if (profile.secondFrequency !== undefined && profile.secondDelay !== undefined) {
    const secondOscillator = context.createOscillator();
    const secondGain = context.createGain();
    const secondStart = now + profile.secondDelay;
    const secondDuration = Math.max(0.04, profile.duration - profile.secondDelay);
    secondOscillator.type = profile.type;
    secondOscillator.frequency.setValueAtTime(profile.secondFrequency, secondStart);
    secondGain.gain.setValueAtTime(0.0001, secondStart);
    secondGain.gain.exponentialRampToValueAtTime(profile.volume, secondStart + 0.008);
    secondGain.gain.exponentialRampToValueAtTime(0.0001, secondStart + secondDuration);
    secondOscillator.connect(secondGain);
    secondGain.connect(masterGain);
    secondOscillator.start(secondStart);
    secondOscillator.stop(secondStart + secondDuration + 0.01);
  }
}

export function playSound(sound: SoundType): void {
  if (!enabled) return;
  playTone(SOUND_PROFILES[sound]);
}

export function toggleSound(state?: boolean): boolean {
  enabled = state === undefined ? !enabled : state;
  if (typeof window !== 'undefined') window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  return enabled;
}

export function isSoundEnabled(): boolean {
  return enabled;
}

export function getSoundVolume(): number {
  return soundVolume;
}

export function setSoundVolume(value: number): number {
  soundVolume = Math.min(100, Math.max(0, Math.round(value)));
  if (typeof window !== 'undefined') window.localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume));
  if (masterGain && audioContext) {
    masterGain.gain.setTargetAtTime(getMasterGainValue(), audioContext.currentTime, 0.01);
  }
  return soundVolume;
}

export const playConfirmSound = () => playSound('confirm');
export const playCancelSound = () => playSound('cancel');
export const playHoverSound = () => playSound('hover');
export const playTapSound = () => playSound('hover');
export const playTabSwitchSound = () => playSound('tabSwitch');
export const playFootstepSound = () => playSound('footstep');
export const playCardOpenSound = () => playSound('cardOpen');
export const playCardCloseSound = () => playSound('cardClose');
export const playCloseSound = () => playSound('cancel');
export const playModalOpenSound = () => playSound('modalOpen');
export const playModalCloseSound = () => playSound('modalClose');
export const playAddSound = () => playSound('add');
export const playSaveSound = () => playSound('save');
export const playDeleteSound = () => playSound('delete');
export const playToggleSound = () => playSound('toggle');
export const playErrorSound = () => playSound('error');

export const playChestOpenSound = () => {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();

  const now = context.currentTime;

  const clickOsc = context.createOscillator();
  const clickGain = context.createGain();
  clickOsc.type = 'square';
  clickOsc.frequency.setValueAtTime(800, now);
  clickOsc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
  clickGain.gain.setValueAtTime(0.2, now);
  clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
  clickOsc.connect(clickGain);
  clickGain.connect(masterGain);
  clickOsc.start(now);
  clickOsc.stop(now + 0.03);

  const bufferSize = context.sampleRate * 0.4;
  const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) data[i] = Math.random() * 2 - 1;

  const noise = context.createBufferSource();
  noise.buffer = buffer;
  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, now + 0.02);
  filter.frequency.linearRampToValueAtTime(500, now + 0.35);
  filter.Q.value = 8;
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.0, now);
  noiseGain.gain.setValueAtTime(0.25, now + 0.02);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noise.start(now + 0.02);
  noise.stop(now + 0.35);
};