export type NpcBgmId = 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
export type BgmTarget = { type: 'world' } | { type: 'npc'; id: NpcBgmId } | null;

type BgmTrackId = 'world' | NpcBgmId;

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
let outputGain: GainNode | null = null;
const audioBuffers: Partial<Record<BgmTrackId, AudioBuffer>> = {};
const bufferRequests: Partial<Record<BgmTrackId, Promise<AudioBuffer>>> = {};
let activeSource: AudioBufferSourceNode | null = null;
let activeTrackId: BgmTrackId | null = null;
let stopTimerId: number | null = null;
let playRequestToken = 0;
let unlockListenersInstalled = false;
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

function removeUnlockListeners(): void {
  if (!unlockListenersInstalled || typeof window === 'undefined') return;
  unlockListenersInstalled = false;
  window.removeEventListener('pointerdown', unlockAudioContext);
  window.removeEventListener('touchstart', unlockAudioContext);
  window.removeEventListener('keydown', unlockAudioContext);
}

function unlockAudioContext(): void {
  const context = audioContext;
  if (!context || context.state !== 'suspended') {
    removeUnlockListeners();
    return;
  }

  void context.resume().then(() => {
    if (context.state !== 'running') return;
    removeUnlockListeners();
    const target = desiredBgmTarget;
    if (bgmEnabled && target && !activeSource) startTrack(targetToTrackId(target));
  }).catch(() => {
    // Keep listeners installed so a later user gesture can retry the resume.
  });
}

function installUnlockListeners(): void {
  if (unlockListenersInstalled || typeof window === 'undefined') return;
  unlockListenersInstalled = true;
  window.addEventListener('pointerdown', unlockAudioContext, { passive: true });
  window.addEventListener('touchstart', unlockAudioContext, { passive: true });
  window.addEventListener('keydown', unlockAudioContext);
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (audioContext) return audioContext;

  const AudioContextClass = window.AudioContext
    ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.connect(context.destination);
  audioContext = context;
  outputGain = gain;
  installUnlockListeners();
  return context;
}

function clearStopTimer(): void {
  if (stopTimerId === null || typeof window === 'undefined') return;
  window.clearTimeout(stopTimerId);
  stopTimerId = null;
}

function syncVolume(): void {
  const context = audioContext;
  const gain = outputGain;
  const trackId = activeTrackId;
  if (!context || !gain || !trackId) return;
  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(getOutputVolume(trackId), now);
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

async function loadAudioBuffer(trackId: BgmTrackId, context: AudioContext): Promise<AudioBuffer> {
  const cached = audioBuffers[trackId];
  if (cached) return cached;

  const pending = bufferRequests[trackId];
  if (pending) return pending;

  const request = fetch(BGM_TRACK_URLS[trackId], { mode: 'cors' })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.arrayBuffer();
    })
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      audioBuffers[trackId] = buffer;
      delete bufferRequests[trackId];
      return buffer;
    })
    .catch((error) => {
      delete bufferRequests[trackId];
      throw error;
    });

  bufferRequests[trackId] = request;
  return request;
}

function finishStop(source: AudioBufferSourceNode | null): void {
  if (source) {
    source.onended = null;
    try {
      source.stop();
    } catch {
      // A source that already ended needs no further stop.
    }
    try {
      source.disconnect();
    } catch {
      // A disconnected source needs no further cleanup.
    }
  }

  if (activeSource === source) activeSource = null;
  activeTrackId = null;

  const context = audioContext;
  const gain = outputGain;
  if (context && gain) {
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
  }
}

function stopCurrentPlayback(fadeMs = BGM_NATIVE_FADE_MS): void {
  playRequestToken += 1;
  const token = playRequestToken;
  clearStopTimer();

  const context = audioContext;
  const gain = outputGain;
  const source = activeSource;
  const trackId = activeTrackId;
  if (!context || !gain || !source || !trackId) {
    activeSource = null;
    activeTrackId = null;
    return;
  }

  if (fadeMs <= 0 || typeof window === 'undefined') {
    finishStop(source);
    return;
  }

  const now = context.currentTime;
  const gainParam = gain.gain;
  const currentGain = gainParam.value;
  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(currentGain, now);
  gainParam.linearRampToValueAtTime(0, now + fadeMs / 1000);

  stopTimerId = window.setTimeout(() => {
    if (token !== playRequestToken || activeSource !== source || activeTrackId !== trackId) return;
    finishStop(source);
    stopTimerId = null;
  }, fadeMs + 10);
}

function fadeOutForSwitch(token: number): Promise<void> {
  const context = audioContext;
  const gain = outputGain;
  const source = activeSource;
  const trackId = activeTrackId;
  if (!context || !gain || !source || !trackId || typeof window === 'undefined') {
    if (source) finishStop(source);
    return Promise.resolve();
  }

  clearStopTimer();
  const now = context.currentTime;
  const gainParam = gain.gain;
  const currentGain = gainParam.value;
  gainParam.cancelScheduledValues(now);
  gainParam.setValueAtTime(currentGain, now);
  gainParam.linearRampToValueAtTime(0, now + BGM_NATIVE_FADE_MS / 1000);

  return new Promise((resolve) => {
    stopTimerId = window.setTimeout(() => {
      stopTimerId = null;
      if (token !== playRequestToken) {
        resolve();
        return;
      }
      if (activeSource === source && activeTrackId === trackId) finishStop(source);
      resolve();
    }, BGM_NATIVE_FADE_MS + 10);
  });
}

function beginDecodedTrack(trackId: BgmTrackId, buffer: AudioBuffer, token: number): void {
  const context = audioContext;
  const gain = outputGain;
  if (!context || !gain || context.state !== 'running') return;
  if (token !== playRequestToken || !bgmEnabled) return;

  if (activeSource) finishStop(activeSource);

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(gain);

  activeSource = source;
  activeTrackId = trackId;

  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setValueAtTime(getOutputVolume(trackId), now);

  source.onended = () => {
    if (activeSource !== source) return;
    activeSource = null;
    activeTrackId = null;
  };

  source.start(0);
}

function startTrack(trackId: BgmTrackId): void {
  const context = getAudioContext();
  if (!context || !outputGain) return;

  if (activeTrackId === trackId && activeSource) {
    syncVolume();
    return;
  }

  playRequestToken += 1;
  const token = playRequestToken;
  const switchFade = activeSource ? fadeOutForSwitch(token) : Promise.resolve();
  const bufferLoad = loadAudioBuffer(trackId, context);

  void Promise.all([switchFade, bufferLoad]).then(([, buffer]) => {
    if (token !== playRequestToken || !bgmEnabled) return;

    const begin = () => {
      if (token !== playRequestToken || !bgmEnabled) return;
      beginDecodedTrack(trackId, buffer, token);
    };

    if (context.state === 'running') {
      begin();
      return;
    }

    installUnlockListeners();
    void context.resume().then(() => {
      if (context.state !== 'running') return;
      removeUnlockListeners();
      begin();
    }).catch(() => {
      // Android may require the next explicit user gesture; unlock listeners will retry.
    });
  }).catch((error) => {
    if (token !== playRequestToken) return;
    console.warn(`BGM could not load (${trackId}):`, error);
    activeSource = null;
    activeTrackId = null;
  });
}

function stopPlaybackPreservingTarget(fadeMs = BGM_NATIVE_FADE_MS): void {
  stopCurrentPlayback(fadeMs);
}

export function getActiveBgmTarget(): BgmTarget {
  if (!activeTrackId || !activeSource) return null;
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
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback();
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
  startTrack(targetToTrackId(target));
}

export function playNpcBgmPreview(id: NpcBgmId): void {
  startTrack(id);
}

export function stopNpcBgmPreview(): void {
  if (activeTrackId && activeTrackId !== 'world') stopCurrentPlayback();
}

export function playWorldBgmPreview(): void {
  startTrack('world');
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
  return activeTrackId === 'world' && Boolean(activeSource);
}

export function getWorldBgmDurationSec(): number {
  const buffer = audioBuffers.world;
  if (activeTrackId !== 'world' || !buffer || !Number.isFinite(buffer.duration)) return 0;
  return buffer.duration;
}
