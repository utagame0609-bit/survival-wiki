import { useEffect, useState } from 'react';
import { Plus, Gamepad2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import { WorldCard } from '@/components/WorldCard';
import type { WorldMeta } from '@/components/WorldCard';
import { WorldDeleteConfirmModal } from '@/components/WorldDeleteConfirmModal';
import type { NavigateFn } from '@/components/Navigation';
import { buildWorldMeta } from '@/components/world/worldListData';
import { playConfirmSound, playDeleteSound, playErrorSound, playModalCloseSound, playHoverSound } from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';

export function WorldListScreen({ gameId, gameName, navigate, goBack }: { gameId: string; gameName: string; navigate: NavigateFn; goBack: () => void }) {
  const [worlds, setWorlds] = useState<WorldWithMembers[]>([]);
  const [worldMeta, setWorldMeta] = useState<Record<string, WorldMeta>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WorldWithMembers | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    fetchWorlds(gameId)
      .then(async (data) => {
        const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${gameId}`);
        const sortedWorlds = [...data].sort((a, b) => {
          if (a.id === lastOpenedWorldId) return -1;
          if (b.id === lastOpenedWorldId) return 1;
          return 0;
        });
        const meta = await buildWorldMeta(data);
        setWorlds(sortedWorlds);
        setWorldMeta(meta);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [gameId]);

  useEffect(() => {
    playWorldBgm();
    const resumeBgm = () => playWorldBgm();
    window.addEventListener('survival-wiki:settings-closed', resumeBgm);
    return () => {
      window.removeEventListener('survival-wiki:settings-closed', resumeBgm);
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
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの削除に失敗しました');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b1018] text-white font-sans overflow-x-hidden flex flex-col select-none world-select-screen">
      <div className="scanline-overlay" />
      <Header title={gameName} />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col">
        <header className="relative z-10 flex flex-col items-center mb-4 sm:mb-6 text-center">
          <div className="border-2 border-amber-500/70 bg-[#1b2130] px-5 sm:px-10 py-2.5 sm:py-3 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
            <h1 className="text-amber-400 font-black tracking-widest text-sm sm:text-lg font-mono crt-glow">
              UTAPEDIA // WORLD SELECT
            </h1>
          </div>
          <p className="mt-1.5 text-[10px] sm:text-xs text-emerald-400 font-bold tracking-wider opacity-90 font-mono">
            冒険の書を選択してください // SELECT SAVE SLOT
          </p>
        </header>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && worlds.length === 0 && (
          <div className="border-2 border-[#2d3446] relative mb-6 bg-[#1e222f] p-6 sm:p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-amber-500/50 bg-[#141824] text-amber-400 shadow-md">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <p className="text-sm sm:text-base font-bold text-white">セーブデータがありません</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">「+ 新しいワールドを作成」から最初の冒険の書を作成してください。</p>
          </div>
        )}

        {!loading && !error && worlds.length > 0 && (
          <main className="relative z-10 grid grid-cols-1 gap-3 sm:gap-4">
            {worlds.map((world, index) => (
              <WorldCard
                key={world.id}
                slotNumber={index + 1}
                world={world}
                meta={worldMeta[world.id]}
                onOpen={() => {
                  playConfirmSound();
                  localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, world.id);
                  navigate({ name: 'world', worldId: world.id, worldName: world.name });
                }}
                onEdit={() => {
                  playConfirmSound();
                  navigate({ name: 'worldCreate', gameId, gameName, worldId: world.id });
                }}
                onDelete={() => handleDelete(world)}
              />
            ))}
          </main>
        )}

        {!loading && !error && (
          <button
            type="button"
            onClick={() => { playConfirmSound(); setShowCreateModal(true); }}
            onMouseEnter={playHoverSound}
            className="w-full mt-4 sm:mt-5 bg-amber-500 text-black px-4 py-3 sm:py-3.5 font-bold text-xs sm:text-sm hover:bg-amber-400 border-b-3 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.22)] cursor-pointer min-h-[46px] font-mono"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="font-black tracking-wide">+ NEW_WORLD // 新しいワールドを作成</span>
          </button>
        )}

        <footer className="relative z-10 hidden sm:flex mt-auto pt-6 pb-2 border-t border-[#2a3142] flex-wrap gap-4 justify-between items-center text-[10px] text-slate-400 font-mono">
          <div className="flex gap-4 items-center">
            <span className="text-emerald-400 font-bold animate-pulse">● ONLINE</span>
            <span>STORAGE: LOCAL</span>
            <span>SYSTEM: READY</span>
          </div>
          <div className="tracking-wider text-slate-400">UTAPEDIA SURVIVAL LOG</div>
        </footer>
      </div>

      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && (
        <WorldDeleteConfirmModal
          world={deleteTarget}
          onCancel={() => { playModalCloseSound(); setDeleteTarget(null); }}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
