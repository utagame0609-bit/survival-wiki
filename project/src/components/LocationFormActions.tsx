import { Save, X } from 'lucide-react';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type LocationFormActionsProps = {
  saving: boolean;
  editing: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export function LocationFormActions({ saving, editing, onCancel, onSubmit }: LocationFormActionsProps) {
  return (
    <div className="flex gap-3 pt-4 pb-1 border-t border-slate-800">
      <button
        type="button"
        onClick={() => {
          playCancelSound();
          onCancel();
        }}
        onMouseEnter={playHoverSound}
        className="flex-1 min-h-[44px] py-2.5 rounded-sm bg-[#141824] border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98] transition-all text-xs uppercase tracking-wider cursor-pointer"
      >
        <X className="w-4 h-4 inline mr-1" />キャンセル
      </button>
      <button
        type="button"
        onClick={onSubmit}
        onMouseEnter={playHoverSound}
        disabled={saving}
        className="flex-1 min-h-[44px] py-2.5 rounded-sm bg-amber-500 text-slate-950 font-black border-b-2 border-amber-700 shadow-[0_0_16px_rgba(245,158,11,0.22)] hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
      >
        <Save className="w-4 h-4 inline mr-1" />
        {saving ? 'SAVING // 保存中...' : editing ? '▶ 更新を記録' : '▶ 冒険の書に刻む'}
      </button>
    </div>
  );
}
