import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Clock,
  Users,
  Share2,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { RecordItem } from '../../types';

interface LocationDetailModalProps {
  record: RecordItem | null;
  onClose: () => void;
  onEdit: (record: RecordItem) => void;
  onDelete: (record: RecordItem) => void;
  onShareSns: (record: RecordItem) => void;
}

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  record,
  onClose,
  onEdit,
  onDelete,
  onShareSns,
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  if (!record) return null;

  const photos = record.photos || [];
  const currentPhoto = photos[activePhotoIdx];

  const handlePrevPhoto = () => {
    setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIdx((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="sfc-window w-full max-w-3xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-yellow)] border border-black" />
            <h3 className="font-dot text-sm font-bold text-[var(--text-main)] truncate max-w-md">
              LOG DETAIL // {record.name}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1 rounded"
              title="閉じる"
            >
              <X className="w-4 h-4 text-[var(--text-main)]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Photo Gallery Viewer if photos exist */}
          {photos.length > 0 && (
            <div className="space-y-2">
              <div className="relative rounded-lg overflow-hidden border-3 border-[var(--border-dark)] bg-black aspect-video flex items-center justify-center shadow-lg">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || record.name}
                  className="w-full h-full object-contain"
                />

                {/* Left/Right Slider controls if multiple photos */}
                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 font-dot text-xs"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 font-dot text-xs"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white font-dot text-xs">
                      {activePhotoIdx + 1} / {photos.length}
                    </div>
                  </>
                )}

                {/* Caption Bar */}
                {currentPhoto.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-xs font-dot p-2 text-center">
                    {currentPhoto.caption}
                  </div>
                )}
              </div>

              {/* Photo Thumbnails Strip */}
              {photos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`w-16 h-12 rounded border-2 overflow-hidden shrink-0 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-[var(--accent-blue)] scale-105 ring-2 ring-[var(--accent-blue)]'
                          : 'border-[var(--border-main)] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Location & Metadata Badges */}
          <div className="sfc-panel p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-groove)] pb-3">
              <h2 className="font-dot text-lg sm:text-xl font-bold text-[var(--text-main)]">
                {record.name}
              </h2>

              {record.has_coordinates && record.x !== undefined && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] font-dot text-xs text-[var(--text-main)] shadow-inner">
                  <MapPin className="w-4 h-4 text-[var(--accent-red)]" />
                  <span>
                    X: <strong>{record.x}</strong>, Y: <strong>{record.y}</strong>, Z: <strong>{record.z}</strong>
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-dot text-[var(--text-muted)] flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                記録日: {record.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                時刻: {record.time}
              </span>

              {record.members && record.members.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>同行者:</span>
                  <div className="flex items-center gap-1">
                    {record.members.map((m, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-main)] text-[10px] font-bold border border-[var(--border-main)]"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Memo */}
            <div className="pt-2">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block mb-1">
                サバイバル詳細ログ:
              </label>
              <div className="bg-[var(--surface-label)] p-4 rounded border border-[var(--border-main)] text-xs sm:text-sm text-[var(--text-main)] font-sans leading-relaxed shadow-inner whitespace-pre-wrap">
                {record.detail_memo}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (ABXY Buttons) */}
        <div className="bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] px-4 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {/* SNS Share Card */}
            <button
              type="button"
              onClick={() => onShareSns(record)}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-3 py-2 text-xs font-dot flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
              <span>SNS共有 (SHARE)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {/* Edit */}
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="sfc-btn sfc-btn-convex sfc-btn-y px-4 py-2 text-xs font-dot flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編集 (EDIT)</span>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(record)}
              className="sfc-btn sfc-btn-convex sfc-btn-a px-4 py-2 text-xs font-dot flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>削除 (DELETE)</span>
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-2 text-xs font-dot"
            >
              閉じる (CLOSE)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
