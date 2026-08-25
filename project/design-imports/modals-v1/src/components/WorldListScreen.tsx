import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, AlertTriangle, X, Gamepad2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { deleteWorld, fetchWorlds, fetchLocations, getPhotoUrl } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { WorldCreateModal } from '@/components/WorldCreateModal';
import type { NavigateFn } from '@/components/Navigation';
import { playConfirmSound, playDeleteSound, playCancelSound, playErrorSound } from '@/lib/sound';

type WorldMeta = {
  recordCount: number;
  dayCount: number;
  lastLocationName: string | null;
  lastLocationDate: string | null;
  lastPhotoPath: string | null;
};

export function WorldListScreen({ gameId, gameName, navigate, goBack }: { gameId: string; gameName: string; navigate: NavigateFn; goBack?: () => void }) {
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
    <div className="relative min-h-screen bg-[#06090e] text-[#f0f0f0] font-mono overflow-x-hidden flex flex-col select-none world-select-screen">
      <div className="scanline-overlay" />
      <Header title={gameName || 'ADVENTURE LOG SYSTEM'} onBack={goBack} />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 flex-1 flex flex-col">
        <header className="relative z-10 flex flex-col items-center mb-8 text-center">
          <div className="border-2 border-amber-500/80 px-8 sm:px-12 py-2.5 bg-[#0d1627] mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <h1 className="text-lg sm:text-xl font-black tracking-widest text-amber-400">
              WORLD SELECT // 冒険の書 選択
            </h1>
          </div>
          <p className="text-emerald-400 tracking-[0.3em] text-xs font-bold font-mono">
            SELECT ADVENTURE LOG // たびの きろく を えらぶ
          </p>
        </header>

        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && worlds.length === 0 && (
          <div className="border border-slate-800 relative mb-6 bg-[#090d16] p-8 text-center rounded-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border border-amber-500/60 bg-[#0d1627] text-amber-400">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <p className="text-base font-bold text-amber-400">セーブデータがありません</p>
            <p className="mt-1 text-xs text-slate-400">「NEW GAME」から最初の冒険の書を作成してください。</p>
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
                  setShowCreateModal(true);
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
            className="relative overflow-hidden group w-full text-left mt-6 cursor-pointer"
          >
            <div className="w-full border-2 border-dashed border-slate-700 p-6 sm:p-7 flex items-center justify-center gap-5 group-hover:border-amber-500/80 transition-all bg-[#090d16]/90 rounded-sm shadow-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 border border-slate-700 flex items-center justify-center group-hover:border-amber-500 group-hover:bg-amber-500/10 transition-all shrink-0">
                <Plus className="w-6 h-6 text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-emerald-400 font-bold mb-0.5 tracking-wider">
                  + INITIALIZE NEW SLOT
                </div>
                <div className="text-sm sm:text-base font-bold tracking-wider text-slate-200 group-hover:text-amber-400 transition-colors">
                  新しいワールドを作成 (NEW GAME)
                </div>
              </div>
            </div>
          </button>
        )}

        <footer className="relative z-10 mt-10 pb-4 flex flex-wrap gap-4 justify-between items-center opacity-75 text-xs text-slate-500">
          <div className="flex gap-4 font-mono text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> READY</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Tac-HUD V2</span>
          </div>
          <div className="text-[10px] text-slate-600 font-mono">TAC_HUD_OS_V1.0.4</div>
        </footer>
      </div>

      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="w-full max-w-md bg-[#0a1120] p-6 text-[#f0f0f0] border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.35)] rounded-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border-2 border-rose-500 bg-rose-950/80 text-rose-400 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="h-7 w-7 animate-pulse" />
              </div>
              <div className="text-[10px] tracking-widest text-rose-400 font-bold uppercase">WARNING // DELETE SAVE DATA</div>
              <h2 id="delete-world-title" className="mt-2 text-base sm:text-lg font-bold text-white uppercase">ワールドを削除しますか？</h2>
              <div className="mt-3 border border-amber-500/40 bg-[#090d16] p-3 rounded-sm">
                <p className="break-words text-sm font-bold text-amber-400">「{deleteTarget.name}」</p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-400 font-mono">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="py-2.5 rounded-sm bg-[#0d1627] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer uppercase">
                <X className="mr-1 inline h-3.5 w-3.5" />キャンセル
              </button>
              <button type="button" onClick={confirmDelete} className="py-2.5 rounded-sm bg-rose-600 border border-rose-400 text-white hover:bg-rose-500 active:scale-[0.98] transition-all text-xs font-bold font-mono shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer uppercase">
                <Trash2 className="mr-1 inline h-3.5 w-3.5" />抹消する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorldCard({ slotNumber, world, meta, onOpen, onEdit, onDelete }: { slotNumber: number; world: WorldWithMembers; meta?: WorldMeta; onOpen: () => void; onEdit: () => void; onDelete: () => void; key?: string | number }) {
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
    <article className="group relative overflow-hidden rounded-sm bg-[#090d16] border border-slate-800 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-500 hover:shadow-[0_0_24px_rgba(56,189,248,0.18)]">
      {/* Background Subtle Photo */}
      {photoUrl && <img src={photoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#06090e]/95 via-[#06090e]/90 to-[#06090e]/75" />
      
      {/* Accent left indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-slate-800 group-hover:bg-amber-500 transition-colors" />

      <div className="relative z-10 p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="px-2 py-0.5 rounded-sm border border-amber-500/40 bg-amber-500/10 text-[10px] font-mono text-amber-400 font-bold shrink-0">
              SLOT {slotLabel}
            </span>
            <h2 className="text-base sm:text-lg font-bold tracking-wider truncate text-[#f0f0f0] group-hover:text-amber-400 transition-colors">
              {world.name}
            </h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); playConfirmSound(); onEdit(); }}
              title="編集"
              aria-label={`${world.name}を編集`}
              className="w-7 h-7 border border-slate-700 hover:border-amber-500 hover:text-amber-400 flex items-center justify-center text-slate-400 bg-[#0d1627] transition-colors rounded-sm cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              title="削除"
              aria-label={`${world.name}を削除`}
              className="w-7 h-7 border border-slate-700 hover:border-rose-500 hover:text-rose-400 flex items-center justify-center text-slate-400 bg-[#0d1627] transition-colors rounded-sm cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Members Avatars */}
          <div className="md:col-span-5 flex gap-2 sm:gap-3 overflow-x-auto pb-1 md:pb-0">
            <MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />
            {world.members.slice(0, 4).map((member) => (
              <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />
            ))}
            {Array.from({ length: Math.max(0, 4 - Math.min(world.members.length, 3)) }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center border border-dashed border-slate-800 bg-[#050a14] rounded-sm">
                  <span className="text-[9px] text-slate-600 font-mono">--</span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono mt-1">EMPTY</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="md:col-span-4 grid grid-cols-2 gap-x-4 gap-y-1.5 md:border-x border-slate-800 px-0 md:px-4 py-3 md:py-0 border-y md:border-y-0">
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-bold">DAYS</div>
              <div className="text-base sm:text-lg font-bold text-slate-100 font-mono">{String(meta?.dayCount ?? 0).padStart(3, '0')}</div>
            </div>
            <div>
              <div className="text-[10px] text-emerald-400 uppercase font-bold">RECORDS</div>
              <div className="text-base sm:text-lg font-bold text-slate-100 font-mono">{String(meta?.recordCount ?? 0).padStart(3, '0')}</div>
            </div>
            <div className="col-span-2 mt-0.5">
              <div className="text-[10px] text-sky-400 uppercase font-bold">LAST LOCATION</div>
              <div className="text-xs truncate text-slate-300 font-mono">{meta?.lastLocationName ?? '--- (未記録)'}</div>
            </div>
          </div>

          {/* Load CTA */}
          <div className="md:col-span-3 flex justify-end">
            <button
              type="button"
              onClick={onOpen}
              className="w-full md:w-auto px-6 py-3 rounded-sm bg-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:bg-amber-400 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>LOAD</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="mt-3 text-right text-[10px] text-slate-500 font-mono uppercase">
          LAST RECORD: {formattedLastRecordDate || 'NO DATA'}
        </div>
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean; key?: string | number }) {
  return (
    <div className="flex flex-col items-center shrink-0 min-w-[50px]">
      <div className="w-11 h-11 sm:w-12 sm:h-12 overflow-hidden mb-1 flex items-center justify-center relative border border-slate-700 bg-[#050a14] rounded-sm">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-amber-400 font-bold bg-[#0d1627]">
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-300 font-mono truncate max-w-[56px] text-center">
        {name}
      </span>
      {player && <span className="text-[8px] text-emerald-400 font-mono font-bold">PLAYER</span>}
    </div>
  );
}
