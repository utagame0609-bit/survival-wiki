import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, Users, X } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playDeleteSound, playErrorSound, playHoverSound, playModalCloseSound } from '@/lib/sound';
import { LocationDetailGallery } from '@/components/LocationDetailGallery';
import { LocationDeleteConfirm } from '@/components/LocationDeleteConfirm';
import { LocationDetailActions } from '@/components/LocationDetailActions';
import { SnsShareModal } from '@/components/SnsShareModal';

type PhotoImageProps = {
  storagePath: string;
  alt: string;
  className?: string;
};

type LocationDetailModalProps = {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  PhotoImage: ComponentType<PhotoImageProps>;
};

export function LocationDetailModal({
  world,
  location,
  onClose,
  onEdit,
  onDelete,
  PhotoImage,
}: LocationDetailModalProps) {
  const photos = location.photos ?? [];
  const tags = location.tags ?? [];
  const [activePhotoIdx, setActivePhotoIdx] = useState(
    Math.max(0, photos.findIndex((photo) => photo.is_main)),
  );
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showSns, setShowSns] = useState(false);

  const formattedDate = new Date(location.created_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const memberNames = (location.member_ids ?? [])
    .map((id) => world.members.find((member) => member.id === id)?.name)
    .filter(Boolean) as string[];

  const requestDelete = () => {
    playErrorSound();
    setShowConfirmDelete(true);
  };

  const handleDelete = () => {
    playDeleteSound();
    onDelete();
  };

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  return createPortal((
    <div
      className="sfc-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden flex flex-col motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-b border-[#1E293B] shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30 shrink-0">
              記録詳細
            </span>
            <h2 className="text-xs sm:text-sm font-game font-bold text-[#F8FAFC] truncate">{location.name}</h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          <LocationDetailGallery
            location={location}
            activePhotoIdx={activePhotoIdx}
            onActivePhotoChange={setActivePhotoIdx}
            PhotoImage={PhotoImage}
          />

          <div>
            <h3 className="text-lg sm:text-xl font-game font-bold text-[#F8FAFC] tracking-wide leading-snug">
              {location.name}
            </h3>
          </div>

          <div className="bg-[#0B1018]/80 p-3.5 sm:p-4 rounded-lg border border-[#1E293B]">
            <div className="text-[11px] font-mono text-[#F59E0B] mb-1.5 font-bold uppercase tracking-wider">
              // DISCOVERY LOG / MEMO
            </div>
            <p className="text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
              {location.detail_memo || 'メモの記録はありません。'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#334155]/60 text-xs font-mono text-[#94A3B8]">
              <Clock className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {location.has_coordinates ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#F59E0B]/40 text-xs font-mono text-[#F59E0B]">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span className="truncate">POS: X:{location.x} Y:{location.y} Z:{location.z}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30]/50 rounded border border-[#334155]/30 text-xs font-mono text-[#64748B]">
                <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>座標未設定（任意）</span>
              </div>
            )}

            {memberNames.length > 0 && (
              <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#334155]/60 text-xs font-mono text-[#94A3B8]">
                <Users className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <span className="truncate">同行者: {memberNames.join(', ')}</span>
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-2 py-1 bg-[#161F30] text-[#F59E0B] border border-[#334155] rounded text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <LocationDetailActions
          onDeleteRequest={requestDelete}
          onShare={() => {
            playConfirmSound();
            setShowSns(true);
          }}
          onEdit={onEdit}
        />

        {showConfirmDelete && (
          <LocationDeleteConfirm
            locationName={location.name}
            onCancel={() => setShowConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </div>

      {showSns && (
        <SnsShareModal
          world={world}
          location={location}
          onClose={() => setShowSns(false)}
        />
      )}
    </div>
  ), document.body);
}
