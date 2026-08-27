import { ArrowUpDown } from 'lucide-react';
import type { MouseEventHandler } from 'react';
import { playHoverSound, playToggleSound } from '@/lib/sound';

type SortOrder = 'asc' | 'desc';

type LocationsListHeaderProps = {
  searchQuery: string;
  locationCount: number;
  resultCount: number;
  sortOrder: SortOrder;
  onSortOrderChange: () => void;
};

export function LocationsListHeader({
  searchQuery,
  locationCount,
  resultCount,
  sortOrder,
  onSortOrderChange,
}: LocationsListHeaderProps) {
  const handleSortClick: MouseEventHandler<HTMLButtonElement> = () => {
    playToggleSound();
    onSortOrderChange();
  };

  return (
    <div className="flex items-center justify-between gap-3 text-xs text-slate-400 font-mono px-1">
      <span className="truncate">
        {searchQuery.trim()
          ? `「${searchQuery.trim()}」検索結果: ${resultCount}件`
          : `登録ロケーション: ${locationCount}件`}
      </span>
      <button
        type="button"
        onClick={handleSortClick}
        onMouseEnter={playHoverSound}
        className="min-h-[38px] shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-[#12151f] border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 text-[11px] transition-colors"
        aria-label="ロケーションの並び順を変更"
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
        <span>{sortOrder === 'asc' ? '古い順' : '新しい順'}</span>
      </button>
    </div>
  );
}
