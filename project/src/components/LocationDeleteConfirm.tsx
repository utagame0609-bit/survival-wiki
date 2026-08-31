import { Trash2 } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';

type LocationDeleteConfirmProps = {
  locationName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LocationDeleteConfirm({ locationName, onCancel, onConfirm }: LocationDeleteConfirmProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05080E]/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-lg border border-[#EF4444]/60 bg-[#2A1218] p-4 shadow-[0_0_24px_rgba(239,68,68,0.2)]">
        <div className="flex items-start gap-2 text-xs font-game text-[#EF4444] font-bold">
          <Trash2 className="mt-0.5 w-4 h-4 shrink-0" />
          <span>この探索記録を削除しますか？ この操作は取り消せません。</span>
        </div>
        <p className="mt-2 text-[11px] text-[#FCA5A5] font-mono">「{locationName}」の記録と添付写真を削除します。</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            onMouseEnter={playHoverSound}
            className="px-3 py-1.5 rounded text-xs font-game text-[#94A3B8] hover:bg-[#1E293B]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="px-3 py-1.5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white font-game text-xs font-bold"
          >
            削除を実行
          </button>
        </div>
      </div>
    </div>
  );
}
