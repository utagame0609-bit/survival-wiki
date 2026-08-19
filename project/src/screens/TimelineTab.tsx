import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

type DisplayMode = 'day' | 'date' | 'both';

type DayGroup = {
  dateKey: string;
  label: string;
  dayNumber: number;
  dateLabel: string;
  dayLabel: string;
  locations: LocationWithPhotos[];
  bgPhoto?: string;
};

const DISPLAY_MODE_PREFIX = 'survival-wiki:timeline-display-mode:';

export function TimelineTab({
  world,
  reloadKey,
}: {
  world: WorldWithMembers;
  reloadKey: number;
}) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('both');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(true);
    fetchLocations(world.id)
      .then(setLocations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [world.id, reloadKey]);

  useEffect(() => {
    const saved = window.localStorage.getItem(`${DISPLAY_MODE_PREFIX}${world.id}`);
    if (saved === 'day' || saved === 'date' || saved === 'both') {
      setDisplayMode(saved);
    } else {
      setDisplayMode('both');
    }
    setExpanded(new Set());
  }, [world.id]);

  useEffect(() => {
    window.localStorage.setItem(`${DISPLAY_MODE_PREFIX}${world.id}`, displayMode);
  }, [world.id, displayMode]);

  const groups = useMemo(() => groupByDay(locations, displayMode), [locations, displayMode]);

  const toggle = (key: string) => {
    const next = new Set(expanded);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpanded(next);
  };

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="flex gap-2 mb-4">
        {(['day', 'date', 'both'] as DisplayMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setDisplayMode(m)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              displayMode === m
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200'
            }`}
          >
            {m === 'day' ? 'Day表示' : m === 'date' ? '日付表示' : '両方'}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="タイムラインを読み込み中" />}
      {!loading && groups.length === 0 && (
        <EmptyState message="タイムラインがありません。ロケーションを記録すると自動生成されます。" />
      )}
      {!loading && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((g) => (
            <DayCard
              key={g.dateKey}
              group={g}
              isExpanded={expanded.has(g.dateKey)}
              onToggle={() => toggle(g.dateKey)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DayCard({
  group,
  isExpanded,
  onToggle,
}: {
  group: DayGroup;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm bg-white relative">
      {group.bgPhoto && (
        <div className="absolute inset-0 z-0">
          <img
            src={group.bgPhoto}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
      )}
      <button
        onClick={onToggle}
        className="relative z-10 w-full text-left p-4 flex items-center justify-between"
      >
        <div>
          <p className="font-semibold text-stone-900 whitespace-pre-line">{group.label}</p>
          <p className="text-xs text-stone-500 mt-0.5">{group.locations.length}件の記録</p>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="relative z-10 px-4 pb-4">
          <div className="border-l-2 border-emerald-300 ml-3 pl-4 space-y-4">
            {group.locations.map((loc) => (
              <TimelineEntry key={loc.id} loc={loc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineEntry({ loc }: { loc: LocationWithPhotos }) {
  const time = new Date(loc.created_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const mainPhoto = loc.photos.find((p) => p.is_main);

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-[minmax(140px,1fr)_minmax(180px,2fr)_auto_auto] md:items-center gap-2 md:gap-4 py-1">
      <div className="absolute -left-[1.35rem] top-2 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
      <div className="min-w-0">
        <h4 className="font-medium text-stone-900 truncate">{loc.name}</h4>
        <p className="text-xs text-stone-400 font-mono mt-0.5">
          {loc.x}, {loc.y}, {loc.z}
        </p>
      </div>

      <div className="min-w-0">
        {loc.detail_memo ? (
          <p className="text-sm text-stone-600 whitespace-pre-wrap break-words">{loc.detail_memo}</p>
        ) : (
          <p className="text-sm text-stone-400">メモなし</p>
        )}
        {loc.members.length > 0 && (
          <p className="text-xs text-stone-400 mt-1 truncate">{loc.members.map((m) => m.name).join('・')}</p>
        )}
      </div>

      <div className="flex items-center">
        {mainPhoto ? (
          <img
            src={getPhotoUrl(mainPhoto.storage_path)}
            alt=""
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-stone-100" />
        )}
      </div>

      <span className="text-xs text-stone-400 font-mono md:text-right">{time}</span>
    </div>
  );
}

function groupByDay(locations: LocationWithPhotos[], mode: DisplayMode): DayGroup[] {
  const sorted = [...locations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const map = new Map<string, LocationWithPhotos[]>();
  for (const loc of sorted) {
    const d = new Date(loc.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const arr = map.get(key) ?? [];
    arr.push(loc);
    map.set(key, arr);
  }

  // 最古の日付を1日目とする
  const sortedKeysAsc = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  const dateKeyToDayNum = new Map<string, number>();
  sortedKeysAsc.forEach((key, index) => {
    dateKeyToDayNum.set(key, index + 1);
  });

  const groups: DayGroup[] = [];

  for (const [key, locs] of map) {
    const d = new Date(key);
    const dateLabel = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
    const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()];
    const dayText = `${dateLabel}（${dayLabel}）`;
    const dayNum = dateKeyToDayNum.get(key) ?? 1;

    const label =
      mode === 'day'
        ? `${dayNum}日目`
        : mode === 'date'
          ? dayText
          : `Day ${dayNum}\n${dayText}`;

    const firstWithPhoto = [...locs]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .find((l) => l.photos.some((p) => p.is_main));
    const bgPhoto = firstWithPhoto?.photos.find((p) => p.is_main);

    groups.push({
      dateKey: key,
      label,
      dayNumber: dayNum,
      dateLabel,
      dayLabel,
      locations: [...locs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ),
      bgPhoto: bgPhoto ? getPhotoUrl(bgPhoto.storage_path) : undefined,
    });
  }

  return groups;
}
