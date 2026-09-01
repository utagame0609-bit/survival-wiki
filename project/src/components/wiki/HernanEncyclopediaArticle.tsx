import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, Calendar, MapPin, Users } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { parseStoredHernanArticle } from '@/lib/wikiHernan';
import { HernanArticleBody, renderHernanLinkedText, type HernanLocationLink } from '@/components/wiki/HernanArticleBody';
import { HernanDesktopTableOfContents, HernanMobileTableOfContents } from '@/components/wiki/HernanTableOfContents';
import { HernanImageViewer } from '@/components/wiki/HernanImageViewer';
import { formatHernanRecordedDate, useHernanPhotos } from '@/components/wiki/useHernanPhotos';

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
  locationLinks: HernanLocationLink[];
  logoSrc?: string;
}) {
  const article = useMemo(() => parseStoredHernanArticle(content), [content]);
  const photos = useHernanPhotos(locations, world.name);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('');
  const articleRef = useRef<HTMLElement | null>(null);

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

  if (!article) return null;

  const onlyLocation = locations.length === 1 ? locations[0] : null;
  const earliestTimestamp = locations.map((location) => location.created_at).filter(Boolean).sort()[0];
  const companions = Array.from(new Set(locations.flatMap((location) => location.members.map((member) => member.name)).filter(Boolean)));

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
            {earliestTimestamp && <span>記録起点: {formatHernanRecordedDate(earliestTimestamp)}</span>}
            <span className="text-neutral-300">•</span>
            <span>記録地点: {locations.length}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1280px] px-3.5 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="lg:grid lg:grid-cols-[210px_minmax(0,1fr)] lg:items-start lg:gap-8">
          <HernanDesktopTableOfContents
            sections={article.sections}
            activeSectionId={activeSectionId}
            onSelectSection={goToSection}
          />

          <div className="min-w-0">
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
              {earliestTimestamp && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatHernanRecordedDate(earliestTimestamp)}</span>}
              {companions.length > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />同行：{companions.join('、')}</span>}
            </div>

            <p className="mb-5 text-left text-[15.5px] leading-[1.85] text-neutral-900 sm:text-[16px]">
              {renderHernanLinkedText(article.leadParagraph, locationLinks)}
            </p>

            <HernanMobileTableOfContents
              sections={article.sections}
              open={mobileTocOpen}
              onToggle={() => setMobileTocOpen((current) => !current)}
              onSelectSection={goToSection}
            />
          </div>
        </div>

        <HernanArticleBody
          article={article}
          photos={photos}
          narratorLine={narratorLine}
          locationLinks={locationLinks}
          onOpenPhoto={setSelectedPhoto}
        />
      </div>

      <HernanImageViewer
        photos={photos}
        selectedIndex={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onSelectIndex={setSelectedPhoto}
      />
    </article>
  );
}
