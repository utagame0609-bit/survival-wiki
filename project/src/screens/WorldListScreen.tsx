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
    <div className="relative min-h-screen bg-[#0a1120] text-[#f0f0f0] font-mono overflow-x-hidden flex flex-col select-none world-select-screen">
      <div className="scanline-overlay" />
      <Header title={gameName} onBack={goBack} />
      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 flex-1 flex flex-col">
        <header className="relative z-10 flex flex-col items-center mb-8 text-center">
          <div className="double-border px-8 sm:px-12 py-3 bg-[#0a1120] mb-2"><h1 className="pixel-font text-xl sm:text-2xl tracking-widest crt-glow text-[#f0f0f0]">WORLD SELECT</h1></div>
          <p className="retro-font text-amber-500 tracking-[0.5em] text-sm font-bold">たびの きろく を えらぶ</p>
        </header>
        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && worlds.length === 0 && <div className="double-border relative mb-6 bg-[#10192d] p-8 text-center"><div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-white bg-[#1a2333] text-amber-400"><Gamepad2 className="h-7 w-7" /></div><p className="retro-font text-lg font-bold text-amber-400">セーブデータがありません</p><p className="retro-font mt-1 text-xs text-zinc-400">「NEW GAME」から最初の冒険の書を作成してください。</p></div>}
        {!loading && !error && worlds.length > 0 && <main className="relative z-10 grid grid-cols-1 gap-6">{worlds.map((world, index) => <WorldCard key={world.id} slotNumber={index + 1} world={world} meta={worldMeta[world.id]} onOpen={() => { playConfirmSound(); localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, world.id); navigate({ name: 'world', worldId: world.id, worldName: world.name }); }} onEdit={() => { playConfirmSound(); navigate({ name: 'worldCreate', gameId, gameName, worldId: world.id }); }} onDelete={() => handleDelete(world)} />)}</main>}
        {!loading && !error && <button type="button" onClick={() => { playConfirmSound(); setShowCreateModal(true); }} className="relative overflow-hidden group p-1 w-full text-left mt-6"><div className="w-full border-4 border-dashed border-white/30 p-6 sm:p-8 flex items-center justify-center gap-6 group-hover:border-emerald-500/60 transition-colors bg-[#0a1120]/80"><div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white/30 flex items-center justify-center group-hover:border-emerald-500 transition-all shrink-0"><Plus className="w-6 h-6 text-white/40 group-hover:text-emerald-400 group-hover:scale-110 transition-transform" /></div><div className="text-left"><div className="pixel-font text-xs text-white/40 mb-1 group-hover:text-emerald-400">NEW GAME</div><div className="retro-font text-base sm:text-lg font-bold tracking-widest text-white/70 group-hover:text-white">新しいワールドを作成</div></div></div></button>}
        <footer className="relative z-10 mt-10 pb-4 flex flex-wrap gap-4 justify-between items-center opacity-70"><div className="flex gap-6 retro-font text-[11px] uppercase tracking-widest"><span className="flex items-center gap-2"><div className="w-2 h-2 bg-white rounded-full" /> BACK</span><span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full" /> OPTION</span></div><div className="pixel-font text-[9px] sm:text-[10px] text-zinc-500">SURVIVAL_WIKI_OS_V1.02</div></footer>
      </div>
      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}><div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="double-border w-full max-w-md bg-[#0a1120] p-6 text-[#f0f0f0] shadow-[0_0_50px_rgba(244,63,94,0.3)]"><div className="text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-red-500 bg-red-950/60 text-red-400"><AlertTriangle className="h-6 w-6 animate-pulse" /></div><div className="pixel-font text-[9px] tracking-widest text-red-400">SYSTEM WARNING // WORLD DATA DELETION</div><h2 id="delete-world-title" className="retro-font mt-2 text-lg font-bold text-white">ワールドを削除しますか？</h2><div className="mt-3 border border-rose-500/40 bg-rose-950/20 p-2.5"><p className="retro-font break-words text-sm font-bold text-rose-300">「{deleteTarget.name}」</p></div><p className="retro-font mt-3 text-xs leading-relaxed text-zinc-400">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p></div><div className="mt-6 grid grid-cols-2 gap-4 border-t border-rose-500/30 pt-4"><button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="pixel-btn bg-zinc-800 text-white hover:bg-zinc-700 py-3 text-xs"><X className="mr-1 inline h-3.5 w-3.5" />CANCEL</button><button type="button" onClick={confirmDelete} className="pixel-btn bg-rose-600 text-white hover:bg-rose-500 py-3 text-xs"><Trash2 className="mr-1 inline h-3.5 w-3.5" />DELETE</button></div></div></div>}
      <style>{`
        .world-select-screen { position: relative; isolation: isolate; overflow: hidden; }
        .world-select-screen::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1; opacity: .32; background: repeating-linear-gradient(to bottom, rgba(255,255,255,.028) 0, rgba(255,255,255,.028) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 50% 0%, rgba(16,185,129,.09), transparent 42%); }
        .world-select-screen .double-border { border: 4px double #fff; box-shadow: 0 0 0 2px #0a1120, 0 0 0 4px #fff; }
        .world-select-screen .pixel-btn { font-family: 'Press Start 2P', monospace; background: #fff; color: #0a1120; box-shadow: 4px 4px 0 #000; transition: all .15s ease; }
        .world-select-screen .pixel-btn:hover { background: #34d399; }
        .world-select-screen .pixel-btn:active { transform: translateY(2px); box-shadow: 2px 2px 0 #000; }
        .world-select-screen .crt-glow { text-shadow: 0 0 8px currentColor; }
        .save-slot-card { border: 2px solid rgba(100,116,139,.55); box-shadow: inset 0 0 0 1px rgba(100,116,139,.08); border-radius: 4px; }
        .save-slot-card::after { content: ""; position: absolute; inset: 4px; pointer-events: none; border: 1px solid rgba(100,116,139,.14); border-radius: 2px; }
        .save-slot-load { min-height: 44px; border: 2px solid rgba(100,116,139,.55); border-radius: 3px; background: #10192d; box-shadow: inset 0 0 0 1px rgba(100,116,139,.08); color: #cbd5e1; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] { border: 4px double #ef4444 !important; box-shadow: 0 0 0 2px #0a1120, 0 0 0 4px #ef4444, 0 0 24px rgba(239,68,68,.2) !important; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > .text-center > .pixel-font { display: none; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > .text-center > h2 { margin-top: .5rem; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > .text-center > div.mt-3 { margin-top: .75rem; border-color: transparent; background: transparent; padding: 0; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > .text-center > div.mt-3 p { color: #fbbf24; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > .text-center > p.mt-3 { margin-top: .75rem; text-align: center; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > div.mt-6 { margin-top: 1.25rem; border-top: 0; padding-top: 0; gap: .75rem; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > div.mt-6 > .pixel-btn:first-child { background: #1a2333; color: #e2e8f0; box-shadow: none; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > div.mt-6 > .pixel-btn:first-child:hover { background: #202b3e; }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > div.mt-6 > .pixel-btn:last-child { background: #b91c1c; color: #fff; border: 2px solid #ef4444; box-shadow: 0 0 14px rgba(239,68,68,.18); }
        .world-select-screen [role="dialog"][aria-labelledby="delete-world-title"] > div.mt-6 > .pixel-btn:last-child:hover { background: #dc2626; }
      `}</style>
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
    <article className="save-slot-card selectable-pulse group relative overflow-hidden bg-[#10192d] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-[0_0_26px_rgba(16,185,129,.20)]">
      {photoUrl && <img src={photoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.10]" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a1120]/[.96] via-[#0a1120]/[.90] to-[#0a1120]/[.72]" />
      <div className="relative z-10 p-5">
        <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3 min-w-0"><span className="pixel-font text-xs text-amber-400 bg-white/10 px-2.5 py-1 border border-white/10 shrink-0">SLOT {slotLabel}</span><h2 className="retro-font text-lg sm:text-xl font-bold tracking-wider truncate text-[#f0f0f0]">{world.name}</h2></div><div className="flex gap-2 shrink-0"><button type="button" onClick={(e) => { e.stopPropagation(); playConfirmSound(); onEdit(); }} title="編集" aria-label={`${world.name}を編集`} className="w-7 h-7 border border-zinc-500 hover:border-white hover:text-white flex items-center justify-center text-zinc-400 bg-[#0a1120] transition-colors active:scale-95"><Pencil className="h-3.5 w-3.5" /></button><button type="button" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="削除" aria-label={`${world.name}を削除`} className="w-7 h-7 border border-red-900 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-red-500 bg-[#0a1120] transition-colors active:scale-95"><Trash2 className="h-3.5 w-3.5" /></button></div></div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 flex gap-2 sm:gap-3 overflow-x-auto pb-1 md:pb-0"><MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />{world.members.slice(0, 4).map((member) => <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />)}{Array.from({ length: Math.max(0, 5 - (1 + Math.min(world.members.length, 4))) }).map((_, idx) => <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0"><div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center border-2 border-dashed border-white/20 bg-black/40"><span className="pixel-font text-[9px] text-zinc-600">--</span></div><span className="retro-font text-[10px] text-zinc-600">EMPTY</span></div>)}</div>
          <div className="md:col-span-4 grid grid-cols-2 gap-x-4 gap-y-1 md:border-x border-white/20 px-0 md:px-4 py-3 md:py-0 border-y md:border-y-0"><div><div className="retro-font text-[10px] text-amber-400 opacity-80 uppercase">Days</div><div className="pixel-font text-base sm:text-lg crt-glow text-[#f0f0f0]">{String(meta?.dayCount ?? 0).padStart(3, '0')}</div></div><div><div className="retro-font text-[10px] text-emerald-400 opacity-80 uppercase">Records</div><div className="pixel-font text-base sm:text-lg crt-glow text-[#f0f0f0]">{String(meta?.recordCount ?? 0).padStart(3, '0')}</div></div><div className="col-span-2 mt-1"><div className="retro-font text-[10px] text-cyan-400 opacity-80 uppercase">Last Location</div><div className="retro-font text-xs truncate text-[#f0f0f0]">{meta?.lastLocationName ?? '--- (未記録)'}</div></div></div>
          <div className="md:col-span-3 flex justify-end"><button type="button" onClick={onOpen} className="save-slot-load w-full md:w-auto px-6 py-3.5 text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 font-mono font-bold text-slate-300 transition-all hover:border-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 hover:shadow-[0_0_18px_rgba(16,185,129,.18)] active:scale-[.98]"><span>LOAD</span><ChevronRight className="h-4 w-4" /></button></div>
        </div>
        <div className="mt-3 text-right text-[10px] text-zinc-500 retro-font uppercase">Last Record: {formattedLastRecordDate || 'NO DATA'}</div>
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return <div className="flex flex-col items-center shrink-0 min-w-[56px]"><div className="pixel-avatar w-12 h-12 sm:w-14 sm:h-14 overflow-hidden mb-1 flex items-center justify-center relative border-2 border-white bg-[#1a2333]">{photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover pixelated" /> : <div className="w-full h-full flex items-center justify-center pixel-font text-xs text-emerald-300 bg-[#162032]">{name.slice(0, 1)}</div>}</div><span className="retro-font text-[10px] opacity-80 truncate max-w-[64px] text-center">{name}</span>{player && <span className="pixel-font text-[7px] text-emerald-500">PLAYER</span>}</div>;
}