import type { ComponentType } from 'react';
import { ChevronRight, Compass } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playHoverSound } from '@/lib/sound';
import { LocationCardMedia } from '@/components/LocationCardMedia';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationCardProps = {
  location: LocationWithPhotos;
  index: number;
  onSelect: () => void;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationCard({ location, index, onSelect, PhotoImage }: LocationCardProps) {
  const locCode = String(index).padStart(2, '0');

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={playHoverSound}
      className="group relative text-left bg-[#1e2330] border-2 border-[#2d3548] hover:border-amber-500/80 p-4 flex flex-col justify-between transition-all duration-150 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer w-full"
    >
      <div className="w-full">
        <LocationCardMedia location={location} PhotoImage={PhotoImage} />

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 border border-cyan-500/40 shrink-0 font-mono">LOC_{locCode}</span>
            <h3 className="font-bold text-base text-white group-hover:text-amber-300 truncate">{location.name}</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">{new Date(location.created_at).toLocaleDateString('ja-JP')}</span>
        </div>

        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[#12151f] border border-slate-700 text-xs text-emerald-400 font-bold mb-3 font-mono">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>X: {location.x}</span>
          <span className="text-slate-600">|</span>
          <span>Y: {location.y}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">Z: {location.z}</span>
        </div>

        {location.detail_memo && (
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed mb-3 bg-[#141824]/80 p-2.5 border border-[#2d3548]">{location.detail_memo}</p>
        )}

        {location.members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {location.members.map((m) => (
              <span key={m.id} className="text-xs px-2 py-0.5 bg-[#12151f] border border-cyan-500/40 text-cyan-300 font-medium">@{m.name}</span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#2d3548] flex items-center justify-end text-xs text-slate-500">
        <span className="flex items-center gap-1 group-hover:text-amber-400 transition-colors">詳細を見る <ChevronRight className="w-4 h-4" /></span>
      </div>
    </button>
  );
}
