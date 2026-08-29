import { useMemo, useState } from 'react';
import { ArrowUpDown, ChevronRight, Clock, MapPin, Package, Plus, Search, Share2, Shield, Users, Youtube } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playHoverSound, playInputFocusSound, playRecordSelectSound } from '@/lib/sound';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

type TimelineRecordsViewProps = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onSelectLocation: (location: LocationWithPhotos) => void;
  onOpenChest: () => void;
  onCreate: () => void;
  onOpenSns?: (location: LocationWithPhotos) => void;
};

type SortOrder = 'newest' | 'oldest' | 'checkpoint';

type DayGroup = {
  date: string;
  displayDate: string;
  items: LocationWithPhotos[];
};

export function TimelineRecordsView({
  world,
  locations,
  onSelectLocation,
  onOpenChest,
  onCreate,
  onOpenSns,
}: TimelineRecordsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const totalPhotos = locations.reduce((sum, location) => sum + location.photos.length, 0);
  const allTags = useMemo(
    () => Array.from(new Set(locations.flatMap((location) => location.tags ?? []))),
    [locations],
  );

  const groupedByDay = useMemo<DayGroup[]>(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    const filtered = locations
      .filter((location) => {
        const matchesSearch =
          normalized === '' ||
          location.name.toLocaleLowerCase().includes(normalized) ||
          location.detail_memo?.toLocaleLowerCase().includes(normalized) ||
          (location.tags ?? []).some((tag) => tag.toLocaleLowerCase().includes(normalized));
        const matchesTag = !selectedTag || (location.tags ?? []).includes(selectedTag);
        return matchesSearch && matchesTag;
      })
      .sort((a, b) => {
        if (sortOrder === 'checkpoint') {
          return Number(Boolean(b.is_checkpoint)) - Number(Boolean(a.is_checkpoint));
        }
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
      });

    const byDate = new Map<string, LocationWithPhotos[]>();
    filtered.forEach((location) => {
      const key = location.created_at.split('T')[0];
      const group = byDate.get(key) ?? [];
      group.push(location);
      byDate.set(key, group);
    });

    const dates = Array.from(byDate.keys()).sort((a, b) =>
      sortOrder === 'oldest' ? a.localeCompare(b) : b.localeCompare(a),
    );

    return dates.map((date, index) => {
      const items = byDate.get(date) ?? [];
      const firstCreatedAt = items[0]?.created_at ?? date;
      const displayDate = new Date(firstCreatedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      });

      return {
        date,
        displayDate: `DAY ${String(index + 1).padStart(2, '0')} // ${displayDate}`,
        items,
      };
    });
  }, [locations, searchQuery, selectedTag, sortOrder]);

  return (
    <div className="space-y-3.5 sm:space-y-4">
      <div className="bg-[#141824] border-2 border-slate-800 p-2.5 sm:p-3 space-y-2.5 shadow-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="拠点名・タグ・メモで検索..."
            className="w-full min-h-[42px] pl-9 pr-4 py-2 bg-[#0f121b] border-2 border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:border-amber-400 outline-none transition-colors rounded-xs"
          />
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
              onFocus={playInputFocusSound}
              onMouseEnter={playHoverSound}
              className="min-h-[38px] bg-[#0f121b] border-2 border-slate-700 text-slate-200 text-xs px-2.5 py-1 outline-none font-mono cursor-pointer rounded-xs transition-all hover:border-amber-400 hover:bg-[#1a1f2d] hover:text-amber-300 hover:shadow-[0_0_10px_rgba(245,158,11,0.18)] hover:-translate-y-[3px]"
            >
              <option value="newest">新しい順 (NEWEST)</option>
              <option value="oldest">古い順 (OLDEST)</option>
              <option value="checkpoint">チェックポイント優先</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              onOpenChest();
            }}
            onMouseEnter={playHoverSound}
            className="min-h-[38px] px-3 py-1.5 border-2 border-amber-500/80 bg-[#161a25] text-amber-300 hover:border-amber-400 font-mono text-xs font-black flex items-center gap-1.5 active:scale-95 cursor-pointer rounded-xs shadow-sm"
          >
            <Package className="w-4 h-4 text-amber-400" />
            <span>CHEST ({totalPhotos})</span>
          </button>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              onMouseEnter={playHoverSound}
              className={`min-h-[28px] px-2.5 text-[10px] sm:text-xs font-mono font-bold shrink-0 transition-colors rounded-xs cursor-pointer border ${
                selectedTag === null
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-[#0f121b] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              ALL ({locations.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                onMouseEnter={playHoverSound}
                className={`min-h-[28px] px-2.5 text-[10px] sm:text-xs font-mono shrink-0 transition-colors rounded-xs cursor-pointer border ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-[#0f121b] text-slate-300 border-slate-700 hover:border-amber-500'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {groupedByDay.length === 0 ? (
        <div className="border-2 border-slate-800 bg-[#0f1424] p-8 text-center space-y-3 shadow-md">
          <MapPin className="w-10 h-10 mx-auto text-amber-400/80" />
          <h3 className="text-sm font-bold text-white font-mono">記録が見つかりません</h3>
          <p className="text-xs text-slate-400">検索条件を変更してみてください。</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 pt-1">
          {groupedByDay.map((group) => (
            <div key={group.date} className="relative pl-4 sm:pl-6 border-l-2 border-amber-500/60 space-y-2.5">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-black shadow-[0_0_10px_#f59e0b]" />
              <div className="inline-flex items-center gap-2 bg-[#10141f] border-2 border-amber-500/50 px-3 py-1 font-mono text-xs font-bold text-amber-300 rounded-xs shadow-sm">
                <span>{group.displayDate}</span>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/20 px-1.5 rounded-xs">{group.items.length}件の記録</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {group.items.map((location) => {
                  const primaryPhoto = location.photos[0]?.storage_path;
                  const memberNames = (location.member_ids ?? [])
                    .map((id) => world.members.find((member) => member.id === id)?.name)
                    .filter(Boolean) as string[];
                  const timeStr = new Date(location.created_at).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={location.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        playRecordSelectSound();
                        onSelectLocation(location);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          playRecordSelectSound();
                          onSelectLocation(location);
                        }
                      }}
                      onMouseEnter={playHoverSound}
                      className="group border-2 border-slate-700/90 bg-[#161a25] hover:border-amber-400 hover:bg-[#1b2030] hover:shadow-[0_0_16px_rgba(245,158,11,0.18)] hover:brightness-110 hover:-translate-y-[3px] transition-all p-2.5 sm:p-3 flex items-start gap-3 cursor-pointer rounded-xs shadow-[0_3px_12px_rgba(0,0,0,0.3)] relative overflow-hidden outline-none focus-visible:border-amber-400"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-black border-2 border-slate-800 group-hover:border-amber-500/60 overflow-hidden relative">
                        {primaryPhoto ? (
                          <LocationPhotoImage
                            storagePath={primaryPhoto}
                            alt={location.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1017] text-slate-500 font-mono text-[9px]">
                            <MapPin className="w-5 h-5 text-amber-500/60 mb-0.5" />
                            <span>NO PIC</span>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                              <Clock className="w-3 h-3" />
                              {timeStr}
                            </span>
                            {location.is_checkpoint && (
                              <span className="px-1.5 bg-amber-500/25 text-amber-300 border border-amber-400 text-[9px] font-mono font-black flex items-center gap-0.5 shrink-0">
                                <Shield className="w-2.5 h-2.5" /> CP
                              </span>
                            )}
                            {location.youtube_url && (
                              <span className="px-1 bg-red-600/90 text-white text-[9px] font-mono font-bold flex items-center gap-0.5 shrink-0">
                                <Youtube className="w-2.5 h-2.5" /> VIDEO
                              </span>
                            )}
                          </div>

                          {onOpenSns && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenSns(location);
                              }}
                              onMouseEnter={playHoverSound}
                              className="p-1 text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-600 border border-cyan-500/40 shrink-0"
                              title="X共有"
                              aria-label="X共有"
                            >
                              <Share2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 truncate">
                          {location.name}
                        </h4>

                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {location.detail_memo || '（メモ未入力）'}
                        </p>

                        {memberNames.length > 0 && (
                          <div className="flex items-center gap-1 pt-0.5 overflow-hidden">
                            <Users className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                            {memberNames.map((name) => (
                              <span
                                key={name}
                                className="px-1 bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[8px] font-mono font-bold truncate max-w-[72px]"
                              >
                                @{name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onCreate}
        onMouseEnter={playHoverSound}
        aria-label="新規記録を追加"
        className="fixed right-4 bottom-16 sm:right-8 sm:bottom-6 z-30 min-h-[48px] px-4 sm:px-5 rounded-full border-2 border-amber-400 bg-[#111624] text-amber-300 font-black font-mono text-xs sm:text-sm shadow-[0_4px_18px_rgba(0,0,0,0.45)] hover:bg-amber-500 hover:text-black hover:border-amber-300 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        <span>記録を追加</span>
      </button>
    </div>
  );
}
