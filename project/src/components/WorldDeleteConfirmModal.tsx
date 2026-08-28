import { AlertTriangle, Trash2, X } from 'lucide-react';
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
        className="w-full max-w-sm overflow-hidden border-2 border-rose-500/90 bg-[#0a1120] text-white shadow-[0_0_35px_rgba(244,63,94,0.22)]"
      >
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1627] px-4 sm:px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center border border-rose-500/70 bg-rose-950/40 text-rose-300">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div>
              <p className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-rose-300">SYSTEM WARNING // DATA DELETION</p>
              <h2 id="delete-world-title" className="text-sm sm:text-base font-bold text-white">ワールドを削除しますか？</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { playCancelSound(); onCancel(); }}
            onMouseEnter={playHoverSound}
            className="flex h-8 w-8 items-center justify-center text-slate-400 transition-colors hover:text-white cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <div className="border border-rose-500/40 bg-rose-950/25 p-3">
            <p className="text-[10px] font-mono font-bold text-rose-300">TARGET // 対象ワールド</p>
            <p className="mt-1.5 break-words text-sm font-black text-amber-300">「{world.name}」</p>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
        </div>

        <div className="flex gap-3 border-t border-slate-800 bg-[#0d1627] px-4 sm:px-5 py-4">
          <button
            type="button"
            onClick={() => { playCancelSound(); onCancel(); }}
            onMouseEnter={playHoverSound}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 border-2 border-slate-700 bg-[#141b2a] px-3 py-2.5 text-xs font-bold text-slate-300 transition-all hover:border-slate-500 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="flex min-h-[44px] flex-1 items-center justify-center gap-1 border-b-2 border-rose-800 bg-rose-600 px-3 py-2.5 text-xs font-black text-white transition-all hover:bg-rose-500 active:border-b-0 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
