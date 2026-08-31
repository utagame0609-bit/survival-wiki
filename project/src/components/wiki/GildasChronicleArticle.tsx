import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Bookmark,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Compass,
  Feather,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playHoverSound } from '@/lib/sound';
import { parseStoredGildasChronicle } from '@/lib/wikiGildas';
import { GildasPhotoModal, type GildasPhotoItem } from '@/components/wiki/GildasPhotoModal';
import '@/wikiGildasChronicle.css';

type LocationLink = {
  name: string;
  onClick: () => void;
};

type ResolvedPhoto = GildasPhotoItem & {
  storagePath: string;
};

function uniqueLocationPhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos.map((photo) => ({ photo, location })))
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

export function GildasChronicleArticle({
  world,
  locations,
  content,
  narratorLine,
  locationLinks,
}: {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  content: string;
  narratorLine: string;
  locationLinks: LocationLink[];
}) {
  const chronicle = useMemo(() => parseStoredGildasChronicle(content), [content]);
  const [activeChapterId, setActiveChapterId] = useState('');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [photos, setPhotos] = useState<ResolvedPhoto[]>([]);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveChapterId(chronicle?.chapters[0]?.id ?? '');
  }, [chronicle]);

  useEffect(() => {
    let cancelled = false;
    const entries = uniqueLocationPhotos(locations);
    const resolve = async () => {
      const resolved = await Promise.all(entries.map(async ({ photo, location }, index) => ({
        id: photo.id,
        storagePath: photo.storage_path,
        url: await getPhotoUrl(photo.storage_path),
        title: location.name || `記録写真 ${index + 1}`,
        alt: `${location.name || world.name}の記録写真 ${index + 1}`,
        locationName: location.name || undefined,
        timestamp: formatRecordedDate(photo.created_at) || undefined,
      })));
      if (!cancelled) setPhotos(resolved);
    };
    void resolve().catch(() => {
      if (!cancelled) setPhotos([]);
    });
    return () => {
      cancelled = true;
    };
  }, [locations, world.name]);

  useEffect(() => {
    if (!chronicle || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveChapterId(entry.target.id);
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    chronicle.chapters.forEach((chapter) => {
      const element = document.getElementById(`gildas-${chapter.id}`);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [chronicle]);

  if (!chronicle) return null;

  const firstLocation = locations[0] ?? null;
  const onlyLocation = locations.length === 1 ? firstLocation : null;
  const earliestTimestamp = locations
    .map((location) => location.created_at)
    .filter(Boolean)
    .sort()[0];
  const companions = Array.from(new Set(locations.flatMap((location) => location.members.map((member) => member.name)).filter(Boolean)));
  const activeChapter = chronicle.chapters.find((chapter) => chapter.id === activeChapterId) ?? chronicle.chapters[0];
  const heroPhoto = photos[0];
  const assignmentIndexes = photoChapterIndexes(photos.length, chronicle.chapters.length);
  const chapterPhotos = new Map<number, ResolvedPhoto[]>();
  photos.slice(1).forEach((photo, index) => {
    const chapterIndex = assignmentIndexes[index] ?? Math.min(index, chronicle.chapters.length - 1);
    chapterPhotos.set(chapterIndex, [...(chapterPhotos.get(chapterIndex) ?? []), photo]);
  });

  const selectChapter = (chapterId: string) => {
    setIsMobileTocOpen(false);
    setActiveChapterId(chapterId);
    window.setTimeout(() => {
      document.getElementById(`gildas-${chapterId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <article ref={articleRef} className="gildas-chronicle-root relative min-h-screen w-full overflow-hidden pb-8 selection:bg-amber-400 selection:text-stone-900 sm:pb-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.18),rgba(0,0,0,0))]" />

      <header className="relative mx-auto w-full max-w-5xl border-b border-amber-500/20 px-4 pb-6 pt-7 sm:px-8 sm:pt-12">
        <div className="gildas-cinzel mb-3 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-amber-400/85 sm:text-xs">
          <BookOpen className="h-3.5 w-3.5 text-amber-400" />
          <span>The Traveler&apos;s Chronicle</span>
          {chronicle.chronicleCode && (
            <>
              <span className="text-amber-500/40">•</span>
              <span className="font-mono text-[10px] normal-case tracking-normal text-slate-400 sm:text-[11px]">{chronicle.chronicleCode}</span>
            </>
          )}
        </div>

        <h1 className="gildas-display text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
          {chronicle.title}
        </h1>

        <div className="gildas-sans mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300/90 sm:text-sm">
          <div className="flex max-w-full items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-3 py-1 font-medium text-amber-300">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="break-words">{onlyLocation?.name ?? `${locations.length}の記録地点 / ${world.name}`}</span>
          </div>

          {earliestTimestamp && (
            <div className="flex items-center gap-1.5 rounded border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-mono text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-amber-400/80" />
              <span>{formatRecordedDate(earliestTimestamp)}</span>
            </div>
          )}

          {onlyLocation?.has_coordinates && (
            <div className="flex items-center gap-1.5 rounded border border-cyan-900/40 bg-slate-900/80 px-2.5 py-1 font-mono text-xs text-cyan-300/90">
              <Compass className="h-3.5 w-3.5 text-cyan-400" />
              <span>X: {onlyLocation.x} / Y: {onlyLocation.y} / Z: {onlyLocation.z}</span>
            </div>
          )}

          {companions.length > 0 && (
            <div className="flex max-w-full items-center gap-1.5 rounded border border-amber-500/20 bg-[#141b27] px-2.5 py-1 text-xs text-amber-200/90">
              <Users className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="break-words">同行：{companions.join('、')}</span>
            </div>
          )}
        </div>

        <p className="mt-5 max-w-4xl text-sm leading-[1.9] text-slate-200/95 sm:text-[15.5px]">
          {linkedText(chronicle.introduction, locationLinks)}
        </p>
      </header>

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
            onClick={() => setIsMobileTocOpen(true)}
            onMouseEnter={playHoverSound}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/25"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>章を見る</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 pt-6 sm:px-8 sm:pt-8 lg:flex-row lg:gap-12">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 rounded-2xl border border-amber-500/20 bg-[#0d1420]/90 p-5 shadow-xl backdrop-blur-md">
            <div className="gildas-cinzel mb-4 flex items-center gap-2 border-b border-amber-500/20 pb-2 text-xs font-semibold tracking-wider text-amber-400">
              <BookOpen className="h-4 w-4" />
              <span>旅程マイルストーン</span>
            </div>
            <nav className="gildas-sans flex flex-col gap-2.5">
              {chronicle.chapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => selectChapter(chapter.id)}
                    onMouseEnter={playHoverSound}
                    className={`group flex items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-all ${isActive ? 'border-l-2 border-amber-400 bg-amber-500/20 font-semibold text-amber-200' : 'text-slate-400 hover:bg-slate-800/40 hover:text-amber-300'}`}
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
            <div className="mt-6 space-y-1.5 border-t border-slate-800 pt-4 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between"><span>総節数</span><span className="text-amber-400">{chronicle.chapters.length} 節</span></div>
              <div className="flex justify-between"><span>記録写真</span><span className="text-amber-400">{photos.length} 枚</span></div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {heroPhoto ? (
            <figure className="gildas-photo group mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0e1624] shadow-2xl sm:mb-10">
              <button type="button" onClick={() => setPhotoIndex(0)} className="block w-full overflow-hidden text-left">
                <img src={heroPhoto.url} alt={heroPhoto.alt} className="aspect-[16/9] w-full object-cover" />
              </button>
              <figcaption className="gildas-sans flex items-center justify-between gap-2 border-t border-amber-500/20 bg-[#0c1320] p-3 text-xs text-amber-200/90 sm:p-4">
                <span className="min-w-0 break-words font-medium">{heroPhoto.title}</span>
                <span className="shrink-0 font-mono text-[10px] text-slate-400 sm:text-[11px]">旅の記憶 01</span>
              </figcaption>
            </figure>
          ) : (
            <div className="mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#101928] to-[#0a101b] p-6 text-center">
              <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-400">
                <Feather className="h-5 w-5" />
              </div>
              <p className="gildas-cinzel text-xs uppercase tracking-[0.18em] text-amber-300">The Traveler&apos;s Inscribed Chronicle</p>
              <p className="mt-1 text-xs text-slate-400">――写真がなくとも、残された言葉から旅路は編まれてゆく。</p>
            </div>
          )}

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
                    {linkedText(chapter.keyMoment, locationLinks)}
                  </div>
                )}

                <div className="space-y-4 text-[15px] leading-[1.9] text-slate-200 sm:text-[16.5px]">
                  {chapter.paragraphs.map((paragraph, index) => (
                    <p key={index} className="break-words sm:text-justify sm:indent-4">{linkedText(paragraph, locationLinks)}</p>
                  ))}
                </div>

                {(chapterPhotos.get(chapterIndex) ?? []).map((photo) => {
                  const index = photos.findIndex((item) => item.id === photo.id);
                  return (
                    <figure key={photo.id} className="gildas-photo group my-7 overflow-hidden rounded-xl border border-amber-500/30 bg-[#0e1624] shadow-lg sm:my-8">
                      <button type="button" onClick={() => setPhotoIndex(index)} className="block w-full overflow-hidden text-left">
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
                    <span>{linkedText(chapter.bardMarginalia, locationLinks)}</span>
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
                <p className="text-sm leading-relaxed text-slate-200 sm:text-[15px]">{linkedText(chronicle.gildasComment.commentary, locationLinks)}</p>
                <div className="gildas-sans mt-6 flex flex-col justify-between gap-2 border-t border-amber-500/20 pt-4 text-xs text-amber-300/80 sm:flex-row sm:items-center">
                  <div><span className="font-bold text-white">老吟遊詩人 ギルダス</span><span className="ml-2 text-slate-400">（古代伝承編纂官）</span></div>
                  {chronicle.gildasComment.epilogueNote && <span className="text-slate-400">{chronicle.gildasComment.epilogueNote}</span>}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {isMobileTocOpen && (
        <div className="fixed inset-0 z-[220] flex flex-col justify-end lg:hidden">
          <button type="button" aria-label="目次を閉じる" onClick={() => setIsMobileTocOpen(false)} className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
          <div className="gildas-mobile-toc-sheet relative z-10 flex max-h-[78vh] w-full flex-col overflow-hidden rounded-t-3xl border-t border-amber-500/40 bg-[#0c1322] pb-[env(safe-area-inset-bottom,1rem)] shadow-2xl">
            <div className="flex flex-col gap-2 border-b border-amber-500/20 px-5 pb-2 pt-3">
              <div className="mx-auto h-1 w-10 rounded-full bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="gildas-cinzel flex items-center gap-2 text-xs font-bold tracking-wider text-amber-400"><Bookmark className="h-4 w-4" /><span>旅程マイルストーン</span></div>
                <button type="button" onClick={() => setIsMobileTocOpen(false)} aria-label="目次を閉じる" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
            </div>
            <div className="space-y-2 overflow-y-auto px-4 py-3">
              {chronicle.chapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                return (
                  <button key={chapter.id} type="button" onClick={() => selectChapter(chapter.id)} className={`flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left transition-all ${isActive ? 'border-amber-400/60 bg-amber-500/20 font-bold text-amber-100' : 'border-slate-800 bg-[#10192a]/80 text-slate-300'}`}>
                    <div className="flex min-w-0 items-center gap-2.5"><span className="gildas-cinzel shrink-0 text-xs font-bold text-amber-400">第{chapter.numeral}節</span><span className="truncate text-xs">{chapter.title}</span></div>
                    {isActive && <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/80 px-2 py-0.5 text-[10px] text-amber-300"><CheckCircle2 className="h-3 w-3" />読書中</span>}
                  </button>
                );
              })}
            </div>
            <div className="gildas-sans flex items-center justify-between border-t border-slate-800 bg-[#090e18] p-3 text-xs text-slate-400">
              <span className="text-[11px]">全 {chronicle.chapters.length} 節 / 写真 {photos.length} 枚</span>
              <button type="button" onClick={() => setIsMobileTocOpen(false)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-200">閉じる</button>
            </div>
          </div>
        </div>
      )}

      {photoIndex !== null && (
        <GildasPhotoModal
          photos={photos}
          currentIndex={photoIndex}
          onClose={() => setPhotoIndex(null)}
          onNavigate={setPhotoIndex}
        />
      )}
    </article>
  );
}
