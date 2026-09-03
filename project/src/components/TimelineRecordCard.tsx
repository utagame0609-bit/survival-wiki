import { Clock, MapPin, Share2, Shield, Users, Youtube } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playHoverSound, playRecordSelectSound } from '@/lib/sound';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

export type TimelineRecordCardProps = {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onSelect: (location: LocationWithPhotos) => void;
  onOpenSns?: (location: LocationWithPhotos) => void;
};

export function TimelineRecordCard({ world, location, onSelect, onOpenSns }: TimelineRecordCardProps) {
  const primaryPhoto = location.photos[0]?.storage_path;
  const memberNames = location.members.map((member) => member.name).filter(Boolean);

  const timeStr = location.created_at
    ? new Date(location.created_at).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

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
      className="sfc-record-card group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-lg border border-[#1E293B] bg-[#0B1018]/80 p-3 shadow-sm outline-none transition-all duration-200 hover:border-[#F59E0B]/40 focus-visible:border-[#F59E0B] sm:flex-row sm:items-stretch sm:gap-4"
    >
      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded border border-[#334155] bg-slate-800 sm:h-24 sm:w-24">
        {primaryPhoto ? (
          <>
            <LocationPhotoImage
              storagePath={primaryPhoto}
              alt={location.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-[#06B6D4]/10 mix-blend-overlay" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-[#475569]">
            <MapPin className="h-5 w-5 stroke-[1.5]" />
            <span className="mt-1 font-mono text-[8px] uppercase tracking-wider">
              {location.has_coordinates ? `X:${location.x}` : 'NO PIC'}
            </span>
          </div>
        )}

        {location.photos.length > 1 && (
          <span className="absolute bottom-1 right-1 rounded border border-[#06B6D4]/40 bg-[#0B1018]/90 px-1 py-0.2 font-mono text-[8px] font-bold text-[#06B6D4]">
            +{location.photos.length - 1}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex min-w-0 flex-1 flex-col justify-between py-0.5 sm:mt-0">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-[#06B6D4]">
                <Clock className="h-3 w-3" />
                {timeStr}
              </span>

              {location.is_checkpoint && (
                <span className="rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-1 font-mono text-[9px] text-[#F59E0B]">
                  CP
                </span>
              )}

              {location.youtube_url && (
                <span className="rounded border border-red-600/40 bg-red-600/20 px-1 font-mono text-[9px] uppercase font-bold text-red-500">
                  VIDEO
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
                className="text-[#64748B] transition-colors hover:text-[#06B6D4]"
                title="X共有"
                aria-label="X共有"
              >
                <Share2 className="h-3 w-3" />
              </button>
            )}
          </div>

          <h4 className="mt-1 text-sm font-bold text-[#F1F5F9] transition-colors group-hover:text-[#FDE68A]">
            {location.name}
          </h4>

          <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-[#94A3B8]">
            {location.detail_memo || '探索メモなし'}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#1E293B] pt-1.5 font-mono text-[9px] text-[#64748B]">
          <div className="flex min-w-0 items-center gap-1">
            <Users className="h-2.5 w-2.5 shrink-0" />
            <span className="truncate">
              {memberNames.length > 0 ? `WITH: ${memberNames.join(', ').toUpperCase()}` : 'WITH: —'}
            </span>
          </div>

          {location.has_coordinates && (
            <span className="hidden shrink-0 font-mono text-[9px] text-[#475569] sm:inline">
              COORD: {location.x}, {location.z}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
