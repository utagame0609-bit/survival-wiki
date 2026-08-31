import { forwardRef } from 'react';
import { Copy, RotateCcw, Share2 } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';

type WikiArticleActionsProps = {
  copied: boolean;
  shared: boolean;
  onReset: () => void;
  onCopy: () => void;
  onShare: () => void;
};

export const WikiArticleActions = forwardRef<HTMLDivElement, WikiArticleActionsProps>(
  function WikiArticleActions({ copied, shared, onReset, onCopy, onShare }, ref) {
    return (
      <div ref={ref} className="flex flex-col items-stretch justify-between gap-2.5 rounded-xl border border-[#1E293B] bg-[#0F172A] p-2.5 sm:flex-row sm:items-center sm:p-3.5">
        <button
          type="button"
          onClick={onReset}
          onMouseEnter={playHoverSound}
          className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded border border-transparent px-3 text-xs text-[#64748B] transition-colors hover:border-[#EF4444]/40 hover:bg-[#2A161C] hover:text-[#EF4444]"
        >
          <RotateCcw className="h-3.5 w-3.5" />この記事をリセット
        </button>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={onCopy}
            onMouseEnter={playHoverSound}
            className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 text-xs text-[#F8FAFC] transition-colors hover:bg-[#1E293B] sm:px-4"
          >
            <Copy className="h-3.5 w-3.5 text-[#06B6D4]" />{copied ? 'コピー完了' : '本文をコピー'}
          </button>
          <button
            type="button"
            onClick={onShare}
            onMouseEnter={playHoverSound}
            className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded bg-[#06B6D4] px-3 text-xs font-bold text-[#0B1018] shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:bg-[#0891B2] active:scale-95 sm:px-4"
          >
            <Share2 className="h-3.5 w-3.5" />{shared ? '共有完了' : '記事を共有'}
          </button>
        </div>
      </div>
    );
  },
);
