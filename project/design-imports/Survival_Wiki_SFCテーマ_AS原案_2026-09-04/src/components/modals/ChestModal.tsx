import React, { useState } from 'react';
import { X, Archive, MapPin, Calendar, Image as ImageIcon, Search, ExternalLink } from 'lucide-react';
import { RecordItem } from '../../types';

interface ChestModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: RecordItem[];
  onSelectRecord: (record: RecordItem) => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  isOpen,
  onClose,
  records,
  onSelectRecord,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [activePhotoModal, setActivePhotoModal] = useState<{
    url: string;
    caption?: string;
    record: RecordItem;
  } | null>(null);

  if (!isOpen) return null;

  // Flatten all photos with their record context
  const allPhotos = records.flatMap((record) =>
    (record.photos || []).map((photo) => ({
      ...photo,
      record,
    }))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      <div className="sfc-window w-full max-w-4xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Chest styling */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-600 flex items-center justify-center">
              <Archive className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
                CHEST (宝箱写真館・サバイバルフォトギャラリー)
              </h3>
              <span className="font-dot text-[10px] text-[var(--text-muted)]">
                TOTAL: {allPhotos.length} PHOTOS STORED
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1 rounded"
            title="閉じる"
          >
            <X className="w-4 h-4 text-[var(--text-main)]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Photos Grid */}
          {allPhotos.length === 0 ? (
            <div className="sfc-panel p-10 text-center space-y-3">
              <Archive className="w-10 h-10 mx-auto text-[var(--text-muted)] opacity-50" />
              <p className="font-dot text-sm text-[var(--text-main)] font-bold">
                宝箱（CHEST）にはまだ写真が保管されていません
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                記録の追加時に写真・スクリーンショットを添付するとここに集約されます。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {allPhotos.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  onClick={() => setActivePhotoModal(item)}
                  className="group relative rounded-lg border-2 border-[var(--border-dark)] overflow-hidden bg-black aspect-video cursor-pointer shadow hover:scale-[1.02] transition-transform"
                >
                  <img
                    src={item.url}
                    alt={item.caption || item.record.name}
                    className="w-full h-full object-cover group-hover:opacity-90"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-between text-white text-[9px] font-dot">
                    <span className="truncate font-bold">{item.record.name}</span>
                    <span className="text-amber-300">{item.record.date}</span>
                  </div>
                  {item.caption && (
                    <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white font-dot truncate px-1 py-0.5 group-hover:hidden">
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <span className="font-dot text-xs text-[var(--text-muted)]">
            ※写真をクリックすると拡大表示および記録詳細へのジャンプが可能です。
          </span>
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-1.5 text-xs font-dot"
          >
            閉じる (CLOSE)
          </button>
        </div>
      </div>

      {/* Expanded Photo Lightbox Dialog */}
      {activePhotoModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="sfc-window max-w-2xl w-full p-4 space-y-3 bg-[var(--surface-1)]">
            <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2">
              <span className="font-dot text-xs font-bold text-[var(--text-main)]">
                {activePhotoModal.record.name}
              </span>
              <button
                type="button"
                onClick={() => setActivePhotoModal(null)}
                className="text-red-500 hover:opacity-80 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border-2 border-black aspect-video bg-black flex items-center justify-center">
              <img
                src={activePhotoModal.url}
                alt="expanded"
                className="w-full h-full object-contain"
              />
            </div>

            {activePhotoModal.caption && (
              <p className="text-xs font-dot text-center text-[var(--text-main)] bg-[var(--surface-label)] p-2 rounded border border-[var(--border-main)]">
                {activePhotoModal.caption}
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-dot text-[var(--text-muted)]">
                撮影日: {activePhotoModal.record.date} {activePhotoModal.record.time}
              </span>
              <button
                type="button"
                onClick={() => {
                  onSelectRecord(activePhotoModal.record);
                  setActivePhotoModal(null);
                  onClose();
                }}
                className="sfc-btn sfc-btn-convex sfc-btn-x px-3 py-1.5 text-xs font-dot flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>この記録の詳細を開く</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
