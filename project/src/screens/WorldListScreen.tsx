import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, AlertTriangle, X } from 'lucide-react';
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
      <div className="relative mx-auto max-w-3xl px-4 py-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-950/20 to-transparent" />
        <div className="relative mb-5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-emerald-500/70">SAVE DATA</p>
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
              <WorldCard
                key={world.id}
                slotNumber={index + 1}
                world={world}
                meta={worldMeta[world.id]}
                onOpen={() => { playConfirmSound(); localStorage.setItem(`survival-wiki:last-opened-world:${gameId}`, world.id); navigate({ name: 'world', worldId: world.id, worldName: world.name }); }}
                onEdit={() => { playConfirmSound(); navigate({ name: 'worldCreate', gameId, gameName, worldId: world.id }); }}
                onDelete={() => handleDelete(world)}
              />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setDeleteTarget(null); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="w-full max-w-md overflow-hidden rounded-2xl border border-emerald-900/70 bg-gradient-to-b from-zinc-900 to-[#151712] shadow-[0_0_40px_rgba(0,0,0,0.55),0_0_24px_rgba(16,185,129,0.08)]">
            <div className="px-5 pb-5 pt-6 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-900/60 bg-red-950/50 shadow-[0_0_20px_rgba(239,68,68,0.12)]"><AlertTriangle className="h-7 w-7 text-red-300" /></div><h2 id="delete-world-title" className="text-lg font-bold text-zinc-100">ワールドを削除しますか？</h2><p className="mt-2 break-words text-sm font-semibold text-emerald-300">「{deleteTarget.name}」</p><p className="mt-3 text-xs leading-5 text-zinc-500">この操作は元に戻せません。<br />ワールドに保存されている記録も削除されます。</p></div>
            <div className="grid grid-cols-2 gap-3 px-5 pb-5"><button type="button" onClick={() => { playCancelSound(); setDeleteTarget(null); }} className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-950/80 py-3 text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-900 hover:text-zinc-100 active:scale-[0.98]"><X className="h-4 w-4" />キャンセル</button><button type="button" onClick={confirmDelete} className="flex items-center justify-center gap-2 rounded-xl border border-red-900/70 bg-red-950/70 py-3 text-red-200 transition-all hover:border-red-800 hover:bg-red-900/60 hover:text-red-100 active:scale-[0.98]"><Trash2 className="h-4 w-4" />削除する</button></div>
          </div>
        </div>
      )}
      <style>{`
        .world-select-screen { position: relative; isolation: isolate; overflow: hidden; }
        .world-select-screen::before { content: ""; position: fixed; inset: 0; pointer-events: none; z-index: -1; opacity: 0.32; background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.028) 0, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px), radial-gradient(circle at 50% 0%, rgba(16,185,129,0.09), transparent 42%); }
        .save-slot-card { border: 2px solid rgba(167,243,208,0.48); box-shadow: inset 0 0 0 2px rgba(16,185,129,0.08), inset 0 0 28px rgba(16,185,129,0.045), 0 0 20px rgba(16,185,129,0.08); border-radius: 4px; font-family: 'DotGothic16', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        .save-slot-card::after { content: ""; position: absolute; inset: 4px; pointer-events: none; border: 1px solid rgba(167,243,208,0.14); border-radius: 2px; }
        .save-slot-load { min-height: 44px; border: 2px solid rgba(167,243,208,0.45); border-radius: 3px; background: linear-gradient(180deg, rgba(16,185,129,0.22), rgba(6,78,59,0.42)); box-shadow: inset 0 0 0 2px rgba(16,185,129,0.08), 0 0 14px rgba(16,185,129,0.08); text-shadow: 0 0 8px rgba(167,243,208,0.35); }
        .save-slot-load:hover { box-shadow: inset 0 0 0 2px rgba(167,243,208,0.10), 0 0 22px rgba(16,185,129,0.22); }
        .save-slot-load:active { transform: translateY(1px) scale(0.985); }
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
      const paths = [
        meta?.lastPhotoPath,
        world.player_photo_path,
        ...world.members.map((member) => member.photo_path),
      ];
      const validPaths = paths.filter((path): path is string => Boolean(path));
      if (validPaths.length === 0) {
        if (active) { setPhotoUrl(''); setPlayerPhotoUrl(''); setMemberPhotoUrls({}); }
        return;
      }

      const urls = await Promise.all(validPaths.map(async (path) => {
        try { return [path, await getPhotoUrl(path)] as const; } catch { return [path, ''] as const; }
      }));
      if (!active) {
        urls.forEach(([, url]) => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
        return;
      }

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
    <article className="save-slot-card selectable-pulse group relative overflow-hidden bg-[#0d100f] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200/70 hover:shadow-[0_0_26px_rgba(16,185,129,0.16)]">
      {photoUrl && <img src={photoUrl} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14]" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#090b0a]/[0.96] via-[#090b0a]/[0.90] to-[#090b0a]/[0.72]" />
      <div className="relative p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="shrink-0 font-mono text-[10px] font-bold tracking-[0.18em] text-emerald-300/80">SAVE SLOT {slotLabel}</div>
          <div className="min-w-0 flex-1 truncate text-sm font-bold tracking-wide text-zinc-100">{world.name}</div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" aria-label={`${world.name}を編集`} title="編集" onClick={(event) => { event.stopPropagation(); playConfirmSound(); onEdit(); }} className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-zinc-700 bg-zinc-950/70 text-zinc-400 transition-colors hover:border-emerald-300/60 hover:bg-emerald-950/30 hover:text-emerald-200 active:scale-95"><Pencil className="h-4 w-4" /></button>
            <button type="button" aria-label={`${world.name}を削除`} title="削除" onClick={(event) => { event.stopPropagation(); onDelete(); }} className="flex h-8 w-8 items-center justify-center rounded-[2px] border border-red-950/50 bg-red-950/30 text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/50 hover:text-red-200 active:scale-95"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />
          {world.members.slice(0, 2).map((member) => <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />)}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 border-y border-emerald-950/70 py-3">
          <div><div className="font-mono text-[9px] tracking-[0.18em] text-zinc-600">DAY</div><div className="mt-1 text-base font-bold text-zinc-100">{meta?.dayCount ?? 0}</div></div>
          <div><div className="font-mono text-[9px] tracking-[0.18em] text-zinc-600">RECORDS</div><div className="mt-1 text-base font-bold text-zinc-100">{meta?.recordCount ?? 0}</div></div>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
          <div className="min-w-0">
            <div className="font-mono text-[9px] tracking-[0.18em] text-zinc-600">LAST LOCATION</div>
            <div className="mt-1 truncate text-sm font-bold text-zinc-100">{meta?.lastLocationName ?? '---'}</div>
          </div>
          <button type="button" onClick={onOpen} className="save-slot-load selectable-pulse flex shrink-0 items-center justify-center gap-2 px-5 font-mono text-sm font-bold tracking-[0.16em] text-emerald-100 transition-all hover:text-white active:scale-[0.98]">LOAD <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" /></button>
        </div>
        {formattedLastRecordDate && <div className="mt-2 text-right font-mono text-[9px] tracking-[0.08em] text-zinc-700">LAST RECORD / {formattedLastRecordDate}</div>}
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className="min-w-0 text-center">
      <div className="mx-auto flex aspect-square w-full max-w-[72px] items-center justify-center overflow-hidden rounded-[3px] border-2 border-emerald-200/35 bg-zinc-950/80 shadow-[inset_0_0_14px_rgba(16,185,129,0.08)]">
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : <span className="truncate px-1 font-mono text-[11px] font-bold text-emerald-200/80">{name}</span>}
      </div>
      <div className="mt-1 truncate text-[11px] font-semibold text-zinc-300">{name}</div>
      {player && <div className="font-mono text-[8px] tracking-[0.12em] text-emerald-700">PLAYER</div>}
    </div>
  );
}
