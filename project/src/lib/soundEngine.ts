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
      this.ctx = new AudioContextClass();
      this.setupMasterGraph();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }
  public getContext(): AudioContext { return this.init(); }
  public getAnalyser(): AnalyserNode | null { if (!this.ctx) return null; if (!this.analyser) this.setupMasterGraph(); return this.analyser; }

  private setupMasterGraph(): void {
    if (!this.ctx || this.masterGain) return;
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime); this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime); this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime); this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);
    this.masterGain = this.ctx.createGain(); this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 512; this.analyser.smoothingTimeConstant = 0.8;
    this.reverbNode = this.ctx.createConvolver(); this.reverbNode.buffer = this.createImpulseResponse(1.8, 2.5);
    this.reverbGain = this.ctx.createGain(); this.reverbGain.gain.setValueAtTime(this.reverbWet, this.ctx.currentTime);
    this.dryGain = this.ctx.createGain(); this.dryGain.gain.setValueAtTime(1 - this.reverbWet * 0.5, this.ctx.currentTime);
    this.delayNode = this.ctx.createDelay(); this.delayNode.delayTime.setValueAtTime(0.18, this.ctx.currentTime);
    this.delayGain = this.ctx.createGain(); this.delayGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    const feedback = this.ctx.createGain(); feedback.gain.setValueAtTime(0.35, this.ctx.currentTime); this.delayNode.connect(feedback); feedback.connect(this.delayNode);
    this.reverbNode.connect(this.reverbGain); this.reverbGain.connect(this.compressor); this.delayNode.connect(this.delayGain); this.delayGain.connect(this.compressor);
    this.dryGain.connect(this.compressor); this.compressor.connect(this.masterGain); this.masterGain.connect(this.analyser); this.analyser.connect(this.ctx.destination);
  }

  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    const ctx = this.ctx ?? this.init(); const length = Math.floor(ctx.sampleRate * duration); const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    const left = impulse.getChannelData(0); const right = impulse.getChannelData(1);
    for (let i = 0; i < length; i += 1) { const factor = Math.pow(1 - i / length, decay); left[i] = (Math.random() * 2 - 1) * factor; right[i] = (Math.random() * 2 - 1) * factor; }
    return impulse;
  }

  public routeSound(sourceNode: AudioNode, reverbSend = 0.25, delaySend = 0): void {
    this.init(); if (!this.dryGain || !this.reverbNode || !this.delayNode || !this.ctx) return;
    sourceNode.connect(this.dryGain);
    if (reverbSend > 0) { const send = this.ctx.createGain(); send.gain.setValueAtTime(reverbSend, this.ctx.currentTime); sourceNode.connect(send); send.connect(this.reverbNode); }
    if (delaySend > 0) { const send = this.ctx.createGain(); send.gain.setValueAtTime(delaySend, this.ctx.currentTime); sourceNode.connect(send); send.connect(this.delayNode); }
  }

  /** 音源候補v1: カーソル移動音「ピコッ」 */
  public playCursorMove(): void {
    const ctx = this.init(); const now = ctx.currentTime; const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
    osc.type = 'square'; osc.frequency.setValueAtTime(1320, now); osc.frequency.exponentialRampToValueAtTime(1980, now + 0.02); filter.type = 'lowpass'; filter.frequency.setValueAtTime(4500, now);
    gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(0.18, now + 0.005); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(filter); filter.connect(gain); this.routeSound(gain, 0.15, 0); osc.start(now); osc.stop(now + 0.05);
  }

  /** 音源候補v1: 決定・ロード音「ピポッ」 */
  public playConfirm(): void {
    const ctx = this.init(); const now = ctx.currentTime;
    const playTone = (freq: number, start: number, peak: number, end: number, reverb: number, delay: number) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); osc.type = 'square'; osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start); gain.gain.linearRampToValueAtTime(peak, start + 0.004); gain.gain.exponentialRampToValueAtTime(0.001, end);
      osc.connect(gain); this.routeSound(gain, reverb, delay); osc.start(start); osc.stop(end + 0.01);
    };
    playTone(880, now, 0.22, now + 0.055, 0.25, 0.1); playTone(1760, now + 0.045, 0.25, now + 0.14, 0.35, 0.15);
  }

  /** 音源候補v1: キャンセル・戻る音「ピピッ / ポッ」 */
  public playCancel(): void {
    const ctx = this.init(); const now = ctx.currentTime;
    const playTone = (type: OscillatorType, freq: number, start: number, end: number, peak: number) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
      osc.type = type; osc.frequency.setValueAtTime(freq, start); osc.frequency.exponentialRampToValueAtTime(freq * 0.5, end); filter.type = 'lowpass'; filter.frequency.setValueAtTime(1200, start);
      gain.gain.setValueAtTime(0.001, start); gain.gain.linearRampToValueAtTime(peak, start + 0.005); gain.gain.exponentialRampToValueAtTime(0.001, end);
      osc.connect(filter); filter.connect(gain); this.routeSound(gain, 0.12, 0); osc.start(start); osc.stop(end + 0.01);
    };
    playTone('square', 659.25, now, now + 0.05, 0.18); playTone('triangle', 329.63, now + 0.045, now + 0.11, 0.16);
  }

  /** 音源候補v1: 警告・削除音「デンッ / ブブー」 */
  public playWarning(): void {
    const ctx = this.init(); const now = ctx.currentTime;
    const playTone = (type: OscillatorType, frequency: number, detune: number, duration: number, peak: number) => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(frequency, now); osc.detune.setValueAtTime(detune, now);
      gain.gain.setValueAtTime(0.0001, now); gain.gain.linearRampToValueAtTime(peak, now + 0.008); gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain); this.routeSound(gain, 0.28, 0.08); osc.start(now); osc.stop(now + duration + 0.01);
    };
    playTone('sawtooth', 116, -7, 0.28, 0.20);
    playTone('square', 123, 7, 0.28, 0.16);
    const kick = ctx.createOscillator(); const kickGain = ctx.createGain();
    kick.type = 'sine'; kick.frequency.setValueAtTime(65, now); kick.frequency.exponentialRampToValueAtTime(38, now + 0.12);
    kickGain.gain.setValueAtTime(0.0001, now); kickGain.gain.linearRampToValueAtTime(0.22, now + 0.004); kickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    kick.connect(kickGain); this.routeSound(kickGain, 0.12, 0.04); kick.start(now); kick.stop(now + 0.18);
  }

  public setMasterVolume(volume: number): void { this.masterVolume = Math.max(0, Math.min(1, volume)); if (this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.02); }
  public setReverbWet(wet: number): void { this.reverbWet = Math.max(0, Math.min(1, wet)); if (this.reverbGain && this.dryGain && this.ctx) { this.reverbGain.gain.setTargetAtTime(this.reverbWet, this.ctx.currentTime, 0.02); this.dryGain.gain.setTargetAtTime(1 - this.reverbWet * 0.4, this.ctx.currentTime, 0.02); } }
  public getMasterVolume(): number { return this.masterVolume; }
  public getReverbWet(): number { return this.reverbWet; }
}

export const soundEngine = new SoundEngine();