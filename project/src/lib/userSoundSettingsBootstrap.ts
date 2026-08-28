import { loadUserSoundSettings, loadUserBgmVolume } from './userSoundSettings';
import { setSoundVolume } from './sound';
import { setStoredReverbAmount } from './soundReverb';
import { setMasterBgmVolume } from './bgm';

let initialized = false;

export async function initializeUserSoundSettings(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const [settings, bgmVolume] = await Promise.all([
      loadUserSoundSettings(),
      loadUserBgmVolume(),
    ]);
    setSoundVolume(settings.seVolume);
    setStoredReverbAmount(settings.seReverb / 100);
    setMasterBgmVolume(bgmVolume / 100);
  } catch (error) {
    console.error('Failed to load user sound settings:', error);
  }
}
