import React from 'react';
import { Calendar, Users, Shield, MapPin, Sparkles, Clock } from 'lucide-react';
import { World } from '../../types';

interface WorldHeaderProps {
  world: World;
  onEditWorld?: () => void;
}

export const WorldHeader: React.FC<WorldHeaderProps> = ({ world, onEditWorld }) => {
  return (
    <div className="sfc-panel p-4 sm:p-5 relative overflow-hidden">
      {/* Background Micro Scanline Overlay */}
      <div className="absolute inset-0 sfc-scanlines pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Player Avatar in Bezel & World Metadata */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Protagonist Portrait with 16-bit double bezel */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 border-[var(--border-dark)] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.8)] bg-black shrink-0">
            {world.playerPhotoUrl ? (
              <img
                src={world.playerPhotoUrl}
                alt={world.player}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-dot text-sm text-white bg-slate-800">
                {world.player.slice(0, 2)}
              </div>
            )}
            <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] sm:text-[9px] font-dot text-white text-center py-0.5 tracking-wider font-bold">
              PLAYER 1P
            </div>
          </div>

          {/* Name & World Header Text */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-[var(--border-dark)] text-white text-[10px] font-dot font-bold">
                SLOT {String(world.slotNumber).padStart(2, '0')}
              </span>
              <h2 className="font-dot text-lg sm:text-xl font-bold text-[var(--text-main)]">
                {world.name}
              </h2>
            </div>

            <div className="flex items-center gap-3 text-xs font-dot text-[var(--text-muted)] flex-wrap">
              <span className="text-[var(--text-main)] font-bold">
                指揮官: {world.player}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                創設日: {world.created_at}
              </span>
            </div>

            {/* World Memo */}
            {world.memo && (
              <p className="text-xs text-[var(--text-main)] bg-[var(--surface-label)] px-3 py-1.5 rounded border border-[var(--border-main)] max-w-2xl shadow-inner line-clamp-2 mt-1">
                {world.memo}
              </p>
            )}
          </div>
        </div>

        {/* Right: Companions & Survival Counters HUD */}
        <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0 border-[var(--border-groove)]">
          {/* Survival Stats HUD */}
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-center shadow-inner">
              <span className="text-[9px] font-dot text-[var(--text-muted)] block">DAYS SURVIVED</span>
              <span className="font-dot text-sm sm:text-base font-bold text-[var(--accent-red)]">
                {world.daysCount} <small className="text-[10px]">日</small>
              </span>
            </div>

            <div className="px-3 py-1.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-center shadow-inner">
              <span className="text-[9px] font-dot text-[var(--text-muted)] block">LOGGED RECORDS</span>
              <span className="font-dot text-sm sm:text-base font-bold text-[var(--accent-blue)]">
                {world.recordsCount} <small className="text-[10px]">件</small>
              </span>
            </div>
          </div>

          {/* Companions Badge Row */}
          {world.members && world.members.length > 0 && (
            <div className="flex items-center gap-1.5 justify-end flex-wrap">
              <span className="text-[10px] font-dot text-[var(--text-muted)] flex items-center gap-1">
                <Users className="w-3 h-3" />
                同行部隊:
              </span>
              <div className="flex items-center -space-x-1.5">
                {world.members.map((m) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className="w-6 h-6 rounded-full overflow-hidden border border-black shadow bg-slate-700"
                  >
                    {m.photoUrl ? (
                      <img src={m.photoUrl} alt={m.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-white">
                        {m.name.slice(0, 1)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
