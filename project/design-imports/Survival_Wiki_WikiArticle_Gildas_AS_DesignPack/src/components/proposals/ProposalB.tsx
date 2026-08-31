import React, { useState } from 'react';
import { WikiArticleData, PhotoItem } from '../../types';
import { Compass, MapPin, Users, Calendar, Feather, ChevronDown, ChevronUp, ZoomIn, ShieldCheck, Scroll } from 'lucide-react';

interface ProposalBProps {
  data: WikiArticleData;
  photos: PhotoItem[];
  hasCoordinates: boolean;
  isZeroCoordinates: boolean;
  hasCompanions: boolean;
  onPhotoClick: (index: number) => void;
}

export const ProposalB: React.FC<ProposalBProps> = ({
  data,
  photos,
  hasCoordinates,
  isZeroCoordinates,
  hasCompanions,
  onPhotoClick,
}) => {
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({
    'ch-1': true,
    'ch-3': true,
  });

  const toggleNote = (chapterId: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <article
      id="proposal-b-container"
      className="w-full min-h-screen bg-[#0b1016] text-[#e8eaed] pb-24 font-serif-jp relative"
    >
      {/* Decorative Gold Leaf Trim Borders */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8 sm:pt-14">
        {/* Manuscript Codex Header Box */}
        <header className="relative p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[#131b26] to-[#0f1620] border-2 border-amber-500/40 shadow-2xl mb-12 text-center overflow-hidden">
          {/* Corner gold ornaments */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-400" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-cinzel tracking-widest uppercase mb-4">
            <Scroll className="w-3.5 h-3.5" />
            <span>Illuminated Codex &bull; 写本編纂録</span>
          </div>

          <h1 className="font-shippori text-2xl sm:text-4xl md:text-5xl font-extrabold text-amber-100 tracking-wide leading-tight mb-6">
            {data.title}
          </h1>

          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-6" />

          {/* Codex Inscription Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-300 font-sans-clean">
            <span className="flex items-center gap-1.5 bg-amber-950/40 text-amber-200 px-3 py-1 rounded-md border border-amber-500/30">
              <MapPin className="w-4 h-4 text-amber-400" />
              {data.locationName}
            </span>

            <span className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
              {data.timestamp}
            </span>

            {/* Coordinates (Conditional) */}
            {hasCoordinates && (
              <span className="flex items-center gap-1 font-mono text-xs bg-slate-900/90 text-amber-300 px-2.5 py-1 rounded border border-amber-500/20">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                {isZeroCoordinates
                  ? '緯経座標：0 / 0 / 0'
                  : `標定：X ${data.coordinates?.x} · Y ${data.coordinates?.y} · 標高 ${data.coordinates?.z}m`}
              </span>
            )}

            {/* Companions (Conditional) */}
            {hasCompanions && data.companions && data.companions.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-amber-200/90 bg-[#16202e] px-2.5 py-1 rounded border border-amber-500/20">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>列席：{data.companions.join('、')}</span>
              </span>
            )}
          </div>

          {data.memo && (
            <p className="mt-6 text-sm text-amber-200/90 font-serif-jp italic max-w-2xl mx-auto leading-relaxed">
              「{data.memo}」
            </p>
          )}
        </header>

        {/* Illuminated Gallery / Hero Miniature (Photo condition) */}
        {photos.length > 0 ? (
          <div className="mb-14">
            <div className="relative p-2 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent border border-amber-400/40 shadow-xl">
              <div
                className="relative aspect-[16/9] w-full rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => onPhotoClick(0)}
              >
                <img
                  src={photos[0].url}
                  alt={photos[0].alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/70 text-amber-300 text-xs font-cinzel flex items-center gap-1 border border-amber-400/40">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>挿絵拡大</span>
                </div>
              </div>
              <div className="pt-3 px-2 flex items-center justify-between text-xs text-amber-200/80 font-sans-clean">
                <span className="font-semibold font-serif-jp">写本標題絵：{photos[0].title}</span>
                <span className="text-slate-400 text-[11px] font-mono">{photos[0].timestamp || '記録挿絵'}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Photo 0 State: Golden Crest Seal */
          <div className="mb-12 py-8 px-4 rounded-xl border border-amber-500/20 bg-[#121924]/60 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-400/40 text-amber-400 mb-3 shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-cinzel text-sm font-bold text-amber-200 tracking-wider">
              CODEX MANUSCRIPT AUTHENTICATED
            </h3>
            <p className="text-xs text-slate-400 font-serif-jp mt-1">
              文字と声によって永遠に伝えられるべき、高貴なる探求の全貌
            </p>
          </div>
        )}

        {/* Chapters with Drop-caps and Marginalia */}
        <div className="space-y-16">
          {data.chapters.map((chapter, index) => {
            const hasPhotoForChapter =
              photos.length >= 3 && index > 0 && photos[index];

            return (
              <section key={chapter.id} id={chapter.id} className="relative scroll-mt-20">
                {/* Chapter Title Banner with Drop-cap style Number */}
                <div className="flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400 text-white font-cinzel font-extrabold text-xl shadow-lg shrink-0">
                    {chapter.numeral}
                  </div>
                  <div>
                    <h2 className="font-shippori text-xl sm:text-2xl font-bold text-amber-100 tracking-wide">
                      {chapter.title}
                    </h2>
                    {chapter.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-sans-clean">
                        {chapter.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Chapter Content with First Paragraph Drop-cap */}
                <div className="space-y-5 text-[16px] sm:text-[17px] leading-[1.9] text-slate-200 font-serif-jp">
                  {chapter.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-justify indent-4">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Photo Miniature for Chapter (if 3 or 5 photos) */}
                {hasPhotoForChapter && (
                  <div className="my-8">
                    <div className="p-2 rounded-xl bg-[#141d29] border border-amber-400/30 shadow-lg">
                      <div
                        className="relative max-h-[380px] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => onPhotoClick(index)}
                      >
                        <img
                          src={hasPhotoForChapter.url}
                          alt={hasPhotoForChapter.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      </div>
                      <div className="p-2.5 flex items-center justify-between text-xs text-amber-200/90 font-sans-clean">
                        <span className="font-medium font-serif-jp">写本挿絵 第{chapter.numeral}葉：{hasPhotoForChapter.title}</span>
                        {hasPhotoForChapter.locationTag && (
                          <span className="text-slate-400 font-mono text-[11px]">
                            {hasPhotoForChapter.locationTag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Marginalia Note: Elegant Collapsible on Mobile, Distinct Box on PC */}
                {chapter.bardMarginalia && (
                  <div className="mt-6 rounded-xl bg-[#111823] border-l-4 border-amber-400 p-4 shadow-sm">
                    <div
                      className="flex items-center justify-between cursor-pointer sm:cursor-default"
                      onClick={() => toggleNote(chapter.id)}
                    >
                      <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider">
                        <Feather className="w-3.5 h-3.5 text-amber-400" />
                        <span>吟遊詩人の欄外注釈（Marginalia）</span>
                      </div>
                      <button
                        className="sm:hidden text-amber-400/80 p-1"
                        aria-label="注釈を開閉"
                      >
                        {expandedNotes[chapter.id] ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {(expandedNotes[chapter.id] !== false) && (
                      <p className="mt-2 text-xs sm:text-[13.5px] text-amber-200/90 leading-relaxed font-serif-jp italic pl-1">
                        {chapter.bardMarginalia}
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Epilogue Colophon by Gildas */}
        <footer className="mt-20 pt-12 border-t-2 border-amber-500/40">
          <div className="relative p-8 sm:p-10 rounded-2xl bg-[#131b26] border-2 border-amber-400/50 shadow-2xl text-center">
            {/* Wax seal ornament */}
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-950/80 border-2 border-red-500/60 text-red-400 mb-4 shadow-lg">
              <span className="font-cinzel font-black text-sm">SEAL</span>
            </div>

            <h3 className="font-cinzel text-xs uppercase tracking-widest text-amber-400 font-bold mb-4">
              Bardic Colophon &bull; 編纂官ギルダスの跋文
            </h3>

            <blockquote className="font-shippori text-lg sm:text-2xl font-bold text-amber-100 leading-relaxed mb-6 max-w-2xl mx-auto">
              {data.gildasComment.verse}
            </blockquote>

            <div className="w-24 h-0.5 bg-amber-400/40 mx-auto mb-6" />

            <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 font-serif-jp max-w-2xl mx-auto mb-8 text-justify indent-4">
              {data.gildasComment.commentary}
            </p>

            <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-sans-clean">
              <div className="flex items-center gap-2">
                <Feather className="w-4 h-4 text-amber-400" />
                <span className="text-amber-200 font-bold">{data.gildasComment.bardName}</span>
                <span>（{data.gildasComment.bardTitle}）</span>
              </div>
              <span className="font-mono text-[11px] text-amber-300/70">
                {data.gildasComment.epilogueNote}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};
