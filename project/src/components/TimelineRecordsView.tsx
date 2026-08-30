import { useMemo, useState } from 'react';
import { ArrowUpDown, Clock, MapPin, Package, Plus, Search, Share2, Shield, Users, Youtube } from 'lucide-react';
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

type SortOrder = 'newest' | 'oldest';

type DayGroup = {
  date: string;
  dayNumber: number;
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
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const totalPhotos = locations.reduce((sum, location) => sum + location.photos.length, 0);

  const groupedByDay = useMemo<DayGroup[]>(() => {
    const normalized = searchQuery.trim().toLocaleLowerCase();
    const filtered = locations
      .filter((location) => {
        if (!normalized) return true;
        const memberNames = (location.member_ids ?? [])
          .map((id) => world.members.find((member) => member.id === id)?.name ?? '')
          .join(' ')
          .toLocaleLowerCase();
        return (
          location.name.toLocaleLowerCase().includes(normalized) ||
          location.detail_memo?.toLocaleLowerCase().includes(normalized) ||
          memberNames.includes(normalized) ||
          (location.tags ?? []).some((tag) => tag.toLocaleLowerCase().includes(normalized))
        );
      })
      .sort((a, b) => {
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

    return dates.map((date, index) => ({
      date,
      dayNumber: index + 1,
      items: byDate.get(date) ?? [],
    }));
  }, [locations, searchQuery, sortOrder, world.members]);

  return (
    <div className="w-full pb-36 md:pb-6">
      <div className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A]/70 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="タイトル・メモ・同行者で探索記録を検索..."
            className="w-full rounded border border-[#334155] bg-[#0B1018] py-2 pl-9 pr-3 text-xs text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
          />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'));
            }}
            onMouseEnter={playHoverSound}
            className="game-ui-font flex items-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 py-2 text-xs text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
            title="並び順を切り替え"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-[#F59E0B]" />
            <span>{sortOrder === 'newest' ? '新しい順' : '古い順'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              onOpenChest();
            }}
            onMouseEnter={playHoverSound}
            className="game-ui-font flex items-center gap-1.5 rounded border border-[#F59E0B]/60 bg-[#161F30] px-3.5 py-2 text-xs text-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-all hover:border-[#F59E0B] hover:bg-[#1E293B] active:scale-95"
            title="CHEST 写真宝箱を開く"
          >
            <Package className="h-4 w-4 text-[#F59E0B]" />
            <span>CHEST</span>
            <span className="ml-0.5 rounded bg-[#F59E0B]/20 px-1.5 text-[10px] font-mono font-bold text-[#F59E0B]">
              {totalPhotos}枚
            </span>
          </button>
        </div>
      </div>

      {groupedByDay.length > 0 ? (
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <div key={group.date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded border border-[#334155]/60 bg-[#161F30] px-3 py-1 shadow-sm">
                  <span className="font-mono text-xs font-bold text-[#F59E0B]">
                    DAY {String(group.dayNumber).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-[#334155]">//</span>
                  <span className="font-mono text-xs text-[#94A3B8]">{group.date}</span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-[#1E293B] to-transparent" />
                <span className="font-mono text-[11px] text-[#64748B]">{group.items.length} RECORDS</span>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
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
                      className="group relative flex cursor-pointer items-start gap-3.5 rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-3 shadow-md outline-none transition-all duration-200 hover:border-[#F59E0B]/60 hover:bg-[#131E35] focus-visible:border-[#F59E0B]/60 sm:p-3.5"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#334155] bg-[#0B1018] sm:h-24 sm:w-24">
                        {primaryPhoto ? (
                          <LocationPhotoImage
                            storagePath={primaryPhoto}
                            alt={location.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center text-[#64748B]">
                            <MapPin className="h-6 w-6 stroke-[1.5]" />
                            <span className="mt-1 font-mono text-[9px]">NO PIC</span>
                          </div>
                        )}
                        {location.photos.length > 1 && (
                          <span className="absolute bottom-1 right-1 rounded border border-[#06B6D4]/40 bg-[#0B1018]/80 px-1 text-[9px] font-mono text-[#06B6D4]">
                            +{location.photos.length - 1}
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
                        <div>
                          <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[11px] text-[#64748B]">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex shrink-0 items-center gap-1 text-[#06B6D4]">
                                <Clock className="h-3 w-3" />{timeStr}
                              </span>
                              {location.is_checkpoint && (
                                <span className="flex shrink-0 items-center gap-0.5 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-1 text-[9px] text-[#F59E0B]">
                                  <Shield className="h-2.5 w-2.5" />CP
                                </span>
                              )}
                              {location.youtube_url && (
                                <span className="shrink-0 rounded bg-red-600/90 px-1 text-[9px] font-bold text-white">
                                  <Youtube className="mr-0.5 inline h-2.5 w-2.5" />VIDEO
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
                                className="shrink-0 rounded border border-[#06B6D4]/30 bg-[#0B1018]/60 p-1 text-[#06B6D4] transition-colors hover:bg-[#06B6D4] hover:text-[#0B1018]"
                                title="X共有"
                                aria-label="X共有"
                              >
                                <Share2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>

                          <h4 className="game-ui-font line-clamp-1 text-sm font-bold leading-snug text-[#F1F5F9] transition-colors group-hover:text-[#FDE68A] sm:text-base">
                            {location.name}
                          </h4>
                          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
                            {location.detail_memo || '（メモ未入力）'}
                          </p>
                        </div>

                        {memberNames.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                            <Users className="h-2.5 w-2.5 shrink-0 text-[#06B6D4]" />
                            <span className="truncate">同行: {memberNames.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#1E293B] bg-[#0F172A]/40 px-4 py-16 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-[#64748B]" />
          <h3 className="game-ui-font text-sm text-[#94A3B8]">探索記録が見つかりません</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#64748B]">
            {searchQuery
              ? '検索条件に一致する記録がありません。キーワードを変更してください。'
              : 'まだ記録がありません。右下の「記録を追加」から日々の発見を記録しましょう。'}
          </p>
        </div>
      )}

      <div className="fixed bottom-[4.25rem] right-2.5 z-30 sm:right-4 md:bottom-6 md:right-8">
        <button
          type="button"
          onClick={onCreate}
          onMouseEnter={playHoverSound}
          aria-label="新規記録を追加"
          className="game-ui-font flex items-center gap-2 rounded-full bg-[#F59E0B] px-4 py-3 text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all hover:scale-105 hover:bg-[#D97706] active:scale-95 sm:text-sm"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>記録を追加</span>
        </button>
      </div>
    </div>
  );
}
