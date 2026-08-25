/**
 * 16bitレトロ × Nintendo Switch風 Web Audio API サウンドシステム
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Settings
  private masterVolume: number = 0.8;
  private reverbWet: number = 0.35;
  private retroDrive: boolean = false;

  // Loop nodes
  private wikiNoiseNodes: {
    noiseSource: AudioBufferSourceNode;
    humOsc: OscillatorNode;
    chatterInterval: number;
    gain: GainNode;
  } | null = null;

  private isWikiNoiseActive: boolean = false;

  constructor() {
    // AudioContext will be initialized upon user gesture
  }

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.setupMasterGraph();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getContext(): AudioContext {
    return this.init();
  }

  public getAnalyser(): AnalyserNode | null {
    if (!this.analyser && this.ctx) {
      this.setupMasterGraph();
    }
    return this.analyser;
  }

  private setupMasterGraph() {
    if (!this.ctx) return;

    // Master Compressor (Limiter) to prevent clipping
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-4, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(10, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.15, this.ctx.currentTime);

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);

    // Analyser Node for Visualizer
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;

    // Setup Reverb Convolver
    this.reverbNode = this.ctx.createConvolver();
    this.reverbNode.buffer = this.createImpulseResponse(1.8, 2.5);

    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbWet, this.ctx.currentTime);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0 - this.reverbWet * 0.5, this.ctx.currentTime);

    // Setup subtle stereo Delay
    this.delayNode = this.ctx.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.18, this.ctx.currentTime);
    this.delayGain = this.ctx.createGain();
    this.delayGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    const delayFeedback = this.ctx.createGain();
    delayFeedback.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.delayNode.connect(delayFeedback);
    delayFeedback.connect(this.delayNode);

    // Graph routing:
    // [Sources] -> [Dry/Wet]
    // [Dry] -> Compressor -> MasterGain -> Analyser -> Destination
    // [Wet Reverb] -> ReverbNode -> ReverbGain -> Compressor
    // [Wet Delay] -> DelayNode -> DelayGain -> Compressor

    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.compressor);

    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.compressor);

    this.dryGain.connect(this.compressor);

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  /**
   * Procedural Lush Reverb impulse generator (gives Switch-like air & spatial polish)
   */
  private createImpulseResponse(duration: number, decay: number): AudioBuffer {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    const sampleRate = this.ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const factor = Math.pow(1 - t, decay);
      // Soft filtered noise with warm diffusion
      const noiseL = (Math.random() * 2 - 1) * factor;
      const noiseR = (Math.random() * 2 - 1) * factor;
      left[i] = noiseL;
      right[i] = noiseR;
    }
    return impulse;
  }

  // Node connection helper to send to dry, reverb, and delay
  public routeSound(sourceNode: AudioNode, reverbSend: number = 0.25, delaySend: number = 0) {
    if (!this.ctx) this.init();
    if (!this.dryGain || !this.reverbNode || !this.delayNode) this.setupMasterGraph();

    sourceNode.connect(this.dryGain!);

    if (reverbSend > 0 && this.reverbNode) {
      const send = this.ctx!.createGain();
      send.gain.setValueAtTime(reverbSend, this.ctx!.currentTime);
      sourceNode.connect(send);
      send.connect(this.reverbNode);
    }

    if (delaySend > 0 && this.delayNode) {
      const send = this.ctx!.createGain();
      send.gain.setValueAtTime(delaySend, this.ctx!.currentTime);
      sourceNode.connect(send);
      send.connect(this.delayNode);
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.02);
    }
  }

  public setReverbWet(wet: number) {
    this.reverbWet = wet;
    if (this.reverbGain && this.dryGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.02);
      this.dryGain.gain.setTargetAtTime(1.0 - wet * 0.4, this.ctx.currentTime, 0.02);
    }
  }

  public setRetroDrive(enable: boolean) {
    this.retroDrive = enable;
  }

  /* =========================================================================
   * 12 SOUND EFFECTS IMPLEMENTATION (Web Audio API Synthesizer)
   * ========================================================================= */

  /**
   * 1. カーソル移動音: 軽やかな「ピコッ」
   * Short crispy square/pulse chirp jumping quickly to high octave with slight lowpass filter.
   */
  public playCursorMove() {
    const ctx = this.init();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1320, now);
    osc.frequency.exponentialRampToValueAtTime(1980, now + 0.02);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

    osc.connect(filter);
    filter.connect(gain);
    this.routeSound(gain, 0.15, 0);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * 2. 決定・ロード音: 芯のある「ピポッ」
   * Dual distinct tones (F#5 -> B5 / 740Hz -> 1480Hz) with solid attack and smooth sustain.
   */
  public playConfirm() {
    const ctx = this.init();
    const now = ctx.currentTime;

    // Tone 1: First "Pi"
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now); // A5

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc1.connect(gain1);
    this.routeSound(gain1, 0.25, 0.1);
    osc1.start(now);
    osc1.stop(now + 0.06);

    // Tone 2: Second "Po" (Higher & brighter)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1760, now + 0.045); // A6

    gain2.gain.setValueAtTime(0.001, now + 0.045);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc2.connect(gain2);
    this.routeSound(gain2, 0.35, 0.15);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.15);
  }

  /**
   * 3. キャンセル・戻る音: 低めの「ピピッ / ポッ」
   * Downward pitch drop with warm triangle/square blend and rounded filter.
   */
  public playCancel() {
    const ctx = this.init();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(659.25, now); // E5
    osc1.frequency.exponentialRampToValueAtTime(329.63, now + 0.09); // E4

    osc2.frequency.setValueAtTime(659.25, now);
    osc2.frequency.exponentialRampToValueAtTime(329.63, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.09);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);

    this.routeSound(gain, 0.2, 0);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.12);
    osc2.stop(now + 0.12);
  }

  /**
   * 4. 警告・削除音: 重厚な「デンッ / ブブー」
   * Low detuned dual square waves + low sub kick punch + harsh lowpass/distortion character.
   */
  public playWarning() {
    const ctx = this.init();
    const now = ctx.currentTime;

    // Sub thump
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    subOsc.connect(subGain);
    this.routeSound(subGain, 0.1, 0);
    subOsc.start(now);
    subOsc.stop(now + 0.17);

    // Detuned Buzzer Waves
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const buzzFilter = ctx.createBiquadFilter();
    const buzzGain = ctx.createGain();

    oscA.type = 'sawtooth';
    oscB.type = 'square';

    oscA.frequency.setValueAtTime(116.54, now); // Bb2
    oscB.frequency.setValueAtTime(123.47, now); // B2 (dissonant interval)

    buzzFilter.type = 'lowpass';
    buzzFilter.frequency.setValueAtTime(1200, now);
    buzzFilter.Q.setValueAtTime(4, now);

    buzzGain.gain.setValueAtTime(0.001, now);
    buzzGain.gain.linearRampToValueAtTime(0.28, now + 0.008);
    buzzGain.gain.setValueAtTime(0.22, now + 0.12);
    buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    oscA.connect(buzzFilter);
    oscB.connect(buzzFilter);
    buzzFilter.connect(buzzGain);

    this.routeSound(buzzGain, 0.25, 0.1);

    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.3);
    oscB.stop(now + 0.3);
  }

  /**
   * 5. タブ切り替え音: サッとした「ピコッ」
   * Air noise burst + crisp high blip with spatial pan.
   */
  public playTabSwitch() {
    const ctx = this.init();
    const now = ctx.currentTime;

    // High blip
    const osc = ctx.createOscillator();
    const blipGain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);

    blipGain.gain.setValueAtTime(0.001, now);
    blipGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
    blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(blipGain);

    // Filtered noise "Sa"
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(3200, now);
    noiseFilter.Q.setValueAtTime(2.0, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    this.routeSound(blipGain, 0.25, 0.1);
    this.routeSound(noiseGain, 0.2, 0);

    osc.start(now);
    osc.stop(now + 0.06);
    noiseSource.start(now);
    noiseSource.stop(now + 0.05);
  }

  /**
   * 6. モーダル開閉音: トンッ
   * Modern tactile popping thud: Low-mid sine pitch envelope dropping with resonant pop.
   */
  public playModalOpenClose() {
    const ctx = this.init();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    this.routeSound(gain, 0.28, 0);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * 7. キャラセリフ表示音: レトロRPG風の「ポポポポポ…」（テキスト1文字毎のドット音）
   * Precise 16-bit triangle/square chirp with tiny pitch jitter.
   */
  public playDialogueCharacter(pitchOffset: number = 0) {
    const ctx = this.init();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'triangle';
    const baseFreq = 880 + pitchOffset; // A5 +/- variance
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.15, now + 0.025);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(filter);
    filter.connect(gain);
    this.routeSound(gain, 0.15, 0);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * 8. 新規記録音: 爽快な「ピキーン！」
   * Sparkling high-speed resonant crystal glissando (E6 -> A6 -> E7).
   */
  public playNewRecord() {
    const ctx = this.init();
    const now = ctx.currentTime;

    const notes = [1318.51, 1760.0, 2637.02]; // E6, A6, E7
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.03;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, noteTime);
      filter.Q.setValueAtTime(3.5, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (idx === 2 ? 0.45 : 0.12));

      osc.connect(filter);
      filter.connect(gain);
      this.routeSound(gain, 0.45, 0.2);

      osc.start(noteTime);
      osc.stop(noteTime + (idx === 2 ? 0.48 : 0.15));
    });

    // Shimmering sub-tone for brightness
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'triangle';
    sparkleOsc.frequency.setValueAtTime(3520, now + 0.06); // A7
    sparkleGain.gain.setValueAtTime(0.12, now + 0.06);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sparkleOsc.connect(sparkleGain);
    this.routeSound(sparkleGain, 0.5, 0.25);
    sparkleOsc.start(now + 0.06);
    sparkleOsc.stop(now + 0.42);
  }

  /**
   * 9. チェスト開閉音: 木箱が開く「パカッ」
   * Wooden latch knock + rising harmonic chime.
   */
  public playChestOpen() {
    const ctx = this.init();
    const now = ctx.currentTime;

    // 1. Wood knock (Noise pop)
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
    }
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(650, now);
    noiseFilter.Q.setValueAtTime(3.0, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    this.routeSound(noiseGain, 0.2, 0);
    noiseNode.start(now);

    // 2. Wooden body resonance
    const bodyOsc = ctx.createOscillator();
    const bodyGain = ctx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(260, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(130, now + 0.06);
    bodyGain.gain.setValueAtTime(0.32, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    bodyOsc.connect(bodyGain);
    this.routeSound(bodyGain, 0.25, 0);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.08);

    // 3. Crisp pop chime (Paka!)
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = 'square';
    chimeOsc.frequency.setValueAtTime(523.25, now + 0.025); // C5
    chimeOsc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07); // C6
    chimeGain.gain.setValueAtTime(0.001, now + 0.025);
    chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.035);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    chimeOsc.connect(chimeGain);
    this.routeSound(chimeGain, 0.35, 0.1);
    chimeOsc.start(now + 0.025);
    chimeOsc.stop(now + 0.2);
  }

  /**
   * 10. 実績達成音: テンションの上がる「ティロリローン！」
   * 5-step triumphant 16-bit arpeggio fanfare (C5 -> E5 -> G5 -> B5 -> C6 -> E6).
   */
  public playAchievement() {
    const ctx = this.init();
    const now = ctx.currentTime;

    const chords = [
      { freq: 523.25, time: 0, dur: 0.08 },   // C5
      { freq: 659.25, time: 0.06, dur: 0.08 }, // E5
      { freq: 783.99, time: 0.12, dur: 0.08 }, // G5
      { freq: 987.77, time: 0.18, dur: 0.08 }, // B5
      { freq: 1046.5, time: 0.24, dur: 0.55 }, // C6 (long hold)
      { freq: 1318.5, time: 0.26, dur: 0.55 }, // E6 harmony layer
    ];

    chords.forEach((note) => {
      const noteTime = now + note.time;
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, noteTime);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(note.freq * 0.5, noteTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3800, noteTime);

      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.dur);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);

      this.routeSound(gain, 0.45, 0.25);

      osc.start(noteTime);
      subOsc.start(noteTime);
      osc.stop(noteTime + note.dur + 0.05);
      subOsc.stop(noteTime + note.dur + 0.05);
    });
  }

  /**
   * 11. Wiki生成中ノイズ: CRT走査線風の連続環境音「ジー…」（シームレスループ）
   * Filtered periodic buzz + 60Hz hum + micro digital pulses.
   */
  public toggleWikiGeneratingNoise(): boolean {
    if (this.isWikiNoiseActive) {
      this.stopWikiGeneratingNoise();
      return false;
    } else {
      this.startWikiGeneratingNoise();
      return true;
    }
  }

  public getIsWikiNoiseActive(): boolean {
    return this.isWikiNoiseActive;
  }

  public startWikiGeneratingNoise() {
    if (this.isWikiNoiseActive) return;
    const ctx = this.init();
    const now = ctx.currentTime;

    // 1. Noise buffer (1 sec looped buffer with gentle crossfade)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      // CRT-like raster line harmonic noise
      const rasterHarmonic = Math.sin(i * 0.15) * 0.25;
      data[i] = (Math.random() * 2 - 1) * 0.75 + rasterHarmonic;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1450, now);
    noiseFilter.Q.setValueAtTime(2.2, now);

    // 2. 60Hz / 120Hz CRT power hum
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(60, now);

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.setValueAtTime(180, now);

    const masterNoiseGain = ctx.createGain();
    masterNoiseGain.gain.setValueAtTime(0.001, now);
    masterNoiseGain.gain.linearRampToValueAtTime(0.12, now + 0.1);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(masterNoiseGain);

    humOsc.connect(humFilter);
    humFilter.connect(masterNoiseGain);

    this.routeSound(masterNoiseGain, 0.25, 0);

    noiseSource.start(now);
    humOsc.start(now);

    // Random digital chatter pulse every 120ms
    const intervalId = window.setInterval(() => {
      if (!this.isWikiNoiseActive || !this.ctx) return;
      if (Math.random() > 0.45) {
        const pulseOsc = this.ctx.createOscillator();
        const pulseGain = this.ctx.createGain();
        pulseOsc.type = 'square';
        pulseOsc.frequency.setValueAtTime(1800 + Math.random() * 1200, this.ctx.currentTime);
        pulseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.025);
        pulseOsc.connect(pulseGain);
        this.routeSound(pulseGain, 0.1, 0);
        pulseOsc.start(this.ctx.currentTime);
        pulseOsc.stop(this.ctx.currentTime + 0.03);
      }
    }, 90);

    this.wikiNoiseNodes = {
      noiseSource,
      humOsc,
      chatterInterval: intervalId,
      gain: masterNoiseGain,
    };
    this.isWikiNoiseActive = true;
  }

  public stopWikiGeneratingNoise() {
    if (!this.isWikiNoiseActive || !this.wikiNoiseNodes || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.wikiNoiseNodes.gain.gain.linearRampToValueAtTime(0.0001, now + 0.1);
    clearInterval(this.wikiNoiseNodes.chatterInterval);

    setTimeout(() => {
      try {
        this.wikiNoiseNodes?.noiseSource.stop();
        this.wikiNoiseNodes?.humOsc.stop();
        this.wikiNoiseNodes?.noiseSource.disconnect();
        this.wikiNoiseNodes?.humOsc.disconnect();
      } catch {
        // ignore if already stopped
      }
      this.wikiNoiseNodes = null;
      this.isWikiNoiseActive = false;
    }, 120);
  }

  /**
   * 12. Wiki完成音: 冒険の書が完成した感動的な「ピロリロリーン！」
   * Sparkling ascending 8-note harp glissando with layered crystalline delays.
   */
  public playWikiComplete() {
    const ctx = this.init();
    const now = ctx.currentTime;

    // Sparkling 8-note major pentatonic/lydian scale
    const melody = [
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.0,  // A5
      1046.5, // C6
      1174.66,// D6
      1567.98 // G6 (Apex sparkle)
    ];

    melody.forEach((freq, i) => {
      const noteTime = now + i * 0.045;
      const osc = ctx.createOscillator();
      const triangleOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const isLast = i === melody.length - 1;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);

      triangleOsc.type = 'triangle';
      triangleOsc.frequency.setValueAtTime(freq, noteTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4800, noteTime);

      const holdTime = isLast ? 0.8 : 0.2;
      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + holdTime);

      osc.connect(filter);
      triangleOsc.connect(filter);
      filter.connect(gain);

      this.routeSound(gain, 0.5, 0.3);

      osc.start(noteTime);
      triangleOsc.start(noteTime);
      osc.stop(noteTime + holdTime + 0.05);
      triangleOsc.stop(noteTime + holdTime + 0.05);
    });

    // Final resonant bell shimmer
    const bellOsc = ctx.createOscillator();
    const bellGain = ctx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(2093.0, now + 0.35); // C7
    bellGain.gain.setValueAtTime(0.14, now + 0.35);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    bellOsc.connect(bellGain);
    this.routeSound(bellGain, 0.6, 0.35);
    bellOsc.start(now + 0.35);
    bellOsc.stop(now + 1.25);
  }
}

export const soundEngine = new SoundEngine();
