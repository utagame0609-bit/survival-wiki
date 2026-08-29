import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';

type WorldHeaderProps = {
  world: WorldWithMembers;
  playerPhotoUrl: string;
};

export function WorldHeader({ world, playerPhotoUrl }: WorldHeaderProps) {
  const [memberPhotoUrls, setMemberPhotoUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    let objectUrls: string[] = [];

    const members = world.members.filter((member) => member.name !== world.player);
    const paths = members.map((member) => member.photo_path).filter((path): path is string => Boolean(path));

    if (paths.length === 0) {
      setMemberPhotoUrls({});
      return () => {
        active = false;
      };
    }

    Promise.all(
      paths.map(async (path) => {
        try {
          return [path, await getPhotoUrl(path)] as const;
        } catch {
          return [path, ''] as const;
        }
      }),
    ).then((entries) => {
      if (!active) {
        entries.forEach(([, url]) => {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
        });
        return;
      }

      objectUrls = entries.map(([, url]) => url).filter((url) => url.startsWith('blob:'));
      const urlMap = new Map(entries);
      setMemberPhotoUrls(
        Object.fromEntries(
          members.map((member) => [member.id, member.photo_path ? urlMap.get(member.photo_path) ?? '' : '']),
        ),
      );
    });

    return () => {
      active = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [world.members, world.player]);

  const createdDate = world.created_at
    ? new Date(world.created_at).toLocaleDateString('ja-JP')
    : '----/--/--';
  const companions = world.members.filter((member) => member.name !== world.player);

  return (
    <section className="mb-3 sm:mb-5 border-2 border-slate-700/90 bg-[#161a25] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden border-2 border-amber-500/90 bg-[#0f121b] p-0.5 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
            {playerPhotoUrl ? (
              <img src={playerPhotoUrl} alt="" className="h-full w-full object-cover pixelated" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-amber-400">
                <Users className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="border border-amber-500/40 bg-amber-500/20 px-1.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold text-amber-300">
                生存者: {world.player || '名無しの司令官'}
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">設立: {createdDate}</span>
            </div>
            <h1 className="break-words text-base sm:text-xl font-black tracking-tight text-white">{world.name}</h1>
            {world.memo && <p className="line-clamp-2 text-xs leading-relaxed text-slate-300">{world.memo}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-800 pt-2 md:border-t-0 md:border-l md:pl-4 md:pt-0">
          <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <span>同行:</span>
          </span>

          {companions.map((member) => (
            <div
              key={member.id}
              title={`同行メンバー: ${member.name}`}
              aria-label={`同行メンバー: ${member.name}`}
              className="flex h-9 w-9 items-center justify-center overflow-hidden border-2 border-cyan-400/60 bg-[#0d1220]"
            >
              {memberPhotoUrls[member.id] ? (
                <img src={memberPhotoUrls[member.id]} alt="" className="h-full w-full object-cover pixelated" />
              ) : (
                <Users className="h-4 w-4 text-cyan-400" />
              )}
            </div>
          ))}

          {companions.length === 0 && (
            <span className="border border-slate-800 bg-[#0d1220] px-2 py-0.5 text-[10px] font-mono italic text-slate-500">単独探索中</span>
          )}
        </div>
      </div>
    </section>
  );
}
