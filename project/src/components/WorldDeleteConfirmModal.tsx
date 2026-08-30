import { AlertTriangle, Trash2, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080E]/80 p-3 backdrop-blur-sm sm:p-4 font-sans"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-world-title"
        className="hud-bracket relative w-full max-w-md overflow-hidden rounded-lg border border-[#7F1D1D]/80 bg-[#0F172A] text-[#F8FAFC] shadow-[0_0_30px_rgba(239,68,68,0.16)]"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#3F1D24] bg-[#0B1018] px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#EF4444]/45 bg-[#2A161C] text-[#EF4444]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-[#EF4444]">
                WARNING // DELETE SAVE DATA
              </p>
              <h2 id="delete-world-title" className="truncate text-sm font-black tracking-wide text-[#F8FAFC] sm:text-base">
                冒険の書を削除
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={closeModal}
            onMouseEnter={playHoverSound}
            className="shrink-0 rounded p-1 text-[#64748B] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
          <div className="rounded border border-[#334155] bg-[#0B1018] px-3.5 py-3">
            <div className="font-mono text-[10px] tracking-wider text-[#64748B]">TARGET SAVE</div>
            <div className="mt-0.5 truncate text-sm font-black text-[#F59E0B]">{world.name}</div>
          </div>

          <p className="text-xs leading-relaxed text-[#CBD5E1] sm:text-sm">
            このワールドと、記録されたロケーション・写真を削除します。
            <span className="font-bold text-[#FCA5A5]"> この操作は取り消せません。</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-[#1E293B] bg-[#0B1018] px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={closeModal}
            onMouseEnter={playHoverSound}
            className="min-h-[40px] whitespace-nowrap rounded px-3.5 py-2 text-xs font-bold text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded border border-[#EF4444]/70 bg-[#B91C1C] px-4 py-2 text-xs font-black tracking-wider text-white shadow-[0_0_12px_rgba(239,68,68,0.18)] transition-all hover:bg-[#DC2626] active:scale-95 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>削除する</span>
          </button>
        </div>
      </div>
    </div>
  );
}
