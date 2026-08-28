import React, { useState } from 'react';
import { BookOpen, Compass, Camera, Sparkles, Plus, ChevronLeft, Sliders, Smartphone, Monitor, Shield, Share2, Layers, Cpu, Database } from 'lucide-react';
import { World, LogEntry } from '../types';
import { sound } from '../audio/soundEngine';
import { LogsTimelineView } from './tabs/LogsTimelineView';
import { LocationsIndexView } from './tabs/LocationsIndexView';
import { ChestGalleryView } from './tabs/ChestGalleryView';
import { AiWikiView } from './tabs/AiWikiView';

interface WorldMainHubProps {
  world: World;
  worlds?: World[];
  logs: LogEntry[];
  onSelectWorld?: (world: World) => void;
  onCreateWorld?: () => void;
  onBackToWorldSelect: () => void;
  onOpenQuickLog: (prefill?: { locationName?: string; coordinates?: { x: number; y: number; z: number }; area?: string }) => void;
  onOpenLogDetail: (log: LogEntry) => void;
  onOpenSoundSettings: () => void;
  deviceMode: 'mobile-frame' | 'responsive';
  onToggleDeviceMode: () => void;
}

type MainTab = 'logs' | 'locations' | 'chest' | 'wiki';

export const WorldMainHub: React.FC<WorldMainHubProps> = ({
  world,
  worlds = [],
  logs,
  onSelectWorld,
  onCreateWorld,
  onBackToWorldSelect,
  onOpenQuickLog,
  onOpenLogDetail,
  onOpenSoundSettings,
  deviceMode,
  onToggleDeviceMode,
}) => {
  const [activeTab, setActiveTab] = useState<MainTab>('logs');

  const daysSet = new Set(logs.map((l) => l.dayNumber || 1));
  const totalDays = Math.max(1, daysSet.size);

  const handleTabChange = (tab: MainTab) => {
    if (tab === activeTab) return;
    sound.playPageTurn();
    setActiveTab(tab);
  };

  const mainAppContent = (
    <div className="min-h-full bg-[#0a0a0c] text-[#dcdcdc] flex flex-col font-sans select-none relative">
      {/* Top HUD Header inside phone */}
      <header className="sticky top-0 z-30 border-b border-[#222226] bg-[#0d0d0f]/95 backdrop-blur-md px-3 sm:px-4 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              sound.playCancel();
              onBackToWorldSelect();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#ff8c00] text-xs terminal-font font-bold transition shadow-[2px_2px_0px_#000000] active:scale-95 cursor-pointer shrink-0"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">WORLDS</span>
          </button>

          {/* World Meta Title */}
          <div className="min-w-0 text-center flex-1 px-1">
            <h2 className="text-xs sm:text-sm font-black text-white truncate terminal-font tracking-wide">
              {world.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-[10px] terminal-font text-[#888888] mt-0.5">
              <span className="text-[#00ff41] font-bold">● DAY {String(totalDays).padStart(2, '0')}</span>
              <span className="text-[#444448]">•</span>
              <span className="text-[#ff8c00] font-bold">{logs.length} RECORDS</span>
            </div>
          </div>

          {/* Right Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playHover();
                onToggleDeviceMode();
              }}
              className="p-1.5 rounded-lg bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#aaaaaa] hover:text-white transition cursor-pointer shadow-[2px_2px_0px_#000000]"
              title="スマホ枠切替"
            >
              {deviceMode === 'mobile-frame' ? (
                <Smartphone className="w-4 h-4 text-[#ff8c00]" />
              ) : (
                <Monitor className="w-4 h-4 text-[#ffa500]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playConfirm();
                onOpenSoundSettings();
              }}
              className="p-1.5 rounded-lg bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#aaaaaa] hover:text-[#ff8c00] transition cursor-pointer shadow-[2px_2px_0px_#000000]"
              title="サウンド設定"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-3.5 sm:px-6 pt-3.5">
        {activeTab === 'logs' && (
          <LogsTimelineView
            world={world}
            logs={logs}
            onOpenLog={onOpenLogDetail}
            onQuickLog={() => onOpenQuickLog()}
          />
        )}

        {activeTab === 'locations' && (
          <LocationsIndexView
            world={world}
            logs={logs}
            onOpenLog={onOpenLogDetail}
            onQuickLogWithLocation={(locName, coords, area) =>
              onOpenQuickLog({ locationName: locName, coordinates: coords, area })
            }
          />
        )}

        {activeTab === 'chest' && (
          <ChestGalleryView
            world={world}
            logs={logs}
            onOpenLog={onOpenLogDetail}
          />
        )}

        {activeTab === 'wiki' && (
          <AiWikiView
            world={world}
            logs={logs}
            onOpenLogById={(id) => {
              const log = logs.find((l) => l.id === id);
              if (log) onOpenLogDetail(log);
            }}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation Bar (Artistic Flair Phone-First Nav) */}
      <nav className="fixed sm:sticky bottom-0 left-0 right-0 z-40 bg-[#0d0d0f]/95 backdrop-blur-lg border-t-2 border-[#222226] shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between relative">
          {/* Tab 1: Logs (日誌) */}
          <button
            type="button"
            onClick={() => handleTabChange('logs')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeTab === 'logs' ? 'text-[#ff8c00] font-bold' : 'text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <BookOpen className={`w-5 h-5 ${activeTab === 'logs' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] terminal-font">日誌</span>
          </button>

          {/* Tab 2: Locations (地点) */}
          <button
            type="button"
            onClick={() => handleTabChange('locations')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeTab === 'locations' ? 'text-[#ff8c00] font-bold' : 'text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <Compass className={`w-5 h-5 ${activeTab === 'locations' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] terminal-font">地点</span>
          </button>

          {/* Center Floating Action Button (QUICK LOG) */}
          <div className="flex-1 flex justify-center -mt-7">
            <button
              type="button"
              onClick={() => {
                sound.playConfirm();
                onOpenQuickLog();
              }}
              className="w-13 h-13 rounded-full bg-[#ff8c00] hover:bg-[#ffa500] text-black shadow-[0_0_20px_rgba(255,140,0,0.6)] border-3 border-[#0d0d0f] flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              title="記録を追加"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>

          {/* Tab 3: Chest (宝箱) */}
          <button
            type="button"
            onClick={() => handleTabChange('chest')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeTab === 'chest' ? 'text-[#ff8c00] font-bold' : 'text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <Camera className={`w-5 h-5 ${activeTab === 'chest' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] terminal-font">宝箱</span>
          </button>

          {/* Tab 4: Wiki (旅の書) */}
          <button
            type="button"
            onClick={() => handleTabChange('wiki')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition cursor-pointer ${
              activeTab === 'wiki' ? 'text-[#ff8c00] font-bold' : 'text-[#777777] hover:text-[#cccccc]'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${activeTab === 'wiki' ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] terminal-font">旅の書</span>
          </button>
        </div>
      </nav>
    </div>
  );

  // If mobile-frame mode on desktop, present the full Artistic Flair multi-pane chassis
  if (deviceMode === 'mobile-frame') {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-[#dcdcdc] flex flex-col select-none relative">
        {/* Top Global Status Bar (Desktop Widescreen) */}
        <header className="hidden lg:flex items-center justify-between border-b border-[#222226] bg-[#0d0d0f] px-6 py-2.5 z-20">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#ff8c00] text-black flex items-center justify-center font-black terminal-font text-xs">
                SW
              </div>
              <span className="text-xs terminal-font font-bold text-white tracking-wider">
                SURVIVAL WIKI <span className="text-[#ff8c00]">//</span> FLUX_CORE
              </span>
            </div>

            <div className="h-4 w-px bg-[#222226]" />

            <div className="flex items-center gap-2 text-xs terminal-font">
              <span className="text-[#666666]">ACTIVE_WORLD:</span>
              <span className="text-[#ff8c00] font-bold">{world.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2 text-xs terminal-font text-[#00ff41]">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
              <span>SYNCED_AUTH: OK</span>
            </div>

            <button
              type="button"
              onClick={() => onOpenQuickLog()}
              className="px-3 py-1 bg-[#ff8c00] hover:bg-[#ffa500] text-black rounded text-xs terminal-font font-bold flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ NEW RECORD</span>
            </button>
          </div>
        </header>

        {/* Main 3-Column Layout on Desktop */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Mini Dock: World Switcher (Desktop) */}
          <aside className="hidden lg:flex w-20 flex-col items-center justify-between border-r border-[#222226] bg-[#0d0d0f] py-4 z-10">
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.playCancel();
                  onBackToWorldSelect();
                }}
                className="w-12 h-12 rounded-xl bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#ff8c00] flex items-center justify-center transition cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="ワールド選択に戻る"
              >
                <Shield className="w-5 h-5" />
              </button>

              <div className="w-8 h-px bg-[#222226] my-1" />

              {/* Worlds quick slots */}
              {worlds.slice(0, 5).map((w, idx) => {
                const isActive = w.id === world.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => {
                      if (onSelectWorld && !isActive) {
                        sound.playConfirm();
                        onSelectWorld(w);
                      }
                    }}
                    className={`w-11 h-11 rounded-lg text-xs terminal-font font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                      isActive
                        ? 'bg-[#ff8c00] text-black border-2 border-white shadow-[2px_2px_0px_#000000]'
                        : 'bg-[#141417] border border-[#333338] text-[#888888] hover:text-white hover:border-[#ff8c00]'
                    }`}
                    title={w.name}
                  >
                    <span>W{idx + 1}</span>
                  </button>
                );
              })}

              {onCreateWorld && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playConfirm();
                    onCreateWorld();
                  }}
                  className="w-11 h-11 rounded-lg border border-dashed border-[#333338] hover:border-[#ff8c00] text-[#666666] hover:text-[#ff8c00] flex items-center justify-center transition cursor-pointer"
                  title="新しいワールドを作成"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sound.playConfirm();
                  onOpenSoundSettings();
                }}
                className="w-11 h-11 rounded-xl bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#aaaaaa] hover:text-[#ff8c00] flex items-center justify-center transition cursor-pointer shadow-[2px_2px_0px_#000000]"
                title="サウンド設定"
              >
                <Sliders className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* Center Column: Phone Frame */}
          <div className="flex-1 flex items-center justify-center p-0 sm:p-5 overflow-y-auto bg-[#0a0a0c]">
            <div className="w-full max-w-[440px] h-[100vh] sm:h-[860px] bg-[#121214] sm:rounded-[36px] sm:border-[6px] sm:border-[#222226] shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative sm:ring-1 sm:ring-[#ff8c00]/30">
              {/* Smartphone Speaker / Notch on top */}
              <div className="hidden sm:flex items-center justify-between px-6 pt-2.5 pb-1.5 bg-[#0d0d0f] border-b border-[#1f1f24] text-[10px] terminal-font text-[#666666]">
                <span>REC_MODE: ON</span>
                <div className="w-16 h-3 bg-black rounded-full" />
                <span className="text-[#00ff41]">● LIVE</span>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden relative no-scrollbar">
                {mainAppContent}
              </div>
            </div>
          </div>

          {/* Right Telemetry / Oracle Sidebar (Desktop Widescreen) */}
          <aside className="hidden xl:flex w-80 flex-col border-l border-[#222226] bg-[#0d0d0f] p-5 space-y-5 overflow-y-auto">
            {/* Oracle Transformation Snapshot */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] terminal-font text-[#ff8c00] font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#ff8c00] rotate-45" />
                  ORACLE_TRANSFORMATION
                </span>
                <span className="text-[10px] terminal-font text-[#666666]">GEMINI_V3</span>
              </div>

              <div className="bg-[#121214] border border-[#26262a] rounded-xl p-3.5 space-y-2.5 shadow-[3px_3px_0px_#000000]">
                <p className="text-xs text-[#dcdcdc] leading-relaxed lore-font italic">
                  「散らばった記録が、やがて壮大な年代記となる。今日の日誌も、未来の神話の1ページに刻まれた。」
                </p>
                <div className="pt-2 border-t border-[#1f1f24] flex items-center justify-between text-[10px] terminal-font text-[#888888]">
                  <span>RECORDED: {logs.length} ENTRIES</span>
                  <span className="text-[#ff8c00]">TAB // 旅の書</span>
                </div>
              </div>
            </div>

            {/* Storage Allocation Visualizer */}
            <div className="space-y-2">
              <span className="text-[11px] terminal-font text-[#888888] font-bold">
                STORAGE_ALLOCATION
              </span>
              <div className="p-3 bg-[#121214] border border-[#26262a] rounded-xl space-y-2 shadow-[3px_3px_0px_#000000]">
                <div className="flex justify-between text-[10px] terminal-font">
                  <span className="text-[#aaaaaa]">WORLD_RESOURCES</span>
                  <span className="text-[#00ff41]">98.2% AVAIL</span>
                </div>
                <div className="flex gap-1 h-3 p-0.5 bg-black/40 rounded border border-[#333338]">
                  <div className="h-full bg-[#ff8c00] rounded-sm" style={{ width: `${Math.min(100, Math.max(10, logs.length * 8))}%` }} />
                  <div className="h-full bg-[#00ff41] rounded-sm flex-1 opacity-20" />
                </div>
                <div className="text-[10px] terminal-font text-[#666666]">
                  PERSISTENCE: LOCAL_INDEXED_DB
                </div>
              </div>
            </div>

            {/* Navigation Quick Shortcuts */}
            <div className="space-y-2 pt-2 border-t border-[#1f1f24]">
              <span className="text-[11px] terminal-font text-[#888888] font-bold">
                QUICK_SHORTCUTS
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs terminal-font">
                <button
                  type="button"
                  onClick={() => handleTabChange('logs')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                    activeTab === 'logs'
                      ? 'bg-[#18181c] border-[#ff8c00] text-[#ff8c00]'
                      : 'bg-[#121214] border-[#26262a] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="font-bold">01 日誌</div>
                  <div className="text-[10px] text-[#666666]">{logs.length} 件</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('locations')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                    activeTab === 'locations'
                      ? 'bg-[#18181c] border-[#ff8c00] text-[#ff8c00]'
                      : 'bg-[#121214] border-[#26262a] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="font-bold">02 地点</div>
                  <div className="text-[10px] text-[#666666]">MAP_INDEX</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('chest')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                    activeTab === 'chest'
                      ? 'bg-[#18181c] border-[#ff8c00] text-[#ff8c00]'
                      : 'bg-[#121214] border-[#26262a] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="font-bold">03 宝箱</div>
                  <div className="text-[10px] text-[#666666]">CHEST_REC</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('wiki')}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                    activeTab === 'wiki'
                      ? 'bg-[#18181c] border-[#ff8c00] text-[#ff8c00]'
                      : 'bg-[#121214] border-[#26262a] text-[#888888] hover:text-white'
                  }`}
                >
                  <div className="font-bold">04 旅の書</div>
                  <div className="text-[10px] text-[#666666]">AI_WIKI</div>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return mainAppContent;
};

