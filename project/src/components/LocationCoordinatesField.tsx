import { Compass } from 'lucide-react';
import { playInputFocusSound } from '@/lib/sound';

type LocationCoordinatesFieldProps = {
  value: string;
  error: string;
  onChange: (value: string) => void;
};

export function LocationCoordinatesField({ value, error, onChange }: LocationCoordinatesFieldProps) {
  return (
    <div>
      <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <Compass className="w-4 h-4" />
          <span>COORDINATES // 空間座標</span>
        </span>
        <span className="text-[10px] text-slate-500 font-normal">FORMAT: X Y Z</span>
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={playInputFocusSound}
        placeholder="100 64 -20"
        className="location-input text-base font-mono tabular-nums text-emerald-300 placeholder-slate-600"
      />
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
