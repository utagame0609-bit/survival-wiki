import { Trash2 } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type WorldDeleteConfirmModalProps = {
  world: WorldWithMembers;
  onCancel: () => void;
  onConfirm: () => void;
};

export function WorldDeleteConfirmModal({ world, onCancel, onConfirm }: WorldDeleteConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-sm font-sans"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playCancelSound();
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-world-title"
        className="w-full max-w-md border-2 border-rose-500 bg-[#141b2d] text-white shadow-[0_0_34px_rgba(244,63,94,0.24)]"
      >
        <div className="flex items-center gap-2.5 border-b border-rose-500/50 bg-[#111827] px-4 sm:px-5 py-3.5">
          <Trash2 className="h-4.5 w-4.5 shrink-0 text-rose-400" />
          <div className="min-w-0">
            <p className="text-[10px] font-black tracking-widest text-slate-200 font-mono">WARNING // セーブデータの消去</p>
            <h2 id="delete-world-title" className="text-sm sm:text-base font-black text-white">「{world.name}」を消去しますか？</h2>
          </div>
        </div>

        <div className="px-4 sm:px-5 py-4">
          <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
            「<span className="font-black text-amber-300">{world.name}</span>」を消去しますか？ 記録されたすべてのロケーションや写真が削除されます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 border-t border-slate-800 bg-[#111827] px-4 sm:px-5 py-3.5">
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onCancel();
            }}
            onMouseEnter={playHoverSound}
            className="min-h-[42px] border border-slate-700 bg-[#141c2b] px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="min-h-[42px] bg-rose-600 px-3 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_0_14px_rgba(244,63,94,0.2)] hover:bg-rose-500 transition-all cursor-pointer"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
