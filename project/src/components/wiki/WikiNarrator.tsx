import './wikiAs.css';

type NarratorStyle = {
  name: string;
  role: string;
  quote: string;
};

export const NARRATORS: Record<string, NarratorStyle> = {
  wikipedia: {
    name: '民俗学者 エルナン',
    role: '百科事典編纂官',
    quote: 'ふむ……記録は確認した。小さな出来事ほど、後世では妙に大事件へ育つものだからね。',
  },
  scp: {
    name: '特異点研究員 Dr.アーク',
    role: '最高機密研究班',
    quote: '……記録を受領した。現時点では異常事象より、君の行動経路の方が少し気になっている。',
  },
  ancient: {
    name: 'マダム・ロゼ',
    role: '荒野酒場店主・タブロイド編集長',
    quote: '記録は読んだよ。無事に帰ったなら結構。で、今度は何をやらかしたんだい？',
  },
};

export const NARRATOR_PORTRAITS: Record<string, string> = {
  wikipedia: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/uta(%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%BA%E9%80%8F%E9%81%8E%E6%B8%88%E3%81%BF).png?v=20260902-320',
  scp: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/ark(%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%BA%E9%80%8F%E9%81%8E%E6%B8%88%E3%81%BF).png?v=20260902-320',
  ancient: 'https://pub-b9cb6563a3d6454dbdd3c68ba3b1e615.r2.dev/Rose(%E3%83%AA%E3%82%B5%E3%82%A4%E3%82%BA%E9%80%8F%E9%81%8E%E6%B8%88%E3%81%BF).png?v=20260902-320',
};

export function PixelNarrator({ style, compact = false }: { style: string; compact?: boolean }) {
  const portrait = NARRATOR_PORTRAITS[style] ?? NARRATOR_PORTRAITS.ancient;

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg border-2 border-[#334155]/80 bg-[#07101c] ${compact ? 'h-10 w-10 sm:h-12 sm:w-12 shadow-[inset_0_0_0_1px_rgba(148,163,184,.08)]' : 'h-20 w-16 sm:h-24 sm:w-20 shadow-[inset_0_0_0_1px_rgba(148,163,184,.1),0_0_16px_rgba(0,0,0,.35)]'}`}>
      <img
        src={portrait}
        alt=""
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full object-contain object-bottom ${compact ? 'scale-[1.12]' : 'scale-[1.08]'}`}
      />
    </div>
  );
}

export function NarratorDialogue({ style, quote }: { style: string; quote?: string }) {
  const narrator = NARRATORS[style] ?? NARRATORS.ancient;
  const dialogue = quote?.trim() || narrator.quote;

  return (
    <div className="wiki-as-bracket game-ui-font flex w-full min-w-0 items-center gap-3.5 rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 sm:p-4">
      <div className="shrink-0 rounded-lg border-2 border-[#06B6D4]/60">
        <PixelNarrator style={style} compact />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <span className="break-words text-xs font-bold text-[#06B6D4]">{narrator.name}</span>
          <span className="text-[10px] text-[#64748B]">({narrator.role})</span>
        </div>
        <p className="mt-0.5 break-words text-xs italic leading-relaxed text-[#E2E8F0] [overflow-wrap:anywhere]">
          {dialogue}
        </p>
      </div>
    </div>
  );
}
