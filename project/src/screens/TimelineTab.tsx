import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowUpDown, Crown, Footprints, MapPin } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { playCardOpenSound, playFootstepSound, playToggleSound } from '@/lib/sound';

type DayGroup = { dateKey: string; label: string; dayNumber: number; dateLabel: string; dayLabel: string; locations: LocationWithPhotos[]; bgPhoto?: string };
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
    fetchLocations(world.id).then(setLocations).catch((e) => setError(e.message)).finally(() => setLoading(false));
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
    window.setTimeout(() => {
      playFootstepSound();
    }, 70);
    setActiveDay(dayNumber);
    setExpandedDay(dayNumber);

    const milestone = getMilestone(dayNumber);
    if (milestone && !unlockedMilestones.includes(milestone.day)) {
      setMilestoneRevealDay(milestone.day);
      window.setTimeout(() => setMilestoneRevealDay(null), 1200);
      setUnlockedMilestones((current) => {
        if (current.includes(milestone.day)) return current;
        const next = [...current, milestone.day].sort((a, b) => a - b);
        try {
          localStorage.setItem(`survival-wiki:milestones:${world.id}`, JSON.stringify(next));
        } catch {
          // Keep the in-memory unlock even if localStorage is unavailable.
        }
        return next;
      });
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const group = groups.find((item) => item.dayNumber === dayNumber);
        const element = group ? dayRefs.current.get(group.dateKey) : undefined;
        if (!element) return;

        const topOffset = 88;
        const targetTop = Math.max(0, element.getBoundingClientRect().top + window.scrollY - topOffset);
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      });
    });
  };

  const activeMilestone = unlockedMilestones.includes(activeDay) ? getMilestone(activeDay) : undefined;
  const isRevealingMilestone = milestoneRevealDay === activeDay;
  const trailHeight = Math.max(0, activeIconTop - 18);
  const totalRecords = locations.length;
  const totalDays = groups.length;

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <style>{`
        @keyframes milestone-pop { 0% { transform: scale(0.45); opacity: 0; } 45% { transform: scale(1.22); opacity: 1; } 70% { transform: scale(0.94); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes milestone-burst { 0% { transform: scale(0.5); opacity: 0.8; } 70% { transform: scale(1.9); opacity: 0; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes milestone-text { 0% { transform: translateX(-8px) scale(0.94); opacity: 0; } 55% { transform: translateX(2px) scale(1.02); opacity: 1; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .milestone-reveal, .milestone-burst, .milestone-text { animation: none !important; } }
      `}</style>
      <div className="w-full mb-6 rounded-xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/75 via-zinc-900/95 to-zinc-900/90 p-3.5 px-4 shadow-[0_0_20px_rgba(16,185,129,0.10)] backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
            <h2 className="text-xs font-extrabold tracking-widest text-zinc-100 uppercase font-mono whitespace-nowrap">WORLD LOG</h2>
            <span className="text-emerald-800 font-mono text-xs">/</span>
            <span className="text-emerald-100/75 truncate">この世界で記録された出来事</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pl-4">
            <span className="flex items-center gap-1 whitespace-nowrap"><Activity size={12} className="text-emerald-400" />総記録数: <strong className="text-emerald-300">{totalRecords}</strong></span>
            <span className="text-emerald-900">•</span>
            <span className="whitespace-nowrap">記録日数: <strong className="text-zinc-200">{totalDays} Days</strong></span>
          </div>
        </div>
        <div className="self-end sm:self-auto shrink-0">
          <button type="button" onClick={toggleSortOrder} aria-label="タイムラインの並び順を切り替える" className="flex items-center gap-1.5 rounded-lg border border-emerald-800/60 bg-emerald-950/50 px-3 py-1.5 text-xs font-medium text-emerald-100 shadow-sm transition-colors hover:bg-emerald-900/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
            <ArrowUpDown size={13} className="text-emerald-400" />
            <span>{sortOrder === 'oldest' ? '古い順' : '新しい順'}</span>
          </button>
        </div>
      </div>
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムラインを読み込み中" />}
      {!loading && groups.length === 0 && <EmptyState message="タイムラインがありません。ロケーションを記録すると自動生成されます。" />}
      {!loading && groups.length > 0 && (
        <>
          <div ref={timelineRef} className="relative">
            <div className="pointer-events-none absolute left-[7px] top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/40 via-emerald-400/70 to-cyan-400/40 shadow-[0_0_8px_rgba(52,211,153,0.25)]" />
            <div className="pointer-events-none absolute left-[3px] top-[18px] z-10 w-[9px] origin-top rounded-full bg-gradient-to-b from-emerald-300/10 via-emerald-300/70 to-cyan-300/20 shadow-[0_0_10px_rgba(52,211,153,0.25)] transition-[height] duration-500 ease-out" style={{ height: `${trailHeight}px` }} />
            <div className="pointer-events-none absolute left-[-6px] z-20 transition-[top] duration-500 ease-out" style={{ top: `${activeIconTop}px` }} aria-hidden="true">
              <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-zinc-950 shadow-lg ring-4 ring-zinc-950/90 ${activeMilestone ? 'bg-amber-300 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-500/30'} ${isRevealingMilestone ? 'milestone-reveal' : ''}`} style={isRevealingMilestone ? { animation: 'milestone-pop 700ms cubic-bezier(.22,.8,.35,1)' } : undefined}>
                {isRevealingMilestone && <span className="milestone-burst pointer-events-none absolute inset-0 rounded-full border-2 border-amber-200" style={{ animation: 'milestone-burst 900ms ease-out' }} />}
                {activeMilestone ? <Crown className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
                {activeMilestone && <span className={`absolute left-8 whitespace-nowrap rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-bold text-zinc-950 shadow ${isRevealingMilestone ? 'milestone-text' : ''}`} style={isRevealingMilestone ? { animation: 'milestone-text 700ms cubic-bezier(.22,.8,.35,1)' } : undefined}>{activeMilestone.label}</span>}
              </div>
            </div>
            <div className="space-y-10 pl-8">
              {groups.map((g) => <DayChapter key={g.dateKey} group={g} isActive={activeDay === g.dayNumber} isExpanded={expandedDay === g.dayNumber} unlockedMilestones={unlockedMilestones} onRef={(element) => { if (element) dayRefs.current.set(g.dateKey, element); else dayRefs.current.delete(g.dateKey); }} onSelect={() => handleDaySelect(g.dayNumber)} />)}
            </div>
          </div>
          <div aria-hidden="true" className="h-[calc(100vh-88px)]" />
        </>
      )}
    </div>
  );
}

function DayChapter({ group, isActive, isExpanded, unlockedMilestones, onRef, onSelect }: { group: DayGroup; isActive: boolean; isExpanded: boolean; unlockedMilestones: number[]; onRef: (element: HTMLElement | null) => void; onSelect: () => void }) {
  const milestone = getMilestone(group.dayNumber);
  const isMilestoneUnlocked = Boolean(milestone && unlockedMilestones.includes(milestone.day));
  return (
    <section ref={onRef} className="relative scroll-mt-24">
      <button type="button" onClick={onSelect} className={`group relative w-full min-h-[86px] mb-4 overflow-hidden rounded-xl border text-left transition-all duration-300 ${isActive ? 'border-emerald-400/70 bg-gradient-to-r from-emerald-950/70 via-zinc-900/80 to-zinc-900/75 shadow-[0_0_18px_rgba(16,185,129,0.10)]' : 'border-emerald-950/70 bg-gradient-to-r from-emerald-950/35 via-zinc-900/70 to-zinc-900/60 hover:border-emerald-900/80'}`} aria-expanded={isExpanded}>
        {group.bgPhoto && <div className="absolute inset-0 overflow-hidden pointer-events-none"><img src={group.bgPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.10] [mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)]" /></div>}
        <div className="relative z-10 flex min-h-[86px] items-center gap-3 px-4 py-3 sm:px-5">
          <div className={`flex h-9 w-11 shrink-0 items-center justify-center rounded-lg border ${isActive ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-emerald-900/70 bg-zinc-900/60 text-zinc-400'}`}><span className="text-[10px] font-bold tracking-[0.14em]">DAY</span><span className="ml-1 text-base font-bold leading-none">{group.dayNumber}</span></div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap"><span className={`text-base font-semibold ${isActive ? 'text-white' : 'text-zinc-200'}`}>{group.dateLabel}（{group.dayLabel}）</span>{isMilestoneUnlocked && milestone && <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${isActive ? 'border-amber-400/70 bg-amber-100 text-amber-800' : 'border-amber-300/50 bg-amber-50 text-amber-700'}`}><Crown className="w-3 h-3" /> {milestone.label}</span>}</div>
            <div className="mt-1"><span className={`text-xs font-medium ${isExpanded ? 'text-emerald-300' : 'text-zinc-400'}`}>{group.locations.length}件の記録</span></div>
          </div>
        </div>
      </button>
      {isExpanded && <div className="relative pb-2"><div className="space-y-4">{group.locations.map((loc) => <TimelineEntry key={loc.id} loc={loc} />)}</div></div>}
    </section>
  );
}

function TimelineEntry({ loc }: { loc: LocationWithPhotos }) {
  const time = new Date(loc.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const mainPhoto = loc.photos.find((p) => p.is_main);
  const hasMemo = Boolean(loc.detail_memo?.trim());
  const hasPhoto = Boolean(mainPhoto);
  if (hasPhoto || hasMemo) {
    return (
      <article className="relative overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(150px,0.8fr)_minmax(240px,1.7fr)]">
          {hasPhoto ? <img src={getPhotoUrl(mainPhoto!.storage_path)} alt={loc.name} className="w-full h-44 md:h-full min-h-44 object-cover" /> : <div className="h-24 md:h-full min-h-24 bg-stone-50 flex items-center justify-center text-stone-300"><MapPin className="w-7 h-7" /></div>}
          <div className="p-4 min-w-0">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h4 className="text-base font-semibold text-stone-900 break-words">{loc.name}</h4><p className="text-xs text-stone-500 font-mono mt-1">X {loc.x}　Y {loc.y}　Z {loc.z}</p></div><span className="shrink-0 text-xs text-stone-500 font-mono">{time}</span></div>
            {hasMemo && <p className="mt-3 text-sm leading-6 text-stone-700 whitespace-pre-wrap break-words">{loc.detail_memo}</p>}
            {loc.members.length > 0 && <p className="text-xs text-stone-500 mt-3 truncate">仲間：{loc.members.map((m) => m.name).join('・')}</p>}
          </div>
        </div>
      </article>
    );
  }
  return <div className="relative min-h-9 flex items-center gap-3 text-sm"><span className="min-w-0 font-medium text-stone-800 truncate">{loc.name}</span><span className="shrink-0 text-xs text-stone-500 font-mono">X {loc.x}　Y {loc.y}　Z {loc.z}</span><span className="ml-auto shrink-0 text-xs text-stone-500 font-mono">{time}</span></div>;
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
    const firstWithPhoto = [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).find((l) => l.photos.some((p) => p.is_main));
    const bgPhoto = firstWithPhoto?.photos.find((p) => p.is_main);
    groups.push({ dateKey: key, label, dayNumber: dayNum, dateLabel, dayLabel, locations: [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), bgPhoto: bgPhoto ? getPhotoUrl(bgPhoto.storage_path) : undefined });
  }
  return groups;
}
