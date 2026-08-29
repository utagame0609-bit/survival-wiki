import React from 'react';
import { World } from '../../types';
import { Plus, Play, Edit3, Trash2, Shield, Calendar, Clock, Users, Database } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface WorldSelectScreenProps {
  worlds: World[];
  onSelectWorld: (worldId: string) => void;
  onCreateWorld: () => void;
  onEditWorld: (world: World) => void;
  onDeleteWorld: (worldId: string) => void;
}

export const WorldSelectScreen: React.FC<WorldSelectScreenProps> = ({
  worlds,
  onSelectWorld,
  onCreateWorld,
  onEditWorld,
  onDeleteWorld,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Title Bar Banner */}
      <div className="mb-6 sm:mb-8 text-center sm:text-left border-b border-[#1E293B] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono text-[#06B6D4] tracking-widest uppercase flex items-center gap-1.5 justify-center sm:justify-start">
            <Database className="w-3.5 h-3.5" />
            <span>SAVE SLOTS // 冒険の書一覧</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-game font-bold text-[#F8FAFC] tracking-wider mt-1">
            WORLD ARCHIVES
          </h2>
        </div>

        <button
          id="btn-create-world-top"
          type="button"
          onClick={() => {
            soundEngine.playSe('menu_select');
            onCreateWorld();
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] active:translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>＋ 新しいワールドを作成</span>
        </button>
      </div>

      {/* World Save Slots List */}
      <div className="space-y-4">
        {worlds.map((world) => (
          <div
            key={world.id}
            id={`save-slot-${world.slotNumber}`}
            className="group relative bg-[#0F172A]/90 hover:bg-[#131E35] border border-[#1E293B] hover:border-[#F59E0B]/60 rounded-lg p-4 transition-all duration-200 shadow-md hud-bracket"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left Column: Slot Tag, Leader Avatar, Title & Memo */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                {/* Slot Indicator badge + Leader Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={world.leaderAvatar}
                    alt={world.leaderName}
                    className="w-14 h-14 rounded-md object-cover border-2 border-[#334155] group-hover:border-[#F59E0B] transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -top-2 -left-2 px-1.5 py-0.5 bg-[#0B1018] text-[#F59E0B] border border-[#F59E0B] text-[10px] font-mono font-bold rounded">
                    SLOT 0{world.slotNumber}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-[#F59E0B] flex items-center gap-1 font-semibold">
                      <Shield className="w-3 h-3" />
                      {world.leaderName}
                    </span>
                    <span className="text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {world.createdAt}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-game font-bold text-[#F1F5F9] tracking-wide truncate mt-0.5 group-hover:text-[#FDE68A] transition-colors">
                    {world.name}
                  </h3>

                  {world.memo && (
                    <p className="text-xs text-[#94A3B8] font-jp line-clamp-1 mt-0.5">
                      {world.memo}
                    </p>
                  )}

                  {/* Party avatars and companions summary */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center -space-x-1.5">
                      {world.partyMembers.map((m) => (
                        <img
                          key={m.id}
                          src={m.avatar}
                          alt={m.name}
                          className="w-5 h-5 rounded-full object-cover border border-[#0B1018]"
                          title={m.name}
                          referrerPolicy="no-referrer"
                        />
                      ))}
                    </div>
                    {world.partyMembers.length > 0 ? (
                      <span className="text-[10px] font-mono text-[#64748B]">
                        +{world.partyMembers.length} 名の同行者
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#64748B]">単独探索</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle/Right: Stats & Actions (Naturally repositioned for clean full-width usage on mobile, and right-aligned on PC) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#1E293B]/70 shrink-0">
                {/* Stats Blocks */}
                <div className="flex items-center justify-around sm:justify-start gap-2">
                  <div className="flex-1 sm:flex-initial text-center px-2.5 py-1.5 bg-[#0B1018] rounded border border-[#1E293B]">
                    <div className="text-[9px] font-mono text-[#64748B]">DAYS</div>
                    <div className="text-sm font-mono font-bold text-[#F59E0B]">{world.daysCount}</div>
                  </div>
                  <div className="flex-1 sm:flex-initial text-center px-2.5 py-1.5 bg-[#0B1018] rounded border border-[#1E293B]">
                    <div className="text-[9px] font-mono text-[#64748B]">RECORDS</div>
                    <div className="text-sm font-mono font-bold text-[#06B6D4]">{world.recordsCount}</div>
                  </div>
                </div>

                {/* Edit & Delete & LOAD Action Buttons */}
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    id={`btn-edit-world-${world.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playSe('menu_select');
                      onEditWorld(world);
                    }}
                    className="p-2.5 sm:p-2 rounded text-[#94A3B8] hover:text-[#F8FAFC] bg-[#161F30] hover:bg-[#1E293B] border border-[#334155]/60 hover:border-[#F59E0B]/50 transition-colors shrink-0"
                    title="ワールド設定を編集"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-delete-world-${world.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEngine.playSe('danger_delete');
                      onDeleteWorld(world.id);
                    }}
                    className="p-2.5 sm:p-2 rounded text-[#64748B] hover:text-[#EF4444] bg-[#161F30] hover:bg-[#2A161C] border border-[#334155]/60 hover:border-[#EF4444]/50 transition-colors shrink-0"
                    title="ワールドを削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Primary LOAD Button */}
                  <button
                    id={`btn-load-world-${world.id}`}
                    type="button"
                    onClick={() => {
                      soundEngine.playSe('save_record');
                      onSelectWorld(world.id);
                    }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>LOAD</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom info footer: Last recorded timestamp */}
            <div className="mt-2.5 pt-2 border-t border-[#1E293B]/50 flex items-center justify-between text-[10px] font-mono text-[#64748B]">
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                LAST RECORD: {world.lastRecordAt}
              </span>
              <span className="text-[#06B6D4]/70">READY TO RESUME</span>
            </div>
          </div>
        ))}

        {/* Empty Slot Card for creation */}
        {worlds.length < 5 && (
          <button
            id="empty-slot-create"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_select');
              onCreateWorld();
            }}
            className="w-full py-6 rounded-lg border-2 border-dashed border-[#1E293B] hover:border-[#F59E0B]/60 bg-[#0B1018]/50 hover:bg-[#0F172A]/80 flex flex-col items-center justify-center gap-2 text-[#64748B] hover:text-[#F59E0B] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#161F30] group-hover:bg-[#1E293B] border border-[#334155] flex items-center justify-center">
              <Plus className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="text-xs font-game tracking-wider">
              ＋ SLOT 0{worlds.length + 1} // 新規冒険の書を作成
            </div>
          </button>
        )}
      </div>
    </div>
  );
};
