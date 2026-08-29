import { Plus, Search } from 'lucide-react';
import {
  playChestOpenSound,
  playAddSound,
  playHoverSound,
  playInputFocusSound,
} from '@/lib/sound';

type LocationsToolbarProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  collectionCount: number;
  onOpenCollection: () => void;
  onCreate: () => void;
};

export function LocationsToolbar({
  searchQuery,
  onSearchQueryChange,
  collectionCount,
  onOpenCollection,
  onCreate,
}: LocationsToolbarProps) {
  const handleOpenCollection = () => {
    playChestOpenSound();
    onOpenCollection();
  };

  const handleCreate = () => {
    playAddSound();
    onCreate();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-[#1e2330] p-3 sm:p-4 border-2 border-[#2d3548] shadow-md">
      <div className="flex-1 flex items-center gap-2 bg-[#12151f] border border-slate-700 px-3.5 py-2.5 focus-within:border-amber-500 min-h-[44px]">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          onFocus={playInputFocusSound}
          placeholder="ロケーション名やメモを検索..."
          aria-label="ロケーションを検索"
          className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange('')}
            onMouseEnter={playHoverSound}
            className="min-h-[32px] min-w-[32px] flex items-center justify-center text-slate-400 hover:text-white"
            aria-label="検索をクリア"
          >
            ×
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenCollection}
          onMouseEnter={playHoverSound}
          className="min-h-[44px] px-3.5 py-2.5 bg-[#12151f] border border-amber-500/50 text-amber-400 text-xs sm:text-sm font-bold hover:bg-amber-500/15 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          aria-label="宝箱コレクションを開く"
        >
          <span aria-hidden="true" className="relative block w-4 h-3.5 rounded-[1px] border border-amber-400 bg-[#cc8e00] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]">
            <span className="absolute left-[-1px] right-[-1px] top-[2px] h-[2px] bg-[#12151f]" />
            <span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-[2px] h-[3px] bg-amber-400" />
          </span>
          <span className="hidden sm:inline">CHEST</span>
          <span className="font-mono">({collectionCount})</span>
        </button>

        <button
          type="button"
          onClick={handleCreate}
          onMouseEnter={playHoverSound}
          className="min-h-[44px] flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-amber-500 text-black text-xs sm:text-sm font-black border-b-3 border-amber-700 hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ 新規記録</span>
        </button>
      </div>
    </div>
  );
}
