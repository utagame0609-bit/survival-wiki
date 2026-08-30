import { MessageSquareQuote } from 'lucide-react';

type NarratorStyle = {
  name: string;
  role: string;
  quote: string;
  panel: string;
  text: string;
};

export const NARRATORS: Record<string, NarratorStyle> = {
  wikipedia: {
    name: '民俗学者 エルナン',
    role: '百科事典編纂官',
    quote: 'ふむ……この記録から判断するに、君はまた随分と無計画だったようだね。',
    panel: 'border-[#F59E0B]/70 shadow-[0_0_18px_rgba(245,158,11,0.12)]',
    text: 'text-[#F59E0B]',
  },
  scp: {
    name: '特異点研究員 Dr.アーク',
    role: '最高機密研究班',
    quote: '……記録を確認した。残念ながら、今回も君が原因である可能性を排除できない。',
    panel: 'border-[#06B6D4]/70 shadow-[0_0_18px_rgba(6,182,212,0.12)]',
    text: 'text-[#06B6D4]',
  },
  ancient: {
    name: '老吟遊詩人 ギルダス',
    role: '狂学者・古文書の語り部',
    quote: '……また一人、己の身の程を知らぬ者が、この地へ足を踏み入れたか。',
    panel: 'border-[#D97706]/70 shadow-[0_0_18px_rgba(217,119,6,0.12)]',
    text: 'text-[#F59E0B]',
  },
};

export function PixelNarrator({ style, compact = false }: { style: string; compact?: boolean }) {
  const isWikipedia = style === 'wikipedia';
  const isScp = style === 'scp';
  const skin = isScp ? '#d8e7ef' : isWikipedia ? '#d8ad7b' : '#c9b08a';
  const hair = isScp ? '#16222b' : isWikipedia ? '#4b3022' : '#d8d4c9';
  const coat = isScp ? '#d7e1e6' : isWikipedia ? '#27364b' : '#5b3b27';

  return (
    <div className={`relative shrink-0 rounded-sm border-2 border-double border-white/70 bg-[#07101c] overflow-hidden ${compact ? 'h-10 w-10 sm:h-12 sm:w-12 shadow-[inset_0_0_0_1px_rgba(255,176,0,.25)]' : 'h-20 w-16 sm:h-24 sm:w-20 shadow-[inset_0_0_0_1px_rgba(255,176,0,.35),0_0_16px_rgba(0,0,0,.45)]'}`}>
      <svg viewBox="0 0 64 72" className="h-full w-full [image-rendering:pixelated]" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="8" y="58" width="48" height="8" fill={coat}/>
        <rect x="14" y="35" width="36" height="27" fill={coat}/>
        <rect x="20" y="25" width="24" height="22" fill={skin}/>
        <rect x="17" y="18" width="30" height="12" fill={hair}/>
        <rect x="20" y="15" width="24" height="7" fill={hair}/>
        <rect x="22" y="29" width="5" height="3" fill="#0a1120"/>
        <rect x="37" y="29" width="5" height="3" fill="#0a1120"/>
        <rect x="28" y="37" width="9" height="2" fill="#6b3f32"/>
        <rect x="24" y="45" width="16" height="4" fill="#0a1120"/>
        {isWikipedia && <>
          <rect x="18" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/>
          <rect x="34" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/>
          <rect x="30" y="29" width="4" height="2" fill="#d7b56d"/>
          <rect x="11" y="47" width="9" height="12" fill="#f1dfb6"/>
          <rect x="44" y="45" width="8" height="13" fill="#8b5a36"/>
        </>}
        {isScp && <>
          <rect x="25" y="39" width="14" height="13" fill="#183342"/>
          <rect x="40" y="42" width="12" height="9" fill="#122833" stroke="#22c7ff" strokeWidth="1"/>
          <rect x="43" y="45" width="6" height="2" fill="#22c7ff"/>
        </>}
        {!isWikipedia && !isScp && <>
          <rect x="12" y="43" width="9" height="16" fill="#6e492f"/>
          <rect x="44" y="43" width="8" height="15" fill="#4a3023"/>
          <rect x="26" y="49" width="12" height="8" fill="#b89462"/>
        </>}
      </svg>
      <span className="game-ui-font absolute left-1 top-1 text-[5px] sm:text-[6px] text-white/50">16BIT</span>
    </div>
  );
}

export function NarratorDialogue({ style, quote }: { style: string; quote?: string }) {
  const narrator = NARRATORS[style] ?? NARRATORS.ancient;
  const dialogue = quote?.trim() || narrator.quote;

  return (
    <div className={`game-ui-font mx-3 mt-4 min-w-0 rounded-xl border bg-[#0F172A] p-3 sm:mx-4 sm:p-4 ${narrator.panel}`}>
      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
        <PixelNarrator style={style} compact />
        <div className="min-w-0 flex-1">
          <div className={`flex min-w-0 items-center gap-1.5 text-[11px] font-bold sm:text-sm ${narrator.text}`}>
            <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
            <span className="break-words">【{narrator.name}】</span>
          </div>
          <span className={`mt-1 inline-block rounded border border-current/60 bg-[#0B1018] px-1.5 py-0.5 text-[7px] font-bold sm:text-[9px] ${narrator.text}`}>
            {narrator.role}
          </span>
        </div>
      </div>

      <div className="relative mt-2.5 w-full min-w-0 rounded-lg border border-[#1E293B] bg-[#0B1018] px-3 py-3 text-[11px] leading-6 text-slate-100 shadow-inner break-words [overflow-wrap:anywhere] sm:px-4 sm:py-3.5 sm:text-sm">
        <MessageSquareQuote className={`absolute -left-1.5 -top-2 h-4 w-4 ${narrator.text} bg-[#0B1018]`} />
        <span className="mr-1 text-slate-500">「</span>{dialogue}<span className="ml-1 text-slate-500">」</span>
      </div>
    </div>
  );
}
