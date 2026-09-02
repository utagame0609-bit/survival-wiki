import { Feather, Stamp } from 'lucide-react';
import type { RosePortraitData } from './RoseArticleTypes';

type RoseMadameHeroProps = {
  portrait: RosePortraitData;
  isMobile?: boolean;
};

export function RoseMadameHero({ portrait, isMobile = false }: RoseMadameHeroProps) {
  return (
    <aside
      aria-label="編集長マダム・ロゼの紹介"
      className="relative overflow-hidden border-2 border-[#171315] bg-[#D8C6A5]/90 p-3.5 shadow-[4px_4px_0px_#171315] sm:border-[3px] sm:p-5"
    >
      <div className="pointer-events-none absolute -top-2 left-1/2 z-10 h-5 w-20 -translate-x-1/2 rotate-1 border border-[#171315]/30 bg-[#D8C6A5] shadow-sm" />

      <div className="mb-3.5 flex items-center justify-between border-b-2 border-[#171315]/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Feather className="h-4 w-4 text-[#6E1F2B]" />
          <span className="font-['Cinzel',serif] text-xs font-black uppercase tracking-widest text-[#6E1F2B]">
            EDITOR&apos;S DISPATCH ❖ 編纂官通信
          </span>
        </div>
        {portrait.badge && (
          <span className="whitespace-nowrap border border-[#B78A45] bg-[#B78A45]/40 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#171315]">
            {portrait.badge}
          </span>
        )}
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative shrink-0">
              <div className="pointer-events-none absolute -inset-1 rotate-2 border-2 border-[#6E1F2B]" />
              <div className="relative z-10 h-[112px] w-[88px] overflow-hidden border-2 border-[#171315] bg-[#171315] shadow-sm">
                <img
                  src={portrait.imageUrl}
                  alt={`${portrait.name} - ${portrait.roleTitle}`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-top contrast-[1.1] brightness-[0.96] sepia-[0.12]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171315]/70 via-transparent to-transparent" />
                <div className="absolute left-1 top-1 h-2 w-2 border-l-2 border-t-2 border-[#E7D9BE]" />
                <div className="absolute bottom-1 right-1 h-2 w-2 border-b-2 border-r-2 border-[#E7D9BE]" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-serif text-[11px] font-bold uppercase tracking-wider text-[#6E1F2B]">{portrait.roleTitle}</div>
              <h2 className="mt-0.5 whitespace-nowrap font-['Shippori_Mincho',serif] text-xl font-black leading-tight text-[#171315]">{portrait.name}</h2>
              <div className="mt-1 font-mono text-[10px] font-bold tracking-wider text-[#66504A]">LAST CALL SALOON & TABLOID</div>
            </div>
          </div>

          {portrait.caption && (
            <div className="mt-1 w-full border-l-4 border-[#6E1F2B] bg-[#171315]/5 p-3 font-serif text-[14.5px] italic leading-[1.8] text-[#171315]">
              {portrait.caption}
            </div>
          )}

          <div className="mt-1 flex items-center justify-between border-t border-[#171315]/20 pt-2 text-[11px] text-[#66504A]">
            <span className="flex items-center gap-1.5 font-bold text-[#6E1F2B]"><Stamp className="h-3.5 w-3.5 shrink-0" />「また生きて帰ってこい」</span>
            <span className="font-mono font-bold text-[#171315]/70">CHIEF-01</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div className="pointer-events-none absolute -inset-1 rotate-2 border-2 border-[#6E1F2B]" />
            <div className="relative z-10 h-40 w-32 overflow-hidden border-2 border-[#171315] bg-[#171315] shadow-sm">
              <img src={portrait.imageUrl} alt={`${portrait.name} - ${portrait.roleTitle}`} referrerPolicy="no-referrer" className="h-full w-full object-cover object-top contrast-[1.1] brightness-[0.96] sepia-[0.12]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171315]/70 via-transparent to-transparent" />
              <div className="absolute left-1 top-1 h-2.5 w-2.5 border-l-2 border-t-2 border-[#E7D9BE]" />
              <div className="absolute bottom-1 right-1 h-2.5 w-2.5 border-b-2 border-r-2 border-[#E7D9BE]" />
            </div>
          </div>

          <div className="flex min-w-0 flex-1 self-stretch flex-col justify-between">
            <div>
              <div className="font-serif text-xs font-bold uppercase tracking-wider text-[#6E1F2B]">{portrait.roleTitle}</div>
              <h2 className="mt-0.5 font-['Shippori_Mincho',serif] text-2xl font-black leading-tight text-[#171315]">{portrait.name}</h2>
              <div className="mt-0.5 font-mono text-[11px] font-bold tracking-wider text-[#66504A]">LAST CALL SALOON & TABLOID ARCHIVES</div>
            </div>

            {portrait.caption && (
              <div className="mt-3 w-full border-l-4 border-[#6E1F2B] bg-[#171315]/5 p-3 font-serif text-[13px] italic leading-relaxed text-[#171315]">{portrait.caption}</div>
            )}

            <div className="mt-3 flex items-center justify-between border-t-2 border-[#171315]/20 pt-2 text-[11px] text-[#66504A]">
              <span className="flex items-center gap-1.5 font-bold text-[#6E1F2B]"><Stamp className="h-3.5 w-3.5 shrink-0" />「また生きて帰ってこい」</span>
              <span className="shrink-0 font-mono font-bold text-[#171315]/70">CHIEF-01</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
