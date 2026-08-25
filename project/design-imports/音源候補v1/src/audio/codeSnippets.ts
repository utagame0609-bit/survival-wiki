/**
 * Generates standalone Web Audio API code snippets for each sound effect
 */

export function getCodeSnippetForSound(soundId: string): string {
  switch (soundId) {
    case 'cursor_move':
      return `// 1. カーソル移動音: 軽やかな「ピコッ」
function playCursorMove(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

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
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}`;

    case 'confirm':
      return `// 2. 決定・ロード音: 芯のある「ピポッ」
function playConfirm(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  // Tone 1: 880Hz (A5)
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.type = 'square';
  osc1.frequency.setValueAtTime(880, now);
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.linearRampToValueAtTime(0.22, now + 0.004);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.start(now);
  osc1.stop(now + 0.06);

  // Tone 2: 1760Hz (A6)
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.type = 'square';
  osc2.frequency.setValueAtTime(1760, now + 0.045);
  gain2.gain.setValueAtTime(0.001, now + 0.045);
  gain2.gain.linearRampToValueAtTime(0.25, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.start(now + 0.045);
  osc2.stop(now + 0.15);
}`;

    case 'cancel':
      return `// 3. キャンセル・戻る音: 低めの「ピピッ / ポッ」
function playCancel(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(659.25, now); // E5
  osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.09); // E4

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2000, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}`;

    case 'warning':
      return `// 4. 警告・削除音: 重厚な「デンッ / ブブー」
function playWarning(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  // Sub Kick punch
  const subOsc = audioCtx.createOscillator();
  const subGain = audioCtx.createGain();
  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(140, now);
  subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
  subGain.gain.setValueAtTime(0.35, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  subOsc.connect(subGain);
  subGain.connect(audioCtx.destination);
  subOsc.start(now);
  subOsc.stop(now + 0.17);

  // Detuned Buzzers (Dissonant interval)
  const oscA = audioCtx.createOscillator();
  const oscB = audioCtx.createOscillator();
  const buzzFilter = audioCtx.createBiquadFilter();
  const buzzGain = audioCtx.createGain();

  oscA.type = 'sawtooth';
  oscB.type = 'square';
  oscA.frequency.setValueAtTime(116.54, now); // Bb2
  oscB.frequency.setValueAtTime(123.47, now); // B2

  buzzFilter.type = 'lowpass';
  buzzFilter.frequency.setValueAtTime(1200, now);
  buzzGain.gain.setValueAtTime(0.001, now);
  buzzGain.gain.linearRampToValueAtTime(0.28, now + 0.008);
  buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

  oscA.connect(buzzFilter);
  oscB.connect(buzzFilter);
  buzzFilter.connect(buzzGain);
  buzzGain.connect(audioCtx.destination);

  oscA.start(now);
  oscB.start(now);
  oscA.stop(now + 0.3);
  oscB.stop(now + 0.3);
}`;

    case 'tab_switch':
      return `// 5. タブ切り替え音: サッとした「ピコッ」
function playTabSwitch(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const blipGain = audioCtx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(950, now);
  osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);

  blipGain.gain.setValueAtTime(0.001, now);
  blipGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
  blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

  osc.connect(blipGain);
  blipGain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + 0.06);
}`;

    case 'modal_open_close':
      return `// 6. モーダル開閉音: トンッ
function playModalOpenClose(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.13);
}`;

    case 'dialogue_char':
      return `// 7. キャラセリフ表示音: レトロRPG風の「ポポポポポ…」
function playDialogueCharacter(audioCtx: AudioContext, pitchJitter = 0) {
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();

  osc.type = 'triangle';
  const freq = 880 + pitchJitter; // A5
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.025);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3200, now);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}`;

    case 'new_record':
      return `// 8. 新規記録音: 爽快な「ピキーン！」
function playNewRecord(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const notes = [1318.51, 1760.0, 2637.02]; // E6, A6, E7

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.03;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

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
    gain.connect(audioCtx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + (idx === 2 ? 0.48 : 0.15));
  });
}`;

    case 'chest_open':
      return `// 9. チェスト開閉音: 木箱が開く「パカッ」
function playChestOpen(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;

  // Wood Knock Resonance
  const bodyOsc = audioCtx.createOscillator();
  const bodyGain = audioCtx.createGain();
  bodyOsc.type = 'triangle';
  bodyOsc.frequency.setValueAtTime(260, now);
  bodyOsc.frequency.exponentialRampToValueAtTime(130, now + 0.06);
  bodyGain.gain.setValueAtTime(0.32, now);
  bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
  bodyOsc.connect(bodyGain);
  bodyGain.connect(audioCtx.destination);
  bodyOsc.start(now);
  bodyOsc.stop(now + 0.08);

  // Pop Chime
  const chimeOsc = audioCtx.createOscillator();
  const chimeGain = audioCtx.createGain();
  chimeOsc.type = 'square';
  chimeOsc.frequency.setValueAtTime(523.25, now + 0.025); // C5
  chimeOsc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07); // C6
  chimeGain.gain.setValueAtTime(0.001, now + 0.025);
  chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.035);
  chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
  chimeOsc.connect(chimeGain);
  chimeGain.connect(audioCtx.destination);
  chimeOsc.start(now + 0.025);
  chimeOsc.stop(now + 0.2);
}`;

    case 'achievement':
      return `// 10. 実績達成音: テンションの上がる「ティロリローン！」
function playAchievement(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const chords = [
    { freq: 523.25, time: 0, dur: 0.08 },    // C5
    { freq: 659.25, time: 0.06, dur: 0.08 }, // E5
    { freq: 783.99, time: 0.12, dur: 0.08 }, // G5
    { freq: 987.77, time: 0.18, dur: 0.08 }, // B5
    { freq: 1046.5, time: 0.24, dur: 0.55 }, // C6
    { freq: 1318.5, time: 0.26, dur: 0.55 }, // E6
  ];

  chords.forEach((note) => {
    const noteTime = now + note.time;
    const osc = audioCtx.createOscillator();
    const subOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

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
    gain.connect(audioCtx.destination);

    osc.start(noteTime);
    subOsc.start(noteTime);
    osc.stop(noteTime + note.dur + 0.05);
    subOsc.stop(noteTime + note.dur + 0.05);
  });
}`;

    case 'wiki_generating_noise':
      return `// 11. Wiki生成中ノイズ: CRT走査線風の連続環境音「ジー…」（シームレスループ）
function startWikiGeneratingNoise(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    const rasterHarmonic = Math.sin(i * 0.15) * 0.25;
    data[i] = (Math.random() * 2 - 1) * 0.75 + rasterHarmonic;
  }

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(1450, now);
  noiseFilter.Q.setValueAtTime(2.2, now);

  const humOsc = audioCtx.createOscillator();
  humOsc.type = 'sawtooth';
  humOsc.frequency.setValueAtTime(60, now);

  const humFilter = audioCtx.createBiquadFilter();
  humFilter.type = 'lowpass';
  humFilter.frequency.setValueAtTime(180, now);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.1);

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(gain);
  humOsc.connect(humFilter);
  humFilter.connect(gain);
  gain.connect(audioCtx.destination);

  noiseSource.start(now);
  humOsc.start(now);

  return { noiseSource, humOsc, gain };
}`;

    case 'wiki_complete':
      return `// 12. Wiki完成音: 冒険の書が完成した感動的な「ピロリロリーン！」
function playWikiComplete(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  const melody = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1567.98];

  melody.forEach((freq, i) => {
    const noteTime = now + i * 0.045;
    const osc = audioCtx.createOscillator();
    const triangleOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

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
    gain.connect(audioCtx.destination);

    osc.start(noteTime);
    triangleOsc.start(noteTime);
    osc.stop(noteTime + holdTime + 0.05);
    triangleOsc.stop(noteTime + holdTime + 0.05);
  });
}`;

    default:
      return `// Web Audio API Sound Trigger\nconsole.log('Playing sound:', '${soundId}');`;
  }
}
