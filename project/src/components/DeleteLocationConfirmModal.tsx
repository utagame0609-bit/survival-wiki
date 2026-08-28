import type { MouseEvent } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type DeleteLocationConfirmModalProps = {
  location: LocationWithPhotos;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteLocationConfirmModal({ location, onCancel, onConfirm }: DeleteLocationConfirmModalProps) {
  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      playCancelSound();
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-sans"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-location-title"
        className="w-full max-w-md overflow-hidden bg-[#1e2330] border-2 border-red-600 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
      >
        <div className="px-5 pt-6 pb-5 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h2 id="delete-location-title" className="text-base sm:text-lg font-bold text-red-200 font-mono uppercase">
            ロケーションを抹消しますか？
          </h2>
          <p className="mt-2 text-sm text-amber-400 font-bold break-words">「{location.name}」</p>
          <p className="mt-3 text-xs leading-5 text-slate-400 font-mono">
            この操作は冒険の書から元に戻せません。<br />
            保存された写真と座標データもすべて破棄されます。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={() => { playCancelSound(); onCancel(); }}
            onMouseEnter={playHoverSound}
            className="min-h-[40px] bg-[#12151f] border border-slate-700 text-slate-300 hover:text-white text-xs font-bold font-mono"
          >
            <X className="w-4 h-4 inline mr-1" />キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            onMouseEnter={playHoverSound}
            className="min-h-[40px] rounded-sm bg-red-800 border-2 border-red-500 text-white hover:bg-red-700 active:scale-[0.98] transition-all text-xs font-bold font-mono shadow-[0_0_15px_rgba(239,68,68,0.4)]"
          >
            <Trash2 className="w-4 h-4 inline mr-1" />抹消する
          </button>
        </div>
      </div>
    </div>
  );
}
