import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { LocationForm } from '@/components/LocationForm';
import { playCancelSound, playHoverSound } from '@/lib/sound';

type LocationFormInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
};

type LocationFormModalProps = {
  world: WorldWithMembers;
  mode: 'create' | 'edit';
  editingLocation: LocationWithPhotos | null;
  saving: boolean;
  onSave: (input: LocationFormInput) => Promise<string>;
  onComplete: () => Promise<void>;
  onCancel: () => void;
};

export function LocationFormModal({ world, mode, editingLocation, saving, onSave, onComplete, onCancel }: LocationFormModalProps) {
  const isEdit = mode === 'edit';
  return createPortal((
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-2 sm:p-4 bg-black/85 backdrop-blur-sm" onMouseDown={(event) => {
      if (event.target === event.currentTarget) { playCancelSound(); onCancel(); }
    }}>
      <div className="relative w-full max-w-lg overflow-hidden bg-[#161b27] border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.14)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between gap-2 px-3 sm:px-5 py-3 bg-[#111624] border-b-2 border-amber-500">
          <div className="min-w-0 flex items-center gap-2">
            <span className="shrink-0 px-2 py-1 border border-amber-500/70 bg-amber-500/10 text-amber-300 text-[9px] sm:text-xs font-black font-mono tracking-wide">{isEdit ? 'EDIT' : 'QUICK LOG'}</span>
            <h2 className="min-w-0 text-sm sm:text-base font-black text-white truncate">{isEdit ? '冒険記録を編集' : '冒険記録を追加'}</h2>
          </div>
          <button type="button" onClick={() => { playCancelSound(); onCancel(); }} onMouseEnter={playHoverSound} disabled={saving} className="shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 border border-transparent hover:text-white hover:border-slate-600 hover:bg-slate-900/50 transition-colors cursor-pointer disabled:opacity-50" aria-label="閉じる"><X className="w-5 h-5" /></button>
        </div>
        <div className="max-h-[78vh] overflow-y-auto overscroll-contain">
          <LocationForm worldId={world.id} members={world.members} editing={editingLocation} onSave={onSave} onComplete={onComplete} onCancel={onCancel} saving={saving} />
        </div>
      </div>
    </div>
  ), document.body);
}
