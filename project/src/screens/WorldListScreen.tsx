import { useEffect, useState } from 'react';
import { Plus, Globe, Users, Pencil, Trash2, ChevronRight, AlertTriangle, X } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLatestLocationDates } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import type { NavigateFn } from '@/components/Navigation';
import { playConfirmSound, playDeleteSound, playCancelSound, playErrorSound } from '@/lib/sound';

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
  const [deleteTarget, setDeleteTarget] = useState<WorldWithMembers | null>(null);

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

  const handleDelete = (world: WorldWithMembers) => {
    playErrorSound();
    setDeleteTarget(world);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    const worldId = deleteTarget.id;
    setDeleteTarget(null);

    try {
      setError('');
      await deleteWorld(worldId);
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
          onClick={() => {
            playConfirmSound();
            setShowCreateModal(true);
          }}
          className="group w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-950/55 via-zinc-900/95 to-zinc-900/90 border border-emerald-900/60 text-emerald-300 font-semibold shadow-[0_0_20px_rgba(16,185,129,0.10)] hover:from-emerald-900/45 hover:via-zinc-900/95 hover:to-zinc-900/90 hover:border-emerald-500/60 hover:text-emerald-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.14)] active:scale-[0.99] transition-all"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
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
                  playConfirmSound();
                  localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, w.id);
                  navigate({ name: 'world', worldId: w.id, worldName: w.name });
                }}
                onEdit={() => {
                  playConfirmSound();
                  navigate({ name: 'worldCreate', gameId, gameName, worldId: w.id });
                }}
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

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              playCancelSound();
              setDeleteTarget(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-world-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-[#151712] border border-emerald-900/70 shadow-[0_0_40px_rgba(0,0,0,0.55),0_0_24px_rgba(16,185,129,0.08)]"
          >
            <div className="px-5 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/50 border border-red-900/60 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.12)]">
                <AlertTriangle className="w-7 h-7 text-red-300" />
              </div>
              <h2 id="delete-world-title" className="text-lg font-bold text-zinc-100">
                ワールドを削除しますか？
              </h2>
              <p className="mt-2 text-sm text-emerald-300 font-semibold break-words">
                「{deleteTarget.name}」
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                この操作は元に戻せません。<br />
                ワールドに保存されている記録も削除されます。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5">
              <button
                type="button"
                onClick={() => {
                  playCancelSound();
                  setDeleteTarget(null);
                }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-950/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 hover:text-zinc-100 active:scale-[0.98] transition-all"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/70 border border-red-900/70 text-red-200 hover:bg-red-900/60 hover:border-red-800 hover:text-red-100 active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                削除する
              </button>
            </div>
          </div>
        </div>
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
      className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-950/25 via-zinc-900/90 to-zinc-900/85 border border-emerald-950/70 shadow-[0_0_16px_rgba(16,185,129,0.05)] cursor-pointer hover:-translate-y-0.5 hover:from-emerald-950/35 hover:via-zinc-900/90 hover:to-zinc-900/85 hover:border-emerald-700/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.08)] transition-all duration-200"
    >
      <div className="p-3.5 pr-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-zinc-950/80 border border-emerald-900/60 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_10px_rgba(16,185,129,0.04)]">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-emerald-300 transition-colors">{world.name}</h3>
            </div>
            {world.player && <p className="text-sm text-zinc-400 truncate mt-0.5">プレイヤー: {world.player}</p>}
            <div className="flex items-center gap-1 mt-1.5 text-xs text-zinc-500">
              <Users className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>{world.members.length}名</span>
              {world.memo && <span className="truncate">· {world.memo}</span>}
            </div>
            {formattedLastLocationDate && (
              <p className="text-[11px] text-zinc-600 mt-1.5 font-mono">
                最終ロケーション：{formattedLastLocationDate}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 pl-1">
            <div className="flex items-center gap-1 sm:opacity-0 sm:pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-focus-within:pointer-events-auto transition-opacity">
              <button
                type="button"
                aria-label={`${world.name}を編集`}
                title="編集"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit();
                }}
                className="w-8 h-8 rounded-lg bg-zinc-950/70 border border-zinc-800 text-zinc-400 hover:border-emerald-900/70 hover:bg-emerald-950/30 hover:text-emerald-300 flex items-center justify-center transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label={`${world.name}を削除`}
                title="削除"
                onClick={(event) => {
                  event.stopPropagation();
                  playDeleteSound();
                  onDelete();
                }}
                className="w-8 h-8 rounded-lg bg-red-950/30 border border-red-950/50 text-red-300 hover:bg-red-950/50 hover:border-red-900/60 hover:text-red-200 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
