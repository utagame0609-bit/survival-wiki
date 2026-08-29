import { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playHoverSound } from '@/lib/sound';

type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

type ChestPhotoCardProps = {
  item: CollectionItem;
  onClick: () => void;
};

export function ChestPhotoCard({ item, onClick }: ChestPhotoCardProps) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    getPhotoUrl(item.storagePath)
      .then((url) => {
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : null;
        setSrc(url);
      })
      .catch(() => setSrc(''));

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.storagePath]);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={playHoverSound}
      className="group relative w-full overflow-hidden text-left bg-[#141824] border-2 border-[#2d3548] hover:border-amber-400 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer"
    >
      <div className="w-full aspect-video bg-[#12151f] overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={item.location.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pixelated"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <Camera className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="p-2.5 bg-[#161a24] border-t border-[#2d3548]">
        <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">{item.location.name}</div>
        <div className="text-[10px] text-emerald-400 font-mono mt-0.5 font-bold">
          X:{item.location.x} Z:{item.location.z}
        </div>
      </div>
    </button>
  );
}
