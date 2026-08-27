import { playInputFocusSound } from '@/lib/sound';
import { LocationCoordinatesField } from '@/components/LocationCoordinatesField';

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
      <LocationCoordinatesField
        value={coordsText}
        error={coordsError}
        onChange={onCoordsChange}
      />

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
