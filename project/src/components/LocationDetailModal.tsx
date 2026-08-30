import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Clock, Edit3, MapPin, Share2, Shield, Trash2, Users, X } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playDeleteSound, playErrorSound, playHoverSound, playModalCloseSound } from '@/lib/sound';
import { LocationDetailInfo } from '@/components/LocationDetailInfo';
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

  const currentPhoto = photos[activePhotoIdx] ?? photos[0];

  return createPortal((
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden flex flex-col hud-bracket motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
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
          {currentPhoto && (
            <div className="space-y-2">
              <div className="relative w-full aspect-video sm:aspect-[16/10] max-h-[360px] rounded-lg overflow-hidden bg-[#0B1018] border border-[#1E293B]">
                <PhotoImage
                  storagePath={currentPhoto.storage_path}
                  alt={location.name}
                  className="w-full h-full object-cover"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                      onMouseEnter={playHoverSound}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
                      aria-label="前の写真"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                      onMouseEnter={playHoverSound}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
                      aria-label="次の写真"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#0B1018]/90 text-[10px] font-mono text-[#06B6D4] border border-[#06B6D4]/30">
                      {activePhotoIdx + 1} / {photos.length}
                    </div>
                  </>
                )}

                {location.is_checkpoint && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#F59E0B]/90 text-[#0B1018] text-[10px] font-mono font-black border border-[#FDE68A] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>CHECKPOINT</span>
                  </div>
                )}
              </div>

              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {photos.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(index)}
                      onMouseEnter={playHoverSound}
                      className={`relative w-14 h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === index
                          ? 'border-[#F59E0B] scale-105'
                          : 'border-[#334155] opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`写真 ${index + 1} を表示`}
                    >
                      <PhotoImage storagePath={photo.storage_path} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

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

            <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#F59E0B]/40 text-xs font-mono text-[#F59E0B]">
              <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="truncate">POS: X:{location.x} Y:{location.y} Z:{location.z}</span>
            </div>

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

          <LocationDetailInfo location={location} />

          {showConfirmDelete && (
            <div className="p-3 bg-[#2A1218] border border-[#EF4444]/60 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-game text-[#EF4444] font-bold">
                <Trash2 className="w-4 h-4" />
                <span>この探索記録を削除しますか？ この操作は取り消せません。</span>
              </div>
              <p className="text-[11px] text-[#FCA5A5] font-mono">「{location.name}」の記録と添付写真を削除します。</p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  onMouseEnter={playHoverSound}
                  className="px-3 py-1.5 rounded text-xs font-game text-[#94A3B8] hover:bg-[#1E293B]"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  onMouseEnter={playHoverSound}
                  className="px-3 py-1.5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-white font-game text-xs font-bold"
                >
                  削除を実行
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-t border-[#1E293B] shrink-0">
          <button
            type="button"
            onClick={requestDelete}
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
              onClick={() => { playConfirmSound(); setShowSns(true); }}
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
