import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpDown, Crown, Footprints, Clock } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { playToggleSound, playHoverSound, playCardOpenSound } from '@/lib/sound';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { DayChapter } from '@/components/timeline/DayChapter';
import { TimelineEntry } from '@/components/timeline/TimelineEntry';

type DayGroup = { dateKey: string; label: string; dayNumber: number; dateLabel: string; dayLabel: string; locations: LocationWithPhotos[]; bgPhotoPath?: string };
type SortOrder = 'newest' | 'oldest';
type Milestone = { day: number; label: string };

const MILESTONES: Milestone[] = [
  { day: 3, label: '3日目、生存確認。' },
  { day: 7, label: 'まだ生きている。7日目。' },
  { day: 30, label: '奇跡が起きた。30日生存。' },
];

function getMilestone(dayNumber: number) {
  return MILESTONES.find((milestone) => milestone.day === dayNumber);
}

function TimelinePhoto({ storagePath, alt, className }: { storagePath: string; alt: string; className: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    let objectUrl = '';
    getPhotoUrl(storagePath).then((url) => {
      if (active) {
        objectUrl = url.startsWith('blob:') ? url : '';
        setSrc(url);
      } else if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    }).catch(() => { if (active) setSrc(''); });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [storagePath]);
  if (!src) return null;
  return <img src={src} alt={alt} className={className} />;
}

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
    try {
      const stored = localStorage.getItem(`survival-wiki:milestones:${world.id}`);
      setUnlockedMilestones(stored ? JSON.parse(stored) : []);
    } catch {
      setUnlockedMilestones([]);
    }
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
    playToggleSound();
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
        try { localStorage.setItem(`survival-wiki:milestones:${world.id}`, JSON.stringify(next)); } catch {}
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
      <div className="p-4 bg-[#1e2330] border-2 border-[#2d3548] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-[#12151f] border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0"><Clock className="w-5 h-5" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0"><h2 className="text-sm sm:text-base font-bold text-white tracking-wider truncate">冒険年代記</h2><span className="hidden sm:inline text-[10px] text-cyan-300 font-mono border border-cyan-500/40 px-1.5 py-0.5">TIMELINE</span></div>
            <p className="text-xs text-slate-300 mt-1 truncate">総記録: <span className="text-emerald-400 font-bold font-mono">{totalRecords}</span> / 経過日数: <span className="text-amber-400 font-bold font-mono">{totalDays} Days</span></p>
          </div>
        </div>
        <button type="button" onClick={toggleSortOrder} onMouseEnter={playHoverSound} aria-label="タイムラインの並び順を切り替える" className="min-h-[44px] self-stretch sm:self-auto px-3.5 py-2.5 bg-[#12151f] border border-slate-700 text-slate-200 hover:border-amber-500 hover:text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"><ArrowUpDown size={13} className="text-amber-400" /><span>{sortOrder === 'oldest' ? '古い順' : '新しい順'}</span></button>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムライン冒険ログを読み込み中" />}
      {!loading && groups.length === 0 && <EmptyState message="タイムラインがありません。ロケーションを記録すると冒険ルートが自動生成されます。" />}

      {!loading && groups.length > 0 && (
        <div ref={timelineRef} className="relative">
          <div className="pointer-events-none absolute left-[8px] top-0 bottom-0 w-0.5 bg-[#2d3548]" />
          <div className="pointer-events-none absolute left-[7px] top-[18px] z-10 w-[3px] origin-top rounded-full bg-gradient-to-b from-amber-500 via-amber-500 to-emerald-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-[height] duration-500 ease-out" style={{ height: `${trailHeight}px` }} />
          <div className="pointer-events-none absolute left-[-6px] z-20 transition-[top] duration-500 ease-out" style={{ top: `${activeIconTop}px` }} aria-hidden="true">
            <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[#12151f] shadow-lg ring-2 ring-[#12151f] ${activeMilestone ? 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.7)]' : 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'} ${isRevealingMilestone ? 'milestone-reveal' : ''}`}>
              {isRevealingMilestone && <span className="milestone-burst pointer-events-none absolute inset-0 rounded-full border-2 border-amber-400" />}
              {activeMilestone ? <Crown className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
              {activeMilestone && <span className={`absolute left-8 whitespace-nowrap rounded-sm bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-black shadow-md border border-white/40 ${isRevealingMilestone ? 'milestone-text' : ''}`}>{activeMilestone.label}</span>}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-5 pl-7 sm:pl-9">
            {groups.map((group) => (
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
                  <TimelineEntry
                    key={location.id}
                    loc={location}
                    renderPhoto={TimelinePhoto}
                  />
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

function groupByDay(locations: LocationWithPhotos[]): DayGroup[] {
  const sorted = [...locations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const map = new Map<string, LocationWithPhotos[]>();
  for (const loc of sorted) {
    const d = new Date(loc.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const arr = map.get(key) ?? [];
    arr.push(loc);
    map.set(key, arr);
  }
  const sortedKeysAsc = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  const dateKeyToDayNum = new Map<string, number>();
  sortedKeysAsc.forEach((key, index) => dateKeyToDayNum.set(key, index + 1));
  const groups: DayGroup[] = [];
  for (const [key, locs] of map) {
    const d = new Date(key);
    const dateLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    const dayNum = dateKeyToDayNum.get(key) ?? 1;
    const label = `${dayNum}日目`;
    const firstWithPhoto = [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).find((location) => location.photos.some((photo) => photo.is_main));
    const bgPhotoPath = firstWithPhoto?.photos.find((photo) => photo.is_main)?.storage_path;
    groups.push({
      dateKey: key,
      label,
      dayNumber: dayNum,
      dateLabel,
      dayLabel,
      locations: [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      bgPhotoPath,
    });
  }
  return groups;
}
