import { useEffect, useState } from 'react';
import { Database, Gamepad2, Plus } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld } from '@/lib/db';
import { AppHeader } from '@/components/AppHeader';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import { WorldCard } from '@/components/WorldCard';
import { WorldDeleteConfirmModal } from '@/components/WorldDeleteConfirmModal';
import { useWorldListData } from '@/hooks/useWorldListData';
import type { NavigateFn } from '@/lib/screenNavigation';
import { saveUserWorldListView } from '@/lib/userLastView';
import { playConfirmSound, playDeleteSound, playErrorSound, playHoverSound } from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';

export function WorldListScreen({ gameId, navigate }: { gameId: string; navigate: NavigateFn }) {
  const { worlds, worldMeta, loading, error, setError, load } = useWorldListData(gameId);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<WorldWithMembers | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorldWithMembers | null>(null);

  useEffect(() => {
    void saveUserWorldListView(gameId).catch((saveError) => console.error('Failed to save last world-list view:', saveError));
  }, [gameId]);

  useEffect(() => {
    playWorldBgm();
    return () => {
      stopWorldBgm(300);
    };
  }, []);

  const handleDelete = (world: WorldWithMembers) => {
    playErrorSound();
    setDeleteTarget(world);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const worldId = deleteTarget.id;
    setDeleteTarget(null);
    playDeleteSound();
    try {
      setError('');
      await deleteWorld(worldId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの削除に失敗しました');
    }
  };

  const openWorld = (world: WorldWithMembers) => {
    playConfirmSound();
    localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, world.id);
    navigate({ name: 'world', gameId, worldId: world.id, worldName: world.name });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0B1018] text-[#E2E8F0]">
      <div className="pointer-events-none fixed inset-0 opacity-30 [background-image:radial-gradient(rgba(51,65,85,0.25)_1px,transparent_1px)] [background-size:16px_16px]" />
      <AppHeader title="WORLD SELECT" />

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-[#1E293B] pb-4 text-center sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-[#06B6D4] sm:justify-start">
              <Database className="h-3.5 w-3.5" />
              <span>SAVE SLOTS // 冒険の書一覧</span>
            </div>
            <h1 className="mt-1 text-xl font-black tracking-wider text-[#F8FAFC] sm:text-2xl">
              WORLD ARCHIVES
            </h1>
          </div>

          <button
            type="button"
            onClick={() => { playConfirmSound(); setShowCreateModal(true); }}
            onMouseEnter={playHoverSound}
            className="inline-flex items-center justify-center gap-2 rounded bg-[#F59E0B] px-4 py-2.5 font-mono text-xs font-black tracking-wider text-[#0B1018] shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all hover:bg-[#D97706] active:translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>＋ 新しいワールドを作成</span>
          </button>
        </div>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && worlds.length === 0 && (
          <div className="mb-4 rounded-lg border border-dashed border-[#1E293B] bg-[#0F172A]/50 px-4 py-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#334155] bg-[#161F30] text-[#F59E0B]">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#F8FAFC]">セーブデータがありません</p>
            <p className="mt-1 text-xs text-[#64748B]">最初の冒険の書を作成してください。</p>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            {worlds.map((world, index) => (
              <WorldCard
                key={world.id}
                slotNumber={index + 1}
                world={world}
                meta={worldMeta[world.id]}
                onOpen={() => openWorld(world)}
                onEdit={() => {
                  playConfirmSound();
                  setEditTarget(world);
                }}
                onDelete={() => handleDelete(world)}
              />
            ))}

            <button
              type="button"
              onClick={() => { playConfirmSound(); setShowCreateModal(true); }}
              onMouseEnter={playHoverSound}
              className="group flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#1E293B] bg-[#0B1018]/50 py-6 text-[#64748B] transition-all hover:border-[#F59E0B]/60 hover:bg-[#0F172A]/80 hover:text-[#F59E0B]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#334155] bg-[#161F30] group-hover:bg-[#1E293B]">
                <Plus className="h-5 w-5 text-[#F59E0B]" />
              </div>
              <div className="font-mono text-xs tracking-wider">
                ＋ SLOT {String(worlds.length + 1).padStart(2, '0')} // 新規冒険の書を作成
              </div>
            </button>
          </div>
        )}
      </main>

      {showCreateModal && (
        <WorldCreateModal
          gameId={gameId}
          onClose={() => setShowCreateModal(false)}
          onCreated={load}
        />
      )}

      {editTarget && (
        <WorldCreateModal
          gameId={gameId}
          worldId={editTarget.id}
          onClose={() => setEditTarget(null)}
          onCreated={load}
        />
      )}

      {deleteTarget && (
        <WorldDeleteConfirmModal
          world={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
