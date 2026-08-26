import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, AlertTriangle, X, Gamepad2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLocations, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import type { NavigateFn } from '@/components/Navigation';
import { playConfirmSound, playDeleteSound, playCancelSound, playErrorSound, playModalCloseSound } from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';

type WorldMeta = {
  recordCount: number;
  dayCount: number;
  lastLocationName: string | null;
  lastLocationDate: string | null;
  lastPhotoPath: string | null;
};

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
            <h1 className="text-amber-400 font-black tracking-widest text-base sm:text-lg font-mono crt-glow">
              UTAPEDIA // WORLD SELECT
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-400 font-bold tracking-wider opacity-90 font-mono">
            冒険の書を選択してください // SELECT SAVE SLOT
          </p>
        </header>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && worlds.length === 0 && (
          <div className="border-2 border-[#2d3446] relative mb-6 bg-[#1e222f] p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-amber-500/50 bg-[#141824] text-amber-400 shadow-md">
              <Gamepad2 className="h-8 w-8" />
            </div>
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
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              setShowCreateModal(true);
            }}
            className="w-full mt-5 bg-amber-500 text-black px-5 py-3.5 sm:py-4 font-bold text-sm sm:text-base hover:bg-amber-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(245,158,11,0.25)] cursor-pointer min-h-[48px]"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span className="font-mono font-black tracking-wide">+ NEW_WORLD // 新しいワールドを作成</span>
          </button>
        )}

        <footer className="relative z-10 mt-auto pt-8 pb-4 border-t border-[#2a3142] flex flex-wrap gap-4 justify-between items-center text-[10px] sm:text-xs text-slate-400 font-mono">
          <div className="flex gap-4 items-center">
            <span className="text-emerald-400 font-bold animate-pulse">● ONLINE</span>
            <span>STORAGE: LOCAL</span>
            <span>SYSTEM: READY</span>
          </div>
          <div className="tracking-wider text-slate-400">
            UTAPEDIA SURVIVAL LOG
          </div>
        </footer>
      </div>

      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playModalCloseSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="border-2 border-red-500 bg-[#1a1e29] w-full max-w-md p-6 text-white shadow-[0_0_40px_rgba(239,68,68,0.35)]">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-red-500/50 bg-red-950/50 text-red-400 shadow-md">
                <AlertTriangle className="h-7 w-7 animate-pulse" />
              </div>
              <div className="text-xs tracking-widest text-red-400 font-bold font-mono">SYSTEM WARNING // DATA DELETION</div>
              <h2 id="delete-world-title" className="mt-1.5 text-lg font-bold text-white">ワールドを削除しますか？</h2>
              <div className="mt-3 border border-red-500/40 bg-red-950/40 p-3">
                <p className="break-words text-sm font-bold text-amber-300">「{deleteTarget.name}」</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-300">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#2a3142] pt-4">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="min-h-[44px] py-2.5 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-600 cursor-pointer"><X className="mr-1 inline h-4 w-4" />CANCEL</button>
              <button type="button" onClick={confirmDelete} className="min-h-[44px] py-2.5 bg-red-600 text-white hover:bg-red-500 text-xs font-bold flex items-center justify-center border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer"><Trash2 className="mr-1 inline h-4 w-4" />DELETE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorldCard({ slotNumber, world, meta, onOpen, onEdit, onDelete }: { slotNumber: number; world: WorldWithMembers; meta?: WorldMeta; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const [photoUrl, setPhotoUrl] = useState('');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [memberPhotoUrls, setMemberPhotoUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];
    const loadPhotos = async () => {
      const paths = [meta?.lastPhotoPath, world.player_photo_path, ...world.members.map((member) => member.photo_path)];
      const validPaths = paths.filter((path): path is string => Boolean(path));
      if (validPaths.length === 0) { if (active) { setPhotoUrl(''); setPlayerPhotoUrl(''); setMemberPhotoUrls({}); } return; }
      const urls = await Promise.all(validPaths.map(async (path) => { try { return [path, await getPhotoUrl(path)] as const; } catch { return [path, ''] as const; } }));
      if (!active) { urls.forEach(([, url]) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); }); return; }
      objectUrls = urls.map(([, url]) => url).filter((url) => url.startsWith('blob:'));
      const urlMap = new Map(urls);
      setPhotoUrl(meta?.lastPhotoPath ? urlMap.get(meta.lastPhotoPath) ?? '' : '');
      setPlayerPhotoUrl(world.player_photo_path ? urlMap.get(world.player_photo_path) ?? '' : '');
      setMemberPhotoUrls(Object.fromEntries(world.members.map((member) => [member.id, member.photo_path ? urlMap.get(member.photo_path) ?? '' : ''])));
    };
    loadPhotos();
    return () => { active = false; objectUrls.forEach((url) => URL.revokeObjectURL(url)); };
  }, [meta?.lastPhotoPath, world.player_photo_path, world.members]);
  const formattedLastRecordDate = meta?.lastLocationDate ? new Date(meta.lastLocationDate).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;
  const slotLabel = String(slotNumber).padStart(2, '0');
  return (
    <article
      onClick={onOpen}
      className="group relative overflow-hidden bg-[#1e2330] border-2 border-[#2d3548] hover:border-amber-500/80 transition-all duration-150 hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] cursor-pointer"
    >
      {photoUrl && <img src={photoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-10" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1e2330]/98 via-[#1e2330]/95 to-[#1e2330]/85" />
      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-bold text-amber-400 bg-amber-500/15 px-2.5 py-1 border border-amber-500/40 shrink-0 font-mono shadow-sm">
              SLOT_{slotLabel}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-wide truncate text-white group-hover:text-amber-300 transition-colors">
              {world.name}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onEdit}
              title="編集"
              aria-label={`${world.name}を編集`}
              className="min-h-[36px] min-w-[36px] border border-slate-600 hover:border-amber-400 hover:text-amber-400 flex items-center justify-center text-slate-300 bg-[#141824] transition-colors cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              title="削除"
              aria-label={`${world.name}を削除`}
              className="min-h-[36px] min-w-[36px] border border-slate-600 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-red-400 bg-[#141824] transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center my-2">
          <div className="md:col-span-5 flex gap-2.5 overflow-x-auto pb-1 md:pb-0">
            <MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />
            {world.members.slice(0, 4).map((member) => (
              <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />
            ))}
            {Array.from({ length: Math.max(0, 4 - (1 + Math.min(world.members.length, 3))) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0">
                <div className="w-11 h-11 flex items-center justify-center border border-dashed border-slate-700 bg-slate-900/50">
                  <span className="text-[10px] text-slate-500 font-mono">--</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono">EMPTY</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-x-4 gap-y-1.5 md:border-x border-[#2d3548] px-0 md:px-4 py-2 md:py-0 border-y md:border-y-0 text-xs">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">DAYS</div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">{String(meta?.dayCount ?? 0).padStart(3, '0')} 日</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">RECORDS</div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono">{String(meta?.recordCount ?? 0).padStart(3, '0')} 件</div>
            </div>
            <div className="col-span-2 mt-1">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">LAST_CHECKPOINT</div>
              <div className="text-xs truncate text-slate-200 font-medium">{meta?.lastLocationName ?? '--- (未記録)'}</div>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-1 md:mt-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={onOpen}
              className="w-full md:w-auto px-6 py-3 text-xs sm:text-sm font-black tracking-wider flex items-center justify-center gap-2 bg-amber-500 text-black hover:bg-amber-400 border-b-3 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.25)] cursor-pointer min-h-[44px]"
            >
              <span>▶ 冒険を再開 (LOAD)</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 font-mono border-t border-[#2a3142] pt-2">
          <span className="text-emerald-400 font-bold">● READY</span>
          <span>最終記録: {formattedLastRecordDate || 'NO_DATA'}</span>
        </div>
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className="flex flex-col items-center shrink-0 min-w-[50px]">
      <div className="w-11 h-11 overflow-hidden mb-1 flex items-center justify-center relative border border-slate-600 bg-[#141824] shadow-sm">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover pixelated" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-black text-emerald-400 bg-slate-900 font-mono">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-300 truncate max-w-[56px] text-center font-medium">{name}</span>
      {player && <span className="text-[8px] text-amber-400 font-black font-mono">CMD</span>}
    </div>
  );
}
