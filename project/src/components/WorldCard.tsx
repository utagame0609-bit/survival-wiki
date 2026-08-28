import { useEffect, useState } from 'react';
import { ChevronRight, Pencil, Trash2, User, Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playHoverSound } from '@/lib/sound';

export type WorldMeta = {
  recordCount: number;
  dayCount: number;
  lastLocationName: string | null;
  lastLocationDate: string | null;
  lastPhotoPath: string | null;
};

type WorldCardProps = {
  slotNumber: number;
  world: WorldWithMembers;
  meta?: WorldMeta;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function WorldCard({ slotNumber, world, meta, onOpen, onEdit, onDelete }: WorldCardProps) {
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [memberPhotoUrls, setMemberPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    const loadPhotos = async () => {
      const paths = [world.player_photo_path, ...world.members.map((member) => member.photo_path)].filter(
        (path): path is string => Boolean(path),
      );

      if (paths.length === 0) {
        if (active) {
          setPlayerPhotoUrl('');
          setMemberPhotoUrls({});
        }
        return;
      }

      const urls = await Promise.all(
        paths.map(async (path) => {
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
      setPlayerPhotoUrl(world.player_photo_path ? urlMap.get(world.player_photo_path) ?? '' : '');
      setMemberPhotoUrls(
        Object.fromEntries(
          world.members.map((member) => [member.id, member.photo_path ? urlMap.get(member.photo_path) ?? '' : '']),
        ),
      );
    };

    loadPhotos();
    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [world.player_photo_path, world.members]);

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
  const companions = world.members.filter((member) => member.name !== world.player).slice(0, 5);

  return (
    <article
      onClick={onOpen}
      onMouseEnter={playHoverSound}
      className="group relative overflow-hidden bg-[#1a2030] border-2 border-[#2d3548] hover:border-amber-500/80 transition-all duration-150 cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.35)]"
    >
      <div className="relative z-10 p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 border-b border-[#2d3548] pb-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 border border-amber-500/60 bg-amber-500/15 px-2 py-1 text-[10px] sm:text-[11px] font-black font-mono tracking-wide text-amber-300">
              SLOT_{slotLabel}
            </span>
            <h2 className="min-w-0 truncate text-sm sm:text-base font-black tracking-wide text-white group-hover:text-amber-300 transition-colors">
              {world.name}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={onEdit}
              onMouseEnter={playHoverSound}
              title="ワールド設定を編集"
              aria-label={`${world.name}を編集`}
              className="flex h-9 w-9 items-center justify-center border border-slate-700 bg-[#101522] text-slate-300 transition-all hover:border-amber-400 hover:text-amber-300 active:scale-95 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              onMouseEnter={playHoverSound}
              title="ワールドを削除"
              aria-label={`${world.name}を削除`}
              className="flex h-9 w-9 items-center justify-center border border-slate-700 bg-[#101522] text-slate-400 transition-all hover:border-rose-500 hover:text-rose-300 active:scale-95 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center md:gap-4">
          <div className="md:col-span-5 flex min-w-0 items-center gap-1.5 overflow-x-auto pb-0.5">
            <MemberChip name={world.player || '---'} photoUrl={playerPhotoUrl} player />
            {companions.map((member) => (
              <MemberChip key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />
            ))}
            {companions.length === 0 && (
              <span className="ml-1 shrink-0 text-[9px] font-mono italic text-slate-500">SOLO</span>
            )}
          </div>

          <div className="md:col-span-4 grid grid-cols-3 gap-0 border border-slate-700/80 bg-[#0e141f] px-2.5 py-2.5 md:border-y md:border-x md:px-3">
            <Stat label="DAYS" value={String(meta?.dayCount ?? 0).padStart(3, '0')} suffix="日" tone="emerald" />
            <Stat label="RECORDS" value={String(meta?.recordCount ?? 0).padStart(3, '0')} suffix="件" tone="amber" divider />
            <Stat
              label="LAST_CHECKPOINT"
              value={meta?.lastLocationName ?? '------'}
              tone="slate"
              truncate
              divider
            />
          </div>

          <div className="md:col-span-3" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={onOpen}
              onMouseEnter={playHoverSound}
              className="flex min-h-[46px] w-full items-center justify-center gap-1.5 border-b-3 border-amber-700 bg-amber-500 px-4 py-2.5 text-xs sm:text-sm font-black font-mono text-black shadow-[0_2px_12px_rgba(245,158,11,0.22)] transition-all hover:bg-amber-400 active:translate-y-0.5 active:border-b-0 cursor-pointer"
            >
              <span>▶ 冒険を再開 (LOAD)</span>
              <ChevronRight className="h-4 w-4 stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#2a3142] pt-2 text-[9px] sm:text-[10px] font-mono">
          <span className="flex items-center gap-1.5 font-black text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> READY
          </span>
          <span className="text-slate-400">最終記録: {formattedLastRecordDate || 'NO_DATA'}</span>
        </div>
      </div>
    </article>
  );
}

function MemberChip({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center gap-1.5 border px-1.5 py-1 ${
        player ? 'border-amber-500/70 bg-amber-500/10' : 'border-cyan-500/40 bg-[#101b29]'
      }`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center overflow-hidden border bg-[#080d15] ${
          player ? 'border-amber-400/80' : 'border-cyan-400/60'
        }`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover pixelated" />
        ) : player ? (
          <User className="h-4 w-4 text-amber-400" />
        ) : (
          <Users className="h-4 w-4 text-cyan-400" />
        )}
      </div>
      <div className="min-w-0 max-w-[72px]">
        <div className={`truncate text-[9px] sm:text-[10px] font-bold ${player ? 'text-amber-300' : 'text-cyan-200'}`}>
          {name}
        </div>
        {player && <div className="text-[7px] font-mono font-black text-amber-400/80">CMD</div>}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
  truncate = false,
  divider = false,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone: 'emerald' | 'amber' | 'slate';
  truncate?: boolean;
  divider?: boolean;
}) {
  const valueClass = tone === 'emerald' ? 'text-emerald-400' : tone === 'amber' ? 'text-amber-400' : 'text-slate-200';

  return (
    <div className={`${divider ? 'border-l border-slate-700 pl-2.5' : 'pr-2.5'}`}>
      <div className="text-[7px] sm:text-[8px] font-black tracking-wide text-slate-500 font-mono">{label}</div>
      <div className={`mt-0.5 text-[11px] sm:text-xs font-black font-mono ${valueClass} ${truncate ? 'truncate' : ''}`}>
        {value}
        {suffix && <span className="ml-0.5 text-[8px] font-normal text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}
