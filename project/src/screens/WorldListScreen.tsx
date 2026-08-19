import { useEffect, useState } from 'react';
import { Plus, Globe, Users } from 'lucide-react';
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

  const load = () => {
    setLoading(true);
    fetchWorlds(gameId)
      .then(async (data) => {
        setWorlds(data);
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
                onOpen={() => navigate({ name: 'world', worldId: w.id, worldName: w.name })}
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
  onOpen,
}: {
  world: WorldWithMembers;
  lastLocationDate?: string | null;
  onOpen: () => void;
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
    <button
      onClick={onOpen}
      className="w-full text-left p-4 rounded-2xl bg-white border border-stone-200 shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-900 truncate">{world.name}</h3>
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
  );
}
