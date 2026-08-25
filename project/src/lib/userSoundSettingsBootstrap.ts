import { loadUserSoundSettings } from './userSoundSettings';
import { setSoundVolume } from './sound';
import { setStoredReverbAmount } from './soundReverb';

let initialized = false;

export async function initializeUserSoundSettings(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    const settings = await loadUserSoundSettings();
    setSoundVolume(settings.seVolume);
    setStoredReverbAmount(settings.seReverb / 100);
  } catch (error) {
    console.error('Failed to load user sound settings:', error);
  }
}
