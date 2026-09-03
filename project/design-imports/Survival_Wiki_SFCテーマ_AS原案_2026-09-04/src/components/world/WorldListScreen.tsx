import React, { useState } from 'react';
import { Plus, Play, Edit3, Trash2, Users, Calendar, Clock, Sparkles, Search } from 'lucide-react';
import { World } from '../../types';
import { DPad } from '../common/DPad';

interface WorldListScreenProps {
  gameName: string;
  worlds: World[];
  onLoadWorld: (world: World) => void;
  onCreateWorld: () => void;
  onEditWorld: (world: World) => void;
  onDeleteWorld: (world: World) => void;
}

export const WorldListScreen: React.FC<WorldListScreenProps> = ({
  gameName,
  worlds,
  onLoadWorld,
  onCreateWorld,
  onEditWorld,
  onDeleteWorld,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(worlds[0]?.id || null);

  const filteredWorlds = worlds.filter(
    (w) =>
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.memo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner / Game Title HUD */}
      <div className="sfc-panel p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Cartridge Icon / Bezel */}
          <div className="w-12 h-12 rounded-lg bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] flex items-center justify-center shadow-inner">
            <span className="font-dot text-lg font-bold text-[var(--accent-blue)]">ROM</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[var(--accent-blue)] text-white text-[10px] font-dot px-2 py-0.5 rounded font-bold">
                ACTIVE TITLE
              </span>
              <span className="font-dot text-xs text-[var(--text-muted)] font-bold">
                16-BIT MEMORY CARD
              </span>
            </div>
            <h2 className="font-sfc-title text-base sm:text-xl font-bold text-[var(--text-main)] mt-0.5">
              {gameName}
            </h2>
          </div>
        </div>

        {/* Action Controls: Search & New Save Slot (B Button: Green) */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-60">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="冒険の書を検索..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
            />
          </div>

          {/* New Slot Button (Green B Button) */}
          <button
            type="button"
            onClick={onCreateWorld}
            className="sfc-btn sfc-btn-convex sfc-btn-b px-4 py-2 text-xs sm:text-sm font-dot flex items-center gap-2 shadow-md w-full sm:w-auto justify-center"
          >
            <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
              B
            </span>
            <Plus className="w-4 h-4" />
            <span>新規ワールド作成 (NEW SLOT)</span>
          </button>
        </div>
      </div>

      {/* Main Save Slot List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Save Slots List (Left / Main) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] border border-black" />
              <h3 className="font-dot text-sm font-bold tracking-wider text-[var(--text-main)]">
                冒険の書スロット選択 (SELECT SAVE CARTRIDGE)
              </h3>
            </div>
            <span className="font-dot text-xs text-[var(--text-muted)]">
              SLOTS: {filteredWorlds.length} / 10
            </span>
          </div>

          {filteredWorlds.length === 0 ? (
            <div className="sfc-panel p-8 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[var(--surface-recessed)] border-2 border-dashed border-[var(--border-main)] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[var(--text-muted)]" />
              </div>
              <p className="font-dot text-sm text-[var(--text-main)] font-bold">
                該当する冒険の書（セーブデータ）が見つかりません
              </p>
              <button
                type="button"
                onClick={onCreateWorld}
                className="sfc-btn sfc-btn-convex sfc-btn-b px-4 py-1.5 text-xs font-dot"
              >
                新しいスロットを作成
              </button>
            </div>
          ) : (
            filteredWorlds.map((world) => {
              const isSelected = selectedSlot === world.id;
              return (
                <div
                  key={world.id}
                  onClick={() => setSelectedSlot(world.id)}
                  className={`sfc-cartridge transition-all duration-150 cursor-pointer ${
                    isSelected ? 'ring-2 ring-[var(--accent-blue)] scale-[1.01]' : 'hover:scale-[1.005]'
                  }`}
                >
                  {/* Cartridge Top Grip Ribs / Grooves */}
                  <div className="h-4 w-full sfc-cartridge-grooves rounded-t-[10px] border-b border-[var(--border-main)] opacity-70" />

                  {/* Cartridge Body / Label Area */}
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Header: Slot Badge, Title, Created Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-groove)] pb-3">
                      <div className="flex items-center gap-3">
                        {/* Slot Number Label */}
                        <div className="px-2.5 py-1 rounded bg-[var(--border-dark)] text-white font-dot text-xs font-bold border border-white/30 shadow">
                          SLOT {String(world.slotNumber).padStart(2, '0')}
                        </div>
                        <h4 className="font-dot text-base sm:text-lg font-bold text-[var(--text-main)] truncate">
                          {world.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-dot text-[var(--text-muted)]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {world.created_at}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Player Profile, Memo, Companion Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                      {/* Player Avatar */}
                      <div className="sm:col-span-3 flex items-center sm:flex-col sm:items-center gap-3 text-center">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-[var(--border-dark)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.6)] bg-black">
                          {world.playerPhotoUrl ? (
                            <img
                              src={world.playerPhotoUrl}
                              alt={world.player}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-dot text-white bg-gradient-to-br from-slate-700 to-slate-900">
                              {world.player.slice(0, 2)}
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-dot text-white text-center py-0.5">
                            LEADER
                          </div>
                        </div>
                        <div className="text-left sm:text-center">
                          <span className="font-dot text-xs font-bold text-[var(--text-main)] block">
                            {world.player}
                          </span>
                          <span className="text-[10px] font-dot text-[var(--text-muted)]">
                            生存日数: {world.daysCount} DAYS
                          </span>
                        </div>
                      </div>

                      {/* Memo & Companions */}
                      <div className="sm:col-span-9 space-y-2.5">
                        <p className="text-xs text-[var(--text-main)] bg-[var(--surface-label)] p-2.5 rounded border border-[var(--border-main)] shadow-inner leading-relaxed line-clamp-2">
                          {world.memo || '（ワールドメモ未設定）'}
                        </p>

                        {/* Companion Member Badges */}
                        {world.members && world.members.length > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-dot text-[var(--text-muted)] flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              同行者:
                            </span>
                            {world.members.map((m) => (
                              <span
                                key={m.id}
                                className="px-2 py-0.5 rounded text-[10px] font-dot bg-[var(--surface-2)] border border-[var(--border-main)] text-[var(--text-main)]"
                              >
                                {m.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] font-dot text-[var(--text-muted)]">
                            同行者: 単独サバイバル
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Footer Stats & ABXY Action Buttons */}
                    <div className="pt-3 border-t border-[var(--border-groove)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Mini Stats Badges */}
                      <div className="flex items-center gap-2 font-dot text-xs">
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-[var(--text-main)]">
                          RECORDS: <strong className="text-[var(--accent-blue)]">{world.recordsCount}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-[var(--text-muted)] hidden xs:inline flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          最終: {world.lastRecordDate || '---'}
                        </span>
                      </div>

                      {/* Action Buttons (ABXY Themed) */}
                      <div className="flex items-center gap-2 justify-end">
                        {/* Edit Button (Y Button: Yellow) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorld(world);
                          }}
                          className="sfc-btn sfc-btn-convex sfc-btn-y px-2.5 py-1.5 text-xs font-dot flex items-center gap-1"
                          title="スロット編集 (Y: EDIT)"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-black/10 flex items-center justify-center text-[9px] font-bold">
                            Y
                          </span>
                          <Edit3 className="w-3 h-3" />
                          <span className="hidden sm:inline">編集</span>
                        </button>

                        {/* Delete Button (A Button: Red) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteWorld(world);
                          }}
                          className="sfc-btn sfc-btn-convex sfc-btn-a px-2.5 py-1.5 text-xs font-dot flex items-center gap-1"
                          title="スロット削除 (A: DELETE)"
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-white/20 flex items-center justify-center text-[9px] font-bold">
                            A
                          </span>
                          <Trash2 className="w-3 h-3" />
                          <span className="hidden sm:inline">削除</span>
                        </button>

                        {/* LOAD Button (X Button: Blue - Primary Action) */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onLoadWorld(world);
                          }}
                          className="sfc-btn sfc-btn-convex sfc-btn-x px-4 py-1.5 text-xs sm:text-sm font-dot flex items-center gap-1.5 shadow-md"
                          title="冒険の書をロード (X: LOAD)"
                        >
                          <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                            X
                          </span>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="font-bold">LOAD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Retro Console Visual HUD & Controller Guide (PC Display) */}
        <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-20">
          {/* Console Unit Housing Decoration */}
          <div className="sfc-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2">
              <span className="font-dot text-xs font-bold text-[var(--text-main)]">
                CONTROLLER HUD
              </span>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full sfc-led-green" />
                <span className="font-dot text-[10px] text-[var(--text-muted)]">READY</span>
              </div>
            </div>

            {/* D-Pad & Key Bind Guide */}
            <div className="flex items-center justify-center py-2">
              <DPad size="md" />
            </div>

            {/* ABXY Controller Guide */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-main)] font-dot text-xs">
              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--surface-recessed)]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-blue)] text-white text-[10px] flex items-center justify-center font-bold">
                    X
                  </span>
                  <span className="text-[var(--text-main)] font-bold">LOAD WORLD</span>
                </div>
                <span className="text-[var(--text-muted)] text-[10px]">決定 / 突入</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--surface-recessed)]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-yellow)] text-black text-[10px] flex items-center justify-center font-bold">
                    Y
                  </span>
                  <span className="text-[var(--text-main)] font-bold">EDIT / SEARCH</span>
                </div>
                <span className="text-[var(--text-muted)] text-[10px]">情報変更</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--surface-recessed)]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-green)] text-white text-[10px] flex items-center justify-center font-bold">
                    B
                  </span>
                  <span className="text-[var(--text-main)] font-bold">NEW SLOT</span>
                </div>
                <span className="text-[var(--text-muted)] text-[10px]">新規作成</span>
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-[var(--surface-recessed)]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-red)] text-white text-[10px] flex items-center justify-center font-bold">
                    A
                  </span>
                  <span className="text-[var(--text-main)] font-bold">DELETE SLOT</span>
                </div>
                <span className="text-[var(--text-muted)] text-[10px]">消去 / 警告</span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="p-2.5 rounded bg-[var(--surface-label)] border border-[var(--border-main)] text-[11px] text-[var(--text-muted)] leading-relaxed">
              💡 <strong>HINT:</strong> 冒険の書（ワールド）をLOADすると、タイムライン記録の蓄積や3人の編纂官によるAI Wiki生成機能が解放されます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
