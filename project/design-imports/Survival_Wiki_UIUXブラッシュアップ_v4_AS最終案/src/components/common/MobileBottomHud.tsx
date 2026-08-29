import React from 'react';
import { ChevronLeft, BookOpen, ScrollText, Volume2, VolumeX, Settings, Home } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface MobileBottomHudProps {
  currentTab?: 'records' | 'wiki';
  onSelectTab?: (tab: 'records' | 'wiki') => void;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  inWorld?: boolean;
}

export const MobileBottomHud: React.FC<MobileBottomHudProps> = ({
  currentTab = 'records',
  onSelectTab,
  onBack,
  onHome,
  onOpenSettings,
  isMuted,
  onToggleMute,
  inWorld = false,
}) => {
  return (
    <nav
      id="mobile-bottom-hud"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1018]/95 backdrop-blur-lg border-t border-[#1E293B] pb-[env(safe-area-inset-bottom,2px)] pt-0.5 px-2 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.6)]"
      aria-label="モバイル下部HUDナビゲーション"
    >
      <div className="flex items-center justify-around h-12 max-w-md mx-auto">
        {/* Back Step */}
        {onBack ? (
          <button
            id="mobile-hud-back"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onBack();
            }}
            className="flex flex-col items-center justify-center min-w-[40px] h-10 rounded text-[#94A3B8] active:text-[#F59E0B] active:bg-[#1E293B]"
          >
            <ChevronLeft className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[9px] font-game whitespace-nowrap">戻る</span>
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* In-world tabs toggle (Icon + 1-line label) */}
        {inWorld && onSelectTab && (
          <div className="flex items-center bg-[#101827] p-0.5 rounded-lg border border-[#1E293B]">
            <button
              id="mobile-hud-tab-records"
              type="button"
              onClick={() => {
                soundEngine.playSe('tab_switch');
                onSelectTab('records');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-game transition-all whitespace-nowrap ${
                currentTab === 'records'
                  ? 'bg-[#1E293B] text-[#F59E0B] border border-[#F59E0B]/50 shadow-[0_0_8px_rgba(245,158,11,0.25)] font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>記録</span>
            </button>

            <button
              id="mobile-hud-tab-wiki"
              type="button"
              onClick={() => {
                soundEngine.playSe('tab_switch');
                onSelectTab('wiki');
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-game transition-all whitespace-nowrap ${
                currentTab === 'wiki'
                  ? 'bg-[#0E2A3A] text-[#06B6D4] border border-[#06B6D4]/50 shadow-[0_0_8px_rgba(6,182,212,0.25)] font-bold'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0]'
              }`}
            >
              <ScrollText className="w-3.5 h-3.5 shrink-0" />
              <span>Wiki</span>
            </button>
          </div>
        )}

        {/* Global Root (Home) if inside a world */}
        {onHome && (
          <button
            id="mobile-hud-home"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onHome();
            }}
            className="flex flex-col items-center justify-center min-w-[40px] h-10 rounded text-[#94A3B8] active:text-[#F59E0B] active:bg-[#1E293B]"
          >
            <Home className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[9px] font-game whitespace-nowrap">スロット</span>
          </button>
        )}

        {/* Sound toggle */}
        <button
          id="mobile-hud-sound"
          type="button"
          onClick={() => {
            soundEngine.playSe('menu_cursor');
            onToggleMute();
          }}
          className="flex flex-col items-center justify-center min-w-[38px] h-10 rounded text-[#94A3B8] active:text-[#06B6D4] active:bg-[#1E293B]"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-[#64748B]" /> : <Volume2 className="w-4 h-4 text-[#06B6D4]" />}
          <span className="text-[9px] font-mono tracking-tighter whitespace-nowrap">{isMuted ? 'OFF' : 'ON'}</span>
        </button>

        {/* Settings */}
        <button
          id="mobile-hud-settings"
          type="button"
          onClick={() => {
            soundEngine.playSe('menu_select');
            onOpenSettings();
          }}
          className="flex flex-col items-center justify-center min-w-[38px] h-10 rounded text-[#94A3B8] active:text-[#F8FAFC] active:bg-[#1E293B]"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] font-mono tracking-tighter whitespace-nowrap">設定</span>
        </button>
      </div>
    </nav>
  );
};
