import { bgmSequencer } from './bgmSequencer';
import { getBgmChannelSettings, subscribeToBgmChannelSettings } from './bgmSettings';
import { soundEngine } from './soundEngine';

type NpcBgmId = 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
interface ActiveNpcBgm { id: NpcBgmId; intervalId: number; stop: () => void; }

let masterBgmVolume = 1;
let fadeTimerId: number | null = null;
let settingsUnsubscribe: (() => void) | null = null;
let activeNpcBgm: ActiveNpcBgm | null = null;

function syncChannels(): void {
  bgmSequencer.channels = getBgmChannelSettings();
}

function syncVolume(): void {
  soundEngine.setMasterVolume(masterBgmVolume);
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

function ensureSettingsSubscription(): void {
  if (settingsUnsubscribe) return;
  syncChannels();
  settingsUnsubscribe = subscribeToBgmChannelSettings((settings) => {
    bgmSequencer.channels = settings;
  });
}

function playNpcTone(freq: number, time: number, duration: number, peak: number, type: OscillatorType, reverbSend = 0.25): void {
  const c = soundEngine.getContext();
  const oscillator = c.createOscillator();
  const gain = c.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak, time + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  oscillator.connect(gain);
  soundEngine.routeSound(gain, reverbSend, 0);
  oscillator.start(time);
  oscillator.stop(time + duration + 0.01);
}

function playNpcHiss(time: number, duration: number, peak: number, filterType: BiquadFilterType, frequency: number, reverbSend = 0.15): void {
  const c = soundEngine.getContext();
  const bufferSize = Math.max(1, Math.floor(c.sampleRate * duration));
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  const filter = c.createBiquadFilter();
  const gain = c.createGain();
  source.buffer = buffer;
  filter.type = filterType;
  filter.frequency.value = frequency;
  gain.gain.setValueAtTime(peak, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
  source.connect(filter);
  filter.connect(gain);
  soundEngine.routeSound(gain, reverbSend, 0);
  source.start(time);
  source.stop(time + duration);
}

function createWikipediaBgm(): ActiveNpcBgm {
  let step = 0;
  const bpm = 112;
  const stepTime = 60 / bpm / 2;
  const melodyNotes = [880, 1046.5, 1318.51, 1046.5, 830.61, 987.77, 1244.51, 987.77, 880, 1174.66, 1396.91, 1174.66, 1046.5, 987.77, 880, 830.61];
  const bassNotes = [220, 0, 220, 0, 207.65, 0, 207.65, 0, 293.66, 0, 293.66, 0, 220, 0, 164.81, 207.65];
  const interval = window.setInterval(() => {
    const c = soundEngine.getContext();
    const t = c.currentTime;
    const m = melodyNotes[step % 16];
    const b = bassNotes[step % 16];
    playNpcTone(m, t, 0.12, 0.08, 'square', 0.25);
    if (b) playNpcTone(b, t, 0.18, 0.05, 'triangle', 0.15);
    step = (step + 1) % 16;
  }, stepTime * 1000);
  return { id: 'npc_bgm_wikipedia', intervalId: interval, stop: () => window.clearInterval(interval) };
}

function createScpBgm(): ActiveNpcBgm {
  const bpm = 96;
  const stepTime = 60 / bpm / 2;
  const c = soundEngine.getContext();
  const droneOsc = c.createOscillator();
  const droneGain = c.createGain();
  const droneFilter = c.createBiquadFilter();
  droneOsc.type = 'sawtooth';
  droneOsc.frequency.value = 55;
  droneFilter.type = 'lowpass';
  droneFilter.frequency.value = 420;
  droneGain.gain.value = 0.04;
  droneOsc.connect(droneFilter);
  droneFilter.connect(droneGain);
  soundEngine.routeSound(droneGain, 0.25, 0);
  droneOsc.start();
  let step = 0;
  const pulseNotes = [110, 110, 123.47, 110, 146.83, 123.47, 110, 98];
  const interval = window.setInterval(() => {
    const ctx = soundEngine.getContext();
    const t = ctx.currentTime;
    playNpcTone(pulseNotes[step % pulseNotes.length], t, 0.16, 0.05, 'square', 0.2);
    if (step % 4 === 0) playNpcHiss(t, 0.09, 0.02, 'bandpass', 2400, 0.15);
    step += 1;
  }, stepTime * 1000);
  return {
    id: 'npc_bgm_scp', intervalId: interval,
    stop: () => {
      window.clearInterval(interval);
      const ctx = soundEngine.getContext();
      droneGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      window.setTimeout(() => { try { droneOsc.stop(); droneOsc.disconnect(); } catch {} }, 350);
    },
  };
}

function createAncientBgm(): ActiveNpcBgm {
  let step = 0;
  const bpm = 78;
  const stepTime = 60 / bpm / 2;
  const luteNotes = [329.63, 0, 392, 493.88, 587.33, 0, 523.25, 493.88, 392, 0, 329.63, 0, 293.66, 311.13, 329.63, 0];
  const interval = window.setInterval(() => {
    const c = soundEngine.getContext();
    const t = c.currentTime;
    const note = luteNotes[step % 16];
    if (note) {
      playNpcTone(note, t, 0.28, 0.1, 'triangle', 0.25);
      playNpcTone(note * 0.5, t, 0.32, 0.06, 'sine', 0.2);
    }
    if (step % 8 === 0) {
      playNpcTone(1046.5, t, 0.8, 0.05, 'sine', 0.2);
      playNpcTone(1567.98, t, 0.6, 0.03, 'triangle', 0.2);
      playNpcTone(1661.22, t, 0.5, 0.02, 'sine', 0.2);
      playNpcHiss(t, 0.6, 0.02, 'bandpass', 850, 0.15);
    }
    step = (step + 1) % 16;
  }, stepTime * 1000);
  return { id: 'npc_bgm_ancient', intervalId: interval, stop: () => window.clearInterval(interval) };
}

export function playNpcBgm(id: NpcBgmId): void {
  soundEngine.init();
  syncVolume();
  if (activeNpcBgm?.id === id) {
    stopNpcBgm();
    return;
  }
  stopNpcBgm();
  if (id === 'npc_bgm_wikipedia') activeNpcBgm = createWikipediaBgm();
  if (id === 'npc_bgm_scp') activeNpcBgm = createScpBgm();
  if (id === 'npc_bgm_ancient') activeNpcBgm = createAncientBgm();
}

export function stopNpcBgm(): void {
  if (!activeNpcBgm) return;
  activeNpcBgm.stop();
  activeNpcBgm = null;
}

export function playWorldBgm(): void {
  ensureSettingsSubscription();
  if (fadeTimerId !== null) {
    window.clearTimeout(fadeTimerId);
    fadeTimerId = null;
  }
  syncVolume();
  bgmSequencer.play();
}

export function stopWorldBgm(fadeMs = 300): void {
  if (fadeTimerId !== null) window.clearTimeout(fadeTimerId);
  const currentVolume = masterBgmVolume;
  const ctx = soundEngine.getContext();
  const steps = Math.max(1, Math.ceil(fadeMs / 30));
  const stepMs = fadeMs / steps;
  let step = 0;

  if (ctx.state === 'suspended') void ctx.resume();
  soundEngine.setMasterVolume(currentVolume);

  const fade = () => {
    step += 1;
    const ratio = Math.max(0, 1 - step / steps);
    soundEngine.setMasterVolume(currentVolume * ratio);
    if (step >= steps) {
      bgmSequencer.stop();
      soundEngine.setMasterVolume(0);
      fadeTimerId = null;
      return;
    }
    fadeTimerId = window.setTimeout(fade, stepMs);
  };

  if (fadeMs <= 0) {
    bgmSequencer.stop();
    soundEngine.setMasterVolume(0);
    fadeTimerId = null;
  } else {
    fadeTimerId = window.setTimeout(fade, stepMs);
  }
}

export function isWorldBgmPlaying(): boolean {
  return bgmSequencer.getIsPlaying();
}

export function getWorldBgmDurationSec(): number {
  return bgmSequencer.getTotalDurationSec();
}