import type { ComponentType } from 'react';
import { MapPin } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationCardMediaProps = {
  location: LocationWithPhotos;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationCardMedia({ location, PhotoImage }: LocationCardMediaProps) {
  const mainPhoto = location.photos.find((p) => p.is_main) || location.photos[0];

  return mainPhoto ? (
    <div className="w-full h-36 mb-3 overflow-hidden bg-[#12151f] border border-[#2d3548]">
      <PhotoImage
        storagePath={mainPhoto.storage_path}
        alt={location.name}
        className="w-full h-full object-cover pixelated group-hover:scale-105 transition-transform duration-300"
      />
    </div>
  ) : (
    <div className="w-full h-36 mb-3 overflow-hidden bg-[#12151f] border border-[#2d3548] flex items-center justify-center">
      <MapPin className="w-10 h-10 text-slate-600" />
    </div>
  );
}
