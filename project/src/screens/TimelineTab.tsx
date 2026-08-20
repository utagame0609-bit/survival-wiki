import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

type DayGroup = { dateKey: string; label: string; dayNumber: number; dateLabel: string; dayLabel: string; locations: LocationWithPhotos[]; bgPhoto?: string };
type SortOrder = 'newest' | 'oldest';

export function TimelineTab({ world, reloadKey }: { world: WorldWithMembers; reloadKey: number }) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortMenuRef = useRef<HTMLDivElement>(null);

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

  const toggle = (key: string) => setExpanded((prev) => (prev === key ? null : key));
  const selectSortOrder = (value: SortOrder) => {
    setSortOrder(value);
    setSortMenuOpen(false);
  };

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="h-[45px] mb-4 rounded-xl bg-emerald-600 px-16 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-semibold tracking-[0.18em] text-white whitespace-nowrap">WORLD LOG</span>
          <span className="h-4 w-px bg-emerald-300" />
          <span className="text-xs text-white truncate">この世界で記録された出来事</span>
        </div>
        <div ref={sortMenuRef} className="relative shrink-0 ml-3">
          <span className="sr-only">並び順</span>
          <button
            type="button"
            onClick={() => setSortMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={sortMenuOpen}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          >
            {sortOrder === 'newest' ? '新しい順' : '古い順'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${sortMenuOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortMenuOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 min-w-[92px] overflow-hidden rounded-lg border border-emerald-700/20 bg-white shadow-lg ring-1 ring-black/5" role="menu">
              <button type="button" onClick={() => selectSortOrder('newest')} className={`block w-full px-3 py-2 text-left text-xs transition-colors ${sortOrder === 'newest' ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-stone-700 hover:bg-stone-50'}`} role="menuitem">新しい順</button>
              <button type="button" onClick={() => selectSortOrder('oldest')} className={`block w-full px-3 py-2 text-left text-xs transition-colors ${sortOrder === 'oldest' ? 'bg-emerald-50 font-semibold text-emerald-700' : 'text-stone-700 hover:bg-stone-50'}`} role="menuitem">古い順</button>
            </div>
          )}
        </div>
      </div>
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムラインを読み込み中" />}
      {!loading && groups.length === 0 && <EmptyState message="タイムラインがありません。ロケーションを記録すると自動生成されます。" />}
      {!loading && groups.length > 0 && <div className="space-y-3">{groups.map((g) => <DayCard key={g.dateKey} group={g} isExpanded={expanded === g.dateKey} onToggle={() => toggle(g.dateKey)} />)}</div>}
    </div>
  );
}

function DayCard({ group, isExpanded, onToggle }: { group: DayGroup; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white relative">
      {group.bgPhoto && <div className="absolute top-0 left-0 right-0 h-full z-0 overflow-hidden pointer-events-none"><img src={group.bgPhoto} alt="" className="absolute top-0 left-0 w-full h-auto max-w-none opacity-[0.35] [mask-image:linear-gradient(to_bottom,black_0%,black_65%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_65%,transparent_100%)]" /></div>}
      <button onClick={onToggle} className="relative z-10 w-full min-h-[104px] text-left p-4 flex items-center justify-between bg-transparent">
        <div><p className="font-semibold text-stone-900 whitespace-pre-line">{group.label}</p><p className="text-xs text-stone-600 mt-0.5">{group.locations.length}件の記録</p></div>
        <ChevronDown className={`w-5 h-5 text-stone-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      {isExpanded && <div className="relative z-10 px-4 pb-4 bg-transparent"><div className="border-l-2 border-emerald-300 ml-3 pl-4 space-y-4">{group.locations.map((loc) => <TimelineEntry key={loc.id} loc={loc} />)}</div></div>}
    </div>
  );
}

function TimelineEntry({ loc }: { loc: LocationWithPhotos }) {
  const time = new Date(loc.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const mainPhoto = loc.photos.find((p) => p.is_main);
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(180px,2fr)_auto_auto] md:items-center gap-2 md:gap-4 py-1">
      <span className="absolute -left-[1.5rem] top-[1.4rem] w-3.5 h-3.5 rounded-full border-2 border-emerald-600 bg-white" />
      <div className="min-w-0"><h4 className="font-medium text-stone-900 truncate">{loc.name}</h4><p className="text-xs text-stone-500 font-mono mt-0.5">X {loc.x}　Y {loc.y}　Z {loc.z}</p></div>
      <div className="min-w-0">{loc.detail_memo ? <p className="text-sm text-stone-700 whitespace-pre-wrap break-words">{loc.detail_memo}</p> : <p className="text-sm text-stone-500">メモなし</p>}{loc.members.length > 0 && <p className="text-xs text-stone-500 mt-1 truncate">仲間：{loc.members.map((m) => m.name).join('・')}</p>}</div>
      <div className="flex items-center">{mainPhoto ? <img src={getPhotoUrl(mainPhoto.storage_path)} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-stone-100" />}</div>
      <span className="text-xs text-stone-500 font-mono md:text-right">{time}</span>
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
    const firstWithPhoto = [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).find((l) => l.photos.some((p) => p.is_main));
    const bgPhoto = firstWithPhoto?.photos.find((p) => p.is_main);
    groups.push({ dateKey: key, label, dayNumber: dayNum, dateLabel, dayLabel, locations: [...locs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), bgPhoto: bgPhoto ? getPhotoUrl(bgPhoto.storage_path) : undefined });
  }
  return groups;
}
