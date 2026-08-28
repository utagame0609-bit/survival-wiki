import React, { useState, useMemo } from 'react';
import { Camera, Search, Filter, Sparkles, MapPin, Calendar, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { World, LogEntry, PhotoItem } from '../../types';
import { sound } from '../../audio/soundEngine';

interface ChestGalleryViewProps {
  world: World;
  logs: LogEntry[];
  onOpenLog: (log: LogEntry) => void;
}

export const ChestGalleryView: React.FC<ChestGalleryViewProps> = ({
  world,
  logs,
  onOpenLog,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Flatten all photos linked with their parent Log
  const allPhotosWithLog = useMemo(() => {
    const list: { photo: PhotoItem; log: LogEntry }[] = [];
    logs.forEach((log) => {
      if (log.photos && log.photos.length > 0) {
        log.photos.forEach((photo) => {
          list.push({ photo, log });
        });
      }
    });
    return list.sort(
      (a, b) => new Date(b.log.createdAt).getTime() - new Date(a.log.createdAt).getTime()
    );
  }, [logs]);

  // Unique locations for filter
  const locationsWithPhotos = useMemo(() => {
    const set = new Set<string>();
    allPhotosWithLog.forEach((item) => set.add(item.log.locationName));
    return Array.from(set);
  }, [allPhotosWithLog]);

  const filteredPhotos = useMemo(() => {
    if (!selectedLocation) return allPhotosWithLog;
    return allPhotosWithLog.filter((item) => item.log.locationName === selectedLocation);
  }, [allPhotosWithLog, selectedLocation]);

  return (
    <div className="space-y-4 pb-24 font-sans">
      {/* Chest Banner */}
      <div className="bg-[#121214] border-2 border-[#ff8c00] rounded-xl p-4 shadow-[4px_4px_0px_#000000] space-y-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="relative block w-6 h-5 border-2 border-[#ff8c00] bg-[#ff8c00]/30 shadow-[2px_2px_0px_#000000]">
              <span className="absolute left-0 right-0 top-[4px] h-[2px] bg-[#0a0a0c]" />
              <span className="absolute left-1/2 top-[4px] -translate-x-1/2 w-[4px] h-[4px] bg-white" />
            </span>
            <h3 className="text-sm font-black text-white terminal-font tracking-wider">
              CHEST ARCHIVE // 宝箱ギャラリー
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#ff8c00]/20 text-[#ff8c00] terminal-font text-[10px] font-bold border border-[#ff8c00]">
            {allPhotosWithLog.length} PHOTOS
          </span>
        </div>
        <p className="text-xs text-[#aaaaaa] leading-relaxed">
          旅の中で記録されたすべての探検写真・スクリーンショットが収蔵されています。写真をタップすると、その瞬間の日誌記録を開くことができます。
        </p>
      </div>

      {/* Location Filter Pills */}
      {locationsWithPhotos.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          <button
            type="button"
            onClick={() => {
              sound.playHover();
              setSelectedLocation(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs terminal-font font-bold shrink-0 transition cursor-pointer shadow-[2px_2px_0px_#000000] ${
              selectedLocation === null
                ? 'bg-[#ff8c00] text-black'
                : 'bg-[#141417] text-[#888888] hover:text-white border border-[#333338]'
            }`}
          >
            ALL PHOTOS ({allPhotosWithLog.length})
          </button>
          {locationsWithPhotos.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => {
                sound.playHover();
                setSelectedLocation(selectedLocation === loc ? null : loc);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs terminal-font shrink-0 transition cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_#000000] ${
                selectedLocation === loc
                  ? 'bg-[#ffa500] text-black font-bold'
                  : 'bg-[#141417] text-[#888888] hover:text-[#ff8c00] border border-[#333338]'
              }`}
            >
              <MapPin className="w-3 h-3" />
              <span>{loc}</span>
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {allPhotosWithLog.length === 0 && (
        <div className="border-2 border-dashed border-[#333338] bg-[#121214] rounded-xl p-10 text-center text-[#888888] text-xs terminal-font space-y-2 shadow-[3px_3px_0px_#000000]">
          <Camera className="w-10 h-10 mx-auto text-[#666666] mb-2" />
          <p className="font-bold text-white text-sm">宝箱に写真がまだありません</p>
          <p>日誌に写真を添付すると、この宝箱ギャラリーに自動保存されます。</p>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredPhotos.map(({ photo, log }) => (
          <div
            key={photo.id}
            onClick={() => {
              sound.playConfirm();
              onOpenLog(log);
            }}
            onMouseEnter={() => sound.playHover()}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-black border-2 border-[#333338] hover:border-[#ff8c00] transition-all duration-200 cursor-pointer shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#ff8c00]"
          >
            <img
              src={photo.url}
              alt={photo.caption || log.locationName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Gradient Overlay & Meta */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
              <div className="flex items-center gap-1 text-[10px] terminal-font text-[#ff8c00] font-bold">
                <MapPin className="w-3 h-3 text-[#ff8c00] shrink-0" />
                <span className="truncate">{log.locationName}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] terminal-font text-[#888888] mt-0.5">
                <span>DAY {String(log.dayNumber).padStart(2, '0')}</span>
                <span className="text-[#00ff41] font-bold flex items-center gap-0.5">
                  OPEN <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
