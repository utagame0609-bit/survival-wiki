import { Sparkles, X } from 'lucide-react';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playCancelSound();
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
            <h2 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider truncate">
              {isEdit ? '探索記録の編集' : 'QUICK LOG // 新規記録'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onCancel();
            }}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto overscroll-contain">
          <LocationForm
            worldId={world.id}
            members={world.members}
            editing={editingLocation}
            onSave={onSave}
            onComplete={onComplete}
            onCancel={onCancel}
            saving={saving}
          />
        </div>
      </div>
    </div>
  ), document.body);
}
