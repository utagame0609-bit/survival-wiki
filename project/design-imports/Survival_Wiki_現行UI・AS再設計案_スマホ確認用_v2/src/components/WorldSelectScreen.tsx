import React, { useState } from 'react';
import { Plus, Gamepad2, Compass, Heart, Sparkles, Edit3, Trash2, Play, Sliders, Volume2, Shield, Smartphone, Monitor } from 'lucide-react';
import { World, LogEntry } from '../types';
import { sound } from '../audio/soundEngine';

interface WorldSelectScreenProps {
  worlds: World[];
  allLogs: LogEntry[];
  onSelectWorld: (world: World) => void;
  onCreateWorld: () => void;
  onEditWorld: (world: World) => void;
  onDeleteWorld: (worldId: string) => void;
  onOpenSoundSettings: () => void;
  deviceMode: 'mobile-frame' | 'responsive';
  onToggleDeviceMode: () => void;
}

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  worlds,
  allLogs,
  onSelectWorld,
  onCreateWorld,
  onEditWorld,
  onDeleteWorld,
  onOpenSoundSettings,
  deviceMode,
  onToggleDeviceMode,
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Helper to get stats for a world
  const getWorldStats = (worldId: string) => {
    const worldLogs = allLogs.filter((l) => l.worldId === worldId);
    const daysSet = new Set(worldLogs.map((l) => l.dayNumber || 1));
    const latestLog = [...worldLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return {
      daysCount: Math.max(1, daysSet.size),
      recordsCount: worldLogs.length,
      latestDate: latestLog ? latestLog.timestamp : '未記録',
    };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#dcdcdc] flex flex-col select-none relative overflow-x-hidden">
      {/* Background Ambience Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff8c00]/10 via-[#0a0a0c] to-[#0a0a0c] pointer-events-none" />

      {/* Top Navigation HUD */}
      <header className="relative z-10 border-b border-[#222226] bg-[#0d0d0f]/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ff8c00]/15 border-2 border-[#ff8c00] flex items-center justify-center text-[#ff8c00] shadow-[2px_2px_0px_#000000]">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-white terminal-font">
                SURVIVAL WIKI <span className="text-[#ff8c00]">//</span> 冒険の書
              </h1>
              <p className="text-[10px] text-[#00ff41] terminal-font font-bold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
                SYSTEM_ONLINE // RECS_ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Mode Toggle (Mobile Frame vs Fullscreen HUD) */}
            <button
              type="button"
              onClick={() => {
                sound.playHover();
                onToggleDeviceMode();
              }}
              className="px-3 py-1.5 rounded-lg bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#dcdcdc] text-xs terminal-font flex items-center gap-1.5 cursor-pointer transition shadow-[2px_2px_0px_#000000]"
              title="スマホ枠表示 / 全画面切替"
            >
              {deviceMode === 'mobile-frame' ? (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#ff8c00]" />
                  <span className="hidden sm:inline">スマホ枠</span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-[#ffa500]" />
                  <span className="hidden sm:inline">全画面</span>
                </>
              )}
            </button>

            {/* Sound Config */}
            <button
              type="button"
              onClick={() => {
                sound.playConfirm();
                onOpenSoundSettings();
              }}
              className="p-2 rounded-lg bg-[#141417] border border-[#333338] hover:border-[#ff8c00] text-[#dcdcdc] hover:text-[#ff8c00] cursor-pointer transition active:scale-95 shadow-[2px_2px_0px_#000000]"
              title="サウンド設定"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 flex flex-col justify-center">
        {/* Title Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#141417] border-2 border-[#ff8c00] shadow-[4px_4px_0px_#000000]">
            <span className="w-2 h-2 bg-[#ff8c00] rotate-45" />
            <h2 className="text-sm sm:text-base font-black text-[#ff8c00] tracking-widest terminal-font">
              WORLD SELECT // 冒険の書を選択
            </h2>
            <span className="w-2 h-2 bg-[#ff8c00] rotate-45" />
          </div>
          <p className="text-xs text-[#888888] terminal-font">
            記録を再開するワールド、または旅の書を選択してください
          </p>
        </div>

        {/* World Save Slots Grid */}
        <div className="space-y-4">
          {worlds.map((world, index) => {
            const stats = getWorldStats(world.id);
            const isDeleting = deleteTargetId === world.id;

            return (
              <div
                key={world.id}
                className="group relative bg-[#121215] hover:bg-[#16161a] border-2 border-[#333338] hover:border-[#ff8c00] rounded-xl p-4 sm:p-5 transition-all duration-150 shadow-[4px_4px_0px_#000000] hover:shadow-[4px_4px_0px_#ff8c00]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] terminal-font font-black bg-[#ff8c00] text-black">
                        SLOT_{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] terminal-font font-bold bg-[#1a1a1e] border border-[#333338] text-[#ff8c00]">
                        {world.categoryLabel || world.category.toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-white group-hover:text-[#ff8c00] transition terminal-font truncate">
                        {world.name}
                      </h3>
                      {world.memo && (
                        <p className="text-xs text-[#999999] line-clamp-1 mt-0.5 lore-font italic">"{world.memo}"</p>
                      )}
                    </div>

                    {/* Members & Stats Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs terminal-font pt-1">
                      <div className="flex items-center gap-1 text-[#cccccc]">
                        <span className="text-[#666666]">Player:</span>
                        <span className="font-bold text-[#ff8c00]">@{world.player}</span>
                        {world.members.length > 0 && (
                          <span className="text-[#888888]">
                            (+{world.members.map((m) => m.name).join(', ')})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[#00ff41] font-bold">
                          ● {String(stats.daysCount).padStart(2, '0')} DAYS
                        </span>
                        <span className="text-[#dcdcdc] font-bold">
                          {String(stats.recordsCount).padStart(2, '0')} RECORDS
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222226]">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playConfirm();
                        onEditWorld(world);
                      }}
                      className="p-2 rounded-lg bg-[#18181c] hover:bg-[#202024] border border-[#333338] hover:border-[#ff8c00] text-[#888888] hover:text-[#ff8c00] transition cursor-pointer shadow-[2px_2px_0px_#000000]"
                      title="ワールド編集"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playDelete();
                        setDeleteTargetId(world.id);
                      }}
                      className="p-2 rounded-lg bg-[#18181c] hover:bg-[#202024] border border-[#333338] hover:border-red-500/60 text-[#888888] hover:text-red-400 transition cursor-pointer shadow-[2px_2px_0px_#000000]"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playConfirm();
                        onSelectWorld(world);
                      }}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-[#ff8c00] hover:bg-[#ffa500] text-black font-black text-xs sm:text-sm terminal-font shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      <span>冒険を再開 (LOAD)</span>
                    </button>
                  </div>
                </div>

                {/* Inline Delete Confirmation */}
                {isDeleting && (
                  <div className="mt-3 p-3 rounded-lg bg-[#1a1010] border border-red-500/50 flex items-center justify-between text-xs text-red-200">
                    <span className="terminal-font">この冒険の書を削除しますか？</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(null)}
                        className="px-3 py-1 rounded bg-[#222226] text-white font-bold cursor-pointer terminal-font"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sound.playDelete();
                          onDeleteWorld(world.id);
                          setDeleteTargetId(null);
                        }}
                        className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer terminal-font"
                      >
                        削除する
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* New World Button */}
          <button
            type="button"
            onClick={() => {
              sound.playConfirm();
              onCreateWorld();
            }}
            className="w-full py-4 rounded-xl bg-[#ff8c00] hover:bg-[#ffa500] text-black font-black text-sm sm:text-base terminal-font shadow-[4px_4px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ NEW_WORLD // 新しい冒険の書を作成</span>
          </button>
        </div>

        {/* Footer info */}
        <footer className="pt-4 border-t border-[#1a1a1e] flex items-center justify-between text-[11px] terminal-font text-[#666666]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
            <span>STORAGE: LOCAL PERSISTENT</span>
          </div>
          <span>UTAPEDIA SURVIVAL LOG V2</span>
        </footer>
      </main>
    </div>
  );
};
