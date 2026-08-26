import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, Navigation, ChevronDown, ChevronUp } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playConfirmSound, playChestOpenSound } from '@/lib/sound';

interface TimelineTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  highlightLocationId?: string | null;
}

export function TimelineTab({ world, locations, highlightLocationId }: TimelineTabProps) {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});

  // Group locations by calendar day
  const groupedByDay = React.useMemo(() => {
    // Sort chronological
    const sorted = [...locations].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const worldStartDate = world.created_at ? new Date(world.created_at) : new Date();

    const groups: {
      dateKey: string;
      dayNumber: number;
      dateLabel: string;
      items: LocationWithPhotos[];
    }[] = [];

    const dateMap = new Map<string, LocationWithPhotos[]>();

    sorted.forEach((loc) => {
      const d = new Date(loc.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!dateMap.has(key)) {
        dateMap.set(key, []);
      }
      dateMap.get(key)!.push(loc);
    });

    let dayCounter = 1;
    dateMap.forEach((items, dateKey) => {
      const dateObj = new Date(dateKey);
      groups.push({
        dateKey,
        dayNumber: dayCounter++,
        dateLabel: dateObj.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'short',
        }),
        items,
      });
    });

    return groups.reverse(); // Newest day on top
  }, [locations, world.created_at]);

  const toggleDay = (key: string) => {
    playConfirmSound();
    setExpandedDays((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key],
    }));
  };

  if (locations.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6 font-sans">
        <Calendar className="w-12 h-12 mx-auto text-slate-500 mb-3" />
        <p className="text-base font-bold text-white">タイムライン記録がありません</p>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          「拠点一覧」タブから拠点を記録すると、日毎の旅の軌跡がここに編纂されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Timeline Header Info */}
      <div className="p-4 bg-[#1e2330] border-2 border-[#2d3548] flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#141824] border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wider">冒険年代記</h2>
            <p className="text-xs sm:text-sm text-slate-300">
              総生存記録: <span className="text-emerald-400 font-bold font-mono">{groupedByDay.length} 日間</span> / 全{' '}
              <span className="text-amber-400 font-bold font-mono">{locations.length} 件</span> のチェックポイント
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          設立日: {new Date(world.created_at).toLocaleDateString('ja-JP')}
        </div>
      </div>

      {/* Days List */}
      <div className="relative pl-5 sm:pl-8 space-y-4 sm:space-y-6 before:absolute before:left-2.5 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#2d3548]">
        {groupedByDay.map((group) => {
          const isCollapsed = expandedDays[group.dateKey] === false;
          const hasHighlighted = group.items.some((i) => i.id === highlightLocationId);

          return (
            <div key={group.dateKey} className="relative">
              {/* Day Marker Dot */}
              <div
                className={`absolute -left-5 sm:-left-8 top-3 w-6 h-6 border-2 flex items-center justify-center text-xs font-bold z-10 transition-all font-mono ${
                  hasHighlighted
                    ? 'border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                    : 'border-amber-500/80 bg-[#141824] text-amber-400'
                }`}
              >
                {group.dayNumber}
              </div>

              {/* Day Header Card */}
              <div className="bg-[#1e2330] border-2 border-[#2d3548] overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => toggleDay(group.dateKey)}
                  className="w-full min-h-[48px] px-4 py-3 bg-[#161a24] hover:bg-[#1a2030] flex items-center justify-between text-left transition-colors border-b border-[#2d3548] cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                    <span className="px-2.5 py-0.5 bg-amber-500 text-black text-xs font-bold font-mono">
                      DAY_{String(group.dayNumber).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white">{group.dateLabel}</span>
                    <span className="text-xs text-slate-400 font-mono">({group.items.length} 拠点)</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-xs font-medium">{isCollapsed ? '展開' : '折畳'}</span>
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {/* Day Items */}
                {!isCollapsed && (
                  <div className="p-3 sm:p-4 space-y-3 divide-y divide-[#2d3548]">
                    {group.items.map((item) => (
                      <TimelineItemCard
                        key={item.id}
                        location={item}
                        isHighlighted={item.id === highlightLocationId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimelineItemCard({
  location,
  isHighlighted,
}: {
  location: LocationWithPhotos;
  isHighlighted?: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState('');

  React.useEffect(() => {
    const main = location.photos.find((p) => p.is_main) || location.photos[0];
    if (main) {
      getPhotoUrl(main.storage_path).then(setPhotoUrl).catch(() => {});
    }
  }, [location.photos]);

  const timeStr = new Date(location.created_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`pt-3.5 first:pt-0 transition-all ${
        isHighlighted
          ? 'p-3 bg-amber-500/15 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
          : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Photo thumbnail if exists */}
        {photoUrl && (
          <div className="w-full sm:w-32 h-24 shrink-0 overflow-hidden bg-[#12151f] border border-[#2d3548]">
            <img src={photoUrl} alt={location.name} className="w-full h-full object-cover pixelated" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold text-amber-400 font-mono bg-[#141824] px-2 py-0.5 border border-amber-500/30">
              {timeStr}
            </span>
            <h4 className="text-sm sm:text-base font-bold text-white truncate">{location.name}</h4>
          </div>

          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-bold mb-2 font-mono bg-[#12151f] px-2.5 py-1 border border-slate-700">
            <Navigation className="w-3.5 h-3.5 text-amber-400" />
            <span>POS: [X:{location.x}, Y:{location.y}, Z:{location.z}]</span>
          </div>

          {location.detail_memo && (
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed bg-[#141824] p-3 border border-[#2d3548] mb-2.5 whitespace-pre-wrap">
              {location.detail_memo}
            </p>
          )}

          {location.members.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-cyan-300">
              <span className="text-slate-400 font-medium">同行:</span>
              <div className="flex flex-wrap gap-1.5">
                {location.members.map((m) => (
                  <span key={m.id} className="px-2 py-0.5 bg-[#12151f] border border-cyan-500/40 text-cyan-300 font-medium">
                    @{m.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
