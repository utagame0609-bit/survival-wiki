import { Clock, MapPin, Share2, Shield, Users, Youtube } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playHoverSound, playRecordSelectSound } from '@/lib/sound';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

type Props = {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onSelect: (location: LocationWithPhotos) => void;
  onOpenSns?: (location: LocationWithPhotos) => void;
};

export function TimelineRecordCard({ world, location, onSelect, onOpenSns }: Props) {
  const primaryPhoto = location.photos[0]?.storage_path;
  const memberNames = (location.member_ids ?? [])
    .map((id) => world.members.find((member) => member.id === id)?.name)
    .filter(Boolean) as string[];
  const timeStr = new Date(location.created_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const selectLocation = () => {
    playRecordSelectSound();
    onSelect(location);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={selectLocation}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectLocation();
        }
      }}
      onMouseEnter={playHoverSound}
      className="group relative flex cursor-pointer items-start gap-3.5 rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-3 shadow-md outline-none transition-all duration-200 hover:border-[#F59E0B]/60 hover:bg-[#131E35] focus-visible:border-[#F59E0B]/60 sm:p-3.5"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded border border-[#334155] bg-[#0B1018] sm:h-24 sm:w-24">
        {primaryPhoto ? (
          <LocationPhotoImage
            storagePath={primaryPhoto}
            alt={location.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#64748B]">
            <MapPin className="h-6 w-6 stroke-[1.5]" />
            <span className="mt-1 font-mono text-[9px]">NO PIC</span>
          </div>
        )}
        {location.photos.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded border border-[#06B6D4]/40 bg-[#0B1018]/80 px-1 text-[9px] font-mono text-[#06B6D4]">
            +{location.photos.length - 1}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 font-mono text-[11px] text-[#64748B]">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex shrink-0 items-center gap-1 text-[#06B6D4]">
                <Clock className="h-3 w-3" />{timeStr}
              </span>
              {location.is_checkpoint && (
                <span className="flex shrink-0 items-center gap-0.5 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-1 text-[9px] text-[#F59E0B]">
                  <Shield className="h-2.5 w-2.5" />CP
                </span>
              )}
              {location.youtube_url && (
                <span className="shrink-0 rounded bg-red-600/90 px-1 text-[9px] font-bold text-white">
                  <Youtube className="mr-0.5 inline h-2.5 w-2.5" />VIDEO
                </span>
              )}
            </div>

            {onOpenSns && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenSns(location);
                }}
                onMouseEnter={playHoverSound}
                className="shrink-0 rounded border border-[#06B6D4]/30 bg-[#0B1018]/60 p-1 text-[#06B6D4] transition-colors hover:bg-[#06B6D4] hover:text-[#0B1018]"
                title="X共有"
                aria-label="X共有"
              >
                <Share2 className="h-3 w-3" />
              </button>
            )}
          </div>

          <h4 className="game-ui-font line-clamp-1 text-sm font-bold leading-snug text-[#F1F5F9] transition-colors group-hover:text-[#FDE68A] sm:text-base">
            {location.name}
          </h4>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
            {location.detail_memo || '（メモ未入力）'}
          </p>
        </div>

        {memberNames.length > 0 && (
          <div className="mt-2 flex items-center gap-1 font-mono text-[10px] text-[#64748B]">
            <Users className="h-2.5 w-2.5 shrink-0 text-[#06B6D4]" />
            <span className="truncate">同行: {memberNames.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
