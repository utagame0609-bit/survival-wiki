export type InstrumentId = 'epiano' | 'synthBell' | 'guitar' | 'synthPad' | 'bass' | 'drums';
export interface NoteEvent {
  pitch: number;
  step: number;
  duration: number;
  velocity?: number;
  type?: string;
}
export interface TrackData {
  id: InstrumentId;
  name: string;
  jpName: string;
  color: string;
  volume: number;
  pan: number;
  reverbSend: number;
  muted: boolean;
  solo: boolean;
  notes: NoteEvent[];
}
export type DeviceProfile = 'balanced' | 'phone_speaker' | 'vintage_warm';
export interface SongComposition {
  title: string;
  jpTitle: string;
  defaultBpm: number;
  timeSignature: [number, number];
  totalBars: number;
  stepsPerBar: number;
  tracks: TrackData[];
}
const createDrumTrack = (): NoteEvent[] => {
  const notes: NoteEvent[] = [];
  const totalBars = 16;
  const stepsPerBar = 16;
  for (let bar = 0; bar < totalBars; bar++) {
    const barStart = bar * stepsPerBar;
    notes.push({ pitch: 36, step: barStart + 0, duration: 2, velocity: 0.75, type: 'kick' });
    if (bar % 2 === 0) {
      notes.push({ pitch: 36, step: barStart + 6, duration: 2, velocity: 0.55, type: 'kick' });
      notes.push({ pitch: 36, step: barStart + 10, duration: 2, velocity: 0.65, type: 'kick' });
    } else {
      notes.push({ pitch: 36, step: barStart + 10, duration: 2, velocity: 0.7, type: 'kick' });
    }
    notes.push({ pitch: 38, step: barStart + 4, duration: 2, velocity: 0.68, type: 'snare' });
    notes.push({ pitch: 38, step: barStart + 12, duration: 2, velocity: 0.72, type: 'snare' });
    if (bar === 7 || bar === 15) {
      notes.push({ pitch: 37, step: barStart + 14, duration: 1, velocity: 0.45, type: 'rim' });
      notes.push({ pitch: 37, step: barStart + 15, duration: 1, velocity: 0.55, type: 'rim' });
    }
    for (let step = 0; step < 16; step += 2) {
      const isQuarter = step % 4 === 0;
      notes.push({ pitch: 42, step: barStart + step, duration: 1, velocity: isQuarter ? 0.48 : 0.32, type: 'hihat' });
    }
    if (bar >= 8) {
      notes.push({ pitch: 44, step: barStart + 2, duration: 1, velocity: 0.28, type: 'shaker' });
      notes.push({ pitch: 44, step: barStart + 6, duration: 1, velocity: 0.28, type: 'shaker' });
      notes.push({ pitch: 44, step: barStart + 10, duration: 1, velocity: 0.32, type: 'shaker' });
      notes.push({ pitch: 44, step: barStart + 14, duration: 1, velocity: 0.35, type: 'shaker' });
    }
  }
  return notes;
};
const createEPianoTrack = (): NoteEvent[] => {
  const notes: NoteEvent[] = [];
  const addChord = (step: number, pitches: number[], duration: number = 8, velocity: number = 0.65) => {
    pitches.forEach((pitch, i) => notes.push({ pitch, step, duration, velocity: velocity * (0.9 + i * 0.04) }));
  };
  addChord(0, [53, 57, 60, 64], 14, 0.7); addChord(16, [52, 55, 59, 62], 14, 0.65); addChord(32, [45, 52, 55, 60], 7, 0.65); addChord(40, [50, 57, 60, 65], 7, 0.65); addChord(48, [43, 50, 53, 60], 7, 0.62); addChord(56, [48, 55, 59, 64], 8, 0.68); addChord(64, [53, 57, 60, 64], 14, 0.7); addChord(80, [44, 52, 56, 62], 14, 0.66); addChord(96, [45, 55, 60, 64], 7, 0.65); addChord(104, [43, 53, 58, 64], 7, 0.65); addChord(112, [43, 53, 57, 60], 7, 0.62); addChord(120, [43, 53, 59, 62], 8, 0.68); addChord(128, [53, 57, 60, 64], 14, 0.72); addChord(144, [52, 55, 59, 62], 7, 0.66); addChord(152, [45, 52, 57, 60], 7, 0.68); addChord(160, [50, 57, 60, 65], 7, 0.66); addChord(168, [43, 53, 59, 62], 7, 0.68); addChord(176, [48, 52, 55, 59], 7, 0.68); addChord(184, [46, 52, 55, 60], 7, 0.7); addChord(192, [53, 57, 60, 64], 7, 0.72); addChord(200, [53, 55, 59, 62], 7, 0.7); addChord(208, [52, 55, 59, 62], 7, 0.68); addChord(216, [49, 55, 57, 64], 7, 0.7); addChord(224, [50, 57, 60, 65], 5, 0.68); addChord(230, [52, 59, 62, 67], 5, 0.7); addChord(235, [53, 60, 64, 69], 4, 0.72); addChord(240, [43, 50, 55, 60], 7, 0.7); addChord(248, [43, 50, 53, 59], 7, 0.66);
  const melodyNotes: [number, number, number, number][] = [[2,69,3,0.75],[6,72,3,0.8],[10,76,4,0.85],[14,74,2,0.75],[16,71,4,0.78],[22,67,3,0.72],[26,69,3,0.74],[30,71,2,0.76],[32,72,3,0.8],[36,71,3,0.75],[40,69,3,0.75],[44,67,2,0.7],[46,65,2,0.68],[48,67,4,0.75],[54,64,3,0.7],[58,67,3,0.74],[62,72,2,0.78],[66,69,3,0.76],[70,72,3,0.8],[74,74,3,0.82],[78,76,4,0.86],[82,79,3,0.88],[86,76,3,0.8],[90,74,3,0.76],[94,71,2,0.72],[96,69,4,0.78],[102,72,3,0.8],[106,74,3,0.82],[110,76,2,0.84],[112,74,6,0.8],[120,71,4,0.74],[124,67,3,0.7],[128,72,3,0.82],[132,76,3,0.86],[136,79,4,0.9],[141,77,2,0.8],[143,76,1,0.78],[144,74,4,0.8],[150,72,3,0.78],[154,71,3,0.76],[158,72,2,0.8],[160,77,4,0.86],[166,76,3,0.82],[170,74,3,0.8],[174,72,2,0.78],[176,74,4,0.8],[182,76,4,0.84],[188,79,4,0.88],[192,81,4,0.92],[198,79,3,0.86],[202,77,3,0.82],[206,76,2,0.8],[208,79,4,0.88],[214,76,3,0.82],[218,73,3,0.78],[222,74,2,0.8],[224,76,3,0.82],[228,77,3,0.86],[232,79,3,0.9],[236,81,4,0.92],[240,79,4,0.86],[246,76,3,0.8],[250,74,3,0.76],[254,71,2,0.72]];
  melodyNotes.forEach(([step,pitch,duration,velocity]) => notes.push({step,pitch,duration,velocity}));
  return notes;
};
const createSynthBellTrack = (): NoteEvent[] => {
  const notes: NoteEvent[] = [];
  const addBellArp = (startStep:number,pitches:number[],baseVelocity:number=0.5) => pitches.forEach((pitch,idx)=>notes.push({pitch,step:startStep+idx*4,duration:6,velocity:baseVelocity*(0.85+(idx%2)*0.15)}));
  addBellArp(4,[76,81,84,88],0.52); addBellArp(20,[74,79,83,86],0.48); addBellArp(36,[72,77,81,84],0.5); addBellArp(52,[71,74,79,83],0.48); addBellArp(68,[76,81,84,88],0.54); addBellArp(84,[74,80,83,86],0.5); addBellArp(100,[72,76,81,84],0.52); addBellArp(116,[71,74,77,83],0.48); addBellArp(132,[84,81,76,81],0.55); addBellArp(148,[83,79,74,79],0.52); addBellArp(164,[81,77,72,77],0.52); addBellArp(180,[79,76,72,76],0.55); addBellArp(196,[88,84,81,84],0.56); addBellArp(212,[86,83,79,83],0.54); addBellArp(228,[84,81,77,81],0.58); addBellArp(244,[83,79,74,71],0.48);
  return notes;
};
const createGuitarTrack = (): NoteEvent[] => {
  const notes: NoteEvent[]=[];
  const addPluckPattern=(bar:number,rootPitch:number,third:number,fifth:number,octave:number)=>{const s=bar*16;notes.push({pitch:rootPitch,step:s,duration:3,velocity:0.6},{pitch:fifth,step:s+4,duration:3,velocity:0.52},{pitch:third,step:s+8,duration:3,velocity:0.55},{pitch:octave,step:s+12,duration:3,velocity:0.58},{pitch:third,step:s+14,duration:2,velocity:0.48});};
  [[53,57,60,65],[52,55,59,64],[45,52,57,60],[43,50,55,60],[53,57,60,65],[44,52,56,62],[45,52,57,60],[43,50,55,59],[53,57,60,65],[52,55,59,64],[50,53,57,62],[48,52,55,60],[53,57,60,65],[52,55,59,64],[50,53,57,62],[43,50,55,59]].forEach((v,b)=>addPluckPattern(b,v[0],v[1],v[2],v[3]));
  return notes;
};
const createSynthPadTrack=():NoteEvent[]=>{const notes:NoteEvent[]=[];const add=(bar:number,pitches:number[],velocity:number=0.42)=>pitches.forEach(pitch=>notes.push({pitch,step:bar*16,duration:16,velocity}));[[53,60,64,69],[52,59,64,67],[45,57,60,64],[48,55,59,64],[53,60,64,69],[56,59,64,68],[45,57,60,64],[43,55,59,62],[53,60,65,69],[52,59,64,67],[50,57,62,65],[48,55,60,64],[53,60,65,69],[52,55,61,64],[50,57,62,65],[43,55,59,62]].forEach((p,b)=>add(b,p));return notes;};
const createBassTrack=():NoteEvent[]=>{const notes:NoteEvent[]=[];const add=(bar:number,r1:number,r2?:number,r3?:number,r4?:number)=>{const s=bar*16;notes.push({pitch:r1,step:s,duration:5,velocity:0.78},{pitch:r1,step:s+6,duration:2,velocity:0.65},{pitch:r2??r1,step:s+8,duration:4,velocity:0.72});if(r3!==undefined)notes.push({pitch:r3,step:s+12,duration:2,velocity:0.68});if(r4!==undefined)notes.push({pitch:r4,step:s+14,duration:2,velocity:0.65});};[[41,41,48,45],[40,40,47,43],[45,38,41,43],[43,36,40,43],[41,41,48,45],[44,44,47,50],[45,43,41,38],[43,43,47,50],[41,41,45,48],[40,45,48,45],[38,43,47,43],[36,34,36,40],[41,41,45,48],[40,37,40,45],[38,40,41,43],[43,43,47,50]].forEach((v,b)=>add(b,v[0],v[1],v[2],v[3]));return notes;};
export const SURVIVAL_WIKI_BGM:SongComposition={title:'Memories of Departure (冒険の記録と旅立ち)',jpTitle:'冒険の記録と旅立ち (Memories & Departure)',defaultBpm:88,timeSignature:[4,4],totalBars:16,stepsPerBar:16,tracks:[{id:'epiano',name:'Electric Piano',jpName:'エレクトリックピアノ (主旋律 & 和音)',color:'#38bdf8',volume:0.82,pan:-0.1,reverbSend:0.35,muted:false,solo:false,notes:createEPianoTrack()},{id:'synthBell',name:'Synth Bell / Chimes',jpName:'淡いシンセベル (装飾アルペジオ)',color:'#fbbf24',volume:0.68,pan:0.25,reverbSend:0.55,muted:false,solo:false,notes:createSynthBellTrack()},{id:'guitar',name:'Acoustic Pluck',jpName:'アコースティックギター (アルペジオ)',color:'#34d399',volume:0.62,pan:-0.25,reverbSend:0.3,muted:false,solo:false,notes:createGuitarTrack()},{id:'synthPad',name:'Warm Synth Pad',jpName:'温かいシンセパッド (空間と余韻)',color:'#a78bfa',volume:0.54,pan:0,reverbSend:0.6,muted:false,solo:false,notes:createSynthPadTrack()},{id:'bass',name:'Round JRPG Bass',jpName:'軽い丸型ベース (グルーヴ)',color:'#f43f5e',volume:0.75,pan:0,reverbSend:0.1,muted:false,solo:false,notes:createBassTrack()},{id:'drums',name:'Soft Retro Drums',jpName:'簡素なドラム＆シェイカー',color:'#fb923c',volume:0.72,pan:0.05,reverbSend:0.2,muted:false,solo:false,notes:createDrumTrack()}]};
export const midiToFreq=(midi:number):number=>440*Math.pow(2,(midi-69)/12);
export const createReverbImpulse=(ctx:BaseAudioContext,duration:number=1.8,decay:number=2.2):AudioBuffer=>{const sampleRate=ctx.sampleRate,length=sampleRate*duration,impulse=ctx.createBuffer(2,length,sampleRate),left=impulse.getChannelData(0),right=impulse.getChannelData(1);for(let i=0;i<length;i++){const t=i/sampleRate,factor=Math.exp(-t*decay);left[i]=(Math.random()*2-1)*factor;right[i]=(Math.random()*2-1)*factor;}return impulse;};
let sharedNoiseBuffer:AudioBuffer|null=null;
export const getNoiseBuffer=(ctx:BaseAudioContext):AudioBuffer=>{if(sharedNoiseBuffer&&sharedNoiseBuffer.sampleRate===ctx.sampleRate)return sharedNoiseBuffer;const buffer=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;sharedNoiseBuffer=buffer;return buffer;};