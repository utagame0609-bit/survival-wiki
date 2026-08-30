import { playInputFocusSound } from '@/lib/sound';

type LocationBasicFieldsProps = {
  name: string;
  onNameChange: (value: string) => void;
};

export function LocationBasicFields({ name, onNameChange }: LocationBasicFieldsProps) {
  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-xs game-ui-font text-[#F8FAFC]">
        <span>タイトル / 発見場所の名称</span>
        <span className="px-1.5 py-0.5 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 text-[10px] font-mono font-bold text-[#F59E0B]">
          必須
        </span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        onFocus={playInputFocusSound}
        placeholder="例: 第一前哨基地の完成、海中鍾乳洞の発見"
        className="location-input w-full px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#64748B]"
        autoFocus
        required
      />
    </div>
  );
}
