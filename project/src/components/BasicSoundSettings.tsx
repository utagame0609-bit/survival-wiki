import { Music2, Volume2, VolumeX, Waves } from 'lucide-react';
import { playHoverSound, playInputFocusSound } from '@/lib/sound';
import { useSoundSettingsControls } from '@/hooks/useSoundSettingsControls';

export function BasicSoundSettings() {
  const {
    soundEnabled,
    soundVolume,
    masterBgmVolume,
    reverbAmount,
    handleSoundToggle,
    handleVolumeChange,
    handleMasterBgmVolumeChange,
    handleReverbChange,
  } = useSoundSettingsControls();

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
          onFocus={playInputFocusSound}
          onMouseEnter={playHoverSound}
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
          onFocus={playInputFocusSound}
          onMouseEnter={playHoverSound}
          className="w-full cursor-pointer accent-violet-400"
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
              onMouseEnter={playHoverSound}
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
          onFocus={playInputFocusSound}
          onMouseEnter={playHoverSound}
          className="w-full cursor-pointer accent-amber-500"
        />
      </section>
    </>
  );
}
