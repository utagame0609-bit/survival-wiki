/**
 * 16bit レトロ × Switch風 BGMシーケンサー
 * 「セーブ / ワールド選択画面BGM」
 * テンポ: BPM 96 (12小節 = 30.00秒 シームレスループ)
 */

import { soundEngine } from './soundEngine';
import { BgmChannelState } from '../types';

interface NoteEvent {
  time: number; // in 16th note steps (0 to 191 for 12 bars * 16 steps)
  duration: number; // in 16th note steps
  freq: number; // Frequency in Hz
  velocity?: number;
}

interface DrumEvent {
  time: number;
  type: 'kick' | 'snare' | 'hihat' | 'openhat';
  velocity?: number;
}

// Frequencies for musical notes
const NOTES = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.0, G3: 196.0, Gs3: 207.65, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.0, Gs4: 415.3, A4: 440.0, As4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, Gs5: 830.61, A5: 880.0, B5: 987.77,
  C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98, A6: 1760.0
};

export class BgmSequencer {
  private isPlaying: boolean = false;
  private currentStep: number = 0;
  private tempo: number = 96; // BPM 96 => 12 bars = 30.0s
  private totalSteps: number = 192; // 12 bars * 16 steps = 192 steps (30 seconds)
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.12; // sec
  private nextStepTime: number = 0.0;
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
  }

  public getTempo(): number {
    return this.tempo;
  }

  public getTotalDurationSec(): number {
    // 1 step = 60 / (BPM * 4) sec
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

  /**
   * Composes the 30-second nostalgic RPG World / Save Select theme
   */
  private composeTrack() {
    this.leadNotes = [];
    this.harmonyNotes = [];
    this.bassNotes = [];
    this.drumNotes = [];

    // --- 1. LEAD MELODY (16-bit Emotional JRPG World Theme) ---
    // Bar 1 (Fmaj7): 0 - 15
    this.leadNotes.push(
      { time: 0, duration: 4, freq: NOTES.A5, velocity: 0.8 },
      { time: 4, duration: 4, freq: NOTES.C6, velocity: 0.85 },
      { time: 8, duration: 6, freq: NOTES.B5, velocity: 0.8 },
      { time: 14, duration: 2, freq: NOTES.A5, velocity: 0.75 }
    );
    // Bar 2 (G): 16 - 31
    this.leadNotes.push(
      { time: 16, duration: 8, freq: NOTES.G5, velocity: 0.85 },
      { time: 24, duration: 4, freq: NOTES.E5, velocity: 0.75 },
      { time: 28, duration: 4, freq: NOTES.G5, velocity: 0.8 }
    );
    // Bar 3 (Em7): 32 - 47
    this.leadNotes.push(
      { time: 32, duration: 6, freq: NOTES.G5, velocity: 0.8 },
      { time: 38, duration: 2, freq: NOTES.A5, velocity: 0.75 },
      { time: 40, duration: 6, freq: NOTES.B5, velocity: 0.85 },
      { time: 46, duration: 2, freq: NOTES.C6, velocity: 0.9 }
    );
    // Bar 4 (Am): 48 - 63
    this.leadNotes.push(
      { time: 48, duration: 10, freq: NOTES.E6, velocity: 0.9 },
      { time: 58, duration: 3, freq: NOTES.D6, velocity: 0.75 },
      { time: 61, duration: 3, freq: NOTES.C6, velocity: 0.75 }
    );

    // Bar 5 (Dm7): 64 - 79
    this.leadNotes.push(
      { time: 64, duration: 6, freq: NOTES.F5, velocity: 0.8 },
      { time: 70, duration: 2, freq: NOTES.A5, velocity: 0.75 },
      { time: 72, duration: 6, freq: NOTES.D6, velocity: 0.85 },
      { time: 78, duration: 2, freq: NOTES.C6, velocity: 0.8 }
    );
    // Bar 6 (G7): 80 - 95
    this.leadNotes.push(
      { time: 80, duration: 8, freq: NOTES.B5, velocity: 0.85 },
      { time: 88, duration: 4, freq: NOTES.C6, velocity: 0.8 },
      { time: 92, duration: 4, freq: NOTES.D6, velocity: 0.85 }
    );
    // Bar 7 (Cmaj7 -> C7): 96 - 111
    this.leadNotes.push(
      { time: 96, duration: 10, freq: NOTES.E6, velocity: 0.9 },
      { time: 106, duration: 3, freq: NOTES.D6, velocity: 0.8 },
      { time: 109, duration: 3, freq: NOTES.C6, velocity: 0.8 }
    );
    // Bar 8 (Fmaj7): 112 - 127
    this.leadNotes.push(
      { time: 112, duration: 12, freq: NOTES.A5, velocity: 0.85 },
      { time: 124, duration: 2, freq: NOTES.B5, velocity: 0.75 },
      { time: 126, duration: 2, freq: NOTES.C6, velocity: 0.8 }
    );

    // Bar 9 (Dm7 - Climax): 128 - 143
    this.leadNotes.push(
      { time: 128, duration: 6, freq: NOTES.D6, velocity: 0.9 },
      { time: 134, duration: 2, freq: NOTES.E6, velocity: 0.8 },
      { time: 136, duration: 6, freq: NOTES.F6, velocity: 0.95 },
      { time: 142, duration: 2, freq: NOTES.E6, velocity: 0.85 }
    );
    // Bar 10 (E7/G# - Nostalgic Tension): 144 - 159
    this.leadNotes.push(
      { time: 144, duration: 8, freq: NOTES.D6, velocity: 0.9 },
      { time: 152, duration: 4, freq: NOTES.B5, velocity: 0.85 },
      { time: 156, duration: 4, freq: NOTES.Gs5, velocity: 0.8 }
    );
    // Bar 11 (Am): 160 - 175
    this.leadNotes.push(
      { time: 160, duration: 6, freq: NOTES.A5, velocity: 0.85 },
      { time: 166, duration: 2, freq: NOTES.C6, velocity: 0.8 },
      { time: 168, duration: 6, freq: NOTES.E6, velocity: 0.9 },
      { time: 174, duration: 2, freq: NOTES.D6, velocity: 0.8 }
    );
    // Bar 12 (G7sus4 -> Loop Turnaround): 176 - 191
    this.leadNotes.push(
      { time: 176, duration: 8, freq: NOTES.C6, velocity: 0.85 },
      { time: 184, duration: 4, freq: NOTES.B5, velocity: 0.8 },
      { time: 188, duration: 4, freq: NOTES.G5, velocity: 0.75 }
    );

    // --- 2. HARMONY / CHORD ARPEGGIO (Sparkling 16th-note Chiptune Chords) ---
    // Generate lovely rhythmic 8th/16th patterns across the 12 bars
    const chordPitches = [
      // Bar 1: Fmaj7 (F4, A4, C5, E5)
      [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5],
      // Bar 2: G (G4, B4, D5, G5)
      [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5],
      // Bar 3: Em7 (E4, G4, B4, E5)
      [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5],
      // Bar 4: Am (A4, C5, E5, A5)
      [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5],
      // Bar 5: Dm7 (D4, F4, A4, C5)
      [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5],
      // Bar 6: G7 (G4, B4, D5, F5)
      [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5],
      // Bar 7: Cmaj7 (C4, E4, G4, B4)
      [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4],
      // Bar 8: Fmaj7 (F4, A4, C5, E5)
      [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5],
      // Bar 9: Dm7 (D4, F4, A4, D5)
      [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5],
      // Bar 10: E7 (E4, Gs4, B4, D5)
      [NOTES.E4, NOTES.Gs4, NOTES.B4, NOTES.D5],
      // Bar 11: Am (A4, C5, E5, A5)
      [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5],
      // Bar 12: G7 (G4, B4, D5, F5)
      [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5],
    ];

    chordPitches.forEach((chord, barIndex) => {
      const barStart = barIndex * 16;
      for (let s = 0; s < 16; s += 2) {
        const pitchIdx = (s / 2) % chord.length;
        this.harmonyNotes.push({
          time: barStart + s,
          duration: 2,
          freq: chord[pitchIdx],
          velocity: 0.4 + (s % 4 === 0 ? 0.15 : 0.05),
        });
      }
    });

    // --- 3. BASSLINE (Warm 16-bit Triangle Wave) ---
    const bassRoots = [
      NOTES.F3, // Bar 1
      NOTES.G3, // Bar 2
      NOTES.E3, // Bar 3
      NOTES.A3, // Bar 4
      NOTES.D3, // Bar 5
      NOTES.G3, // Bar 6
      NOTES.C3, // Bar 7
      NOTES.F3, // Bar 8
      NOTES.D3, // Bar 9
      NOTES.E3, // Bar 10 (E3 / G#)
      NOTES.A3, // Bar 11
      NOTES.G3, // Bar 12
    ];

    bassRoots.forEach((root, barIdx) => {
      const barStart = barIdx * 16;
      // Syncopated classic rhythm: 1, 4, 7, 10, 12, 14
      this.bassNotes.push(
        { time: barStart + 0, duration: 3, freq: root, velocity: 0.85 },
        { time: barStart + 4, duration: 2, freq: root * 2, velocity: 0.65 },
        { time: barStart + 6, duration: 3, freq: root, velocity: 0.8 },
        { time: barStart + 10, duration: 3, freq: root * 1.5, velocity: 0.7 },
        { time: barStart + 14, duration: 2, freq: root, velocity: 0.75 }
      );
    });

    // --- 4. DRUMS (16-bit Noise & Triangle Percussion) ---
    for (let barIdx = 0; barIdx < 12; barIdx++) {
      const barStart = barIdx * 16;
      // Kick on 0, 8, and 14
      this.drumNotes.push(
        { time: barStart + 0, type: 'kick', velocity: 0.9 },
        { time: barStart + 8, type: 'kick', velocity: 0.85 },
        { time: barStart + 14, type: 'kick', velocity: 0.7 }
      );
      // Snare on 4, 12
      this.drumNotes.push(
        { time: barStart + 4, type: 'snare', velocity: 0.8 },
        { time: barStart + 12, type: 'snare', velocity: 0.85 }
      );
      // Hi-Hats every 2 steps
      for (let s = 0; s < 16; s += 2) {
        this.drumNotes.push({
          time: barStart + s,
          type: s === 10 ? 'openhat' : 'hihat',
          velocity: s % 4 === 0 ? 0.6 : 0.4,
        });
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

    this.timerId = window.setInterval(() => {
      this.scheduler();
    }, this.lookahead);
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
    if (this.onStepCallback) {
      this.onStepCallback(0, this.totalSteps, 0);
    }
  }

  public seek(step: number) {
    this.currentStep = Math.max(0, Math.min(this.totalSteps - 1, step));
    const stepDuration = 60 / (this.tempo * 4);
    if (this.onStepCallback) {
      this.onStepCallback(this.currentStep, this.totalSteps, this.currentStep * stepDuration);
    }
  }

  private scheduler() {
    const ctx = soundEngine.getContext();
    while (this.nextStepTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
  }

  private advanceStep() {
    const stepDuration = 60 / (this.tempo * 4);
    this.nextStepTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % this.totalSteps;
  }

  private scheduleStep(step: number, time: number) {
    const stepDuration = 60 / (this.tempo * 4);

    // Notify UI for progress bar & channel visuals
    if (this.onStepCallback) {
      const timeSec = step * stepDuration;
      setTimeout(() => {
        if (this.isPlaying && this.onStepCallback) {
          this.onStepCallback(step, this.totalSteps, timeSec);
        }
      }, Math.max(0, (time - soundEngine.getContext().currentTime) * 1000));
    }

    // 1. Lead channel
    if (this.channels.lead) {
      const leads = this.leadNotes.filter((n) => n.time === step);
      leads.forEach((n) => this.playLeadNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.8));
    }

    // 2. Harmony channel
    if (this.channels.harmony) {
      const harmonies = this.harmonyNotes.filter((n) => n.time === step);
      harmonies.forEach((n) => this.playHarmonyNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.5));
    }

    // 3. Bass channel
    if (this.channels.bass) {
      const basses = this.bassNotes.filter((n) => n.time === step);
      basses.forEach((n) => this.playBassNote(n.freq, time, n.duration * stepDuration, n.velocity || 0.8));
    }

    // 4. Drum channel
    if (this.channels.drums) {
      const drums = this.drumNotes.filter((d) => d.time === step);
      drums.forEach((d) => this.playDrumNote(d.type, time, d.velocity || 0.7));
    }
  }

  /* Synthesis routines for channels */

  private playLeadNote(freq: number, time: number, duration: number, velocity: number) {
    const ctx = soundEngine.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);

    // Add gentle pitch vibrato after 0.15s hold for emotional 16-bit warmth
    if (duration > 0.3) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, time); // 5.5Hz vibrato
      lfoGain.gain.setValueAtTime(0, time);
      lfoGain.gain.setValueAtTime(0, time + 0.15);
      lfoGain.gain.linearRampToValueAtTime(freq * 0.015, time + 0.35); // 1.5% vibrato depth
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

  private playDrumNote(type: 'kick' | 'snare' | 'hihat' | 'openhat', time: number, velocity: number) {
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
    } else if (type === 'snare') {
      // 16-bit noise burst + tone pop
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
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

      // Body tone
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
    } else {
      // Hi-hat / Open-hat
      const isHihat = type === 'hihat';
      const dur = isHihat ? 0.04 : 0.14;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
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
}

export const bgmSequencer = new BgmSequencer();
