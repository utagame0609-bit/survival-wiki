import { useEffect, useState } from 'react';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { loadUserBgmVolume, saveUserBgmVolume, saveUserSoundSettings } from '@/lib/userSoundSettings';
import { getMasterBgmVolume, setMasterBgmVolume } from '@/lib/bgm';
import { getSoundVolume, isSoundEnabled, playToggleSound, setSoundVolume, toggleSound } from '@/lib/sound';

export function useSoundSettingsControls() {
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [soundVolume, setSoundVolumeState] = useState(getSoundVolume());
  const [masterBgmVolume, setMasterBgmVolumeState] = useState(Math.round(getMasterBgmVolume() * 100));
  const [reverbAmount, setReverbAmount] = useState(Math.round(getStoredReverbAmount() * 100));

  useEffect(() => {
    let cancelled = false;
    void loadUserBgmVolume()
      .then((value) => {
        if (cancelled) return;
        const normalized = setMasterBgmVolume(value / 100);
        setMasterBgmVolumeState(Math.round(normalized * 100));
      })
      .catch((error) => console.error('Failed to load BGM volume:', error));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => subscribeToReverbAmount((value) => setReverbAmount(Math.round(value * 100))), []);

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
    if (next) playToggleSound();
  };

  const handleVolumeChange = (value: number) => {
    const normalized = setSoundVolume(value);
    setSoundVolumeState(normalized);
    void saveUserSoundSettings({
      seVolume: normalized,
      seReverb: Math.round(getStoredReverbAmount() * 100),
    }).catch((error) => console.error('Failed to save SE volume:', error));
  };

  const handleMasterBgmVolumeChange = (value: number) => {
    const normalized = setMasterBgmVolume(value / 100);
    const nextValue = Math.round(normalized * 100);
    setMasterBgmVolumeState(nextValue);
    void saveUserBgmVolume(nextValue).catch((error) => console.error('Failed to save BGM volume:', error));
  };

  const handleReverbChange = (value: number) => {
    const normalized = setStoredReverbAmount(value / 100);
    setReverbAmount(Math.round(normalized * 100));
    void saveUserSoundSettings({
      seVolume: getSoundVolume(),
      seReverb: Math.round(normalized * 100),
    }).catch((error) => console.error('Failed to save SE reverb:', error));
  };

  return {
    soundEnabled,
    soundVolume,
    masterBgmVolume,
    reverbAmount,
    handleSoundToggle,
    handleVolumeChange,
    handleMasterBgmVolumeChange,
    handleReverbChange,
  };
}
