import { ArrowUpDown, Package, Search } from 'lucide-react';
import { playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';
import type { TimelineSortOrder } from '@/components/useTimelineRecordGroups';

type TimelineRecordsToolbarProps = {
  searchQuery: string;
  sortOrder: TimelineSortOrder;
  totalPhotos: number;
  onSearchChange: (value: string) => void;
  onSortToggle: () => void;
  onOpenChest: () => void;
};

export function TimelineRecordsToolbar({
  searchQuery,
  sortOrder,
  totalPhotos,
  onSearchChange,
  onSortToggle,
  onOpenChest,
}: TimelineRecordsToolbarProps) {
  return (
    <div className="mb-6 flex flex-col items-stretch justify-between gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A]/70 p-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
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

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => {
            playConfirmSound();
            onSortToggle();
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
  );
}
