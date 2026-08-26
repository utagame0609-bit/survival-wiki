import { createSwitchStyleReverb, type SoundReverb } from './soundReverb';

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

// V2 master profiles for the eight existing application sound routes.
// The SoundType keys and all public playback functions remain unchanged.
const SOUND_PROFILES: Record<SoundType, SoundProfile> = {
  confirm: { frequency: 880, duration: 0.06, volume: 0.22, type: 'square', secondFrequency: 1760, secondDelay: 0.045 },
  cancel: { frequency: 659.25, endFrequency: 329.63, duration: 0.14, volume: 0.12, type: 'square' },
  hover: { frequency: 2200, duration: 0.022, volume: 0.045, type: 'square' },
  tabSwitch: { frequency: 320, endFrequency: 640, duration: 0.06, volume: 0.18, type: 'triangle' },
  footstep: { frequency: 140, endFrequency: 65, duration: 0.065, volume: 0.28, type: 'triangle', noise: true },
  cardOpen: { frequency: 520, endFrequency: 1480, duration: 0.095, volume: 0.15, type: 'square' },
  cardClose: { frequency: 980, endFrequency: 320, duration: 0.085, volume: 0.12, type: 'triangle' },
  modalOpen: { frequency: 523.25, duration: 0.14, volume: 0.12, type: 'sine', secondFrequency: 659.25, secondDelay: 0.05 },
  modalClose: { frequency: 659.25, duration: 0.1, volume: 0.1, type: 'sine', secondFrequency: 440, secondDelay: 0.04 },
  add: { frequency: 783.99, duration: 0.13, volume: 0.15, type: 'square', secondFrequency: 1046.5, secondDelay: 0.055 },
  save: { frequency: 1046.5, duration: 0.18, volume: 0.12, type: 'square', secondFrequency: 1568, secondDelay: 0.065 },
  delete: { frequency: 440, endFrequency: 65, duration: 0.28, volume: 0.16, type: 'sawtooth', noise: true },
  toggle: { frequency: 1800, endFrequency: 850, duration: 0.04, volume: 0.08, type: 'square' },
  error: { frequency: 185, endFrequency: 170, duration: 0.22, volume: 0.18, type: 'sawtooth' },
};

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
    soundReverb = createSwitchStyleReverb(audioContext);
    masterGain.connect(soundReverb.input);
    soundReverb.output.connect(audioContext.destination);
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

function playWarningSound(): void {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;

  const subOsc = context.createOscillator();
  const subGain = context.createGain();
  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(140, now);
  subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  subOsc.connect(subGain);
  subGain.connect(masterGain);
  subOsc.start(now);
  subOsc.stop(now + 0.17);

  const oscA = context.createOscillator();
  const oscB = context.createOscillator();
  const buzzFilter = context.createBiquadFilter();
  const buzzGain = context.createGain();
  oscA.type = 'sawtooth';
  oscB.type = 'square';
  oscA.frequency.setValueAtTime(116.54, now);
  oscB.frequency.setValueAtTime(123.47, now);
  buzzFilter.type = 'lowpass';
  buzzFilter.frequency.setValueAtTime(1200, now);
  buzzFilter.Q.setValueAtTime(4, now);
  buzzGain.gain.setValueAtTime(0.001, now);
  buzzGain.gain.linearRampToValueAtTime(0.28, now + 0.008);
  buzzGain.gain.setValueAtTime(0.22, now + 0.12);
  buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  oscA.connect(buzzFilter);
  oscB.connect(buzzFilter);
  buzzFilter.connect(buzzGain);
  buzzGain.connect(masterGain);
  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.3);
  oscB.stop(now + 0.3);
}

function playTabSwitchSoundDirect(): void {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;

  const osc = context.createOscillator();
  const blipGain = context.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(950, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);
  blipGain.gain.setValueAtTime(0.001, now);
  blipGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
  blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
  osc.connect(blipGain);
  blipGain.connect(masterGain);

  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.05), context.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i += 1) output[i] = Math.random() * 2 - 1;
  const noiseSource = context.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(3200, now);
  noiseFilter.Q.setValueAtTime(2, now);
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.14, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.06);
  noiseSource.start(now);
  noiseSource.stop(now + 0.05);
}

function playModalSound(): void {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;

  const osc = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.13);
}

function playNewRecord(audioCtx: AudioContext): void {
  const now = audioCtx.currentTime;
  const notes = [1318.51, 1760.0, 2637.02];

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.03;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, noteTime);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.2, noteTime);
    filter.Q.setValueAtTime(3.5, noteTime);
    gain.gain.setValueAtTime(0.001, noteTime);
    gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (idx === 2 ? 0.45 : 0.12));
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(noteTime);
    osc.stop(noteTime + (idx === 2 ? 0.48 : 0.15));
  });
}

function playCursorMoveSoundDirect(): void {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;

  const osc = context.createOscillator();
  const gain = context.createGain();
  const airFilter = context.createBiquadFilter();
  const airGain = context.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(1320, now);
  osc.frequency.exponentialRampToValueAtTime(1980, now + 0.045);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(0.16, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  osc.connect(gain);
  gain.connect(masterGain);

  const airBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.045), context.sampleRate);
  const airData = airBuffer.getChannelData(0);
  for (let i = 0; i < airBuffer.length; i += 1) airData[i] = Math.random() * 2 - 1;
  const airSource = context.createBufferSource();
  airSource.buffer = airBuffer;
  airFilter.type = 'highshelf';
  airFilter.frequency.setValueAtTime(3000, now);
  airFilter.gain.setValueAtTime(5, now);
  airGain.gain.setValueAtTime(0.045, now);
  airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
  airSource.connect(airFilter);
  airFilter.connect(airGain);
  airGain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 0.055);
  airSource.start(now);
  airSource.stop(now + 0.045);
}

function playV1Tone(c: AudioContext, destination: AudioNode, frequency: number, time: number, duration: number, volume: number, type: OscillatorType, endFrequency?: number): void {
  const oscillator = c.createOscillator();
  const gain = c.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, time);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, time + duration);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(volume, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain);
  gain.connect(destination);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.01);
}

function playV1Hiss(c: AudioContext, destination: AudioNode, time: number, duration: number, volume: number, type: BiquadFilterType, frequency: number): void {
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * duration), c.sampleRate);
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
  gain.connect(destination);
  source.start(time);
  source.stop(time + duration);
}

function playV1Confirm(): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  playV1Tone(c, masterGain, 880, t, 0.08, 0.18, 'square');
  playV1Tone(c, masterGain, 1760, t + 0.045, 0.095, 0.16, 'square');
}

function playV1Cancel(): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  playV1Tone(c, masterGain, 659, c.currentTime, 0.11, 0.13, 'square', 330);
}

function playV1TabSwitch(): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  playV1Tone(c, masterGain, 950, t, 0.055, 0.15, 'square', 1600);
  playV1Hiss(c, masterGain, t, 0.05, 0.07, 'bandpass', 3200);
}

function playV1Modal(): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  playV1Tone(c, masterGain, 480, c.currentTime, 0.12, 0.22, 'sine', 110);
}

function playV1Warning(): void {
  const c = getAudioContext();
  if (!c || !masterGain || !enabled) return;
  const t = c.currentTime;
  playV1Tone(c, masterGain, 116, t, 0.28, 0.18, 'sawtooth');
  playV1Tone(c, masterGain, 123, t, 0.28, 0.14, 'square');
  playV1Tone(c, masterGain, 65, t, 0.16, 0.2, 'triangle', 50);
  playV1Hiss(c, masterGain, t, 0.28, 0.05, 'lowpass', 1200);
}

export function playSound(sound: SoundType): void {
  if (!enabled) return;
  if (sound === 'confirm') {
    playV1Confirm();
    return;
  }
  if (sound === 'cancel') {
    playV1Cancel();
    return;
  }
  if (sound === 'tabSwitch') {
    playV1TabSwitch();
    return;
  }
  if (sound === 'modalOpen' || sound === 'modalClose') {
    playV1Modal();
    return;
  }
  if (sound === 'delete') {
    playV1Warning();
    return;
  }
  if (sound === 'error') {
    playWarningSound();
    return;
  }
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
export const playNewRecordSound = () => {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;
  const notes = [1318.51, 1760.0, 2637.02];

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.03;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, noteTime);
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.2, noteTime);
    filter.Q.setValueAtTime(3.5, noteTime);
    gain.gain.setValueAtTime(0.001, noteTime);
    gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (idx === 2 ? 0.45 : 0.12));
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start(noteTime);
    osc.stop(noteTime + (idx === 2 ? 0.48 : 0.15));
  });
};

export const playChestOpenSound = () => {
  const context = getAudioContext();
  if (!context || !masterGain || !enabled) return;
  if (context.state === 'suspended') void context.resume();
  const now = context.currentTime;

  // V1 chest sound: wooden latch knock + wooden body resonance + rising harmonic chime.
  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 0.04), context.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseBuffer.length; i += 1) {
    noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (context.sampleRate * 0.008));
  }
  const noiseNode = context.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  const noiseFilter = context.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(650, now);
  noiseFilter.Q.setValueAtTime(3.0, now);
  const noiseGain = context.createGain();
  noiseGain.gain.setValueAtTime(0.3, now);
  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseNode.start(now);

  const bodyOsc = context.createOscillator();
  const bodyGain = context.createGain();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(260, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(130, now + 0.06);
  bodyGain.gain.setValueAtTime(0.32, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  bodyOsc.connect(bodyGain);
  bodyGain.connect(masterGain);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.08);

  const chimeOsc = context.createOscillator();
  const chimeGain = context.createGain();
  chimeOsc.type = 'square';
  chimeOsc.frequency.setValueAtTime(523.25, now + 0.025);
  chimeOsc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07);
  chimeGain.gain.setValueAtTime(0.001, now + 0.025);
  chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.035);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  chimeOsc.connect(chimeGain);
  chimeGain.connect(masterGain);
  chimeOsc.start(now + 0.025);
  chimeOsc.stop(now + 0.2);
};

export const playCursorMoveSound = () => playCursorMoveSoundDirect();
