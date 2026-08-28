import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Star, Edit3, Trash2, Tag, Users, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';
import { LogEntry, World } from '../types';
import { sound } from '../audio/soundEngine';

interface LogDetailModalProps {
  log: LogEntry;
  world: World;
  onClose: () => void;
  onEdit: (log: LogEntry) => void;
  onDelete: (logId: string) => void;
  onToggleStar: (logId: string) => void;
}

export const LogDetailModal: React.FC<LogDetailModalProps> = ({
  log,
  world,
  onClose,
  onEdit,
  onDelete,
  onToggleStar,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  const activePhoto = log.photos && log.photos.length > 0 ? log.photos[activePhotoIndex] : null;

  const memberNames = log.memberIds
    ?.map((id) => world.members.find((m) => m.id === id)?.name)
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          sound.playCancel();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl bg-[#0a0a0c] border-2 border-[#ff8c00] shadow-[8px_8px_0px_#000000] rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#121214] border-b-2 border-[#333338]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] terminal-font font-black bg-[#ff8c00] text-black shadow-[2px_2px_0px_#000000]">
              DAY {String(log.dayNumber).padStart(2, '0')}
            </span>
            <span className="text-xs terminal-font text-[#888888]">{log.timestamp}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                sound.playConfirm();
                onToggleStar(log.id);
              }}
              className={`p-1.5 rounded transition cursor-pointer ${
                log.starred ? 'text-[#ff8c00] hover:text-[#ffa500]' : 'text-[#666666] hover:text-[#aaaaaa]'
              }`}
              title="お気に入り"
            >
              <Star className={`w-4 h-4 ${log.starred ? 'fill-[#ff8c00]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playConfirm();
                onEdit(log);
              }}
              className="p-1.5 text-[#888888] hover:text-[#ff8c00] rounded transition cursor-pointer"
              title="編集"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                sound.playDelete();
                setIsDeleteConfirm(true);
              }}
              className="p-1.5 text-[#888888] hover:text-rose-400 rounded transition cursor-pointer"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-[2px] h-4 bg-[#333338] mx-1" />
            <button
              onClick={() => {
                sound.playCancel();
                onClose();
              }}
              className="p-1.5 text-[#888888] hover:text-white rounded transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-4 bg-[#0e0e11]">
          {/* Photo Showcase */}
          {activePhoto && (
            <div className="relative rounded-xl overflow-hidden border-2 border-[#333338] bg-black group shadow-[3px_3px_0px_#000000]">
              <div className="w-full aspect-[16/10] max-h-[300px] flex items-center justify-center bg-black">
                <img
                  src={activePhoto.url}
                  alt={activePhoto.caption || log.locationName}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Photo Pagination Controls */}
              {log.photos.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      sound.playHover();
                      setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : log.photos.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded bg-black/80 text-white hover:bg-[#ff8c00] hover:text-black transition cursor-pointer border border-[#333338]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      sound.playHover();
                      setActivePhotoIndex((prev) => (prev < log.photos.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded bg-black/80 text-white hover:bg-[#ff8c00] hover:text-black transition cursor-pointer border border-[#333338]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-black/85 text-[10px] terminal-font text-[#dcdcdc] border border-[#333338]">
                    {activePhotoIndex + 1} / {log.photos.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Location Title & Coordinates */}
          <div className="bg-[#121214] border-2 border-[#333338] rounded-xl p-3.5 space-y-2 shadow-[3px_3px_0px_#000000]">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] terminal-font text-[#888888] font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ff8c00]" /> LOCATION
                </div>
                <h2 className="text-base sm:text-lg font-black text-white terminal-font">{log.locationName}</h2>
              </div>

              {log.coordinates ? (
                <div className="px-2.5 py-1 rounded-lg bg-[#18181c] border-2 border-[#333338] text-right terminal-font text-xs text-[#00ff41] font-bold shrink-0 shadow-[2px_2px_0px_#000000]">
                  <span>X:{log.coordinates.x}</span>{' '}
                  <span className="text-[#666666]">/</span>{' '}
                  <span>Y:{log.coordinates.y}</span>{' '}
                  <span className="text-[#666666]">/</span>{' '}
                  <span>Z:{log.coordinates.z}</span>
                </div>
              ) : log.area ? (
                <div className="px-2.5 py-1 rounded-lg bg-[#18181c] border-2 border-[#333338] terminal-font text-xs text-[#ff8c00] font-bold shrink-0 shadow-[2px_2px_0px_#000000]">
                  {log.area}
                </div>
              ) : null}
            </div>

            {/* Companions & Tags Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t-2 border-[#202026] text-xs">
              {memberNames && memberNames.length > 0 && (
                <div className="flex items-center gap-1 text-[#dcdcdc] terminal-font">
                  <Users className="w-3.5 h-3.5 text-[#ff8c00]" />
                  <span>{memberNames.map((n) => `@${n}`).join(' ')}</span>
                </div>
              )}

              {log.tags && log.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {log.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-[#18181c] border border-[#333338] text-[10px] terminal-font text-[#00ff41]"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Memo Box */}
          <div className="bg-[#141417] border-2 border-[#333338] rounded-xl p-4 space-y-1.5 shadow-[3px_3px_0px_#000000]">
            <div className="text-[10px] terminal-font text-[#ff8c00] font-bold">LOG DETAILS // 詳細メモ</div>
            <p className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap">
              {log.memo}
            </p>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {isDeleteConfirm && (
          <div className="p-4 bg-rose-950/90 border-t-2 border-rose-600 flex items-center justify-between gap-3 text-xs text-rose-200 terminal-font">
            <span>この記録を削除しますか？（取り消せません）</span>
            <div className="flex gap-2">
              <button
                onClick={() => setIsDeleteConfirm(false)}
                className="px-3 py-1 bg-[#18181c] hover:bg-[#202026] border border-[#333338] text-white rounded font-bold cursor-pointer terminal-font"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  sound.playDelete();
                  onDelete(log.id);
                  onClose();
                }}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold cursor-pointer terminal-font shadow-[2px_2px_0px_#000000]"
              >
                完全に削除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
