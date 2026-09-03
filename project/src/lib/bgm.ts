export type NpcBgmId = 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
export type BgmTarget = { type: 'world' } | { type: 'npc'; id: NpcBgmId } | null;

type BgmTrackId = 'world' | NpcBgmId;
type BgmAudioGraph = {
  audio: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  gain: GainNode;
};

const DEFAULT_BGM_VOLUME = 0.3;
const BGM_ENABLED_KEY = 'survival-wiki-bgm-enabled';
const BGM_NATIVE_FADE_MS = 80;

const BGM_TRACK_URLS: Record<BgmTrackId, string> = {
  world: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%82%BB%E3%83%BC%E3%83%96%E7%94%BB%E9%9D%A2(2)_bgm_88bpm_1loop_seamless_wrapped.ogg',
  npc_bgm_wikipedia: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%82%A8%E3%83%AB%E3%83%8A%E3%83%B3(2)_archive_study_bgm_30s_loop.ogg',
  npc_bgm_scp: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E7%A0%94%E7%A9%B6%E5%93%A1%E3%82%A2%E3%83%BC%E3%82%AF(2)_Investigation_64BPM_30s_1Loop_SpeakerOpt.ogg',
  npc_bgm_ancient: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/wiki-bgm/%E3%83%9E%E3%83%80%E3%83%A0%E3%83%AD%E3%82%BC(2)_WastelandTavernSwing_1Loop_31s_Optimized.ogg',
};

const BGM_TRACK_OUTPUT_GAIN: Record<BgmTrackId, number> = {
  world: 1,
  npc_bgm_wikipedia: 1,
  npc_bgm_scp: 1,
  npc_bgm_ancient: 1,
};

let masterBgmVolume = DEFAULT_BGM_VOLUME;
let desiredBgmTarget: BgmTarget = null;
let bgmEnabled = true;
let audioContext: AudioContext | null = null;
const audioGraphs: Partial<Record<BgmTrackId, BgmAudioGraph>> = {};
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

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  audioContext = new AudioContextClass();
  return audioContext;
}

function getAudioGraph(trackId: BgmTrackId): BgmAudioGraph | null {
  const existing = audioGraphs[trackId];
  if (existing) return existing;

  const context = getAudioContext();
  if (!context) return null;

  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.src = BGM_TRACK_URLS[trackId];
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 1;
  audio.addEventListener('error', () => {
    const mediaError = audio.error;
    console.error(`BGM playback error (${trackId}):`, mediaError?.message ?? mediaError?.code ?? 'unknown media error');
  });

  const source = context.createMediaElementSource(audio);
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  source.connect(gain);
  gain.connect(context.destination);

  const graph = { audio, source, gain };
  audioGraphs[trackId] = graph;
  return graph;
}

function clearFadeTimer(): void {
  if (fadeTimerId === null || typeof window === 'undefined') return;
  window.clearTimeout(fadeTimerId);
  fadeTimerId = null;
}

function setGraphGain(trackId: BgmTrackId, value: number): void {
  const context = audioContext;
  const graph = audioGraphs[trackId];
  if (!context || !graph) return;
  graph.gain.gain.cancelScheduledValues(context.currentTime);
  graph.gain.gain.setValueAtTime(value, context.currentTime);
}

function syncVolume(): void {
  if (!activeTrackId) return;
  setGraphGain(activeTrackId, getOutputVolume(activeTrackId));
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

function finishStop(trackId: BgmTrackId, graph: BgmAudioGraph): void {
  graph.gain.gain.cancelScheduledValues(audioContext?.currentTime ?? 0);
  if (audioContext) graph.gain.gain.setValueAtTime(0, audioContext.currentTime);
  graph.audio.pause();
  try {
    graph.audio.currentTime = 0;
  } catch {
    // Metadata may not be loaded yet. Pausing is sufficient in that case.
  }
  if (activeTrackId === trackId) activeTrackId = null;
}

function stopCurrentPlayback(fadeMs = BGM_NATIVE_FADE_MS): void {
  playRequestToken += 1;
  clearFadeTimer();

  const trackId = activeTrackId;
  if (!trackId) return;
  const graph = audioGraphs[trackId];
  const context = audioContext;
  if (!graph || !context) {
    activeTrackId = null;
    return;
  }

  if (fadeMs <= 0 || typeof window === 'undefined' || graph.audio.paused) {
    finishStop(trackId, graph);
    return;
  }

  const token = playRequestToken;
  const now = context.currentTime;
  const gainParam = graph.gain.gain;
  const currentGain = gainParam.value;
  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(currentGain, now);
  gainParam.linearRampToValueAtTime(0, now + fadeMs / 1000);

  fadeTimerId = window.setTimeout(() => {
    if (token !== playRequestToken || activeTrackId !== trackId) return;
    finishStop(trackId, graph);
    fadeTimerId = null;
  }, fadeMs + 10);
}

function startTrack(trackId: BgmTrackId): void {
  const graph = getAudioGraph(trackId);
  const context = audioContext;
  if (!graph || !context) return;

  clearFadeTimer();

  if (activeTrackId === trackId && !graph.audio.paused) {
    setGraphGain(trackId, getOutputVolume(trackId));
    return;
  }

  playRequestToken += 1;
  const token = playRequestToken;

  if (activeTrackId && activeTrackId !== trackId) {
    const previousTrackId = activeTrackId;
    const previousGraph = audioGraphs[previousTrackId];
    if (previousGraph) finishStop(previousTrackId, previousGraph);
  }

  activeTrackId = trackId;
  graph.audio.loop = true;
  try {
    graph.audio.currentTime = 0;
  } catch {
    // Metadata may not be loaded yet.
  }
  setGraphGain(trackId, getOutputVolume(trackId));

  void (async () => {
    try {
      if (context.state === 'suspended') await context.resume();
      if (token !== playRequestToken || activeTrackId !== trackId || !bgmEnabled) return;
      const playPromise = graph.audio.play();
      if (playPromise) await playPromise;
    } catch (error) {
      if (token !== playRequestToken || activeTrackId !== trackId) return;
      console.warn(`BGM could not start (${trackId}):`, error);
      activeTrackId = null;
    }
  })();
}

function switchTrack(trackId: BgmTrackId): void {
  if (!activeTrackId || activeTrackId === trackId || typeof window === 'undefined') {
    startTrack(trackId);
    return;
  }

  const previousTrackId = activeTrackId;
  const previousGraph = audioGraphs[previousTrackId];
  const context = audioContext;
  if (!previousGraph || !context) {
    startTrack(trackId);
    return;
  }

  playRequestToken += 1;
  const token = playRequestToken;
  clearFadeTimer();

  const now = context.currentTime;
  const gainParam = previousGraph.gain.gain;
  const currentGain = gainParam.value;
  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(currentGain, now);
  gainParam.linearRampToValueAtTime(0, now + BGM_NATIVE_FADE_MS / 1000);

  fadeTimerId = window.setTimeout(() => {
    if (token !== playRequestToken || activeTrackId !== previousTrackId) return;
    finishStop(previousTrackId, previousGraph);
    fadeTimerId = null;
    startTrack(trackId);
  }, BGM_NATIVE_FADE_MS + 10);
}

function stopPlaybackPreservingTarget(fadeMs = BGM_NATIVE_FADE_MS): void {
  stopCurrentPlayback(fadeMs);
}

export function getActiveBgmTarget(): BgmTarget {
  if (!activeTrackId) return null;
  const graph = audioGraphs[activeTrackId];
  if (!graph || graph.audio.paused) return null;
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
  switchTrack(id);
}

export function stopNpcBgm(): void {
  if (desiredBgmTarget?.type === 'npc') desiredBgmTarget = null;
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback();
}

export function playWorldBgm(): void {
  desiredBgmTarget = { type: 'world' };
  if (!bgmEnabled) {
    stopPlaybackPreservingTarget();
    return;
  }
  switchTrack('world');
}

export function stopWorldBgm(fadeMs = 300): void {
  if (desiredBgmTarget?.type === 'world') desiredBgmTarget = null;
  if (activeTrackId === 'world') stopCurrentPlayback(fadeMs);
}

export function stopAllBgm(fadeMs = BGM_NATIVE_FADE_MS): void {
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
  switchTrack(targetToTrackId(target));
}

export function playNpcBgmPreview(id: NpcBgmId): void {
  switchTrack(id);
}

export function stopNpcBgmPreview(): void {
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback();
}

export function playWorldBgmPreview(): void {
  switchTrack('world');
}

export function stopWorldBgmPreview(fadeMs = BGM_NATIVE_FADE_MS): void {
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
  const graph = audioGraphs.world;
  return activeTrackId === 'world' && Boolean(graph && !graph.audio.paused);
}

export function getWorldBgmDurationSec(): number {
  const graph = audioGraphs.world;
  if (activeTrackId !== 'world' || !graph || !Number.isFinite(graph.audio.duration)) return 0;
  return graph.audio.duration;
}
