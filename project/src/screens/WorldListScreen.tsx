import { useEffect, useState } from 'react';
import { Plus, Globe, Users, Pencil, Trash2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLatestLocationDates } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
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
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  const handleDelete = async (world: WorldWithMembers) => {
    const confirmed = window.confirm(
      `「${world.name}」を削除しますか？\nこの操作は元に戻せません。`
    );
    if (!confirmed) return;

    try {
      setError('');
      await deleteWorld(world.id);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの削除に失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-[#11120f] text-stone-100">
      <Header title={gameName} onBack={goBack} />
      <div className="px-4 py-4 max-w-3xl mx-auto">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-700 text-white font-medium shadow-md shadow-emerald-950/30 hover:bg-emerald-600 active:scale-[0.99] transition-all"
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
                onOpen={() => {
                  localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, w.id);
                  navigate({ name: 'world', worldId: w.id, worldName: w.name });
                }}
                onEdit={() => navigate({ name: 'worldCreate', gameId, gameName, worldId: w.id })}
                onDelete={() => handleDelete(w)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <WorldCreateModal
          gameId={gameId}
          onClose={() => setShowCreateModal(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}

function WorldCard({
  world,
  lastLocationDate,
  onOpen,
  onEdit,
  onDelete,
}: {
  world: WorldWithMembers;
  lastLocationDate?: string | null;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
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
    <div
      onClick={onOpen}
      className="group w-full rounded-xl bg-[#1b1c18] border border-[#2d3028] shadow-lg shadow-black/20 overflow-hidden cursor-pointer hover:border-emerald-700/70 hover:bg-[#1e201b] transition-all"
    >
      <div className="p-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-[#1f3a20] flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-stone-100 truncate">{world.name}</h3>
            </div>
            {world.player && <p className="text-sm text-stone-400 truncate">プレイヤー: {world.player}</p>}
            <div className="flex items-center gap-1 mt-1 text-xs text-stone-500">
              <Users className="w-3.5 h-3.5" />
              <span>{world.members.length}名</span>
              {world.memo && <span className="truncate">· {world.memo}</span>}
            </div>
            {formattedLastLocationDate && (
              <p className="text-[11px] text-stone-600 mt-1.5 text-right">
                最終ロケーション：{formattedLastLocationDate}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-focus-within:pointer-events-auto transition-opacity">
            <button
              type="button"
              aria-label={`${world.name}を編集`}
              title="編集"
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
              className="w-8 h-8 rounded-lg bg-[#292b24] text-stone-300 hover:bg-[#34372e] hover:text-white flex items-center justify-center transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={`${world.name}を削除`}
              title="削除"
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              className="w-8 h-8 rounded-lg bg-red-950/40 text-red-300 hover:bg-red-950/60 hover:text-red-200 flex items-center justify-center transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
