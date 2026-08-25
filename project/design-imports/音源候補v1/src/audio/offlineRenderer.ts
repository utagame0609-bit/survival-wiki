/**
 * Offline Audio Renderer for exporting SE & BGM into pure WAV audio files
 */
import { audioBufferToWav, downloadBlob } from './wavExporter';

// Offline sound synthesis for pristine file downloads
export async function exportSoundToWav(soundId: string, filename: string = `${soundId}.wav`) {
  const sampleRate = 44100;
  let duration = 0.5;

  if (soundId === 'warning') duration = 0.6;
  if (soundId === 'achievement') duration = 1.2;
  if (soundId === 'wiki_complete') duration = 1.8;
  if (soundId === 'new_record') duration = 0.8;
  if (soundId === 'wiki_generating_noise') duration = 4.0; // 4s seamless sample

  const offlineCtx = new OfflineAudioContext(2, Math.floor(sampleRate * duration), sampleRate);

  // Setup simple reverb in offline context
  const reverb = offlineCtx.createConvolver();
  const length = Math.floor(sampleRate * 1.5);
  const impulse = offlineCtx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const factor = Math.pow(1 - i / length, 2.5);
    left[i] = (Math.random() * 2 - 1) * factor;
    right[i] = (Math.random() * 2 - 1) * factor;
  }
  reverb.buffer = impulse;

  const reverbGain = offlineCtx.createGain();
  reverbGain.gain.setValueAtTime(0.3, 0);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.setValueAtTime(0.85, 0);

  reverb.connect(reverbGain);
  reverbGain.connect(offlineCtx.destination);
  dryGain.connect(offlineCtx.destination);

  const route = (node: AudioNode, revSend: number = 0.25) => {
    node.connect(dryGain);
    if (revSend > 0) {
      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(revSend, 0);
      node.connect(send);
      send.connect(reverb);
    }
  };

  const now = 0.01;

  if (soundId === 'cursor_move') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1320, now);
    osc.frequency.exponentialRampToValueAtTime(1980, now + 0.02);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4500, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    osc.connect(filter);
    filter.connect(gain);
    route(gain, 0.15);
    osc.start(now);
    osc.stop(now + 0.05);
  } else if (soundId === 'confirm') {
    const osc1 = offlineCtx.createOscillator();
    const gain1 = offlineCtx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.22, now + 0.004);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc1.connect(gain1);
    route(gain1, 0.25);
    osc1.start(now);
    osc1.stop(now + 0.06);

    const osc2 = offlineCtx.createOscillator();
    const gain2 = offlineCtx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(1760, now + 0.045);
    gain2.gain.setValueAtTime(0.001, now + 0.045);
    gain2.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc2.connect(gain2);
    route(gain2, 0.35);
    osc2.start(now + 0.045);
    osc2.stop(now + 0.15);
  } else if (soundId === 'cancel') {
    const osc = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.09);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);
    osc.connect(filter);
    filter.connect(gain);
    route(gain, 0.2);
    osc.start(now);
    osc.stop(now + 0.12);
  } else if (soundId === 'warning') {
    const subOsc = offlineCtx.createOscillator();
    const subGain = offlineCtx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
    subGain.gain.setValueAtTime(0.35, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    subOsc.connect(subGain);
    route(subGain, 0.1);
    subOsc.start(now);
    subOsc.stop(now + 0.17);

    const oscA = offlineCtx.createOscillator();
    const oscB = offlineCtx.createOscillator();
    const buzzFilter = offlineCtx.createBiquadFilter();
    const buzzGain = offlineCtx.createGain();
    oscA.type = 'sawtooth';
    oscB.type = 'square';
    oscA.frequency.setValueAtTime(116.54, now);
    oscB.frequency.setValueAtTime(123.47, now);
    buzzFilter.type = 'lowpass';
    buzzFilter.frequency.setValueAtTime(1200, now);
    buzzGain.gain.setValueAtTime(0.001, now);
    buzzGain.gain.linearRampToValueAtTime(0.28, now + 0.008);
    buzzGain.gain.setValueAtTime(0.22, now + 0.12);
    buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    oscA.connect(buzzFilter);
    oscB.connect(buzzFilter);
    buzzFilter.connect(buzzGain);
    route(buzzGain, 0.25);
    oscA.start(now);
    oscB.start(now);
    oscA.stop(now + 0.3);
    oscB.stop(now + 0.3);
  } else if (soundId === 'tab_switch') {
    const osc = offlineCtx.createOscillator();
    const blipGain = offlineCtx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.035);
    blipGain.gain.setValueAtTime(0.001, now);
    blipGain.gain.linearRampToValueAtTime(0.18, now + 0.004);
    blipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(blipGain);
    route(blipGain, 0.25);
    osc.start(now);
    osc.stop(now + 0.06);
  } else if (soundId === 'modal_open_close') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();
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
    route(gain, 0.28);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (soundId === 'dialogue_char') {
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1012, now + 0.025);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
    osc.connect(filter);
    filter.connect(gain);
    route(gain, 0.15);
    osc.start(now);
    osc.stop(now + 0.04);
  } else if (soundId === 'new_record') {
    const notes = [1318.51, 1760.0, 2637.02];
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.03;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.24, noteTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + (idx === 2 ? 0.45 : 0.12));
      osc.connect(gain);
      route(gain, 0.45);
      osc.start(noteTime);
      osc.stop(noteTime + (idx === 2 ? 0.48 : 0.15));
    });
  } else if (soundId === 'chest_open') {
    const bodyOsc = offlineCtx.createOscillator();
    const bodyGain = offlineCtx.createGain();
    bodyOsc.type = 'triangle';
    bodyOsc.frequency.setValueAtTime(260, now);
    bodyOsc.frequency.exponentialRampToValueAtTime(130, now + 0.06);
    bodyGain.gain.setValueAtTime(0.32, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    bodyOsc.connect(bodyGain);
    route(bodyGain, 0.25);
    bodyOsc.start(now);
    bodyOsc.stop(now + 0.08);

    const chimeOsc = offlineCtx.createOscillator();
    const chimeGain = offlineCtx.createGain();
    chimeOsc.type = 'square';
    chimeOsc.frequency.setValueAtTime(523.25, now + 0.025);
    chimeOsc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.07);
    chimeGain.gain.setValueAtTime(0.001, now + 0.025);
    chimeGain.gain.linearRampToValueAtTime(0.25, now + 0.035);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    chimeOsc.connect(chimeGain);
    route(chimeGain, 0.35);
    chimeOsc.start(now + 0.025);
    chimeOsc.stop(now + 0.2);
  } else if (soundId === 'achievement') {
    const chords = [
      { freq: 523.25, time: 0, dur: 0.08 },
      { freq: 659.25, time: 0.06, dur: 0.08 },
      { freq: 783.99, time: 0.12, dur: 0.08 },
      { freq: 987.77, time: 0.18, dur: 0.08 },
      { freq: 1046.5, time: 0.24, dur: 0.55 },
      { freq: 1318.5, time: 0.26, dur: 0.55 },
    ];
    chords.forEach((note) => {
      const noteTime = now + note.time;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(note.freq, noteTime);
      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + note.dur);
      osc.connect(gain);
      route(gain, 0.45);
      osc.start(noteTime);
      osc.stop(noteTime + note.dur + 0.05);
    });
  } else if (soundId === 'wiki_generating_noise') {
    // 4s noise sample
    const bufferSize = sampleRate * 4;
    const noiseBuffer = offlineCtx.createBuffer(1, bufferSize, sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const raster = Math.sin(i * 0.15) * 0.25;
      data[i] = (Math.random() * 2 - 1) * 0.75 + raster;
    }
    const noise = offlineCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.Q.setValueAtTime(2.2, now);
    const noiseGain = offlineCtx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noise.connect(filter);
    filter.connect(noiseGain);
    route(noiseGain, 0.2);
    noise.start(now);
    noise.stop(now + 3.9);
  } else if (soundId === 'wiki_complete') {
    const melody = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1567.98];
    melody.forEach((freq, i) => {
      const noteTime = now + i * 0.045;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const isLast = i === melody.length - 1;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteTime);
      const holdTime = isLast ? 0.8 : 0.2;
      gain.gain.setValueAtTime(0.001, noteTime);
      gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + holdTime);
      osc.connect(gain);
      route(gain, 0.5);
      osc.start(noteTime);
      osc.stop(noteTime + holdTime + 0.05);
    });

    const bellOsc = offlineCtx.createOscillator();
    const bellGain = offlineCtx.createGain();
    bellOsc.type = 'sine';
    bellOsc.frequency.setValueAtTime(2093.0, now + 0.35);
    bellGain.gain.setValueAtTime(0.14, now + 0.35);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
    bellOsc.connect(bellGain);
    route(bellGain, 0.6);
    bellOsc.start(now + 0.35);
    bellOsc.stop(now + 1.25);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const blob = audioBufferToWav(renderedBuffer);
  downloadBlob(blob, filename);
}

export async function exportBgmToWav(onProgress?: (percent: number) => void) {
  const sampleRate = 44100;
  const tempo = 96;
  const totalSteps = 192;
  const stepDuration = 60 / (tempo * 4);
  const totalDuration = totalSteps * stepDuration; // 30.00 seconds

  // Render 30s audio
  const offlineCtx = new OfflineAudioContext(2, Math.floor(sampleRate * (totalDuration + 0.5)), sampleRate);

  // Setup Reverb & Compressor
  const comp = offlineCtx.createDynamicsCompressor();
  comp.threshold.setValueAtTime(-4, 0);
  comp.ratio.setValueAtTime(10, 0);

  const reverb = offlineCtx.createConvolver();
  const revLength = Math.floor(sampleRate * 2.0);
  const impulse = offlineCtx.createBuffer(2, revLength, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);
  for (let i = 0; i < revLength; i++) {
    const factor = Math.pow(1 - i / revLength, 2.5);
    left[i] = (Math.random() * 2 - 1) * factor;
    right[i] = (Math.random() * 2 - 1) * factor;
  }
  reverb.buffer = impulse;

  const reverbGain = offlineCtx.createGain();
  reverbGain.gain.setValueAtTime(0.35, 0);

  const dryGain = offlineCtx.createGain();
  dryGain.gain.setValueAtTime(0.85, 0);

  reverb.connect(reverbGain);
  reverbGain.connect(comp);
  dryGain.connect(comp);
  comp.connect(offlineCtx.destination);

  const routeSound = (node: AudioNode, revSend: number = 0.25) => {
    node.connect(dryGain);
    if (revSend > 0) {
      const send = offlineCtx.createGain();
      send.gain.setValueAtTime(revSend, 0);
      node.connect(send);
      send.connect(reverb);
    }
  };

  // Frequencies
  const NOTES: Record<string, number> = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, Gs4: 415.3, A4: 440.0, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, Gs5: 830.61, A5: 880.0, B5: 987.77,
    C6: 1046.5, D6: 1174.66, E6: 1318.51, F6: 1396.91, G6: 1567.98,
  };

  // Schedule all lead, harmony, bass and drums
  const leadEvents = [
    { time: 0, dur: 4, freq: NOTES.A5 }, { time: 4, dur: 4, freq: NOTES.C6 }, { time: 8, dur: 6, freq: NOTES.B5 }, { time: 14, dur: 2, freq: NOTES.A5 },
    { time: 16, dur: 8, freq: NOTES.G5 }, { time: 24, dur: 4, freq: NOTES.E5 }, { time: 28, dur: 4, freq: NOTES.G5 },
    { time: 32, dur: 6, freq: NOTES.G5 }, { time: 38, dur: 2, freq: NOTES.A5 }, { time: 40, dur: 6, freq: NOTES.B5 }, { time: 46, dur: 2, freq: NOTES.C6 },
    { time: 48, dur: 10, freq: NOTES.E6 }, { time: 58, dur: 3, freq: NOTES.D6 }, { time: 61, dur: 3, freq: NOTES.C6 },
    { time: 64, dur: 6, freq: NOTES.F5 }, { time: 70, dur: 2, freq: NOTES.A5 }, { time: 72, dur: 6, freq: NOTES.D6 }, { time: 78, dur: 2, freq: NOTES.C6 },
    { time: 80, dur: 8, freq: NOTES.B5 }, { time: 88, dur: 4, freq: NOTES.C6 }, { time: 92, dur: 4, freq: NOTES.D6 },
    { time: 96, dur: 10, freq: NOTES.E6 }, { time: 106, dur: 3, freq: NOTES.D6 }, { time: 109, dur: 3, freq: NOTES.C6 },
    { time: 112, dur: 12, freq: NOTES.A5 }, { time: 124, dur: 2, freq: NOTES.B5 }, { time: 126, dur: 2, freq: NOTES.C6 },
    { time: 128, dur: 6, freq: NOTES.D6 }, { time: 134, dur: 2, freq: NOTES.E6 }, { time: 136, dur: 6, freq: NOTES.F6 }, { time: 142, dur: 2, freq: NOTES.E6 },
    { time: 144, dur: 8, freq: NOTES.D6 }, { time: 152, dur: 4, freq: NOTES.B5 }, { time: 156, dur: 4, freq: NOTES.Gs5 },
    { time: 160, dur: 6, freq: NOTES.A5 }, { time: 166, dur: 2, freq: NOTES.C6 }, { time: 168, dur: 6, freq: NOTES.E6 }, { time: 174, dur: 2, freq: NOTES.D6 },
    { time: 176, dur: 8, freq: NOTES.C6 }, { time: 184, dur: 4, freq: NOTES.B5 }, { time: 188, dur: 4, freq: NOTES.G5 }
  ];

  leadEvents.forEach((ev) => {
    const time = ev.time * stepDuration;
    const dur = ev.dur * stepDuration;
    const osc = offlineCtx.createOscillator();
    const gain = offlineCtx.createGain();
    const filter = offlineCtx.createBiquadFilter();
    osc.type = 'square';
    osc.frequency.setValueAtTime(ev.freq, time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3600, time);
    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    osc.connect(filter);
    filter.connect(gain);
    routeSound(gain, 0.35);
    osc.start(time);
    osc.stop(time + dur + 0.05);
  });

  // Harmony Chords
  const chords = [
    [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.G5],
    [NOTES.E4, NOTES.G4, NOTES.B4, NOTES.E5], [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5],
    [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.C5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5],
    [NOTES.C4, NOTES.E4, NOTES.G4, NOTES.B4], [NOTES.F4, NOTES.A4, NOTES.C5, NOTES.E5],
    [NOTES.D4, NOTES.F4, NOTES.A4, NOTES.D5], [NOTES.E4, NOTES.Gs4, NOTES.B4, NOTES.D5],
    [NOTES.A4, NOTES.C5, NOTES.E5, NOTES.A5], [NOTES.G4, NOTES.B4, NOTES.D5, NOTES.F5]
  ];

  chords.forEach((chord, barIdx) => {
    const barStart = barIdx * 16;
    for (let s = 0; s < 16; s += 2) {
      const time = (barStart + s) * stepDuration;
      const dur = 2 * stepDuration;
      const freq = chord[(s / 2) % chord.length];
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2600, time);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.08, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur * 0.95);
      osc.connect(filter);
      filter.connect(gain);
      routeSound(gain, 0.25);
      osc.start(time);
      osc.stop(time + dur);
    }
  });

  // Bass
  const bassRoots = [
    NOTES.F3, NOTES.G3, NOTES.E3, NOTES.A3, NOTES.D3, NOTES.G3,
    NOTES.C3, NOTES.F3, NOTES.D3, NOTES.E3, NOTES.A3, NOTES.G3
  ];

  bassRoots.forEach((root, barIdx) => {
    const barStart = barIdx * 16;
    const rhythm = [
      { step: 0, dur: 3, pitch: root }, { step: 4, dur: 2, pitch: root * 2 },
      { step: 6, dur: 3, pitch: root }, { step: 10, dur: 3, pitch: root * 1.5 },
      { step: 14, dur: 2, pitch: root }
    ];
    rhythm.forEach((r) => {
      const time = (barStart + r.step) * stepDuration;
      const dur = r.dur * stepDuration;
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      const filter = offlineCtx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(r.pitch, time);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, time);
      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.28, time + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + dur);
      osc.connect(filter);
      filter.connect(gain);
      routeSound(gain, 0.15);
      osc.start(time);
      osc.stop(time + dur + 0.02);
    });
  });

  // Drums (Kick, Snare, Hat)
  for (let barIdx = 0; barIdx < 12; barIdx++) {
    const barStart = barIdx * 16;
    // Kick
    [0, 8, 14].forEach((s) => {
      const time = (barStart + s) * stepDuration;
      const kickOsc = offlineCtx.createOscillator();
      const kickGain = offlineCtx.createGain();
      kickOsc.type = 'triangle';
      kickOsc.frequency.setValueAtTime(160, time);
      kickOsc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
      kickGain.gain.setValueAtTime(0.4, time);
      kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
      kickOsc.connect(kickGain);
      routeSound(kickGain, 0.1);
      kickOsc.start(time);
      kickOsc.stop(time + 0.15);
    });

    // Snare
    [4, 12].forEach((s) => {
      const time = (barStart + s) * stepDuration;
      const buffer = offlineCtx.createBuffer(1, Math.floor(sampleRate * 0.1), sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sampleRate * 0.02));
      const noise = offlineCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = offlineCtx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(900, time);
      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
      noise.connect(noiseFilter);
      noiseFilter.connect(gain);
      routeSound(gain, 0.25);
      noise.start(time);
      noise.stop(time + 0.11);
    });

    // Hats
    for (let s = 0; s < 16; s += 2) {
      const time = (barStart + s) * stepDuration;
      const buffer = offlineCtx.createBuffer(1, Math.floor(sampleRate * 0.04), sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) data[i] = Math.random() * 2 - 1;
      const noise = offlineCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = offlineCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, time);
      const gain = offlineCtx.createGain();
      gain.gain.setValueAtTime(s % 4 === 0 ? 0.12 : 0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      noise.connect(filter);
      filter.connect(gain);
      routeSound(gain, 0.15);
      noise.start(time);
      noise.stop(time + 0.05);
    }
  }

  if (onProgress) onProgress(40);
  const renderedBuffer = await offlineCtx.startRendering();
  if (onProgress) onProgress(90);
  const blob = audioBufferToWav(renderedBuffer);
  if (onProgress) onProgress(100);
  downloadBlob(blob, 'save_world_select_theme_30s_loop.wav');
}
