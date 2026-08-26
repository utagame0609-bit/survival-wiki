let ctx: AudioContext | null = null;

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
  o.type = type; o.frequency.setValueAtTime(f, t); if (end) o.frequency.exponentialRampToValueAtTime(end, t + d);
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

  // V2 優先度【大】 8種
  footstep: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,140,t,.065,.13,'triangle',65); hiss(c,t,.055,.025,'lowpass',1800); },
  hover: () => { const c=getCtx(); if(!c)return; tone(c,2200,c.currentTime,.022,.055,'square'); },
  card_open: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,520,t,.095,.12,'square',1480); hiss(c,t,.08,.025,'highpass',4200); },
  card_close: () => { const c=getCtx(); if(!c)return; tone(c,980,c.currentTime,.085,.11,'triangle',320); },
  add: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; [783.99,1046.5,1318.51].forEach((f,i)=>tone(c,f,t+i*.04,.09,.12,'square')); },
  save: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1046.5,t,.24,.1,'sine'); tone(c,1568,t+.025,.21,.08,'square'); },
  toggle: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,1800,t,.04,.1,'square',850); hiss(c,t,.035,.02,'highpass',3000); },
  error: () => { const c=getCtx(); if(!c)return; const t=c.currentTime; tone(c,185,t,.22,.14,'sawtooth'); tone(c,196,t,.22,.1,'sawtooth'); },
};

export function playSoundCandidatePreview(id: string): void { PREVIEW_SOUNDS[id]?.(); }
