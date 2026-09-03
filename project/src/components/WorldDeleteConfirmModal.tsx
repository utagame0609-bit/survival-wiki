import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { playCancelSound, playHoverSound } from '@/lib/sound';
import { getAppTheme } from '@/lib/theme';

type WorldDeleteConfirmModalProps = {
  world: WorldWithMembers;
  onCancel: () => void;
  onConfirm: () => void;
  slotNumber?: number;
};

export function WorldDeleteConfirmModal({ world, onCancel, onConfirm, slotNumber }: WorldDeleteConfirmModalProps) {
  const closeModal = () => {
    playCancelSound();
    onCancel();
  };

  if (getAppTheme() === 'sfc') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-world-title"
          className="sfc-window w-full max-w-md animate-in border-red-800 fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b-2 border-red-950 bg-red-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-300" />
              <h3 id="delete-world-title" className="font-dot text-sm font-bold tracking-wider">
                冒険の書の消去警告 (DELETE SAVE SLOT)
              </h3>
            </div>
            <button type="button" onClick={closeModal} className="p-1 text-white hover:opacity-80">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 bg-[var(--surface-1)] p-5">
            <div className="space-y-1 rounded border-2 border-red-400 bg-red-100 p-3 text-xs">
              <p className="font-dot font-bold text-red-700">
                {slotNumber ? `【SLOT ${String(slotNumber).padStart(2, '0')}】` : '【SAVE SLOT】'}{world.name}
              </p>
              <p className="text-red-600">
                このスロットのすべての記録データおよびAI Wiki編纂記事が完全に消去されます。この操作は取り消せません。
              </p>
            </div>

            <p className="text-center font-dot text-xs font-bold text-[var(--text-main)]">
              本当にこの冒険の書を消去してよろしいですか？
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                onMouseEnter={playHoverSound}
                className="sfc-btn sfc-btn-convex sfc-btn-neutral flex-1 px-4 py-2 font-dot text-xs"
              >
                キャンセル (CANCEL)
              </button>
              <button
                type="button"
                onClick={onConfirm}
                onMouseEnter={playHoverSound}
                className="sfc-btn sfc-btn-convex sfc-btn-a flex flex-1 items-center justify-center gap-1.5 px-5 py-2 font-dot text-xs font-bold"
              >
                <Trash2 className="h-4 w-4" />
                <span>消去する (DELETE)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        className="w-full max-w-sm rounded-lg border border-[#EF4444]/60 bg-[#2A1218] p-4 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
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
            className="rounded bg-[#EF4444] px-3 py-1.5 text-xs font-game font-bold text-white transition-colors hover:bg-[#DC2626] cursor-pointer"
          >
            削除を実行
          </button>
        </div>
      </div>
    </div>
  );
}
