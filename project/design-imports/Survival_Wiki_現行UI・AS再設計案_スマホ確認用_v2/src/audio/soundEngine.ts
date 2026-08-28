/**
 * 16-Bit Retro Sound Engine using Web Audio API
 * Procedural Synthesis (Square, Triangle, Noise) + Convolution Reverb
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private masterVol = 0.7;
  private seVol = 0.8;
  private bgmVol = 0.5;
  private reverbWet = 0.35;
  private isMuted = false;

  private activeBgmOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private bgmTimer: number | null = null;
  private currentBgmTrack: string | null = null;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Procedural Reverb Impulse Response
      this.reverbNode = this.ctx.createConvolver();
      this.reverbNode.buffer = this.buildImpulseResponse(1.8, 2.5);

      this.reverbGain = this.ctx.createGain();
      this.reverbGain.gain.setValueAtTime(this.reverbWet, this.ctx.currentTime);
      this.reverbNode.connect(this.reverbGain);
      this.reverbGain.connect(this.masterGain);

      this.dryGain = this.ctx.createGain();
      this.dryGain.gain.setValueAtTime(1 - this.reverbWet, this.ctx.currentTime);
      this.dryGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API could not initialize:', e);
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private buildImpulseResponse(duration: number, decay: number): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const factor = Math.pow(1 - t, decay);
      left[i] = (Math.random() * 2 - 1) * factor;
      right[i] = (Math.random() * 2 - 1) * factor;
    }
    return impulse;
  }

  public setMasterVolume(v: number) {
    this.masterVol = Math.max(0, Math.min(1, v));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
  }

  public setSeVolume(v: number) {
    this.seVol = Math.max(0, Math.min(1, v));
  }

  public setBgmVolume(v: number) {
    this.bgmVol = Math.max(0, Math.min(1, v));
  }

  public setReverbWet(w: number) {
    this.reverbWet = Math.max(0, Math.min(1, w));
    if (this.reverbGain && this.dryGain && this.ctx) {
      this.reverbGain.gain.setValueAtTime(this.reverbWet, this.ctx.currentTime);
      this.dryGain.gain.setValueAtTime(1 - this.reverbWet, this.ctx.currentTime);
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVol, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted() {
    return this.isMuted;
  }

  // --- Procedural Sound Effects ---

  public playConfirm() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.12); // G5

    gain.gain.setValueAtTime(0.18 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.dryGain);
    if (this.reverbNode) gain.connect(this.reverbNode);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playCancel() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.setValueAtTime(349.23, now + 0.07); // F4

    gain.gain.setValueAtTime(0.15 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playHover() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.04 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playSaveLog() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Chime (Level up / Quest Complete chord)
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.12 * this.seVol, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.4);

      osc.connect(gain);
      gain.connect(this.dryGain!);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.45);
    });
  }

  public playShutter() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Mechanical snap + noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.dryGain);

    whiteNoise.start(now);
  }

  public playDelete() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.2 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playPageTurn() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);

    gain.gain.setValueAtTime(0.08 * this.seVol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.dryGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWikiCompile() {
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Magical Synth Sequence
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.12 * this.seVol, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(this.dryGain!);
      if (this.reverbNode) gain.connect(this.reverbNode);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.4);
    });
  }

  // --- Procedural BGM Engine ---

  public stopBgm() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.activeBgmOscillators.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.setValueAtTime(gain.gain.value, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
          osc.stop(this.ctx.currentTime + 0.12);
        }
      } catch {}
    });
    this.activeBgmOscillators = [];
    this.currentBgmTrack = null;
  }

  public playBgm(trackId: 'world-select' | 'wikipedia' | 'scp' | 'ancient') {
    if (this.currentBgmTrack === trackId) return;
    this.stopBgm();
    this.ensureContext();
    if (!this.ctx || !this.dryGain || this.isMuted) return;

    this.currentBgmTrack = trackId;

    let step = 0;
    const bpm = trackId === 'scp' ? 84 : trackId === 'ancient' ? 76 : 102;
    const intervalMs = (60 / bpm / 2) * 1000; // 8th notes

    // Melody / Bass sequences
    const sequences: Record<string, { melody: number[]; bass: number[] }> = {
      'world-select': {
        // Nostalgic Adventurer Theme (C Major / A Minor)
        melody: [523, 659, 784, 1046, 784, 659, 880, 784, 523, 587, 659, 784, 659, 587, 523, 0],
        bass: [130, 0, 130, 0, 110, 0, 110, 0, 146, 0, 146, 0, 130, 0, 196, 0],
      },
      wikipedia: {
        // Academic & Scholarly Baroque
        melody: [440, 523, 659, 880, 523, 659, 587, 659, 440, 493, 523, 659, 523, 493, 440, 0],
        bass: [110, 110, 130, 130, 146, 146, 110, 110],
      },
      scp: {
        // Cyber Industrial Drone & Morse Pulse
        melody: [220, 0, 220, 220, 0, 330, 0, 293, 220, 0, 220, 0, 440, 0, 330, 0],
        bass: [55, 55, 55, 55, 65, 65, 55, 55],
      },
      ancient: {
        // Mystical Lute & Ruin Hymn
        melody: [330, 392, 440, 523, 440, 392, 330, 293, 330, 440, 523, 659, 523, 440, 330, 0],
        bass: [82, 0, 82, 0, 110, 0, 110, 0, 73, 0, 73, 0, 82, 0, 82, 0],
      },
    };

    const currentSeq = sequences[trackId] || sequences['world-select'];

    this.bgmTimer = window.setInterval(() => {
      if (!this.ctx || !this.dryGain || this.isMuted) return;
      const now = this.ctx.currentTime;

      const melFreq = currentSeq.melody[step % currentSeq.melody.length];
      const bassFreq = currentSeq.bass[step % currentSeq.bass.length];

      // Play melody note
      if (melFreq > 0) {
        const mOsc = this.ctx.createOscillator();
        const mGain = this.ctx.createGain();
        mOsc.type = trackId === 'ancient' ? 'triangle' : 'square';
        mOsc.frequency.setValueAtTime(melFreq, now);

        mGain.gain.setValueAtTime(0.045 * this.bgmVol, now);
        mGain.gain.exponentialRampToValueAtTime(0.0001, now + (intervalMs / 1000) * 0.9);

        mOsc.connect(mGain);
        mGain.connect(this.dryGain);
        if (this.reverbNode) mGain.connect(this.reverbNode);

        mOsc.start(now);
        mOsc.stop(now + intervalMs / 1000);
      }

      // Play bass note
      if (bassFreq > 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bassFreq, now);

        bGain.gain.setValueAtTime(0.07 * this.bgmVol, now);
        bGain.gain.exponentialRampToValueAtTime(0.0001, now + (intervalMs / 1000) * 1.4);

        bOsc.connect(bGain);
        bGain.connect(this.dryGain);

        bOsc.start(now);
        bOsc.stop(now + (intervalMs / 1000) * 1.5);
      }

      step++;
    }, intervalMs);
  }
}

export const sound = new SoundEngine();
