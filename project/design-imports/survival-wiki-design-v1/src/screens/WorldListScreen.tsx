import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, AlertTriangle, X, Gamepad2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLocations, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import type { NavigateFn } from '@/components/Navigation';
import { SettingsButton } from '@/components/SettingsModal';
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
    <div className="relative min-h-screen bg-[#050811] text-slate-100 font-mono overflow-x-hidden flex flex-col select-none world-select-screen">
      <div className="scanline-overlay" />
      <Header title={gameName} onBack={goBack} />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 flex-1 flex flex-col">
        <header className="relative z-10 flex flex-col items-center mb-6 text-center">
          <div className="border-2 border-amber-500/50 bg-[#0a1120] px-8 sm:px-12 py-2.5 mb-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <h1 className="text-amber-500 font-bold tracking-[0.2em] text-sm sm:text-base crt-glow">
              UTAPEDIA // WORLD SELECT
            </h1>
          </div>
          <p className="text-[10px] sm:text-xs text-emerald-400 font-bold tracking-widest opacity-90">
            SYSTEM STATUS: READY // SELECT SAVE SLOT
          </p>
        </header>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {!loading && !error && worlds.length === 0 && (
          <div className="border-2 border-[#1a2333] relative mb-6 bg-[#0d1627] p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-amber-500/40 bg-[#070c18] text-amber-400">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <p className="text-sm font-bold text-amber-400">セーブデータがありません</p>
            <p className="mt-1 text-xs text-slate-400">「+ NEW_WORLD」から最初の冒険の書を作成してください。</p>
          </div>
        )}

        {!loading && !error && worlds.length > 0 && (
          <main className="relative z-10 grid grid-cols-1 gap-4">
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
            className="w-full mt-4 bg-amber-500 text-black px-4 py-3 font-bold text-xs hover:bg-amber-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(245,158,11,0.2)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ NEW_WORLD // 新しいワールドを作成</span>
          </button>
        )}

        <footer className="relative z-10 mt-auto pt-8 pb-3 border-t border-[#1a2333] flex flex-wrap gap-4 justify-between items-center text-[9px] text-slate-500 font-mono">
          <div className="flex gap-4 items-center">
            <span className="text-emerald-400 font-bold animate-pulse">● ONLINE</span>
            <span>CPU_TEMP: 42°C</span>
            <span>DISK_I/O: IDLE</span>
          </div>
          <div className="tracking-[0.2em] text-slate-500">
            © 1998-2024 ADVENTURE_LOG_SYSTEMS
          </div>
        </footer>
      </div>

      <SettingsButton onOpenSoundStudio={() => navigate({ name: 'soundStudio' })} />

      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playModalCloseSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="border-2 border-red-500 bg-[#0a1120] w-full max-w-md p-6 text-[#f0f0f0] shadow-[0_0_40px_rgba(239,68,68,0.3)] font-mono">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border border-red-500/50 bg-red-950/40 text-red-400">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div className="text-[10px] tracking-widest text-red-400 font-bold">SYSTEM WARNING // DATA DELETION</div>
              <h2 id="delete-world-title" className="mt-1 text-base font-bold text-white">ワールドを削除しますか？</h2>
              <div className="mt-3 border border-red-500/30 bg-red-950/30 p-2.5">
                <p className="break-words text-xs font-bold text-amber-300">「{deleteTarget.name}」</p>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#1a2333] pt-4">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-700"><X className="mr-1 inline h-3.5 w-3.5" />CANCEL</button>
              <button type="button" onClick={confirmDelete} className="py-2.5 bg-red-600 text-white hover:bg-red-500 text-xs font-bold flex items-center justify-center border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"><Trash2 className="mr-1 inline h-3.5 w-3.5" />DELETE</button>
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
    <article className="group relative overflow-hidden bg-[#0d1627] border-2 border-[#1a2333] hover:border-emerald-500/70 transition-all duration-150 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]">
      {photoUrl && <img src={photoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0d1627]/98 via-[#0d1627]/95 to-[#0d1627]/80" />
      <div className="relative z-10 p-4 sm:p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/30 shrink-0 font-mono">
              SLOT_{slotLabel}
            </span>
            <h2 className="text-sm sm:text-base font-bold tracking-wide truncate text-slate-100">{world.name}</h2>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button type="button" onClick={(e) => { e.stopPropagation(); playConfirmSound(); onEdit(); }} title="編集" aria-label={`${world.name}を編集`} className="w-7 h-7 border border-slate-700 hover:border-amber-500 hover:text-amber-400 flex items-center justify-center text-slate-400 bg-[#070c18] transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="削除" aria-label={`${world.name}を削除`} className="w-7 h-7 border border-slate-700 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-red-500 bg-[#070c18] transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 flex gap-2 overflow-x-auto pb-1 md:pb-0">
            <MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />
            {world.members.slice(0, 4).map((member) => (
              <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />
            ))}
            {Array.from({ length: Math.max(0, 4 - (1 + Math.min(world.members.length, 3))) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 flex items-center justify-center border border-dashed border-slate-800 bg-slate-900/40">
                  <span className="text-[9px] text-slate-600">--</span>
                </div>
                <span className="text-[9px] text-slate-600 mt-0.5">EMPTY</span>
              </div>
            ))}
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-x-3 gap-y-1 md:border-x border-[#1a2333] px-0 md:px-3 py-2 md:py-0 border-y md:border-y-0 text-xs">
            <div>
              <div className="text-[9px] text-slate-500 uppercase">DAYS</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400">{String(meta?.dayCount ?? 0).padStart(3, '0')}</div>
            </div>
            <div>
              <div className="text-[9px] text-slate-500 uppercase">RECORDS</div>
              <div className="text-sm sm:text-base font-bold text-amber-400">{String(meta?.recordCount ?? 0).padStart(3, '0')}</div>
            </div>
            <div className="col-span-2 mt-0.5">
              <div className="text-[9px] text-slate-500 uppercase">LAST_CHECKPOINT</div>
              <div className="text-[11px] truncate text-slate-300">{meta?.lastLocationName ?? '--- (未記録)'}</div>
            </div>
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="w-full md:w-auto px-5 py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-2 bg-amber-500 text-black hover:bg-amber-400 border-b-2 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all shadow-[0_2px_8px_rgba(245,158,11,0.2)] cursor-pointer"
            >
              <span>▶ LOAD</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex justify-between items-center text-[9px] text-slate-500 font-mono">
          <span>STATUS: SYNCED</span>
          <span>LAST_MOD: {formattedLastRecordDate || 'NO_DATA'}</span>
        </div>
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className="flex flex-col items-center shrink-0 min-w-[48px]">
      <div className="w-10 h-10 overflow-hidden mb-1 flex items-center justify-center relative border border-slate-700 bg-[#070c18]">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover pixelated" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-400 bg-slate-900">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="text-[9px] text-slate-400 truncate max-w-[54px] text-center">{name}</span>
      {player && <span className="text-[7px] text-amber-500 font-bold">CMD</span>}
    </div>
  );
}

