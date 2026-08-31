import { BookOpen, Bookmark, CheckCircle2, ChevronDown, X } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';

export type GildasNavigationChapter = {
  id: string;
  numeral: string;
  title: string;
  subtitle?: string | null;
};

export function GildasMobileChapterNavigation({
  chapters,
  activeChapterId,
  photoCount,
  isOpen,
  onOpen,
  onClose,
  onSelectChapter,
}: {
  chapters: GildasNavigationChapter[];
  activeChapterId: string;
  photoCount: number;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelectChapter: (chapterId: string) => void;
}) {
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];

  return (
    <>
      <div className="sticky top-0 z-30 border-b border-amber-500/20 bg-[#0a101c]/90 px-4 py-2.5 shadow-lg backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="gildas-cinzel shrink-0 rounded border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              第{activeChapter?.numeral ?? '一'}節
            </span>
            <span className="truncate text-xs font-medium text-slate-200">{activeChapter?.title ?? '旅の記録'}</span>
          </div>
          <button
            type="button"
            onClick={onOpen}
            onMouseEnter={playHoverSound}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/25"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>章を見る</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-[220] flex flex-col justify-end lg:hidden">
          <button type="button" aria-label="目次を閉じる" onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="gildas-mobile-toc-sheet relative z-10 flex max-h-[78vh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-amber-500/40 bg-[#0c1322] pb-[env(safe-area-inset-bottom,1rem)] shadow-2xl">
            <div className="flex flex-col gap-2 border-b border-amber-500/20 px-5 pb-2 pt-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="gildas-cinzel flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400"><Bookmark className="h-4 w-4" /><span>旅程マイルストーン</span></div>
                <button type="button" onClick={onClose} aria-label="目次を閉じる" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto px-4 py-3">
              {chapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                return (
                  <button key={chapter.id} type="button" onClick={() => onSelectChapter(chapter.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${isActive ? 'border-amber-400/60 bg-amber-500/20 font-bold text-amber-100' : 'border-slate-800 bg-[#10192a]/80 text-slate-300'}`}>
                    <div className="flex min-w-0 items-center gap-2.5"><span className="gildas-cinzel shrink-0 text-xs font-bold text-amber-400">第{chapter.numeral}節</span><span className="truncate text-xs">{chapter.title}</span></div>
                    {isActive && <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 text-[10px] text-amber-300"><CheckCircle2 className="h-3 w-3" />読書中</span>}
                  </button>
                );
              })}
            </div>
            <div className="gildas-sans flex items-center justify-between border-t border-slate-800 bg-[#090e18] p-3 text-xs text-slate-400">
              <span className="text-[11px]">全 {chapters.length} 節 / 写真 {photoCount} 枚</span>
              <button type="button" onClick={onClose} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200">閉じる</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function GildasDesktopJourneyNavigation({
  chapters,
  activeChapterId,
  photoCount,
  heroHeight,
  onSelectChapter,
}: {
  chapters: GildasNavigationChapter[];
  activeChapterId: string;
  photoCount: number;
  heroHeight: number | null;
  onSelectChapter: (chapterId: string) => void;
}) {
  return (
    <aside
      className="hidden min-h-0 lg:flex lg:flex-col lg:overflow-hidden lg:rounded-2xl lg:border lg:border-amber-500/20 lg:bg-[#0d1420]/90 lg:p-5 lg:shadow-xl lg:backdrop-blur-md"
      style={{ height: heroHeight ? `${heroHeight}px` : undefined, maxHeight: heroHeight ? `${heroHeight}px` : '420px' }}
    >
      <div className="gildas-cinzel shrink-0 border-b border-amber-500/20 pb-3 text-xs font-semibold tracking-wider text-amber-400">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>旅程マイルストーン</span>
        </div>
      </div>
      <nav className="gildas-sans my-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
        {chapters.map((chapter) => {
          const isActive = chapter.id === activeChapterId;
          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onSelectChapter(chapter.id)}
              onMouseEnter={playHoverSound}
              className={`group flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-all ${isActive ? 'border-l-2 border-amber-400 bg-amber-500/20 font-semibold text-amber-200' : 'text-slate-400 hover:bg-slate-800/40 hover:text-amber-300'}`}
            >
              <span className="gildas-cinzel mt-0.5 shrink-0 text-amber-400/90">第{chapter.numeral}節</span>
              <span className="min-w-0">
                <span className="block break-words leading-tight">{chapter.title}</span>
                {chapter.subtitle && <span className="mt-0.5 block text-[10px] leading-tight text-slate-500">{chapter.subtitle}</span>}
              </span>
            </button>
          );
        })}
      </nav>
      <div className="shrink-0 space-y-1.5 border-t border-slate-800 pt-3 font-mono text-[11px] text-slate-400">
        <div className="flex justify-between"><span>総節数</span><span className="text-amber-400">{chapters.length} 節</span></div>
        <div className="flex justify-between"><span>記録写真</span><span className="text-amber-400">{photoCount} 枚</span></div>
      </div>
    </aside>
  );
}
