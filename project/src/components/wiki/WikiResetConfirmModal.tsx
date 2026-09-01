import { Trash2 } from 'lucide-react';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type WikiResetConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WikiResetConfirmModal({ open, onCancel, onConfirm }: WikiResetConfirmModalProps) {
  if (!open) return null;

  const handleCancel = () => {
    playCancelSound();
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#05080E]/90 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-wiki-title"
        className="w-full max-w-sm rounded-lg border border-[#EF4444]/60 bg-[#2A1218] p-4 shadow-[0_0_24px_rgba(239,68,68,0.2)]"
      >
        <div className="flex items-start gap-2 text-xs font-game font-bold text-[#EF4444]">
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span id="reset-wiki-title">この旅の書をリセットしますか？ この操作は取り消せません。</span>
        </div>

        <p className="mt-2 text-[11px] font-mono text-[#FCA5A5]">
          この人物の保存済みWiki記事だけを削除します。他の記事は残ります。
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
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
            リセットを実行
          </button>
        </div>
      </div>
    </div>
  );
}
