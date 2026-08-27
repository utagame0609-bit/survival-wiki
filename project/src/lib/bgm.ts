import { bgmSequencer } from './bgmSequencer';
import { getBgmChannelSettings, subscribeToBgmChannelSettings } from './bgmSettings';
import { soundEngine } from './soundEngine';

const MASTER_BGM_VOLUME = 0.32;
let masterBgmVolume = 1;
let fadeTimerId: number | null = null;
let settingsUnsubscribe: (() => void) | null = null;

function syncChannels(): void {
  bgmSequencer.channels = getBgmChannelSettings();
}

function syncVolume(): void {
  soundEngine.setMasterVolume(MASTER_BGM_VOLUME * masterBgmVolume);
}

export function setMasterBgmVolume(value: number): number {
  masterBgmVolume = Math.max(0, Math.min(1, value));
  syncVolume();
  return masterBgmVolume;
}

export function getMasterBgmVolume(): number {
  return masterBgmVolume;
}

function ensureSettingsSubscription(): void {
  if (settingsUnsubscribe) return;
  syncChannels();
  settingsUnsubscribe = subscribeToBgmChannelSettings((settings) => {
    bgmSequencer.channels = settings;
  });
}

export function playWorldBgm(): void {
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
  const currentVolume = MASTER_BGM_VOLUME * masterBgmVolume;
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