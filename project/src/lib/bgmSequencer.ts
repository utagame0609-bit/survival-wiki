import { soundEngine } from './soundEngine';
import { getBgmChannelSettings } from './bgmSettings';

export type BgmChannelState = { lead: boolean; harmony: boolean; bass: boolean; drums: boolean };
type NoteEvent = { time: number; duration: number; freq: number; velocity?: number };
type DrumEvent = { time: number; type: 'kick' | 'snare' | 'hihat' | 'openhat'; velocity?: number };

const NOTES = {
  C3:130.81,D3:146.83,E3:164.81,F3:174.61,G3:196,A3:220,B3:246.94,
  C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,Gs4:415.3,A4:440,B4:493.88,
  C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,Gs5:830.61,A5:880,B5:987.77,
  C6:1046.5,D6:1174.66,E6:1318.51,F6:1396.91
};

class BgmSequencer {
  private isPlaying = false;
  private currentStep = 0;
  private readonly tempo = 96;
  private readonly totalSteps = 192;
  private readonly lookahead = 25;
  private readonly scheduleAheadTime = 0.12;
  private nextStepTime = 0;
  private timerId: number | null = null;
  private leadNotes: NoteEvent[] = [];
  private harmonyNotes: NoteEvent[] = [];
  private bassNotes: NoteEvent[] = [];
  private drumNotes: DrumEvent[] = [];
  private state: BgmChannelState = { lead:true,harmony:true,bass:true,drums:true };

  constructor() { this.composeTrack(); this.state = getBgmChannelSettings(); }

  private composeTrack() {
    this.leadNotes = [
      [0,4,NOTES.A5,.8],[4,4,NOTES.C6,.85],[8,6,NOTES.B5,.8],[14,2,NOTES.A5,.75],
      [16,8,NOTES.G5,.85],[24,4,NOTES.E5,.75],[28,4,NOTES.G5,.8],
      [32,6,NOTES.G5,.8],[38,2,NOTES.A5,.75],[40,6,NOTES.B5,.85],[46,2,NOTES.C6,.9],
      [48,10,NOTES.E6,.9],[58,3,NOTES.D6,.75],[61,3,NOTES.C6,.75],
      [64,6,NOTES.F5,.8],[70,2,NOTES.A5,.75],[72,6,NOTES.D6,.85],[78,2,NOTES.C6,.8],
      [80,8,NOTES.B5,.85],[88,4,NOTES.C6,.8],[92,4,NOTES.D6,.85],
      [96,10,NOTES.E6,.9],[106,3,NOTES.D6,.8],[109,3,NOTES.C6,.8],
      [112,12,NOTES.A5,.85],[124,2,NOTES.B5,.75],[126,2,NOTES.C6,.8],
      [128,6,NOTES.D6,.9],[134,2,NOTES.E6,.8],[136,6,NOTES.F6,.95],[142,2,NOTES.E6,.85],
      [144,8,NOTES.D6,.9],[152,4,NOTES.B5,.85],[156,4,NOTES.Gs5,.8],
      [160,6,NOTES.A5,.85],[166,2,NOTES.C6,.8],[168,6,NOTES.E6,.9],[174,2,NOTES.D6,.8],
      [176,8,NOTES.C6,.85],[184,4,NOTES.B5,.8],[188,4,NOTES.G5,.75]
    ].map(([time,duration,freq,velocity]) => ({time,duration,freq,velocity}));

    const chords = [
      [NOTES.F4,NOTES.A4,NOTES.C5,NOTES.E5],[NOTES.G4,NOTES.B4,NOTES.D5,NOTES.G5],[NOTES.E4,NOTES.G4,NOTES.B4,NOTES.E5],
      [NOTES.A4,NOTES.C5,NOTES.E5,NOTES.A5],[NOTES.D4,NOTES.F4,NOTES.A4,NOTES.C5],[NOTES.G4,NOTES.B4,NOTES.D5,NOTES.F5],
      [NOTES.C4,NOTES.E4,NOTES.G4,NOTES.B4],[NOTES.F4,NOTES.A4,NOTES.C5,NOTES.E5],[NOTES.D4,NOTES.F4,NOTES.A4,NOTES.D5],
      [NOTES.E4,NOTES.Gs4,NOTES.B4,NOTES.D5],[NOTES.A4,NOTES.C5,NOTES.E5,NOTES.A5],[NOTES.G4,NOTES.B4,NOTES.D5,NOTES.F5]
    ];
    this.harmonyNotes = [];
    chords.forEach((chord,bar) => { for(let s=0;s<16;s+=2) this.harmonyNotes.push({time:bar*16+s,duration:2,freq:chord[(s/2)%chord.length],velocity:s%4===0?.55:.45}); });

    const roots=[NOTES.F3,NOTES.G3,NOTES.E3,NOTES.A3,NOTES.D3,NOTES.G3,NOTES.C3,NOTES.F3,NOTES.D3,NOTES.E3,NOTES.A3,NOTES.G3];
    this.bassNotes=[];
    roots.forEach((root,bar)=>{const s=bar*16;this.bassNotes.push({time:s,duration:3,freq:root,velocity:.85},{time:s+4,duration:2,freq:root*2,velocity:.65},{time:s+6,duration:3,freq:root,velocity:.8},{time:s+10,duration:3,freq:root*1.5,velocity:.7},{time:s+14,duration:2,freq:root,velocity:.75});});

    this.drumNotes=[];
    for(let bar=0;bar<12;bar++){const s=bar*16;this.drumNotes.push({time:s,type:'kick',velocity:.9},{time:s+8,type:'kick',velocity:.85},{time:s+14,type:'kick',velocity:.7},{time:s+4,type:'snare',velocity:.8},{time:s+12,type:'snare',velocity:.85});for(let i=0;i<16;i+=2)this.drumNotes.push({time:s+i,type:i===10?'openhat':'hihat',velocity:i%4===0?.6:.4});}
  }

  public getTempo(){return this.tempo;}
  public getTotalDurationSec(){return (60/(this.tempo*4))*this.totalSteps;}
  public getIsPlaying(){return this.isPlaying;}
  public setChannelState(state:BgmChannelState){this.state={...state};}
  public getChannelState(){return {...this.state};}

  public play(){if(this.isPlaying)return;const ctx=soundEngine.init();this.isPlaying=true;this.nextStepTime=ctx.currentTime+.05;this.currentStep=0;this.timerId=window.setInterval(()=>this.scheduler(),this.lookahead);}
  public pause(){this.isPlaying=false;if(this.timerId!==null){clearInterval(this.timerId);this.timerId=null;}}
  public stop(){this.pause();this.currentStep=0;}

  private scheduler(){const ctx=soundEngine.getContext();while(this.nextStepTime<ctx.currentTime+this.scheduleAheadTime){this.scheduleStep(this.currentStep,this.nextStepTime);this.nextStepTime+=60/(this.tempo*4);this.currentStep=(this.currentStep+1)%this.totalSteps;}}
  private scheduleStep(step:number,time:number){this.state=getBgmChannelSettings();const d=60/(this.tempo*4);if(this.state.lead)this.leadNotes.filter(n=>n.time===step).forEach(n=>this.playLead(n,time,n.duration*d,n.velocity??.8));if(this.state.harmony)this.harmonyNotes.filter(n=>n.time===step).forEach(n=>this.playHarmony(n,time,n.duration*d,n.velocity??.5));if(this.state.bass)this.bassNotes.filter(n=>n.time===step).forEach(n=>this.playBass(n,time,n.duration*d,n.velocity??.8));if(this.state.drums)this.drumNotes.filter(n=>n.time===step).forEach(n=>this.playDrum(n.type,time,n.velocity??.7));}

  private playLead(freq:number,time:number,duration:number,velocity:number){const c=soundEngine.getContext(),o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(freq,time);f.type='lowpass';f.frequency.setValueAtTime(3600,time);g.gain.setValueAtTime(.001,time);g.gain.linearRampToValueAtTime(velocity*.22,time+.012);g.gain.setValueAtTime(velocity*.18,time+duration*.8);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(f);f.connect(g);soundEngine.routeSound(g,.35,.2);o.start(time);o.stop(time+duration+.05);}
  private playHarmony(freq:number,time:number,duration:number,velocity:number){const c=soundEngine.getContext(),o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(freq,time);f.type='lowpass';f.frequency.setValueAtTime(2800,time);g.gain.setValueAtTime(.001,time);g.gain.linearRampToValueAtTime(velocity*.12,time+.008);g.gain.exponentialRampToValueAtTime(.0001,time+duration*.95);o.connect(f);f.connect(g);soundEngine.routeSound(g,.3,.15);o.start(time);o.stop(time+duration);}
  private playBass(freq:number,time:number,duration:number,velocity:number){const c=soundEngine.getContext(),o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='triangle';o.frequency.setValueAtTime(freq,time);f.type='lowpass';f.frequency.setValueAtTime(1400,time);g.gain.setValueAtTime(.001,time);g.gain.linearRampToValueAtTime(velocity*.35,time+.005);g.gain.setValueAtTime(velocity*.28,time+duration*.7);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(f);f.connect(g);soundEngine.routeSound(g,.15,0);o.start(time);o.stop(time+duration+.02);}

  private playDrum(type:DrumEvent['type'],time:number,velocity:number){const c=soundEngine.getContext();if(type==='kick'){const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(160,time);o.frequency.exponentialRampToValueAtTime(40,time+.12);g.gain.setValueAtTime(velocity*.5,time);g.gain.exponentialRampToValueAtTime(.001,time+.14);o.connect(g);soundEngine.routeSound(g,.1,0);o.start(time);o.stop(time+.15);return;}const dur=type==='hihat'?.04:.14,b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),data=b.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*(type==='snare'?.02:.08)));const n=c.createBufferSource();n.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.setValueAtTime(type==='snare'?900:7000,time);const g=c.createGain();g.gain.setValueAtTime(velocity*(type==='snare'?.28:type==='hihat'?.14:.18),time);g.gain.exponentialRampToValueAtTime(.001,time+dur);n.connect(f);f.connect(g);soundEngine.routeSound(g,type==='snare'?.25:.15,type==='snare'?.1:0);n.start(time);n.stop(time+dur+.01);}
}

export const bgmSequencer = new BgmSequencer();
