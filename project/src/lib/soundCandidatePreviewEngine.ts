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
  footstep: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,140,t,.065,.13,'triangle',65); hiss(c,t,.055,.025,'lowpass',1800); },
  hover: () => { const c=getCtx(); if(!c)return; tone(c,2200,c.currentTime,.022,.055,'square'); },
  card_open: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,520,t,.095,.12,'square',1480); hiss(c,t,.08,.025,'highpass',4200); },
  card_close: () => { const c=getCtx(); if(!c)return; tone(c,980,c.currentTime,.085,.11,'triangle',320); },
  add: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [783.99,1046.5,1318.51].forEach((f,i)=>tone(c,f,t+i*.04,.09,.12,'square')); },
  save: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1046.5,t,.24,.1,'sine'); tone(c,1568,t+.025,.21,.08,'square'); },
  toggle: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1800,t,.04,.1,'square',850); hiss(c,t,.035,.02,'highpass',3000); },
  error: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,185,t,.22,.14,'sawtooth'); tone(c,196,t,.22,.1,'sawtooth'); },
  danger_confirm: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,90,t,.38,.2,'sine',45); tone(c,293.66,t,.38,.08,'square',311.13); },
  record_select: () => { const c=getCtx(); if(!c)return; tone(c,680,c.currentTime,.05,.14,'triangle',340); hiss(c,c.currentTime,.05,.025,'bandpass',1800); },
  ai_generate_start: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,320,t,.32,.16,'sawtooth',2400); tone(c,320,t,.32,.05,'square',2400); },
  ai_generate_complete: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [659.25,830.61,987.77,1318.51].forEach((f,i)=>tone(c,f,t+i*.12,.75-i*.1,.12,'square')); hiss(c,t+.2,.6,.02,'highpass',3200); },
  chest_close: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1400,t,.14,.16,'square',700); tone(c,180,t,.14,.09,'triangle',120); hiss(c,t,.08,.03,'lowpass',900); },
  screen_transition: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; hiss(c,t,.36,.1,'bandpass',4500); tone(c,85,t,.36,.14,'sine',55); },
  notification: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1046.5,t,.16,.1,'sine'); tone(c,1318.5,t+.06,.1,.08,'square'); },
  input_focus: () => { const c=getCtx(); if(!c)return; tone(c,1600,c.currentTime,.028,.08,'sine',800); },
};

function createWikipediaBgmEngine(c: AudioContext): ActiveLoopTrack { let step=0; const stepTime=60/112/2; const melodyNotes=[880,1046.5,1318.51,1046.5,830.61,987.77,1244.51,987.77,880,1174.66,1396.91,1174.66,1046.5,987.77,880,830.61]; const bassNotes=[220,null,220,null,207.65,null,207.65,null,293.66,null,293.66,null,220,null,164.81,207.65]; const interval=window.setInterval(()=>{if(!ctx||ctx.state==='suspended')return;const t=ctx.currentTime;const m=melodyNotes[step%16],b=bassNotes[step%16];if(m){tone(ctx,m,t,.12,.08,'square');tone(ctx,m*.5,t,.09,.04,'triangle');}if(b)tone(ctx,b,t,.22,.1,'triangle');if(step%4===0)hiss(ctx,t,.03,.015,'highshelf',4000);step=(step+1)%16;},stepTime*1000);return{id:'npc_bgm_wikipedia',intervalId:interval,nodes:[],stop:()=>window.clearInterval(interval)}; }
function createScpBgmEngine(c: AudioContext): ActiveLoopTrack { let step=0; const stepTime=60/96/2; const notes=[440,null,440,null,466.16,null,null,null,440,null,554.37,null,523.25,493.88,466.16,null]; const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(); o.type='sawtooth';o.frequency.setValueAtTime(55,c.currentTime);f.type='lowpass';f.frequency.setValueAtTime(220,c.currentTime);g.gain.setValueAtTime(.0001,c.currentTime);g.gain.linearRampToValueAtTime(.12,c.currentTime+.5);o.connect(f);f.connect(g);g.connect(c.destination);o.start();const interval=window.setInterval(()=>{if(!ctx||ctx.state==='suspended')return;const t=ctx.currentTime,n=notes[step%16];if(n){tone(ctx,n,t,.16,.07,'sawtooth');tone(ctx,n*2,t,.06,.03,'square');}if(Math.random()>.4)hiss(ctx,t,.015,.025,'bandpass',3800+Math.random()*800);if(step%4===0)tone(ctx,110,t,.14,.12,'triangle',40);step=(step+1)%16;},stepTime*1000);return{id:'npc_bgm_scp',intervalId:interval,nodes:[o,g,f],stop:()=>{window.clearInterval(interval);if(ctx){g.gain.linearRampToValueAtTime(.0001,ctx.currentTime+.3);setTimeout(()=>{try{o.stop();o.disconnect();}catch{}},350);}}}; }
function createAncientBgmEngine(c: AudioContext): ActiveLoopTrack { let step=0; const stepTime=60/78/2; const notes=[329.63,null,392,493.88,587.33,null,523.25,493.88,392,null,329.63,null,293.66,311.13,329.63,null];const interval=window.setInterval(()=>{if(!ctx||ctx.state==='suspended')return;const t=ctx.currentTime,n=notes[step%16];if(n){tone(ctx,n,t,.28,.1,'triangle');tone(ctx,n*.5,t,.32,.06,'sine');}if(step%16===0||step%16===8){tone(ctx,1046.5,t,.8,.05,'sine');tone(ctx,1567.98,t,.6,.03,'triangle');tone(ctx,1661.22,t,.5,.02,'sine');}if(step%8===0)hiss(ctx,t,.6,.02,'bandpass',850);step=(step+1)%16;},stepTime*1000);return{id:'npc_bgm_ancient',intervalId:interval,nodes:[],stop:()=>window.clearInterval(interval)}; }

export function stopActiveAudio(): void { if (activeLoop) { const id=activeLoop.id; activeLoop.stop(); activeLoop=null; notifySoundState(id,false); } }
export function isAudioPlaying(id?: string): boolean { if(!id)return activeLoop!==null; return activeLoop?.id===id; }
export function playSoundCandidatePreview(id: string): void { const c=getCtx();if(!c)return;if(activeLoop){const same=activeLoop.id===id;stopActiveAudio();if(same)return;}if(id==='npc_bgm_wikipedia')activeLoop=createWikipediaBgmEngine(c);else if(id==='npc_bgm_scp')activeLoop=createScpBgmEngine(c);else if(id==='npc_bgm_ancient')activeLoop=createAncientBgmEngine(c);else PREVIEW_SOUNDS[id]?.();notifySoundState(id,true); }
