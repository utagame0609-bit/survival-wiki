import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Edit3, Share2, Shield, Trash2, Users, X } from 'lucide-react';
import type { ComponentType } from 'react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playDeleteSound, playErrorSound, playHoverSound, playModalCloseSound } from '@/lib/sound';
import { LocationCoordinates } from '@/components/LocationCoordinates';
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

  return createPortal((
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-2xl max-h-[90vh] bg-[#161a25] border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-[#11141e] border-b-2 border-amber-500/60 shrink-0">
          <div className="min-w-0 flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs px-2 py-1 border border-amber-400 bg-amber-500/20 text-amber-300 font-bold shrink-0 truncate max-w-[55vw]">
              POS X:{location.x} Y:{location.y} Z:{location.z}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white truncate">{location.name}</h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="min-h-[40px] min-w-[40px] shrink-0 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent hover:border-slate-700 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="relative w-full aspect-video bg-black border-2 border-slate-700 overflow-hidden shadow-inner flex items-center justify-center">
                <PhotoImage
                  storagePath={photos[activePhotoIdx]?.storage_path ?? photos[0].storage_path}
                  alt={location.name}
                  className="w-full h-full object-contain pixelated"
                />

                {location.is_checkpoint && (
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-amber-500/90 text-black font-mono text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-md">
                    <Shield className="w-3.5 h-3.5" />
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
                      className={`w-16 h-12 shrink-0 border-2 overflow-hidden cursor-pointer transition-all ${
                        activePhotoIdx === index
                          ? 'border-amber-400 scale-105'
                          : 'border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`写真 ${index + 1} を表示`}
                    >
                      <PhotoImage
                        storagePath={photo.storage_path}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
            <div className="bg-[#10141f] border border-slate-800 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">X 座標</div>
              <div className="font-bold text-amber-400 text-sm">{location.x}</div>
            </div>
            <div className="bg-[#10141f] border border-slate-800 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">Y 高度</div>
              <div className="font-bold text-emerald-400 text-sm">{location.y}</div>
            </div>
            <div className="bg-[#10141f] border border-slate-800 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">Z 座標</div>
              <div className="font-bold text-cyan-400 text-sm">{location.z}</div>
            </div>
            <div className="bg-[#10141f] border border-slate-800 p-2.5 text-center">
              <div className="text-[10px] text-slate-400">記録日時</div>
              <div className="font-bold text-slate-300 text-[11px] truncate">{formattedDate}</div>
            </div>
          </div>

          <div className="bg-[#121622] border-2 border-slate-800 p-4 space-y-1.5">
            <div className="text-xs font-bold text-amber-400 font-mono">MEMO // 探検記録・物語</div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
              {location.detail_memo || '（詳細メモは記録されていません）'}
            </p>
          </div>

          {memberNames.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>参加メンバー:</span>
              </span>
              {memberNames.map((name) => (
                <span
                  key={name}
                  className="px-2 py-1 bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold"
                >
                  @{name}
                </span>
              ))}
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-2 py-1 bg-slate-800 text-amber-300 border border-slate-700 text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <LocationCoordinates location={location} />
          <LocationDetailInfo location={location} />
        </div>

        <div className="p-3.5 sm:p-4 bg-[#11141e] border-t-2 border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              onMouseEnter={playHoverSound}
              className="min-h-[42px] px-3 py-2 border border-slate-700 bg-[#151926] text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編集</span>
            </button>

            <button
              type="button"
              onClick={requestDelete}
              onMouseEnter={playHoverSound}
              className="min-h-[42px] px-3 py-2 border border-slate-700 bg-[#151926] text-slate-400 hover:text-rose-400 hover:border-rose-500 text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>削除</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => { playConfirmSound(); setShowSns(true); }}
            onMouseEnter={playHoverSound}
            className="min-h-[42px] px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-xs sm:text-sm font-mono flex items-center gap-1.5 border-b-2 border-cyan-800 cursor-pointer shadow-[0_2px_10px_rgba(6,182,212,0.3)]"
          >
            <Share2 className="w-4 h-4" />
            <span>𝕏 SNS共有</span>
          </button>
        </div>

        {showConfirmDelete && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-10 font-sans">
            <div className="bg-[#161a25] border-2 border-rose-500 p-5 max-w-sm w-full space-y-3 shadow-[0_0_24px_rgba(244,63,94,0.18)]">
              <div className="text-[10px] font-black font-mono text-rose-400 tracking-wider">
                SYSTEM WARNING // DATA DELETION
              </div>
              <h3 className="text-sm font-bold text-white font-mono">
                このロケーションを削除しますか？
              </h3>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                「{location.name}」の記録と添付写真を削除します。
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  onMouseEnter={playHoverSound}
                  className="flex-1 min-h-[42px] border border-slate-700 bg-[#12151e] text-slate-300 text-xs font-mono hover:border-slate-500 cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  onMouseEnter={playHoverSound}
                  className="flex-1 min-h-[42px] bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold font-mono cursor-pointer"
                >
                  削除する
                </button>
              </div>
            </div>
          </div>
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
