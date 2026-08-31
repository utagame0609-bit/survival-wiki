import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpen,
  Calendar,
  Compass,
  Feather,
  MapPin,
  Users,
} from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { parseStoredGildasChronicle } from '@/lib/wikiGildas';
import { GildasPhotoModal } from '@/components/wiki/GildasPhotoModal';
import { GildasDesktopJourneyNavigation, GildasMobileChapterNavigation } from '@/components/wiki/GildasChapterNavigation';
import { GildasArticleBody, renderGildasLinkedText, type GildasLocationLink } from '@/components/wiki/GildasArticleBody';
import { formatGildasRecordedDate, useGildasPhotos } from '@/components/wiki/useGildasPhotos';
import '@/wikiGildasChronicle.css';

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
  locationLinks: GildasLocationLink[];
}) {
  const chronicle = useMemo(() => parseStoredGildasChronicle(content), [content]);
  const [activeChapterId, setActiveChapterId] = useState('');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const photos = useGildasPhotos(locations, world.name);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const [heroHeight, setHeroHeight] = useState<number | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const heroFigureRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setActiveChapterId(chronicle?.chapters[0]?.id ?? '');
  }, [chronicle]);

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

  useEffect(() => {
    const element = heroFigureRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      setHeroHeight(null);
      return;
    }
    const updateHeight = () => setHeroHeight(Math.round(element.getBoundingClientRect().height));
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, [photos]);

  if (!chronicle) return null;

  const firstLocation = locations[0] ?? null;
  const onlyLocation = locations.length === 1 ? firstLocation : null;
  const earliestTimestamp = locations
    .map((location) => location.created_at)
    .filter(Boolean)
    .sort()[0];
  const companions = Array.from(new Set(locations.flatMap((location) => location.members.map((member) => member.name)).filter(Boolean)));
  const heroPhoto = photos[0];

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
              <span>{formatGildasRecordedDate(earliestTimestamp)}</span>
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
          {renderGildasLinkedText(chronicle.introduction, locationLinks)}
        </p>
      </header>

      <GildasMobileChapterNavigation
        chapters={chronicle.chapters}
        activeChapterId={activeChapterId}
        photoCount={photos.length}
        isOpen={isMobileTocOpen}
        onOpen={() => setIsMobileTocOpen(true)}
        onClose={() => setIsMobileTocOpen(false)}
        onSelectChapter={selectChapter}
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-6 sm:px-8 sm:pt-8">
        <div className="lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-12">
          <GildasDesktopJourneyNavigation
            chapters={chronicle.chapters}
            activeChapterId={activeChapterId}
            photoCount={photos.length}
            heroHeight={heroHeight}
            onSelectChapter={selectChapter}
          />

          <div className="min-w-0">
            {heroPhoto ? (
              <figure ref={heroFigureRef} className="gildas-photo group mb-8 overflow-hidden rounded-2xl border border-amber-500/30 bg-[#0e1624] shadow-2xl sm:mb-10 lg:mb-0">
                <button type="button" onClick={() => setPhotoIndex(0)} className="block w-full overflow-hidden text-left">
                  <img src={heroPhoto.url} alt={heroPhoto.alt} className="aspect-[16/9] w-full object-cover" />
                </button>
                <figcaption className="gildas-sans flex items-center justify-between gap-2 border-t border-amber-500/20 bg-[#0c1320] p-3 text-xs text-amber-200/90 sm:p-4">
                  <span className="min-w-0 break-words font-medium">{heroPhoto.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-slate-400 sm:text-[11px]">旅の記憶 01</span>
                </figcaption>
              </figure>
            ) : (
              <div ref={heroFigureRef as React.RefObject<HTMLDivElement>} className="mb-8 overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#101928] to-[#0a101b] p-6 text-center sm:mb-10 lg:mb-0">
                <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10 text-amber-400">
                  <Feather className="h-5 w-5" />
                </div>
                <p className="gildas-cinzel text-xs uppercase tracking-[0.18em] text-amber-300">The Traveler&apos;s Inscribed Chronicle</p>
                <p className="mt-1 text-xs text-slate-400">――写真がなくとも、残された言葉から旅路は編まれてゆく。</p>
              </div>
            )}
          </div>
        </div>

        <GildasArticleBody
          chronicle={chronicle}
          photos={photos}
          narratorLine={narratorLine}
          locationLinks={locationLinks}
          onOpenPhoto={setPhotoIndex}
        />
      </div>

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
