import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Calendar, ChevronDown, ChevronUp, MapPin, Maximize2, Tag, Users, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playHoverSound } from '@/lib/sound';
import { parseStoredHernanArticle } from '@/lib/wikiHernan';

type LocationLink = {
  name: string;
  onClick: () => void;
};

type ResolvedPhoto = {
  id: string;
  url: string;
  title: string;
  alt: string;
  locationName?: string;
  timestamp?: string;
};

function uniqueLocationPhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos.map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .slice(0, 5);
}

function formatRecordedDate(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function linkedText(text: string, links: LocationLink[]): ReactNode[] {
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

function buildPhotoAssignments(
  sections: ReturnType<typeof parseStoredHernanArticle> extends infer T ? NonNullable<T>['sections'] : never,
  photos: ResolvedPhoto[],
) {
  const assignments = new Map<number, ResolvedPhoto[]>();
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
  photo: ResolvedPhoto;
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

export function HernanEncyclopediaArticle({
  world,
  locations,
  content,
  narratorLine,
  locationLinks,
  logoSrc,
}: {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  content: string;
  narratorLine: string;
  locationLinks: LocationLink[];
  logoSrc?: string;
}) {
  const article = useMemo(() => parseStoredHernanArticle(content), [content]);
  const [photos, setPhotos] = useState<ResolvedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('');
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const entries = uniqueLocationPhotos(locations);
    const resolve = async () => {
      const resolved = await Promise.all(entries.map(async ({ location, photo }, index) => ({
        id: photo.id,
        url: await getPhotoUrl(photo.storage_path),
        title: location.detail_memo?.trim() || location.name || `記録写真 ${index + 1}`,
        alt: `${location.name || world.name}の記録写真 ${index + 1}`,
        locationName: location.name || undefined,
        timestamp: formatRecordedDate(photo.created_at) || undefined,
      })));
      if (!cancelled) setPhotos(resolved);
    };
    void resolve().catch(() => { if (!cancelled) setPhotos([]); });
    return () => { cancelled = true; };
  }, [locations, world.name]);

  useEffect(() => {
    if (!article || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSectionId(entry.target.id);
      });
    }, { rootMargin: '-18% 0px -68% 0px', threshold: 0 });
    article.sections.forEach((section) => {
      const element = document.getElementById(`hernan-${section.id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [article]);

  useEffect(() => {
    if (selectedPhoto === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPhoto(null);
      if (photos.length > 1 && event.key === 'ArrowLeft') setSelectedPhoto((current) => current === null ? null : (current - 1 + photos.length) % photos.length);
      if (photos.length > 1 && event.key === 'ArrowRight') setSelectedPhoto((current) => current === null ? null : (current + 1) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos.length]);

  if (!article) return null;

  const photoAssignments = buildPhotoAssignments(article.sections, photos);
  const onlyLocation = locations.length === 1 ? locations[0] : null;
  const earliestTimestamp = locations.map((location) => location.created_at).filter(Boolean).sort()[0];
  const companions = Array.from(new Set(locations.flatMap((location) => location.members.map((member) => member.name)).filter(Boolean)));
  const selected = selectedPhoto === null ? null : photos[selectedPhoto];

  const goToSection = (id: string) => {
    setMobileTocOpen(false);
    document.getElementById(`hernan-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <article ref={articleRef} className="min-h-screen w-full bg-white pb-12 text-neutral-900 selection:bg-blue-100 selection:text-blue-900">
      <header className="border-b border-[#eaecf0] bg-[#fcfdfe] px-3 py-2 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-neutral-900 text-white">
              {logoSrc ? <img src={logoSrc} alt="Survival Wiki 百科事典ロゴ" className="h-full w-full object-contain" /> : <BookOpen className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <div className="truncate font-serif text-sm font-bold tracking-tight sm:text-base">SURVIVAL WIKI 百科事典</div>
              <div className="hidden truncate text-[10px] text-neutral-500 sm:block">編纂官：民俗学者エルナン（学術編纂室）</div>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 font-mono text-[10.5px] text-neutral-500 lg:flex">
            {earliestTimestamp && <span>記録起点: {formatRecordedDate(earliestTimestamp)}</span>}
            <span className="text-neutral-300">•</span>
            <span>記録地点: {locations.length}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="lg:flex lg:items-start lg:gap-8">
          <aside className="hidden w-[210px] shrink-0 lg:sticky lg:top-4 lg:block">
            <div className="mb-2 flex items-center gap-1.5 border-b border-[#eaecf0] pb-2 font-mono text-[11px] font-bold text-neutral-600">
              <BookOpen className="h-3.5 w-3.5" />目次 (CONTENTS)
            </div>
            <nav className="space-y-1 text-[12px] leading-snug">
              {article.sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  onMouseEnter={playHoverSound}
                  className={`block w-full border-l-2 px-2 py-1.5 text-left transition-colors ${activeSectionId === `hernan-${section.id}` ? 'border-[#0645ad] bg-[#f3f6fb] font-semibold text-[#0645ad]' : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-[#0645ad]'}`}
                >
                  <span className="mr-1 font-mono text-[10.5px] text-neutral-400">{section.number}</span>{section.title}
                </button>
              ))}
            </nav>
          </aside>

          <div className="min-w-0 flex-1">
            <header className="mb-4">
              <h1 className="break-words border-b border-[#a2a9b1] pb-1.5 font-serif text-[26px] font-normal leading-[1.3] tracking-tight sm:text-[30px] lg:text-[34px]">
                {article.title}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-neutral-500 sm:text-[12.5px]">
                <span>出典: Survival Wiki編纂録／民俗学者エルナン論考</span>
                {article.subtitle && <><span className="text-neutral-300">•</span><span className="font-medium text-neutral-600">{article.subtitle}</span></>}
              </div>
            </header>

            <div className="mb-4 flex flex-wrap gap-x-3 gap-y-1 border-y border-[#eaecf0] bg-[#f8f9fa] px-2.5 py-1.5 text-[11px] text-neutral-600 sm:text-[11.5px]">
              {onlyLocation?.name && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{onlyLocation.name}</span>}
              {!onlyLocation && locations.length > 0 && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />記録地点 {locations.length}件</span>}
              {onlyLocation?.has_coordinates && <span className="font-mono">X:{onlyLocation.x} / Y:{onlyLocation.y} / Z:{onlyLocation.z}</span>}
              {earliestTimestamp && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatRecordedDate(earliestTimestamp)}</span>}
              {companions.length > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />同行：{companions.join('、')}</span>}
            </div>

            <p className="mb-5 text-left text-[15.5px] leading-[1.85] text-neutral-900 sm:text-[16px]">
              {linkedText(article.leadParagraph, locationLinks)}
            </p>

            <div className="mb-4 lg:hidden">
              <button type="button" onClick={() => setMobileTocOpen((current) => !current)} className="flex w-full items-center justify-between border border-[#a2a9b1] bg-[#f8f9fa] px-3 py-2 text-left text-[12px] font-semibold text-neutral-700">
                <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />目次 ({article.sections.length})</span>
                {mobileTocOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              {mobileTocOpen && (
                <nav className="border-x border-b border-[#a2a9b1] bg-white p-2 text-[12px]">
                  {article.sections.map((section) => (
                    <button key={section.id} type="button" onClick={() => goToSection(section.id)} className="block w-full px-2 py-1.5 text-left text-[#0645ad] hover:underline">
                      <span className="mr-1.5 font-mono text-[10.5px] text-neutral-400">{section.number}</span>{section.title}
                    </button>
                  ))}
                </nav>
              )}
            </div>

            <main className="mt-5 space-y-7 sm:space-y-8">
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
                          <PhotoFigure photo={firstPhoto} number={firstPhotoNumber} variant="inline" onOpen={() => setSelectedPhoto(firstPhotoNumber - 1)} />
                          <div className="lg:hidden"><PhotoFigure photo={firstPhoto} number={firstPhotoNumber} variant="wide" onOpen={() => setSelectedPhoto(firstPhotoNumber - 1)} /></div>
                        </>
                      )}
                      {section.paragraphs.map((paragraph, index) => <p key={index}>{linkedText(paragraph, locationLinks)}</p>)}
                    </div>

                    {laterPhotos.length > 0 && (
                      <div className={`mt-5 grid gap-3 ${laterPhotos.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                        {laterPhotos.map((photo) => {
                          const photoNumber = photos.findIndex((item) => item.id === photo.id) + 1;
                          return <PhotoFigure key={photo.id} photo={photo} number={photoNumber} variant="gallery" onOpen={() => setSelectedPhoto(photoNumber - 1)} />;
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
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-5xl bg-white p-3 shadow-2xl sm:p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between gap-2 border-b border-[#a2a9b1] pb-2">
              <div className="min-w-0 truncate font-serif text-sm text-neutral-800 sm:text-base">図{selectedPhoto! + 1}：{selected.title}</div>
              <button type="button" onClick={() => setSelectedPhoto(null)} className="shrink-0 p-1 text-neutral-500 hover:text-neutral-900" aria-label="画像を閉じる"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex max-h-[72vh] items-center justify-center bg-neutral-950"><img src={selected.url} alt={selected.alt} className="max-h-[72vh] max-w-full object-contain" /></div>
            {(selected.locationName || selected.timestamp) && <div className="mt-2 font-mono text-[11px] text-neutral-500">{[selected.locationName, selected.timestamp].filter(Boolean).join(' • ')}</div>}
            {photos.length > 1 && (
              <div className="mt-3 flex gap-1.5 overflow-x-auto border-t border-[#eaecf0] pt-3">
                {photos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setSelectedPhoto(index)} className={`h-12 w-16 shrink-0 overflow-hidden border ${selectedPhoto === index ? 'border-[#0645ad] ring-1 ring-[#0645ad]' : 'border-[#c8ccd1]'}`}><img src={photo.url} alt="" className="h-full w-full object-cover" /></button>)}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
