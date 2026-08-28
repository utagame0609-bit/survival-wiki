import { playInputFocusSound } from '@/lib/sound';

type LocationBasicFieldsProps = {
  name: string;
  onNameChange: (value: string) => void;
};

export function LocationBasicFields({ name, onNameChange }: LocationBasicFieldsProps) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-bold text-slate-200">
        場所名・発見したこと <span className="text-amber-400">*</span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onFocus={playInputFocusSound}
        placeholder="例: 浅めの洞窟、桜の丘、砂漠の寺院..."
        className="location-input min-h-[44px] text-sm text-white placeholder-slate-600"
        autoFocus
        required
      />
    </div>
  );
}
