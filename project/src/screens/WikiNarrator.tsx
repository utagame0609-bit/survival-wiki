import { Glasses, Shield, ScrollText, MessageSquareQuote } from 'lucide-react';

const NARRATORS: Record<string, { name: string; role: string; quote: string; accent: string; panel: string; text: string }> = {
  wikipedia: { name: '民俗学者 エルナン', role: '百科事典編纂官', quote: 'ふむ……この記録から判断するに、君はまた随分と無計画だったようだね。', accent: '#ffb000', panel: 'bg-[#17130a] border-[#ffb000]', text: 'text-[#ffb000]' },
  scp: { name: '特異点研究員 Dr.アーク', role: '最高機密研究班', quote: '……記録を確認した。残念ながら、今回も君が原因である可能性を排除できない。', accent: '#22c7ff', panel: 'bg-[#07141b] border-[#22c7ff]', text: 'text-[#22c7ff]' },
  ancient: { name: '老吟遊詩人 ギルダス', role: '狂学者・古文書の語り部', quote: '……また一人、己の身の程を知らぬ者が、この地へ足を踏み入れたか。', accent: '#ff8a00', panel: 'bg-[#1a1009] border-[#ff8a00]', text: 'text-[#ff8a00]' },
};

export function WikiNarrator({ style }: { style: string }) {
  const isWikipedia = style === 'wikipedia';
  const isScp = style === 'scp';
  const narrator = NARRATORS[style] ?? NARRATORS.ancient;
  return (
    <div className={`mt-5 rounded-sm border-2 p-4 sm:p-5 ${narrator.panel} shadow-[0_0_20px_rgba(0,0,0,.25)]`}>
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex sm:flex-col items-center gap-2 sm:w-28 shrink-0">
          <PixelNarrator style={style} />
          <div className={`text-[9px] sm:text-[10px] font-bold font-mono text-center border px-2 py-1 rounded-sm ${narrator.text} border-current`}>{narrator.role}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold font-mono ${narrator.text}`}><span className="inline-block h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />【{narrator.name}】</div>
            <span className="hidden sm:inline text-[9px] font-mono text-slate-500">CHRONICLER DIALOGUE</span>
          </div>
          <div className="relative rounded-sm border border-[#2d3548] bg-[#050a14] px-4 py-4 sm:px-5 sm:py-5 text-sm sm:text-base leading-7 text-slate-100 font-serif shadow-inner">
            <MessageSquareQuote className={`absolute -left-2 -top-2 h-5 w-5 ${narrator.text} bg-[#07101c]`} />
            <span className="text-slate-500 mr-1">「</span>{narrator.quote}<span className="text-slate-500 ml-1">」</span>
            <span className={`absolute right-3 bottom-1 text-xs ${narrator.text}`}>▼</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PixelNarrator({ style }: { style: string }) {
  const isWikipedia = style === 'wikipedia';
  const isScp = style === 'scp';
  const skin = isScp ? '#d8e7ef' : isWikipedia ? '#d8ad7b' : '#c9b08a';
  const hair = isScp ? '#16222b' : isWikipedia ? '#4b3022' : '#d8d4c9';
  const coat = isScp ? '#d7e1e6' : isWikipedia ? '#27364b' : '#5b3b27';
  return (
    <div className="relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 rounded-sm border-2 border-double border-white/70 bg-[#07101c] shadow-[inset_0_0_0_1px_rgba(255,176,0,.35),0_0_16px_rgba(0,0,0,.45)] overflow-hidden">
      <svg viewBox="0 0 64 72" className="h-full w-full [image-rendering:pixelated]" shapeRendering="crispEdges" aria-hidden="true">
        <rect x="8" y="58" width="48" height="8" fill={coat}/><rect x="14" y="35" width="36" height="27" fill={coat}/><rect x="20" y="25" width="24" height="22" fill={skin}/><rect x="17" y="18" width="30" height="12" fill={hair}/><rect x="20" y="15" width="24" height="7" fill={hair}/><rect x="22" y="29" width="5" height="3" fill="#0a1120"/><rect x="37" y="29" width="5" height="3" fill="#0a1120"/><rect x="28" y="37" width="9" height="2" fill="#6b3f32"/><rect x="24" y="45" width="16" height="4" fill="#0a1120"/>
        {isWikipedia && <><rect x="18" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/><rect x="34" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/><rect x="30" y="29" width="4" height="2" fill="#d7b56d"/><rect x="11" y="47" width="9" height="12" fill="#f1dfb6"/><rect x="44" y="45" width="8" height="13" fill="#8b5a36"/></>}
        {isScp && <><rect x="25" y="39" width="14" height="13" fill="#183342"/><rect x="40" y="42" width="12" height="9" fill="#122833" stroke="#22c7ff" strokeWidth="1"/><rect x="43" y="45" width="6" height="2" fill="#22c7ff"/></>}
        {!isWikipedia && !isScp && <><rect x="12" y="43" width="9" height="16" fill="#6e492f"/><rect x="44" y="43" width="8" height="15" fill="#4a3023"/><rect x="26" y="49" width="12" height="8" fill="#b89462"/></>}
      </svg>
      <span className="absolute left-1 top-1 text-[7px] font-mono text-white/50">16BIT</span>
    </div>
  );
}

export { NARRATORS };
