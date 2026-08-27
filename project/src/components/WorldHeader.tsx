import { User, Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';

type WorldHeaderProps = {
  world: WorldWithMembers;
  playerPhotoUrl: string;
};

export function WorldHeader({ world, playerPhotoUrl }: WorldHeaderProps) {
  return (
    <div className="mb-4 sm:mb-6 bg-[#1e2330] border-2 border-[#2d3548] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        <div className="w-[52px] h-[52px] sm:w-14 sm:h-14 bg-[#141824] border-2 border-amber-500 overflow-hidden shrink-0 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.25)]">
          {playerPhotoUrl ? (
            <img src={playerPhotoUrl} alt="Player" className="w-full h-full object-cover pixelated" />
          ) : (
            <User className="w-7 h-7 text-amber-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono">
              生存者: {world.player || '名無しの司令官'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              設立日: {new Date(world.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white tracking-wide truncate">{world.name}</h2>
          {world.memo && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">{world.memo}</p>
          )}
        </div>
      </div>

      {world.members.length > 0 && (
        <div className="flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-[#2d3548] pt-3 md:pt-0 md:pl-5">
          <Users className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {world.members.map((member) => (
              <span key={member.id} className="text-xs px-2.5 py-1 bg-[#141824] border border-cyan-500/40 text-cyan-300 font-medium">
                @{member.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
