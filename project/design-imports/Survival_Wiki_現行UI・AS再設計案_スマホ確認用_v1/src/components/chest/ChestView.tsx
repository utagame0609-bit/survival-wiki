import React, { useState, useMemo } from 'react';
import { Camera, MapPin, Sparkles, ExternalLink, Calendar, Users, Eye } from 'lucide-react';
import { World, AdventureRecord, RecordPhoto } from '../../types';
import { playConfirmSound, playHoverSound } from '../../audio/soundEngine';

interface ChestViewProps {
  world: World;
  records: AdventureRecord[];
  onOpenRecord: (record: AdventureRecord) => void;
}

interface PhotoWithMeta {
  photo: RecordPhoto;
  record: AdventureRecord;
}

export const ChestView: React.FC<ChestViewProps> = ({
  world,
  records,
  onOpenRecord,
}) => {
  const [selectedPhotoMeta, setSelectedPhotoMeta] = useState<PhotoWithMeta | null>(null);
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');

  // Extract all photos with parent record metadata
  const allPhotos = useMemo<PhotoWithMeta[]>(() => {
    const list: PhotoWithMeta[] = [];
    records.forEach((rec) => {
      if (rec.photos && rec.photos.length > 0) {
        rec.photos.forEach((photo) => {
          list.push({ photo, record: rec });
        });
      }
    });
    return list;
  }, [records]);

  // Unique days list
  const availableDays = useMemo(() => {
    const days = new Set<number>();
    allPhotos.forEach((item) => days.add(item.record.dayNumber));
    return Array.from(days).sort((a, b) => a - b);
  }, [allPhotos]);

  const filteredPhotos = useMemo(() => {
    if (filterDay === 'all') return allPhotos;
    return allPhotos.filter((item) => item.record.dayNumber === filterDay);
  }, [allPhotos, filterDay]);

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Top Banner / Chest Summary */}
      <div className="bg-[#141414] border border-[#262626] p-4 rounded-sm shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#E5E5E5] flex items-center gap-2">
              <span>宝箱コレクション (CHEST GALLERY)</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                {allPhotos.length} 枚の写真
              </span>
            </h3>
            <p className="text-xs text-[#737373] font-mono mt-0.5">
              日誌に添付されたすべての冒険写真・スクリーンショットのアーカイブ
            </p>
          </div>
        </div>

        {/* Day Filter Chips */}
        {availableDays.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono">
            <span className="text-[#737373] text-[11px] shrink-0">日数:</span>
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                setFilterDay('all');
              }}
              className={`px-2 py-1 rounded-sm border text-[11px] shrink-0 transition-colors cursor-pointer ${
                filterDay === 'all'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                  : 'border-[#262626] bg-[#0A0A0A] text-[#737373]'
              }`}
            >
              すべて
            </button>
            {availableDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  playConfirmSound();
                  setFilterDay(d);
                }}
                className={`px-2 py-1 rounded-sm border text-[11px] shrink-0 transition-colors cursor-pointer ${
                  filterDay === d
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                    : 'border-[#262626] bg-[#0A0A0A] text-[#737373]'
                }`}
              >
                DAY {String(d).padStart(2, '0')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="border border-dashed border-[#262626] bg-[#141414]/70 p-12 text-center rounded-sm">
          <Camera className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h4 className="text-sm sm:text-base font-bold text-[#E5E5E5] mb-1">
            宝箱にまだ写真がありません
          </h4>
          <p className="text-xs text-[#737373]">
            日誌の記録作成時に写真を添付すると、この宝箱に自動的にコレクションされます。
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {filteredPhotos.map((item, idx) => (
            <button
              key={`${item.photo.id}-${idx}`}
              type="button"
              onClick={() => {
                playConfirmSound();
                setSelectedPhotoMeta(item);
              }}
              onMouseEnter={playHoverSound}
              className="group relative bg-[#141414] border border-[#262626] hover:border-[#D4AF37]/70 rounded-sm overflow-hidden text-left transition-all duration-150 hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <div className="w-full aspect-[4/3] bg-black overflow-hidden relative">
                <img
                  src={item.photo.url}
                  alt={item.photo.caption || item.record.locationName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/80 text-[#D4AF37] font-mono text-[9px] font-bold rounded-sm border border-[#333333]">
                  DAY {String(item.record.dayNumber).padStart(2, '0')}
                </span>
              </div>

              <div className="p-2.5 bg-[#0F0F0F] border-t border-[#262626]">
                <div className="text-xs font-bold text-[#E5E5E5] group-hover:text-[#D4AF37] truncate">
                  {item.record.locationName}
                </div>
                {item.record.coords ? (
                  <div className="text-[10px] text-[#D4AF37] font-mono font-medium mt-0.5 truncate">
                    X:{item.record.coords.x ?? 0} Z:{item.record.coords.z ?? 0}
                  </div>
                ) : (
                  <div className="text-[10px] text-[#737373] font-mono mt-0.5 truncate">
                    {item.record.recordedAt.split(' ')[0]}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Photo Detail Modal with Jump to Record Button */}
      {selectedPhotoMeta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-sans"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedPhotoMeta(null);
          }}
        >
          <div className="relative max-w-2xl w-full bg-[#141414] border border-[#D4AF37]/50 rounded-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[#262626]">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                  DAY {String(selectedPhotoMeta.record.dayNumber).padStart(2, '0')}
                </span>
                <span className="font-bold text-sm sm:text-base text-[#E5E5E5] truncate font-mono">
                  {selectedPhotoMeta.record.locationName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoMeta(null)}
                className="p-1 text-[#737373] hover:text-[#E5E5E5] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Photo Full */}
            <div className="p-4 space-y-3">
              <div className="w-full max-h-[55vh] bg-black rounded-sm overflow-hidden flex items-center justify-center border border-[#262626]">
                <img
                  src={selectedPhotoMeta.photo.url}
                  alt={selectedPhotoMeta.photo.caption || selectedPhotoMeta.record.locationName}
                  className="max-h-[55vh] w-full object-contain"
                />
              </div>

              {/* Meta information */}
              <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-sm text-xs font-mono space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[#D4AF37] font-medium">
                  {selectedPhotoMeta.record.coords && (
                    <span>
                      POS: X:{selectedPhotoMeta.record.coords.x ?? 0} Y:
                      {selectedPhotoMeta.record.coords.y ?? 0} Z:
                      {selectedPhotoMeta.record.coords.z ?? 0}
                    </span>
                  )}
                  <span className="text-[#737373]">
                    {selectedPhotoMeta.record.recordedAt}
                  </span>
                </div>

                <p className="text-[#A3A3A3] font-sans text-xs sm:text-sm leading-relaxed border-t border-[#262626] pt-1.5">
                  {selectedPhotoMeta.record.memo}
                </p>
              </div>

              {/* Jump to journal button */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const rec = selectedPhotoMeta.record;
                    setSelectedPhotoMeta(null);
                    onOpenRecord(rec);
                  }}
                  onMouseEnter={playHoverSound}
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono font-bold text-xs sm:text-sm border-b-2 border-[#A68824] rounded-sm flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <ExternalLink className="w-4 h-4 stroke-[3]" />
                  <span>この冒険日誌（記録）を開く</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
