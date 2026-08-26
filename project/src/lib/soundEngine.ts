/**
 * Official audio engine foundation migrated from 音源候補v1.
 * This module is intentionally isolated from the existing SE facade until integration is verified.
 */
export type SoundEngineConfig = { masterVolume?: number; reverbWet?: number };

export class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private masterVolume = 0.8;
  private reverbWet = 0.35;

  constructor(config: SoundEngineConfig = {}) {
    if (config.masterVolume !== undefined) this.masterVolume = Math.max(0, Math.min(1, config.masterVolume));
    if (config.reverbWet !== undefined) this.reverbWet = Math.max(0, Math.min(1, config.reverbWet));
  }
  public init(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) throw new Error('Web Audio API is not supported in this browser.');
      this.ctx = new AudioContextClass(); this.setupMasterGraph();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume(); return this.ctx;
  }
  public getContext(): AudioContext { return this.init(); }
  public getAnalyser(): AnalyserNode | null { if (!this.ctx) return null; if (!this.analyser) this.setupMasterGraph(); return this.analyser; }
  private setupMasterGraph(): void {
    if (!this.ctx || this.masterGain) return;
    this.compressor = this.ctx.createDynamicsCompressor(); this.compressor.threshold.setValueAtTime(-4,this.ctx.currentTime); this.compressor.knee.setValueAtTime(10,this.ctx.currentTime); this.compressor.ratio.setValueAtTime(12,this.ctx.currentTime); this.compressor.attack.setValueAtTime(0.003,this.ctx.currentTime); this.compressor.release.setValueAtTime(0.15,this.ctx.currentTime);
    this.masterGain=this.ctx.createGain(); this.masterGain.gain.setValueAtTime(this.masterVolume,this.ctx.currentTime); this.analyser=this.ctx.createAnalyser(); this.analyser.fftSize=512; this.analyser.smoothingTimeConstant=0.8;
    this.reverbNode=this.ctx.createConvolver(); this.reverbNode.buffer=this.createImpulseResponse(1.8,2.5); this.reverbGain=this.ctx.createGain(); this.reverbGain.gain.setValueAtTime(this.reverbWet,this.ctx.currentTime); this.dryGain=this.ctx.createGain(); this.dryGain.gain.setValueAtTime(1-this.reverbWet*0.5,this.ctx.currentTime);
    this.delayNode=this.ctx.createDelay(); this.delayNode.delayTime.setValueAtTime(0.18,this.ctx.currentTime); this.delayGain=this.ctx.createGain(); this.delayGain.gain.setValueAtTime(0.2,this.ctx.currentTime); const feedback=this.ctx.createGain(); feedback.gain.setValueAtTime(0.35,this.ctx.currentTime); this.delayNode.connect(feedback); feedback.connect(this.delayNode);
    this.reverbNode.connect(this.reverbGain); this.reverbGain.connect(this.compressor); this.delayNode.connect(this.delayGain); this.delayGain.connect(this.compressor); this.dryGain.connect(this.compressor); this.compressor.connect(this.masterGain); this.masterGain.connect(this.analyser); this.analyser.connect(this.ctx.destination);
  }
  private createImpulseResponse(duration:number,decay:number):AudioBuffer { const ctx=this.ctx??this.init(); const length=Math.floor(ctx.sampleRate*duration); const impulse=ctx.createBuffer(2,length,ctx.sampleRate); const left=impulse.getChannelData(0),right=impulse.getChannelData(1); for(let i=0;i<length;i+=1){const f=Math.pow(1-i/length,decay);left[i]=(Math.random()*2-1)*f;right[i]=(Math.random()*2-1)*f;} return impulse; }
  public routeSound(sourceNode:AudioNode,reverbSend=0.25,delaySend=0):void { this.init(); if(!this.dryGain||!this.reverbNode||!this.delayNode||!this.ctx)return; sourceNode.connect(this.dryGain); if(reverbSend>0){const send=this.ctx.createGain();send.gain.setValueAtTime(reverbSend,this.ctx.currentTime);sourceNode.connect(send);send.connect(this.reverbNode);} if(delaySend>0){const send=this.ctx.createGain();send.gain.setValueAtTime(delaySend,this.ctx.currentTime);sourceNode.connect(send);send.connect(this.delayNode);} }
  public playCursorMove():void { const c=this.init(),n=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='square';o.frequency.setValueAtTime(1320,n);o.frequency.exponentialRampToValueAtTime(1980,n+0.02);f.type='lowpass';f.frequency.setValueAtTime(4500,n);g.gain.setValueAtTime(0.0001,n);g.gain.linearRampToValueAtTime(0.18,n+0.005);g.gain.exponentialRampToValueAtTime(0.0001,n+0.045);o.connect(f);f.connect(g);this.routeSound(g,0.15,0);o.start(n);o.stop(n+0.05); }
  public playConfirm():void { const c=this.init(),n=c.currentTime, tone=(freq:number,start:number,peak:number,end:number,r:number,d:number)=>{const o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.setValueAtTime(freq,start);g.gain.setValueAtTime(0.001,start);g.gain.linearRampToValueAtTime(peak,start+0.004);g.gain.exponentialRampToValueAtTime(0.001,end);o.connect(g);this.routeSound(g,r,d);o.start(start);o.stop(end+0.01);}; tone(880,n,0.22,n+0.055,0.25,0.1);tone(1760,n+0.045,0.25,n+0.14,0.35,0.15); }
  public playCancel():void { const c=this.init(),n=c.currentTime,tone=(type:OscillatorType,freq:number,start:number,end:number,peak:number)=>{const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(freq,start);o.frequency.exponentialRampToValueAtTime(freq*0.5,end);f.type='lowpass';f.frequency.setValueAtTime(1200,start);g.gain.setValueAtTime(0.001,start);g.gain.linearRampToValueAtTime(peak,start+0.005);g.gain.exponentialRampToValueAtTime(0.001,end);o.connect(f);f.connect(g);this.routeSound(g,0.12,0);o.start(start);o.stop(end+0.01);};tone('square',659.25,n,n+0.05,0.18);tone('triangle',329.63,n+0.045,n+0.11,0.16); }
  public playWarning():void { const c=this.init(),n=c.currentTime; const osc=c.createOscillator(),sub=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(); osc.type='sawtooth'; sub.type='square'; osc.frequency.setValueAtTime(116.54,n); sub.frequency.setValueAtTime(65,n); f.type='lowpass'; f.frequency.setValueAtTime(1800,n); g.gain.setValueAtTime(0.0001,n); g.gain.linearRampToValueAtTime(0.32,n+0.008); g.gain.exponentialRampToValueAtTime(0.0001,n+0.28); osc.connect(f);sub.connect(f);f.connect(g);this.routeSound(g,0.18,0);osc.start(n);sub.start(n);osc.stop(n+0.3);sub.stop(n+0.3); }
  public playTabSwitch():void { const c=this.init(),n=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(); o.type='square';o.frequency.setValueAtTime(950,n);o.frequency.exponentialRampToValueAtTime(1600,n+0.035);f.type='bandpass';f.frequency.setValueAtTime(1800,n);f.Q.setValueAtTime(0.7,n);g.gain.setValueAtTime(0.0001,n);g.gain.linearRampToValueAtTime(0.16,n+0.004);g.gain.exponentialRampToValueAtTime(0.0001,n+0.055);o.connect(f);f.connect(g);this.routeSound(g,0.1,0);o.start(n);o.stop(n+0.06); }
  /** 音源候補v1: モーダル開閉音「トンッ」 */
  public playModalOpenClose():void { const c=this.init(),n=c.currentTime,o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter(); o.type='sine';o.frequency.setValueAtTime(480,n);o.frequency.exponentialRampToValueAtTime(110,n+0.08);f.type='lowpass';f.frequency.setValueAtTime(1200,n);f.frequency.exponentialRampToValueAtTime(300,n+0.08);g.gain.setValueAtTime(0.0001,n);g.gain.linearRampToValueAtTime(0.35,n+0.004);g.gain.exponentialRampToValueAtTime(0.0001,n+0.12);o.connect(f);f.connect(g);this.routeSound(g,0.15,0);o.start(n);o.stop(n+0.13); }
  public setMasterVolume(volume:number):void { this.masterVolume=Math.max(0,Math.min(1,volume)); if(this.masterGain&&this.ctx)this.masterGain.gain.setTargetAtTime(this.masterVolume,this.ctx.currentTime,0.02); }
  public setReverbWet(wet:number):void { this.reverbWet=Math.max(0,Math.min(1,wet)); if(this.reverbGain&&this.dryGain&&this.ctx){this.reverbGain.gain.setTargetAtTime(this.reverbWet,this.ctx.currentTime,0.02);this.dryGain.gain.setTargetAtTime(1-this.reverbWet*0.4,this.ctx.currentTime,0.02);} }
  public getMasterVolume():number{return this.masterVolume;} public getReverbWet():number{return this.reverbWet;}
}
export const soundEngine=new SoundEngine();
