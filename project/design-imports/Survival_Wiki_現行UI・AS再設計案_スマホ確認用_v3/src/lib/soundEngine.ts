import { SoundConfig } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private directGain: GainNode | null = null;

  // BGM state
  private isBgmPlaying = false;
  private bgmInterval: number | null = null;
  private currentStep = 0;

  public config: SoundConfig = {
    masterVolume: 0.7,
    reverbWet: 0.4,
    seVolume: 0.6,
    seEnabled: true,
    bgmEnabled: true,
    bgmChannels: {
      melody: true,
      arpeggio: true,
      bass: true,
      drums: true,
    },
  };

  constructor() {
    // Load config from localStorage if available
    try {
      const saved = localStorage.getItem('survival-wiki:sound-config');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }

  public saveConfig() {
    try {
      localStorage.setItem('survival-wiki:sound-config', JSON.stringify(this.config));
    } catch {
      // ignore
    }
  }

  public init() {
    this.initAudio();
  }

  private initAudio() {
    if (this.ctx) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.config.masterVolume;

      this.directGain = this.ctx.createGain();
      this.directGain.gain.value = 1.0 - this.config.reverbWet * 0.5;

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.value = this.config.reverbWet;

      // Create procedural reverb impulse response
      this.reverbNode = this.createImpulseResponse(1.8, 2.0);

      this.directGain.connect(this.masterGain);
      if (this.reverbNode) {
        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
      }
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('AudioContext init failed:', e);
    }
  }

  private createImpulseResponse(duration: number, decay: number): ConvolverNode | null {
    if (!this.ctx) return null;
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      const factor = Math.pow(n / length, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }

    const convolver = this.ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }

  public ensureContext() {
    this.initAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMasterVolume(val: number) {
    this.config.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.config.masterVolume, this.ctx.currentTime);
    }
    this.saveConfig();
  }

  public setReverbWet(val: number) {
    this.config.reverbWet = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.directGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(this.config.reverbWet, this.ctx.currentTime);
      this.directGain.gain.setValueAtTime(1.0 - this.config.reverbWet * 0.5, this.ctx.currentTime);
    }
    this.saveConfig();
  }

  public setSeVolume(val: number) {
    this.config.seVolume = Math.max(0, Math.min(1, val));
    this.saveConfig();
  }

  public toggleSe(enabled?: boolean) {
    this.config.seEnabled = enabled ?? !this.config.seEnabled;
    this.saveConfig();
  }

  public toggleBgm(enabled?: boolean) {
    this.config.bgmEnabled = enabled ?? !this.config.bgmEnabled;
    if (!this.config.bgmEnabled) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    this.saveConfig();
  }

  public toggleBgmChannel(channel: keyof SoundConfig['bgmChannels']) {
    this.config.bgmChannels[channel] = !this.config.bgmChannels[channel];
    this.saveConfig();
  }

  // Plays a procedural tone / noise
  private playSynth({
    type = 'square',
    freq = 440,
    endFreq,
    duration = 0.1,
    gain = 0.2,
    decay = 0.08,
  }: {
    type?: OscillatorType;
    freq?: number;
    endFreq?: number;
    duration?: number;
    gain?: number;
    decay?: number;
  }) {
    if (!this.config.seEnabled || this.config.masterVolume === 0 || this.config.seVolume === 0) return;
    this.ensureContext();
    if (!this.ctx || !this.directGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const nodeGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), t + duration);
      }

      const totalVol = gain * this.config.seVolume;
      nodeGain.gain.setValueAtTime(totalVol, t);
      nodeGain.gain.exponentialRampToValueAtTime(0.0001, t + duration + decay);

      osc.connect(nodeGain);
      nodeGain.connect(this.directGain);
      if (this.reverbNode) {
        nodeGain.connect(this.reverbNode);
      }

      osc.start(t);
      osc.stop(t + duration + decay + 0.05);
    } catch {
      // ignore
    }
  }

  // Play white noise burst (hit / UI click / snare)
  private playNoise({ duration = 0.05, gain = 0.15 }: { duration?: number; gain?: number }) {
    if (!this.config.seEnabled || this.config.masterVolume === 0 || this.config.seVolume === 0) return;
    this.ensureContext();
    if (!this.ctx || !this.directGain) return;

    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000;

      const nodeGain = this.ctx.createGain();
      const totalVol = gain * this.config.seVolume;
      nodeGain.gain.setValueAtTime(totalVol, t);
      nodeGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noise.connect(filter);
      filter.connect(nodeGain);
      nodeGain.connect(this.directGain);
      if (this.reverbNode) {
        nodeGain.connect(this.reverbNode);
      }

      noise.start(t);
      noise.stop(t + duration);
    } catch {
      // ignore
    }
  }

  // Preset SFX methods
  public playHover() {
    this.playSynth({ type: 'sine', freq: 620, endFreq: 780, duration: 0.03, gain: 0.06, decay: 0.02 });
  }

  public playConfirm() {
    // 2-tone bright retro chime
    this.playSynth({ type: 'square', freq: 523.25, duration: 0.06, gain: 0.15 });
    setTimeout(() => {
      this.playSynth({ type: 'square', freq: 783.99, duration: 0.12, gain: 0.18, decay: 0.15 });
    }, 60);
  }

  public playCancel() {
    this.playSynth({ type: 'square', freq: 440, endFreq: 220, duration: 0.08, gain: 0.14, decay: 0.08 });
  }

  public playDelete() {
    this.playNoise({ duration: 0.12, gain: 0.2 });
    this.playSynth({ type: 'sawtooth', freq: 280, endFreq: 90, duration: 0.15, gain: 0.18, decay: 0.1 });
  }

  public playError() {
    this.playSynth({ type: 'sawtooth', freq: 180, duration: 0.1, gain: 0.2 });
    setTimeout(() => {
      this.playSynth({ type: 'sawtooth', freq: 140, duration: 0.14, gain: 0.2 });
    }, 110);
  }

  public playSave() {
    // 16-bit Fanfare arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSynth({ type: 'triangle', freq, duration: 0.09, gain: 0.18, decay: 0.15 });
      }, i * 70);
    });
  }

  public playNewRecord() {
    // Level-up / Discovery chime
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playSynth({ type: 'square', freq, duration: 0.08, gain: 0.16, decay: 0.12 });
      }, i * 60);
    });
  }

  public playCardOpen() {
    this.playSynth({ type: 'triangle', freq: 360, endFreq: 720, duration: 0.05, gain: 0.12, decay: 0.06 });
  }

  public playRecordSelect() {
    this.playSynth({ type: 'sine', freq: 480, endFreq: 880, duration: 0.04, gain: 0.1, decay: 0.04 });
  }

  public playModalOpen() {
    this.playSynth({ type: 'triangle', freq: 400, endFreq: 600, duration: 0.07, gain: 0.12 });
  }

  public playModalClose() {
    this.playSynth({ type: 'triangle', freq: 580, endFreq: 360, duration: 0.06, gain: 0.1 });
  }

  public playAdd() {
    this.playSynth({ type: 'sine', freq: 587.33, endFreq: 880, duration: 0.08, gain: 0.14 });
  }

  // Procedural 16-bit 4-Channel BGM Loop
  public startBgm() {
    if (this.isBgmPlaying || !this.config.bgmEnabled) return;
    this.ensureContext();
    this.isBgmPlaying = true;
    this.currentStep = 0;

    // 96 BPM -> 16th note ~ 156ms
    const stepDuration = 156;
    const melodyScale = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]; // C D E G A C
    const bassNotes = [130.81, 130.81, 164.81, 174.61, 196.0, 174.61, 164.81, 130.81];

    this.bgmInterval = window.setInterval(() => {
      if (!this.isBgmPlaying || !this.ctx || !this.directGain) return;
      const step = this.currentStep % 16;
      const bar = Math.floor(this.currentStep / 16) % 4;

      // CH3: Bass (Triangle Wave)
      if (this.config.bgmChannels.bass && (step % 2 === 0)) {
        const bassFreq = bassNotes[(Math.floor(this.currentStep / 4)) % bassNotes.length];
        this.playBgmNote('triangle', bassFreq, 0.16, 0.14);
      }

      // CH2: Arpeggio (Square Wave with softer filter)
      if (this.config.bgmChannels.arpeggio && (step % 2 === 1)) {
        const arpNote = melodyScale[(step + bar) % melodyScale.length];
        this.playBgmNote('square', arpNote * 0.75, 0.08, 0.06);
      }

      // CH1: Lead Melody (Square Wave)
      if (this.config.bgmChannels.melody && (step === 0 || step === 4 || step === 7 || step === 10 || step === 12)) {
        const leadFreq = melodyScale[(bar * 2 + Math.floor(step / 3)) % melodyScale.length];
        this.playBgmNote('square', leadFreq, 0.22, 0.1);
      }

      // CH4: Noise Drums (Hi-Hat / Snare)
      if (this.config.bgmChannels.drums) {
        if (step % 4 === 2) {
          // Snare on beat 2 & 4
          this.playBgmNoise(0.08, 0.08, 1200);
        } else if (step % 2 === 0) {
          // Hi-hat on 8th notes
          this.playBgmNoise(0.02, 0.04, 5000);
        }
      }

      this.currentStep++;
    }, stepDuration);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  private playBgmNote(type: OscillatorType, freq: number, duration: number, gain: number) {
    if (!this.ctx || !this.directGain || this.config.masterVolume === 0) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);

      const totalVol = gain * this.config.masterVolume * 0.5;
      g.gain.setValueAtTime(totalVol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      osc.connect(g);
      g.connect(this.directGain);
      if (this.reverbNode) {
        g.connect(this.reverbNode);
      }

      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch {
      // ignore
    }
  }

  private playBgmNoise(duration: number, gain: number, hpFreq: number) {
    if (!this.ctx || !this.directGain || this.config.masterVolume === 0) return;
    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.6;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = hpFreq;

      const g = this.ctx.createGain();
      const totalVol = gain * this.config.masterVolume * 0.5;
      g.gain.setValueAtTime(totalVol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.directGain);

      noise.start(t);
      noise.stop(t + duration);
    } catch {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();

// Export convenient global triggers
export const playHoverSound = () => soundEngine.playHover();
export const playConfirmSound = () => soundEngine.playConfirm();
export const playCancelSound = () => soundEngine.playCancel();
export const playDeleteSound = () => soundEngine.playDelete();
export const playErrorSound = () => soundEngine.playError();
export const playSaveSound = () => soundEngine.playSave();
export const playNewRecordSound = () => soundEngine.playNewRecord();
export const playCardOpenSound = () => soundEngine.playCardOpen();
export const playRecordSelectSound = () => soundEngine.playRecordSelect();
export const playModalOpenSound = () => soundEngine.playModalOpen();
export const playModalCloseSound = () => soundEngine.playModalClose();
export const playAddSound = () => soundEngine.playAdd();
export const playSuccessSound = () => soundEngine.playSave();
