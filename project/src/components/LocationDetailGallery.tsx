import type { ComponentType } from 'react';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playHoverSound } from '@/lib/sound';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationDetailGalleryProps = {
  location: LocationWithPhotos;
  activePhotoIdx: number;
  onActivePhotoChange: (index: number) => void;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationDetailGallery({
  location,
  activePhotoIdx,
  onActivePhotoChange,
  PhotoImage,
}: LocationDetailGalleryProps) {
  const photos = location.photos ?? [];
  const currentPhoto = photos[activePhotoIdx] ?? photos[0];

  if (!currentPhoto) return null;

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video sm:aspect-[16/10] max-h-[360px] rounded-lg overflow-hidden bg-[#0B1018] border border-[#1E293B]">
        <PhotoImage
          storagePath={currentPhoto.storage_path}
          alt={location.name}
          className="w-full h-full object-cover"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => onActivePhotoChange(activePhotoIdx > 0 ? activePhotoIdx - 1 : photos.length - 1)}
              onMouseEnter={playHoverSound}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
              aria-label="前の写真"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onActivePhotoChange(activePhotoIdx < photos.length - 1 ? activePhotoIdx + 1 : 0)}
              onMouseEnter={playHoverSound}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
              aria-label="次の写真"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#0B1018]/90 text-[10px] font-mono text-[#06B6D4] border border-[#06B6D4]/30">
              {activePhotoIdx + 1} / {photos.length}
            </div>
          </>
        )}

        {location.is_checkpoint && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#F59E0B]/90 text-[#0B1018] text-[10px] font-mono font-black border border-[#FDE68A] flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>CHECKPOINT</span>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => onActivePhotoChange(index)}
              onMouseEnter={playHoverSound}
              className={`relative w-14 h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${
                activePhotoIdx === index
                  ? 'border-[#F59E0B] scale-105'
                  : 'border-[#334155] opacity-60 hover:opacity-100'
              }`}
              aria-label={`写真 ${index + 1} を表示`}
            >
              <PhotoImage storagePath={photo.storage_path} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
