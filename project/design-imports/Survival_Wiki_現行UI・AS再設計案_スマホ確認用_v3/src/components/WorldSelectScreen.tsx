import React, { useEffect, useState } from 'react';
import { Plus, Play, Edit3, Trash2, Shield, Calendar, MapPin, Users, Sparkles, Gamepad2 } from 'lucide-react';
import { WorldWithMembers, LocationWithPhotos } from '../types';
import { fetchWorlds, fetchLocations, deleteWorld } from '../lib/db';
import { soundEngine, playConfirmSound, playDeleteSound, playErrorSound, playHoverSound, playModalCloseSound } from '../lib/soundEngine';
import { useViewMode } from '../context/ViewModeContext';

interface WorldSelectScreenProps {
  onSelectWorld: (world: WorldWithMembers) => void;
  onOpenCreate: () => void;
  onOpenEdit: (world: WorldWithMembers) => void;
}

export function WorldSelectScreen({
  onSelectWorld,
  onOpenCreate,
  onOpenEdit,
}: WorldSelectScreenProps) {
  const { isMobile } = useViewMode();
  const [worlds, setWorlds] = useState<WorldWithMembers[]>([]);
  const [worldStats, setWorldStats] = useState<Record<string, { days: number; count: number; lastCheckpoint: string }>>({});
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<WorldWithMembers | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchWorlds();
      setWorlds(data);

      const statsMap: Record<string, { days: number; count: number; lastCheckpoint: string }> = {};
      for (const w of data) {
        const locs = await fetchLocations(w.id);
        const uniqueDays = new Set(locs.map((l) => l.created_at.split('T')[0]));
        const checkpoints = locs.filter((l) => l.is_checkpoint);
        const lastCheckpoint = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].name : (locs[0]?.name || '------');
        statsMap[w.id] = {
          days: Math.max(1, uniqueDays.size),
          count: locs.length,
          lastCheckpoint,
        };
      }
      setWorldStats(statsMap);
    } catch (e) {
      console.error('Load worlds error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    soundEngine.startBgm();
  }, []);

  const handleDelete = (world: WorldWithMembers) => {
    playErrorSound();
    setDeleteTarget(world);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    playDeleteSound();
    await deleteWorld(deleteTarget.id);
    setDeleteTarget(null);
    loadData();
  };

  return (
    <div className="w-full flex flex-col justify-between py-2 sm:py-4">
      {/* Top Banner / CRT Title Header */}
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6 text-center">
        <div className="inline-block border-2 border-amber-500/80 bg-[#161a25] px-4 sm:px-10 py-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] mb-1.5 rounded-xs">
          <h1 className="text-amber-400 font-black tracking-widest text-sm sm:text-base font-mono">
            UTAPEDIA // WORLD SELECT
          </h1>
        </div>
        <p className="text-[11px] sm:text-xs text-emerald-400 font-bold tracking-wider font-mono opacity-90">
          冒険の書を選択してください // SELECT SAVE SLOT
        </p>
      </div>

      {/* Main Save Slots List */}
      <main className="w-full max-w-4xl mx-auto px-2 sm:px-4 space-y-3.5 sm:space-y-4">
        {loading ? (
          <div className="text-center py-12 space-y-3 font-mono text-amber-400">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">セーブデータを読み込み中 // LOADING SLOTS...</p>
          </div>
        ) : worlds.length === 0 ? (
          <div className="border-2 border-slate-700 bg-[#161a25] p-6 text-center space-y-3">
            <div className="w-12 h-12 bg-[#11141e] border-2 border-amber-500/50 flex items-center justify-center mx-auto text-amber-400">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">セーブデータが存在しません</h3>
            <p className="text-xs text-slate-400">「+ 新しいワールドを作成」から最初の冒険の書を作成してください。</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {worlds.map((world, idx) => {
              const stat = worldStats[world.id] || { days: 1, count: 0, lastCheckpoint: '------' };
              const slotStr = `SLOT_${String(idx + 1).padStart(2, '0')}`;
              const updatedDate = world.updated_at
                ? new Date(world.updated_at).toLocaleString('ja-JP', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '2026/08/24 20:06';

              return (
                <div
                  key={world.id}
                  className="group relative border-2 border-slate-700/90 bg-[#161a25] hover:border-amber-500 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)] overflow-hidden rounded-xs"
                >
                  <div className="p-3.5 sm:p-5 flex flex-col space-y-3">
                    {/* Top Row: Slot ID + World Title + Actions (Edit/Delete) */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="px-2 py-0.5 border border-amber-400/80 bg-amber-500/20 text-amber-300 font-mono text-[10px] sm:text-[11px] font-bold shrink-0">
                          {slotStr}
                        </span>
                        <h2 className="text-sm sm:text-base font-bold text-white truncate tracking-wide">
                          {world.name}
                        </h2>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            playHoverSound();
                            onOpenEdit(world);
                          }}
                          onMouseEnter={playHoverSound}
                          title="ワールド設定を編集"
                          className="p-1.5 sm:p-2 border border-slate-700 bg-[#10131d] text-slate-300 hover:text-amber-400 hover:border-amber-500 transition-all active:scale-95 cursor-pointer rounded-xs"
                          aria-label="編集"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(world)}
                          onMouseEnter={playHoverSound}
                          title="ワールドを削除"
                          className="p-1.5 sm:p-2 border border-slate-700 bg-[#10131d] text-slate-400 hover:text-rose-400 hover:border-rose-500 transition-all active:scale-95 cursor-pointer rounded-xs"
                          aria-label="削除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Middle Row: Left (Members/Avatar) & Right (Stats) */}
                    <div className={`flex ${isMobile ? 'flex-col gap-2.5' : 'flex-row items-center justify-between gap-4'}`}>
                      {/* Members Avatar Area (Up to 5 companions with photos, naturally styled) */}
                      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-0.5 max-w-full">
                        {/* Player / Leader */}
                        <div className="flex items-center gap-1.5 bg-[#0f1424] border border-amber-500/60 px-2 py-1 shrink-0 rounded-xs shadow-xs">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 border border-amber-400 bg-black overflow-hidden shrink-0 rounded-xs">
                            {world.player_photo_path ? (
                              <img
                                src={world.player_photo_path}
                                alt={world.player || 'Player'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-4 h-4 text-amber-400 m-auto mt-1.5" />
                            )}
                          </div>
                          <div className="min-w-0 pr-0.5">
                            <div className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-300 truncate max-w-[70px] sm:max-w-[90px]">
                              {world.player || 'ウタ'}
                            </div>
                            <div className="text-[8px] font-mono text-amber-400/80">開拓者 (CMD)</div>
                          </div>
                        </div>

                        {/* Co-Members / Friends (Up to 5) */}
                        {world.members
                          .filter((m) => m.name !== world.player)
                          .slice(0, 5)
                          .map((m) => (
                            <div
                              key={m.id}
                              className="flex items-center gap-1.5 bg-[#0f1424] border border-cyan-500/40 px-1.5 sm:px-2 py-1 shrink-0 rounded-xs shadow-xs"
                            >
                              <div className="w-6 h-6 sm:w-7 sm:h-7 border border-cyan-400/60 bg-black overflow-hidden shrink-0 rounded-xs">
                                {m.photo_path ? (
                                  <img src={m.photo_path} alt={m.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-3.5 h-3.5 text-cyan-400 m-auto mt-1" />
                                )}
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-mono text-cyan-200 truncate max-w-[55px] sm:max-w-[75px]">
                                {m.name}
                              </span>
                            </div>
                          ))}

                        {/* If only 1 player or solo world */}
                        {world.members.filter((m) => m.name !== world.player).length === 0 && (
                          <div className="text-[9px] font-mono text-slate-400 italic px-1 shrink-0">
                            (ソロ開拓中)
                          </div>
                        )}
                      </div>

                      {/* Stats Box (Days, Records, Last Checkpoint) */}
                      <div className="flex items-center gap-2.5 sm:gap-4 font-mono bg-[#0c101c] border border-slate-700/80 px-2.5 sm:px-3 py-1.5 shrink-0 rounded-xs justify-between">
                        <div>
                          <div className="text-[8px] sm:text-[9px] text-slate-400 font-bold">DAYS</div>
                          <div className="text-xs sm:text-base font-black text-emerald-400">
                            {String(stat.days).padStart(3, '0')}{' '}
                            <span className="text-[9px] font-sans text-slate-400 font-normal">日</span>
                          </div>
                        </div>

                        <div className="h-5 sm:h-6 w-px bg-slate-700" />

                        <div>
                          <div className="text-[8px] sm:text-[9px] text-slate-400 font-bold">RECORDS</div>
                          <div className="text-xs sm:text-base font-black text-amber-400">
                            {String(stat.count).padStart(3, '0')}{' '}
                            <span className="text-[9px] font-sans text-slate-400 font-normal">件</span>
                          </div>
                        </div>

                        <div className="h-5 sm:h-6 w-px bg-slate-700" />

                        <div className="min-w-0 max-w-[100px] sm:max-w-[130px]">
                          <div className="text-[8px] sm:text-[9px] text-slate-400 font-bold">LAST_CHECKPOINT</div>
                          <div className="text-[10px] sm:text-[11px] text-slate-300 font-bold font-sans truncate">
                            {stat.lastCheckpoint}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Status line & Big Touch Load Button */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          READY
                        </span>
                        <span className="text-slate-600">|</span>
                        <span>最終記録: {updatedDate}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playConfirmSound();
                          onSelectWorld(world);
                        }}
                        onMouseEnter={playHoverSound}
                        className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-amber-500 text-black font-black font-mono text-xs sm:text-sm border-b-3 border-amber-700 hover:bg-amber-400 active:translate-y-0.5 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap rounded-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>冒険を再開 (LOAD)</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Big Create Button */}
        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onOpenCreate();
          }}
          onMouseEnter={playHoverSound}
          className="w-full mt-4 bg-amber-500 text-black px-4 py-3.5 font-black font-mono text-xs sm:text-sm hover:bg-amber-400 border-b-3 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer min-h-[46px] rounded-xs"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ NEW_WORLD // 新しいワールドを作成</span>
        </button>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm font-sans"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              playModalCloseSound();
              setDeleteTarget(null);
            }
          }}
        >
          <div className="w-full max-w-sm bg-[#161a25] border-2 border-rose-500 p-5 shadow-[0_0_30px_rgba(244,63,94,0.4)] space-y-3.5 rounded-xs">
            <div className="flex items-center gap-2 text-rose-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white font-mono">WARNING // セーブデータの消去</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              「<span className="text-amber-400 font-bold">{deleteTarget.name}</span>」を消去しますか？
              記録されたすべてのロケーションや写真が削除されます。
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  playModalCloseSound();
                  setDeleteTarget(null);
                }}
                className="flex-1 py-2 border border-slate-700 bg-[#12151e] text-slate-300 text-xs font-bold hover:text-white cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2 bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 border-b-2 border-rose-800 cursor-pointer"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
