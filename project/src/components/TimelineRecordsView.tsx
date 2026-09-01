import { useState } from 'react';
import { ArrowUpDown, Package, Plus, Search } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';
import { TimelineRecordCard } from '@/components/TimelineRecordCard';
import { useTimelineRecordGroups, type TimelineSortOrder } from '@/components/useTimelineRecordGroups';

type TimelineRecordsViewProps = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onSelectLocation: (location: LocationWithPhotos) => void;
  onOpenChest: () => void;
  onCreate: () => void;
  onOpenSns?: (location: LocationWithPhotos) => void;
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
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('newest');
  const { totalPhotos, groupedByDay } = useTimelineRecordGroups({
    locations,
    members: world.members,
    searchQuery,
    sortOrder,
  });

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
                {group.items.map((location) => (
                  <TimelineRecordCard
                    key={location.id}
                    world={world}
                    location={location}
                    onSelect={onSelectLocation}
                    onOpenSns={onOpenSns}
                  />
                ))}
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
