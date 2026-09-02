import { CheckCircle2, Clock, Wine } from 'lucide-react';
import type { RoseEditorCommentData } from './RoseArticleTypes';

type RoseEditorCommentProps = {
  comment: RoseEditorCommentData;
  portraitUrl: string;
  isMobile?: boolean;
};

export function RoseEditorComment({ comment, portraitUrl, isMobile = false }: RoseEditorCommentProps) {
  return (
    <section
      aria-label="編纂官マダム・ロゼのコメント"
      className="relative mt-8 border-2 border-[#171315] bg-[#D8C6A5] p-3.5 shadow-[4px_4px_0px_#171315] sm:mt-12 sm:border-[3px] sm:p-6"
    >
      <div className="absolute right-2 top-2 h-3.5 w-3.5 border-r-2 border-t-2 border-[#6E1F2B]" />
      <div className="absolute bottom-2 left-2 h-3.5 w-3.5 border-b-2 border-l-2 border-[#6E1F2B]" />

      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#171315] pb-2.5 sm:mb-4 sm:pb-3">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center bg-[#6E1F2B] text-[#E7D9BE] shadow-sm sm:h-7 sm:w-7">
            <Wine className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
          <h2 className="font-['Cinzel',serif] text-sm font-black uppercase tracking-wider text-[#171315] sm:text-lg">
            {comment.title || 'LAST CALL ── FROM THE EDITOR'}
          </h2>
        </div>

        {comment.stampText && (
          <div className="flex rotate-1 items-center gap-1 border-2 border-[#6E1F2B] bg-[#6E1F2B]/10 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-[#6E1F2B] shadow-sm sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{comment.stampText}</span>
          </div>
        )}
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-[60px] w-12 shrink-0 overflow-hidden border-2 border-[#171315] bg-[#171315] shadow-sm">
              <img src={portraitUrl} alt="マダム・ロゼ" referrerPolicy="no-referrer" className="h-full w-full object-cover object-top contrast-[1.08] sepia-[0.1]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171315]/60 to-transparent" />
            </div>
            <div>
              <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-[#6E1F2B]">LAST CALL 店主</span>
              <span className="whitespace-nowrap font-['Shippori_Mincho',serif] text-sm font-black text-[#171315]">マダム・ロゼ</span>
            </div>
          </div>

          <div className="w-full border-l-4 border-[#6E1F2B] bg-[#171315]/5 p-3.5 font-['Shippori_Mincho',serif] text-[14.5px] italic leading-[1.8] text-[#171315]">
            {comment.message}
          </div>

          <div className="mt-1 flex flex-col gap-1.5 border-t border-[#171315]/20 pt-2 text-xs">
            {comment.subNotice && <span className="font-serif text-[10px] font-medium text-[#66504A]">{comment.subNotice}</span>}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px] text-[#66504A]">
              {comment.date && <span className="flex items-center gap-1 font-mono font-bold text-[#171315]/80"><Clock className="h-3 w-3 text-[#6E1F2B]" />{comment.date}</span>}
              {comment.signature && <span className="border-b border-[#171315]/50 pb-0.5 font-serif font-black text-[#171315]">編纂署名：{comment.signature}</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-start">
          <div className="flex shrink-0 items-center gap-3 md:flex-col md:gap-2.5">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden border-2 border-[#171315] bg-[#171315] shadow-sm md:h-24 md:w-20">
              <img src={portraitUrl} alt="マダム・ロゼ" referrerPolicy="no-referrer" className="h-full w-full object-cover object-top contrast-[1.08] sepia-[0.1]" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171315]/60 to-transparent" />
            </div>
            <div className="text-left md:text-center">
              <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-[#6E1F2B]">LAST CALL 店主</span>
              <span className="font-['Shippori_Mincho',serif] text-xs font-black text-[#171315] sm:text-sm">マダム・ロゼ</span>
            </div>
          </div>

          <div className="flex min-w-0 w-full flex-1 flex-col justify-between">
            <div className="w-full border-l-4 border-[#6E1F2B] bg-[#171315]/5 p-4 font-['Shippori_Mincho',serif] text-[15px] italic leading-relaxed text-[#171315] sm:text-[16.5px]">{comment.message}</div>
            <div className="mt-3.5 flex flex-col items-start justify-between gap-2 border-t-2 border-[#171315]/20 pt-2.5 text-xs sm:flex-row sm:items-center">
              {comment.subNotice && <span className="font-serif text-[11px] font-medium text-[#66504A]">{comment.subNotice}</span>}
              <div className="ml-auto flex flex-wrap items-center gap-3 text-[11px] text-[#66504A]">
                {comment.date && <span className="flex items-center gap-1 font-mono font-bold text-[#171315]/80"><Clock className="h-3.5 w-3.5 text-[#6E1F2B]" />{comment.date}</span>}
                {comment.signature && <span className="border-b-2 border-[#171315]/50 pb-0.5 font-serif font-black text-[#171315]">編纂署名：{comment.signature}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
