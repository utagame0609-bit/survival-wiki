import React from 'react';
import { ChevronLeft, Volume2, VolumeX, Settings, Home, Shield, Sparkles, BookOpen } from 'lucide-react';
import { playCancelSound, playHoverSound, soundEngine } from '../audio/soundEngine';

interface NavigationHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  genreTag?: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  title,
  subtitle = 'UTAPEDIA // ADVENTURE LOG & AI CHRONICLE',
  onBack,
  onHome,
  onOpenSettings,
  isMuted,
  onToggleMute,
  genreTag,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-[#262626] bg-[#0A0A0A]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(0,0,0,0.7)]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onBack();
              }}
              onMouseEnter={playHoverSound}
              className="flex items-center justify-center min-h-[38px] min-w-[38px] px-2.5 py-1.5 border border-[#333333] bg-[#141414] hover:bg-[#1F1F1F] hover:border-[#D4AF37] text-[#D4AF37] font-mono text-xs font-bold transition-all active:scale-95 cursor-pointer rounded-sm"
              aria-label="戻る"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden xs:inline ml-1">戻る</span>
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center border border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.2)] rounded-sm">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-xs sm:text-sm font-bold tracking-wide text-[#E5E5E5] font-mono">
                  {title}
                </h1>
                {genreTag && (
                  <span className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    {genreTag.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="hidden sm:block truncate font-mono text-[10px] font-medium text-[#A3A3A3]">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick actions (Mute, Home, Settings) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mute toggle button */}
          <button
            type="button"
            onClick={onToggleMute}
            onMouseEnter={playHoverSound}
            className={`flex min-h-[36px] min-w-[36px] items-center justify-center border transition-all cursor-pointer rounded-sm ${
              isMuted
                ? 'border-red-500/40 bg-red-950/30 text-red-400'
                : 'border-[#2E2E2E] bg-[#141414] text-[#A3A3A3] hover:border-[#D4AF37] hover:text-[#D4AF37]'
            }`}
            title={isMuted ? 'サウンドをミュート解除' : 'サウンドをミュート'}
            aria-label="サウンド切替"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Home / World Select */}
          {onHome && (
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onHome();
              }}
              onMouseEnter={playHoverSound}
              className="flex min-h-[36px] items-center gap-1.5 px-3 border border-[#2E2E2E] bg-[#141414] text-[#D4AF37] hover:bg-[#1F1F1F] hover:border-[#D4AF37] font-mono text-xs font-bold transition-all cursor-pointer rounded-sm shadow-sm"
              title="冒険の書一覧へ"
              aria-label="冒険の書一覧"
            >
              <Home className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline text-[#E5E5E5]">SLOTS</span>
            </button>
          )}

          {/* System Settings */}
          <button
            type="button"
            onClick={onOpenSettings}
            onMouseEnter={playHoverSound}
            className="flex min-h-[36px] min-w-[36px] items-center justify-center border border-[#2E2E2E] bg-[#141414] text-[#A3A3A3] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all cursor-pointer rounded-sm"
            title="システム環境設定"
            aria-label="設定"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
