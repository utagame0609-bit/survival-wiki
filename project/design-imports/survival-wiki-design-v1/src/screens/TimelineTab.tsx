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
      <div className="py-20 text-center border-2 border-dashed border-[#1a2333] rounded-sm bg-[#070c18]/50 p-6 font-mono">
        <Calendar className="w-12 h-12 mx-auto text-zinc-600 mb-3" />
        <p className="text-sm font-bold text-zinc-300">タイムライン記録がありません</p>
        <p className="text-xs text-zinc-500 mt-1">
          「ロケーション」タブから拠点を記録すると、日毎の旅の軌跡がここに編纂されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Timeline Header Info */}
      <div className="p-4 bg-[#0a1120] border-2 border-[#1a2333] flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#070c18] border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wider">CHRONOLOGICAL LOG // 冒険年代記</h2>
            <p className="text-xs text-slate-400">
              総生存記録: <span className="text-emerald-400 font-bold">{groupedByDay.length} 日間</span> / 全{' '}
              <span className="text-amber-400 font-bold">{locations.length} 件</span> のチェックポイント
            </p>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          FOUNDED: {new Date(world.created_at).toLocaleDateString('ja-JP')}
        </div>
      </div>

      {/* Days List */}
      <div className="relative pl-4 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1a2333]">
        {groupedByDay.map((group) => {
          const isCollapsed = expandedDays[group.dateKey] === false;
          const hasHighlighted = group.items.some((i) => i.id === highlightLocationId);

          return (
            <div key={group.dateKey} className="relative">
              {/* Day Marker Dot */}
              <div
                className={`absolute -left-4 sm:-left-8 top-2 w-5 h-5 border-2 flex items-center justify-center text-[9px] font-bold z-10 transition-all font-mono ${
                  hasHighlighted
                    ? 'border-amber-400 bg-amber-400 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                    : 'border-amber-500/60 bg-[#070c18] text-amber-400'
                }`}
              >
                {group.dayNumber}
              </div>

              {/* Day Header Card */}
              <div className="bg-[#0d1627] border-2 border-[#1a2333] overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => toggleDay(group.dateKey)}
                  className="w-full px-4 py-2.5 bg-[#0a1120] hover:bg-[#10192d] flex items-center justify-between text-left transition-colors border-b border-[#1a2333]"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-bold font-mono">
                      DAY_{String(group.dayNumber).padStart(2, '0')}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-200">{group.dateLabel}</span>
                    <span className="text-xs text-slate-500">({group.items.length} 拠点)</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-[10px]">{isCollapsed ? '展開' : '折りたたむ'}</span>
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </div>
                </button>

                {/* Day Items */}
                {!isCollapsed && (
                  <div className="p-4 space-y-3 divide-y divide-[#1a2333]">
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
      className={`pt-3 first:pt-0 transition-all ${
        isHighlighted
          ? 'p-3 bg-amber-500/10 border border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
          : ''
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Photo thumbnail if exists */}
        {photoUrl && (
          <div className="w-full sm:w-28 h-20 shrink-0 overflow-hidden bg-[#070c18] border border-slate-700">
            <img src={photoUrl} alt={location.name} className="w-full h-full object-cover pixelated" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-amber-400 font-mono">{timeStr}</span>
            <span className="text-slate-600">/</span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">{location.name}</h4>
          </div>

          <div className="inline-flex items-center gap-2 text-[10px] text-emerald-400 font-bold mb-2 font-mono">
            <Navigation className="w-3 h-3 text-amber-400" />
            <span>POS: [X:{location.x}, Y:{location.y}, Z:{location.z}]</span>
          </div>

          {location.detail_memo && (
            <p className="text-xs text-slate-300 leading-relaxed bg-[#070c18] p-2.5 border border-[#1a2333] mb-2 whitespace-pre-wrap">
              {location.detail_memo}
            </p>
          )}

          {location.members.length > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] text-cyan-400">
              <span className="text-slate-500">同行:</span>
              {location.members.map((m) => (
                <span key={m.id} className="underline">
                  {m.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
