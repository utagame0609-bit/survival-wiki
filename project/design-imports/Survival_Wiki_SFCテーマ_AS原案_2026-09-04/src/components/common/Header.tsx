import React from 'react';
import { Volume2, VolumeX, Settings as SettingsIcon, RotateCcw, Home, Sparkles } from 'lucide-react';
import { AppSettings, Screen } from '../../types';

interface HeaderProps {
  currentScreen: Screen;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings?: () => void;
  settings: AppSettings;
  onToggleSound?: () => void;
  onToggleTheme?: () => void;
  canGoBack: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onBack,
  onHome,
  onOpenSettings,
  settings,
  onToggleSound,
  onToggleTheme,
  canGoBack,
}) => {
  const isWorldScreen = currentScreen.name === 'world';

  return (
    <header className="sticky top-0 z-40 bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] shadow-[0_3px_6px_rgba(0,0,0,0.15)] px-3 py-2 sm:px-6 sm:py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Console branding & Back/Home Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* LED POWER indicator */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] shadow-inner">
            <span className="w-2.5 h-2.5 rounded-full sfc-led-red" />
            <span className="font-dot text-[10px] tracking-wider text-[var(--text-muted)] font-bold hidden sm:inline">
              POWER
            </span>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-1.5">
            {canGoBack && (
              <button
                type="button"
                onClick={onBack}
                className="sfc-btn sfc-btn-convex sfc-btn-neutral px-2.5 py-1.5 text-xs font-dot flex items-center gap-1 hover:bg-white"
                title="前の画面に戻る (BACK)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BACK</span>
              </button>
            )}

            {isWorldScreen && (
              <button
                type="button"
                onClick={onHome}
                className="sfc-btn sfc-btn-convex sfc-btn-neutral px-2.5 py-1.5 text-xs font-dot flex items-center gap-1 hover:bg-white"
                title="冒険の書一覧に戻る (SLOTS / HOME)"
              >
                <Home className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                <span className="hidden sm:inline">SLOTS</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: 16-bit Title & Cartridge Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[var(--accent-blue)] border border-black shadow-sm inline-block" />
            <div className="w-3 h-3 rounded-full bg-[var(--accent-yellow)] border border-black shadow-sm inline-block" />
            <div className="w-3 h-3 rounded-full bg-[var(--accent-green)] border border-black shadow-sm inline-block" />
            <div className="w-3 h-3 rounded-full bg-[var(--accent-red)] border border-black shadow-sm inline-block" />
            <h1 className="font-sfc-title text-sm sm:text-base md:text-lg font-bold tracking-wider text-[var(--text-main)] ml-1">
              SURVIVAL WIKI
            </h1>
          </div>
          <span className="font-dot text-[9px] sm:text-[10px] text-[var(--text-muted)] uppercase tracking-widest hidden xs:inline">
            16-BIT RETRO CONSOLE EDITION
          </span>
        </div>

        {/* Right: Sound, Theme Switcher & Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Quick Switcher (For verification of non-destructive token switching) */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="sfc-btn sfc-btn-convex px-2 py-1.5 text-xs font-dot flex items-center gap-1"
            style={{
              backgroundColor: settings.theme === 'sfc' ? 'var(--surface-2)' : '#333340',
              color: settings.theme === 'sfc' ? 'var(--text-main)' : '#ffffff'
            }}
            title={`テーマ切替: 現在【${settings.theme === 'sfc' ? 'SFCライト' : 'FCダーク'}】`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-yellow)]" />
            <span className="hidden md:inline font-bold">
              {settings.theme === 'sfc' ? 'SFC' : 'FC'}
            </span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className={`sfc-btn sfc-btn-convex px-2.5 py-1.5 text-xs font-dot flex items-center gap-1 ${
              settings.soundEnabled ? 'sfc-btn-b text-white' : 'sfc-btn-neutral text-[var(--text-muted)]'
            }`}
            title={settings.soundEnabled ? 'サウンドON' : 'サウンドOFF'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="hidden lg:inline">
              {settings.soundEnabled ? 'SOUND' : 'MUTE'}
            </span>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral px-2.5 py-1.5 text-xs font-dot flex items-center gap-1 hover:bg-white"
            title="システム設定 (CONFIG)"
          >
            <SettingsIcon className="w-3.5 h-3.5 text-[var(--text-main)]" />
            <span className="hidden sm:inline">CONFIG</span>
          </button>
        </div>
      </div>
    </header>
  );
};
