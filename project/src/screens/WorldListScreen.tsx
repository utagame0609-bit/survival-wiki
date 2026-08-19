import { useEffect, useState } from 'react';
import { Plus, Globe, Users, ChevronDown, ChevronUp } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { fetchWorlds, fetchLatestLocationDates } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';

export function WorldListScreen({
  gameId,
  gameName,
  navigate,
  goBack,
}: {
  gameId: string;
  gameName: string;
  navigate: NavigateFn;
  goBack: () => void;
}) {
  const [worlds, setWorlds] = useState<WorldWithMembers[]>([]);
  const [lastLocationDates, setLastLocationDates] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedWorldId, setExpandedWorldId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetchWorlds(gameId)
      .then(async (data) => {
        const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${gameId}`);
        const sortedWorlds = [...data].sort((a, b) => {
          if (a.id === lastOpenedWorldId) return -1;
          if (b.id === lastOpenedWorldId) return 1;
          return 0;
        });
        setWorlds(sortedWorlds);
        const dates = await fetchLatestLocationDates(data.map((w) => w.id));
        setLastLocationDates(dates);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [gameId]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header title={gameName} onBack={goBack} />
      <div className="px-4 py-4 max-w-3xl mx-auto">
        <button
          onClick={() => navigate({ name: 'worldCreate', gameId, gameName })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          新規ワールドを作成
        </button>

        {loading && <Spinner label="ワールドを読み込み中" />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && worlds.length === 0 && (
          <EmptyState message="まだワールドがありません。新規ワールドを作成してください。" />
        )}
        {!loading && !error && worlds.length > 0 && (
          <div className="mt-4 space-y-3">
            {worlds.map((w) => (
              <WorldCard
                key={w.id}
                world={w}
                lastLocationDate={lastLocationDates[w.id]}
                expanded={expandedWorldId === w.id}
                onToggle={() => setExpandedWorldId((current) => (current === w.id ? null : w.id))}
                onOpen={() => {
                  localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, w.id);
                  navigate({ name: 'world', worldId: w.id, worldName: w.name });
                }}
                onEdit={() => navigate({ name: 'worldCreate', gameId, gameName, worldId: w.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorldCard({
  world,
  lastLocationDate,
  expanded,
  onToggle,
  onOpen,
  onEdit,
}: {
  world: WorldWithMembers;
  lastLocationDate?: string | null;
  expanded: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onEdit: () => void;
}) {
  const formattedLastLocationDate = lastLocationDate
    ? new Date(lastLocationDate).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="w-full rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left p-4 hover:bg-stone-50 active:bg-stone-100 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Globe className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-900 truncate">{world.name}</h3>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-stone-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
              )}
            </div>
            {world.player && <p className="text-sm text-stone-500 truncate">プレイヤー: {world.player}</p>}
            <div className="flex items-center gap-1 mt-1 text-xs text-stone-400">
              <Users className="w-3.5 h-3.5" />
              <span>{world.members.length}名</span>
              {world.memo && <span className="truncate">· {world.memo}</span>}
            </div>
            {formattedLastLocationDate && (
              <p className="text-xs text-stone-400 mt-2 text-right">
                最終ロケーション：{formattedLastLocationDate}
              </p>
            )}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-stone-100 p-3 flex gap-2">
          <button
            onClick={onOpen}
            className="flex-1 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 active:scale-[0.99] transition-all"
          >
            このワールドを開く
          </button>
          <button
            onClick={onEdit}
            className="flex-1 py-2.5 rounded-xl bg-stone-100 text-stone-700 text-sm font-medium hover:bg-stone-200 active:scale-[0.99] transition-all"
          >
            編集
          </button>
        </div>
      )}
    </div>
  );
}
