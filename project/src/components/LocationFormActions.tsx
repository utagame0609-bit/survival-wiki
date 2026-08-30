import { Save } from 'lucide-react';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type LocationFormActionsProps = {
  saving: boolean;
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function LocationFormActions({ saving, editing, onCancel, onSubmit }: LocationFormActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E293B]">
      <button
        type="button"
        onClick={() => {
          playCancelSound();
          onCancel();
        }}
        onMouseEnter={playHoverSound}
        className="px-3.5 py-2 rounded text-xs game-ui-font text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
      >
        キャンセル
      </button>

      <button
        type="button"
        onClick={onSubmit}
        onMouseEnter={playHoverSound}
        disabled={saving}
        className="px-5 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] game-ui-font font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        <Save className="w-3.5 h-3.5" />
        <span>{saving ? '保存中...' : editing ? '変更を保存' : '記録を保存する'}</span>
      </button>
    </div>
  );
}
