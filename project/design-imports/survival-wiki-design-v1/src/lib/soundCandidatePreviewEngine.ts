import {
  playConfirmSound,
  playCancelSound,
  playErrorSound,
  playTabSwitchSound,
  playModalOpenSound,
  playSaveSound,
  playChestOpenSound,
} from './sound';
import { getStoredReverbAmount } from './soundReverb';

let previewCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!previewCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      previewCtx = new AudioContextClass();
    }
  }
  if (previewCtx && previewCtx.state === 'suspended') {
    previewCtx.resume().catch(() => {});
  }
  return previewCtx;
}

export function playSoundCandidatePreview(candidateId: string) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const reverb = getStoredReverbAmount();

  switch (candidateId) {
    case 'confirm':
      playConfirmSound();
      break;
    case 'cancel':
      playCancelSound();
      break;
    case 'warning':
      playErrorSound();
      break;
    case 'tab_switch':
      playTabSwitchSound();
      break;
    case 'modal_open_close':
      playModalOpenSound();
      break;
    case 'chest_open':
      playChestOpenSound();
      break;
    case 'dialogue_char': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.setValueAtTime(620, now + 0.015);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    }
    case 'achievement': {
      const notes = [783.99, 1046.50, 1318.51, 1567.98]; // G5, C6, E6, G6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
      break;
    }
    case 'wiki_generating_noise': {
      // 16-bit cyber packet burst
      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800 + i * 240, now + i * 0.06);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.06);
      }
      break;
    }
    case 'wiki_complete': {
      playSaveSound();
      break;
    }
    default:
      playConfirmSound();
      break;
  }
}
