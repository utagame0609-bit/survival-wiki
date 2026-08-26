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
    <header className="sticky top-0 z-40 h-14 border-b-2 border-amber-500/50 bg-[#0a1120] flex items-center justify-between px-3 sm:px-6 shadow-[0_4px_12px_rgba(245,158,11,0.1)]">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onBack && (
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[#070c18] border border-amber-500/40 text-xs font-bold text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 active:scale-95 transition-all shrink-0 font-mono"
            aria-label="戻る"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">BACK</span>
          </button>
        )}

        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
            <span className="text-amber-500 text-sm font-black">U</span>
          </div>
          <div className="min-w-0">
            <h1 className="text-amber-500 font-bold tracking-[0.15em] text-xs sm:text-sm truncate">
              {title}
            </h1>
            <p className="text-[9px] text-emerald-400 font-bold opacity-80 truncate hidden sm:block">
              SYSTEM STATUS: NOMINAL // BUFFER: STABLE
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5 text-[10px] shrink-0 font-mono">
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[8px] uppercase">MEMORY USAGE</span>
            <span className="text-amber-400 font-bold">12.4 / 64 MB</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[8px] uppercase">WIKI_SYNC</span>
            <span className="text-emerald-400 font-bold">CONNECTED</span>
          </div>
          <div className="h-6 w-[1px] bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={toggleAllAudio}
          className={`p-1.5 sm:px-2.5 sm:py-1.5 border text-xs font-mono flex items-center gap-1.5 transition-colors ${
            muted
              ? 'border-red-500/50 bg-red-950/30 text-red-400'
              : 'border-slate-700 bg-[#070c18] text-slate-300 hover:border-amber-500 hover:text-amber-400'
          }`}
          title={muted ? 'サウンドON' : 'サウンドOFF'}
          aria-label={muted ? 'サウンドON' : 'サウンドOFF'}
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span className="hidden sm:inline text-[10px]">{muted ? 'MUTED' : 'AUDIO'}</span>
        </button>

        {rightElement}
      </div>
    </header>
  );
}
