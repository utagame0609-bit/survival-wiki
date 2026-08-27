import { Crown, Footprints } from 'lucide-react';
import type { Milestone } from '@/components/timeline/timelineData';

type TimelineProgressMarkerProps = {
  top: number;
  trailHeight: number;
  activeMilestone?: Milestone;
  isRevealing: boolean;
};

export function TimelineProgressMarker({
  top,
  trailHeight,
  activeMilestone,
  isRevealing,
}: TimelineProgressMarkerProps) {
  return (
    <>
      <div
        className="pointer-events-none absolute left-[7px] top-[18px] z-10 w-[3px] origin-top rounded-full bg-gradient-to-b from-amber-500 via-amber-500 to-emerald-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-[height] duration-500 ease-out"
        style={{ height: `${trailHeight}px` }}
      />
      <div
        className="pointer-events-none absolute left-[-6px] z-20 transition-[top] duration-500 ease-out"
        style={{ top: `${top}px` }}
        aria-hidden="true"
      >
        <div
          className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[#12151f] shadow-lg ring-2 ring-[#12151f] ${activeMilestone ? 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)]' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'} ${isRevealing ? 'milestone-reveal' : ''}`}
        >
          {isRevealing && <span className="milestone-burst pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400" />}
          {activeMilestone ? <Crown className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
          {activeMilestone && (
            <span
              className={`absolute left-8 whitespace-nowrap rounded-sm bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black shadow-md border border-white/40 ${isRevealing ? 'milestone-text' : ''}`}
            >
              {activeMilestone.label}
            </span>
          )}
        </div>
      </div>
    </>
  );
}
