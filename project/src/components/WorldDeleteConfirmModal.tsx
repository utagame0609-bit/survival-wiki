import { Trash2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type WorldDeleteConfirmModalProps = {
  world: WorldWithMembers;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorldDeleteConfirmModal({ world, onCancel, onConfirm }: WorldDeleteConfirmModalProps) {
  const closeModal = () => {
    playCancelSound();
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080E]/90 p-4 backdrop-blur-sm font-sans"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-world-title"
        className="sfc-world-delete-modal w-full max-w-sm rounded-lg border border-[#EF4444]/60 bg-[#2A1218] p-4 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
      >
        <div className="flex items-start gap-2 text-xs font-game font-bold text-[#EF4444]">
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span id="delete-world-title">この冒険の書を削除しますか？ この操作は取り消せません。</span>
        </div>

        <p className="mt-2 text-[11px] font-mono text-[#FCA5A5]">
          「{world.name}」のワールドと探索記録・添付写真を削除します。
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={closeModal}
            onMouseEnter={playHoverSound}
            className="rounded px-3 py-1.5 text-xs font-game text-[#94A3B8] transition-colors hover:bg-[#1E293B] cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="sfc-delete-confirm rounded bg-[#EF4444] px-3 py-1.5 text-xs font-game font-bold text-white transition-colors hover:bg-[#DC2626] cursor-pointer"
          >
            削除を実行
          </button>
        </div>
      </div>
    </div>
  );
}
