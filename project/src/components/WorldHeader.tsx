import { useEffect, useState } from 'react';
import { Calendar, Shield, User, Users } from 'lucide-react';
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
    <section className="hud-bracket relative mb-3 w-full overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-2.5 sm:mb-4 sm:p-4">
      <div className="flex flex-col justify-between gap-2.5 sm:gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-4">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border-2 border-[#F59E0B]/60 bg-[#0B1018] shadow-[0_0_10px_rgba(245,158,11,0.2)] sm:h-14 sm:w-14">
              {playerPhotoUrl ? (
                <img src={playerPhotoUrl} alt="" className="h-full w-full object-cover pixelated" />
              ) : (
                <User className="h-5 w-5 text-[#F59E0B] sm:h-6 sm:w-6" />
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="game-ui-font flex items-center gap-1 text-[10px] text-[#F59E0B] sm:text-[11px]">
                <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                {world.player?.trim() || '開拓者'}
              </span>
              <span className="game-ui-font flex items-center gap-1 text-[9px] text-[#64748B] sm:text-[10px]">
                <Calendar className="h-2.5 w-2.5" />
                EST. {createdDate}
              </span>
            </div>

            <h2 className="game-ui-font mt-0.5 truncate text-sm font-black tracking-wide text-[#F8FAFC] sm:text-lg">
              {world.name}
            </h2>

            {world.memo && (
              <p className="mt-0.5 line-clamp-1 text-[11px] leading-tight text-[#94A3B8] sm:mt-1 sm:line-clamp-2 sm:text-xs sm:leading-relaxed">
                {world.memo}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-[#1E293B]/70 pt-1.5 sm:gap-4 md:justify-end md:border-t-0 md:pt-0">
          <div className="flex items-center gap-1.5 sm:flex-col sm:items-end sm:gap-0">
            <div className="game-ui-font flex items-center gap-1 text-[9px] text-[#94A3B8] sm:text-[10px]">
              <Users className="h-2.5 w-2.5 text-[#06B6D4] sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">PARTY</span> ({companions.length + 1})
            </div>

            <div className="flex items-center gap-1 sm:mt-1">
              {companions.length > 0 ? (
                companions.map((member) => (
                  <div
                    key={member.id}
                    className="flex h-5 w-5 items-center justify-center overflow-hidden rounded border border-[#06B6D4]/50 bg-[#0B1018] transition-all hover:border-[#06B6D4] sm:h-7 sm:w-7"
                    title={member.name}
                  >
                    {memberPhotoUrls[member.id] ? (
                      <img src={memberPhotoUrls[member.id]} alt="" className="h-full w-full object-cover pixelated" />
                    ) : (
                      <Users className="h-3 w-3 text-[#06B6D4] sm:h-3.5 sm:w-3.5" />
                    )}
                  </div>
                ))
              ) : (
                <span className="game-ui-font text-[10px] text-[#64748B] sm:text-[11px]">単独探索</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
