import { Edit3, Share2, Trash2 } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';

type LocationDetailActionsProps = {
  onDeleteRequest: () => void;
  onShare: () => void;
  onEdit: () => void;
};

export function LocationDetailActions({ onDeleteRequest, onShare, onEdit }: LocationDetailActionsProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-t border-[#1E293B] shrink-0">
      <button
        type="button"
        onClick={onDeleteRequest}
        onMouseEnter={playHoverSound}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-game text-[#64748B] hover:text-[#EF4444] hover:bg-[#2A161C]/50 transition-colors opacity-70 hover:opacity-100"
        title="探索記録を削除"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">削除</span>
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onShare}
          onMouseEnter={playHoverSound}
          className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#161F30] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#06B6D4] border border-[#334155]/70 font-game text-xs transition-colors active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5 text-[#06B6D4]" />
          <span>共有</span>
        </button>

        <button
          type="button"
          onClick={onEdit}
          onMouseEnter={playHoverSound}
          className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>編集する</span>
        </button>
      </div>
    </div>
  );
}
