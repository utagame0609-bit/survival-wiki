import { playNpcBgmPreview, stopNpcBgmPreview, type NpcBgmId } from './bgm';
import { createPreviewSounds } from './soundPreviewDefinitions';

let ctx: AudioContext | null = null;

interface ActiveLoopTrack {
  id: string;
  stop: () => void;
}

let activeLoop: ActiveLoopTrack | null = null;
const soundStateListeners = new Set<(id: string | null, isPlaying: boolean) => void>();

function notifySoundState(id: string | null, isPlaying: boolean): void {
  soundStateListeners.forEach((listener) => listener(id, isPlaying));
}

export function subscribeSoundState(listener: (id: string | null, isPlaying: boolean) => void): () => void {
  soundStateListeners.add(listener);
  return () => soundStateListeners.delete(listener);
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    ctx = new AudioContextClass();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

const PREVIEW_SOUNDS = createPreviewSounds(getCtx);
const NPC_BGM_IDS = new Set<NpcBgmId>(['npc_bgm_wikipedia', 'npc_bgm_scp', 'npc_bgm_ancient']);

function isNpcBgmId(id: string): id is NpcBgmId {
  return NPC_BGM_IDS.has(id as NpcBgmId);
}

export function stopActiveAudio(): void {
  if (!activeLoop) return;
  const id = activeLoop.id;
  activeLoop.stop();
  activeLoop = null;
  notifySoundState(id, false);
}

export function isAudioPlaying(id?: string): boolean {
  if (!id) return activeLoop !== null;
  return activeLoop?.id === id;
}

export function playSoundCandidatePreview(id: string): void {
  if (activeLoop) {
    const same = activeLoop.id === id;
    stopActiveAudio();
    if (same) return;
  }

  if (isNpcBgmId(id)) {
    playNpcBgmPreview(id);
    activeLoop = { id, stop: stopNpcBgmPreview };
    notifySoundState(id, true);
    return;
  }

  const c = getCtx();
  if (!c) return;
  PREVIEW_SOUNDS[id]?.();
  notifySoundState(id, true);
}
