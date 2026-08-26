import { useState, useEffect } from 'react';
import { Settings, X, Volume2, Music, Waves, Disc, RotateCcw, Monitor } from 'lucide-react';
import { getSoundVolume, setSoundVolume, getSoundMuted, setSoundMuted, playConfirmSound, playCancelSound, playModalOpenSound, playModalCloseSound } from '@/lib/sound';
import { getBgmVolume, setBgmVolume, getBgmMuted, setBgmMuted } from '@/lib/bgm';
import { getStoredReverbAmount, setStoredReverbAmount } from '@/lib/soundReverb';
import { resetAllDemoData } from '@/lib/db';

export function SettingsButton({ onOpenSoundStudio }: { onOpenSoundStudio?: () => void }) {
  const [open, setOpen] = useState(false);
  const [seVol, setSeVol] = useState(Math.round(getSoundVolume() * 100));
  const [bgmVol, setBgmVol] = useState(Math.round(getBgmVolume() * 100));
  const [reverb, setReverb] = useState(Math.round(getStoredReverbAmount() * 100));
  const [seMuted, setSeMutedState] = useState(getSoundMuted());
  const [bgmMuted, setBgmMutedState] = useState(getBgmMuted());
  const [showScanlines, setShowScanlines] = useState(true);

  useEffect(() => {
    const handleStorage = () => {
      setReverb(Math.round(getStoredReverbAmount() * 100));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleOpen = () => {
    playModalOpenSound();
    setOpen(true);
  };

  const handleClose = () => {
    playModalCloseSound();
    setOpen(false);
  };

  const handleSeChange = (val: number) => {
    setSeVol(val);
    setSoundVolume(val / 100);
    playConfirmSound();
  };

  const handleBgmChange = (val: number) => {
    setBgmVol(val);
    setBgmVolume(val / 100);
  };

  const handleReverbChange = (val: number) => {
    setReverb(val);
    setStoredReverbAmount(val / 100);
  };

  const toggleSeMute = () => {
    const next = !seMuted;
    setSeMutedState(next);
    setSoundMuted(next);
    if (!next) playConfirmSound();
  };

  const toggleBgmMute = () => {
    const next = !bgmMuted;
    setBgmMutedState(next);
    setBgmMuted(next);
  };

  const handleLaunchStudio = () => {
    playConfirmSound();
    setOpen(false);
    if (onOpenSoundStudio) {
      onOpenSoundStudio();
    } else {
      window.dispatchEvent(new CustomEvent('survival-wiki:open-sound-studio'));
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="システム＆音響設定"
        title="システム設定 (SE / BGM / Reverb)"
        className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-40 p-3 bg-[#070c18] border-2 border-amber-500/80 text-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.3)] hover:bg-amber-500 hover:text-black active:scale-95 transition-all cursor-pointer"
      >
        <Settings className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-mono text-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="relative w-full max-w-md bg-[#0a1120] border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1627] border-b-2 border-[#1a2333]">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold text-amber-400 tracking-wider">
                  SYSTEM CONFIG // システム＆音響設定
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* SE Volume */}
              <div className="p-3.5 bg-[#070c18] border border-[#1a2333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Volume2 className="w-4 h-4" />
                    <span>SE 効果音音量</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSeMute}
                      className={`px-2 py-0.5 text-[10px] border ${
                        seMuted
                          ? 'border-red-500 bg-red-950/40 text-red-400'
                          : 'border-slate-700 bg-[#0d1627] text-slate-300'
                      }`}
                    >
                      {seMuted ? 'MUTED' : 'ACTIVE'}
                    </button>
                    <span className="text-amber-400 font-bold w-9 text-right">{seVol}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={seVol}
                  onChange={(e) => handleSeChange(Number(e.target.value))}
                  disabled={seMuted}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* BGM Volume */}
              <div className="p-3.5 bg-[#070c18] border border-[#1a2333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Music className="w-4 h-4" />
                    <span>BGM 音楽音量</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleBgmMute}
                      className={`px-2 py-0.5 text-[10px] border ${
                        bgmMuted
                          ? 'border-red-500 bg-red-950/40 text-red-400'
                          : 'border-slate-700 bg-[#0d1627] text-slate-300'
                      }`}
                    >
                      {bgmMuted ? 'MUTED' : 'ACTIVE'}
                    </button>
                    <span className="text-cyan-300 font-bold w-9 text-right">{bgmVol}%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={bgmVol}
                  onChange={(e) => handleBgmChange(Number(e.target.value))}
                  disabled={bgmMuted}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Reverb */}
              <div className="p-3.5 bg-[#070c18] border border-[#1a2333] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Waves className="w-4 h-4" />
                    <span>残響リバーブ効果 (REVERB)</span>
                  </div>
                  <span className="text-amber-300 font-bold">{reverb}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reverb}
                  onChange={(e) => handleReverbChange(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  地下ダンジョンや洞窟のような反響音を付与します。
                </p>
              </div>

              {/* CRT Scanline Toggle */}
              <div className="p-3.5 bg-[#070c18] border border-[#1a2333] flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300 font-bold">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  <span>CRT 走査線エフェクト</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowScanlines(!showScanlines)}
                  className={`px-3 py-1 text-xs font-bold border ${
                    showScanlines
                      ? 'border-emerald-400 bg-emerald-950/40 text-emerald-400'
                      : 'border-slate-700 bg-[#0d1627] text-slate-400'
                  }`}
                >
                  {showScanlines ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Sound Studio Link */}
              <button
                type="button"
                onClick={handleLaunchStudio}
                className="w-full py-2.5 bg-[#070c18] border border-cyan-500/60 text-cyan-300 font-bold hover:bg-cyan-950/40 hover:border-cyan-400 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-pointer"
              >
                <Disc className="w-4 h-4 text-cyan-400" />
                <span>サウンド開発コンソール (Sound Studio) を開く</span>
              </button>

              {/* Reset Demo Data */}
              <div className="pt-2 border-t border-[#1a2333]">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('初期デモデータに復元しますか？（現在のデータは初期化されます）')) {
                      resetAllDemoData();
                    }
                  }}
                  className="w-full py-2 bg-red-950/30 border border-red-800 text-red-400 hover:bg-red-900/40 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>初期デモデータにリセット</span>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#0d1627] border-t border-[#1a2333] flex justify-end">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-1.5 bg-amber-500 text-black font-bold border-b-2 border-amber-700 hover:bg-amber-400 text-xs cursor-pointer"
              >
                完了 (OK)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
