import { ArrowUpDown, CalendarDays, Package, Search } from 'lucide-react';
import { playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';
import type { TimelineSortOrder } from '@/hooks/useTimelineRecordGroups';

type TimelineRecordsToolbarProps = {
  searchQuery: string;
  sortOrder: TimelineSortOrder;
  totalPhotos: number;
  selectedYear: string;
  selectedMonth: string;
  availableYears: string[];
  availableMonths: string[];
  onSearchChange: (value: string) => void;
  onSortToggle: () => void;
  onYearChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onOpenChest: () => void;
};

export function TimelineRecordsToolbar({
  searchQuery,
  sortOrder,
  totalPhotos,
  selectedYear,
  selectedMonth,
  availableYears,
  availableMonths,
  onSearchChange,
  onSortToggle,
  onYearChange,
  onMonthChange,
  onOpenChest,
}: TimelineRecordsToolbarProps) {
  return (
    <div className="mb-6 grid gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A]/70 p-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="relative min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={playInputFocusSound}
          placeholder="タイトル・メモ・同行者で探索記録を検索..."
          className="w-full rounded border border-[#334155] bg-[#0B1018] py-2 pl-9 pr-3 text-xs text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
        />
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onSortToggle();
          }}
          onMouseEnter={playHoverSound}
          className="game-ui-font flex h-9 shrink-0 items-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 text-xs text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          title="並び順を切り替え"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-[#F59E0B]" />
          <span>{sortOrder === 'newest' ? '新しい順' : '古い順'}</span>
        </button>

        <div className="flex h-9 min-w-0 flex-1 items-center gap-1 rounded border border-[#334155] bg-[#0B1018] px-2 sm:w-[9.75rem] sm:flex-none">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
          <select
            value={selectedYear}
            onChange={(event) => onYearChange(event.target.value)}
            onFocus={playInputFocusSound}
            className="game-ui-font min-w-0 flex-1 cursor-pointer bg-transparent text-[11px] font-bold tracking-tight text-[#94A3B8] outline-none sm:w-[4.6rem] sm:flex-none"
            aria-label="記録年で絞り込み"
          >
            <option value="">全年</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <span className="font-mono text-[9px] text-[#334155]">/</span>
          <select
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
            onFocus={playInputFocusSound}
            disabled={!selectedYear}
            className="game-ui-font min-w-0 flex-1 cursor-pointer bg-transparent text-[11px] font-bold tracking-tight text-[#94A3B8] outline-none disabled:cursor-default disabled:text-[#334155] sm:w-[3.6rem] sm:flex-none"
            aria-label="記録月で絞り込み"
          >
            <option value="">全月</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>{Number(month)}月</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onOpenChest();
          }}
          onMouseEnter={playHoverSound}
          className="game-ui-font flex h-9 min-w-[9.75rem] shrink-0 items-center justify-center gap-1.5 rounded border border-[#F59E0B]/60 bg-[#161F30] px-3 text-xs text-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-all hover:border-[#F59E0B] hover:bg-[#1E293B] active:scale-95"
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
  );
}
