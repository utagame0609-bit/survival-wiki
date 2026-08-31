import { createPortal } from 'react-dom';
import { FileText, MapPin, X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playHoverSound, playModalCloseSound } from '@/lib/sound';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

type WikiLocationDetailModalProps = {
  location: LocationWithPhotos;
  onClose: () => void;
};

export function WikiLocationDetailModal({ location, onClose }: WikiLocationDetailModalProps) {
  const mainPhoto = location.photos.find((photo) => photo.is_main) ?? location.photos[0] ?? null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  return createPortal((
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center overflow-y-auto bg-[#05080E]/85 p-3 font-sans backdrop-blur-md sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] text-[#E2E8F0] shadow-2xl motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1E293B] bg-[#0B1018] px-4 py-3">
          <div className="min-w-0">
            <div className="mb-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">RELATED RECORD</div>
            <div className="truncate text-xs font-bold text-[#F8FAFC] sm:text-sm">ロケーション詳細</div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            aria-label="閉じる"
            className="shrink-0 rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <div>
            <h2 className="break-words text-lg font-game font-bold leading-snug text-[#F8FAFC] sm:text-xl">{location.name}</h2>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#1E293B] bg-[#0B1018]">
            {mainPhoto ? (
              <LocationPhotoImage
                storagePath={mainPhoto.storage_path}
                alt={location.name}
                className="h-52 w-full object-cover sm:h-64"
              />
            ) : (
              <div className="flex h-52 w-full items-center justify-center bg-[#111827] sm:h-64">
                <MapPin className="h-12 w-12 text-[#475569]" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {location.has_coordinates && (
              <div className="flex items-center gap-2 rounded border border-[#F59E0B]/35 bg-[#161F30] px-3 py-2 font-mono text-xs text-[#F59E0B]">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">POS: X:{location.x} Y:{location.y} Z:{location.z}</span>
              </div>
            )}

            <div className="rounded border border-[#334155]/60 bg-[#161F30] px-3 py-2 font-mono text-xs text-[#94A3B8]">
              記録日時: {new Date(location.created_at).toLocaleString('ja-JP')}
            </div>
          </div>

          <div className="rounded-lg border border-[#1E293B] bg-[#0B1018]/80 p-3.5">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#06B6D4]">
              <FileText className="h-3.5 w-3.5" />
              <span>RECORD MEMO</span>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#CBD5E1]">
              {location.detail_memo || 'メモの記録はありません。'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-[#1E293B] bg-[#0B1018] px-4 py-3">
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="rounded border border-[#334155] bg-[#161F30] px-4 py-2 font-game text-xs font-bold text-[#CBD5E1] transition-colors hover:border-[#06B6D4]/60 hover:text-[#06B6D4]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  ), document.body);
}
