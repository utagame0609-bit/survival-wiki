import { X } from 'lucide-react';
import type { ComponentType } from 'react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playCancelSound();
          onCancel();
        }
      }}
    >
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-xs px-2.5 py-0.5 border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold font-mono">
              {mode === 'edit' ? 'EDIT' : 'NEW'}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {mode === 'edit' ? 'ロケーション編集' : '新規拠点記録'}
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
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
  );
}
