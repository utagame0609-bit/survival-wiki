import React from 'react';
import { ChevronLeft, Home, Shield, Volume2, VolumeX, Sliders, Gamepad2 } from 'lucide-react';
import { useViewMode } from '../context/ViewModeContext';
import { playCancelSound, playHoverSound } from '../lib/soundEngine';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings: () => void;
}

export function Header({
  title,
  onBack,
  onHome,
  onOpenSettings,
}: HeaderProps) {
  const { soundEnabled, toggleSound } = useViewMode();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-amber-500/70 bg-[#0e1629]/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.65)]">
      <div className="mx-auto flex min-h-[52px] sm:min-h-[58px] w-full max-w-5xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* Left: Back button (if inside a world) or App Logo/Icon */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onBack();
              }}
              onMouseEnter={playHoverSound}
              className="flex min-h-[40px] min-w-[40px] sm:min-w-0 shrink-0 items-center justify-center gap-1.5 border-2 border-amber-500/80 bg-[#0a101d] px-2.5 sm:px-3 py-1.5 font-mono text-xs font-black text-amber-300 transition-all hover:border-amber-400 hover:bg-amber-500/20 active:scale-95 cursor-pointer rounded-xs"
              aria-label="戻る"
              title="冒険の書一覧へ戻る"
            >
              <ChevronLeft className="h-4 w-4 stroke-[3]" />
              <span className="text-xs hidden xs:inline">戻る</span>
            </button>
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] rounded-xs">
              <Gamepad2 className="h-4 w-4" />
            </div>
          )}

          {/* Center/Left Title */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xs sm:text-sm font-black tracking-wide text-white flex items-center gap-1.5">
              <span className="text-amber-400 font-mono hidden sm:inline">UTAPEDIA //</span>
              <span className="truncate">{title.replace('UTAPEDIA // ', '')}</span>
            </h1>
            <p className="truncate font-mono text-[9px] font-bold text-emerald-400/90 hidden sm:block">
              ADVENTURE LOG SYSTEM // NOMINAL
            </p>
          </div>
        </div>

        {/* Right Side: Sound, Settings, Home buttons */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              playHoverSound();
              toggleSound();
            }}
            onMouseEnter={playHoverSound}
            title={soundEnabled ? 'サウンドON (クリックでミュート)' : 'ミュート中 (クリックでサウンドON)'}
            className={`flex min-h-[42px] min-w-[42px] items-center justify-center border-2 px-2 font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer rounded-xs ${
              soundEnabled
                ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400 hover:border-emerald-400'
                : 'border-slate-700 bg-[#121622] text-slate-500 hover:text-slate-300'
            }`}
            aria-label="サウンド切替"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => {
              playHoverSound();
              onOpenSettings();
            }}
            onMouseEnter={playHoverSound}
            title="システム設定"
            className="flex min-h-[42px] min-w-[42px] items-center justify-center border-2 border-slate-700 bg-[#121622] px-2 text-slate-300 hover:border-amber-400 hover:text-amber-300 active:scale-95 cursor-pointer rounded-xs"
            aria-label="設定"
          >
            <Sliders className="h-4 w-4" />
          </button>

          {/* Home button (if in world detail) */}
          {onHome && (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onHome();
              }}
              onMouseEnter={playHoverSound}
              aria-label="セーブ画面へ"
              title="冒険の書一覧へ戻る"
              className="flex min-h-[42px] items-center gap-1.5 border-2 border-amber-500/80 bg-[#161a25] px-2.5 sm:px-3 py-1 font-mono text-xs font-black text-amber-400 transition-all hover:border-amber-400 hover:bg-amber-500/25 active:scale-95 cursor-pointer rounded-xs"
            >
              <Home className="h-4 w-4 text-amber-400" />
              <span className="hidden xs:inline">HOME</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
