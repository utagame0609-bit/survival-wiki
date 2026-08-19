import { useEffect, useState } from 'react';
import { Plus, Globe, Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { fetchWorlds } from '@/lib/db';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetchWorlds(gameId)
      .then(setWorlds)
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
                onOpen={() => navigate({ name: 'world', worldId: w.id, worldName: w.name })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function WorldCard({ world, onOpen }: { world: WorldWithMembers; onOpen: () => void }) {
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
        </div>
      </div>
    </button>
  );
}
