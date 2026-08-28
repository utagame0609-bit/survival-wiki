import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, Edit3, Trash2, Copy, Check, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { World, AdventureRecord } from '../../types';
import { playCloseSound, playHoverSound, playConfirmSound, playDeleteSound } from '../../audio/soundEngine';

interface RecordDetailModalProps {
  world: World;
  record: AdventureRecord;
  onClose: () => void;
  onEdit: (record: AdventureRecord) => void;
  onDelete: (record: AdventureRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  world,
  record,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const photos = record.photos || [];
  const currentPhoto = photos[activePhotoIdx];

  const handleCopyCoords = () => {
    if (!record.coords) return;
    const text = `X:${record.coords.x ?? 0} Y:${record.coords.y ?? 0} Z:${record.coords.z ?? 0}`;
    navigator.clipboard.writeText(text).catch(() => {});
    playConfirmSound();
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const getMemberNames = () => {
    if (!record.memberIds || record.memberIds.length === 0) return ['単独行動'];
    return record.memberIds.map(
      (id) => world.members.find((m) => m.id === id)?.name || id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[95vh] bg-[#141414] border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              DAY {String(record.dayNumber).padStart(2, '0')}
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono truncate">
              {record.locationName}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onEdit(record);
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 text-[#A3A3A3] hover:text-[#D4AF37] hover:bg-[#1F1F1F] rounded-sm transition-colors cursor-pointer"
              title="編集"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playDeleteSound();
                onDelete(record);
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 text-[#A3A3A3] hover:text-red-400 hover:bg-[#1F1F1F] rounded-sm transition-colors cursor-pointer"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                playCloseSound();
                onClose();
              }}
              onMouseEnter={playHoverSound}
              className="p-1.5 text-[#737373] hover:text-[#E5E5E5] transition-colors cursor-pointer"
              aria-label="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Photo Gallery Viewer */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-black rounded-sm overflow-hidden border border-[#262626] flex items-center justify-center">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || record.locationName}
                  className="w-full h-full object-contain"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1))
                      }
                      className="absolute left-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-sm transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-2 p-1.5 bg-black/75 hover:bg-black text-white rounded-sm transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-mono font-bold bg-black/80 text-[#E5E5E5] rounded-sm border border-[#333333]">
                  {activePhotoIdx + 1} / {photos.length}
                </span>
              </div>

              {currentPhoto.caption && (
                <p className="text-xs text-[#A3A3A3] font-mono text-center italic">
                  📷 {currentPhoto.caption}
                </p>
              )}

              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-2 justify-center pt-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-14 h-10 rounded-sm overflow-hidden border transition-all ${
                        activePhotoIdx === idx
                          ? 'border-[#D4AF37] scale-105 shadow-md'
                          : 'border-[#262626] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Key Details Metadata Deck */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm text-xs font-mono">
            <div className="flex items-center gap-2 text-[#A3A3A3]">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>記録日時: {record.recordedAt}</span>
            </div>

            <div className="flex items-center gap-2 text-[#A3A3A3]">
              <Users className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>同行者: {getMemberNames().map((n) => `@${n}`).join(', ')}</span>
            </div>

            {record.areaTag && (
              <div className="flex items-center gap-2 text-[#A3A3A3]">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>エリア: {record.areaTag}</span>
              </div>
            )}

            {record.coords && (
              <div className="flex items-center justify-between gap-2 text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-1 border border-[#D4AF37]/30 rounded-sm">
                <span>
                  POS: X:{record.coords.x ?? 0} Y:{record.coords.y ?? 0} Z:{record.coords.z ?? 0}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-[#E5E5E5] cursor-pointer"
                >
                  {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCoords ? 'コピー済' : 'コピー'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Narrative / Activity Memo */}
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#A3A3A3]">
              冒険メモ・詳細活動ログ:
            </div>
            <div className="p-3.5 bg-[#181818] border border-[#262626] rounded-sm text-xs sm:text-sm text-[#E5E5E5] leading-relaxed whitespace-pre-wrap font-sans">
              {record.memo}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0A0A0A] border-t border-[#262626]">
          <span className="text-[10px] font-mono text-[#737373]">
            ID: {record.id}
          </span>
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="px-4 py-1.5 bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] border border-[#2A2A2A] font-mono text-xs font-medium rounded-sm transition-all cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
