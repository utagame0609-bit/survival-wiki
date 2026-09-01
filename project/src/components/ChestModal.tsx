import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Box, Camera, X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playConfirmSound, playModalCloseSound, playHoverSound } from '@/lib/sound';
import { ChestPhotoArchiveGrid } from '@/components/ChestPhotoArchiveGrid';
import { ChestSelectedPhotoPanel } from '@/components/ChestSelectedPhotoPanel';
import type { CollectionItem } from '@/lib/chestCollection';

type ChestModalProps = {
  collectionItems: CollectionItem[];
  onClose: () => void;
  onOpenLocation: (location: LocationWithPhotos) => void;
};

export function ChestModal({ collectionItems, onClose, onOpenLocation }: ChestModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CollectionItem | null>(collectionItems[0] ?? null);
  const selectedIndex = selectedPhoto
    ? collectionItems.findIndex(
        (item) => item.storagePath === selectedPhoto.storagePath && item.location.id === selectedPhoto.location.id,
      )
    : -1;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleOpenLocation = () => {
    if (!selectedPhoto) return;
    playConfirmSound();
    onOpenLocation(selectedPhoto.location);
    onClose();
  };

  return createPortal((
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05080E]/90 p-2 backdrop-blur-md sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="relative my-auto flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex shrink-0 items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-[#F59E0B]/50 bg-[#161F30]">
              <Box className="h-4 w-4 text-[#F59E0B]" />
            </div>
            <div className="min-w-0">
              <div className="game-ui-font truncate text-[10px] uppercase leading-none tracking-wider text-[#06B6D4]">
                PHOTO GALLERY ARCHIVE
              </div>
              <h2 className="game-ui-font mt-0.5 truncate text-sm font-bold tracking-wider text-[#F8FAFC]">
                CHEST // 冒険写真の宝箱
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="game-ui-font hidden rounded border border-[#334155] bg-[#161F30] px-2 py-0.5 text-[10px] text-[#94A3B8] sm:inline-block">
              TOTAL: {collectionItems.length} PHOTOS // CAPACITY: UNLIMITED
            </span>
            <button
              type="button"
              onClick={handleClose}
              onMouseEnter={playHoverSound}
              className="rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
              aria-label="閉じる"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          {collectionItems.length > 0 && selectedPhoto ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12">
              <ChestSelectedPhotoPanel
                selectedPhoto={selectedPhoto}
                selectedIndex={selectedIndex}
                totalCount={collectionItems.length}
                onOpenLocation={handleOpenLocation}
              />

              <ChestPhotoArchiveGrid
                items={collectionItems}
                selectedIndex={selectedIndex}
                onSelect={setSelectedPhoto}
              />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#1E293B] bg-[#0B1018]/50 px-4 py-16 text-center">
              <Camera className="mx-auto mb-3 h-12 w-12 text-[#64748B]" />
              <h3 className="game-ui-font text-sm text-[#94A3B8]">写真がまだありません</h3>
              <p className="mt-1 text-xs text-[#64748B]">
                記録の作成時に写真を添付すると、このCHESTに自動的に保存されます。
              </p>
            </div>
          )}
        </div>

        <div className="game-ui-font flex shrink-0 items-center justify-between border-t border-[#1E293B] bg-[#0B1018] px-4 py-3 text-xs text-[#64748B]">
          <span className="text-[10px]">UTAPEDIA // PHOTO VAULT</span>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="rounded bg-[#161F30] px-4 py-1.5 text-xs text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  ), document.body);
}
