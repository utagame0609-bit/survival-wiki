import { MapPin, X, ExternalLink } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playConfirmSound, playModalCloseSound, playHoverSound } from '@/lib/sound';
import { ChestFullImage } from '@/components/ChestFullImage';
import type { CollectionItem } from '@/components/locations/locationData';

type ChestPhotoDetailModalProps = {
  item: CollectionItem;
  onClose: () => void;
  onOpenLocation: (location: LocationWithPhotos) => void;
};

export function ChestPhotoDetailModal({ item, onClose, onOpenLocation }: ChestPhotoDetailModalProps) {
  const close = () => {
    playModalCloseSound();
    onClose();
  };

  const openLocation = () => {
    playConfirmSound();
    onClose();
    onOpenLocation(item.location);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-mono"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="relative max-w-2xl w-full bg-[#1e2330] border-2 border-amber-500 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#161a24] border-b border-[#2d3548]">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-sm sm:text-base text-white truncate">{item.location.name}</span>
          </div>
          <button
            type="button"
            onClick={close}
            onMouseEnter={playHoverSound}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            aria-label="写真を閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <ChestFullImage storagePath={item.storagePath} alt={item.location.name} />
          <div className="mt-3 p-3 bg-[#141824] border border-[#2d3548] text-xs font-mono">
            <div className="flex items-center justify-between gap-3 text-emerald-400 font-bold">
              <span>POS: X:{item.location.x} Y:{item.location.y} Z:{item.location.z}</span>
              <span className="text-slate-400 shrink-0">{new Date(item.location.created_at).toLocaleDateString('ja-JP')}</span>
            </div>
            {item.location.detail_memo && (
              <p className="mt-2 text-slate-200 leading-relaxed border-t border-[#2d3548] pt-2 font-sans text-xs sm:text-sm">
                {item.location.detail_memo}
              </p>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={openLocation}
              onMouseEnter={playHoverSound}
              className="min-h-[44px] px-4 py-2 bg-amber-500 text-black font-black border-b-2 border-amber-700 hover:bg-amber-400 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 stroke-[3]" />
              <span>この拠点詳細を開く</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
