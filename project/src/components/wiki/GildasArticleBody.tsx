import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Feather } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';
import { parseStoredGildasChronicle } from '@/lib/wikiGildas';
import type { GildasResolvedPhoto } from '@/components/wiki/useGildasPhotos';

export type GildasLocationLink = {
  name: string;
  onClick: () => void;
};

type GildasChronicle = NonNullable<ReturnType<typeof parseStoredGildasChronicle>>;

export function renderGildasLinkedText(text: string, links: GildasLocationLink[]): ReactNode[] {
  if (!text || links.length === 0) return [text];
  const candidates = links
    .filter((link) => link.name && text.includes(link.name))
    .sort((a, b) => b.name.length - a.name.length);
  if (candidates.length === 0) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const next = candidates
      .map((link) => ({ link, index: text.indexOf(link.name, cursor) }))
      .filter((entry) => entry.index >= 0)
      .sort((a, b) => a.index - b.index || b.link.name.length - a.link.name.length)[0];

    if (!next) {
      nodes.push(<Fragment key={`text-${key++}`}>{text.slice(cursor)}</Fragment>);
      break;
    }
    if (next.index > cursor) {
      nodes.push(<Fragment key={`text-${key++}`}>{text.slice(cursor, next.index)}</Fragment>);
    }
    nodes.push(
      <button
        key={`location-${key++}`}
        type="button"
        onClick={next.link.onClick}
        onMouseEnter={playHoverSound}
        onFocus={playHoverSound}
        className="font-semibold text-amber-300 underline decoration-amber-500/40 underline-offset-2 transition-colors hover:text-amber-200"
      >
        {next.link.name}
      </button>,
    );
    cursor = next.index + next.link.name.length;
  }
  return nodes;
}

function photoChapterIndexes(photoCount: number, chapterCount: number) {
  if (photoCount <= 1 || chapterCount <= 0) return [];
  const additionalCount = photoCount - 1;
  return Array.from({ length: additionalCount }, (_, index) => {
    if (chapterCount === 1) return 0;
    return Math.min(
      chapterCount - 1,
      Math.max(0, Math.round(((index + 1) * (chapterCount - 1)) / additionalCount)),
    );
  });
}

export function GildasArticleBody({
  chronicle,
  photos,
  narratorLine,
  locationLinks,
  onOpenPhoto,
}: {
  chronicle: GildasChronicle;
  photos: GildasResolvedPhoto[];
  narratorLine: string;
  locationLinks: GildasLocationLink[];
  onOpenPhoto: (index: number) => void;
}) {
  const chapterPhotos = new Map<number, GildasResolvedPhoto[]>();
  const assignedPhotoNumbers = new Set<number>();
  if (photos[0]) assignedPhotoNumbers.add(1);

  chronicle.chapters.forEach((chapter, chapterIndex) => {
    chapter.photoIndexes?.forEach((photoNumber) => {
      if (photoNumber <= 1 || photoNumber > photos.length || assignedPhotoNumbers.has(photoNumber)) return;
      const photo = photos[photoNumber - 1];
      if (!photo) return;
      chapterPhotos.set(chapterIndex, [...(chapterPhotos.get(chapterIndex) ?? []), photo]);
      assignedPhotoNumbers.add(photoNumber);
    });
  });

  const unassignedPhotos = photos
    .slice(1)
    .map((photo, index) => ({ photo, photoNumber: index + 2 }))
    .filter(({ photoNumber }) => !assignedPhotoNumbers.has(photoNumber));
  const fallbackIndexes = photoChapterIndexes(unassignedPhotos.length + 1, chronicle.chapters.length);
  unassignedPhotos.forEach(({ photo }, index) => {
    const chapterIndex = fallbackIndexes[index] ?? Math.min(index, chronicle.chapters.length - 1);
    chapterPhotos.set(chapterIndex, [...(chapterPhotos.get(chapterIndex) ?? []), photo]);
  });

  return (
    <div className="mt-8 min-w-0 sm:mt-10 lg:mt-12">
      <div className="space-y-12 sm:space-y-16">
        {chronicle.chapters.map((chapter, chapterIndex) => (
          <section key={chapter.id} id={`gildas-${chapter.id}`} className="scroll-mt-20">
            <div className="mb-5 flex items-baseline gap-3 border-b border-amber-500/20 pb-3 sm:mb-6">
              <span className="gildas-cinzel shrink-0 text-xl font-extrabold text-amber-400 sm:text-3xl">第{chapter.numeral}節</span>
              <div className="min-w-0">
                <h2 className="gildas-display break-words text-base font-bold leading-tight tracking-wide text-white sm:text-2xl">{chapter.title}</h2>
                {chapter.subtitle && <p className="gildas-sans mt-1 break-words text-xs text-slate-400 sm:text-sm">{chapter.subtitle}</p>}
              </div>
            </div>

            {chapter.keyMoment && (
              <div className="mb-5 rounded-lg border-l-2 border-amber-400/80 bg-amber-950/20 px-4 py-2.5 text-xs italic leading-relaxed text-amber-200 sm:mb-6 sm:text-sm">
                {renderGildasLinkedText(chapter.keyMoment, locationLinks)}
              </div>
            )}

            <div className="space-y-4 text-[15px] leading-[1.9] text-slate-200 sm:text-[16.5px]">
              {chapter.paragraphs.map((paragraph, index) => (
                <p key={index} className="break-words sm:text-justify sm:indent-4">{renderGildasLinkedText(paragraph, locationLinks)}</p>
              ))}
            </div>

            {(chapterPhotos.get(chapterIndex) ?? []).map((photo) => {
              const index = photos.findIndex((item) => item.id === photo.id);
              return (
                <figure key={photo.id} className="gildas-photo group my-7 overflow-hidden rounded-xl border border-amber-500/30 bg-[#0e1624] shadow-lg sm:my-8">
                  <button type="button" onClick={() => onOpenPhoto(index)} className="block w-full overflow-hidden text-left">
                    <img src={photo.url} alt={photo.alt} className="max-h-[420px] w-full object-cover" />
                  </button>
                  <figcaption className="gildas-sans flex items-center justify-between gap-2 border-t border-amber-500/20 bg-[#0d1421] p-3 text-xs text-amber-200/80">
                    <span className="min-w-0 break-words">{photo.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400 sm:text-[11px]">旅の記憶 {String(index + 1).padStart(2, '0')}</span>
                  </figcaption>
                </figure>
              );
            })}

            {chapter.bardMarginalia && (
              <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-[#0e1724]/70 p-3.5 text-xs leading-relaxed text-amber-300/90 sm:mt-6 sm:text-[13px]">
                <Feather className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <span>{renderGildasLinkedText(chapter.bardMarginalia, locationLinks)}</span>
              </div>
            )}
          </section>
        ))}
      </div>

      <footer className="mt-14 border-t-2 border-amber-500/30 pt-8 sm:mt-16 sm:pt-10">
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#162030] via-[#0f1724] to-[#0a101a] p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative z-10">
            <div className="gildas-cinzel mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
              <Feather className="h-4 w-4" />
              <span>Bard&apos;s Epilogue • 吟遊詩人の言葉</span>
            </div>
            {narratorLine.trim() && (
              <blockquote className="gildas-display mb-4 border-l-2 border-amber-400 pl-4 text-base font-bold leading-relaxed text-amber-200 sm:text-xl">
                {narratorLine.trim()}
              </blockquote>
            )}
            <p className="text-sm leading-relaxed text-slate-200 sm:text-[15px]">{renderGildasLinkedText(chronicle.gildasComment.commentary, locationLinks)}</p>
            <div className="gildas-sans mt-6 flex flex-col justify-between gap-2 border-t border-amber-500/20 pt-4 text-xs text-amber-300/80 sm:flex-row sm:items-center">
              <div><span className="font-bold text-white">老吟遊詩人 ギルダス</span><span className="ml-2 text-slate-400">（古代伝承編纂官）</span></div>
              {chronicle.gildasComment.epilogueNote && <span className="text-slate-400">{chronicle.gildasComment.epilogueNote}</span>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
