import { Compass } from 'lucide-react';
import { playInputFocusSound } from '@/lib/sound';

type LocationBasicFieldsProps = {
  coordsText: string;
  coordsError: string;
  name: string;
  onCoordsChange: (value: string) => void;
  onNameChange: (value: string) => void;
};

export function LocationBasicFields({
  coordsText,
  coordsError,
  name,
  onCoordsChange,
  onNameChange,
}: LocationBasicFieldsProps) {
  return (
    <>
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
          value={coordsText}
          onChange={(event) => onCoordsChange(event.target.value)}
          onFocus={playInputFocusSound}
          placeholder="100 64 -20"
          className="location-input text-base font-mono tabular-nums text-emerald-300 placeholder-slate-600"
        />
        {coordsError && <p className="mt-1 text-xs text-rose-400">{coordsError}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
          LOCATION NAME // ロケーション名
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onFocus={playInputFocusSound}
          placeholder="例: 始原のキャンプサイト"
          className="location-input text-sm text-slate-100 placeholder-slate-600"
        />
      </div>
    </>
  );
}
