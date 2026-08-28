import { Music2, Volume2, VolumeX, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { loadUserBgmVolume, saveUserBgmVolume, saveUserSoundSettings } from '@/lib/userSoundSettings';
import { getMasterBgmVolume, setMasterBgmVolume } from '@/lib/bgm';
import { getSoundVolume, isSoundEnabled, playToggleSound, setSoundVolume, toggleSound } from '@/lib/sound';

export function BasicSoundSettings() {
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

  return (
    <>
      <section className="border border-slate-800 bg-[#090d16] p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-cyan-400">
            <Music2 className="h-4 w-4" />
            <span>BGM MASTER</span>
          </div>
          <span className="w-10 text-right font-bold text-cyan-300">{masterBgmVolume}%</span>
        </div>
        <input
          id="bgm-master-volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={masterBgmVolume}
          onChange={(event) => handleMasterBgmVolumeChange(Number(event.target.value))}
          className="w-full cursor-pointer accent-cyan-400"
        />
        <p className="text-[10px] leading-4 text-slate-500">ワールド選択画面で再生されるBGM全体の音量です。</p>
      </section>

      <section className="border border-violet-500/30 bg-[#090d16] p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-violet-400">
            <Waves className="h-4 w-4" />
            <span>残響リバーブ効果 (REVERB)</span>
          </div>
          <span className="font-bold text-violet-300">{reverbAmount}%</span>
        </div>
        <input
          id="se-reverb"
          type="range"
          min="0"
          max="100"
          step="1"
          value={reverbAmount}
          onChange={(event) => handleReverbChange(Number(event.target.value))}
          disabled={!soundEnabled}
          className="w-full cursor-pointer accent-violet-400 disabled:opacity-40"
        />
        <p className="text-[10px] leading-4 text-slate-500">地下ダンジョンや洞窟のような反響音を付与します。</p>
      </section>

      <section className="border border-slate-800 bg-[#090d16] p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span>SE 効果音音量</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 text-right font-bold text-amber-400">{soundVolume}%</span>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="SEのオンオフ"
              onClick={handleSoundToggle}
              className={`border px-2 py-0.5 text-[10px] font-bold ${soundEnabled ? 'border-slate-700 bg-[#0d1627] text-slate-300' : 'border-red-500 bg-red-950/40 text-red-400'}`}
            >
              {soundEnabled ? 'ACTIVE' : 'MUTED'}
            </button>
          </div>
        </div>
        <input
          id="se-volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={soundVolume}
          onChange={(event) => handleVolumeChange(Number(event.target.value))}
          disabled={!soundEnabled}
          className="w-full cursor-pointer accent-amber-500 disabled:opacity-40"
        />
      </section>
    </>
  );
}
