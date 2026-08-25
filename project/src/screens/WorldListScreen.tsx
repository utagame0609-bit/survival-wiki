import { useEffect, useState } from 'react';
import { Plus, Globe, Pencil, Trash2, ChevronRight, AlertTriangle, X, MapPin } from 'lucide-react';
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
    fetchWorlds(gameId).then(async (data) => {
      const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${gameId}`);
      const sortedWorlds = [...data].sort((a, b) => {
        if (a.id === lastOpenedWorldId) return -1;
        if (b.id === lastOpenedWorldId) return 1;
        return 0;
      });

      const metaEntries = await Promise.all(
        data.map(async (world) => {
          const locations = await fetchLocations(world.id);
          const sortedLocations = [...locations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const dayKeys = new Set(
            locations.map((location) => {
              const date = new Date(location.created_at);
              return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }),
          );
          const latestLocation = sortedLocations[0];
          const latestPhoto = latestLocation
            ? latestLocation.photos.find((photo) => photo.is_main) ?? latestLocation.photos[0] ?? null
            : null;

          return [
            world.id,
            {
              recordCount: locations.length,
              dayCount: dayKeys.size,
              lastLocationName: latestLocation?.name ?? null,
              lastLocationDate: latestLocation?.created_at ?? null,
              lastPhotoPath: latestPhoto?.storage_path ?? null,
            },
          ] as const;
        }),
      );

      setWorlds(sortedWorlds);
      setWorldMeta(Object.fromEntries(metaEntries));
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [gameId]);

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
    <div className="world-select-screen min-h-screen bg-[#090b0a] text-stone-100">
      <Header title={gameName} onBack={goBack} />
      <div className="relative px-4 py-5 max-w-3xl mx-auto">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="relative mb-5 text-center">
          <p className="text-[10px] font-mono tracking-[0.32em] text-emerald-500/70 uppercase">SAVE DATA</p>
          <h1 className="mt-1 text-lg font-semibold tracking-[0.18em] text-zinc-100">ワールドを選択</h1>
        </div>
        {loading && <Spinner label="ワールドを読み込み中" />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && worlds.length === 0 && (
          <div className="relative mb-4 rounded-xl border border-emerald-950/70 bg-zinc-950/70 px-5 py-8 text-center">
            <p className="text-sm text-zinc-400">まだワールドがありません。</p>
            <p className="mt-1 text-xs text-zinc-600">NEW GAMEから最初のワールドを作成してください。</p>
          </div>
        )}
        {!loading && !error && worlds.length > 0 && (
          <div className="relative space-y-3">
            {worlds.map((world, index) => (
              <WorldCard key={world.id} slotNumber={index + 1} world={world} meta={worldMeta[world.id]}
                onOpen={() => { playConfirmSound(); localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, world.id); navigate({ name: 'world', worldId: world.id, worldName: world.name }); }}
                onEdit={() => { playConfirmSound(); navigate({ name: 'worldCreate', gameId, gameName, worldId: world.id }); }}
                onDelete={() => handleDelete(world)} />
            ))}
          </div>
        )}
        {!loading && !error && (
          <button type="button" onClick={() => { playConfirmSound(); setShowCreateModal(true); }} className="selectable-pulse group relative mt-3 w-full overflow-hidden rounded-xl border border-emerald-800/70 bg-gradient-to-r from-emerald-950/55 via-zinc-950/95 to-zinc-900/95 text-left shadow-[0_0_20px_rgba(16,185,129,0.08)] transition-all hover:border-emerald-500/70 hover:shadow-[0_0_24px_rgba(16,185,129,0.13)] active:scale-[0.995]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,185,129,0.10),transparent_42%,rgba(16,185,129,0.04))]" />
            <div className="relative flex min-h-[108px] items-center gap-4 px-4 py-4 sm:px-5">
              <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-lg border border-emerald-700/70 bg-emerald-950/40 text-emerald-400 shadow-[inset_0_0_14px_rgba(16,185,129,0.08)]"><Plus className="h-6 w-6 transition-transform group-hover:scale-110" /></div>
              <div className="min-w-0 flex-1"><div className="font-mono text-[10px] tracking-[0.2em] text-emerald-500/70">NEW GAME</div><div className="mt-1 text-base font-bold tracking-wide text-zinc-100 group-hover:text-emerald-200 transition-colors">新しいワールドを作成</div><div className="mt-1 text-xs text-zinc-500">空いているセーブデータを作成します</div></div>
              <ChevronRight className="h-5 w-5 shrink-0 text-emerald-800 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-300" />
            </div>
          </button>
        )}
      </div>
      {showCreateModal && <WorldCreateModal gameId={gameId} onClose={() => setShowCreateModal(false)} onCreated={load} />}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-900 to-[#151712] border border-emerald-900/70 shadow-[0_0_40px_rgba(0,0,0,0.55),0_0_24px_rgba(16,185,129,0.08)]">
            <div className="px-5 pt-6 pb-5 text-center"><div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/50 border border-red-900/60 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.12)]"><AlertTriangle className="w-7 h-7 text-red-300" /></div><h2 id="delete-world-title" className="text-lg font-bold text-zinc-100">ワールドを削除しますか？</h2><p className="mt-2 text-sm text-emerald-300 font-semibold break-words">「{deleteTarget.name}」</p><p className="mt-3 text-xs leading-5 text-zinc-500">この操作は元に戻せません。<br />ワールドに保存されている記録も削除されます。</p></div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5"><button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-950/80 border border-zinc-700 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-600 hover:text-zinc-100 active:scale-[0.98] transition-all"><X className="w-4 h-4" />キャンセル</button><button type="button" onClick={confirmDelete} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/70 border border-red-900/70 text-red-200 hover:bg-red-900/60 hover:border-red-800 hover:text-red-100 active:scale-[0.98] transition-all"><Trash2 className="w-4 h-4" />削除する</button></div>
          </div>
        </div>
      )}
      <style>{`
        .world-select-screen { position: relative; isolation: isolate; overflow: hidden; }
        .world-select-screen::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1; opacity: 0.32; background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.028) 0, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 50% 0%, rgba(16,185,129,0.09), transparent 42%); }
        .save-slot-card { border-width: 2px; border-color: rgba(167,243,208,0.48); box-shadow: inset 0 0 0 2px rgba(16,185,129,0.08), inset 0 0 28px rgba(16,185,129,0.045), 0 0 20px rgba(16,185,129,0.08); border-radius: 4px; }
        .save-slot-card::after { content: ""; position: absolute; inset: 4px; pointer-events: none; border: 1px solid rgba(167,243,208,0.14); border-radius: 2px; }
        .save-slot-load { min-width: 138px; min-height: 48px; border-width: 2px; border-radius: 3px; background: linear-gradient(180deg, rgba(16,185,129,0.22), rgba(6,78,59,0.42)); box-shadow: inset 0 0 0 2px rgba(16,185,129,0.08), 0 0 14px rgba(16,185,129,0.08); text-shadow: 0 0 8px rgba(167,243,208,0.35); }
        .save-slot-load:hover { box-shadow: inset 0 0 0 2px rgba(167,243,208,0.10), 0 0 22px rgba(16,185,129,0.22); }
        .save-slot-load:active { transform: translateY(1px) scale(0.985); }
        @media (max-width: 640px) { .save-slot-load { min-width: 118px; min-height: 44px; } }
      `}</style>
    </div>
  );
}

function WorldCard({ slotNumber, world, meta, onOpen, onEdit, onDelete }: { slotNumber: number; world: WorldWithMembers; meta?: WorldMeta; onOpen: () => void; onEdit: () => void; onDelete: () => void }) {
  const [photoUrl, setPhotoUrl] = useState('');
  useEffect(() => {
    let active = true; let objectUrl = '';
    if (!meta?.lastPhotoPath) { setPhotoUrl(''); return; }
    getPhotoUrl(meta.lastPhotoPath).then((url) => { if (!active) { if (url.startsWith('blob:')) URL.revokeObjectURL(url); return; } objectUrl = url.startsWith('blob:') ? url : ''; setPhotoUrl(url); }).catch(() => { if (active) setPhotoUrl(''); });
    return () => { active = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [meta?.lastPhotoPath]);

  const membersLabel = world.members.map((member) => member.name).join('・');
  const formattedLastRecordDate = meta?.lastLocationDate ? new Date(meta.lastLocationDate).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <article className="save-slot-card selectable-pulse group relative overflow-hidden bg-gradient-to-r from-emerald-950/55 via-zinc-950/95 to-zinc-900/95 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/70 hover:shadow-[0_0_26px_rgba(16,185,129,0.16)]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/92 to-zinc-950/90" />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[2px] border-2 border-emerald-200/45 bg-zinc-950/80 font-mono text-xs font-bold tracking-[0.12em] text-emerald-300 shadow-[inset_0_0_12px_rgba(16,185,129,0.08)]">DATA {String(slotNumber).padStart(2, '0')}</div>
          <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" aria-label={`${world.name}をロード`}><div className="flex items-center gap-2 min-w-0"><h3 className="truncate text-base font-bold text-zinc-100 group-hover:text-emerald-100 transition-colors">{world.name}</h3><span className="shrink-0 rounded-[2px] border border-emerald-200/30 bg-emerald-950/50 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-emerald-300">SAVE</span></div>{world.player && <p className="mt-1 truncate text-xs text-zinc-400">PLAYER / {world.player}</p>}</button>
          <div className="flex shrink-0 items-center gap-1"><button type="button" aria-label={`${world.name}を編集`} title="編集" onClick={(event) => { event.stopPropagation(); onEdit(); }} className="w-8 h-8 rounded-[2px] bg-zinc-950/70 border border-zinc-700 text-zinc-400 hover:border-emerald-300/60 hover:bg-emerald-950/30 hover:text-emerald-200 flex items-center justify-center transition-colors"><Pencil className="w-4 h-4" /></button><button type="button" aria-label={`${world.name}を削除`} title="削除" onClick={(event) => { event.stopPropagation(); playDeleteSound(); onDelete(); }} className="w-8 h-8 rounded-[2px] bg-red-950/30 border border-red-950/50 text-red-300 hover:bg-red-950/50 hover:border-red-900/60 hover:text-red-200 flex items-center justify-center transition-colors"><Trash2 className="w-4 h-4" /></button></div>
        </div>
        <div className="mt-4 grid grid-cols-[132px_minmax(0,1fr)] gap-4 sm:grid-cols-[164px_minmax(0,1fr)] sm:gap-5">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border-2 border-emerald-200/35 bg-zinc-950/90 shadow-[inset_0_0_18px_rgba(16,185,129,0.08),0_0_14px_rgba(16,185,129,0.06)]">
            {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover [image-rendering:auto]" /> : <div className="flex h-full w-full items-center justify-center"><Globe className="h-8 w-8 text-emerald-900" /></div>}
            <span className="absolute bottom-1 left-1 rounded-[1px] bg-black/70 px-1.5 py-0.5 text-[8px] font-mono tracking-wider text-zinc-200">PHOTO</span>
          </div>
          <div className="min-w-0">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <Stat label="DAY" value={String(meta?.dayCount ?? 0)} />
              <Stat label="RECORDS" value={String(meta?.recordCount ?? 0)} />
              <div className="min-w-0"><div className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">MEMBERS</div>{world.members.length > 0 ? <div title={membersLabel} className="mt-1 line-clamp-2 break-words text-xs leading-4 text-zinc-300">{membersLabel}</div> : <div className="mt-1 text-xs text-zinc-600">---</div>}</div>
              <div className="min-w-0"><div className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">LAST RECORD</div><div className="mt-1 truncate text-xs text-zinc-300">{formattedLastRecordDate ?? '---'}</div></div>
            </div>
            <div className="mt-5 border-t border-emerald-950/70 pt-4">
              <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-[0.16em] text-zinc-600"><MapPin className="h-3 w-3 text-emerald-600" />LAST LOCATION</div>
              <div className="mt-1 truncate text-sm font-semibold text-zinc-100">{meta?.lastLocationName ?? '---'}</div>
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end border-t border-emerald-950/60 pt-3"><button type="button" onClick={onOpen} className="save-slot-load selectable-pulse group/load flex items-center justify-center gap-2 font-mono text-sm font-bold tracking-[0.16em] text-emerald-100 transition-all hover:text-white active:scale-[0.98]">LOAD <ChevronRight className="h-5 w-5 transition-transform group-hover/load:translate-x-0.5" /></button></div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) { return <div className="min-w-0"><div className="font-mono text-[9px] tracking-[0.16em] text-zinc-600">{label}</div><div className="mt-1 truncate text-sm font-bold text-zinc-200">{value}</div></div>; }
