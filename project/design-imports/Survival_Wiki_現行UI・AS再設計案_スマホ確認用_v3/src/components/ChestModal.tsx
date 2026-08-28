import React, { useState } from 'react';
import { X, Camera, MapPin, Calendar, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { playModalCloseSound, playHoverSound, playConfirmSound } from '../lib/soundEngine';

interface ChestModalProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onClose: () => void;
  onSelectLocation: (loc: LocationWithPhotos) => void;
}

export function ChestModal({
  world,
  locations,
  onClose,
  onSelectLocation,
}: ChestModalProps) {
  // Aggregate all photos from all locations
  const allPhotos = locations.flatMap((loc) =>
    loc.photos.map((p) => ({
      ...p,
      location: loc,
    }))
  );

  const [selectedPhoto, setSelectedPhoto] = useState<(typeof allPhotos)[0] | null>(
    allPhotos[0] || null
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-4xl bg-[#161a25] border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#11141e] border-b-2 border-amber-500/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500/20 border border-amber-400 text-amber-300 flex items-center justify-center font-bold text-xs">
              📦
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>CHEST // 宝箱ギャラリー</span>
                <span className="text-xs font-mono text-amber-400 font-bold">({allPhotos.length}枚)</span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playModalCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chest Main Layout */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto flex-1">
          {/* Photos Grid (Left 2 cols) */}
          <div className="md:col-span-2 space-y-2">
            <p className="text-xs text-slate-400 font-mono">
              各拠点・探索記録に紐づいたスクリーンショット一覧です。
            </p>

            {allPhotos.length === 0 ? (
              <div className="border border-slate-800 bg-[#10141f] p-8 text-center text-slate-500 font-mono text-xs">
                まだ写真が保存されていません。
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {allPhotos.map((item, idx) => {
                  const isSelected = selectedPhoto?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        playHoverSound();
                        setSelectedPhoto(item);
                      }}
                      className={`relative aspect-video bg-black border-2 overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 scale-102 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'border-slate-700 hover:border-slate-500 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={item.storage_path} alt="" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-amber-300 truncate text-left">
                        {item.location.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Photo Inspector (Right col) */}
          {selectedPhoto ? (
            <div className="border-2 border-slate-700 bg-[#11141e] p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div className="aspect-video bg-black border border-slate-800 overflow-hidden shadow-inner">
                  <img
                    src={selectedPhoto.storage_path}
                    alt={selectedPhoto.location.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">
                    POS X:{selectedPhoto.location.x} Y:{selectedPhoto.location.y} Z:{selectedPhoto.location.z}
                  </div>
                  <h3 className="font-bold text-sm text-white">
                    {selectedPhoto.location.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                    {selectedPhoto.location.detail_memo || '（メモなし）'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playConfirmSound();
                  onSelectLocation(selectedPhoto.location);
                  onClose();
                }}
                onMouseEnter={playHoverSound}
                className="w-full py-2.5 bg-amber-500 text-black font-black text-xs font-mono border-b-2 border-amber-700 hover:bg-amber-400 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>▶ このロケーション詳細を開く</span>
              </button>
            </div>
          ) : (
            <div className="border border-slate-800 bg-[#11141e] p-4 flex items-center justify-center text-slate-500 font-mono text-xs">
              写真を選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
