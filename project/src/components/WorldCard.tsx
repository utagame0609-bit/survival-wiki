import { Calendar, Clock, Edit3, Play, Shield, Trash2, User, Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import type { WorldMeta } from '@/lib/worldMeta';
import { playHoverSound } from '@/lib/sound';
import { useWorldCardPhotos } from '@/hooks/useWorldCardPhotos';

type WorldCardProps = {
  slotNumber: number;
  world: WorldWithMembers;
  meta?: WorldMeta;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function WorldCard({ slotNumber, world, meta, onOpen, onEdit, onDelete }: WorldCardProps) {
  const { playerPhotoUrl, memberPhotoUrls } = useWorldCardPhotos(world);
  const slotLabel = String(slotNumber).padStart(2, '0');
  const createdDate = new Date(world.created_at).toLocaleDateString('ja-JP');
  const formattedLastRecordDate = meta?.lastLocationDate
    ? new Date(meta.lastLocationDate).toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'NO DATA';
  const companions = world.members.filter((member) => member.name !== world.player).slice(0, 5);

  return (
    <article
      className="group relative rounded-lg border border-[#1E293B] bg-[#0F172A]/90 p-4 shadow-md transition-all duration-200 hover:border-[#F59E0B]/60 hover:bg-[#131E35]"
      onMouseEnter={playHoverSound}
    >
      <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l-2 border-t-2 border-[#F2A100]" />
      <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b-2 border-r-2 border-[#F2A100]" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md border-2 border-[#334155] bg-[#0B1018] transition-colors group-hover:border-[#F59E0B]">
              {playerPhotoUrl ? (
                <img src={playerPhotoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-[#F59E0B]" />
              )}
            </div>
            <span className="absolute -left-2 -top-2 rounded border border-[#F59E0B] bg-[#0B1018] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
              SLOT {slotLabel}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#F59E0B]">
                <Shield className="h-3 w-3" />
                {world.player?.trim() || '開拓者'}
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
                <Calendar className="h-2.5 w-2.5" />
                {createdDate}
              </span>
            </div>

            <h2 className="mt-0.5 truncate text-base font-black tracking-wide text-[#F1F5F9] transition-colors group-hover:text-[#FDE68A] sm:text-lg">
              {world.name}
            </h2>

            {world.memo && (
              <p className="mt-0.5 line-clamp-1 text-xs leading-relaxed text-[#94A3B8]">
                {world.memo}
              </p>
            )}

            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center -space-x-1.5">
                {companions.map((member) => (
                  <div
                    key={member.id}
                    className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-[#0B1018] bg-[#161F30]"
                    title={member.name}
                  >
                    {memberPhotoUrls[member.id] ? (
                      <img src={memberPhotoUrls[member.id]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-3 w-3 text-[#06B6D4]" />
                    )}
                  </div>
                ))}
              </div>
              <span className="font-mono text-[10px] text-[#64748B]">
                {companions.length > 0 ? `+${companions.length} 名の同行者` : '単独探索'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-[#1E293B]/70 pt-3 sm:flex-row sm:items-center sm:justify-end sm:border-t-0 sm:pt-0">
          <div className="flex items-center justify-around gap-2 sm:justify-start">
            <Stat label="DAYS" value={meta?.dayCount ?? 0} tone="amber" />
            <Stat label="RECORDS" value={meta?.recordCount ?? 0} tone="cyan" />
          </div>

          <div className="flex w-full items-center gap-1.5 sm:w-auto" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={onEdit}
              onMouseEnter={playHoverSound}
              className="shrink-0 rounded border border-[#334155]/60 bg-[#161F30] p-2.5 text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:bg-[#1E293B] hover:text-[#F8FAFC] sm:p-2"
              aria-label={`${world.name}を編集`}
              title="ワールド設定を編集"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              onMouseEnter={playHoverSound}
              className="shrink-0 rounded border border-[#334155]/60 bg-[#161F30] p-2.5 text-[#64748B] transition-colors hover:border-[#EF4444]/50 hover:bg-[#2A161C] hover:text-[#EF4444] sm:p-2"
              aria-label={`${world.name}を削除`}
              title="ワールドを削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpen}
              onMouseEnter={playHoverSound}
              className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#F59E0B] px-4 py-2 font-mono text-xs font-black tracking-wider text-[#0B1018] shadow-[0_0_10px_rgba(245,158,11,0.25)] transition-all hover:bg-[#D97706] active:scale-95 sm:flex-initial"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>LOAD</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-col gap-1 border-t border-[#1E293B]/50 pt-2 font-mono text-[10px] text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <Clock className="h-2.5 w-2.5" />
          LAST RECORD: {formattedLastRecordDate}
        </span>
        <span className="whitespace-nowrap text-[#06B6D4]/70">READY TO RESUME</span>
      </div>
    </article>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'cyan' }) {
  return (
    <div className="flex-1 rounded border border-[#1E293B] bg-[#0B1018] px-2.5 py-1.5 text-center sm:flex-initial">
      <div className="font-mono text-[9px] text-[#64748B]">{label}</div>
      <div className={`font-mono text-sm font-bold ${tone === 'amber' ? 'text-[#F59E0B]' : 'text-[#06B6D4]'}`}>
        {value}
      </div>
    </div>
  );
}
