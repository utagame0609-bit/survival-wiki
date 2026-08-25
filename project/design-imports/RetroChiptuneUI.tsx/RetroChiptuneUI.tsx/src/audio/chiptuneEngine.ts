// Web Audio 8-bit & 16-bit Chiptune Synthesis & FX Engine

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let analyserNode: AnalyserNode | null = null;

export function getAudioContext(): { ctx: AudioContext; analyser: AnalyserNode; master: GainNode } {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
    
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 256;
    analyserNode.smoothingTimeConstant = 0.8;

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

    masterGain.connect(analyserNode);
    analyserNode.connect(audioCtx.destination);
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  return { ctx: audioCtx, analyser: analyserNode!, master: masterGain! };
}

export function setMasterVolume(vol: number) {
  if (masterGain && audioCtx) {
    masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), audioCtx.currentTime, 0.02);
  }
}

// Frequency helper map
const NOTE_FREQS: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00, 'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'A6': 1760.00, 'B6': 1975.53
};

export function getFreq(note: string): number {
  return NOTE_FREQS[note] || 440;
}

// 8-bit Noise Buffer Generator for NES-style noise percussion
let noiseBuffer: AudioBuffer | null = null;
function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!noiseBuffer) {
    const bufferSize = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  }
  return noiseBuffer;
}

// Authentic Retro Sound Effects
export const RetroSoundFX = {
  // Retro Save Game Jingle / Chime
  playSaveChime: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, t: 0, d: 0.12 },    // C5
      { f: 659.25, t: 0.1, d: 0.12 },   // E5
      { f: 783.99, t: 0.2, d: 0.12 },   // G5
      { f: 1046.50, t: 0.3, d: 0.35 },  // C6
      { f: 1318.51, t: 0.42, d: 0.45 }, // E6
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + t);

      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.exponentialRampToValueAtTime(0.2, now + t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(master);

      osc.start(now + t);
      osc.stop(now + t + d + 0.05);
    });
  },

  // Menu Cursor Beep
  playMenuCursor: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.03);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.09);
  },

  // Confirm / Select
  playMenuConfirm: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880.00, now + 0.06); // A5
    osc2.frequency.setValueAtTime(293.66, now); // D4
    osc2.frequency.setValueAtTime(440.00, now + 0.06); // A4

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(master);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.23);
  },

  // Cancel / Back
  playMenuCancel: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(220, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.16);
  },

  // Level Up / Item Get Fanfare
  playItemGet: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 440, t: 0, d: 0.08 },     // A4
      { f: 554.37, t: 0.07, d: 0.08 },// C#5
      { f: 659.25, t: 0.14, d: 0.08 },// E5
      { f: 880, t: 0.21, d: 0.3 }     // A5
    ];

    notes.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.2, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + t);
      osc.stop(now + t + d + 0.02);
    });
  },

  // 1-Up Retro Chime
  play1Up: () => {
    const { ctx, master } = getAudioContext();
    const now = ctx.currentTime;
    const notes = [
      { f: 330, t: 0 },
      { f: 392, t: 0.08 },
      { f: 659.25, t: 0.16 },
      { f: 523.25, t: 0.24 },
      { f: 587.33, t: 0.32 },
      { f: 783.99, t: 0.40 },
    ];

    notes.forEach(({ f, t }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, now + t);
      gain.gain.setValueAtTime(0.18, now + t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.1);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now + t);
      osc.stop(now + t + 0.12);
    });
  }
};

// Play a single note for the interactive keyboard
export function playSynthNote(freq: number, waveform: OscillatorType = 'square', duration: number = 0.5) {
  const { ctx, master } = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = waveform;
  osc.frequency.setValueAtTime(freq, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(4500, now);
  filter.Q.setValueAtTime(3, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(master);

  osc.start(now);
  osc.stop(now + duration + 0.05);
}

// Built-in Synthesizer Chiptune Sequencer Presets
export const BUILT_IN_CHIPTUNE_PRESETS = [
  {
    id: 'save-menu-theme',
    name: 'Memory Card: Save Menu Theme',
    bpm: 110,
    mood: 'Mysterious, atmospheric, peaceful save sanctuary',
    tags: ['8-bit', 'Save Menu', 'Synthwave', 'Tranquil', 'Loop'],
    pattern: {
      pulse1: [
        // Lead arpeggio & melody
        ['E4', 0, 0.5], ['G4', 0.5, 0.5], ['B4', 1.0, 0.5], ['E5', 1.5, 0.5],
        ['D5', 2.0, 0.5], ['B4', 2.5, 0.5], ['G4', 3.0, 0.5], ['A4', 3.5, 0.5],
        ['C5', 4.0, 0.5], ['E5', 4.5, 0.5], ['G5', 5.0, 0.5], ['B5', 5.5, 0.5],
        ['A5', 6.0, 1.0], ['G5', 7.0, 1.0],
        ['F#4', 8.0, 0.5], ['A4', 8.5, 0.5], ['C5', 9.0, 0.5], ['D5', 9.5, 0.5],
        ['E5', 10.0, 1.0], ['D5', 11.0, 1.0], ['B4', 12.0, 1.5], ['G4', 13.5, 0.5],
        ['E4', 14.0, 2.0]
      ],
      pulse2: [
        // Counter-melody / 16-bit neon chords
        ['B3', 0, 1.5], ['E4', 1.5, 1.5], ['G4', 3.0, 1.0],
        ['A3', 4.0, 1.5], ['C4', 5.5, 1.5], ['E4', 7.0, 1.0],
        ['D4', 8.0, 1.5], ['F#4', 9.5, 1.5], ['A4', 11.0, 1.0],
        ['B3', 12.0, 2.0], ['D#4', 14.0, 2.0]
      ],
      triangle: [
        // Warm sub-bassline
        ['E2', 0, 1.8], ['E2', 2.0, 1.8],
        ['A2', 4.0, 1.8], ['A2', 6.0, 1.8],
        ['D2', 8.0, 1.8], ['D2', 10.0, 1.8],
        ['B2', 12.0, 1.8], ['B2', 14.0, 1.8]
      ],
      noise: [
        // Gentle 8-bit soft kick/hat cadence
        ['N_HAT', 0, 0.2], ['N_HAT', 1, 0.2], ['N_SNARE', 2, 0.2], ['N_HAT', 3, 0.2],
        ['N_HAT', 4, 0.2], ['N_HAT', 5, 0.2], ['N_SNARE', 6, 0.2], ['N_HAT', 7, 0.2],
        ['N_HAT', 8, 0.2], ['N_HAT', 9, 0.2], ['N_SNARE', 10, 0.2], ['N_HAT', 11, 0.2],
        ['N_HAT', 12, 0.2], ['N_HAT', 13, 0.2], ['N_SNARE', 14, 0.2], ['N_ROLL', 15, 0.5]
      ]
    }
  },
  {
    id: 'neon-synthwave-bgm',
    name: 'Cyberpunk Save Point: Neon Synthwave',
    bpm: 120,
    mood: 'Catchy electronic neon melody, driving bass, 16-bit atmosphere',
    tags: ['Neon Synthwave', '16-bit', 'Catchy', 'Electronic', 'Loop'],
    pattern: {
      pulse1: [
        ['A4', 0, 0.5], ['A4', 0.5, 0.5], ['C5', 1.0, 0.5], ['E5', 1.5, 0.5],
        ['D5', 2.0, 1.0], ['C5', 3.0, 0.5], ['B4', 3.5, 0.5],
        ['G4', 4.0, 0.5], ['B4', 4.5, 0.5], ['D5', 5.0, 0.5], ['G5', 5.5, 0.5],
        ['E5', 6.0, 1.5], ['D5', 7.5, 0.5],
        ['F4', 8.0, 0.5], ['A4', 8.5, 0.5], ['C5', 9.0, 0.5], ['F5', 9.5, 0.5],
        ['E5', 10.0, 1.0], ['D5', 11.0, 1.0],
        ['E4', 12.0, 0.5], ['G#4', 12.5, 0.5], ['B4', 13.0, 0.5], ['E5', 13.5, 0.5],
        ['A4', 14.0, 2.0]
      ],
      pulse2: [
        ['E4', 0, 1.0], ['A4', 1.0, 1.0], ['F4', 2.0, 1.0], ['G4', 3.0, 1.0],
        ['D4', 4.0, 1.0], ['G4', 5.0, 1.0], ['C4', 6.0, 1.0], ['E4', 7.0, 1.0],
        ['C4', 8.0, 1.0], ['F4', 9.0, 1.0], ['D4', 10.0, 1.0], ['F4', 11.0, 1.0],
        ['B3', 12.0, 1.0], ['E4', 13.0, 1.0], ['C4', 14.0, 2.0]
      ],
      triangle: [
        ['A2', 0, 0.4], ['A2', 0.5, 0.4], ['A2', 1.0, 0.4], ['A2', 1.5, 0.4],
        ['F2', 2.0, 0.4], ['F2', 2.5, 0.4], ['G2', 3.0, 0.4], ['G2', 3.5, 0.4],
        ['C3', 4.0, 0.4], ['C3', 4.5, 0.4], ['C3', 5.0, 0.4], ['C3', 5.5, 0.4],
        ['E2', 6.0, 0.4], ['E2', 6.5, 0.4], ['G2', 7.0, 0.4], ['G2', 7.5, 0.4],
        ['F2', 8.0, 0.4], ['F2', 8.5, 0.4], ['F2', 9.0, 0.4], ['F2', 9.5, 0.4],
        ['D2', 10.0, 0.4], ['D2', 10.5, 0.4], ['D2', 11.0, 0.4], ['D2', 11.5, 0.4],
        ['E2', 12.0, 0.4], ['E2', 12.5, 0.4], ['E2', 13.0, 0.4], ['E2', 13.5, 0.4],
        ['A2', 14.0, 1.8]
      ],
      noise: [
        ['N_KICK', 0, 0.2], ['N_HAT', 0.5, 0.1], ['N_SNARE', 1.0, 0.2], ['N_HAT', 1.5, 0.1],
        ['N_KICK', 2.0, 0.2], ['N_HAT', 2.5, 0.1], ['N_SNARE', 3.0, 0.2], ['N_HAT', 3.5, 0.1],
        ['N_KICK', 4.0, 0.2], ['N_HAT', 4.5, 0.1], ['N_SNARE', 5.0, 0.2], ['N_HAT', 5.5, 0.1],
        ['N_KICK', 6.0, 0.2], ['N_HAT', 6.5, 0.1], ['N_SNARE', 7.0, 0.2], ['N_HAT', 7.5, 0.1],
        ['N_KICK', 8.0, 0.2], ['N_HAT', 8.5, 0.1], ['N_SNARE', 9.0, 0.2], ['N_HAT', 9.5, 0.1],
        ['N_KICK', 10.0, 0.2], ['N_HAT', 10.5, 0.1], ['N_SNARE', 11.0, 0.2], ['N_HAT', 11.5, 0.1],
        ['N_KICK', 12.0, 0.2], ['N_HAT', 12.5, 0.1], ['N_SNARE', 13.0, 0.2], ['N_HAT', 13.5, 0.1],
        ['N_KICK', 14.0, 0.2], ['N_HAT', 14.5, 0.1], ['N_SNARE', 15.0, 0.2], ['N_ROLL', 15.5, 0.4]
      ]
    }
  },
  {
    id: 'mysterious-dungeon-save',
    name: 'Crystal Cavern: Mysterious 16-Bit Haven',
    bpm: 104,
    mood: 'Atmospheric crystalline echo, suspenseful yet peaceful haven',
    tags: ['Mysterious', 'Atmospheric', '16-bit BGM', 'Chiptune', 'Loop'],
    pattern: {
      pulse1: [
        ['D5', 0, 0.5], ['F5', 0.5, 0.5], ['A5', 1.0, 0.5], ['D6', 1.5, 1.0],
        ['C6', 2.5, 0.5], ['A5', 3.0, 0.5], ['F5', 3.5, 0.5],
        ['G5', 4.0, 0.5], ['Bb5', 4.5, 0.5], ['D6', 5.0, 1.0], ['C6', 6.0, 1.5],
        ['E5', 8.0, 0.5], ['G5', 8.5, 0.5], ['Bb5', 9.0, 0.5], ['E6', 9.5, 1.0],
        ['D6', 10.5, 0.5], ['Bb5', 11.0, 0.5], ['A5', 11.5, 0.5],
        ['F5', 12.0, 1.0], ['D5', 13.0, 1.0], ['D4', 14.0, 2.0]
      ],
      pulse2: [
        ['A3', 0, 2.0], ['D4', 2.0, 2.0],
        ['Bb3', 4.0, 2.0], ['G3', 6.0, 2.0],
        ['C4', 8.0, 2.0], ['E4', 10.0, 2.0],
        ['D4', 12.0, 2.0], ['F#4', 14.0, 2.0]
      ],
      triangle: [
        ['D2', 0, 3.5], ['G2', 4.0, 3.5],
        ['C2', 8.0, 3.5], ['D2', 12.0, 3.5]
      ],
      noise: [
        ['N_HAT', 0, 0.2], ['N_HAT', 2, 0.2], ['N_HAT', 4, 0.2], ['N_SNARE', 6, 0.2],
        ['N_HAT', 8, 0.2], ['N_HAT', 10, 0.2], ['N_HAT', 12, 0.2], ['N_SNARE', 14, 0.2]
      ]
    }
  }
];

// Chiptune Live Sequencer Player
export class ChiptuneSequencer {
  private isPlaying = false;
  private currentLoopTimer: number | null = null;
  private activeNodes: Array<{ osc?: AudioNode; gain?: GainNode }> = [];
  public currentPresetId: string = 'save-menu-theme';
  public onStepChange?: (beat: number, totalBeats: number) => void;
  public onStateChange?: (playing: boolean) => void;

  public play(presetId?: string) {
    const { ctx, master } = getAudioContext();
    this.stop();

    if (presetId) {
      this.currentPresetId = presetId;
    }

    const preset = BUILT_IN_CHIPTUNE_PRESETS.find(p => p.id === this.currentPresetId) || BUILT_IN_CHIPTUNE_PRESETS[0];
    this.isPlaying = true;
    this.onStateChange?.(true);

    const secondsPerBeat = 60 / preset.bpm;
    const totalBeats = 16;
    const loopDuration = totalBeats * secondsPerBeat;

    const playLoopIteration = () => {
      if (!this.isPlaying) return;

      const startTime = ctx.currentTime + 0.05;

      // Pulse 1 (Lead 8-bit Square)
      preset.pattern.pulse1.forEach(([note, beat, dur]) => {
        const t = startTime + (beat as number) * secondsPerBeat;
        const d = (dur as number) * secondsPerBeat;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(getFreq(note as string), t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(master);

        osc.start(t);
        osc.stop(t + d + 0.02);
        this.activeNodes.push({ osc, gain });
      });

      // Pulse 2 (Harmony / 16-bit Counter Lead)
      preset.pattern.pulse2.forEach(([note, beat, dur]) => {
        const t = startTime + (beat as number) * secondsPerBeat;
        const d = (dur as number) * secondsPerBeat;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(getFreq(note as string), t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(master);

        osc.start(t);
        osc.stop(t + d + 0.02);
        this.activeNodes.push({ osc, gain });
      });

      // Triangle Bassline
      preset.pattern.triangle.forEach(([note, beat, dur]) => {
        const t = startTime + (beat as number) * secondsPerBeat;
        const d = (dur as number) * secondsPerBeat;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(getFreq(note as string), t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.24, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + d);

        osc.connect(gain);
        gain.connect(master);

        osc.start(t);
        osc.stop(t + d + 0.02);
        this.activeNodes.push({ osc, gain });
      });

      // 8-bit Noise Drum Hits
      preset.pattern.noise.forEach(([type, beat, dur]) => {
        const t = startTime + (beat as number) * secondsPerBeat;
        const d = (dur as number) * secondsPerBeat;

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = getNoiseBuffer(ctx);
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        if (type === 'N_KICK') {
          // 8-bit pitch drop kick
          const kickOsc = ctx.createOscillator();
          const kickGain = ctx.createGain();
          kickOsc.type = 'triangle';
          kickOsc.frequency.setValueAtTime(140, t);
          kickOsc.frequency.exponentialRampToValueAtTime(35, t + 0.12);
          kickGain.gain.setValueAtTime(0.3, t);
          kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
          kickOsc.connect(kickGain);
          kickGain.connect(master);
          kickOsc.start(t);
          kickOsc.stop(t + 0.16);
          this.activeNodes.push({ osc: kickOsc, gain: kickGain });
          return;
        } else if (type === 'N_SNARE' || type === 'N_ROLL') {
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1200, t);
          filter.Q.setValueAtTime(1.5, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + d);
        } else {
          // Hi-hat
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(6000, t);
          gain.gain.setValueAtTime(0.08, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        }

        noiseSrc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        noiseSrc.start(t);
        noiseSrc.stop(t + d + 0.05);
        this.activeNodes.push({ osc: noiseSrc, gain });
      });

      // Schedule next loop seamlessly
      this.currentLoopTimer = window.setTimeout(playLoopIteration, loopDuration * 1000 - 40);
    };

    playLoopIteration();
  }

  public stop() {
    this.isPlaying = false;
    if (this.currentLoopTimer) {
      clearTimeout(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
    this.activeNodes.forEach(({ osc, gain }) => {
      try {
        if (gain) gain.gain.setValueAtTime(0.001, (gain.context as AudioContext).currentTime);
        if (osc && (osc as any).stop) (osc as any).stop();
      } catch (e) {
        // ignore already stopped nodes
      }
    });
    this.activeNodes = [];
    this.onStateChange?.(false);
  }

  public getPlaying(): boolean {
    return this.isPlaying;
  }
}

// Global sequencer instance
export const globalSequencer = new ChiptuneSequencer();
