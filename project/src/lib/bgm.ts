import { getSoundVolume, isSoundEnabled } from './sound';
import { bgmSequencer } from './bgmSequencer';
import { getBgmChannelSettings, subscribeToBgmChannelSettings } from './bgmSettings';
import { soundEngine } from './soundEngine';

const MASTER_BGM_VOLUME = 0.32;
let fadeTimerId: number | null = null;
let settingsUnsubscribe: (() => void) | null = null;

function syncChannels(): void {
  bgmSequencer.channels = getBgmChannelSettings();
}

function syncVolume(): void {
  soundEngine.setMasterVolume(isSoundEnabled() ? (getSoundVolume() / 50) * MASTER_BGM_VOLUME : 0);
}

function ensureSettingsSubscription(): void {
  if (settingsUnsubscribe) return;
  syncChannels();
  settingsUnsubscribe = subscribeToBgmChannelSettings((settings) => {
    bgmSequencer.channels = settings;
  });
}

export function playWorldBgm(): void {
  if (!isSoundEnabled()) return;
  ensureSettingsSubscription();
  if (fadeTimerId !== null) {
    window.clearTimeout(fadeTimerId);
    fadeTimerId = null;
  }
  syncVolume();
  bgmSequencer.play();
}

export function stopWorldBgm(fadeMs = 300): void {
  if (fadeTimerId !== null) window.clearTimeout(fadeTimerId);
  const currentVolume = (getSoundVolume() / 50) * MASTER_BGM_VOLUME;
  const ctx = soundEngine.getContext();
  const steps = Math.max(1, Math.ceil(fadeMs / 30));
  const stepMs = fadeMs / steps;
  let step = 0;

  if (ctx.state === 'suspended') void ctx.resume();
  soundEngine.setMasterVolume(currentVolume);

  const fade = () => {
    step += 1;
    const ratio = Math.max(0, 1 - step / steps);
    soundEngine.setMasterVolume(currentVolume * ratio);
    if (step >= steps) {
      bgmSequencer.stop();
      soundEngine.setMasterVolume(0);
      fadeTimerId = null;
      return;
    }
    fadeTimerId = window.setTimeout(fade, stepMs);
  };

  if (fadeMs <= 0) {
    bgmSequencer.stop();
    soundEngine.setMasterVolume(0);
    fadeTimerId = null;
  } else {
    fadeTimerId = window.setTimeout(fade, stepMs);
  }
}

export function isWorldBgmPlaying(): boolean {
  return bgmSequencer.getIsPlaying();
}

export function getWorldBgmDurationSec(): number {
  return bgmSequencer.getTotalDurationSec();
}
