import type { ReactNode } from 'react';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';

type WikiGeneratedArticleProps = {
  world: WorldWithMembers;
  article: string | null;
  articleWithPhotoMarkers: string;
  locationCount: number;
  locations: LocationWithPhotos[];
  mainPhotoUrl: string | null;
  locationLinks: { name: string; onClick: () => void }[];
  actionButtons: ReactNode;
};

export function WikiGeneratedArticle({
  world,
  articleWithPhotoMarkers,
  locationCount,
  locations,
  mainPhotoUrl,
  locationLinks,
  actionButtons,
}: WikiGeneratedArticleProps) {
  return (
    <div className="min-h-screen bg-white text-[#202122]">
      <header className="w-full bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-4">
          <img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="h-14 w-14 rounded-full object-cover border border-[#a2a9b1]" />
          <div>
            <div className="font-serif text-[30px] leading-none font-normal tracking-tight">ウタペディア</div>
            <div className="font-serif text-[13px] leading-tight text-[#54595d] mt-1">Survival Wiki</div>
          </div>
        </div>
      </header>

      <article className="w-full bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mt-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8">
            <div className="min-w-0 h-[calc(100vh-150px)]">
              <MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} />
            </div>
            <aside className="border border-[#a2a9b1] bg-[#f8f9fa] p-3 h-fit text-sm">
              {mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="w-full aspect-[4/3] object-cover border border-[#c8ccd1] mb-3" />}
              <div className="border-b border-[#c8ccd1] pb-2 font-semibold text-base">基本情報</div>
              <div className="mt-3 divide-y divide-[#c8ccd1]">
                <div className="py-2"><span className="font-semibold">名称</span><div className="mt-1">{world.name}</div></div>
                <div className="py-2"><span className="font-semibold">プレイヤー</span><div className="mt-1">{world.player ?? '不明'}</div></div>
                <div className="py-2"><span className="font-semibold">記録地点</span><div className="mt-1">{locationCount}</div></div>
                <div className="py-2"><span className="font-semibold">参加メンバー</span><div className="mt-1">{world.members.length}</div></div>
                <div className="py-2"><span className="font-semibold">記録開始</span><div className="mt-1">{new Date(world.created_at).toLocaleDateString('ja-JP')}</div></div>
              </div>
              {locations.length > 0 && (
                <div className="mt-4 border-t border-[#c8ccd1] pt-3">
                  <div className="font-semibold text-base mb-2">関連ロケーション</div>
                  <div className="space-y-1.5">
                    {locations.map((location) => (
                      <button
                        type="button"
                        key={location.id}
                        onClick={() => locationLinks.find((item) => item.name === location.name)?.onClick()}
                        className="w-full text-left py-1.5 border-b border-[#eaecf0] last:border-b-0 hover:bg-[#eaecf0] rounded-sm px-1 transition-colors"
                      >
                        <div className="font-medium text-[#36c]">{location.name}</div>
                        <div className="text-xs text-[#54595d] font-mono">X {location.x} / Y {location.y} / Z {location.z}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </article>
      {actionButtons}
    </div>
  );
}
