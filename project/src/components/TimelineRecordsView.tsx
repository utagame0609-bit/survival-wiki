import { useState } from 'react';
import { Package, Plus } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playHoverSound } from '@/lib/sound';
import { TimelineRecordCard } from '@/components/TimelineRecordCard';
import { TimelineRecordsToolbar } from '@/components/TimelineRecordsToolbar';
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
    searchQuery,
    sortOrder,
  });

  return (
    <div className="w-full pb-36 md:pb-6">
      <TimelineRecordsToolbar
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        totalPhotos={totalPhotos}
        onSearchChange={setSearchQuery}
        onSortToggle={() => setSortOrder((current) => (current === 'newest' ? 'oldest' : 'newest'))}
        onOpenChest={onOpenChest}
      />

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
