import { Flame, Radio, ShieldAlert } from 'lucide-react';
import type { RoseHazardLevel, RoseMastheadData } from './RoseArticleTypes';

type RoseMastheadProps = {
  masthead: RoseMastheadData;
  category?: string;
  hazardLevel?: RoseHazardLevel;
  isMobile?: boolean;
};

export function RoseMasthead({
  masthead,
  category,
  hazardLevel,
  isMobile = false,
}: RoseMastheadProps) {
  const getHazardBadge = () => {
    switch (hazardLevel) {
      case 'Critical':
        return { text: '荒野危険度：極度警戒 [極刑級]', bg: 'bg-[#6E1F2B] text-[#E7D9BE]', border: 'border-[#6E1F2B]' };
      case 'Mild':
        return { text: '荒野危険度：軽微 [通常営業]', bg: 'bg-[#66504A] text-[#E7D9BE]', border: 'border-[#66504A]' };
      case 'Saloon Rumor':
        return { text: '酒場噂話 [真偽未確認]', bg: 'bg-[#B78A45] text-[#171315]', border: 'border-[#B78A45]' };
      case 'Moderate':
        return { text: '荒野危険度：中度 [要武装]', bg: 'bg-[#9A3D49] text-[#E7D9BE]', border: 'border-[#9A3D49]' };
      default:
        return null;
    }
  };

  const hazard = getHazardBadge();

  return (
    <header className="relative z-10 mb-5 border-b-4 border-[#171315] pb-4 sm:mb-7 sm:pb-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#171315]/40 pb-2">
        <span className="flex items-center gap-1.5 font-['Cinzel',serif] text-[10px] font-bold uppercase tracking-[0.2em] text-[#171315] opacity-90 sm:text-xs sm:tracking-[0.3em]">
          <span className="inline-block h-2 w-2 bg-[#6E1F2B]" />
          Wasteland Final Edition | 荒野最終版
        </span>
        {(masthead.weatherCondition || hazard) && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {masthead.weatherCondition && (
              <span className="border border-[#171315]/40 bg-[#171315]/5 px-1.5 py-0.5 font-mono text-[10px] text-[#171315] sm:px-2 sm:text-[11px]">
                {masthead.weatherCondition}
              </span>
            )}
            {hazard && (
              <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-bold tracking-wide sm:px-2 sm:text-[11px] ${hazard.border} ${hazard.bg}`}>
                <ShieldAlert className="h-3 w-3" />
                {hazard.text}
              </span>
            )}
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          <h1 className="m-0 select-none whitespace-normal break-normal font-['Cinzel',serif] text-[26px] font-black uppercase leading-[1.05] tracking-normal text-[#171315] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]">
            ROSE&apos;S LAST CALL
          </h1>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#171315]/30 pt-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-serif text-[10px] font-bold uppercase text-[#171315]/80">
              <span className="text-[#6E1F2B]">Est. Post-Collapse</span>
              <span>•</span><span>{masthead.volume}</span>
              <span>•</span><span>{masthead.issueNumber}</span>
              {masthead.priceTag && <><span>•</span><span className="text-[#6E1F2B]">{masthead.priceTag}</span></>}
            </div>
            <div className="border border-[#171315]/20 bg-[#171315]/5 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#6E1F2B]">R-EDITOR</div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start justify-between gap-3 sm:gap-4 md:flex-row md:items-end">
          <div className="flex min-w-0 flex-1 flex-col">
            <h1 className="m-0 select-none whitespace-normal break-normal font-['Cinzel',serif] text-[30px] font-black uppercase leading-[1.08] tracking-normal text-[#171315] drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] sm:text-4xl sm:tracking-tight md:text-[56px] md:leading-none md:tracking-tighter lg:text-[64px]">
              ROSE&apos;S LAST CALL
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-serif text-[10px] font-bold uppercase tracking-wider text-[#171315]/80 sm:gap-x-4 sm:text-[11px] sm:tracking-widest md:mt-2.5">
              <span className="text-[#6E1F2B]">Est. Post-Collapse</span>
              <span>•</span><span>{masthead.volume}</span>
              <span>•</span><span>{masthead.issueNumber}</span>
              {masthead.priceTag && <><span>•</span><span className="text-[#6E1F2B]">{masthead.priceTag}</span></>}
            </div>
          </div>

          <div className="flex w-full shrink-0 items-center justify-between gap-3 border-t border-[#171315]/20 pt-2.5 md:w-auto md:flex-col md:items-end md:border-t-0 md:pt-0">
            <div className="flex items-center gap-2.5 md:flex-col md:items-end">
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center border-2 border-[#6E1F2B] bg-[#171315] shadow-[2px_2px_0px_#6E1F2B] md:h-24 md:w-24">
                <div className="font-['Cinzel',serif] text-2xl font-black text-[#D8C6A5] md:text-[40px]">R</div>
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#6E1F2B] px-1 py-[2px] font-mono text-[8px] font-bold uppercase tracking-wider text-white shadow-sm md:-bottom-2 md:-right-2 md:px-1.5 md:text-[9px]">EDITOR</div>
              </div>
              <div className="text-left font-serif text-[10px] text-[#66504A] sm:text-[11px] md:text-right">
                <div className="font-bold text-[#171315]">MADAME ROSE</div>
                <div className="italic text-[#6E1F2B]">「また生きて帰ってきな」</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-y border-t-2 border-[#171315] border-b-[#171315]/40 py-1.5 pt-2 text-xs sm:mt-4">
        <div className="flex items-center gap-2">
          {category && (
            <span className="inline-flex items-center gap-1 border border-[#6E1F2B]/30 bg-[#6E1F2B]/10 px-2.5 py-0.5 font-bold tracking-wider text-[#6E1F2B]">
              <Flame className="h-3.5 w-3.5" />{category}
            </span>
          )}
          <span className="text-[11px] font-medium text-[#171315]/70">{masthead.date}</span>
        </div>
        {masthead.saloonLocation && (
          <div className="flex items-center gap-2 font-mono text-[10px] text-[#66504A] sm:text-[11px]">
            <Radio className="h-3.5 w-3.5 text-[#6E1F2B]" />
            <span>{masthead.saloonLocation}</span>
          </div>
        )}
      </div>
    </header>
  );
}
