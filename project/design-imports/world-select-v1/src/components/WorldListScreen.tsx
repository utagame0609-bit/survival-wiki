import React, { useEffect, useState } from 'react';
import { Plus, ChevronRight, AlertTriangle, X, Sparkles, Gamepad2 } from 'lucide-react';
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

        const metaEntries = await Promise.all(
          data.map(async (world) => {
            const locations = await fetchLocations(world.id);
            const sortedLocations = [...locations].sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
            );
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
    <div className="relative min-h-screen bg-[#0a1120] text-[#f0f0f0] font-mono overflow-x-hidden flex flex-col select-none">
      {/* Scanline CRT overlay */}
      <div className="scanline-overlay" />

      <Header title={gameName} onBack={goBack} />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 flex-1 flex flex-col">
        {/* Geometric Balance Header Banner */}
        <header className="relative z-10 flex flex-col items-center mb-8 text-center">
          <div className="double-border px-8 sm:px-12 py-3 bg-[#0a1120] mb-2">
            <h1 className="pixel-font text-xl sm:text-2xl tracking-widest crt-glow text-[#f0f0f0]">
              WORLD SELECT
            </h1>
          </div>
          <p className="retro-font text-amber-500 tracking-[0.5em] text-sm font-bold">
            たびの きろく を えらぶ
          </p>
        </header>

        {/* Loading / Error States */}
        {loading && <Spinner label="セーブデータをよみこみ中..." />}
        {error && <ErrorBanner message={error} />}

        {/* Empty State */}
        {!loading && !error && worlds.length === 0 && (
          <div className="double-border relative mb-6 bg-[#10192d] p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-white bg-[#1a2333] text-amber-400">
              <Gamepad2 className="h-7 w-7" />
            </div>
            <p className="retro-font text-lg font-bold text-amber-400">セーブデータがありません</p>
            <p className="retro-font mt-1 text-xs text-zinc-400">
              「NEW GAME」から最初の冒険の書を作成してください。
            </p>
          </div>
        )}

        {/* World List Cards */}
        {!loading && !error && worlds.length > 0 && (
          <main className="relative z-10 grid grid-cols-1 gap-6">
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

        {/* NEW GAME Button (Geometric Balance Dashed Card) */}
        {!loading && !error && (
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              setShowCreateModal(true);
            }}
            className="relative overflow-hidden group p-1 w-full text-left mt-6"
          >
            <div className="w-full border-4 border-dashed border-white/30 p-6 sm:p-8 flex items-center justify-center gap-6 group-hover:border-emerald-500/60 transition-colors bg-[#0a1120]/80">
              <div className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-white/30 flex items-center justify-center group-hover:border-emerald-500 transition-all shrink-0">
                <div className="pixel-font text-2xl sm:text-3xl text-white/40 group-hover:text-emerald-400 group-hover:scale-110 transition-transform">
                  +
                </div>
              </div>
              <div className="text-left">
                <div className="pixel-font text-xs text-white/40 mb-1 group-hover:text-emerald-400">
                  NEW GAME
                </div>
                <div className="retro-font text-base sm:text-lg font-bold tracking-widest text-white/70 group-hover:text-white">
                  新しいワールドを作成
                </div>
              </div>
            </div>
          </button>
        )}

        {/* Geometric Balance Footer */}
        <footer className="relative z-10 mt-10 pb-4 flex flex-wrap gap-4 justify-between items-center opacity-70">
          <div className="flex gap-6 retro-font text-[11px] uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full" /> BACK
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full" /> OPTION
            </span>
          </div>
          <div className="pixel-font text-[9px] sm:text-[10px] text-zinc-500">
            SURVIVAL_WIKI_OS_V1.02
          </div>
        </footer>
      </div>

      {/* World Create Modal */}
      {showCreateModal && (
        <WorldCreateModal
          gameId={gameId}
          onClose={() => setShowCreateModal(false)}
          onCreated={load}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
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
            className="double-border w-full max-w-md bg-[#0a1120] p-6 text-[#f0f0f0] shadow-[0_0_50px_rgba(244,63,94,0.3)]"
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border-2 border-red-500 bg-red-950/60 text-red-400">
                <AlertTriangle className="h-6 w-6 animate-pulse" />
              </div>
              <div className="pixel-font text-[9px] tracking-widest text-red-400">
                WARNING: DELETE SAVE
              </div>
              <h2 id="delete-world-title" className="retro-font mt-2 text-lg font-bold text-white">
                ワールドを削除しますか？
              </h2>
              <div className="mt-3 border border-amber-400/40 bg-[#162032] p-2.5">
                <p className="retro-font break-words text-sm font-bold text-amber-300">
                  「{deleteTarget.name}」
                </p>
              </div>
              <p className="retro-font mt-3 text-xs leading-relaxed text-zinc-400">
                ※この操作は元に戻せません。<br />
                冒険の書に保存されたすべての場所・記録が消去されます。
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/20 pt-4">
              <button
                type="button"
                onClick={() => {
                  playCancelSound();
                  setDeleteTarget(null);
                }}
                className="pixel-btn bg-zinc-800 text-white hover:bg-zinc-700 py-3 text-xs"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="pixel-btn bg-red-600 text-white hover:bg-red-500 py-3 text-xs"
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorldCard({
  slotNumber,
  world,
  meta,
  onOpen,
  onEdit,
  onDelete,
}: {
  key?: React.Key;
  slotNumber: number;
  world: WorldWithMembers;
  meta?: WorldMeta;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
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
        if (active) {
          setPhotoUrl('');
          setPlayerPhotoUrl('');
          setMemberPhotoUrls({});
        }
        return;
      }

      const urls = await Promise.all(
        validPaths.map(async (path) => {
          try {
            return [path, await getPhotoUrl(path)] as const;
          } catch {
            return [path, ''] as const;
          }
        }),
      );
      if (!active) {
        urls.forEach(([, url]) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        return;
      }

      objectUrls = urls.map(([, url]) => url).filter((url) => url.startsWith('blob:'));
      const urlMap = new Map(urls);
      setPhotoUrl(meta?.lastPhotoPath ? urlMap.get(meta.lastPhotoPath) ?? '' : '');
      setPlayerPhotoUrl(world.player_photo_path ? urlMap.get(world.player_photo_path) ?? '' : '');
      setMemberPhotoUrls(
        Object.fromEntries(
          world.members.map((member) => [
            member.id,
            member.photo_path ? urlMap.get(member.photo_path) ?? '' : '',
          ]),
        ),
      );
    };

    loadPhotos();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [meta?.lastPhotoPath, world.player_photo_path, world.members]);

  const formattedLastRecordDate = meta?.lastLocationDate
    ? new Date(meta.lastLocationDate).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const slotLabel = String(slotNumber).padStart(2, '0');

  // Collect up to 5 party members: Player + companions (up to 4)
  const partyMembers = [
    {
      id: 'player',
      name: world.player || '主人公',
      photoUrl: playerPhotoUrl,
      isPlayer: true,
      colorGrad: 'from-pink-500 to-amber-500',
    },
    ...world.members.slice(0, 4).map((member, idx) => {
      const grads = [
        'from-blue-500 to-indigo-700',
        'from-green-500 to-teal-700',
        'from-yellow-500 to-orange-700',
        'from-purple-500 to-red-700',
      ];
      return {
        id: member.id,
        name: member.name,
        photoUrl: memberPhotoUrls[member.id] ?? '',
        isPlayer: false,
        colorGrad: grads[idx % grads.length],
      };
    }),
  ];

  return (
    <div className="slot-card double-border relative flex flex-col p-5">
      {/* Background Photo Atmosphere */}
      {photoUrl && (
        <img
          src={photoUrl}
          alt=""
          aria-hidden="true"
          className="pixelated pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]"
        />
      )}

      {/* Header: SLOT tag + World Name + Edit/Delete micro buttons */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <span className="pixel-font text-xs amber-text bg-white/10 px-2.5 py-1 border border-white/10 shrink-0">
            SLOT {slotLabel}
          </span>
          <h2 className="retro-font text-lg sm:text-xl font-bold tracking-wider truncate text-[#f0f0f0]">
            {world.name}
          </h2>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playConfirmSound();
              onEdit();
            }}
            title="編集"
            className="w-6 h-6 border border-zinc-500 hover:border-white hover:text-white flex items-center justify-center text-[10px] text-zinc-400 bg-[#0a1120] transition-colors active:scale-95"
          >
            E
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            title="削除"
            className="w-6 h-6 border border-red-900 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-[10px] text-red-500 bg-[#0a1120] transition-colors active:scale-95"
          >
            X
          </button>
        </div>
      </div>

      {/* Geometric 12-Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
        {/* Avatars: col-span-5 */}
        <div className="md:col-span-5 flex gap-2 sm:gap-3 overflow-x-auto pb-1 md:pb-0">
          {partyMembers.map((member) => (
            <MemberBadge
              key={member.id}
              name={member.name}
              photoUrl={member.photoUrl}
              colorGrad={member.colorGrad}
              player={member.isPlayer}
            />
          ))}
          {/* Fill empty spots if less than 5 */}
          {Array.from({ length: Math.max(0, 5 - partyMembers.length) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0">
              <div className="pixel-avatar w-12 h-12 sm:w-14 sm:h-14 overflow-hidden mb-1 flex items-center justify-center border-dashed border-white/20 bg-black/40">
                <span className="pixel-font text-[9px] text-zinc-600">--</span>
              </div>
              <span className="retro-font text-[10px] text-zinc-600">EMPTY</span>
            </div>
          ))}
        </div>

        {/* Stats Metrics: col-span-4 */}
        <div className="md:col-span-4 grid grid-cols-2 gap-x-4 gap-y-1 md:border-x border-white/20 px-0 md:px-4 py-3 md:py-0 border-y md:border-y-0">
          <div>
            <div className="retro-font text-[10px] amber-text opacity-80 uppercase">Days</div>
            <div className="pixel-font text-base sm:text-lg crt-glow text-[#f0f0f0]">
              {String(meta?.dayCount ?? 0).padStart(3, '0')}
            </div>
          </div>
          <div>
            <div className="retro-font text-[10px] green-text opacity-80 uppercase">Records</div>
            <div className="pixel-font text-base sm:text-lg crt-glow text-[#f0f0f0]">
              {String(meta?.recordCount ?? 0).padStart(3, '0')}
            </div>
          </div>
          <div className="col-span-2 mt-1">
            <div className="retro-font text-[10px] blue-text opacity-80 uppercase">
              Last Location
            </div>
            <div className="retro-font text-xs truncate text-[#f0f0f0]">
              {meta?.lastLocationName ?? '--- (未記録)'}
            </div>
          </div>
        </div>

        {/* LOAD Command: col-span-3 */}
        <div className="md:col-span-3 flex justify-end">
          <button
            type="button"
            onClick={onOpen}
            className="pixel-btn w-full md:w-auto px-6 py-3.5 text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2"
          >
            <span>LOAD</span>
          </button>
        </div>
      </div>

      {/* Card Footer: Timestamp */}
      <div className="mt-3 text-right text-[10px] text-zinc-500 retro-font uppercase relative z-10">
        Last Record: {formattedLastRecordDate || 'NO DATA'}
      </div>
    </div>
  );
}

function MemberBadge({
  name,
  photoUrl,
  colorGrad = 'from-pink-500 to-amber-500',
  player = false,
}: {
  key?: React.Key;
  name: string;
  photoUrl: string;
  colorGrad?: string;
  player?: boolean;
}) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <div className="pixel-avatar w-12 h-12 sm:w-14 sm:h-14 overflow-hidden mb-1 flex items-center justify-center relative">
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover pixelated" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colorGrad} opacity-80 flex items-center justify-center pixel-font text-xs text-white`}>
            {name.slice(0, 1)}
          </div>
        )}
      </div>
      <span className="retro-font text-[10px] opacity-80 truncate max-w-[56px] text-center">
        {name}
      </span>
    </div>
  );
}
