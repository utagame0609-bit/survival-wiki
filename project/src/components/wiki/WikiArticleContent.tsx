import { BookOpen } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ScpDossierArticle } from '@/components/wiki/ScpDossierArticle';
import { GildasChronicleArticle } from '@/components/wiki/GildasChronicleArticle';
import { HernanEncyclopediaArticle } from '@/components/wiki/HernanEncyclopediaArticle';

type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';

type LocationLink = {
  name: string;
  onClick: () => void;
};

const styleShortTitle: Record<WikiStyleId, string> = {
  wikipedia: '百科事典',
  scp: 'SCP報告',
  ancient: '古代伝承',
};

export function WikiArticleContent({
  style,
  world,
  locations,
  parsedContent,
  articleWithPhotos,
  mainPhotoUrl,
  narratorLine,
  locationLinks,
  isStructuredGildas,
  isStructuredHernan,
}: {
  style: WikiStyleId;
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  parsedContent: string;
  articleWithPhotos: string;
  mainPhotoUrl: string | null;
  narratorLine: string;
  locationLinks: LocationLink[];
  isStructuredGildas: boolean;
  isStructuredHernan: boolean;
}) {
  return (
    <section className="hud-bracket min-w-0 max-w-full overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl">
      <div className="border-b border-[#1E293B] bg-[#0B1018] px-4 py-2.5 sm:px-5">
        <div className="game-ui-font flex items-center gap-2 text-[10px] tracking-wider text-[#64748B] sm:text-xs">
          <BookOpen className="h-3.5 w-3.5 text-[#06B6D4]" />
          <span>ARCHIVED WIKI ARTICLE // {styleShortTitle[style]}</span>
        </div>
      </div>

      {style === 'scp' ? (
        <ScpDossierArticle
          world={world}
          locations={locations}
          content={articleWithPhotos}
          mainPhotoUrl={mainPhotoUrl}
          narratorLine={narratorLine}
          locationLinks={locationLinks}
        />
      ) : isStructuredGildas ? (
        <GildasChronicleArticle
          world={world}
          locations={locations}
          content={parsedContent}
          narratorLine={narratorLine}
          locationLinks={locationLinks}
        />
      ) : isStructuredHernan ? (
        <HernanEncyclopediaArticle
          world={world}
          locations={locations}
          content={parsedContent}
          narratorLine={narratorLine}
          locationLinks={locationLinks}
        />
      ) : style === 'wikipedia' ? (
        <article className="mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border border-[#a2a9b1] bg-white text-[#202122] sm:mx-4">
          <div className="flex min-w-0 items-center gap-3 border-b border-[#c8ccd1] px-4 py-3 sm:px-6">
            {mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="h-10 w-10 shrink-0 border border-[#c8ccd1] object-cover" />}
            <div className="min-w-0">
              <div className="truncate font-serif text-lg sm:text-2xl">ウタペディア</div>
              <div className="truncate text-[10px] text-[#54595d]">Survival Wiki // {world.name}</div>
            </div>
          </div>
          <div className="grid min-w-0 max-w-full grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="min-w-0 max-w-full overflow-x-hidden">
              <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} />
            </div>
            <aside className="h-fit min-w-0 border border-[#c8ccd1] bg-[#f8f9fa] p-3 text-sm">
              <div className="border-b border-[#c8ccd1] pb-2 font-semibold">基本情報</div>
              <div className="mt-2 space-y-2">
                <div><b>名称</b><div className="break-words">{world.name}</div></div>
                <div><b>プレイヤー</b><div className="break-words">{world.player ?? '不明'}</div></div>
                <div><b>記録地点</b><div>{locations.length}</div></div>
                <div><b>参加メンバー</b><div>{world.members.length}</div></div>
              </div>
            </aside>
          </div>
        </article>
      ) : (
        <article className="mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border-2 border-orange-500/60 bg-[#160e09] p-4 text-[#ead8bf] sm:mx-4 sm:p-6">
          <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} className="font-serif" />
        </article>
      )}
    </section>
  );
}
