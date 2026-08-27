import { useEffect, useMemo, useRef, useState } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations } from '@/lib/db';
import { playCardOpenSound } from '@/lib/sound';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { DayChapter } from '@/components/timeline/DayChapter';
import { TimelineEntry } from '@/components/timeline/TimelineEntry';
import { TimelineHeader } from '@/components/timeline/TimelineHeader';
import { TimelineProgressMarker } from '@/components/timeline/TimelineProgressMarker';
import { groupByDay, getMilestone, type DayGroup } from '@/components/timeline/timelineData';
import { loadUnlockedMilestones, saveUnlockedMilestones } from '@/components/timeline/timelineMilestones';

type SortOrder = 'newest' | 'oldest';

export function TimelineTab({ world, reloadKey }: { world: WorldWithMembers; reloadKey: number }) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');
  const [activeDay, setActiveDay] = useState(1);
  const [expandedDay, setExpandedDay] = useState(1);
  const [activeIconTop, setActiveIconTop] = useState(0);
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [milestoneRevealDay, setMilestoneRevealDay] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    setLoading(true);
    fetchLocations(world.id)
      .then(setLocations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [world.id, reloadKey]);

  useEffect(() => {
    setUnlockedMilestones(loadUnlockedMilestones(world.id));
  }, [world.id]);

  const groups = useMemo(() => {
    const grouped = groupByDay(locations);
    return sortOrder === 'newest' ? grouped : [...grouped].reverse();
  }, [locations, sortOrder]);

  useEffect(() => {
    if (groups.length === 0) return;
    setActiveDay((current) => groups.some((group) => group.dayNumber === current) ? current : groups[0].dayNumber);
    setExpandedDay((current) => groups.some((group) => group.dayNumber === current) ? current : groups[0].dayNumber);
  }, [groups]);

  useEffect(() => {
    const timeline = timelineRef.current;
    const element = dayRefs.current.get(groups.find((group) => group.dayNumber === activeDay)?.dateKey ?? '');
    if (!timeline || !element) return;
    const timelineRect = timeline.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    setActiveIconTop(elementRect.top - timelineRect.top + 18);
  }, [groups, activeDay, expandedDay]);

  const toggleSortOrder = () => {
    setSortOrder((current) => current === 'oldest' ? 'newest' : 'oldest');
  };

  const handleDaySelect = (dayNumber: number) => {
    playCardOpenSound();
    setActiveDay(dayNumber);
    setExpandedDay((current) => current === dayNumber ? 0 : dayNumber);
    const milestone = getMilestone(dayNumber);
    if (milestone && !unlockedMilestones.includes(milestone.day)) {
      setMilestoneRevealDay(milestone.day);
      window.setTimeout(() => setMilestoneRevealDay(null), 1200);
      setUnlockedMilestones((current) => {
        if (current.includes(milestone.day)) return current;
        const next = [...current, milestone.day].sort((a, b) => a - b);
        saveUnlockedMilestones(world.id, next);
        return next;
      });
    }
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const group = groups.find((item) => item.dayNumber === dayNumber);
      const element = group ? dayRefs.current.get(group.dateKey) : undefined;
      if (!element) return;
      const targetTop = Math.max(0, element.getBoundingClientRect().top + window.scrollY - 88);
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }));
  };

  const activeMilestone = unlockedMilestones.includes(activeDay) ? getMilestone(activeDay) : undefined;
  const isRevealingMilestone = milestoneRevealDay === activeDay;
  const trailHeight = Math.max(0, activeIconTop - 18);
  const totalRecords = locations.length;
  const totalDays = groups.length;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans px-0 sm:px-1">
      <TimelineHeader
        totalRecords={totalRecords}
        totalDays={totalDays}
        sortOrder={sortOrder}
        onToggleSort={toggleSortOrder}
      />

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムライン冒険ログを読み込み中" />}
      {!loading && groups.length === 0 && <EmptyState message="タイムラインがありません。ロケーションを記録すると冒険ルートが自動生成されます。" />}

      {!loading && groups.length > 0 && (
        <div ref={timelineRef} className="relative">
          <div className="pointer-events-none absolute left-[8px] top-0 bottom-0 w-0.5 bg-[#2d3548]" />
          <TimelineProgressMarker
            top={activeIconTop}
            trailHeight={trailHeight}
            activeMilestone={activeMilestone}
            isRevealing={isRevealingMilestone}
          />

          <div className="space-y-4 sm:space-y-5 pl-7 sm:pl-9">
            {groups.map((group: DayGroup) => (
              <DayChapter
                key={group.dateKey}
                group={group}
                isActive={activeDay === group.dayNumber}
                isExpanded={expandedDay === group.dayNumber}
                unlockedMilestones={unlockedMilestones}
                milestone={getMilestone(group.dayNumber)}
                onRef={(element) => {
                  if (element) dayRefs.current.set(group.dateKey, element);
                  else dayRefs.current.delete(group.dateKey);
                }}
                onSelect={() => handleDaySelect(group.dayNumber)}
                renderLocation={(location) => (
                  <TimelineEntry key={location.id} loc={location} />
                )}
              />
            ))}
          </div>
          <div aria-hidden="true" className="h-[calc(100vh-88px)]" />
        </div>
      )}
    </div>
  );
}
