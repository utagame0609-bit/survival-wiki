export type NpcBgmId = 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
export type BgmTarget = { type: 'world' } | { type: 'npc'; id: NpcBgmId } | null;

type BgmTrackId = 'world' | NpcBgmId;

const DEFAULT_BGM_VOLUME = 0.3;
const BGM_ENABLED_KEY = 'survival-wiki-bgm-enabled';

const BGM_TRACK_URLS: Record<BgmTrackId, string> = {
  world: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%82%BB%E3%83%BC%E3%83%96%E7%94%BB%E9%9D%A2(2)_bgm_88bpm_1loop_seamless_wrapped.ogg',
  npc_bgm_wikipedia: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%82%A8%E3%83%AB%E3%83%8A%E3%83%B3(2)_archive_study_bgm_30s_loop.ogg',
  npc_bgm_scp: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E7%A0%94%E7%A9%B6%E5%93%A1%E3%82%A2%E3%83%BC%E3%82%AF(2)_Investigation_64BPM_30s_1Loop_SpeakerOpt.ogg',
  npc_bgm_ancient: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%83%9E%E3%83%80%E3%83%A0%E3%83%AD%E3%82%BC(2)_WastelandTavernSwing_1Loop_31s_Optimized.ogg',
};

// 完成ミックス自体は変更せず、必要なら4曲を実機比較した後に最終出力だけ微調整する。
const BGM_TRACK_OUTPUT_GAIN: Record<BgmTrackId, number> = {
  world: 1,
  npc_bgm_wikipedia: 1,
  npc_bgm_scp: 1,
  npc_bgm_ancient: 1,
};

let masterBgmVolume = DEFAULT_BGM_VOLUME;
let desiredBgmTarget: BgmTarget = null;
let bgmEnabled = true;
const audioElements: Partial<Record<BgmTrackId, HTMLAudioElement>> = {};
let activeTrackId: BgmTrackId | null = null;
let fadeTimerId: number | null = null;
let playRequestToken = 0;
const bgmEnabledListeners = new Set<(enabled: boolean) => void>();

if (typeof window !== 'undefined') {
  const storedEnabled = window.localStorage.getItem(BGM_ENABLED_KEY);
  if (storedEnabled !== null) bgmEnabled = storedEnabled === 'true';
}

function targetToTrackId(target: Exclude<BgmTarget, null>): BgmTrackId {
  return target.type === 'world' ? 'world' : target.id;
}

function trackIdToTarget(id: BgmTrackId): Exclude<BgmTarget, null> {
  return id === 'world' ? { type: 'world' } : { type: 'npc', id };
}

function getOutputVolume(id: BgmTrackId, ratio = 1): number {
  return Math.max(0, Math.min(1, masterBgmVolume * BGM_TRACK_OUTPUT_GAIN[id] * ratio));
}

function getAudioElement(trackId: BgmTrackId): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const existing = audioElements[trackId];
  if (existing) return existing;

  const audio = new Audio(BGM_TRACK_URLS[trackId]);
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0;
  audio.addEventListener('error', () => {
    const mediaError = audio.error;
    console.error(`BGM playback error (${trackId}):`, mediaError?.message ?? mediaError?.code ?? 'unknown media error');
  });
  audioElements[trackId] = audio;
  return audio;
}

function clearFadeTimer(): void {
  if (fadeTimerId === null || typeof window === 'undefined') return;
  window.clearTimeout(fadeTimerId);
  fadeTimerId = null;
}

function syncVolume(): void {
  if (!activeTrackId) return;
  const audio = audioElements[activeTrackId];
  if (!audio) return;
  audio.volume = getOutputVolume(activeTrackId);
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

function finishStop(trackId: BgmTrackId, audio: HTMLAudioElement): void {
  audio.volume = 0;
  if (activeTrackId === trackId) activeTrackId = null;
}

function stopCurrentPlayback(fadeMs = 0): void {
  playRequestToken += 1;
  clearFadeTimer();

  const trackId = activeTrackId;
  if (!trackId) return;
  const audio = audioElements[trackId];
  if (!audio) {
    activeTrackId = null;
    return;
  }

  if (fadeMs <= 0 || typeof window === 'undefined' || audio.paused) {
    finishStop(trackId, audio);
    return;
  }

  const token = playRequestToken;
  const startVolume = audio.volume;
  const steps = Math.max(1, Math.ceil(fadeMs / 30));
  const stepMs = fadeMs / steps;
  let step = 0;

  const fade = () => {
    if (token !== playRequestToken || activeTrackId !== trackId) return;
    step += 1;
    audio.volume = startVolume * Math.max(0, 1 - step / steps);
    if (step >= steps) {
      finishStop(trackId, audio);
      fadeTimerId = null;
      return;
    }
    fadeTimerId = window.setTimeout(fade, stepMs);
  };

  fadeTimerId = window.setTimeout(fade, stepMs);
}

function startTrack(trackId: BgmTrackId): void {
  const audio = getAudioElement(trackId);
  if (!audio) return;

  clearFadeTimer();

  if (activeTrackId === trackId && !audio.paused) {
    audio.volume = getOutputVolume(trackId);
    return;
  }

  playRequestToken += 1;
  const token = playRequestToken;

  if (activeTrackId && activeTrackId !== trackId) {
    const previousTrackId = activeTrackId;
    const previousAudio = audioElements[previousTrackId];
    if (previousAudio) finishStop(previousTrackId, previousAudio);
  }

  activeTrackId = trackId;
  audio.loop = true;
  audio.volume = 0;
  try {
    audio.currentTime = 0;
  } catch {
    // Metadata may not be loaded yet.
  }
  audio.volume = getOutputVolume(trackId);

  if (!audio.paused) return;

  const playPromise = audio.play();
  if (!playPromise) return;

  void playPromise.catch((error) => {
    if (token !== playRequestToken || activeTrackId !== trackId) return;
    console.warn(`BGM could not start (${trackId}):`, error);
    activeTrackId = null;
  });
}

function stopPlaybackPreservingTarget(): void {
  stopCurrentPlayback(0);
}

export function getActiveBgmTarget(): BgmTarget {
  if (!activeTrackId) return null;
  const audio = audioElements[activeTrackId];
  if (!audio || audio.paused) return null;
  return trackIdToTarget(activeTrackId);
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
  startTrack(id);
}

export function stopNpcBgm(): void {
  if (desiredBgmTarget?.type === 'npc') desiredBgmTarget = null;
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback(0);
}

export function playWorldBgm(): void {
  desiredBgmTarget = { type: 'world' };
  if (!bgmEnabled) {
    stopPlaybackPreservingTarget();
    return;
  }
  startTrack('world');
}

export function stopWorldBgm(fadeMs = 300): void {
  if (desiredBgmTarget?.type === 'world') desiredBgmTarget = null;
  if (activeTrackId === 'world') stopCurrentPlayback(fadeMs);
}

export function stopAllBgm(fadeMs = 0): void {
  desiredBgmTarget = null;
  stopCurrentPlayback(fadeMs);
}

export function suspendBgmForPreview(): BgmTarget {
  const target = desiredBgmTarget;
  stopPlaybackPreservingTarget();
  return target;
}

export function restoreBgmTarget(target: BgmTarget): void {
  desiredBgmTarget = target;
  if (!bgmEnabled || !target) return;
  startTrack(targetToTrackId(target));
}

export function playNpcBgmPreview(id: NpcBgmId): void {
  startTrack(id);
}

export function stopNpcBgmPreview(): void {
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback(0);
}

export function playWorldBgmPreview(): void {
  startTrack('world');
}

export function stopWorldBgmPreview(fadeMs = 0): void {
  if (activeTrackId === 'world') stopCurrentPlayback(fadeMs);
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
  const audio = audioElements.world;
  return activeTrackId === 'world' && Boolean(audio && !audio.paused);
}

export function getWorldBgmDurationSec(): number {
  const audio = audioElements.world;
  if (activeTrackId !== 'world' || !audio || !Number.isFinite(audio.duration)) return 0;
  return audio.duration;
}
