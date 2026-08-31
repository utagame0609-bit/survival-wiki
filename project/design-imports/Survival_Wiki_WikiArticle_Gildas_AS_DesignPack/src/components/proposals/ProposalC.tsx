import React from 'react';
import { WikiArticleData, PhotoItem } from '../../types';
import { Compass, MapPin, Users, Calendar, Heart, Flame, Sparkles, Feather, Image as ImageIcon } from 'lucide-react';

interface ProposalCProps {
  data: WikiArticleData;
  photos: PhotoItem[];
  hasCoordinates: boolean;
  isZeroCoordinates: boolean;
  hasCompanions: boolean;
  onPhotoClick: (index: number) => void;
}

export const ProposalC: React.FC<ProposalCProps> = ({
  data,
  photos,
  hasCoordinates,
  isZeroCoordinates,
  hasCompanions,
  onPhotoClick,
}) => {
  return (
    <article
      id="proposal-c-container"
      className="w-full min-h-screen bg-[#0a0f16] text-[#edf2f7] pb-28 font-serif-jp relative selection:bg-amber-400 selection:text-stone-900"
    >
      {/* Warm Ambient Glow Banner */}
      <div className="w-full bg-gradient-to-b from-amber-950/20 via-transparent to-transparent pt-10 sm:pt-16 pb-8 border-b border-amber-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-8">
          {/* Keepsake Stamp Header */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-300">
                <Flame className="w-4 h-4 text-amber-400" />
              </span>
              <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300 font-bold">
                Adventurer&apos;s Keepsake &bull; 旅の追憶手記
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
              {data.chronicleCode}
            </span>
          </div>

          <h1 className="font-shippori text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-5">
            {data.title}
          </h1>

          {/* Travel Tags & Companions Pill Bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-sans-clean">
            <div className="flex items-center gap-1.5 bg-[#141e2b] text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 shadow-sm font-medium">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{data.locationName}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#101722] text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-amber-400/70" />
              <span>{data.timestamp}</span>
            </div>

            {/* Coordinates (Conditional) */}
            {hasCoordinates && (
              <div className="flex items-center gap-1.5 bg-[#0e1622] text-cyan-300 font-mono text-xs px-3 py-1.5 rounded-lg border border-cyan-900/50">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {isZeroCoordinates
                    ? '地点座標：0.000 / 0.000 (原点)'
                    : `座標：X ${data.coordinates?.x} · Y ${data.coordinates?.y} · 標高 ${data.coordinates?.z}m`}
                </span>
              </div>
            )}

            {/* Companions (Conditional) */}
            {hasCompanions && data.companions && data.companions.length > 0 && (
              <div className="flex items-center gap-1.5 bg-[#182333] text-amber-200 px-3 py-1.5 rounded-lg border border-amber-500/30">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>旅の仲間：{data.companions.join('、')}</span>
              </div>
            )}
          </div>

          {/* Personal Journey Memo */}
          {data.memo && (
            <div className="mt-6 p-4 rounded-xl bg-[#111926]/90 border border-amber-500/30 text-sm text-amber-100/90 leading-relaxed font-serif-jp relative">
              <div className="absolute -top-2.5 left-4 px-2 py-0.2 bg-amber-950 text-amber-300 text-[10px] uppercase font-mono rounded border border-amber-500/30">
                Journal Inscription
              </div>
              <p className="mt-1 italic">「{data.memo}」</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Article Stream (100% full width on mobile 390px, rich photos inline) */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-10">
        {/* Photo Strip / Keepsake Ribbon Preview (if multiple photos) */}
        {photos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between text-xs text-amber-300/80 font-cinzel mb-3">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Memories Collected &bull; 旅の記憶（{photos.length}葉）</span>
              </span>
              <span className="text-slate-400 text-[11px] font-mono">クリックで拡大閲覧</span>
            </div>

            {/* Photo Cards Grid / Responsive Stack */}
            <div
              className={`grid gap-4 ${
                photos.length === 1
                  ? 'grid-cols-1'
                  : photos.length === 3
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : photos.length === 5
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'
                  : 'grid-cols-1'
              }`}
            >
              {photos.map((photo, pIdx) => (
                <div
                  key={photo.id}
                  onClick={() => onPhotoClick(pIdx)}
                  className="group relative rounded-xl overflow-hidden bg-[#131d2b] border border-amber-500/30 shadow-md cursor-pointer hover:border-amber-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`aspect-[4/3] w-full overflow-hidden`}>
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                  </div>
                  <div className="p-2 bg-[#0e1622] border-t border-amber-500/20">
                    <p className="text-[11px] font-serif-jp text-amber-200 font-medium truncate">
                      {photo.title}
                    </p>
                    <p className="text-[9.5px] text-slate-400 font-mono truncate">
                      {photo.locationTag || photo.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Photo 0 State: Clean Modern Keepsake Badge */}
        {photos.length === 0 && (
          <div className="mb-10 p-5 rounded-2xl bg-[#111927] border border-amber-500/20 text-center">
            <Heart className="w-6 h-6 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="font-cinzel text-xs text-amber-300 tracking-wider">
              MEMORIES INSCRIBED IN WORDS
            </p>
            <p className="text-xs text-slate-400 font-serif-jp mt-1">
              心に焼き付けられた光景は、形なき永遠の詩となって息づく
            </p>
          </div>
        )}

        {/* Story Chapters */}
        <div className="space-y-14">
          {data.chapters.map((chapter, index) => {
            // Optional inline feature photo for chapters
            const featurePhoto =
              photos.length > 0 && (photos.length === 1 ? index === 0 && photos[0] : photos[index]);

            return (
              <section key={chapter.id} id={chapter.id} className="relative scroll-mt-24">
                {/* Chapter Heading with Warm Accent Line */}
                <div className="flex items-baseline gap-3 mb-5 border-b border-amber-500/20 pb-3">
                  <span className="font-cinzel text-xl sm:text-2xl font-black text-amber-400">
                    #{index + 1}
                  </span>
                  <div>
                    <h2 className="font-shippori text-xl sm:text-2xl font-bold text-white tracking-wide">
                      {chapter.title}
                    </h2>
                    {chapter.subtitle && (
                      <p className="text-xs sm:text-sm text-slate-400 font-sans-clean mt-0.5">
                        {chapter.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Poetic Quote Box */}
                {chapter.keyMoment && (
                  <div className="mb-6 p-3 rounded-lg bg-[#141e2d]/60 border-l-3 border-amber-400 text-amber-200 text-xs sm:text-sm font-serif-jp">
                    {chapter.keyMoment}
                  </div>
                )}

                {/* Chapter Text */}
                <div className="space-y-4 text-[15.5px] sm:text-[16.5px] leading-[1.85] text-slate-200 font-serif-jp">
                  {chapter.paragraphs.map((para, pIdx) => (
                    <p key={pIdx} className="text-justify indent-4">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Inline Photo Plate */}
                {featurePhoto && photos.length !== 1 && (
                  <div className="my-8">
                    <figure
                      onClick={() => onPhotoClick(photos.indexOf(featurePhoto))}
                      className="group rounded-2xl overflow-hidden bg-[#121a26] border border-amber-500/30 shadow-xl cursor-pointer hover:border-amber-400 transition-all"
                    >
                      <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                          src={featurePhoto.url}
                          alt={featurePhoto.alt}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                        />
                        <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded bg-black/70 text-amber-300 text-[11px] font-cinzel">
                          タップで拡大
                        </div>
                      </div>
                      <figcaption className="p-3 bg-[#0f1722] border-t border-amber-500/20 flex items-center justify-between text-xs text-amber-200 font-sans-clean">
                        <span className="font-medium font-serif-jp">{featurePhoto.title}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {featurePhoto.locationTag || featurePhoto.timestamp}
                        </span>
                      </figcaption>
                    </figure>
                  </div>
                )}

                {/* Gildas Memory Annotation */}
                {chapter.bardMarginalia && (
                  <div className="mt-5 p-3.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-transparent border border-amber-500/20 text-xs sm:text-[13px] text-amber-300 font-serif-jp flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{chapter.bardMarginalia}</span>
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {/* Gildas Fireplace Epilogue */}
        <footer className="mt-20 pt-10 border-t-2 border-amber-500/30">
          <div className="relative p-6 sm:p-9 rounded-2xl bg-gradient-to-br from-[#182333] via-[#101824] to-[#0c121c] border border-amber-400/40 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 uppercase tracking-widest font-bold mb-4">
              <Feather className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Epilogue Blessing &bull; 旅路の余韻と祝福</span>
            </div>

            <blockquote className="font-shippori text-lg sm:text-xl font-bold text-amber-100 leading-relaxed mb-5 pl-4 border-l-2 border-amber-400">
              {data.gildasComment.verse}
            </blockquote>

            <p className="text-sm sm:text-[15px] leading-relaxed text-slate-200 font-serif-jp mb-6 indent-2">
              {data.gildasComment.commentary}
            </p>

            <div className="pt-4 border-t border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 font-sans-clean">
              <div className="text-amber-300 font-medium">
                <span>{data.gildasComment.bardName}</span>
                <span className="text-slate-400 ml-1.5">（{data.gildasComment.bardTitle}）</span>
              </div>
              <span className="font-mono text-[11px] text-amber-400/80">
                {data.gildasComment.epilogueNote}
              </span>
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};
