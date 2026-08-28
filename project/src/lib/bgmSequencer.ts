import { soundEngine } from './soundEngine';
import { getBgmChannelSettings } from './bgmSettings';

export type BgmChannelState = { lead: boolean; harmony: boolean; bass: boolean; drums: boolean };
type NoteEvent = { time: number; duration: number; freq: number; velocity?: number };
type DrumEvent = { time: number; type: 'kick' | 'snare' | 'hihat' | 'openhat'; velocity?: number };

const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.0, G3: 196.0, Gs3: 207.65, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, Gs4: 415.3, A4: 440.0, As4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.0,
};

export class BgmSequencer {
  private isPlaying = false;
  private currentStep = 0;
  private tempo = 96;
  private totalSteps = 192;
  private lookahead = 25.0;
  private scheduleAheadTime = 0.12;
  private nextStepTime = 0.0;
  private timerId: number | null = null;
  private onStepCallback: ((step: number, total: number, timeSec: number) => void) | null = null;
  private onStateChangeCallback: ((playing: boolean) => void) | null = null;

  public channels: BgmChannelState = {
    lead: true,
    harmony: true,
    bass: true,
    drums: true,
  };

  private leadNotes: NoteEvent[] = [];
  private harmonyNotes: NoteEvent[] = [];
  private bassNotes: NoteEvent[] = [];
  private drumNotes: DrumEvent[] = [];

  constructor() {
    this.composeTrack();
    this.channels = getBgmChannelSettings();
  }

  public getTempo(): number {
    return this.tempo;
  }

  public getTotalDurationSec(): number {
    return (60 / (this.tempo * 4)) * this.totalSteps;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setOnStep(cb: (step: number, total: number, timeSec: number) => void) {
    this.onStepCallback = cb;
  }

  public setOnStateChange(cb: (playing: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  private composeTrack() {
    this.leadNotes = [
      [0, 4, NOTES.A5, 0.8], [4, 4, NOTES.C6, 0.85], [8, 6, NOTES.B5, 0.8], [14, 2, NOTES.A5, 0.75],
      [16, 8, NOTES.G5, 0.85], [24, 4, NOTES.E5, 0.75], [28, 4, NOTES.G5, 0.8],
      [32, 6, NOTES.G5, 0.8], [38, 2, NOTES.A5, 0.75], [40, 6, NOTES.B5, 0.85], [46, 2, NOTES.C6, 0.9],
      [48, 10, NOTES.E6, 0.9], [58, 3, NOTES.D6, 0.75], [61, 3, NOTES.C6, 0.75],
      [64, 6, NOTES.F5, 0.8], [70, 2, NOTES.A5, 0.75], [72, 6, NOTES.D6, 0.85], [78, 2, NOTES.C6, 0.8],
      [80, 8, NOTES.B5, 0.85], [88, 4, NOTES.C6, 0.8], [92, 4, NOTES.D6, 0.85],
      [96, 10, NOTES.E6, 0.9], [106, 3, NOTES.D6, 0.8], [109, 3, NOTES.C6, 0.8],
      [112, 12, NOTES.A5, 0.85], [124, 2, NOTES.B5, 0.75], [126, 2, NOTES.C6, 0.8],
      [128, 6, NOTES.D6, 0.9], [134, 2, NOTES.E6, 0.8], [136, 6, NOTES.F6, 0.95], [142, 2, NOTES.E6, 0.85],
      [144, 8, NOTES.D6, 0.9], [152, 4, NOTES.B5, 0.85], [156, 4, NOTES.Gs5, 0.8],
      [160, 6, NOTES.A5, 0.85], [166, 2, NOTES.C6, 0.8], [168, 6, NOTES.E6, 0.9], [174, 2, NOTES.D6, 0.8],
      [176, 8, NOTES.C6, 0.85], [184, 4, NOTES.B5, 0.8], [188, 4, NOTES.G5, 0.75],
    ].map(([time, duration, freq, velocity]) => ({ time, duration, freq, velocity }));

    const chords = [
      [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5], [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5],
      [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5], [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5],
      [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4], [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5], [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5],
      [NOTES.E4, NOTES.Gs4, NOTES.B4, NOTES.D5], [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5],
    ];
    this.harmonyNotes = [];
    chords.forEach((chord, bar) => {
      for (let s = 0; s < 16; s += 2) {
        this.harmonyNotes.push({
          time: bar * 16 + s,
          duration: 2,
          freq: chord[(s / 2) % chord.length],
          velocity: s % 4 === 0 ? 0.55 : 0.45,
        });
      }
    });

    const roots = [NOTES.F3, NOTES.G3, NOTES.E3, NOTES.A3, NOTES.D3, NOTES.G3, NOTES.C3, NOTES.F3, NOTES.D3, NOTES.E3, NOTES.A3, NOTES.G3];
    this.bassNotes = [];
    roots.forEach((root, bar) => {
      const s = bar * 16;
      this.bassNotes.push(
        { time: s, duration: 3, freq: root, velocity: 0.85 },
        { time: s + 4, duration: 2, freq: root * 2, velocity: 0.65 },
        { time: s + 6, duration: 3, freq: root, velocity: 0.8 },
        { time: s + 10, duration: 3, freq: root * 1.5, velocity: 0.7 },
        { time: s + 14, duration: 2, freq: root, velocity: 0.75 },
      );
    });

    this.drumNotes = [];
    for (let bar = 0; bar < 12; bar += 1) {
      const s = bar * 16;
      this.drumNotes.push(
        { time: s, type: 'kick', velocity: 0.9 },
        { time: s + 8, type: 'kick', velocity: 0.85 },
        { time: s + 14, type: 'kick', velocity: 0.7 },
        { time: s + 4, type: 'snare', velocity: 0.8 },
        { time: s + 12, type: 'snare', velocity: 0.85 },
      );
      for (let i = 0; i < 16; i += 2) {
        this.drumNotes.push({ time: s + i, type: i === 10 ? 'openhat' : 'hihat', velocity: i % 4 === 0 ? 0.6 : 0.4 });
      }
    }
  }

  public play() {
    if (this.isPlaying) return;
    const ctx = soundEngine.init();
    this.isPlaying = true;
    this.nextStepTime = ctx.currentTime + 0.05;
    this.currentStep = 0;
    if (this.onStateChangeCallback) this.onStateChangeCallback(true);
    this.timerId = window.setInterval(() => this.scheduler(), this.lookahead);
  }

  public pause() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.onStateChangeCallback) this.onStateChangeCallback(false);
  }

  public stop() {
    this.pause();
    this.currentStep = 0;
    if (this.onStepCallback) this.onStepCallback(0, this.totalSteps, 0);
  }

  public seek(step: number) {
    this.currentStep = Math.max(0, Math.min(this.totalSteps - 1, step));
    const stepDuration = 60 / (this.tempo * 4);
    if (this.onStepCallback) this.onStepCallback(this.currentStep, this.totalSteps, this.currentStep * stepDuration);
  }

  private scheduler() {
    if (!this.isPlaying) return;
    const ctx = soundEngine.getContext();
    while (this.nextStepTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.nextStepTime += 60 / (this.tempo * 4);
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }
  }

  private scheduleStep(step: number, time: number) {
    const stepDuration = 60 / (this.tempo * 4);
    this.channels = getBgmChannelSettings();

    if (this.onStepCallback) {
      const timeSec = step * stepDuration;
      setTimeout(() => {
        if (this.isPlaying && this.onStepCallback) this.onStepCallback(step, this.totalSteps, timeSec);
      }, Math.max(0, (time - soundEngine.getContext().currentTime) * 1000));
    }

    if (this.channels.lead) {
      const leads = this.leadNotes.filter((n) => n.time === step);
      leads.forEach((n) => this.playLeadNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.8));
    }
    if (this.channels.harmony) {
      const harmonies = this.harmonyNotes.filter((n) => n.time === step);
      harmonies.forEach((n) => this.playHarmonyNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.5));
    }
    if (this.channels.bass) {
      const basses = this.bassNotes.filter((n) => n.time === step);
      basses.forEach((n) => this.playBassNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.8));
    }
    if (this.channels.drums) {
      const drums = this.drumNotes.filter((d) => d.time === step);
      drums.forEach((d) => this.playDrumNote(d.type, time, d.velocity || 0.7));
    }
  }

  private playLeadNote(freq: number, time: number, duration: number, velocity: number) {
    const ctx = soundEngine.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    if (duration > 0.3) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, time);
      lfoGain.gain.setValueAtTime(0, time);
      lfoGain.gain.setValueAtTime(0, time + 0.15);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.015, time + 0.35);
      lfo.connect(osc.frequency);
      lfo.start(time);
      lfo.stop(time + duration);
    }
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3600, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.22, time + 0.012);
    gain.gain.setValueAtTime(velocity * 0.18, time + duration * 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    soundEngine.routeSound(gain, 0.35, 0.2);
    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  private playHarmonyNote(freq: number, time: number, duration: number, velocity: number) {
    const ctx = soundEngine.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2800, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.12, time + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.95);
    osc.connect(filter);
    filter.connect(gain);
    soundEngine.routeSound(gain, 0.3, 0.15);
    osc.start(time);
    osc.stop(time + duration);
  }

  private playBassNote(freq: number, time: number, duration: number, velocity: number) {
    const ctx = soundEngine.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(velocity * 0.35, time + 0.005);
    gain.gain.setValueAtTime(velocity * 0.28, time + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(filter);
    filter.connect(gain);
    soundEngine.routeSound(gain, 0.15, 0);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  private playDrumNote(type: DrumEvent['type'], time: number, velocity: number) {
    const ctx = soundEngine.getContext();

    if (type === 'kick') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, time);
      osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      gain.gain.setValueAtTime(velocity * 0.5, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      osc.connect(gain);
      soundEngine.routeSound(gain, 0.1, 0);
      osc.start(time);
      osc.stop(time + 0.15);
      return;
    }

    if (type === 'snare') {
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i += 1) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(900, time);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velocity * 0.28, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);

      const body = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      body.type = 'triangle';
      body.frequency.setValueAtTime(220, time);
      body.frequency.exponentialRampToValueAtTime(90, time + 0.06);
      bodyGain.gain.setValueAtTime(velocity * 0.2, time);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);
      body.connect(bodyGain);

      soundEngine.routeSound(gain, 0.25, 0.1);
      soundEngine.routeSound(bodyGain, 0.1, 0);
      noise.start(time);
      body.start(time);
      noise.stop(time + 0.11);
      body.stop(time + 0.08);
      return;
    }

    const isHihat = type === 'hihat';
    const dur = isHihat ? 0.04 : 0.14;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i += 1) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(velocity * (isHihat ? 0.14 : 0.18), time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    noise.connect(filter);
    filter.connect(gain);
    soundEngine.routeSound(gain, isHihat ? 0.15 : 0.3, 0);
    noise.start(time);
    noise.stop(time + dur + 0.01);
  }
}

export const bgmSequencer = new BgmSequencer();
