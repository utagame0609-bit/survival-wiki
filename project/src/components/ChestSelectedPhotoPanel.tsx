import { ArrowRight, Clock, MapPin, Shield, Sparkles } from 'lucide-react';
import { ChestFullImage } from '@/components/ChestFullImage';
import type { CollectionItem } from '@/lib/chestCollection';
import { isCheckpointCollectionLocation } from '@/lib/chestCollection';
import { playHoverSound } from '@/lib/sound';

type ChestSelectedPhotoPanelProps = {
  selectedPhoto: CollectionItem;
  selectedIndex: number;
  totalCount: number;
  onOpenLocation: () => void;
};

export function ChestSelectedPhotoPanel({
  selectedPhoto,
  selectedIndex,
  totalCount,
  onOpenLocation,
}: ChestSelectedPhotoPanelProps) {
  return (
    <div className="space-y-3 lg:col-span-7">
      <div className="group relative aspect-video w-full overflow-hidden rounded-lg border-2 border-[#F59E0B]/50 bg-[#0B1018] shadow-[0_0_15px_rgba(245,158,11,0.15)] sm:aspect-[4/3]">
        <ChestFullImage storagePath={selectedPhoto.storagePath} alt={selectedPhoto.location.name} />

        <div className="game-ui-font absolute left-2 top-2 flex items-center gap-1 rounded border border-[#F59E0B]/40 bg-[#0B1018]/85 px-2 py-0.5 text-[10px] text-[#F59E0B]">
          <Sparkles className="h-2.5 w-2.5" />
          SELECTED PHOTO ({Math.max(selectedIndex, 0) + 1}/{totalCount})
        </div>

        {isCheckpointCollectionLocation(selectedPhoto.location) && (
          <div className="game-ui-font absolute right-2 top-2 flex items-center gap-1 rounded border border-[#F59E0B]/50 bg-[#F59E0B]/90 px-2 py-0.5 text-[10px] font-bold text-[#0B1018]">
            <Shield className="h-3 w-3" />
            CHECKPOINT
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-[#1E293B] bg-[#0B1018]/90 p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="game-ui-font mb-1 flex flex-wrap items-center gap-2 text-[10px] text-[#64748B]">
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5 text-[#06B6D4]" />
              {selectedPhoto.location.created_at.split('T')[0]}
            </span>
            <span className="flex items-center gap-0.5 text-[#94A3B8]">
              <MapPin className="h-2.5 w-2.5 text-[#F59E0B]" />
              {selectedPhoto.location.has_coordinates
                ? `X:${selectedPhoto.location.x} Y:${selectedPhoto.location.y} Z:${selectedPhoto.location.z}`
                : '座標未入力'}
            </span>
          </div>
          <h3 className="game-ui-font truncate text-sm font-bold text-[#F8FAFC]">
            {selectedPhoto.location.name}
          </h3>
          {selectedPhoto.location.detail_memo && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#94A3B8]">
              {selectedPhoto.location.detail_memo}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenLocation}
          onMouseEnter={playHoverSound}
          className="game-ui-font inline-flex shrink-0 items-center justify-center gap-1.5 rounded bg-[#F59E0B] px-3.5 py-2 text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_0_10px_rgba(245,158,11,0.25)] transition-all hover:bg-[#D97706] active:scale-95"
        >
          <span>記録詳細を見る</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
