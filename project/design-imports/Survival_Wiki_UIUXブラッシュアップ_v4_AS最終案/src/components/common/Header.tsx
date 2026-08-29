import React from 'react';
import { ChevronLeft, Volume2, VolumeX, Settings, Home, Compass } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface HeaderProps {
  title?: string;
  subTitle?: string;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'WORLD SELECT',
  subTitle = 'UTAPEDIA // SURVIVAL WIKI',
  onBack,
  onHome,
  onOpenSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B1018]/95 backdrop-blur-md border-b border-[#1E293B] select-none">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between">
        {/* Left Side: Back action or Branding & Location/Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              id="header-back-button"
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_back');
                onBack();
              }}
              className="flex items-center gap-1 px-2 py-1.5 rounded text-xs font-mono text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#1E293B]/70 border border-[#334155]/60 hover:border-[#F59E0B]/50 transition-colors"
              title="前の画面に戻る"
            >
              <ChevronLeft className="w-4 h-4 text-[#F59E0B]" />
              <span className="hidden sm:inline">BACK</span>
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {/* Brand HUD icon */}
            <div className="w-6 h-6 rounded bg-[#161F30] border border-[#06B6D4]/40 flex items-center justify-center shrink-0">
              <Compass className="w-3.5 h-3.5 text-[#06B6D4]" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-mono text-[#06B6D4] tracking-wider truncate leading-none hidden sm:block">
                {subTitle}
              </div>
              <h1 className="text-xs sm:text-sm font-game font-bold tracking-wide text-[#F1F5F9] truncate">
                {title}
              </h1>
            </div>
          </div>
        </div>

        {/* Right Side: Global quick actions on PC (Hidden on mobile to eliminate header/bottom-bar duplication) */}
        <div className="hidden md:flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle Button */}
          <button
            id="header-sound-button"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_cursor');
              onToggleMute();
            }}
            className={`p-2 rounded border transition-colors flex items-center gap-1 text-xs font-mono ${
              isMuted
                ? 'text-[#64748B] bg-[#0F172A] border-[#334155]/40 hover:border-[#64748B]'
                : 'text-[#06B6D4] bg-[#0E2030] border-[#06B6D4]/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
            }`}
            title={isMuted ? 'サウンドON' : 'サウンドOFF'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[11px]">{isMuted ? 'MUTE' : 'SOUND'}</span>
          </button>

          {/* Settings Trigger */}
          <button
            id="header-settings-button"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_select');
              onOpenSettings();
            }}
            className="p-2 rounded text-[#94A3B8] hover:text-[#F8FAFC] bg-[#161F30] hover:bg-[#1E293B] border border-[#334155]/60 hover:border-[#F59E0B]/50 transition-colors flex items-center gap-1 text-xs font-mono"
            title="システム設定"
          >
            <Settings className="w-4 h-4" />
            <span className="text-[11px]">CONFIG</span>
          </button>

          {/* HOME Root Button (shown if inside a world or subscreen) */}
          {onHome && (
            <button
              id="header-home-button"
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_back');
                onHome();
              }}
              className="p-2 rounded text-[#94A3B8] hover:text-[#F59E0B] bg-[#161F30] hover:bg-[#1E293B] border border-[#334155]/60 hover:border-[#F59E0B]/50 transition-colors flex items-center gap-1 text-xs font-mono"
              title="ワールド選択（冒険の書一覧）へ移動"
            >
              <Home className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-[11px]">SLOTS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
