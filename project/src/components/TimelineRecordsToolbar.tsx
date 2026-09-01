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
    <section className="mb-6 grid gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A]/70 p-3 shadow-md backdrop-blur-sm lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          onFocus={playInputFocusSound}
          placeholder="タイトル・メモ・同行者で探索記録を検索..."
          className="w-full rounded border border-[#334155] bg-[#0B1018] py-2 pl-10 pr-3 text-xs text-[#F8FAFC] outline-none transition-colors placeholder:text-[#475569] focus:border-[#F59E0B]/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onSortToggle();
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center gap-2 rounded border border-[#334155] bg-[#161F30] px-3 py-2 text-xs font-mono font-bold text-[#94A3B8] transition-colors hover:border-[#64748B] hover:text-[#F8FAFC] active:scale-95"
          title="並び順を切り替え"
        >
          <ArrowUpDown className="h-3.5 w-3.5 text-[#94A3B8]" />
          <span>{sortOrder === 'newest' ? '新しい順' : '古い順'}</span>
        </button>

        <div className="flex items-center gap-2 rounded border border-[#334155] bg-[#0B1018] px-2.5 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
          <div className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#64748B]">
            <select
              value={selectedYear}
              onChange={(event) => onYearChange(event.target.value)}
              onFocus={playInputFocusSound}
              className="cursor-pointer bg-transparent text-[#94A3B8] outline-none"
              aria-label="記録年で絞り込み"
            >
              <option value="" className="bg-[#0B1018] text-[#F8FAFC]">全年</option>
              {availableYears.map((year) => (
                <option key={year} value={year} className="bg-[#0B1018] text-[#F8FAFC]">{year}年</option>
              ))}
            </select>
            <span>/</span>
            <select
              value={selectedMonth}
              onChange={(event) => onMonthChange(event.target.value)}
              onFocus={playInputFocusSound}
              disabled={!selectedYear}
              className="cursor-pointer bg-transparent text-[#94A3B8] outline-none disabled:text-[#475569]"
              aria-label="記録月で絞り込み"
            >
              <option value="" className="bg-[#0B1018] text-[#F8FAFC]">全月</option>
              {availableMonths.map((month) => (
                <option key={month} value={month} className="bg-[#0B1018] text-[#F8FAFC]">{Number(month)}月</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onOpenChest();
          }}
          onMouseEnter={playHoverSound}
          className="flex items-center gap-2 rounded border border-[#F59E0B]/40 bg-[#161F30] px-4 py-2 text-xs font-mono font-bold text-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all hover:border-[#F59E0B] hover:bg-[#1E293B] hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] active:scale-95"
          title="CHEST 写真宝箱を開く"
        >
          <Package className="h-4 w-4 text-[#F59E0B]" />
          <span>CHEST</span>
          <span className="rounded bg-[#F59E0B]/20 px-1.5 font-mono text-[10px] text-[#F59E0B]">
            {totalPhotos}枚
          </span>
        </button>
      </div>
    </section>
  );
}
