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
  if (locations.length === 0) return null;

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
