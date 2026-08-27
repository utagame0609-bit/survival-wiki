import type { LocationWithPhotos } from '@/lib/types';
import { LocationCard } from '@/components/LocationCard';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { playRecordSelectSound } from '@/lib/sound';

export function LocationsGrid({
  locations,
  onSelect,
}: {
  locations: LocationWithPhotos[];
  onSelect: (location: LocationWithPhotos) => void;
}) {
  if (locations.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location, index) => (
        <LocationCard
          key={location.id}
          index={index + 1}
          location={location}
          onSelect={() => {
            playRecordSelectSound();
            onSelect(location);
          }}
          PhotoImage={LocationPhotoImage}
        />
      ))}
    </div>
  );
}
