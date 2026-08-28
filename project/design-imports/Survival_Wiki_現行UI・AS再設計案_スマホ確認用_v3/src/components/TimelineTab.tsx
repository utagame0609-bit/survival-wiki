import React from 'react';
import { Calendar, Clock, MapPin, Shield, ChevronRight, Users } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { playConfirmSound, playHoverSound } from '../lib/soundEngine';
import { useViewMode } from '../context/ViewModeContext';

interface TimelineTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onSelectLocation: (loc: LocationWithPhotos) => void;
}

export function TimelineTab({
  world,
  locations,
  onSelectLocation,
}: TimelineTabProps) {
  const { isMobile } = useViewMode();

  // Group locations by Date (YYYY-MM-DD)
  const groupedByDay: { date: string; displayDate: string; items: LocationWithPhotos[] }[] = [];
  const mapByDate = new Map<string, LocationWithPhotos[]>();

  // Sort chronological (oldest to newest for story timeline)
  const sorted = [...locations].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  sorted.forEach((loc) => {
    const d = new Date(loc.created_at);
    const dateKey = loc.created_at.split('T')[0];
    if (!mapByDate.has(dateKey)) {
      mapByDate.set(dateKey, []);
    }
    mapByDate.get(dateKey)!.push(loc);
  });

  Array.from(mapByDate.entries()).forEach(([key, items], index) => {
    const dateObj = new Date(items[0].created_at);
    const displayDate = dateObj.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    groupedByDay.push({
      date: key,
      displayDate: `DAY ${String(index + 1).padStart(2, '0')} // ${displayDate}`,
      items,
    });
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {groupedByDay.length === 0 ? (
        <div className="border-2 border-slate-800 bg-[#141824] p-8 text-center space-y-3 rounded-xs">
          <div className="w-12 h-12 border border-slate-700 bg-[#0e121a] flex items-center justify-center mx-auto text-slate-400">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">タイムライン記録がありません</h3>
          <p className="text-xs text-slate-400">
            ロケーションや冒険の記録を追加すると、日付ごとの時系列タイムラインが自動生成されます。
          </p>
        </div>
      ) : (
        groupedByDay.map((group, groupIdx) => (
          <div key={group.date} className="relative pl-3 sm:pl-6 border-l-2 border-amber-500/50 space-y-3">
            {/* Day Header Marker */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center shadow-[0_0_8px_#f59e0b]" />

            <div className="bg-[#10141f] border border-amber-500/40 px-3 py-1.5 inline-block font-mono text-xs font-bold text-amber-300 rounded-xs shadow-sm">
              {group.displayDate} ({group.items.length}件の記録)
            </div>

            {/* List of items in this day */}
            <div className={`grid gap-2.5 sm:gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {group.items.map((loc) => {
                const timeStr = new Date(loc.created_at).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const primaryPhoto = loc.photos[0]?.storage_path;

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      playConfirmSound();
                      onSelectLocation(loc);
                    }}
                    onMouseEnter={playHoverSound}
                    className="border border-slate-700 bg-[#161a25] p-3 hover:border-amber-400 transition-all flex items-start gap-3 cursor-pointer rounded-xs group"
                  >
                    {/* Thumbnail if available */}
                    {primaryPhoto ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-black border border-slate-700 overflow-hidden rounded-xs">
                        <img
                          src={primaryPhoto}
                          alt={loc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-[#0e121a] border border-slate-800 flex items-center justify-center text-slate-600 rounded-xs">
                        <MapPin className="w-6 h-6 text-amber-500/50" />
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {timeStr}
                        </span>
                        {loc.is_checkpoint && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-400 text-[9px] font-mono font-bold rounded-xs flex items-center gap-0.5">
                            <Shield className="w-2.5 h-2.5" />
                            CP
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                        {loc.name}
                      </h4>

                      <div className="text-[10px] font-mono text-emerald-400">
                        X:{loc.x} Y:{loc.y} Z:{loc.z}
                      </div>

                      {loc.detail_memo && (
                        <p className="text-[11px] text-slate-300 line-clamp-1 font-sans">
                          {loc.detail_memo}
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
