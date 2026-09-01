import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Package, Plus } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playHoverSound } from '@/lib/sound';
import { loadUserTimelineSortOrder, saveUserTimelineSortOrder } from '@/lib/userTimelineSettings';
import { TimelineRecordCard } from '@/components/TimelineRecordCard';
import { TimelineRecordsToolbar } from '@/components/TimelineRecordsToolbar';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { useTimelineRecordGroups, type TimelineSortOrder } from '@/hooks/useTimelineRecordGroups';

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
  const [sortOrder, setSortOrder] = useState<TimelineSortOrder>('oldest');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const { totalPhotos, groupedByDay, availableYears, availableMonths } = useTimelineRecordGroups({
    locations,
    searchQuery,
    sortOrder,
    selectedYear,
    selectedMonth,
  });

  useEffect(() => {
    let active = true;
    void loadUserTimelineSortOrder()
      .then((savedSortOrder) => {
        if (active) setSortOrder(savedSortOrder);
      })
      .catch((error) => console.error('Failed to load timeline sort order:', error));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (expandedDate && !groupedByDay.some((group) => group.date === expandedDate)) {
      setExpandedDate(null);
    }
  }, [expandedDate, groupedByDay]);

  useEffect(() => {
    if (selectedMonth && !availableMonths.includes(selectedMonth)) setSelectedMonth('');
  }, [availableMonths, selectedMonth]);

  const handleSortToggle = () => {
    const nextSortOrder: TimelineSortOrder = sortOrder === 'oldest' ? 'newest' : 'oldest';
    setSortOrder(nextSortOrder);
    void saveUserTimelineSortOrder(nextSortOrder).catch((error) =>
      console.error('Failed to save timeline sort order:', error),
    );
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth('');
  };

  const hasActiveFilter = Boolean(searchQuery.trim() || selectedYear || selectedMonth);

  return (
    <div className="w-full pb-36 md:pb-6">
      <TimelineRecordsToolbar
        searchQuery={searchQuery}
        sortOrder={sortOrder}
        totalPhotos={totalPhotos}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        availableYears={availableYears}
        availableMonths={availableMonths}
        onSearchChange={setSearchQuery}
        onSortToggle={handleSortToggle}
        onYearChange={handleYearChange}
        onMonthChange={setSelectedMonth}
        onOpenChest={onOpenChest}
      />

      {groupedByDay.length > 0 ? (
        <div className="space-y-3.5 sm:space-y-4">
          {groupedByDay.map((group) => {
            const expanded = expandedDate === group.date;
            const dayBackgroundPhoto = locations
              .filter((location) => location.created_at.startsWith(group.date))
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .find((location) => location.photos[0]?.storage_path)
              ?.photos[0]?.storage_path;

            return (
              <div key={group.date} className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    playConfirmSound();
                    setExpandedDate((current) => (current === group.date ? null : group.date));
                  }}
                  onMouseEnter={playHoverSound}
                  aria-expanded={expanded}
                  className={`group relative flex min-h-[3.25rem] w-full items-center overflow-hidden rounded-lg border text-left shadow-sm transition-all sm:min-h-[3.5rem] ${expanded ? 'border-[#F59E0B]/50 bg-[#182033]' : 'border-[#334155]/60 bg-[#161F30] hover:border-[#64748B]'}`}
                >
                  {dayBackgroundPhoto && (
                    <>
                      <LocationPhotoImage
                        storagePath={dayBackgroundPhoto}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover opacity-[0.18] blur-[0.5px] transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0B1018]/96 via-[#111827]/86 to-[#0F172A]/76" />
                    </>
                  )}

                  <div className="relative z-10 flex w-full items-center gap-3 px-4 py-2.5 sm:px-5 sm:py-3">
                    {expanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#F59E0B]" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B] transition-colors group-hover:text-[#94A3B8]" />
                    )}
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span className="font-mono text-xs font-bold tracking-wide text-[#F59E0B] sm:text-[13px]">
                        DAY {String(group.dayNumber).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-[#475569]">//</span>
                      <span className="truncate font-mono text-xs text-[#CBD5E1]">{group.date}</span>
                    </div>
                    <span className="shrink-0 rounded border border-[#334155]/70 bg-[#0B1018]/55 px-2 py-1 font-mono text-[10px] tracking-wide text-[#94A3B8] sm:text-[11px]">
                      {group.items.length} RECORDS
                    </span>
                  </div>
                </button>

                {expanded && (
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
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#1E293B] bg-[#0F172A]/40 px-4 py-16 text-center">
          <Package className="mx-auto mb-3 h-12 w-12 text-[#64748B]" />
          <h3 className="game-ui-font text-sm text-[#94A3B8]">探索記録が見つかりません</h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-[#64748B]">
            {hasActiveFilter
              ? '検索・年月条件に一致する記録がありません。条件を変更してください。'
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
