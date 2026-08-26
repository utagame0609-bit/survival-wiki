import { getSoundVolume, isSoundEnabled } from './sound';

type Note = { step: number; duration: number; freq: number; velocity: number };
type Drum = { step: number; type: 'kick' | 'snare' | 'hihat' | 'openhat'; velocity: number };

const BPM = 96;
const TOTAL_STEPS = 192;
const STEP_SEC = 60 / (BPM * 4);
const TOTAL_DURATION_SEC = TOTAL_STEPS * STEP_SEC;
const MASTER_BGM_VOLUME = 0.32;

const N = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, Gs4: 415.3, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, Gs5: 830.61, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91,
};

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let playing = false;
let nextStepTime = 0;
let currentStep = 0;
let timerId: number | null = null;
let fadeTimerId: number | null = null;

const lead: Note[] = [
  [0,4,N.A5,.8],[4,4,N.C6,.85],[8,6,N.B5,.8],[14,2,N.A5,.75],
  [16,8,N.G5,.85],[24,4,N.E5,.75],[28,4,N.G5,.8],
  [32,6,N.G5,.8],[38,2,N.A5,.75],[40,6,N.B5,.85],[46,2,N.C6,.9],
  [48,10,N.E6,.9],[58,3,N.D6,.75],[61,3,N.C6,.75],
  [64,6,N.F5,.8],[70,2,N.A5,.75],[72,6,N.D6,.85],[78,2,N.C6,.8],
  [80,8,N.B5,.85],[88,4,N.C6,.8],[92,4,N.D6,.85],
  [96,10,N.E6,.9],[106,3,N.D6,.8],[109,3,N.C6,.8],
  [112,12,N.A5,.85],[124,2,N.B5,.75],[126,2,N.C6,.8],
  [128,6,N.D6,.9],[134,2,N.E6,.8],[136,6,N.F6,.95],[142,2,N.E6,.85],
  [144,8,N.D6,.9],[152,4,N.B5,.85],[156,4,N.Gs5,.8],
  [160,6,N.A5,.85],[166,2,N.C6,.8],[168,6,N.E6,.9],[174,2,N.D6,.8],
  [176,8,N.C6,.85],[184,4,N.B5,.8],[188,4,N.G5,.75],
].map(([step,duration,freq,velocity]) => ({ step,duration,freq,velocity }));

const chordPitches = [
  [N.F4,N.A4,N.C5,N.E5],[N.G4,N.B4,N.D5,N.G5],[N.E4,N.G4,N.B4,N.E5],[N.A4,N.C5,N.E5,N.A5],
  [N.D4,N.F4,N.A4,N.C5],[N.G4,N.B4,N.D5,N.F5],[N.C4,N.E4,N.G4,N.B4],[N.F4,N.A4,N.C5,N.E5],
  [N.D4,N.F4,N.A4,N.D5],[N.E4,N.Gs4,N.B4,N.D5],[N.A4,N.C5,N.E5,N.A5],[N.G4,N.B4,N.D5,N.F5],
];
const harmony: Note[] = [];
chordPitches.forEach((chord, bar) => {
  for (let s = 0; s < 16; s += 2) harmony.push({ step: bar * 16 + s, duration: 2, freq: chord[(s / 2) % chord.length], velocity: s % 4 === 0 ? 0.55 : 0.45 });
});

const bassRoots = [N.F3,N.G3,N.E3,N.A3,N.D3,N.G3,N.C3,N.F3,N.D3,N.E3,N.A3,N.G3];
const bass: Note[] = [];
bassRoots.forEach((root, bar) => {
  const start = bar * 16;
  bass.push(
    { step:start, duration:3, freq:root, velocity:.85 },
    { step:start+4, duration:2, freq:root*2, velocity:.65 },
    { step:start+6, duration:3, freq:root, velocity:.8 },
    { step:start+10, duration:3, freq:root*1.5, velocity:.7 },
    { step:start+14, duration:2, freq:root, velocity:.75 },
  );
});

const drums: Drum[] = [];
for (let bar = 0; bar < 12; bar += 1) {
  const start = bar * 16;
  drums.push({ step:start, type:'kick', velocity:.9 }, { step:start+8, type:'kick', velocity:.85 }, { step:start+14, type:'kick', velocity:.7 });
  drums.push({ step:start+4, type:'snare', velocity:.8 }, { step:start+12, type:'snare', velocity:.85 });
  for (let s = 0; s < 16; s += 2) drums.push({ step:start+s, type:s === 10 ? 'openhat' : 'hihat', velocity:s % 4 === 0 ? .6 : .4 });
}

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioContext.destination);
  }
  return audioContext;
}

function volumeMultiplier(): number {
  return (getSoundVolume() / 50) * MASTER_BGM_VOLUME;
}

function scheduleNote(note: Note, time: number, kind: 'lead' | 'harmony' | 'bass'): void {
  const ctx = getContext();
  if (!ctx || !masterGain || !isSoundEnabled()) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = kind === 'bass' ? 'triangle' : 'square';
  osc.frequency.setValueAtTime(note.freq, time);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(kind === 'lead' ? 3600 : kind === 'harmony' ? 2800 : 1400, time);
  const peak = note.velocity * volumeMultiplier() * (kind === 'lead' ? .34 : kind === 'harmony' ? .18 : .55);
  gain.gain.setValueAtTime(.0001, time);
  gain.gain.linearRampToValueAtTime(Math.max(.0001, peak), time + .01);
  gain.gain.exponentialRampToValueAtTime(.0001, time + note.duration * STEP_SEC);
  osc.connect(filter); filter.connect(gain); gain.connect(masterGain);
  osc.start(time); osc.stop(time + note.duration * STEP_SEC + .02);
}

function scheduleDrum(drum: Drum, time: number): void {
  const ctx = getContext();
  if (!ctx || !masterGain || !isSoundEnabled()) return;
  const gain = ctx.createGain();
  const peak = drum.velocity * volumeMultiplier() * .65;
  gain.gain.setValueAtTime(Math.max(.0001, peak), time);
  gain.gain.exponentialRampToValueAtTime(.0001, time + (drum.type === 'openhat' ? .14 : drum.type === 'hihat' ? .04 : .14));
  if (drum.type === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(160, time); osc.frequency.exponentialRampToValueAtTime(40, time + .12);
    osc.connect(gain); gain.connect(masterGain); osc.start(time); osc.stop(time + .15); return;
  }
  const duration = drum.type === 'openhat' ? .14 : drum.type === 'snare' ? .1 : .04;
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (drum.type === 'snare' ? .02 : .08)));
  const source = ctx.createBufferSource(); source.buffer = buffer;
  const filter = ctx.createBiquadFilter(); filter.type = drum.type === 'snare' ? 'highpass' : 'highpass'; filter.frequency.setValueAtTime(drum.type === 'snare' ? 900 : 7000, time);
  source.connect(filter); filter.connect(gain); gain.connect(masterGain); source.start(time); source.stop(time + duration + .01);
}

function scheduleStep(step: number, time: number): void {
  lead.filter(n => n.step === step).forEach(n => scheduleNote(n, time, 'lead'));
  harmony.filter(n => n.step === step).forEach(n => scheduleNote(n, time, 'harmony'));
  bass.filter(n => n.step === step).forEach(n => scheduleNote(n, time, 'bass'));
  drums.filter(d => d.step === step).forEach(d => scheduleDrum(d, time));
}

function scheduler(): void {
  const ctx = getContext();
  if (!ctx || !playing) return;
  while (nextStepTime < ctx.currentTime + .12) {
    scheduleStep(currentStep, nextStepTime);
    currentStep = (currentStep + 1) % TOTAL_STEPS;
    nextStepTime += STEP_SEC;
  }
}

export function playWorldBgm(): void {
  const ctx = getContext();
  if (!ctx || !masterGain || playing || !isSoundEnabled()) return;
  if (fadeTimerId !== null) { clearTimeout(fadeTimerId); fadeTimerId = null; }
  if (ctx.state === 'suspended') void ctx.resume();
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.setTargetAtTime(volumeMultiplier(), ctx.currentTime, .04);
  playing = true;
  currentStep = 0;
  nextStepTime = ctx.currentTime + .05;
  timerId = window.setInterval(scheduler, 25);
  scheduler();
}

export function stopWorldBgm(fadeMs = 300): void {
  const ctx = getContext();
  if (!ctx || !masterGain) return;
  playing = false;
  if (timerId !== null) { clearInterval(timerId); timerId = null; }
  masterGain.gain.cancelScheduledValues(ctx.currentTime);
  masterGain.gain.setTargetAtTime(0, ctx.currentTime, Math.max(.01, fadeMs / 1000 / 4));
  if (fadeTimerId !== null) clearTimeout(fadeTimerId);
  fadeTimerId = window.setTimeout(() => {
    if (masterGain && audioContext) masterGain.gain.setValueAtTime(0, audioContext.currentTime);
    fadeTimerId = null;
  }, fadeMs);
}

export function isWorldBgmPlaying(): boolean { return playing; }
export function getWorldBgmDurationSec(): number { return TOTAL_DURATION_SEC; }
