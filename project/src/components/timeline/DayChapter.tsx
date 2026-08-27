import { ChevronDown, ChevronUp, Crown } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';

type DayGroup = {
  dateKey: string;
  label: string;
  dayNumber: number;
  dateLabel: string;
  dayLabel: string;
  locations: LocationWithPhotos[];
  bgPhotoPath?: string;
};

type Milestone = {
  day: number;
  label: string;
};

type DayChapterProps = {
  group: DayGroup;
  isActive: boolean;
  isExpanded: boolean;
  unlockedMilestones: number[];
  milestone?: Milestone;
  onRef: (element: HTMLElement | null) => void;
  onSelect: () => void;
  renderLocation: (location: LocationWithPhotos) => React.ReactNode;
};

export function DayChapter({
  group,
  isActive,
  isExpanded,
  unlockedMilestones,
  milestone,
  onRef,
  onSelect,
  renderLocation,
}: DayChapterProps) {
  const isMilestoneUnlocked = Boolean(milestone && unlockedMilestones.includes(milestone.day));

  return (
    <section ref={onRef} className="relative scroll-mt-24">
      <div className={`bg-[#1e2330] border-2 overflow-hidden shadow-md transition-all ${isActive ? 'border-amber-500/80 shadow-[0_0_18px_rgba(245,158,11,0.16)]' : 'border-[#2d3548]'}`}>
        <button
          type="button"
          onClick={onSelect}
          className="w-full min-h-[54px] px-3.5 sm:px-4 py-3 bg-[#161a24] hover:bg-[#1a2030] flex items-center justify-between gap-3 text-left transition-colors border-b border-[#2d3548]"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-wrap">
            <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold font-mono shrink-0 border ${isActive ? 'bg-amber-500 border-amber-400 text-black' : 'bg-[#12151f] border-amber-500/50 text-amber-400'}`}>
              DAY_{String(group.dayNumber).padStart(2, '0')}
            </span>
            <span className={`text-xs sm:text-sm font-bold ${isActive ? 'text-amber-300' : 'text-white'}`}>
              {group.dateLabel}（{group.dayLabel}）
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 font-mono">({group.locations.length} 拠点)</span>
            {isMilestoneUnlocked && milestone && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                <Crown className="w-3 h-3" />MILESTONE
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-300 shrink-0">
            <span className="hidden sm:inline text-[10px] font-mono">{isExpanded ? '折畳' : '展開'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        {isExpanded && (
          <div className="p-3 sm:p-4 space-y-3 bg-[#1e2330]">
            {group.locations.map((location) => renderLocation(location))}
          </div>
        )}
      </div>
    </section>
  );
}
