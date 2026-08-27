import { useEffect, useState } from 'react';
import { ChevronRight, Pencil, Trash2 } from 'lucide-react';
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
  const [photoUrl, setPhotoUrl] = useState('');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState('');
  const [memberPhotoUrls, setMemberPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    const loadPhotos = async () => {
      const paths = [meta?.lastPhotoPath, world.player_photo_path, ...world.members.map((member) => member.photo_path)];
      const validPaths = paths.filter((path): path is string => Boolean(path));

      if (validPaths.length === 0) {
        if (active) {
          setPhotoUrl('');
          setPlayerPhotoUrl('');
          setMemberPhotoUrls({});
        }
        return;
      }

      const urls = await Promise.all(validPaths.map(async (path) => {
        try {
          return [path, await getPhotoUrl(path)] as const;
        } catch {
          return [path, ''] as const;
        }
      }));

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
      setMemberPhotoUrls(Object.fromEntries(world.members.map((member) => [member.id, member.photo_path ? urlMap.get(member.photo_path) ?? '' : ''])));
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

  return (
    <article
      onClick={onOpen}
      onMouseEnter={playHoverSound}
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
            <button type="button" onClick={onEdit} onMouseEnter={playHoverSound} title="編集" aria-label={`${world.name}を編集`} className="min-h-[36px] min-w-[36px] border border-slate-600 hover:border-amber-400 hover:text-amber-400 flex items-center justify-center text-slate-300 bg-[#141824] transition-colors cursor-pointer"><Pencil className="h-4 w-4" /></button>
            <button type="button" onClick={onDelete} onMouseEnter={playHoverSound} title="削除" aria-label={`${world.name}を削除`} className="min-h-[36px] min-w-[36px] border border-slate-600 hover:border-red-500 hover:text-red-400 flex items-center justify-center text-red-400 bg-[#141824] transition-colors cursor-pointer"><Trash2 className="h-4 w-4" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-center my-2">
          <div className="md:col-span-5 flex gap-2.5 overflow-x-auto pb-1 md:pb-0">
            <MemberBadge name={world.player ?? '---'} photoUrl={playerPhotoUrl} player />
            {world.members.slice(0, 4).map((member) => <MemberBadge key={member.id} name={member.name} photoUrl={memberPhotoUrls[member.id] ?? ''} />)}
            {Array.from({ length: Math.max(0, 4 - (1 + Math.min(world.members.length, 3))) }).map((_, idx) => <div key={`empty-${idx}`} className="flex flex-col items-center shrink-0"><div className="w-11 h-11 flex items-center justify-center border border-dashed border-slate-700 bg-slate-900/50"><span className="text-[10px] text-slate-500 font-mono">--</span></div><span className="text-[10px] text-slate-500 mt-1 font-mono">EMPTY</span></div>)}
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-x-4 gap-y-1.5 md:border-x border-[#2d3548] px-0 md:px-4 py-2 md:py-0 border-y md:border-y-0 text-xs">
            <div><div className="text-[10px] text-slate-400 uppercase font-mono font-bold">DAYS</div><div className="text-base sm:text-lg font-black text-emerald-400 font-mono">{String(meta?.dayCount ?? 0).padStart(3, '0')} 日</div></div>
            <div><div className="text-[10px] text-slate-400 uppercase font-mono font-bold">RECORDS</div><div className="text-base sm:text-lg font-black text-amber-400 font-mono">{String(meta?.recordCount ?? 0).padStart(3, '0')} 件</div></div>
            <div className="col-span-2 mt-1"><div className="text-[10px] text-slate-400 uppercase font-mono font-bold">LAST_CHECKPOINT</div><div className="text-xs truncate text-slate-200 font-medium">{meta?.lastLocationName ?? '--- (未記録)'}</div></div>
          </div>

          <div className="md:col-span-3 flex justify-end mt-1 md:mt-0" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={onOpen} onMouseEnter={playHoverSound} className="w-full md:w-auto px-6 py-3 text-xs sm:text-sm font-black tracking-wider flex items-center justify-center gap-2 bg-amber-500 text-black hover:bg-amber-400 border-b-3 border-amber-700 active:border-b-0 active:translate-y-0.5 transition-all shadow-[0_2px_12px_rgba(245,158,11,0.25)] cursor-pointer min-h-[44px]"><span>▶ 冒険を再開 (LOAD)</span><ChevronRight className="h-4 w-4 stroke-[3]" /></button>
          </div>
        </div>

        <div className="mt-3 flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400 font-mono border-t border-[#2a3142] pt-2"><span className="text-emerald-400 font-bold">● READY</span><span>最終記録: {formattedLastRecordDate || 'NO_DATA'}</span></div>
      </div>
    </article>
  );
}

function MemberBadge({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className="flex flex-col items-center shrink-0 min-w-[50px]">
      <div className="w-11 h-11 overflow-hidden mb-1 flex items-center justify-center relative border border-slate-600 bg-[#141824] shadow-sm">
        {photoUrl ? <img src={photoUrl} alt="" className="w-full h-full object-cover pixelated" /> : <div className="w-full h-full flex items-center justify-center text-xs font-black text-emerald-400 bg-slate-900 font-mono">{name.slice(0, 1)}</div>}
      </div>
      <span className="text-[10px] text-slate-300 truncate max-w-[56px] text-center font-medium">{name}</span>
      {player && <span className="text-[8px] text-amber-400 font-black font-mono">CMD</span>}
    </div>
  );
}
