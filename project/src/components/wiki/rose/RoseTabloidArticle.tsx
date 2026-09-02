import { useEffect, useMemo, useState } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { parseStoredMadameRoseArticle } from '@/lib/wikiRose';
import { NARRATOR_PORTRAITS } from '@/components/wiki/WikiNarrator';
import { RoseArticleShell } from './RoseArticleShell';
import { RoseMarkdownRenderer } from './RoseMarkdownRenderer';
import { RoseRelatedRecordModal } from './RoseRelatedRecordModal';
import { formatRoseRecordedDate, useRosePhotos } from './useRosePhotos';

type RoseLocationLink = {
  name: string;
  onClick: () => void;
};

type Props = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  content: string;
  narratorLine: string;
  locationLinks: RoseLocationLink[];
  portraitUrl?: string;
};

export function RoseTabloidArticle({
  world,
  locations,
  content,
  narratorLine,
  locationLinks,
  portraitUrl = NARRATOR_PORTRAITS.ancient,
}: Props) {
  const storedArticle = useMemo(() => parseStoredMadameRoseArticle(content), [content]);
  const photos = useRosePhotos(locations, world.name);
  const [isMobile, setIsMobile] = useState(false);
  const [relatedLocation, setRelatedLocation] = useState<LocationWithPhotos | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  if (!storedArticle) return null;

  const sortedTimestamps = locations
    .map((location) => location.created_at)
    .filter(Boolean)
    .sort();
  const recordedDate = formatRoseRecordedDate(sortedTimestamps[0]) || '記録日未設定';

  const article = {
    id: 'madame-rose-article',
    title: storedArticle.title,
    category: storedArticle.category,
    masthead: {
      volume: 'SURVIVAL WIKI',
      issueNumber: `${locations.length} RECORDS`,
      date: recordedDate,
    },
    portrait: {
      imageUrl: portraitUrl,
      name: 'マダム・ロゼ',
      roleTitle: '荒野酒場店主 / タブロイド編集長',
      caption: narratorLine.trim() || '記録は読んだよ。さて、どこから赤鉛筆を入れようかね。',
      badge: 'CHIEF EDITOR',
    },
    contentMarkdown: storedArticle.contentMarkdown,
    editorComment: {
      title: 'LAST CALL ── FROM THE EDITOR',
      message: storedArticle.editorComment.message,
      signature: 'Madame Rose',
      stampText: storedArticle.editorComment.stampText,
      subNotice: storedArticle.editorComment.subNotice,
      date: recordedDate,
    },
    tags: storedArticle.tags,
  };

  const roseLocationLinks = locations.map((location) => ({
    name: location.name,
    onClick: () => setRelatedLocation(location),
  }));

  return (
    <>
      <div className="bg-[#09090b] px-2 py-4 sm:px-4 sm:py-6">
        <RoseArticleShell
          article={article}
          isMobile={isMobile}
          body={(
            <RoseMarkdownRenderer
              content={storedArticle.contentMarkdown}
              photos={photos}
              locationLinks={roseLocationLinks.length > 0 ? roseLocationLinks : locationLinks}
            />
          )}
        />
      </div>

      {relatedLocation && (
        <RoseRelatedRecordModal
          worldId={world.id}
          location={relatedLocation}
          onClose={() => setRelatedLocation(null)}
        />
      )}
    </>
  );
}
