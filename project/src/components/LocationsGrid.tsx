import { MapPin } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LocationWithPhotos } from '@/lib/types';
import { LocationCard } from '@/components/LocationCard';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationsGridProps = {
  locations: LocationWithPhotos[];
  onSelect: (location: LocationWithPhotos) => void;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationsGrid({ locations, onSelect, PhotoImage }: LocationsGridProps) {
  if (locations.length === 0) {
    return (
      <div className="py-14 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6">
        <MapPin className="w-10 h-10 mx-auto text-slate-500 mb-3" />
        <p className="text-sm font-bold text-white">該当するロケーションが見つかりません</p>
        <p className="text-xs text-slate-400 mt-1">検索条件を変更してください。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location, index) => (
        <LocationCard
          key={location.id}
          index={index + 1}
          location={location}
          onSelect={() => onSelect(location)}
          PhotoImage={PhotoImage}
        />
      ))}
    </div>
  );
}
