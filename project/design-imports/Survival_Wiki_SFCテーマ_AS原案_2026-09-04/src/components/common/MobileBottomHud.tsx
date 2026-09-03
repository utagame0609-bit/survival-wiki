import React from 'react';
import { RotateCcw, Home, BookOpen, Scroll, Volume2, VolumeX, Settings } from 'lucide-react';
import { Tab } from '../../types';

interface MobileBottomHudProps {
  activeTab?: Tab;
  onSelectTab?: (tab: Tab) => void;
  onBack?: () => void;
  onHome?: () => void;
  onOpenSettings?: () => void;
  onToggleSound?: () => void;
  soundEnabled?: boolean;
  canGoBack: boolean;
  isWorldScreen: boolean;
}

export const MobileBottomHud: React.FC<MobileBottomHudProps> = ({
  activeTab = 'records',
  onSelectTab,
  onBack,
  onHome,
  onOpenSettings,
  onToggleSound,
  soundEnabled = true,
  canGoBack,
  isWorldScreen,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] shadow-[0_-4px_10px_rgba(0,0,0,0.2)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 px-2">
      <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
        {/* BACK Button */}
        <button
          type="button"
          onClick={onBack}
          disabled={!canGoBack}
          className={`flex flex-col items-center justify-center p-1.5 min-w-[50px] min-h-[44px] rounded sfc-btn sfc-btn-convex ${
            canGoBack ? 'sfc-btn-neutral active:translate-y-0.5' : 'opacity-40 pointer-events-none'
          }`}
          title="BACK"
        >
          <RotateCcw className="w-4 h-4 text-[var(--text-main)]" />
          <span className="font-dot text-[9px] mt-0.5">BACK</span>
        </button>

        {/* HOME / SLOTS */}
        <button
          type="button"
          onClick={onHome}
          className="flex flex-col items-center justify-center p-1.5 min-w-[50px] min-h-[44px] rounded sfc-btn sfc-btn-convex sfc-btn-neutral active:translate-y-0.5"
          title="SLOTS / HOME"
        >
          <Home className="w-4 h-4 text-[var(--accent-blue)]" />
          <span className="font-dot text-[9px] mt-0.5">SLOTS</span>
        </button>

        {/* World Tabs (Records & Wiki) if inside a World */}
        {isWorldScreen && onSelectTab && (
          <>
            {/* Records Tab (Y Button Theme - Yellow) */}
            <button
              type="button"
              onClick={() => onSelectTab('records')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[58px] min-h-[44px] rounded sfc-btn sfc-btn-convex transition-transform ${
                activeTab === 'records'
                  ? 'sfc-btn-y shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ring-2 ring-[var(--border-dark)]'
                  : 'sfc-btn-neutral opacity-80'
              }`}
              title="冒険の記録 (RECORDS)"
            >
              <div className="flex items-center gap-1">
                <span className="font-dot text-[9px] bg-black/10 px-1 rounded font-bold">Y</span>
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-dot text-[9px] font-bold mt-0.5">記録</span>
            </button>

            {/* Wiki Tab (X Button Theme - Blue) */}
            <button
              type="button"
              onClick={() => onSelectTab('wiki')}
              className={`flex flex-col items-center justify-center p-1.5 min-w-[58px] min-h-[44px] rounded sfc-btn sfc-btn-convex transition-transform ${
                activeTab === 'wiki'
                  ? 'sfc-btn-x text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] ring-2 ring-[var(--border-dark)]'
                  : 'sfc-btn-neutral opacity-80'
              }`}
              title="旅の書 (AI WIKI)"
            >
              <div className="flex items-center gap-1">
                <span className="font-dot text-[9px] bg-black/20 px-1 rounded font-bold">X</span>
                <Scroll className="w-4 h-4" />
              </div>
              <span className="font-dot text-[9px] font-bold mt-0.5">旅の書</span>
            </button>
          </>
        )}

        {/* Sound Button (Rubber Pill Style) */}
        <button
          type="button"
          onClick={onToggleSound}
          className="flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] rounded sfc-btn sfc-btn-convex sfc-btn-neutral"
          title="SOUND TOGGLE"
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-[var(--accent-green)]" />
          ) : (
            <VolumeX className="w-4 h-4 text-[var(--text-muted)]" />
          )}
          <span className="font-dot text-[9px] mt-0.5">START</span>
        </button>

        {/* Settings Button (SELECT) */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center p-1.5 min-w-[48px] min-h-[44px] rounded sfc-btn sfc-btn-convex sfc-btn-neutral"
          title="SETTINGS"
        >
          <Settings className="w-4 h-4 text-[var(--text-main)]" />
          <span className="font-dot text-[9px] mt-0.5">SELECT</span>
        </button>
      </div>
    </nav>
  );
};
