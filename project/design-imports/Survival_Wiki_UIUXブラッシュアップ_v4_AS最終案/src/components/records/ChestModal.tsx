import React, { useState, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { X, Box, ArrowRight, Clock, MapPin, Sparkles, Image as ImageIcon } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface ChestPhotoItem {
  photoUrl: string;
  record: LocationRecord;
  photoIndex: number;
}

interface ChestModalProps {
  records: LocationRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRecordForDetail: (record: LocationRecord) => void;
}

export const ChestModal: React.FC<ChestModalProps> = ({
  records,
  isOpen,
  onClose,
  onSelectRecordForDetail,
}) => {
  if (!isOpen) return null;

  // Flatten all photos from records into a list
  const allPhotos = useMemo<ChestPhotoItem[]>(() => {
    const items: ChestPhotoItem[] = [];
    records.forEach((rec) => {
      if (rec.photos && rec.photos.length > 0) {
        rec.photos.forEach((url, pIdx) => {
          items.push({ photoUrl: url, record: rec, photoIndex: pIdx });
        });
      } else if (rec.photoUrl) {
        items.push({ photoUrl: rec.photoUrl, record: rec, photoIndex: 0 });
      }
    });
    return items;
  }, [records]);

  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const activeItem = allPhotos[selectedPhotoIndex] || allPhotos[0];

  const handleOpenDetail = (record: LocationRecord) => {
    soundEngine.playSe('menu_select');
    onSelectRecordForDetail(record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#05080E]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#161F30] border border-[#F59E0B]/50 flex items-center justify-center">
              <Box className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#06B6D4] tracking-wider uppercase leading-none">
                PHOTO GALLERY ARCHIVE
              </div>
              <h3 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider mt-0.5">
                CHEST // 冒険写真の宝箱
              </h3>
            </div>
          </div>

          {/* Right Status Badge & Close */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#161F30] text-[#94A3B8] border border-[#334155] text-[10px] font-mono">
              TOTAL: {allPhotos.length} PHOTOS // CAPACITY: UNLIMITED
            </span>

            <button
              id="btn-close-chest"
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_back');
                onClose();
              }}
              className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="p-3 sm:p-5 max-h-[80vh] overflow-y-auto">
          {allPhotos.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              {/* LEFT / TOP HERO PREVIEW: Selected Photo Showcase */}
              {activeItem && (
                <div className="lg:col-span-7 space-y-3">
                  <div className="relative w-full aspect-video sm:aspect-[4/3] rounded-lg overflow-hidden bg-[#0B1018] border-2 border-[#F59E0B]/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] group">
                    <img
                      src={activeItem.photoUrl}
                      alt={activeItem.record.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />

                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#0B1018]/85 text-[#F59E0B] text-[10px] font-mono border border-[#F59E0B]/40 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      SELECTED PHOTO ({selectedPhotoIndex + 1}/{allPhotos.length})
                    </div>
                  </div>

                  {/* Selected Photo Info Card + Action Trigger */}
                  <div className="bg-[#0B1018]/90 p-3.5 rounded-lg border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748B] mb-1">
                        <span className="text-[#F59E0B]">DAY {String(activeItem.record.dayNumber).padStart(2, '0')}</span>
                        <span>//</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-[#06B6D4]" />
                          {activeItem.record.createdAt.split('T')[0]}
                        </span>
                        {activeItem.record.hasExplicitCoordinates && activeItem.record.coordinates && (
                          <span className="flex items-center gap-0.5 text-[#94A3B8]">
                            <MapPin className="w-2.5 h-2.5 text-[#F59E0B]" />
                            X:{activeItem.record.coordinates.x} Z:{activeItem.record.coordinates.z}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-game font-bold text-[#F8FAFC] truncate">
                        {activeItem.record.title}
                      </h4>
                    </div>

                    <button
                      id="btn-chest-view-record-detail"
                      type="button"
                      onClick={() => handleOpenDetail(activeItem.record)}
                      className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(245,158,11,0.25)] active:scale-95"
                    >
                      <span>記録詳細を見る</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* RIGHT / BOTTOM: Thumbnail Grid Collection */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-game text-[#94A3B8] flex items-center justify-between">
                  <span>写真アーカイブ一覧</span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    タップで拡大プレビュー
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                  {allPhotos.map((item, idx) => {
                    const isSelected = selectedPhotoIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          soundEngine.playSe('menu_cursor');
                          setSelectedPhotoIndex(idx);
                        }}
                        className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/40 scale-95 shadow-md'
                            : 'border-[#1E293B] hover:border-[#06B6D4]/60 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={item.photoUrl}
                          alt={item.record.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1018] to-transparent p-1">
                          <div className="text-[8px] font-mono text-[#F1F5F9] truncate leading-tight">
                            {item.record.title}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[#0B1018]/50 rounded-lg border border-dashed border-[#1E293B]">
              <ImageIcon className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
              <h4 className="text-sm font-game text-[#94A3B8]">写真がまだありません</h4>
              <p className="text-xs text-[#64748B] font-jp mt-1">
                記録の作成時に写真を添付すると、このCHESTに自動的に保存されます。
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0B1018] border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span className="text-[10px]">UTAPEDIA // PHOTO VAULT</span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-[#161F30] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] font-game text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
