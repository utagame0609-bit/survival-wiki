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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playCancelSound();
          onCancel();
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="delete-world-title" className="border-2 border-red-500 bg-[#1a1e29] w-full max-w-md p-6 text-white shadow-[0_0_40px_rgba(239,68,68,0.35)]">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center border-2 border-red-500/50 bg-red-950/50 text-red-400 shadow-md">
            <AlertTriangle className="h-7 w-7 animate-pulse" />
          </div>
          <div className="text-xs tracking-widest text-red-400 font-bold font-mono">SYSTEM WARNING // DATA DELETION</div>
          <h2 id="delete-world-title" className="mt-1.5 text-lg font-bold text-white">ワールドを削除しますか？</h2>
          <div className="mt-3 border border-red-500/40 bg-red-950/40 p-3">
            <p className="break-words text-sm font-bold text-amber-300">「{world.name}」</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-300">※この操作は元に戻せません。<br />冒険の書に保存されたすべての場所・記録が消去されます。</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#2a3142] pt-4">
          <button type="button" onClick={() => { playCancelSound(); onCancel(); }} onMouseEnter={playHoverSound} className="min-h-[44px] py-2.5 bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center justify-center border border-slate-600 cursor-pointer"><X className="mr-1 inline h-4 w-4" />CANCEL</button>
          <button type="button" onClick={onConfirm} onMouseEnter={playHoverSound} className="min-h-[44px] py-2.5 bg-red-600 text-white hover:bg-red-500 text-xs font-bold flex items-center justify-center border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)] cursor-pointer"><Trash2 className="mr-1 inline h-4 w-4" />DELETE</button>
        </div>
      </div>
    </div>
  );
}
