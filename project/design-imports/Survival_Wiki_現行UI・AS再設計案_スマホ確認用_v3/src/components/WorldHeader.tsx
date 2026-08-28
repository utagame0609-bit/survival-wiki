import React from 'react';
import { Users, Calendar, MapPin } from 'lucide-react';
import { WorldWithMembers } from '../types';
import { useViewMode } from '../context/ViewModeContext';

interface WorldHeaderProps {
  world: WorldWithMembers;
}

export function WorldHeader({ world }: WorldHeaderProps) {
  const { isMobile } = useViewMode();
  const createdDate = world.created_at
    ? new Date(world.created_at).toLocaleDateString('ja-JP')
    : '2026/8/21';

  return (
    <div className="border-2 border-slate-700/90 bg-[#161a25] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.3)] mb-3 sm:mb-5 rounded-xs">
      <div className={`flex ${isMobile ? 'flex-col gap-2.5' : 'flex-row items-center justify-between gap-4'}`}>
        {/* Left Side: Avatar & World Information */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Avatar frame */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 border-2 border-amber-500/90 bg-[#0f121b] overflow-hidden p-0.5 shadow-[0_0_10px_rgba(245,158,11,0.25)] rounded-xs">
            {world.player_photo_path ? (
              <img
                src={world.player_photo_path}
                alt={world.player || 'Player'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* World Name & Memo */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.2 text-[10px] sm:text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xs">
                生存者: {world.player || 'ウタ'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                設立: {createdDate}
              </span>
            </div>

            <h1 className="text-base sm:text-xl font-black text-white tracking-tight break-words">
              {world.name}
            </h1>

            {world.memo && (
              <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                {world.memo}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Members Tags with Photo Thumbnails */}
        <div className={`flex items-center gap-1.5 sm:gap-2 flex-wrap ${isMobile ? 'pt-2 border-t border-slate-800' : 'justify-end shrink-0'}`}>
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>同行仲間:</span>
          </span>

          {world.members
            .filter((m) => m.name !== world.player)
            .map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1 bg-[#0d1220] border border-cyan-500/50 px-1.5 py-0.5 rounded-xs shadow-xs"
              >
                <div className="w-5 h-5 rounded-xs overflow-hidden border border-cyan-400 bg-black shrink-0">
                  {m.photo_path ? (
                    <img src={m.photo_path} alt={m.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-3 h-3 text-cyan-400 m-auto mt-0.5" />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-300">
                  @{m.name}
                </span>
              </div>
            ))}

          {world.members.filter((m) => m.name !== world.player).length === 0 && (
            <span className="text-[10px] font-mono text-slate-500 italic bg-[#0d1220] px-2 py-0.5 rounded-xs border border-slate-800">
              単独探索中
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
