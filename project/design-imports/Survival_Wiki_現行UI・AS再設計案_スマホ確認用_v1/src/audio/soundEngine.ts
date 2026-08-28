import { SoundConfig, WikiStyle } from '../types';

/**
 * Web Audio API 16-Bit Retro Synthesis Sound Engine
 * Zero external audio files. 100% procedural oscillators + residual reverb.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private masterVol = 0.75;
  private reverbWetVal = 0.35;
  private bgmVol = 0.55;
  private seVol = 0.8;
  private isMuted = false;

  private currentBgm: {
    id: string;
    intervalId: number | null;
    timeouts: number[];
  } | null = null;

  public channelState = {
    melody: true,
    arpeggio: true,
    bass: true,
    drums: true,
  };

  private initContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : this.masterVol,
        this.ctx.currentTime
      );
      this.masterGain.connect(this.ctx.destination);

      // Reverb Convolver setup
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.buildImpulseResponse(1.8, 2.2);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(this.reverbWetVal, this.ctx.currentTime);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.dryGain.connect(this.masterGain);
    } catch {
      // AudioContext unavailable in silent environments
    }
  }

  private buildImpulseResponse(duration: number, decay: number): AudioBuffer {
    if (!this.ctx) return {} as AudioBuffer;
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = this.ctx.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i / length;
      const factor = Math.exp(-n * decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return buffer;
  }

  public getConfig(): SoundConfig {
    return {
      masterVolume: this.masterVol,
      reverbWet: this.reverbWetVal,
      bgmVolume: this.bgmVol,
      seVolume: this.seVol,
      muted: this.isMuted,
      channels: { ...this.channelState },
    };
  }

  public setConfig(cfg: SoundConfig) {
    this.masterVol = cfg.masterVolume;
    this.reverbWetVal = cfg.reverbWet;
    this.bgmVol = cfg.bgmVolume;
    this.seVol = cfg.seVolume;
    this.isMuted = cfg.muted;
    this.channelState = { ...cfg.channels };

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.masterVol,
        this.ctx.currentTime,
        0.05
      );
    }
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(
        this.reverbWetVal,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public setMasterVolume(val: number) {
    this.masterVol = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.masterVol, this.ctx.currentTime, 0.05);
    }
  }

  public setReverbWet(val: number) {
    this.reverbWetVal = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(this.reverbWetVal, this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.isMuted ? 0 : this.masterVol,
        this.ctx.currentTime,
        0.05
      );
    }
    return this.isMuted;
  }

  public isSoundMuted() {
    return this.isMuted;
  }

  // --- Sound Effects Synthesizer ---
  public playSe(id: string) {
    this.initContext();
    if (!this.ctx || this.isMuted || this.seVol <= 0) return;

    const t = this.ctx.currentTime;
    const sendToOutput = (node: AudioNode) => {
      if (!this.dryGain || !this.reverbNode) return;
      node.connect(this.dryGain);
      node.connect(this.reverbNode);
    };

    switch (id) {
      case 'hover': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1320, t + 0.035);
        gain.gain.setValueAtTime(this.seVol * 0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
        osc.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.04);
        break;
      }

      case 'confirm': {
        // Crisp 2-tone chime
        [
          { freq: 523.25, time: 0, dur: 0.08 }, // C5
          { freq: 783.99, time: 0.06, dur: 0.18 }, // G5
        ].forEach((note) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(note.freq, t + note.time);
          gain.gain.setValueAtTime(this.seVol * 0.22, t + note.time);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);
          osc.connect(gain);
          sendToOutput(gain);
          osc.start(t + note.time);
          osc.stop(t + note.time + note.dur);
        });
        break;
      }

      case 'cancel': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, t); // E4
        osc.frequency.exponentialRampToValueAtTime(130.81, t + 0.14); // C3
        gain.gain.setValueAtTime(this.seVol * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        osc.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }

      case 'card_open':
      case 'modal_open': {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          const start = t + idx * 0.035;
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(this.seVol * 0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
          osc.connect(gain);
          sendToOutput(gain);
          osc.start(start);
          osc.stop(start + 0.13);
        });
        break;
      }

      case 'modal_close': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, t);
        osc.frequency.exponentialRampToValueAtTime(261.63, t + 0.1);
        gain.gain.setValueAtTime(this.seVol * 0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.11);
        break;
      }

      case 'new_record': {
        // 8-bit victorious item jingle
        const jingle = [
          { f: 440.0, d: 0.07, delay: 0 },
          { f: 554.37, d: 0.07, delay: 0.07 },
          { f: 659.25, d: 0.07, delay: 0.14 },
          { f: 880.0, d: 0.28, delay: 0.21 },
        ];
        jingle.forEach((note) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          const start = t + note.delay;
          osc.frequency.setValueAtTime(note.f, start);
          gain.gain.setValueAtTime(this.seVol * 0.28, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);
          osc.connect(gain);
          sendToOutput(gain);
          osc.start(start);
          osc.stop(start + note.d + 0.02);
        });
        break;
      }

      case 'save': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(587.33, t); // D5
        osc.frequency.setValueAtTime(880.0, t + 0.06); // A5
        gain.gain.setValueAtTime(this.seVol * 0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.26);
        break;
      }

      case 'delete': {
        [
          { f: 293.66, time: 0 },
          { f: 220.0, time: 0.08 },
        ].forEach((note) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          const start = t + note.time;
          osc.frequency.setValueAtTime(note.f, start);
          gain.gain.setValueAtTime(this.seVol * 0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.1);
          osc.connect(gain);
          sendToOutput(gain);
          osc.start(start);
          osc.stop(start + 0.11);
        });
        break;
      }

      case 'type_beep': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        const randPitch = 1200 + Math.random() * 400;
        osc.frequency.setValueAtTime(randPitch, t);
        gain.gain.setValueAtTime(this.seVol * 0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        osc.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.025);
        break;
      }

      case 'wiki_synthesize': {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.45);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(4000, t + 0.45);
        gain.gain.setValueAtTime(this.seVol * 0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
        osc.connect(filter);
        filter.connect(gain);
        sendToOutput(gain);
        osc.start(t);
        osc.stop(t + 0.55);
        break;
      }

      case 'milestone': {
        const fanNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        fanNotes.forEach((f, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const start = t + idx * 0.06;
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(this.seVol * 0.3, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);
          osc.connect(gain);
          sendToOutput(gain);
          osc.start(start);
          osc.stop(start + 0.5);
        });
        break;
      }
    }
  }

  // --- Background Music Synthesizer Loops ---
  public playBgm(rawTrackId: string) {
    this.initContext();

    // Map aliases
    let trackId = rawTrackId;
    if (rawTrackId === 'journal') trackId = 'world_select';
    if (rawTrackId === 'wikipedia') trackId = 'npc_wikipedia';
    if (rawTrackId === 'scp') trackId = 'npc_scp';
    if (rawTrackId === 'ancient') trackId = 'npc_ancient';

    if (this.currentBgm?.id === trackId) return;
    this.stopBgm();

    const timeouts: number[] = [];

    if (trackId === 'world_select') {
      const bpm = 96;
      const beat = 60 / bpm; // 0.625s
      const loopDuration = beat * 16 * 1000;

      const playLoop = () => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const vol = this.bgmVol * 0.18;

        if (this.channelState.bass) {
          const bassPattern = [130.81, 130.81, 146.83, 164.81, 174.61, 164.81, 146.83, 130.81];
          bassPattern.forEach((freq, idx) => {
            if (!this.ctx) return;
            const start = now + idx * beat * 0.5;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(vol * 1.2, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + beat * 0.45);
            osc.connect(gain);
            if (this.dryGain) gain.connect(this.dryGain);
            osc.start(start);
            osc.stop(start + beat * 0.48);
          });
        }

        if (this.channelState.arpeggio) {
          const arpNotes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 261.63, 329.63];
          for (let i = 0; i < 16; i++) {
            const freq = arpNotes[i % arpNotes.length];
            const start = now + i * beat * 0.25;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, start);
            gain.gain.setValueAtTime(vol * 0.4, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + beat * 0.2);
            osc.connect(gain);
            if (this.reverbNode) gain.connect(this.reverbNode);
            if (this.dryGain) gain.connect(this.dryGain);
            osc.start(start);
            osc.stop(start + beat * 0.22);
          }
        }
      };

      playLoop();
      const intervalId = window.setInterval(playLoop, loopDuration);
      this.currentBgm = { id: trackId, intervalId, timeouts };
    } else if (trackId === 'npc_wikipedia') {
      const playBaroque = () => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [220, 261.63, 329.63, 440, 329.63, 261.63, 220, 196];
        notes.forEach((f, idx) => {
          if (!this.ctx) return;
          const start = now + idx * 0.25;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(this.bgmVol * 0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
          osc.connect(gain);
          if (this.reverbNode) gain.connect(this.reverbNode);
          osc.start(start);
          osc.stop(start + 0.4);
        });
      };
      playBaroque();
      const intervalId = window.setInterval(playBaroque, 2000);
      this.currentBgm = { id: trackId, intervalId, timeouts };
    } else if (trackId === 'npc_scp') {
      const playDrone = () => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(this.bgmVol * 0.08, now + 1.0);
        gain.gain.linearRampToValueAtTime(0.001, now + 3.8);
        osc.connect(gain);
        if (this.reverbNode) gain.connect(this.reverbNode);
        osc.start(now);
        osc.stop(now + 4.0);
      };
      playDrone();
      const intervalId = window.setInterval(playDrone, 4000);
      this.currentBgm = { id: trackId, intervalId, timeouts };
    } else if (trackId === 'npc_ancient') {
      const playLute = () => {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const modal = [164.81, 196.0, 246.94, 329.63, 293.66];
        modal.forEach((f, idx) => {
          if (!this.ctx) return;
          const start = now + idx * 0.45;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, start);
          gain.gain.setValueAtTime(this.bgmVol * 0.15, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
          osc.connect(gain);
          if (this.reverbNode) gain.connect(this.reverbNode);
          osc.start(start);
          osc.stop(start + 0.7);
        });
      };
      playLute();
      const intervalId = window.setInterval(playLute, 2500);
      this.currentBgm = { id: trackId, intervalId, timeouts };
    }
  }

  public stopBgm() {
    if (this.currentBgm) {
      if (this.currentBgm.intervalId) {
        clearInterval(this.currentBgm.intervalId);
      }
      this.currentBgm.timeouts.forEach((tid) => clearTimeout(tid));
      this.currentBgm = null;
    }
  }
}

export const soundEngine = new SoundEngine();

// Shortcut helper functions for instant UI sound invocation
export const playHoverSound = () => soundEngine.playSe('hover');
export const playConfirmSound = () => soundEngine.playSe('confirm');
export const playCancelSound = () => soundEngine.playSe('cancel');
export const playCloseSound = () => soundEngine.playSe('cancel');
export const playCardOpenSound = () => soundEngine.playSe('card_open');
export const playNewRecordSound = () => soundEngine.playSe('new_record');
export const playSaveSound = () => soundEngine.playSe('save');
export const playDeleteSound = () => soundEngine.playSe('delete');
export const playTypeBeep = () => soundEngine.playSe('type_beep');
export const playNarratorVoiceSound = (_style: WikiStyle | string) => soundEngine.playSe('type_beep');
export const playWikiSynthesizeSound = () => soundEngine.playSe('wiki_synthesize');
export const playMilestoneSound = () => soundEngine.playSe('milestone');
export const playModalOpenSound = () => soundEngine.playSe('modal_open');
export const playModalCloseSound = () => soundEngine.playSe('modal_close');
