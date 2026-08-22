import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, ArrowUpDown, ChevronDown, Crown, Footprints, MapPin } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

type DayGroup = { dateKey: string; label: string; dayNumber: number; dateLabel: string; dayLabel: string; locations: LocationWithPhotos[]; bgPhoto?: string };
type SortOrder = 'newest' | 'oldest';
type Milestone = { day: number; label: string };

const MILESTONES: Milestone[] = [
  { day: 3, label: '三日坊主突破！' },
  { day: 7, label: '7日継続！' },
  { day: 30, label: '30日継続！' },
];

function getMilestone(dayNumber: number) {
  return MILESTONES.find((milestone) => milestone.day === dayNumber);
}

export function TimelineTab({ world, reloadKey }: { world: WorldWithMembers; reloadKey: number }) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(1);
  const [expandedDay, setExpandedDay] = useState(1);
  const [activeIconTop, setActiveIconTop] = useState(0);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    setLoading(true);
    fetchLocations(world.id).then(setLocations).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [world.id, reloadKey]);

  useEffect(() => {
    if (!sortMenuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!sortMenuRef.current?.contains(event.target as Node)) setSortMenuOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [sortMenuOpen]);

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

  const selectSortOrder = (value: SortOrder) => {
    setSortOrder(value);
    setSortMenuOpen(false);
  };

  const handleDaySelect = (dayNumber: number) => {
    setActiveDay(dayNumber);
    setExpandedDay(dayNumber);

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

  const activeMilestone = getMilestone(activeDay);
  const trailHeight = Math.max(0, activeIconTop - 18);
  const totalRecords = locations.length;
  const totalDays = groups.length;

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="w-full mb-6 rounded-xl border border-zinc-800 bg-zinc-900/90 p-3.5 px-4 shadow-lg backdrop-blur-md flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-400" />
            <h2 className="text-xs font-extrabold tracking-widest text-zinc-100 uppercase font-mono whitespace-nowrap">WORLD LOG</h2>
            <span className="text-zinc-600 font-mono text-xs">/</span>
            <span className="text-xs text-zinc-400 truncate">この世界で記録された出来事</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono pl-4">
            <span className="flex items-center gap-1 whitespace-nowrap">
              <Activity size={12} className="text-emerald-500" />
              総記録数: <strong className="text-emerald-400">{totalRecords}</strong>
            </span>
            <span className="text-zinc-700">•</span>
            <span className="whitespace-nowrap">記録日数: <strong className="text-zinc-300">{totalDays} Days</strong></span>
          </div>
        </div>

        <div className="self-end sm:self-auto shrink-0">
          <button type="button" onClick={() => setSortMenuOpen((prev) => !prev)} aria-haspopup="menu" aria-expanded={sortMenuOpen} className="flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-sm transition-colors hover:bg-zinc-700/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60">
            <ArrowUpDown size={13} className="text-emerald-400" />
            <span>{sortOrder === 'oldest' ? '古い順' : '新しい順'}</span>
          </button>
          {sortMenuOpen && (
            <div ref={sortMenuRef} className="absolute z-30 mt-1 min-w-[110px] overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-lg" role="menu">
              <button type="button" onClick={() => selectSortOrder('newest')} className={`block w-full px-3 py-2 text-left text-xs transition-colors ${sortOrder === 'newest' ? 'bg-emerald-500/10 font-semibold text-emerald-300' : 'text-zinc-300 hover:bg-zinc-800'}`} role="menuitem">新しい順</button>
              <button type="button" onClick={() => selectSortOrder('oldest')} className={`block w-full px-3 py-2 text-left text-xs transition-colors ${sortOrder === 'oldest' ? 'bg-emerald-500/10 font-semibold text-emerald-300' : 'text-zinc-300 hover:bg-zinc-800'}`} role="menuitem">古い順</button>
            </div>
          )}
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
              <div className={`relative flex items-center justify-center w-7 h-7 rounded-full text-zinc-950 shadow-lg ring-4 ring-zinc-950/90 ${activeMilestone ? 'bg-amber-300 shadow-amber-400/50' : 'bg-emerald-400 shadow-emerald-500/30'}`}>
                {activeMilestone ? <Crown className="w-4 h-4" /> : <Footprints className="w-4 h-4" />}
                <span className={`absolute left-8 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-bold shadow ${activeMilestone ? 'bg-amber-300 text-zinc-950' : 'bg-emerald-400 text-zinc-950'}`}>
                  {activeMilestone ? activeMilestone.label : `Day ${activeDay}`}
                </span>
              </div>
            </div>
            <div className="space-y-10 pl-8">
              {groups.map((g) => (
                <DayChapter
                  key={g.dateKey}
                  group={g}
                  isActive={activeDay === g.dayNumber}
                  isExpanded={expandedDay === g.dayNumber}
                  onRef={(element) => { if (element) dayRefs.current.set(g.dateKey, element); else dayRefs.current.delete(g.dateKey); }}
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

function DayChapter({ group, isActive, isExpanded, onRef, onSelect }: { group: DayGroup; isActive: boolean; isExpanded: boolean; onRef: (element: HTMLElement | null) => void; onSelect: () => void }) {
  const milestone = getMilestone(group.dayNumber);

  return (
    <section ref={onRef} className="relative scroll-mt-24">
      <button type="button" onClick={onSelect} className={`group relative w-full min-h-[92px] mb-4 overflow-hidden rounded-xl border text-left transition-all duration-300 ${isActive ? 'border-emerald-400/70 bg-zinc-900/70 shadow-[0_0_18px_rgba(16,185,129,0.10)]' : 'border-zinc-700/70 bg-zinc-900/35 hover:border-zinc-600'}`} aria-expanded={isExpanded}>
        {group.bgPhoto && <div className="absolute inset-0 overflow-hidden pointer-events-none"><img src={group.bgPhoto} alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.12] [mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_60%,transparent_100%)]" /></div>}
        <div className="relative z-10 flex min-h-[92px] items-center gap-3 px-4 py-3 sm:px-5">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${isActive ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-zinc-700 bg-zinc-800/70 text-zinc-400'}`}>
            <span className="text-[10px] font-bold tracking-[0.14em]">DAY</span>
            <span className="ml-1 text-base font-bold leading-none">{group.dayNumber}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-base font-semibold ${isActive ? 'text-white' : 'text-zinc-200'}`}>{group.label}</span>
              <span className="text-xs text-zinc-400">{group.dateLabel}（{group.dayLabel}）</span>
              {milestone && (
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${isActive ? 'border-amber-400/70 bg-amber-100 text-amber-800' : 'border-amber-300/50 bg-amber-50 text-amber-700'}`}>
                  <Crown className="w-3 h-3" /> {milestone.label}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs text-zinc-400">{group.locations.length}件の記録</span>
              <span className={`text-[10px] font-medium ${isExpanded ? 'text-emerald-300' : 'text-zinc-500'}`}>{isExpanded ? '展開中' : 'クリックで表示'}</span>
            </div>
          </div>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${isExpanded ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-300' : 'border-zinc-700 bg-zinc-900/60 text-zinc-400'}`}>
            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>
      {isExpanded && (
        <div className="relative pb-2">
          <div className="space-y-4">{group.locations.map((loc) => <TimelineEntry key={loc.id} loc={loc} />)}</div>
        </div>
      )}
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
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><h4 className="text-base font-semibold text-stone-900 break-words">{loc.name}</h4><p className="text-xs text-stone-500 font-mono mt-1">X {loc.x}　Y {loc.y}　Z {loc.z}</p></div>
              <span className="shrink-0 text-xs text-stone-500 font-mono">{time}</span>
            </div>
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
