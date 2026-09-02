import type { ReactNode } from 'react';
import { Tag } from 'lucide-react';
import type { RoseArticle } from './RoseArticleTypes';
import { RoseArticleTitle } from './RoseArticleTitle';
import { RoseEditorComment } from './RoseEditorComment';
import { RoseMadameHero } from './RoseMadameHero';
import { RoseMasthead } from './RoseMasthead';

type RoseArticleShellProps = {
  article: RoseArticle;
  body: ReactNode;
  isMobile?: boolean;
};

export function RoseArticleShell({ article, body, isMobile = false }: RoseArticleShellProps) {
  return (
    <article
      id="rose-article-sheet"
      aria-label={`${article.title} - ROSE'S LAST CALL`}
      className={`relative mx-auto box-border overflow-hidden border-2 border-[#171315] bg-[#D8C6A5] text-[#171315] transition-all duration-200 sm:border-4 ${
        isMobile
          ? 'w-full max-w-[390px] p-3.5 shadow-[5px_5px_0px_#171315]'
          : 'w-full max-w-full p-3.5 shadow-[5px_5px_0px_#171315] sm:max-w-[880px] sm:p-8 sm:shadow-[10px_10px_0px_#171315] md:p-10'
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(23,19,21,0.25)_1px,transparent_0)] [background-size:4px_4px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-px -translate-x-1/2 bg-gradient-to-b from-[#171315]/15 via-[#171315]/5 to-[#171315]/20"
        aria-hidden="true"
      />
      {!isMobile && (
        <div
          className="pointer-events-none absolute -top-3 right-8 z-20 hidden h-6 w-16 -rotate-1 items-center justify-center border border-[#171315] bg-[#6E1F2B] font-mono text-[9px] font-bold uppercase tracking-widest text-white shadow-sm sm:flex"
          aria-hidden="true"
        >
          PRESS-ARCHIVE
        </div>
      )}

      <div className="relative z-10">
        <RoseMasthead
          masthead={article.masthead}
          category={article.category}
          hazardLevel={article.hazardLevel}
          isMobile={isMobile}
        />

        <RoseArticleTitle title={article.title} />

        <div className="mb-6 sm:mb-8">
          <RoseMadameHero portrait={article.portrait} isMobile={isMobile} />
        </div>

        <div className="rose-article-body border-t-2 border-[#171315]/30 pt-5 sm:pt-6">{body}</div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t-2 border-[#171315]/30 pt-4 sm:mt-8">
            <span className="flex items-center gap-1 font-serif text-xs font-black text-[#6E1F2B]">
              <Tag className="h-3.5 w-3.5" />
              <span>記事分類タグ：</span>
            </span>
            {article.tags.map((tag) => (
              <span key={tag} className="border border-[#171315]/40 bg-[#171315]/10 px-2.5 py-0.5 font-mono text-xs font-bold text-[#171315]">#{tag}</span>
            ))}
          </div>
        )}

        <RoseEditorComment comment={article.editorComment} portraitUrl={article.portrait.imageUrl} isMobile={isMobile} />

        <footer className="-mx-3.5 -mb-3.5 mt-8 flex flex-col items-center justify-between gap-2 border-t-4 border-[#6E1F2B] bg-[#171315] px-3.5 py-3.5 text-center font-serif text-[11px] text-[#D8C6A5] sm:-mx-8 sm:-mb-8 sm:flex-row sm:px-8 sm:text-left md:-mx-10 md:-mb-10 md:px-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <span className="font-['Cinzel',serif] font-black tracking-wider text-[#E7D9BE]">SURVIVAL WIKI</span>
            <span className="text-[#D8C6A5]/80">❖ 編纂官：マダム・ロゼ（荒野酒場『LAST CALL』）</span>
          </div>
          <div className="font-mono text-[10px] font-bold text-[#D8C6A5]/60">ROSE'S LAST CALL ❖ PRESS ARCHIVE</div>
        </footer>
      </div>
    </article>
  );
}
