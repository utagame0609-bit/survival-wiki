import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowUpDown, Crown, Footprints, MapPin, Clock } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { playCardOpenSound, playToggleSound } from '@/lib/sound';

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

    getPhotoUrl(storagePath)
      .then((url) => {
        if (active) {
          objectUrl = url.startsWith('blob:') ? url : '';
          setSrc(url);
        } else if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setSrc('');
      });

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
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <style>{`
        @keyframes milestone-pop { 0% { transform: scale(0.45); opacity: 0; } 45% { transform: scale(1.22); opacity: 1; } 70% { transform: scale(0.94); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes milestone-burst { 0% { transform: scale(0.5); opacity: 0.8; } 70% { transform: scale(1.9); opacity: 0; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes milestone-text { 0% { transform: translateX(-8px) scale(0.94); opacity: 0; } 55% { transform: translateX(2px) scale(1.02); opacity: 1; } 100% { transform: translateX(0) scale(1); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .milestone-reveal, .milestone-burst, .milestone-text { animation: none !important; } }
      `}</style>

      <div className="w-full mb-6 rounded-sm border-2 border-[#1a2333] bg-[#0d1627] p-4 px-5 shadow-lg flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 shrink-0 rounded-full bg-[#ffb000] shadow-[0_0_8px_#ffb000]" />
            <h2 className="text-xs font-bold tracking-widest text-[#ffb000] uppercase font-mono whitespace-nowrap">ADVENTURE TIMELINE // 冒険の記憶</h2>
            <span className="text-zinc-600 font-mono text-xs">//</span>
            <span className="text-zinc-300 text-xs truncate">進行ルート</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono pl-4">
            <span className="flex items-center gap-1 whitespace-nowrap"><Activity size={12} className="text-[#32cd32]" />総記録数: <strong className="text-[#32cd32]">{totalRecords}</strong></span>
            <span className="text-zinc-700">•</span>
            <span className="whitespace-nowrap">経過日数: <strong className="text-[#ffb000]">{totalDays} Days</strong></span>
          </div>
        </div>
        <div className="self-end sm:self-auto shrink-0">
          <button type="button" onClick={toggleSortOrder} aria-label="タイムラインの並び順を切り替える" className="flex items-center gap-1.5 rounded-sm border-2 border-[#334155] bg-[#1a2333] px-3.5 py-2 text-xs font-bold text-zinc-200 shadow-sm transition-colors hover:border-[#ffb000] hover:text-[#ffb000]">
            <ArrowUpDown size={13} className="text-[#ffb000]" />
            <span>{sortOrder === 'oldest' ? '古い順' : '新しい順'}</span>
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムライン冒険ログを読み込み中" />}
      {!loading && groups.length === 0 && <EmptyState message="タイムラインがありません。ロケーションを記録すると冒険ルートが自動生成されます。" />}

      {!loading && groups.length > 0 && (
        <>
          <div ref={timelineRef} className="relative">
            <div className="pointer-events-none absolute left-[8px] top-0 bottom-0 w-1 bg-repeat-y bg-[linear-gradient(to_bottom,#ffb000_50%,transparent_50%)] bg-[length:4px_12px] opacity-40" />
            <div className="pointer-events-none absolute left-[7px] top-[18px] z-10 w-[3px] origin-top rounded-full bg-gradient-to-b from-[#ffb000] via-[#ffb000] to-[#32cd32] shadow-[0_0_12px_#ffb000] transition-[height] duration-500 ease-out" style={{ height: `${trailHeight}px` }} />
            <div className="pointer-events-none absolute left-[-6px] z-20 transition-[top] duration-500 ease-out" style={{ top: `${activeIconTop}px` }} aria-hidden="true">
              <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-[#0a1120] shadow-lg ring-2 ring-[#0a1120] ${activeMilestone ? 'bg-[#ffb000] shadow-[0_0_15px_#ffb000]' : 'bg-[#32cd32] shadow-[0_0_12px_#32cd32]'} ${isRevealingMilestone ? 'milestone-reveal' : ''}`} style={isRevealingMilestone ? { animation: 'milestone-pop 700ms cubic-bezier(.22,.8,.35,1)' } : undefined}>
                {isRevealingMilestone && <span className="milestone-burst pointer-events-none absolute inset-0 rounded-full border-2 border-[#ffb000]" style={{ animation: 'milestone-burst 900ms ease-out' }} />}
                {activeMilestone ? <Crown className="w-4 h-4 text-[#0a1120]" /> : <Footprints className="w-4 h-4 text-[#0a1120]" />}
                {activeMilestone && <span className={`absolute left-8 whitespace-nowrap rounded-sm bg-[#ffb000] px-2 py-0.5 text-[10px] font-bold text-[#0a1120] shadow-md border border-white/40 ${isRevealingMilestone ? 'milestone-text' : ''}`} style={isRevealingMilestone ? { animation: 'milestone-text 700ms cubic-bezier(.22,.8,.35,1)' } : undefined}>{activeMilestone.label}</span>}
              </div>
            </div>
            <div className="space-y-8 pl-8 sm:pl-9">
              {groups.map((g) => (
                <DayChapter
                  key={g.dateKey}
                  group={g}
                  isActive={activeDay === g.dayNumber}
                  isExpanded={expandedDay === g.dayNumber}
                  unlockedMilestones={unlockedMilestones}
                  onRef={(element) => {
                    if (element) dayRefs.current.set(g.dateKey, element);
                    else dayRefs.current.delete(g.dateKey);
                  }}
                  onSelect={() => handleDaySelect(g.dayNumber)}
                />
              ))}
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
      <button type="button" onClick={onSelect} className={`group relative w-full min-h-[80px] mb-3 overflow-hidden rounded-sm border-2 text-left transition-all duration-200 ${isActive ? 'border-[#ffb000] bg-[#0d1627] shadow-[0_0_20px_rgba(255,176,0,0.2)]' : 'border-[#1a2333] bg-[#0d1627] hover:border-[#334155] hover:bg-[#111c30]'}`} aria-expanded={isExpanded}>
        {group.bgPhotoPath && <div className="absolute inset-0 overflow-hidden pointer-events-none"><TimelinePhoto storagePath={group.bgPhotoPath} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] [mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)]" /></div>}
        <div className="relative z-10 flex min-h-[80px] items-center gap-3.5 px-4 py-3 sm:px-5">
          <div className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-sm border-2 font-mono ${isActive ? 'border-[#ffb000] bg-[#ffb000] text-[#0a1120] font-black shadow-md' : 'border-[#334155] bg-[#1a2333] text-zinc-400 font-bold'}`}>
            <span className="text-[10px] tracking-[0.1em]">DAY</span>
            <span className="ml-1 text-base leading-none">{group.dayNumber}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm sm:text-base font-bold ${isActive ? 'text-[#ffb000]' : 'text-zinc-200'}`}>{group.dateLabel}（{group.dayLabel}）</span>
              {isMilestoneUnlocked && milestone && <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-bold ${isActive ? 'border-[#ffb000] bg-[#ffb000] text-[#0a1120] shadow-sm' : 'border-[#ffb000]/50 bg-[#ffb000]/20 text-[#ffb000]'}`}><Crown className="w-3 h-3" /> {milestone.label}</span>}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs"><span className={`font-mono ${isExpanded ? 'text-[#32cd32]' : 'text-zinc-400'}`}>{group.locations.length}件の冒険ログ</span></div>
          </div>
        </div>
      </button>
      {isExpanded && <div className="relative pb-2"><div className="space-y-3.5">{group.locations.map((loc) => <TimelineEntry key={loc.id} loc={loc} />)}</div></div>}
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
      <article className="relative overflow-hidden rounded-sm border-2 border-[#1a2333] bg-[#0d1627] shadow-md hover:border-[#334155] transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(150px,0.8fr)_minmax(240px,1.7fr)]">
          {hasPhoto ? <div className="w-full h-44 md:h-full min-h-44 overflow-hidden bg-[#050a14] border-b md:border-b-0 md:border-r border-[#1a2333]"><TimelinePhoto storagePath={mainPhoto!.storage_path} alt={loc.name} className="w-full h-full object-cover" /></div> : <div className="h-24 md:h-full min-h-24 bg-[#050a14] flex items-center justify-center text-zinc-600 border-b md:border-b-0 md:border-r border-[#1a2333]"><MapPin className="w-7 h-7" /></div>}
          <div className="p-4 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><h4 className="text-sm sm:text-base font-bold text-[#ffb000] break-words flex items-center gap-1.5"><span className="text-[#ffb000]">◆</span><span>{loc.name}</span></h4><p className="text-xs text-[#32cd32] font-mono mt-1">POS: X:{loc.x} Y:{loc.y} Z:{loc.z}</p></div>
              <span className="shrink-0 text-xs text-zinc-500 font-mono flex items-center gap-1"><Clock className="w-3 h-3 text-zinc-500" />{time}</span>
            </div>
            {hasMemo && <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap break-words p-3 rounded-sm bg-[#050a14] border border-[#1a2333] font-mono">{loc.detail_memo}</p>}
            {loc.members.length > 0 && <p className="text-[11px] text-sky-400 mt-2.5 truncate font-mono">同行仲間: {loc.members.map((m) => m.name).join(' ・ ')}</p>}
          </div>
        </div>
      </article>
    );
  }
  return <div className="relative min-h-9 flex items-center gap-3 text-xs sm:text-sm px-3.5 py-2.5 rounded-sm bg-[#0d1627] border border-[#1a2333]"><span className="text-[#ffb000] font-mono">▸</span><span className="min-w-0 font-bold text-zinc-200 truncate">{loc.name}</span><span className="shrink-0 text-xs text-[#32cd32] font-mono">X:{loc.x} Y:{loc.y} Z:{loc.z}</span><span className="ml-auto shrink-0 text-xs text-zinc-500 font-mono">{time}</span></div>;
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
    const bgPhotoPath = firstWithPhoto?.photos.find((p) => p.is_main)?.storage_path;
    groups.push({ dateKey: key, label, dayNumber: dayNum, dateLabel, dayLabel, locations: [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), bgPhotoPath });
  }
  return groups;
}
