/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  HernanArticleData,
  ArticlePhoto,
  InfoboxPositionMode,
  MobileTocMode
} from '../types';
import { parseMarkdownToTocAndSections, ParsedSection } from '../utils/markdownParser';
import { HernanEncyclopediaLogo } from './HernanEncyclopediaLogo';
import { HernanTableOfContents } from './HernanTableOfContents';
import { HernanInfobox } from './HernanInfobox';
import { HernanFigure } from './HernanFigure';
import { HernanCompilerNote } from './HernanCompilerNote';
import { Tag } from 'lucide-react';

interface HernanArticleBodyProps {
  data: HernanArticleData;
  onOpenLightbox: (photo: ArticlePhoto) => void;
  infoboxMode?: InfoboxPositionMode;
  mobileTocMode?: MobileTocMode;
  logoSrc?: string;
  customLogoAlt?: string;
}

export const HernanArticleBody: React.FC<HernanArticleBodyProps> = ({
  data,
  onOpenLightbox,
  infoboxMode = 'infobox_right',
  mobileTocMode = 'inline_accordion',
  logoSrc,
  customLogoAlt
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1280);
  const [activeSectionId, setActiveSectionId] = useState<string>('');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Monitor the container's actual available width via ResizeObserver
  // This guarantees responsive adaptation in AI Studio preview widths (390px, 320px, etc.) and on real devices
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });

    observer.observe(containerRef.current);
    // Initial measure
    setContainerWidth(containerRef.current.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  // Determine layout mode based on the real container width
  const isDesktop = containerWidth >= 960;
  const isCompact = containerWidth < 960;
  const isNarrow = containerWidth < 480;

  // Parse markdown into structured TOC and section blocks
  const { toc, sections } = useMemo(() => {
    return parseMarkdownToTocAndSections(data.contentMarkdown);
  }, [data.contentMarkdown]);

  // Set up active section observer while scrolling
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map((sec) => document.getElementById(sec.id));
      const scrollPosition = window.scrollY + 140;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSectionId(sections[i].id);
            return;
          }
        }
      }
      if (sections.length > 0 && sections[0]) {
        setActiveSectionId(sections[0].id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  // Photo distribution strategy across sections (Never stack all in a single right column rail!)
  // Photo 1 (data.photos[0]): Representative photo in Infobox (or top media)
  // Photo 2 (data.photos[1]): Front section figure (inline-right or inline block)
  // Photo 3 (data.photos[2]): Middle section figure (section-break or inline)
  // Photo 4 & 5 (data.photos[3], data.photos[4]): Late section related gallery pair
  const photoDistribution = useMemo(() => {
    const photos = data.photos || [];
    const count = photos.length;

    return {
      primary: count >= 1 ? photos[0] : null,
      frontSectionPhoto: count >= 2 ? photos[1] : null,
      middleSectionPhoto: count >= 3 ? photos[2] : null,
      lateSectionPair: count >= 5 ? [photos[3], photos[4]] : count === 4 ? [photos[3]] : [],
      allCount: count
    };
  }, [data.photos]);

  // Helper for rendering section content lines and contextual distributed figures
  const renderSectionContent = (section: ParsedSection, sectionIndex: number) => {
    const lines = section.contentLines;

    // Decide which figure belongs to this section
    let sectionFigureNode: React.ReactNode = null;

    if (sectionIndex === 0 && photoDistribution.frontSectionPhoto) {
      // First main section -> Photo 2 (Front section figure)
      sectionFigureNode = (
        <HernanFigure
          photo={photoDistribution.frontSectionPhoto}
          onOpenLightbox={onOpenLightbox}
          variant={isDesktop ? 'inline-right' : 'full-width'}
          figNumber={1}
        />
      );
    } else if (sectionIndex === 1 && photoDistribution.middleSectionPhoto) {
      // Second main section -> Photo 3 (Middle section figure)
      sectionFigureNode = (
        <HernanFigure
          photo={photoDistribution.middleSectionPhoto}
          onOpenLightbox={onOpenLightbox}
          variant="section-break"
          figNumber={2}
        />
      );
    } else if (sectionIndex >= 2 && photoDistribution.lateSectionPair.length > 0 && sectionIndex === sections.length - 1) {
      // Last main section -> Photo 4 & Photo 5 (Late section related figures pair)
      sectionFigureNode = (
        <div className="my-6 clear-both">
          <div className="text-[12px] font-mono text-neutral-500 mb-2 font-semibold">
            {photoDistribution.lateSectionPair.length === 2 ? '図版群: 記録資料・比較図版' : '記録資料図版'}
          </div>
          <div className={`grid gap-3 ${photoDistribution.lateSectionPair.length === 2 && !isNarrow ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {photoDistribution.lateSectionPair.map((p, pIdx) => (
              <HernanFigure
                key={p.id}
                photo={p}
                onOpenLightbox={onOpenLightbox}
                variant="gallery-item"
                figNumber={3 + pIdx}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="relative font-sans text-neutral-800 text-[15px] sm:text-[15.5px] leading-[1.85] tracking-normal space-y-3.5 clearfix">
        {/* Insert inline-right figure if applicable */}
        {sectionIndex === 0 && sectionFigureNode}

        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Blockquote (starts with >)
          if (trimmed.startsWith('>')) {
            const quoteText = trimmed.replace(/^>\s*/, '');
            return (
              <blockquote
                key={idx}
                className="my-3.5 pl-4 pr-3 py-2 border-l-3 border-neutral-400 bg-[#f9fafb] text-[14px] sm:text-[14.5px] italic text-neutral-700 font-serif leading-relaxed"
              >
                {renderInlineFormatting(quoteText)}
              </blockquote>
            );
          }

          // Unordered list item (* or -)
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const itemText = trimmed.replace(/^(\*|-)\s+/, '');
            return (
              <li key={idx} className="ml-5 list-disc pl-1 text-[14.5px] sm:text-[15px] leading-relaxed">
                {renderInlineFormatting(itemText)}
              </li>
            );
          }

          // Ordered list item (1. 2. 3.)
          if (/^\d+\.\s+/.test(trimmed)) {
            const itemText = trimmed.replace(/^\d+\.\s+/, '');
            return (
              <li key={idx} className="ml-5 list-decimal pl-1 text-[14.5px] sm:text-[15px] leading-relaxed">
                {renderInlineFormatting(itemText)}
              </li>
            );
          }

          // Regular paragraph
          return (
            <p key={idx} className="text-left text-neutral-800 leading-[1.85] tracking-normal">
              {renderInlineFormatting(trimmed)}
            </p>
          );
        })}

        {/* Insert section break figure or gallery pair if applicable */}
        {sectionIndex !== 0 && sectionFigureNode}
      </div>
    );
  };

  // Helper for bold and footnote superscript links
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[\d+\])/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-neutral-900">
            {part.slice(2, -2)}
          </strong>
        );
      }

      if (/^\[\d+\]$/.test(part)) {
        const citationNum = part.slice(1, -1);
        return (
          <sup key={index} className="mx-0.5 font-sans font-normal">
            <a
              href={`#cite-note-${citationNum}`}
              className="text-[#0645ad] hover:underline font-mono text-[11px] px-0.5"
              title={`脚注 [${citationNum}] へ移動`}
            >
              [{citationNum}]
            </a>
          </sup>
        );
      }

      return part;
    });
  };

  return (
    <article
      ref={containerRef}
      id="hernan-encyclopedia-article"
      className="w-full bg-[#ffffff] text-neutral-900 min-h-screen selection:bg-blue-100 selection:text-blue-900 font-sans pb-20 sm:pb-12"
      style={{ minWidth: 0 }}
    >
      {/* Top Academic Masthead Bar */}
      <header className="border-b border-[#eaecf0] bg-[#fcfdfe] px-3 sm:px-6 lg:px-8 py-2">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2">
          <HernanEncyclopediaLogo
            logoSrc={logoSrc}
            logoAlt={customLogoAlt}
            siteName="SURVIVAL WIKI 百科事典"
            subtitle="編纂官：民俗学者エルナン（学術編纂室）"
            showSubtitle={!isNarrow}
          />

          {isDesktop && (
            <div className="flex items-center gap-3 text-[11.5px] text-neutral-500 font-mono shrink-0">
              {data.lastEditedDate && <span>改訂日: {data.lastEditedDate}</span>}
              <span className="text-neutral-300">•</span>
              <span>記事記号: {data.id}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Reading Area */}
      <div className="w-full max-w-[1280px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7">
        
        {/* DESKTOP LAYOUT (>= 960px): 2-3 Column Academic Structure */}
        {isDesktop ? (
          <div className="flex flex-row gap-8 items-start">
            
            {/* LEFT COLUMN: Sticky TOC Rail */}
            <div className="shrink-0">
              <HernanTableOfContents
                toc={toc}
                activeId={activeSectionId}
                variant="desktop-sticky"
              />
            </div>

            {/* CENTER & RIGHT COLUMN: Article Body + Floated Infobox */}
            <div className="flex-1 w-full min-w-0">
              {/* Article Title */}
              <header className="mb-4">
                <h1
                  id="article-main-title"
                  className="text-[30px] lg:text-[34px] font-normal leading-[1.3] text-neutral-900 font-serif border-b border-[#a2a9b1] pb-1.5 mb-1.5 tracking-tight break-words"
                  style={{ writingMode: 'horizontal-tb' }}
                >
                  {data.title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-neutral-500 font-sans mb-4">
                  <span>出典: Survival Wiki編纂録／民俗学者エルナン論考</span>
                  {data.subtitle && (
                    <>
                      <span className="text-neutral-300">•</span>
                      <span className="text-neutral-600 font-medium">{data.subtitle}</span>
                    </>
                  )}
                </div>
              </header>

              {/* Floated Infobox on Right (Desktop only) */}
              <div className="relative clearfix">
                {infoboxMode === 'infobox_right' && (
                  <div className="float-right w-[300px] xl:w-[320px] ml-6 mb-4 clear-right">
                    <HernanInfobox
                      data={data}
                      onOpenLightbox={onOpenLightbox}
                    />
                  </div>
                )}

                {/* Lead Paragraph */}
                <div
                  id="hernan-lead-paragraph"
                  className="text-[16px] leading-[1.85] text-neutral-900 font-normal font-sans mb-5 text-left tracking-normal"
                >
                  {data.leadParagraph}
                </div>
              </div>

              {/* Parsed Sections */}
              <main className="mt-6 space-y-8">
                {sections.map((section, idx) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-6 pt-1"
                  >
                    {section.level === 2 ? (
                      <h2 className="text-[21px] lg:text-[22px] font-normal text-neutral-900 font-serif border-b border-[#a2a9b1] pb-1 mt-6 mb-3 flex items-baseline gap-2 tracking-tight">
                        <span className="text-[15px] font-mono text-neutral-500 shrink-0">
                          {section.numberPrefix}.
                        </span>
                        <span>{section.title}</span>
                      </h2>
                    ) : (
                      <h3 className="text-[16px] font-bold text-neutral-800 font-serif mt-5 mb-2 flex items-baseline gap-1.5">
                        <span className="text-[12px] font-mono text-neutral-400 shrink-0">
                          {section.numberPrefix}
                        </span>
                        <span>{section.title}</span>
                      </h3>
                    )}

                    {renderSectionContent(section, idx)}
                  </section>
                ))}
              </main>

              {/* Citations */}
              {data.citations && data.citations.length > 0 && (
                <section
                  id="hernan-citations-section"
                  aria-label="参考文献・脚注"
                  className="mt-10 pt-4 border-t border-[#a2a9b1]"
                >
                  <h2 className="text-[19px] font-serif font-normal text-neutral-900 border-b border-[#eaecf0] pb-1 mb-3">
                    脚注・観測出典
                  </h2>
                  <ol className="list-decimal pl-6 space-y-1.5 text-[13px] text-neutral-600 font-sans leading-relaxed">
                    {data.citations.map((cite) => (
                      <li key={cite.id} id={`cite-note-${cite.id}`} className="pl-1">
                        <span className="text-neutral-700">{cite.text}</span>
                        {cite.originalRef && (
                          <span className="ml-1.5 font-mono text-[11px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded-2xs">
                            [{cite.originalRef}]
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Hernan Compiler Note */}
              <HernanCompilerNote comment={data.hernanPostComment} />

              {/* Categories */}
              {data.categories && data.categories.length > 0 && (
                <footer
                  id="hernan-categories-footer"
                  className="mt-8 p-3 bg-[#f8f9fa] border border-[#eaecf0] rounded-xs text-[12.5px] text-neutral-600 font-sans"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <div className="flex items-center gap-1 font-bold text-neutral-700 font-serif shrink-0">
                      <Tag className="h-3 w-3 text-neutral-500" />
                      <span>カテゴリ:</span>
                    </div>
                    {data.categories.map((cat, i) => (
                      <React.Fragment key={cat}>
                        <span className="text-[#0645ad] hover:underline cursor-pointer">
                          {cat}
                        </span>
                        {i < data.categories!.length - 1 && (
                          <span className="text-neutral-300">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </footer>
              )}
            </div>
          </div>
        ) : (
          /* MOBILE / COMPACT 1-COLUMN LAYOUT (< 960px, 390px, 375px, 360px, 320px) */
          <div className="w-full min-w-0 flex flex-col space-y-4">
            
            {/* 1. Article Title (Always horizontal writing, never 1 char vertical drop!) */}
            <header className="w-full min-w-0">
              <h1
                id="article-main-title"
                className="text-[21px] sm:text-[25px] font-normal leading-[1.35] text-neutral-900 font-serif border-b border-[#a2a9b1] pb-1.5 mb-2 tracking-tight break-words w-full"
                style={{ writingMode: 'horizontal-tb', overflowWrap: 'anywhere' }}
              >
                {data.title}
              </h1>

              {/* Mobile Subtitle & Metadata Row */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] sm:text-[12px] text-neutral-500 font-sans mb-3">
                <span>出典: Survival Wiki編纂録</span>
                {data.subtitle && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <span className="text-neutral-600 font-medium">{data.subtitle}</span>
                  </>
                )}
                {data.lastEditedDate && (
                  <>
                    <span className="text-neutral-300">•</span>
                    <span className="font-mono">改訂: {data.lastEditedDate}</span>
                  </>
                )}
              </div>
            </header>

            {/* 2. Lead Paragraph */}
            <div
              id="hernan-lead-paragraph"
              className="text-[15px] sm:text-[15.5px] leading-[1.8] text-neutral-900 font-normal font-sans text-left tracking-normal w-full"
            >
              {data.leadParagraph}
            </div>

            {/* 3. Mobile Infobox (100% full width inline, no float) */}
            <div className="w-full my-2">
              <HernanInfobox
                data={data}
                onOpenLightbox={onOpenLightbox}
                className="w-full"
              />
            </div>

            {/* 4. Mobile Collapsible TOC (Restores full body width when closed) */}
            <div className="w-full my-2">
              <HernanTableOfContents
                toc={toc}
                activeId={activeSectionId}
                variant={mobileTocMode === 'inline_accordion' ? 'mobile-inline' : 'mobile-sheet'}
                onToggleMobileSheet={setIsMobileSheetOpen}
                isMobileSheetOpen={isMobileSheetOpen}
              />
            </div>

            {/* 5. Parsed Sections (1-Column with distributed inline figures) */}
            <main className="w-full space-y-6 mt-4">
              {sections.map((section, idx) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-6 pt-1 w-full"
                >
                  {section.level === 2 ? (
                    <h2 className="text-[18px] sm:text-[19px] font-normal text-neutral-900 font-serif border-b border-[#a2a9b1] pb-1 mt-5 mb-2.5 flex items-baseline gap-2 tracking-tight">
                      <span className="text-[13.5px] font-mono text-neutral-500 shrink-0">
                        {section.numberPrefix}.
                      </span>
                      <span>{section.title}</span>
                    </h2>
                  ) : (
                    <h3 className="text-[14.5px] sm:text-[15.5px] font-bold text-neutral-800 font-serif mt-4 mb-2 flex items-baseline gap-1.5">
                      <span className="text-[11.5px] font-mono text-neutral-400 shrink-0">
                        {section.numberPrefix}
                      </span>
                      <span>{section.title}</span>
                    </h3>
                  )}

                  {renderSectionContent(section, idx)}
                </section>
              ))}
            </main>

            {/* 6. Citations */}
            {data.citations && data.citations.length > 0 && (
              <section
                id="hernan-citations-section"
                aria-label="参考文献・脚注"
                className="mt-8 pt-4 border-t border-[#a2a9b1] w-full"
              >
                <h2 className="text-[17px] font-serif font-normal text-neutral-900 border-b border-[#eaecf0] pb-1 mb-2.5">
                  脚注・観測出典
                </h2>
                <ol className="list-decimal pl-5 space-y-1.5 text-[12px] text-neutral-600 font-sans leading-relaxed">
                  {data.citations.map((cite) => (
                    <li key={cite.id} id={`cite-note-${cite.id}`} className="pl-1">
                      <span className="text-neutral-700">{cite.text}</span>
                      {cite.originalRef && (
                        <span className="ml-1.5 font-mono text-[10.5px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded-2xs">
                          [{cite.originalRef}]
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* 7. Hernan Compiler Note */}
            <HernanCompilerNote comment={data.hernanPostComment} />

            {/* 8. Categories Bar */}
            {data.categories && data.categories.length > 0 && (
              <footer
                id="hernan-categories-footer"
                className="mt-6 p-2.5 bg-[#f8f9fa] border border-[#eaecf0] rounded-xs text-[11.5px] text-neutral-600 font-sans w-full"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <div className="flex items-center gap-1 font-bold text-neutral-700 font-serif shrink-0">
                    <Tag className="h-3 w-3 text-neutral-500" />
                    <span>カテゴリ:</span>
                  </div>
                  {data.categories.map((cat, i) => (
                    <React.Fragment key={cat}>
                      <span className="text-[#0645ad] hover:underline cursor-pointer">
                        {cat}
                      </span>
                      {i < data.categories!.length - 1 && (
                        <span className="text-neutral-300">|</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </footer>
            )}

          </div>
        )}

      </div>
    </article>
  );
};

