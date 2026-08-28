import { ArrowUpDown, Clock } from 'lucide-react';
import { playHoverSound, playToggleSound } from '@/lib/sound';

type TimelineHeaderProps = {
  totalRecords: number;
  totalDays: number;
  sortOrder: 'newest' | 'oldest';
  onToggleSort: () => void;
};

export function TimelineHeader({ totalRecords, totalDays, sortOrder, onToggleSort }: TimelineHeaderProps) {
  return (
    <div className="p-4 bg-[#1e2330] border-2 border-[#2d3548] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 bg-[#12151f] border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-wider truncate">冒険年代記</h2>
            <span className="hidden sm:inline text-[10px] text-cyan-300 font-mono border border-cyan-500/40 px-1.5 py-0.5">TIMELINE</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 truncate">
            総記録: <span className="text-emerald-400 font-bold font-mono">{totalRecords}</span> / 経過日数: <span className="text-amber-400 font-bold font-mono">{totalDays} Days</span>
          </p>
        </div>
      </div>

      <button type="button" onClick={() => { playToggleSound(); onToggleSort(); }} onMouseEnter={playHoverSound} aria-label="タイムラインの並び順を切り替える" className="min-h-[44px] self-stretch sm:self-auto px-3.5 py-2.5 bg-[#12151f] border border-slate-700 text-slate-200 hover:border-amber-500 hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all">
        <ArrowUpDown size={13} className="text-amber-400" />
        <span>{sortOrder === 'oldest' ? '古い順' : '新しい順'}</span>
      </button>
    </div>
  );
}
