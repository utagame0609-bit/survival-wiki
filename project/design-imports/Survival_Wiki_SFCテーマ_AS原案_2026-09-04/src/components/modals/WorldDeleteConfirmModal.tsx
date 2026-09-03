import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { World } from '../../types';

interface WorldDeleteConfirmModalProps {
  isOpen: boolean;
  world: World | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const WorldDeleteConfirmModal: React.FC<WorldDeleteConfirmModalProps> = ({
  isOpen,
  world,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !world) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="sfc-window w-full max-w-md border-red-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-red-900 text-white px-4 py-3 flex items-center justify-between border-b-2 border-red-950">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <h3 className="font-dot text-sm font-bold tracking-wider">
              冒険の書の消去警告 (DELETE SAVE SLOT)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white hover:opacity-80 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-[var(--surface-1)]">
          <div className="p-3 bg-red-100 dark:bg-red-950/50 border-2 border-red-400 dark:border-red-800 rounded text-xs space-y-1">
            <p className="font-dot font-bold text-red-700 dark:text-red-300">
              【SLOT {String(world.slotNumber).padStart(2, '0')}】{world.name}
            </p>
            <p className="text-red-600 dark:text-red-400">
              このスロットのすべての記録データおよびAI Wiki編纂記事が完全に消去されます。この操作は取り消せません。
            </p>
          </div>

          <p className="text-xs font-dot text-[var(--text-main)] text-center font-bold">
            本当にこの冒険の書を消去してよろしいですか？
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-2 text-xs font-dot flex-1"
            >
              キャンセル (CANCEL)
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="sfc-btn sfc-btn-convex sfc-btn-a px-5 py-2 text-xs font-dot flex items-center justify-center gap-1.5 font-bold flex-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>消去する (DELETE)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
