import { BGM_OUTPUT_GAIN, NPC_BGM_OUTPUT_GAIN } from './audioMaster';
import { worldAudioEngine } from './bgmAs/worldBgmEngineAs';
import { soundEngine } from './soundEngine';

export type NpcBgmId = 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
export type BgmTarget = { type: 'world' } | { type: 'npc'; id: NpcBgmId } | null;
interface ActiveNpcBgm { id: NpcBgmId; intervalId: number; stop: () => void; }

const DEFAULT_BGM_VOLUME = 0.3;
const BGM_ENABLED_KEY = 'survival-wiki-bgm-enabled';
// AS原本の内部ミックスは変更せず、最終出力だけ本番BGM MASTERへ合わせる。
// 4曲を揃えた後、実機比較でこの曲別係数のみ微調整する。
const WORLD_BGM_OUTPUT_GAIN = 0.8;
let masterBgmVolume = DEFAULT_BGM_VOLUME;
let fadeTimerId: number | null = null;
let activeNpcBgm: ActiveNpcBgm | null = null;
let desiredBgmTarget: BgmTarget = null;
let bgmEnabled = true;
let worldStartToken = 0;
const bgmEnabledListeners = new Set<(enabled: boolean) => void>();

if (typeof window !== 'undefined') {
  const storedEnabled = window.localStorage.getItem(BGM_ENABLED_KEY);
  if (storedEnabled !== null) bgmEnabled = storedEnabled === 'true';
}

function getWorldOutputVolume(ratio = 1): number {
  return masterBgmVolume * WORLD_BGM_OUTPUT_GAIN * ratio;
}

function syncVolume(): void {
  // 旧NPCはこの段階では既存配管を維持。新AS NPC移植時に曲別出力へ置換する。
  soundEngine.setMasterVolume(masterBgmVolume * BGM_OUTPUT_GAIN);
  worldAudioEngine.setMasterVolume(getWorldOutputVolume());
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

function getNpcSourceGain(): number {
  return NPC_BGM_OUTPUT_GAIN / BGM_OUTPUT_GAIN;
}

function playNpcTone(freq: number, time: number, duration: number, peak: number, type: OscillatorType, reverbSend = 0.25): void {
  const c = soundEngine.getContext();
  const oscillator = c.createOscillator();
  const gain = c.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, time);
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.linearRampToValueAtTime(peak * getNpcSourceGain(), time + 0.004);
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
  gain.gain.setValueAtTime(peak * getNpcSourceGain(), time);
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
  droneGain.gain.value = 0.04 * getNpcSourceGain();
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

function stopNpcPlayback(): void {
  if (!activeNpcBgm) return;
  activeNpcBgm.stop();
  activeNpcBgm = null;
}

function stopWorldPlayback(fadeMs = 300): void {
  worldStartToken += 1;
  if (fadeTimerId !== null) {
    window.clearTimeout(fadeTimerId);
    fadeTimerId = null;
  }
  if (!worldAudioEngine.getIsPlaying()) {
    worldAudioEngine.stop();
    return;
  }

  const steps = Math.max(1, Math.ceil(fadeMs / 30));
  const stepMs = fadeMs / steps;
  let step = 0;

  const fade = () => {
    step += 1;
    const ratio = Math.max(0, 1 - step / steps);
    worldAudioEngine.setMasterVolume(getWorldOutputVolume(ratio));
    if (step >= steps) {
      worldAudioEngine.stop();
      worldAudioEngine.setMasterVolume(0);
      fadeTimerId = null;
      return;
    }
    fadeTimerId = window.setTimeout(fade, stepMs);
  };

  if (fadeMs <= 0) {
    worldAudioEngine.stop();
    worldAudioEngine.setMasterVolume(0);
    return;
  }
  fadeTimerId = window.setTimeout(fade, stepMs);
}

function startNpcPlayback(id: NpcBgmId): void {
  stopWorldPlayback(0);
  soundEngine.init();
  soundEngine.setMasterVolume(masterBgmVolume * BGM_OUTPUT_GAIN);
  if (activeNpcBgm?.id === id) return;
  stopNpcPlayback();
  if (id === 'npc_bgm_wikipedia') activeNpcBgm = createWikipediaBgm();
  if (id === 'npc_bgm_scp') activeNpcBgm = createScpBgm();
  if (id === 'npc_bgm_ancient') activeNpcBgm = createAncientBgm();
}

function startWorldPlayback(): void {
  stopNpcPlayback();
  if (fadeTimerId !== null) {
    window.clearTimeout(fadeTimerId);
    fadeTimerId = null;
  }
  const token = ++worldStartToken;
  worldAudioEngine.setMasterVolume(getWorldOutputVolume());
  void worldAudioEngine.play().then(() => {
    if (token !== worldStartToken || !bgmEnabled || desiredBgmTarget?.type !== 'world') {
      worldAudioEngine.stop();
      return;
    }
    worldAudioEngine.setMasterVolume(getWorldOutputVolume());
  });
}

function stopPlaybackPreservingTarget(): void {
  stopNpcPlayback();
  stopWorldPlayback(0);
}

export function getActiveBgmTarget(): BgmTarget {
  if (activeNpcBgm) return { type: 'npc', id: activeNpcBgm.id };
  if (worldAudioEngine.getIsPlaying()) return { type: 'world' };
  return null;
}

export function getDesiredBgmTarget(): BgmTarget {
  return desiredBgmTarget;
}

export function playNpcBgm(id: NpcBgmId): void {
  desiredBgmTarget = { type: 'npc', id };
  if (!bgmEnabled) {
    stopPlaybackPreservingTarget();
    return;
  }
  startNpcPlayback(id);
}

export function stopNpcBgm(): void {
  if (desiredBgmTarget?.type === 'npc') desiredBgmTarget = null;
  stopNpcPlayback();
}

export function playWorldBgm(): void {
  desiredBgmTarget = { type: 'world' };
  if (!bgmEnabled) {
    stopPlaybackPreservingTarget();
    return;
  }
  startWorldPlayback();
}

export function stopWorldBgm(fadeMs = 300): void {
  if (desiredBgmTarget?.type === 'world') desiredBgmTarget = null;
  stopWorldPlayback(fadeMs);
}

export function stopAllBgm(fadeMs = 0): void {
  desiredBgmTarget = null;
  stopNpcPlayback();
  stopWorldPlayback(fadeMs);
}

export function suspendBgmForPreview(): BgmTarget {
  const target = desiredBgmTarget;
  stopPlaybackPreservingTarget();
  return target;
}

export function restoreBgmTarget(target: BgmTarget): void {
  desiredBgmTarget = target;
  if (!bgmEnabled || !target) return;
  if (target.type === 'world') {
    startWorldPlayback();
    return;
  }
  startNpcPlayback(target.id);
}

export function playNpcBgmPreview(id: NpcBgmId): void {
  startNpcPlayback(id);
}

export function stopNpcBgmPreview(): void {
  stopNpcPlayback();
}

export function playWorldBgmPreview(): void {
  startWorldPlayback();
}

export function stopWorldBgmPreview(fadeMs = 0): void {
  stopWorldPlayback(fadeMs);
}

export function isBgmEnabled(): boolean {
  return bgmEnabled;
}

export function setBgmEnabled(enabled: boolean): boolean {
  bgmEnabled = enabled;
  if (typeof window !== 'undefined') window.localStorage.setItem(BGM_ENABLED_KEY, String(enabled));
  bgmEnabledListeners.forEach((listener) => listener(enabled));

  if (!enabled) {
    stopPlaybackPreservingTarget();
    return bgmEnabled;
  }

  restoreBgmTarget(desiredBgmTarget);
  return bgmEnabled;
}

export function toggleBgmEnabled(): boolean {
  return setBgmEnabled(!bgmEnabled);
}

export function subscribeBgmEnabled(listener: (enabled: boolean) => void): () => void {
  bgmEnabledListeners.add(listener);
  return () => bgmEnabledListeners.delete(listener);
}

export function isWorldBgmPlaying(): boolean {
  return worldAudioEngine.getIsPlaying();
}

export function getWorldBgmDurationSec(): number {
  const song = worldAudioEngine.getSong();
  return song.totalBars * song.stepsPerBar * (60 / worldAudioEngine.getBpm() / 4);
}
