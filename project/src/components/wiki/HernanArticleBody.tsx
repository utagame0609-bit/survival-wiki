import { Fragment } from 'react';
import { Maximize2, Tag } from 'lucide-react';
import type { ReactNode } from 'react';
import { playHoverSound } from '@/lib/sound';
import { parseStoredHernanArticle } from '@/lib/wikiHernan';
import type { HernanResolvedPhoto } from '@/components/wiki/useHernanPhotos';

export type HernanLocationLink = {
  name: string;
  onClick: () => void;
};

type HernanArticle = NonNullable<ReturnType<typeof parseStoredHernanArticle>>;

export function renderHernanLinkedText(text: string, links: HernanLocationLink[]): ReactNode[] {
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
    if (next.index > cursor) nodes.push(<Fragment key={`text-${key++}`}>{text.slice(cursor, next.index)}</Fragment>);
    nodes.push(
      <button
        key={`location-${key++}`}
        type="button"
        onClick={next.link.onClick}
        onMouseEnter={playHoverSound}
        className="font-normal text-[#0645ad] underline-offset-2 hover:underline"
      >
        {next.link.name}
      </button>,
    );
    cursor = next.index + next.link.name.length;
  }
  return nodes;
}

function buildPhotoAssignments(sections: HernanArticle['sections'], photos: HernanResolvedPhoto[]) {
  const assignments = new Map<number, HernanResolvedPhoto[]>();
  const used = new Set<number>();

  sections.forEach((section, sectionIndex) => {
    section.photoIndexes?.forEach((photoIndex) => {
      const photo = photos[photoIndex - 1];
      if (!photo || used.has(photoIndex)) return;
      assignments.set(sectionIndex, [...(assignments.get(sectionIndex) ?? []), photo]);
      used.add(photoIndex);
    });
  });

  const unassigned = photos
    .map((photo, index) => ({ photo, photoIndex: index + 1 }))
    .filter(({ photoIndex }) => !used.has(photoIndex));

  unassigned.forEach(({ photo }, index) => {
    if (sections.length === 0) return;
    const emptySection = sections.findIndex((_, sectionIndex) => !(assignments.get(sectionIndex)?.length));
    const sectionIndex = emptySection >= 0 ? emptySection : Math.min(index, sections.length - 1);
    assignments.set(sectionIndex, [...(assignments.get(sectionIndex) ?? []), photo]);
  });

  return assignments;
}

function PhotoFigure({
  photo,
  number,
  variant,
  onOpen,
}: {
  photo: HernanResolvedPhoto;
  number: number;
  variant: 'inline' | 'wide' | 'gallery';
  onOpen: () => void;
}) {
  const size = variant === 'inline'
    ? 'my-3 ml-5 hidden w-[290px] float-right clear-right lg:block'
    : variant === 'gallery'
      ? 'w-full'
      : 'my-5 w-full max-w-[680px] mx-auto clear-both';

  return (
    <figure className={`group border border-[#eaecf0] bg-[#f8f9fa] p-2 ${size}`}>
      <button type="button" onClick={onOpen} className="relative block w-full overflow-hidden bg-neutral-200 text-left">
        <img src={photo.url} alt={photo.alt} className="max-h-[390px] w-full object-cover transition-transform duration-200 group-hover:scale-[1.01]" />
        <span className="absolute right-1.5 top-1.5 flex items-center gap-1 bg-neutral-900/75 p-1 text-[10px] text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-3 w-3" />拡大
        </span>
      </button>
      <figcaption className="mt-1 border-t border-[#f0f2f5] px-0.5 pt-1.5 text-[12px] leading-relaxed text-neutral-600 sm:text-[12.5px]">
        <span className="mr-1 font-mono text-[11.5px] font-bold text-neutral-800">図{number}：</span>
        <span>{photo.title}</span>
        {(photo.locationName || photo.timestamp) && (
          <span className="mt-0.5 block font-mono text-[11px] text-neutral-400">
            {[photo.locationName, photo.timestamp].filter(Boolean).join(' • ')}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

export function HernanArticleBody({
  article,
  photos,
  narratorLine,
  locationLinks,
  onOpenPhoto,
}: {
  article: HernanArticle;
  photos: HernanResolvedPhoto[];
  narratorLine: string;
  locationLinks: HernanLocationLink[];
  onOpenPhoto: (index: number) => void;
}) {
  const photoAssignments = buildPhotoAssignments(article.sections, photos);

  return (
    <div className="mt-2 border-t border-[#eaecf0] pt-1 lg:mt-5 lg:pt-2">
      <main className="space-y-7 sm:space-y-8">
        {article.sections.map((section, sectionIndex) => {
          const sectionPhotos = photoAssignments.get(sectionIndex) ?? [];
          const firstPhoto = sectionPhotos[0] ?? null;
          const laterPhotos = sectionPhotos.slice(1);
          const firstPhotoNumber = firstPhoto ? photos.findIndex((photo) => photo.id === firstPhoto.id) + 1 : 0;
          return (
            <section key={section.id} id={`hernan-${section.id}`} className="scroll-mt-20 pt-1">
              <h2 className="mb-3 mt-5 flex items-baseline gap-2 border-b border-[#a2a9b1] pb-1 font-serif text-[19px] font-normal tracking-tight sm:text-[21px] lg:text-[22px]">
                <span className="shrink-0 font-mono text-[13px] text-neutral-500 sm:text-[15px]">{section.number}.</span>
                <span>{section.title}</span>
              </h2>
              {section.subTitle && <div className="-mt-2 mb-3 font-mono text-[11px] text-neutral-400">{section.subTitle}</div>}

              <div className="clearfix space-y-3.5 text-left text-[15px] leading-[1.85] text-neutral-800 sm:text-[15.5px]">
                {firstPhoto && (
                  <>
                    <PhotoFigure photo={firstPhoto} number={firstPhotoNumber} variant="inline" onOpen={() => onOpenPhoto(firstPhotoNumber - 1)} />
                    <div className="lg:hidden"><PhotoFigure photo={firstPhoto} number={firstPhotoNumber} variant="wide" onOpen={() => onOpenPhoto(firstPhotoNumber - 1)} /></div>
                  </>
                )}
                {section.paragraphs.map((paragraph, index) => <p key={index}>{renderHernanLinkedText(paragraph, locationLinks)}</p>)}
              </div>

              {laterPhotos.length > 0 && (
                <div className={`mt-5 grid gap-3 ${laterPhotos.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {laterPhotos.map((photo) => {
                    const photoNumber = photos.findIndex((item) => item.id === photo.id) + 1;
                    return <PhotoFigure key={photo.id} photo={photo} number={photoNumber} variant="gallery" onOpen={() => onOpenPhoto(photoNumber - 1)} />;
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>

      {article.citations?.length ? (
        <section className="mt-10 border-t border-[#a2a9b1] pt-4">
          <h2 className="mb-3 border-b border-[#eaecf0] pb-1 font-serif text-[18px] font-normal sm:text-[19px]">脚注・観測出典</h2>
          <ol className="list-decimal space-y-1.5 pl-6 text-[12.5px] leading-relaxed text-neutral-600 sm:text-[13px]">
            {article.citations.map((citation) => <li key={citation.id}>{citation.text}</li>)}
          </ol>
        </section>
      ) : null}

      <aside className="mt-8 border-l-4 border-[#a2a9b1] bg-[#f8f9fa] px-4 py-3 text-[13px] leading-relaxed text-neutral-700">
        <div className="mb-1 font-serif text-sm font-bold text-neutral-900">編纂官注記</div>
        <p>{article.hernanComment}</p>
        {narratorLine && <p className="mt-2 italic text-neutral-600">— エルナン「{narratorLine}」</p>}
      </aside>

      {article.categories?.length ? (
        <footer className="mt-6 border border-[#eaecf0] bg-[#f8f9fa] p-2.5 text-[11.5px] text-neutral-600 sm:text-[12.5px]">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex items-center gap-1 font-serif font-bold text-neutral-700"><Tag className="h-3 w-3" />カテゴリ:</span>
            {article.categories.map((category, index) => <Fragment key={category}><span className="text-[#0645ad]">{category}</span>{index < article.categories!.length - 1 && <span className="text-neutral-300">|</span>}</Fragment>)}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
