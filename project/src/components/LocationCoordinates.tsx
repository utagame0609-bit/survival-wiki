import type { LocationWithPhotos } from '@/lib/types';

type LocationCoordinatesProps = {
  location: LocationWithPhotos;
};

export function LocationCoordinates({ location }: LocationCoordinatesProps) {
  if (!location.has_coordinates) {
    return (
      <div className="p-3.5 bg-[#12151f] border border-slate-700 text-center">
        <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">COORDINATES</div>
        <div className="mt-1 text-sm font-bold text-slate-500 font-mono">座標未入力</div>
      </div>
    );
  }

  return (
    <div className="p-3.5 bg-[#12151f] border border-slate-700 flex items-center justify-around text-center">
      <div>
        <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">X COORDINATE</div>
        <div className="text-base font-bold text-emerald-400 font-mono">{location.x}</div>
      </div>
      <div className="h-7 w-px bg-slate-700" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Y ELEVATION</div>
        <div className="text-base font-bold text-emerald-400 font-mono">{location.y}</div>
      </div>
      <div className="h-7 w-px bg-slate-700" />
      <div>
        <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Z COORDINATE</div>
        <div className="text-base font-bold text-cyan-300 font-mono">{location.z}</div>
      </div>
    </div>
  );
}
