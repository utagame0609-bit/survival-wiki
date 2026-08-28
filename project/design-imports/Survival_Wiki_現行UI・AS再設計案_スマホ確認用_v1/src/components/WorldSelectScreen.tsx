import React, { useEffect } from 'react';
import { Plus, Play, Edit3, Trash2, Shield, Users, Gamepad2, Compass, Sparkles, MapPin, Camera } from 'lucide-react';
import { World, AdventureRecord } from '../types';
import { playConfirmSound, playDeleteSound, playHoverSound, playModalOpenSound, soundEngine } from '../audio/soundEngine';

interface WorldSelectScreenProps {
  worlds: World[];
  records: AdventureRecord[];
  onSelectWorld: (world: World) => void;
  onCreateWorld: () => void;
  onEditWorld: (world: World) => void;
  onDeleteWorld: (world: World) => void;
}

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  worlds,
  records,
  onSelectWorld,
  onCreateWorld,
  onEditWorld,
  onDeleteWorld,
}) => {
  // Start BGM on world select screen
  useEffect(() => {
    soundEngine.playBgm('world_select');
    return () => {
      soundEngine.stopBgm();
    };
  }, []);

  const getRecordStats = (worldId: string) => {
    const worldRecords = records.filter((r) => r.worldId === worldId);
    const uniqueDays = Array.from(new Set(worldRecords.map((r) => r.dayNumber))).length;
    const photosCount = worldRecords.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
    return {
      recordsCount: worldRecords.length,
      daysCount: uniqueDays || (worldRecords.length > 0 ? 1 : 0),
      photosCount,
      lastRecord: worldRecords[0]?.recordedAt || '------',
    };
  };

  const getGenreIcon = (genre: string) => {
    switch (genre) {
      case 'travel':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'hobby':
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-[#0A0A0A] text-[#E5E5E5] flex flex-col justify-between select-none">
      {/* Subtle background gradient texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col">
        {/* Title Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <div className="border border-[#D4AF37]/50 bg-[#141414] px-6 sm:px-10 py-2.5 sm:py-3 mb-2 shadow-[0_0_24px_rgba(212,175,55,0.15)] rounded-sm">
            <h1 className="text-[#D4AF37] font-bold tracking-widest text-sm sm:text-lg font-mono">
              UTAPEDIA // WORLD SELECT
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#A3A3A3] font-medium tracking-wider font-mono flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            冒険の書を選択してください // SELECT SAVE SLOT
          </p>
        </div>

        {/* Save Slots List */}
        <div className="space-y-4 sm:space-y-5 flex-1">
          {worlds.length === 0 ? (
            <div className="border border-dashed border-[#262626] bg-[#141414]/90 p-8 sm:p-12 text-center rounded-sm">
              <Shield className="w-12 h-12 text-[#737373] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#E5E5E5] mb-1">セーブデータが存在しません</h3>
              <p className="text-xs sm:text-sm text-[#A3A3A3] mb-6">
                「+ 新しい冒険の書を作成」ボタンから最初の記録スロットを作成してください。
              </p>
              <button
                type="button"
                onClick={() => {
                  playConfirmSound();
                  onCreateWorld();
                }}
                onMouseEnter={playHoverSound}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-sm border-b-2 border-[#A68824] rounded-sm cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ 冒険の書を作成</span>
              </button>
            </div>
          ) : (
            worlds.map((world, idx) => {
              const stats = getRecordStats(world.id);
              const slotStr = `SLOT_${String(idx + 1).padStart(2, '0')}`;

              return (
                <div
                  key={world.id}
                  className="relative group border border-[#262626] hover:border-[#D4AF37]/70 bg-[#141414] hover:bg-[#181818] transition-all duration-200 shadow-[0_4px_20px_rgba(0,0,0,0.6)] rounded-sm overflow-hidden"
                >
                  {/* Top Bar inside Card */}
                  <div className="px-4 py-2.5 bg-[#0F0F0F] border-b border-[#222222] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                        {slotStr}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-mono font-medium bg-[#1F1F1F] text-[#A3A3A3] rounded-sm border border-[#2A2A2A]">
                        {getGenreIcon(world.genre)}
                        <span>{world.genre.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          playModalOpenSound();
                          onEditWorld(world);
                        }}
                        onMouseEnter={playHoverSound}
                        className="p-1.5 text-[#A3A3A3] hover:text-[#D4AF37] hover:bg-[#222222] rounded-sm transition-colors cursor-pointer"
                        title="冒険の書を編集"
                        aria-label="編集"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          playDeleteSound();
                          onDeleteWorld(world);
                        }}
                        onMouseEnter={playHoverSound}
                        className="p-1.5 text-[#A3A3A3] hover:text-red-400 hover:bg-[#222222] rounded-sm transition-colors cursor-pointer"
                        title="冒険の書を削除"
                        aria-label="削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Player & Info */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                      {/* Player Avatar */}
                      <div className="relative shrink-0">
                        {world.playerPhotoUrl ? (
                          <img
                            src={world.playerPhotoUrl}
                            alt={world.player}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm object-cover border border-[#D4AF37]/50 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-sm bg-[#1F1F1F] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-mono font-bold text-lg">
                            {world.player.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold bg-[#D4AF37] text-black px-1 rounded-sm">
                          LV.{(stats.daysCount || 1) * 3}
                        </span>
                      </div>

                      {/* World & Party Details */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-[#E5E5E5] tracking-wide truncate">
                            {world.name}
                          </h2>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#A3A3A3] font-mono">
                          <span className="text-[#E5E5E5] font-semibold">主: {world.player}</span>
                          {world.members.length > 0 && (
                            <div className="flex items-center gap-1 text-[#A3A3A3]">
                              <Users className="w-3 h-3 text-[#D4AF37]" />
                              <span>同行 {world.members.length} 名</span>
                              <div className="flex -space-x-1 ml-0.5">
                                {world.members.slice(0, 3).map((m) => (
                                  <span
                                    key={m.id}
                                    className="inline-block px-1.5 py-0.2 bg-[#1F1F1F] text-[10px] text-[#D4AF37] border border-[#333333] rounded-sm"
                                  >
                                    @{m.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {world.memo && (
                          <p className="text-xs text-[#8A8A8A] line-clamp-1 font-sans">
                            {world.memo}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Middle: Stats Badges (Days, Records, Photos) */}
                    <div className="flex items-center justify-around sm:justify-start gap-4 sm:gap-6 py-2 px-3 bg-[#0A0A0A] border border-[#222222] rounded-sm font-mono shrink-0">
                      <div className="text-center">
                        <div className="text-[10px] text-[#737373]">DAYS</div>
                        <div className="text-sm sm:text-base font-bold text-[#E5E5E5]">
                          {String(stats.daysCount).padStart(3, '0')} <span className="text-[10px] text-[#737373] font-normal">日</span>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-[#262626]" />

                      <div className="text-center">
                        <div className="text-[10px] text-[#737373]">RECORDS</div>
                        <div className="text-sm sm:text-base font-bold text-[#D4AF37]">
                          {String(stats.recordsCount).padStart(3, '0')} <span className="text-[10px] text-[#737373] font-normal">件</span>
                        </div>
                      </div>

                      <div className="h-6 w-px bg-[#262626]" />

                      <div className="text-center">
                        <div className="text-[10px] text-[#737373]">PHOTOS</div>
                        <div className="text-sm sm:text-base font-bold text-[#A3A3A3]">
                          {String(stats.photosCount).padStart(3, '0')} <span className="text-[10px] text-[#737373] font-normal">枚</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Load / Play Button */}
                    <button
                      type="button"
                      onClick={() => {
                        playConfirmSound();
                        onSelectWorld(world);
                      }}
                      onMouseEnter={playHoverSound}
                      className="w-full md:w-auto min-h-[44px] px-6 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs sm:text-sm font-mono border-b-2 border-[#A68824] active:border-b-0 active:translate-y-0.5 transition-all rounded-sm flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black stroke-none" />
                      <span>▶ 冒険を再開 (LOAD)</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create New World Button */}
        <div className="mt-6 sm:mt-8">
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              onCreateWorld();
            }}
            onMouseEnter={playHoverSound}
            className="w-full min-h-[48px] bg-[#141414] hover:bg-[#1F1F1F] border border-[#D4AF37]/50 hover:border-[#D4AF37] text-[#D4AF37] font-mono font-bold text-sm sm:text-base py-3 px-4 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ NEW_WORLD // 新しい冒険の書を作成</span>
          </button>
        </div>

        {/* Retro Terminal Footer */}
        <footer className="mt-8 pt-6 pb-2 border-t border-[#222222] flex flex-wrap items-center justify-between gap-3 text-[10px] sm:text-xs text-[#737373] font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#D4AF37] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
              ONLINE
            </span>
            <span>STORAGE: LOCAL_DEVICE</span>
            <span>ENGINE: 16-BIT RESIDUAL REVERB</span>
          </div>
          <div className="text-[#525252]">UTAPEDIA ADVENTURE LOG // ELEGANT DARK</div>
        </footer>
      </div>
    </div>
  );
};
