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
      <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="w-full max-w-md overflow-hidden border-2 border-rose-500 bg-[#0a1120] text-white shadow-[0_0_36px_rgba(244,63,94,0.28)]">
        <div className="flex items-center gap-2 border-b border-rose-500/40 bg-[#0d1627] px-4 py-3.5">
          <div className="flex h-8 w-8 items-center justify-center border border-rose-400/80 bg-rose-950/40 text-rose-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black tracking-widest text-rose-300 font-mono">SYSTEM WARNING // DATA DELETION</p>
            <h2 id="delete-world-title" className="truncate text-sm sm:text-base font-bold text-white">ワールドを削除しますか？</h2>
          </div>
          <button type="button" onClick={() => { playCancelSound(); onCancel(); }} onMouseEnter={playHoverSound} className="flex h-8 w-8 shrink-0 items-center justify-center text-slate-400 hover:text-white cursor-pointer" aria-label="閉じる">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <div className="border border-rose-500/50 bg-rose-950/20 p-3">
            <p className="text-[10px] font-bold text-rose-300 font-mono">TARGET // 対象ワールド</p>
            <p className="mt-1 break-words text-sm sm:text-base font-black text-amber-300">「{world.name}」</p>
          </div>
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-slate-300">この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-slate-800 bg-[#0d1627] px-4 sm:px-5 py-4">
          <button type="button" onClick={() => { playCancelSound(); onCancel(); }} onMouseEnter={playHoverSound} className="flex min-h-[44px] items-center justify-center gap-1 border border-slate-700 bg-[#141c2b] px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:border-slate-500 hover:bg-slate-800 transition-all cursor-pointer">
            <X className="h-4 w-4" />
            キャンセル
          </button>
          <button type="button" onClick={onConfirm} onMouseEnter={playHoverSound} className="flex min-h-[44px] items-center justify-center gap-1 border border-rose-500 bg-rose-600 px-3 py-2.5 text-xs sm:text-sm font-black text-white shadow-[0_0_14px_rgba(244,63,94,0.25)] hover:bg-rose-500 transition-all cursor-pointer">
            <Trash2 className="h-4 w-4" />
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
