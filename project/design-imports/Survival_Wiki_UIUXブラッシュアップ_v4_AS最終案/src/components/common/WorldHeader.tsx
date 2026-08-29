import React from 'react';
import { World } from '../../types';
import { Users, Calendar, Shield } from 'lucide-react';

interface WorldHeaderProps {
  world: World;
  onEditWorld?: () => void;
}

export const WorldHeader: React.FC<WorldHeaderProps> = ({ world, onEditWorld }) => {
  return (
    <div className="w-full bg-[#0F172A]/80 border border-[#1E293B] rounded-lg p-2.5 sm:p-4 mb-3 sm:mb-4 relative overflow-hidden hud-bracket">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Left Side: Avatar + Main Titles */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={world.leaderAvatar}
              alt={world.leaderName}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover border-2 border-[#F59E0B]/60 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-[#0B1018] border border-[#F59E0B] text-[#F59E0B] text-[8px] sm:text-[9px] font-mono font-bold px-1 rounded">
              SLOT-{world.slotNumber}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#F59E0B] flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {world.leaderName}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#64748B] flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                EST. {world.createdAt}
              </span>
            </div>

            <h2 className="text-sm sm:text-lg font-game font-bold text-[#F8FAFC] tracking-wide truncate mt-0.5">
              {world.name}
            </h2>

            {world.memo && (
              <p className="text-[11px] sm:text-xs text-[#94A3B8] font-jp line-clamp-1 sm:line-clamp-2 mt-0.5 sm:mt-1 leading-tight sm:leading-relaxed">
                {world.memo}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Party Members avatars & Quick stats */}
        <div className="flex items-center justify-between md:justify-end gap-2.5 sm:gap-4 pt-1.5 md:pt-0 border-t md:border-t-0 border-[#1E293B]/70 shrink-0">
          <div className="flex items-center sm:flex-col sm:items-end gap-1.5 sm:gap-0">
            <div className="text-[9px] sm:text-[10px] font-mono text-[#94A3B8] flex items-center gap-1">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#06B6D4]" />
              <span className="hidden sm:inline">PARTY</span> ({world.partyMembers.length + 1})
            </div>

            <div className="flex items-center gap-1 sm:mt-1">
              {world.partyMembers.length > 0 ? (
                world.partyMembers.map((member) => (
                  <div key={member.id} className="relative group" title={member.name}>
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-5 h-5 sm:w-7 sm:h-7 rounded object-cover border border-[#06B6D4]/50 hover:border-[#06B6D4] transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))
              ) : (
                <span className="text-[10px] sm:text-[11px] font-jp text-[#64748B]">単独探索</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pl-2 sm:pl-3 border-l border-[#1E293B]">
            <div className="text-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#161F30] rounded border border-[#334155]/50">
              <div className="text-[8px] sm:text-[9px] font-mono text-[#64748B]">DAYS</div>
              <div className="text-xs font-mono font-bold text-[#F59E0B]">{world.daysCount}</div>
            </div>
            <div className="text-center px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[#161F30] rounded border border-[#334155]/50">
              <div className="text-[8px] sm:text-[9px] font-mono text-[#64748B]">RECORDS</div>
              <div className="text-xs font-mono font-bold text-[#06B6D4]">{world.recordsCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
