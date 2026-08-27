import type { ComponentType } from 'react';
import { MapPin } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playHoverSound } from '@/lib/sound';
import { LocationCoordinates } from '@/components/LocationCoordinates';
import { LocationDetailInfo } from '@/components/LocationDetailInfo';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationDetailModalProps = {
  location: LocationWithPhotos;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationDetailModal({ location, onClose, onEdit, onDelete, PhotoImage }: LocationDetailModalProps) {
  const mainPhoto = location.photos.find((p) => p.is_main);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm text-xs sm:text-sm font-sans">
      <button aria-label="閉じる" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <h2 className="text-base font-bold text-white truncate">{location.name}</h2>
          </div>
          <button type="button" onClick={onClose} onMouseEnter={playHoverSound} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer" aria-label="閉じる">×</button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {mainPhoto ? (
            <div className="w-full h-36 sm:h-44 overflow-hidden bg-[#12151f] border border-[#2d3548]">
              <PhotoImage storagePath={mainPhoto.storage_path} alt={location.name} className="w-full h-full object-cover pixelated" />
            </div>
          ) : null}

          <LocationCoordinates location={location} />
          <LocationDetailInfo location={location} />
        </div>

        <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-t border-[#2d3548] flex items-center justify-end gap-2">
          <button type="button" onClick={onEdit} onMouseEnter={playHoverSound} className="min-h-[40px] px-3.5 py-2 bg-[#12151f] text-slate-200 border border-slate-700 hover:border-amber-500 hover:text-amber-400 font-bold text-xs cursor-pointer">編集</button>
          <button type="button" onClick={onDelete} onMouseEnter={playHoverSound} className="min-h-[40px] px-3.5 py-2 bg-red-950/50 text-red-300 border border-red-800 hover:bg-red-900/60 font-bold text-xs cursor-pointer">削除</button>
        </div>
      </div>
    </div>
  );
}
