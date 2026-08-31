import { AlertTriangle } from 'lucide-react';
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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleCancel();
      }}
    >
      <div className="w-full max-w-md border-2 border-red-700 bg-[#0d1627] p-5 shadow-[0_0_35px_rgba(0,0,0,.7)]">
        <div className="game-ui-font flex items-center gap-2 font-bold text-red-300">
          <AlertTriangle className="h-5 w-5" />旅の書をリセットしますか？
        </div>
        <p className="mt-2 text-xs text-slate-400">この人物の保存済みWiki記事だけを削除します。他の記事は残ります。</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCancel}
            onMouseEnter={playHoverSound}
            className="game-ui-font min-h-[42px] border border-slate-700 text-slate-300 transition-all hover:-translate-y-[2px]"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="game-ui-font min-h-[42px] bg-red-700 font-bold text-white transition-all hover:-translate-y-[2px] hover:bg-red-600"
          >
            リセットする
          </button>
        </div>
      </div>
    </div>
  );
}
