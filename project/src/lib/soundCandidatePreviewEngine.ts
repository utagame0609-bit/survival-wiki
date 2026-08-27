import { playNpcBgm, stopNpcBgm } from './bgm';

let ctx: AudioContext | null = null;

interface ActiveLoopTrack {
  id: string;
  intervalId: number | null;
  nodes: (AudioNode | { stop: () => void })[];
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

function tone(c: AudioContext, f: number, t: number, d: number, v: number, type: OscillatorType, end?: number): void {
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (end) o.frequency.exponentialRampToValueAtTime(Math.max(1, end), t + d);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.01);
}

function hiss(c: AudioContext, t: number, d: number, v: number, type: BiquadFilterType, f: number): void {
  const b = c.createBuffer(1, Math.floor(c.sampleRate * d), c.sampleRate); const data = b.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); const filter = c.createBiquadFilter(); const g = c.createGain();
  s.buffer = b; filter.type = type; filter.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(filter); filter.connect(g); g.connect(c.destination); s.start(t); s.stop(t + d);
}

export const PREVIEW_SOUNDS: Record<string, () => void> = {
  cursor_move: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1320,t,.045,.16,'square',1980); hiss(c,t,.045,.04,'highshelf',3000); },
  confirm: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,880,t,.08,.18,'square'); tone(c,1760,t+.045,.095,.16,'square'); },
  cancel: () => { const c=getCtx(); if(!c)return; tone(c,659,c.currentTime,.11,.13,'square',330); },
  warning: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,116,t,.28,.18,'sawtooth'); tone(c,123,t,.28,.14,'square'); tone(c,65,t,.16,.2,'triangle',50); hiss(c,t,.28,.05,'lowpass',1200); },
  tab_switch: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,950,t,.055,.15,'square',1600); hiss(c,t,.05,.07,'bandpass',3200); },
  modal_open_close: () => { const c=getCtx(); if(!c)return; tone(c,480,c.currentTime,.12,.22,'sine',110); },
  dialogue_char: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [880,920,860,900,875].forEach((f,i)=>tone(c,f,t+i*.07,.035,.09,'triangle')); },
  new_record: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [1318.51,1760,2637.02].forEach((f,i)=>tone(c,f,t+i*.03,i===2?.45:.12,.18,'square')); },
  chest_open: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,120,t,.07,.18,'triangle',80); tone(c,260,t+.04,.16,.12,'triangle',210); tone(c,523.25,t+.08,.16,.11,'triangle',1046.5); hiss(c,t,.07,.06,'lowpass',900); },
  achievement: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [523.25,659.25,783.99,987.77,1046.5,1318.51].forEach((f,i)=>tone(c,f,t+i*.09,.22,.13,'square')); },
  wiki_generating_noise: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; hiss(c,t,1.2,.06,'bandpass',1450); tone(c,60,t,1.2,.015,'sine'); },
  wiki_complete: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [523.25,587.33,659.25,783.99,880,1046.5,1174.66,1318.51].forEach((f,i)=>tone(c,f,t+i*.1,.3,.11,'triangle')); tone(c,2093,t+.82,.35,.12,'sine'); },
  footstep: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,140,t,.055,.14,'triangle',65); tone(c,80,t,.04,.1,'sine',40); hiss(c,t,.04,.035,'bandpass',1800); },
  hover: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,2200,t,.022,.07,'square',2400); },
  card_open: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,520,t,.09,.14,'square',1480); tone(c,1040,t+.02,.08,.09,'triangle',2080); hiss(c,t,.065,.045,'highpass',4200); },
  card_close: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,980,t,.085,.13,'triangle',320); tone(c,490,t+.015,.07,.09,'sine',160); hiss(c,t,.05,.03,'lowpass',1500); },
  add: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [783.99,1046.5,1318.51].forEach((f,i)=>tone(c,f,t+i*.04,.085,.15,'square')); hiss(c,t+.08,.06,.03,'highshelf',3500); },
  save: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1046.5,t,.22,.16,'sine'); tone(c,1567.98,t+.02,.24,.13,'triangle'); tone(c,2093,t+.04,.18,.08,'square'); hiss(c,t,.12,.025,'bandpass',5000); },
  toggle: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1800,t,.035,.18,'square',900); tone(c,320,t+.008,.03,.15,'triangle',120); hiss(c,t,.028,.06,'bandpass',2400); },
  error: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,185,t,.22,.18,'sawtooth'); tone(c,196,t,.22,.16,'square'); tone(c,92.5,t,.18,.22,'triangle',60); hiss(c,t,.18,.05,'lowpass',900); },
  danger_confirm: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,90,t,.35,.24,'triangle',45); tone(c,293.66,t+.03,.25,.12,'square'); tone(c,311.13,t+.03,.25,.1,'sawtooth'); tone(c,1174.66,t+.06,.15,.06,'sine'); hiss(c,t,.25,.04,'lowpass',600); },
  record_select: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,680,t,.045,.15,'triangle',340); tone(c,1200,t,.02,.08,'square',800); hiss(c,t,.03,.03,'bandpass',2800); },
  ai_generate_start: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,320,t,.32,.16,'sawtooth',2400); tone(c,640,t+.05,.27,.12,'square',3200); [1200,1600,2000,2400].forEach((f,i)=>tone(c,f,t+i*.06,.04,.06,'triangle')); hiss(c,t,.3,.045,'bandpass',3600); },
  ai_generate_complete: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [659.25,830.61,987.77,1318.51,1661.22,2637.02].forEach((f,i)=>{tone(c,f,t+i*.065,.45,.12,'square'); tone(c,f*.5,t+i*.065,.35,.08,'triangle');}); hiss(c,t+.2,.4,.03,'highpass',4800); },
  chest_close: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1400,t,.04,.16,'square',600); tone(c,180,t+.02,.11,.18,'triangle',70); hiss(c,t,.08,.06,'lowpass',1200); },
  screen_transition: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; hiss(c,t,.36,.08,'bandpass',2400); tone(c,85,t,.36,.22,'sine',35); tone(c,440,t+.05,.28,.09,'triangle',180); },
  notification: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1046.5,t,.09,.14,'sine'); tone(c,1318.51,t+.045,.14,.16,'triangle'); tone(c,2093,t+.06,.08,.05,'sine'); },
  input_focus: () => { const c=getCtx(); if(!c)return; tone(c,1600,c.currentTime,.028,.08,'sine',800); },
};

const NPC_BGM_IDS = new Set(['npc_bgm_wikipedia', 'npc_bgm_scp', 'npc_bgm_ancient']);

function isNpcBgmId(id: string): id is 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient' {
  return NPC_BGM_IDS.has(id);
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
  const c = getCtx();
  if (!c) return;
  if (activeLoop) {
    const same = activeLoop.id === id;
    stopActiveAudio();
    if (same) return;
  }

  if (isNpcBgmId(id)) {
    playNpcBgm(id);
    activeLoop = {
      id,
      intervalId: null,
      nodes: [],
      stop: stopNpcBgm,
    };
  } else {
    PREVIEW_SOUNDS[id]?.();
  }

  notifySoundState(id, true);
}
