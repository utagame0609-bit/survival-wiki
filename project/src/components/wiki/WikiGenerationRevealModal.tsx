import { createPortal } from 'react-dom';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { playHoverSound } from '@/lib/sound';

type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';

type GenerationReveal = {
  style: WikiStyleId;
  phase: 'waiting' | 'result' | 'ready';
  article: string;
  line: string;
};

export function WikiGenerationRevealModal({
  reveal,
  typedText,
  onOpenArticle,
}: {
  reveal: GenerationReveal | null;
  typedText: string;
  onOpenArticle: () => void;
}) {
  if (!reveal) return null;

  return createPortal((
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05080E]/95 p-4 backdrop-blur-lg">
      <div className="hud-scanlines relative w-full max-w-lg space-y-5 rounded-2xl border-2 border-[#06B6D4] bg-[#0F172A] p-5 text-center shadow-[0_0_40px_rgba(6,182,212,0.3)] sm:p-7">
        <div className="mx-auto w-fit rounded-2xl border-2 border-[#06B6D4] bg-[#07101c] p-1 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
          <PixelNarrator style={reveal.style} />
        </div>

        <div>
          <div className="game-ui-font text-[10px] uppercase tracking-wider text-[#06B6D4] sm:text-xs">
            {NARRATORS[reveal.style]?.role}
          </div>
          <h3 className="game-ui-font mt-0.5 text-lg font-bold text-[#F8FAFC] sm:text-xl">
            {NARRATORS[reveal.style]?.name}
          </h3>
        </div>

        <div className="min-h-[110px] rounded-xl border border-[#1E293B] bg-[#0B1018] p-4 text-left sm:p-5">
          <p className="text-sm italic leading-relaxed text-[#E2E8F0] sm:text-base">
            「{typedText || '……'}{reveal.phase !== 'ready' && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#06B6D4] align-middle" />}」
          </p>
        </div>

        {reveal.phase !== 'ready' ? (
          <div className="game-ui-font flex items-center justify-center gap-2 text-[10px] text-[#64748B] sm:text-xs">
            <Sparkles className="h-4 w-4 animate-spin text-[#06B6D4]" />
            <span>{reveal.phase === 'waiting' ? '年代記を編纂中…… 記録を照合しています' : '編纂結果を確定しています……'}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenArticle}
            onMouseEnter={playHoverSound}
            className="game-ui-font flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#06B6D4] text-sm font-bold tracking-wider text-[#0B1018] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:bg-[#0891B2] active:scale-95 sm:text-base"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span>編纂完了 // 記事を読む</span>
          </button>
        )}
      </div>
    </div>
  ), document.body);
}
