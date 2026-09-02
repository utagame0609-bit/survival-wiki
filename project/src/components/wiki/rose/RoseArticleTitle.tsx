type RoseArticleTitleProps = {
  title: string;
  className?: string;
};

export function RoseArticleTitle({ title, className = '' }: RoseArticleTitleProps) {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-block h-3 w-3 shrink-0 rotate-45 bg-[#6E1F2B] shadow-sm" />
        <span className="font-['Cinzel',serif] text-xs font-black uppercase tracking-[0.25em] text-[#6E1F2B]">
          HEADLINE DISPATCH ❖ 特報
        </span>
        <span className="h-[2px] flex-1 bg-[#6E1F2B]/40" />
      </div>

      <h1 className="break-words font-['Shippori_Mincho',serif] text-[22px] font-black leading-[1.32] tracking-normal text-[#171315] underline decoration-[#6E1F2B] decoration-[3px] underline-offset-[6px] selection:bg-[#6E1F2B] selection:text-[#E7D9BE] sm:text-3xl sm:leading-[1.28] sm:tracking-tight sm:decoration-[4px] sm:underline-offset-8 md:text-4xl lg:text-[34px]">
        {title}
      </h1>

      <div className="mt-3.5 flex items-center gap-2 sm:mt-5 sm:gap-3">
        <div className="h-[2px] flex-1 bg-[#171315] sm:h-[3px]" />
        <span className="text-xs font-bold text-[#B78A45] sm:text-sm">❖</span>
        <div className="h-[1.5px] flex-1 bg-[#171315]/50 sm:h-[2px]" />
      </div>
    </div>
  );
}
