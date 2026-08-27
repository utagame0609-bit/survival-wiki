import { useEffect, useState } from 'react';
import { Plus, Trash2, AlertTriangle, X, Gamepad2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLocations } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import { WorldCard } from '@/components/WorldCard';
import type { WorldMeta } from '@/components/WorldCard';
import type { NavigateFn } from '@/components/Navigation';
import { playConfirmSound, playDeleteSound, playCancelSound, playErrorSound, playModalCloseSound, playHoverSound } from '@/lib/sound';
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
        const metaEntries = await Promise.all(data.map(async (world) => {
          const locations = await fetchLocations(world.id);
          const sortedLocations = [...locations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const dayKeys = new Set(locations.map((location) => {
            const date = new Date(location.created_at);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          }));
          const latestLocation = sortedLocations[0];
          const latestPhoto = latestLocation ? latestLocation.photos.find((photo) => photo.is_main) ?? latestLocation.photos[0] ?? null : null;
          return [world.id, {
            recordCount: locations.length,
            dayCount: dayKeys.size,
            lastLocationName: latestLocation?.name ?? null,
            lastLocationDate: latestLocation?.created_at ?? null,
            lastPhotoPath: latestPhoto?.storage_path ?? null,
          }] as const;
        }));
        setWorlds(sortedWorlds);
        setWorldMeta(Object.fromEntries(metaEntries));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [gameId]);

  useEffect(() => {
    playWorldBgm();
    return () => stopWorldBgm(300);
  }, []);

  const handleDelete = (world: WorldWithMembers) => { playErrorSound(); setDeleteTarget(world); };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const worldId = deleteTarget.id;
    setDeleteTarget(null);
    playDeleteSound();
    try { setError(''); await deleteWorld(worldId); load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'ワールドの削除に失敗しました'); }
  };

  return (
    <div className="relative min-h-screen bg-[#161922] text-white font-sans overflow-x-hidden flex flex-col select-none world-select-screen">
      <div className="scanline-overlay" />
      <Header title={gameName} onBack={goBack} />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-3 sm:px-8 py-5 sm:py-8 flex-1 flex flex-col">
        <header className="relative z-10 flex flex-col items-center mb-6 text-center">
          <div className="border-2 border-amber-500/60 bg-[#1f2432] px-6 sm:px-12 py-3 mb-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <h1 className="text-amber-400 font-black tracking-widest text-base sm:text-lg font-mono crt-glow">UTAPEDIA // WORLD SELECT</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-400 font-bold tracking-wider opacity-90 font-mono">冒険の書を選択してください // SELECT SAVE SLOT</p>
        </header>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && worlds.length === 0 && (
          <div className="border-2 border-[#2d3446] relative mb-6 bg-[#1e222f] p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-amber-500/50 bg-[#141824] text-amber-400 shadow-md"><Gamepad2 className="h-8 w-8" /></div>
            <p className="text-base font-bold text-white">セーブデータがありません</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-300">「+ 新しいワールドを作成」から最初の冒険の書を作成してください。</p>
          </div>
        )}

        {!loading && !error && worlds.length > 0 && (
          <main className="relative z-10 grid grid-cols-1 gap-4 sm:gap-5">
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
          <button type="button" onClick={() => { playConfirmSound(); setShowCreateModal(true); }} onMouseEnter={playHoverSound} className="w-full mt-5 bg-amber-500 text-black px-5 py-3.5 sm:py-4 font-bold text-sm sm:text-base hover:bg-amber-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer min-h-[48px]">
            <Plus className="w-5 h-5 stroke-[3]" />
            <span className="font-mono font-black tracking-wide">+ NEW_WORLD // 新しいワールドを作成</span>
          </button>
        )}

        <footer className="relative z-10 mt-auto pt-8 pb-4 border-t border-[#2a3142] flex flex-wrap gap-4 justify-between items-center text-[10px] sm:text-xs text-slate-400 font-mono">
          <div className="flex gap-4 items-center"><span className="text-emerald-400 font-bold animate-pulse">● ONLINE</span><span>STORAGE: LOCAL</span><span>SYSTEM: READY</span></div>
          <div className="tracking-wider text-slate-400">UTAPEDIA SURVIVAL LOG</div>
        </footer>
      </div>

      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playModalCloseSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="border-2 border-red-500 bg-[#1a1e29] w-full max-w-md p-6 text-white shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-red-500/50 bg-red-950/50 text-red-400 shadow-md"><AlertTriangle className="h-7 w-7 animate-pulse" /></div>
              <div className="text-xs tracking-widest text-red-400 font-bold font-mono">SYSTEM WARNING // DATA DELETION</div>
              <h2 id="delete-world-title" className="mt-1.5 text-lg font-bold text-white">ワールドを削除しますか？</h2>
              <div className="mt-3 border border-red-500/40 bg-red-950/40 p-3"><p className="break-words text-sm font-bold text-amber-300">「{deleteTarget.name}」</p></div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#2a3142] pt-4">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} onMouseEnter={playHoverSound} className="min-h-[44px] py-2.5 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-600 cursor-pointer"><X className="mr-1 inline h-4 w-4" />CANCEL</button>
              <button type="button" onClick={confirmDelete} onMouseEnter={playHoverSound} className="min-h-[44px] py-2.5 bg-red-600 text-white hover:bg-red-500 text-xs font-bold flex items-center justify-center border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer"><Trash2 className="mr-1 inline h-4 w-4" />DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
