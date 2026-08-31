import React, { useState, useEffect, useRef } from 'react';
import { WikiArticleData, PhotoItem } from '../../types';
import {
  Compass,
  MapPin,
  Users,
  Calendar,
  ArrowUpRight,
  BookOpen,
  Feather,
  ChevronDown,
  X,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface ProposalAProps {
  data: WikiArticleData;
  photos: PhotoItem[];
  hasCoordinates: boolean;
  isZeroCoordinates: boolean;
  hasCompanions: boolean;
  hasDate?: boolean;
  onPhotoClick: (index: number) => void;
}

export const ProposalA: React.FC<ProposalAProps> = ({
  data,
  photos,
  hasCoordinates,
  isZeroCoordinates,
  hasCompanions,
  hasDate = true,
  onPhotoClick,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(
    data.chapters[0]?.id || ''
  );
  const [isMobileTocOpen, setIsMobileTocOpen] = useState<boolean>(false);
  const scrollPositionBeforeToc = useRef<number>(0);

  // Set default active chapter if chapters change
  useEffect(() => {
    if (data.chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(data.chapters[0].id);
    }
  }, [data.chapters, activeChapterId]);

  // Track active chapter on scroll using IntersectionObserver
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveChapterId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    data.chapters.forEach((ch) => {
      const el = document.getElementById(ch.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [data.chapters]);

  // Open mobile TOC saving current scroll position
  const handleOpenMobileToc = () => {
    scrollPositionBeforeToc.current = window.scrollY;
    setIsMobileTocOpen(true);
  };

  // Close mobile TOC without scrolling
  const handleCloseMobileToc = () => {
    setIsMobileTocOpen(false);
  };

  // Select chapter and scroll smoothly
  const handleSelectChapter = (chapterId: string) => {
    setIsMobileTocOpen(false);
    setActiveChapterId(chapterId);
    // Slight delay to allow bottom sheet animation to close smoothly
    setTimeout(() => {
      const target = document.getElementById(chapterId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // Determine photo distribution
  const heroPhoto = photos[0];
  const activeChapter = data.chapters.find((c) => c.id === activeChapterId) || data.chapters[0];

  return (
    <article
      id="proposal-a-container"
      className="w-full min-h-screen bg-[#080d16] text-[#e2e8f0] pb-24 font-serif-jp relative selection:bg-amber-400 selection:text-stone-900"
    >
      {/* Background Subtle Gradient Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.18),rgba(0,0,0,0))] pointer-events-none" />

      {/* Hero Header Section */}
      <header className="relative w-full max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14 pb-6 border-b border-amber-500/20">
        {/* Neutral Traveler Chronicle Label */}
        <div className="flex items-center gap-2 text-xs text-amber-400/80 font-cinzel tracking-widest uppercase mb-3">
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>The Traveler&apos;s Chronicle</span>
          {data.chronicleCode && (
            <>
              <span className="text-amber-500/40">&bull;</span>
              <span className="text-slate-400 font-mono text-[11px]">{data.chronicleCode}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h1 className="font-shippori text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4 text-shadow-sm">
          {data.title}
        </h1>

        {/* Location & Metadata Bar (Strictly Real Facts Only) */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-xs sm:text-sm text-slate-300/90 font-sans-clean mt-4">
          {/* Location (conditional) */}
          {data.locationName && (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium bg-amber-950/40 px-3 py-1 rounded-full border border-amber-500/30">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{data.locationName}</span>
            </div>
          )}

          {/* Actual Recorded Date Only (No fictitious era or fallback labels) */}
          {hasDate && data.timestamp && (
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800 font-mono text-xs">
              <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
              <span>{data.timestamp}</span>
            </div>
          )}

          {/* Coordinates (conditional: only if entered or explicit 0,0,0) */}
          {hasCoordinates && (
            <div className="flex items-center gap-1.5 font-mono text-xs bg-slate-900/80 text-cyan-300/90 px-2.5 py-1 rounded border border-cyan-900/40">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {isZeroCoordinates
                  ? 'X: 0.000 / Y: 0.000 / Z: 0.000'
                  : `X: ${data.coordinates?.x} / Y: ${data.coordinates?.y} / Z: ${data.coordinates?.z}m`}
              </span>
            </div>
          )}

          {/* Companions (conditional: only if non-empty) */}
          {hasCompanions && data.companions && data.companions.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-amber-200/90 bg-[#141b27] px-2.5 py-1 rounded border border-amber-500/20">
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>同行：{data.companions.join('、')}</span>
            </div>
          )}
        </div>

        {/* Chronicle Memo / Inscription (conditional) */}
        {data.memo && (
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/25 via-[#101927] to-[#080d16] border-l-2 border-amber-400 text-sm text-slate-200/90 leading-relaxed font-serif-jp">
            <p className="italic">「{data.memo}」</p>
          </div>
        )}
      </header>

      {/* Dedicated Mobile Sticky Chapter Navigation Bar (lg:hidden) */}
      <div className="lg:hidden sticky top-0 z-30 bg-[#0a101cd0] backdrop-blur-md border-b border-amber-500/20 px-4 py-2.5 shadow-lg">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Current Chapter Indicator */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 font-cinzel text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
              第{activeChapter?.numeral || '壱'}節
            </span>
            <span className="text-xs text-slate-200 font-medium truncate font-serif-jp">
              {activeChapter?.title || '旅の記録'}
            </span>
          </div>

          {/* Open TOC Button */}
          <button
            id="btn-mobile-toc-open"
            onClick={handleOpenMobileToc}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-400/40 hover:bg-amber-500/25 active:scale-95 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>章を見る</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main Body with PC Side Journey Rail + Dedicated Mobile 1-Column Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* PC Sidebar: Journey Milestone Rail (Preserved & Enhanced for PC) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 bg-[#0d1420]/85 backdrop-blur-md p-5 rounded-2xl border border-amber-500/20 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 tracking-wider font-semibold mb-4 border-b border-amber-500/20 pb-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>旅程マイルストーン</span>
            </div>

            <nav className="flex flex-col gap-2.5 font-sans-clean">
              {data.chapters.map((ch) => {
                const isActive = activeChapterId === ch.id;
                return (
                  <a
                    key={ch.id}
                    href={`#${ch.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelectChapter(ch.id);
                    }}
                    className={`group flex items-start gap-2.5 p-2 rounded-lg transition-all text-xs ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-200 font-semibold border-l-2 border-amber-400'
                        : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="font-cinzel text-amber-400/90 mt-0.5 shrink-0">
                      第{ch.numeral}節
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="leading-tight group-hover:underline truncate">
                        {ch.title}
                      </span>
                      {ch.subtitle && (
                        <span className="text-[10px] text-slate-500 truncate mt-0.5 font-serif-jp">
                          {ch.subtitle}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </nav>

            {/* Quick Stats Summary */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>総節数</span>
                <span className="text-amber-400">{data.chapters.length} 節</span>
              </div>
              <div className="flex justify-between">
                <span>記録写真</span>
                <span className="text-amber-400">{photos.length} 枚</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Article Main Text Stream (100% full width on mobile 390px) */}
        <div className="flex-1 min-w-0">
          {/* Hero Main Photo (if photo available) */}
          {heroPhoto ? (
            <figure className="mb-8 sm:mb-10 group relative rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0e1624] shadow-2xl">
              <div
                className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
                onClick={() => onPhotoClick(0)}
              >
                <img
                  src={heroPhoto.url}
                  alt={heroPhoto.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 text-amber-300 border border-amber-400/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <figcaption className="p-3 sm:p-4 bg-[#0c1320] border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-200/90 font-sans-clean">
                <span className="font-medium font-serif-jp truncate">{heroPhoto.title}</span>
                <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                  {heroPhoto.locationTag || '紀行首位光景'}
                </span>
              </figcaption>
            </figure>
          ) : (
            /* Photo 0 State: Neutral Typographic Inscribed Banner */
            <div className="mb-8 p-6 rounded-2xl bg-gradient-to-b from-[#101928] to-[#0a101b] border border-amber-500/20 text-center relative overflow-hidden">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 mb-2">
                <Feather className="w-5 h-5" />
              </div>
              <p className="font-cinzel text-xs text-amber-300 tracking-widest uppercase">
                The Traveler&apos;s Inscribed Chronicle
              </p>
              <p className="text-xs text-slate-400 font-serif-jp mt-1">
                ――旅人の足跡と風の息吹をそのままに編まれたる手記
              </p>
            </div>
          )}

          {/* Chapters Loop */}
          <div className="space-y-12 sm:space-y-16">
            {data.chapters.map((chapter, index) => {
              // Check if a photo should be paired with this chapter
              const chapterPhoto =
                photos.length === 5
                  ? photos[index]
                  : photos.length === 3
                  ? index === 0
                    ? photos[0]
                    : index === 2
                    ? photos[1]
                    : index === 4
                    ? photos[2]
                    : null
                  : photos.length === 1
                  ? index === 0
                    ? photos[0]
                    : null
                  : null;

              // Avoid duplicate showing of hero photo if already placed at top
              const showChapterPhoto = chapterPhoto && (index > 0 || !heroPhoto);

              return (
                <section
                  key={chapter.id}
                  id={chapter.id}
                  className="scroll-mt-20 relative"
                >
                  {/* Chapter Header */}
                  <div className="flex items-baseline gap-3 border-b border-amber-500/20 pb-3 mb-5 sm:mb-6">
                    <span className="font-cinzel text-xl sm:text-3xl font-extrabold text-amber-400 shrink-0">
                      第{chapter.numeral}節
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-shippori text-base sm:text-2xl font-bold text-white tracking-wide leading-tight">
                        {chapter.title}
                      </h2>
                      {chapter.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-sans-clean">
                          {chapter.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Highlight Quote if available */}
                  {chapter.keyMoment && (
                    <div className="mb-5 sm:mb-6 px-4 py-2.5 rounded-lg bg-amber-950/20 border-l-2 border-amber-400/80 text-amber-200 text-xs sm:text-sm italic">
                      {chapter.keyMoment}
                    </div>
                  )}

                  {/* Paragraphs */}
                  <div className="space-y-4 text-[15px] sm:text-[16.5px] leading-[1.85] text-slate-200 font-serif-jp tracking-normal">
                    {chapter.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-justify indent-4">
                        {p}
                      </p>
                    ))}
                  </div>

                  {/* In-chapter Photo (if available) */}
                  {showChapterPhoto && (
                    <figure className="my-7 sm:my-8 group rounded-xl overflow-hidden border border-amber-500/30 bg-[#0e1624] shadow-lg">
                      <div
                        className="relative max-h-[420px] overflow-hidden cursor-pointer"
                        onClick={() => onPhotoClick(photos.indexOf(chapterPhoto))}
                      >
                        <img
                          src={chapterPhoto.url}
                          alt={chapterPhoto.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                      </div>
                      <figcaption className="p-3 bg-[#0d1421] border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-200/80 font-sans-clean">
                        <span className="truncate">{chapterPhoto.title}</span>
                        {chapterPhoto.locationTag && (
                          <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                            {chapterPhoto.locationTag}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  )}

                  {/* Gildas Marginalia Note */}
                  {chapter.bardMarginalia && (
                    <div className="mt-5 sm:mt-6 p-3.5 rounded-lg bg-[#0e1724]/70 border border-amber-500/20 text-xs sm:text-[13px] text-amber-300/90 font-serif-jp flex items-start gap-2.5">
                      <Feather className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{chapter.bardMarginalia}</span>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Gildas Final Bard Post-Commentary (Epilogue Verse) */}
          <footer className="mt-14 sm:mt-16 pt-8 sm:pt-10 border-t-2 border-amber-500/30">
            <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#162030] via-[#0f1724] to-[#0a101a] border border-amber-400/40 shadow-2xl overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 uppercase tracking-widest font-bold mb-3">
                  <Feather className="w-4 h-4 text-amber-400" />
                  <span>Bard&apos;s Epilogue &bull; 吟遊詩人の言霊</span>
                </div>

                <blockquote className="font-shippori text-base sm:text-xl font-bold text-amber-200 leading-relaxed mb-4 pl-4 border-l-2 border-amber-400">
                  {data.gildasComment.verse}
                </blockquote>

                <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 font-serif-jp mb-6 indent-2">
                  {data.gildasComment.commentary}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4 border-t border-amber-500/20 text-xs text-amber-300/80 font-sans-clean">
                  <div className="font-medium">
                    <span className="text-white font-bold">{data.gildasComment.bardName}</span>
                    <span className="text-slate-400 ml-2">（{data.gildasComment.bardTitle}）</span>
                  </div>
                  {data.gildasComment.epilogueNote && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      {data.gildasComment.epilogueNote}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Sheet Modal for Table of Contents (TOC) */}
      {isMobileTocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop Overlay */}
          <div
            id="mobile-toc-backdrop"
            onClick={handleCloseMobileToc}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          {/* Bottom Sheet Drawer */}
          <div
            id="mobile-toc-sheet"
            className="relative z-10 w-full max-h-[78vh] bg-[#0c1322] border-t border-amber-500/40 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,1rem)]"
          >
            {/* Sheet Handle & Header */}
            <div className="pt-3 pb-2 px-5 border-b border-amber-500/20 flex flex-col gap-2">
              <div className="w-10 h-1 rounded-full bg-slate-700 mx-auto" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold tracking-wider">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span>旅程マイルストーン（目次）</span>
                </div>
                <button
                  id="btn-mobile-toc-close"
                  onClick={handleCloseMobileToc}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="目次を閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Chapters List (Compact & Clean) */}
            <div className="overflow-y-auto px-4 py-3 space-y-2">
              {data.chapters.map((ch) => {
                const isActive = activeChapterId === ch.id;
                return (
                  <button
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 border ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400/60 text-amber-100 font-bold shadow-md'
                        : 'bg-[#10192a]/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-cinzel text-xs font-bold text-amber-400 shrink-0">
                        第{ch.numeral}節
                      </span>
                      <span className="text-xs truncate font-serif-jp">
                        {ch.title}
                      </span>
                    </div>

                    {isActive ? (
                      <span className="shrink-0 flex items-center gap-1 text-[10px] text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/40">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>読書中</span>
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10px] text-slate-500 font-sans-clean">
                        移動 &rarr;
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sheet Footer with explicit close button */}
            <div className="p-3 border-t border-slate-800 bg-[#090e18] flex items-center justify-between text-xs text-slate-400 font-sans-clean">
              <span className="text-[11px]">全 {data.chapters.length} 節 / 写真 {photos.length} 枚</span>
              <button
                id="btn-mobile-toc-footer-close"
                onClick={handleCloseMobileToc}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:text-white text-xs font-medium border border-slate-700"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
