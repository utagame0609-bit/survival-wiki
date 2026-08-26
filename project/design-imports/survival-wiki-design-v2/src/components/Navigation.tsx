import React from 'react';
import { ChevronLeft, Volume2, VolumeX, Settings } from 'lucide-react';
import { playCancelSound, playToggleSound, getSoundMuted, setSoundMuted } from '@/lib/sound';
import { getBgmMuted, setBgmMuted } from '@/lib/bgm';

export type ScreenState =
  | { name: 'worldList'; gameId: string; gameName: string }
  | { name: 'worldCreate'; gameId: string; gameName: string; worldId?: string }
  | { name: 'world'; worldId: string; worldName: string }
  | { name: 'soundStudio' };

export type NavigateFn = (screen: ScreenState) => void;

export function Header({
  title,
  onBack,
  rightElement,
}: {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}) {
  const [muted, setMuted] = React.useState(getSoundMuted() && getBgmMuted());

  const toggleAllAudio = () => {
    playToggleSound();
    const nextMuted = !muted;
    setMuted(nextMuted);
    setSoundMuted(nextMuted);
    setBgmMuted(nextMuted);
  };

  return (
    <header className="sticky top-0 z-40 min-h-[52px] sm:min-h-[56px] border-b-2 border-amber-500/60 bg-[#1a1e29] flex items-center justify-between px-3 sm:px-6 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#12151d] border border-amber-500/50 text-xs sm:text-sm font-bold text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all shrink-0 cursor-pointer min-h-[40px]"
            aria-label="戻る"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            <span className="font-bold">戻る</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            <span className="text-amber-400 text-sm font-black font-mono">U</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-white font-bold tracking-wide text-xs sm:text-sm truncate">
              {title}
            </h1>
            <p className="text-[10px] text-emerald-400 font-bold opacity-90 truncate hidden sm:block font-mono">
              SYSTEM STATUS: NOMINAL // BUFFER: STABLE
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4 text-xs shrink-0">
        <div className="hidden lg:flex items-center gap-4 font-mono text-[10px]">
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-[8px] uppercase">MEMORY USAGE</span>
            <span className="text-amber-400 font-bold">12.4 / 64 MB</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-700" />
          <div className="flex flex-col items-end">
            <span className="text-slate-400 text-[8px] uppercase">WIKI_SYNC</span>
            <span className="text-emerald-400 font-bold">CONNECTED</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-700" />
        </div>

        <button
          type="button"
          onClick={toggleAllAudio}
          className={`min-h-[40px] px-2.5 py-1.5 sm:px-3 border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
            muted
              ? 'border-red-500/50 bg-red-950/40 text-red-300'
              : 'border-slate-700 bg-[#12151d] text-slate-200 hover:border-amber-500 hover:text-amber-400'
          }`}
          title={muted ? 'サウンドON' : 'サウンドOFF'}
          aria-label={muted ? 'サウンドON' : 'サウンドOFF'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span className="hidden sm:inline text-[11px] font-bold">{muted ? 'MUTED' : 'AUDIO'}</span>
        </button>

        {rightElement}
      </div>
    </header>
  );
}
