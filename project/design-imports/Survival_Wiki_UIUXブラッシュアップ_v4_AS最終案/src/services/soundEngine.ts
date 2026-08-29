import { AudioSettings } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbGain: GainNode | null = null;
  private settings: AudioSettings = {
    masterVolume: 0.7,
    reverbLevel: 0.3,
    isMuted: false,
    seVolume: 0.8,
    seEnabled: true,
    bgmChannels: {
      ch1: true,
      ch2: true,
      ch3: true,
      ch4: true,
    },
  };

  private isBgmPlaying = false;
  private bgmIntervalId: any = null;

  constructor() {
    // Lazy AudioContext initialization
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.reverbGain = this.ctx.createGain();
        
        const effectiveVolume = this.settings.isMuted ? 0 : this.settings.masterVolume;
        this.masterGain.gain.setValueAtTime(effectiveVolume, this.ctx.currentTime);
        this.reverbGain.gain.setValueAtTime(this.settings.reverbLevel, this.ctx.currentTime);

        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(val: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.settings.isMuted) {
      this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.ctx.currentTime);
    }
  }

  public setReverbLevel(val: number) {
    this.settings.reverbLevel = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(this.settings.reverbLevel, this.ctx.currentTime);
    }
  }

  public setBgmChannel(channel: 'ch1' | 'ch2' | 'ch3' | 'ch4', active: boolean) {
    this.settings.bgmChannels[channel] = active;
  }

  public mute() {
    this.settings.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }

  public unmute() {
    this.settings.isMuted = false;
    this.initCtx();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.settings.masterVolume, this.ctx.currentTime);
    }
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.masterGain && this.ctx) {
      const vol = this.settings.isMuted ? 0 : this.settings.masterVolume;
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public playTone(freq: number, type: OscillatorType, duration: number, delay = 0, gainLevel = 0.2) {
    if (this.settings.isMuted || !this.settings.seEnabled) return;
    this.initCtx();
    if (!this.ctx || !this.masterGain) return;

    try {
      const startTime = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const effectiveGain = gainLevel * this.settings.seVolume;
      gain.gain.setValueAtTime(effectiveGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // safe fallback
    }
  }

  // Play from 28 retro sound effects
  public playSe(effectName: string) {
    if (this.settings.isMuted || !this.settings.seEnabled) return;
    this.initCtx();

    switch (effectName) {
      // 1. Menu & System
      case 'menu_select':
        this.playTone(440, 'square', 0.05, 0, 0.15);
        this.playTone(880, 'square', 0.08, 0.04, 0.2);
        break;

      case 'menu_cursor':
        this.playTone(520, 'square', 0.03, 0, 0.1);
        break;

      case 'menu_back':
        this.playTone(660, 'square', 0.05, 0, 0.15);
        this.playTone(330, 'square', 0.08, 0.04, 0.15);
        break;

      case 'tab_switch':
        this.playTone(700, 'sine', 0.04, 0, 0.15);
        this.playTone(900, 'sine', 0.06, 0.03, 0.2);
        break;

      case 'danger_delete':
        this.playTone(220, 'sawtooth', 0.1, 0, 0.25);
        this.playTone(180, 'sawtooth', 0.15, 0.08, 0.3);
        break;

      case 'copy_success':
        this.playTone(880, 'sine', 0.05, 0, 0.15);
        this.playTone(1320, 'sine', 0.1, 0.05, 0.2);
        break;

      case 'sys_error':
        this.playTone(200, 'sawtooth', 0.08, 0, 0.2);
        this.playTone(150, 'sawtooth', 0.12, 0.06, 0.2);
        break;

      case 'sys_toggle':
        this.playTone(600, 'square', 0.04, 0, 0.15);
        break;

      // 2. Exploration & Record
      case 'new_record':
        this.playTone(392, 'square', 0.06, 0, 0.2);
        this.playTone(587.33, 'square', 0.06, 0.05, 0.2);
        this.playTone(880, 'square', 0.15, 0.1, 0.25);
        break;

      case 'save_record':
        this.playTone(523.25, 'triangle', 0.08, 0, 0.2); // C5
        this.playTone(659.25, 'triangle', 0.08, 0.06, 0.2); // E5
        this.playTone(783.99, 'triangle', 0.08, 0.12, 0.2); // G5
        this.playTone(1046.5, 'triangle', 0.2, 0.18, 0.25); // C6
        break;

      case 'chest_open':
        this.playTone(261.63, 'sawtooth', 0.08, 0, 0.15);
        this.playTone(329.63, 'sawtooth', 0.08, 0.07, 0.15);
        this.playTone(392.0, 'sawtooth', 0.08, 0.14, 0.2);
        this.playTone(523.25, 'triangle', 0.25, 0.21, 0.25);
        break;

      case 'photo_shutter':
        this.playTone(800, 'square', 0.02, 0, 0.12);
        this.playTone(300, 'sine', 0.05, 0.03, 0.15);
        break;

      case 'pos_ping':
        this.playTone(1200, 'sine', 0.08, 0, 0.15);
        this.playTone(1500, 'sine', 0.08, 0.05, 0.15);
        break;

      case 'marker_set':
        this.playTone(587.33, 'triangle', 0.06, 0, 0.2);
        this.playTone(880, 'triangle', 0.1, 0.05, 0.2);
        break;

      // 3. Wiki & NPC
      case 'wiki_npc_select':
        this.playTone(440, 'triangle', 0.1, 0, 0.2);
        this.playTone(554.37, 'triangle', 0.1, 0.08, 0.2);
        this.playTone(659.25, 'triangle', 0.2, 0.16, 0.25);
        break;

      case 'compile_start':
        this.playTone(330, 'square', 0.08, 0, 0.15);
        this.playTone(440, 'square', 0.08, 0.06, 0.2);
        this.playTone(660, 'square', 0.15, 0.12, 0.25);
        break;

      case 'typewriter_beep':
        this.playTone(550 + Math.random() * 250, 'square', 0.025, 0, 0.08);
        break;

      case 'wiki_ready':
        this.playTone(523.25, 'triangle', 0.1, 0, 0.2);
        this.playTone(659.25, 'triangle', 0.1, 0.1, 0.2);
        this.playTone(783.99, 'triangle', 0.1, 0.2, 0.2);
        this.playTone(1046.5, 'triangle', 0.35, 0.3, 0.3);
        break;

      case 'speech_bubble':
        this.playTone(480, 'sine', 0.04, 0, 0.15);
        break;

      // 4. Action & Feedback
      case 'share_post':
        this.playTone(659.25, 'triangle', 0.08, 0, 0.2);
        this.playTone(880, 'triangle', 0.12, 0.06, 0.25);
        break;

      case 'search_filter':
        this.playTone(750, 'sine', 0.03, 0, 0.12);
        break;

      case 'level_up':
        this.playTone(392, 'triangle', 0.08, 0, 0.2);
        this.playTone(523.25, 'triangle', 0.08, 0.06, 0.2);
        this.playTone(659.25, 'triangle', 0.08, 0.12, 0.2);
        this.playTone(783.99, 'triangle', 0.2, 0.18, 0.25);
        break;

      case 'quest_clear':
        this.playTone(523.25, 'square', 0.1, 0, 0.2);
        this.playTone(659.25, 'square', 0.1, 0.08, 0.2);
        this.playTone(783.99, 'square', 0.1, 0.16, 0.2);
        this.playTone(1046.5, 'square', 0.3, 0.24, 0.3);
        break;

      case 'time_tick':
        this.playTone(1000, 'sine', 0.015, 0, 0.08);
        break;

      default:
        this.playTone(440, 'square', 0.05, 0, 0.1);
        break;
    }
  }

  // Toggle World 16-bit ambient BGM
  public toggleBgm(play?: boolean) {
    const targetState = play !== undefined ? play : !this.isBgmPlaying;
    if (targetState === this.isBgmPlaying) return;

    if (!targetState) {
      this.isBgmPlaying = false;
      if (this.bgmIntervalId) {
        clearInterval(this.bgmIntervalId);
        this.bgmIntervalId = null;
      }
      return;
    }

    this.initCtx();
    this.isBgmPlaying = true;

    // 16-bit arpeggiated ambient scale
    const melodyNotes = [261.63, 329.63, 392.0, 523.25, 392.0, 329.63, 293.66, 349.23, 440.0, 587.33, 440.0, 349.23];
    const bassNotes = [130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 174.61, 174.61];
    let step = 0;

    this.bgmIntervalId = setInterval(() => {
      if (!this.isBgmPlaying || this.settings.isMuted || !this.settings.seEnabled) return;

      if (this.settings.bgmChannels.ch1) {
        const mFreq = melodyNotes[step % melodyNotes.length];
        this.playTone(mFreq, 'triangle', 0.15, 0, 0.08);
      }

      if (this.settings.bgmChannels.ch3 && step % 2 === 0) {
        const bFreq = bassNotes[Math.floor(step / 2) % bassNotes.length];
        this.playTone(bFreq, 'sawtooth', 0.3, 0, 0.06);
      }

      if (this.settings.bgmChannels.ch4 && step % 4 === 2) {
        this.playTone(80, 'square', 0.04, 0, 0.04);
      }

      step++;
    }, 280);
  }

  public isPlayingBgm(): boolean {
    return this.isBgmPlaying;
  }
}

export const soundEngine = new SoundEngine();
