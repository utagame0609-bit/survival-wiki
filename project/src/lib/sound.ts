import { createSwitchStyleReverb, type SoundReverb } from './soundReverb';

export type SoundType =
  | 'confirm' | 'cancel' | 'hover' | 'tabSwitch' | 'footstep' | 'cardOpen' | 'cardClose'
  | 'modalOpen' | 'modalClose' | 'add' | 'save' | 'delete' | 'toggle' | 'error'
  | 'inputFocus' | 'dangerConfirm' | 'recordSelect' | 'aiGenerateStart' | 'aiGenerateComplete'
  | 'chestClose' | 'screenTransition' | 'notification';

const SOUND_VOLUME_KEY = 'survival-wiki-se-volume';
const SOUND_ENABLED_KEY = 'survival-wiki-se-enabled';
const DEFAULT_SOUND_VOLUME = 50;
let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let soundReverb: SoundReverb | null = null;
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

function getMasterGainValue(): number { return soundVolume / DEFAULT_SOUND_VOLUME; }

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(getMasterGainValue(), audioContext.currentTime);
    soundReverb = createSwitchStyleReverb(audioContext);
    masterGain.connect(soundReverb.input);
    soundReverb.output.connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

function tone(c: AudioContext, frequency: number, time: number, duration: number, volume: number, type: OscillatorType, endFrequency?: number): void {
  if (!masterGain) return;
  const oscillator = c.createOscillator();
  const gain = c.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), time + duration);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.01);
}

function hiss(c: AudioContext, time: number, duration: number, volume: number, type: BiquadFilterType, frequency: number): void {
  if (!masterGain) return;
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  source.buffer = buffer;
  filter.type = type;
  filter.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(time);
  source.stop(time + duration);
}

function playV2Sound(sound: SoundType): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;

  switch (sound) {
    case 'confirm':
      tone(c, 880, t, 0.08, 0.18, 'square');
      tone(c, 1760, t + 0.045, 0.095, 0.16, 'square');
      return;
    case 'cancel':
      tone(c, 659, t, 0.11, 0.13, 'square', 330);
      return;
    case 'delete':
      tone(c, 116, t, 0.28, 0.18, 'sawtooth');
      tone(c, 123, t, 0.28, 0.14, 'square');
      tone(c, 65, t, 0.16, 0.2, 'triangle', 50);
      hiss(c, t, 0.28, 0.05, 'lowpass', 1200);
      return;
    case 'tabSwitch':
      tone(c, 950, t, 0.055, 0.15, 'square', 1600);
      hiss(c, t, 0.05, 0.07, 'bandpass', 3200);
      return;
    case 'modalOpen':
    case 'modalClose':
      tone(c, 480, t, 0.12, 0.22, 'sine', 110);
      return;
    case 'footstep':
      tone(c, 140, t, 0.065, 0.13, 'triangle', 65);
      hiss(c, t, 0.055, 0.025, 'lowpass', 1800);
      return;
    case 'hover':
      tone(c, 2200, t, 0.022, 0.055, 'square');
      return;
    case 'cardOpen':
      tone(c, 520, t, 0.095, 0.12, 'square', 1480);
      hiss(c, t, 0.08, 0.025, 'highpass', 4200);
      return;
    case 'cardClose':
      tone(c, 980, t, 0.085, 0.11, 'triangle', 320);
      return;
    case 'add':
      tone(c, 783.99, t, 0.09, 0.12, 'square');
      tone(c, 1046.5, t + 0.04, 0.09, 0.12, 'square');
      tone(c, 1318.51, t + 0.08, 0.09, 0.12, 'square');
      return;
    case 'save':
      tone(c, 1046.5, t, 0.24, 0.1, 'sine');
      tone(c, 1568, t + 0.025, 0.21, 0.08, 'square');
      return;
    case 'toggle':
      tone(c, 1800, t, 0.04, 0.1, 'square', 850);
      hiss(c, t, 0.035, 0.02, 'highpass', 3000);
      return;
    case 'error':
      tone(c, 185, t, 0.22, 0.14, 'sawtooth');
      tone(c, 196, t, 0.22, 0.1, 'sawtooth');
      return;
    case 'dangerConfirm':
      tone(c, 90, t, 0.38, 0.2, 'sine', 45);
      tone(c, 293.66, t, 0.38, 0.08, 'square', 311.13);
      return;
    case 'recordSelect':
      tone(c, 680, t, 0.05, 0.14, 'triangle', 340);
      hiss(c, t, 0.05, 0.025, 'bandpass', 1800);
      return;
    case 'aiGenerateStart':
      tone(c, 320, t, 0.32, 0.16, 'sawtooth', 2400);
      tone(c, 320, t, 0.32, 0.05, 'square', 2400);
      return;
    case 'aiGenerateComplete':
      [659.25, 830.61, 987.77, 1318.51].forEach((frequency, i) =>
        tone(c, frequency, t + i * 0.12, 0.75 - i * 0.1, 0.12, 'square')
      );
      hiss(c, t + 0.2, 0.6, 0.02, 'highpass', 3200);
      return;
    case 'chestClose':
      tone(c, 1400, t, 0.14, 0.16, 'square', 700);
      tone(c, 180, t, 0.14, 0.09, 'triangle', 120);
      hiss(c, t, 0.08, 0.03, 'lowpass', 900);
      return;
    case 'screenTransition':
      hiss(c, t, 0.36, 0.1, 'bandpass', 4500);
      tone(c, 85, t, 0.36, 0.14, 'sine', 55);
      return;
    case 'notification':
      tone(c, 1046.5, t, 0.16, 0.1, 'sine');
      tone(c, 1318.5, t + 0.06, 0.1, 0.08, 'square');
      return;
    case 'inputFocus':
      tone(c, 1600, t, 0.028, 0.08, 'sine', 800);
      return;
    default:
      return;
  }
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
export const playInputFocusSound = () => playSound('inputFocus');
export const playDangerConfirmSound = () => playSound('dangerConfirm');
export const playRecordSelectSound = () => playSound('recordSelect');
export const playAiGenerateStartSound = () => playSound('aiGenerateStart');
export const playAiGenerateCompleteSound = () => playSound('aiGenerateComplete');
export const playChestCloseSound = () => playSound('chestClose');
export const playScreenTransitionSound = () => playSound('screenTransition');

export const playNewRecordSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  [1318.51, 1760, 2637.02].forEach((frequency, i) =>
    tone(c, frequency, t + i * 0.03, i === 2 ? 0.45 : 0.12, 0.18, 'square')
  );
};

export const playChestOpenSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  tone(c, 120, t, 0.07, 0.18, 'triangle', 80);
  tone(c, 260, t + 0.04, 0.16, 0.12, 'triangle', 210);
  tone(c, 523.25, t + 0.08, 0.16, 0.11, 'triangle', 1046.5);
  hiss(c, t, 0.07, 0.06, 'lowpass', 900);
};

export const playCursorMoveSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  tone(c, 1320, t, 0.045, 0.16, 'square', 1980);
  hiss(c, t, 0.045, 0.04, 'highshelf', 3000);
};

export const playDialogueCharSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  [880, 920, 860, 900, 875].forEach((frequency, i) => tone(c, frequency, t + i * 0.07, 0.035, 0.09, 'triangle'));
};

export const playAchievementSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51].forEach((frequency, i) => tone(c, frequency, t + i * 0.09, 0.22, 0.13, 'square'));
};

export const playWikiGeneratingNoiseSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  hiss(c, t, 1.2, 0.06, 'bandpass', 1450);
  tone(c, 60, t, 1.2, 0.015, 'sine');
};

export const playWikiCompleteSound = () => {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51].forEach((frequency, i) => tone(c, frequency, t + i * 0.1, 0.3, 0.11, 'triangle'));
  tone(c, 2093, t + 0.82, 0.35, 0.12, 'sine');
};

export function playSound(sound: SoundType): void {
  if (!enabled) return;
  playV2Sound(sound);
}

export function toggleSound(state?: boolean): boolean {
  enabled = state === undefined ? !enabled : state;
  if (typeof window !== 'undefined') window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  return enabled;
}

export function isSoundEnabled(): boolean { return enabled; }
export function getSoundVolume(): number { return soundVolume; }
export function setSoundVolume(value: number): number {
  soundVolume = Math.min(100, Math.max(0, Math.round(value)));
  if (typeof window !== 'undefined') window.localStorage.setItem(SOUND_VOLUME_KEY, String(soundVolume));
  if (masterGain && audioContext) masterGain.gain.setTargetAtTime(getMasterGainValue(), audioContext.currentTime, 0.01);
  return soundVolume;
}
