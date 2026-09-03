import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Package, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playAddSound, playConfirmSound, playHoverSound } from '@/lib/sound';
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
    <div className="mx-auto w-full max-w-4xl pb-36 md:pb-6">
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
        <div className="space-y-3">
          {groupedByDay.map((group) => {
            const expanded = expandedDate === group.date;

            const dateObj = new Date(`${group.date}T12:00:00Z`);
            const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
            const dow = Number.isNaN(dateObj.getTime()) ? '' : daysOfWeek[dateObj.getUTCDay()];
            const formattedDate = `${group.date.replace(/-/g, '.')} ${dow}`.trim();

            const dayLocations = locations.filter((location) =>
              location.created_at.startsWith(group.date),
            );
            const sortedDayLocations = [...dayLocations].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            );
            const dayBackgroundPhoto = sortedDayLocations.find(
              (location) => location.photos[0]?.storage_path,
            )?.photos[0]?.storage_path;

            const hasCheckpoints = group.items.some((item) => item.is_checkpoint);
            const hasVideos = group.items.some((item) => item.youtube_url);

            return (
              <div
                key={group.date}
                className={`overflow-hidden rounded-lg transition-all duration-200 ${
                  expanded
                    ? 'border border-[#F59E0B]/50 bg-[#182033] shadow-[0_0_20px_rgba(245,158,11,0.05)]'
                    : 'border border-[#334155]/60 bg-[#161F30] opacity-85 hover:border-[#64748B] hover:opacity-100'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    playConfirmSound();
                    setExpandedDate((current) => (current === group.date ? null : group.date));
                  }}
                  onMouseEnter={playHoverSound}
                  aria-expanded={expanded}
                  className="group relative flex w-full items-center gap-4 px-5 py-3.5 text-left outline-none transition-all"
                >
                  {dayBackgroundPhoto && (
                    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-30">
                      <LocationPhotoImage
                        storagePath={dayBackgroundPhoto}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover object-center filter contrast-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1018] via-[#0B1018]/90 to-transparent" />
                    </div>
                  )}

                  <div className="relative z-10 flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 stroke-[2.5] text-[#F59E0B]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 stroke-[2] text-[#64748B] transition-colors group-hover:text-[#94A3B8]" />
                      )}

                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="font-mono text-xs font-bold tracking-widest text-[#F59E0B] sm:text-sm">
                          DAY {String(group.dayNumber).padStart(2, '0')}
                        </span>
                        <span className={`text-xs ${expanded ? 'text-[#475569]' : 'text-[#334155]'}`}>//</span>
                        <span
                          className={`font-mono text-xs tracking-tight ${
                            expanded ? 'text-[#CBD5E1]' : 'text-[#94A3B8]'
                          }`}
                        >
                          {formattedDate}
                        </span>

                        {hasCheckpoints && (
                          <span className="hidden rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-1 py-0.5 font-mono text-[9px] text-[#F59E0B] sm:inline">
                            CP
                          </span>
                        )}
                        {hasVideos && (
                          <span className="hidden rounded border border-red-600/40 bg-red-600/20 px-1 py-0.5 font-mono text-[9px] font-bold uppercase text-red-400 sm:inline">
                            VIDEO
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span
                        className={`rounded px-3 py-1 font-mono text-[10px] tracking-widest transition-colors ${
                          expanded
                            ? 'border border-[#334155] bg-[#0B1018]/60 text-[#94A3B8]'
                            : 'border border-[#334155]/40 bg-[#0B1018]/40 text-[#475569]'
                        }`}
                      >
                        {group.items.length} 件
                      </span>
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-[#F59E0B]/20"
                    >
                      <div className="p-3.5 sm:p-4">
                        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
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
                    </motion.div>
                  )}
                </AnimatePresence>
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

      <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#1E293B] pt-4 text-[#475569] sm:flex-row">
        <p className="font-mono text-[10px] tracking-[0.3em]">
          冒険記録システム
        </p>
        <span className="font-mono text-[10px] text-[#64748B]">
          総記録数: {locations.length} 件
        </span>
      </div>

      <div className="fixed bottom-[4.25rem] right-3 z-30 sm:right-6 md:bottom-8 md:right-10">
        <button
          type="button"
          onClick={() => {
            playAddSound();
            onCreate();
          }}
          onMouseEnter={playHoverSound}
          aria-label="新規記録を追加"
          className="flex items-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3 font-mono text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_5px_20px_rgba(245,158,11,0.3)] transition-transform hover:bg-[#D97706] active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>記録を追加</span>
        </button>
      </div>
    </div>
  );
}
