import { useEffect, useState } from 'react';
import { X, Sparkles, MapPin, Image as ImageIcon } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playCancelSound, playCardOpenSound } from '@/lib/sound';

type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

export function ChestModal({
  collectionItems,
  onClose,
  onOpenLocation
}: {
  collectionItems: CollectionItem[];
  onClose: () => void;
  onOpenLocation: (loc: LocationWithPhotos) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCancelSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl max-h-[85vh] rounded-sm bg-[#0d1627] border-2 border-[#1a2333] shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#e2e8f0] font-dot">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0a1120] border-b-2 border-[#1a2333] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-sm border border-[#ffb000] bg-[#ffb000]/20 flex items-center justify-center">
              <span className="w-2 h-2 bg-[#ffb000] rounded-sm" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#ffb000] tracking-wide font-mono">
                TREASURE CHEST // 旅の宝箱
              </h2>
              <p className="text-[10px] text-zinc-400 font-mono">
                収集した記憶の欠片・写真コレクション ({collectionItems.length})
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="w-8 h-8 rounded-sm border border-[#334155] bg-[#1a2333] text-zinc-400 hover:text-[#ffb000] hover:border-[#ffb000] flex items-center justify-center transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {collectionItems.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 space-y-2 font-mono">
              <Sparkles className="w-8 h-8 mx-auto text-[#ffb000]/50" />
              <p className="text-xs">まだ宝箱に写真や遺物が収められていません。</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {collectionItems.map((item, idx) => (
                <ChestCard
                  key={idx}
                  item={item}
                  onClick={() => {
                    playCardOpenSound();
                    onOpenLocation(item.location);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0a1120] border-t-2 border-[#1a2333] flex justify-between items-center text-[11px] text-zinc-400 font-mono">
          <span>クリックで該当ロケーションを表示</span>
          <button
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="command-btn px-4 py-1.5 rounded-sm bg-[#1a2333] border border-[#334155] text-[#ffb000] font-dot font-bold"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}

function ChestCard({ item, onClick }: { key?: string | number; item: CollectionItem; onClick: () => void }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    getPhotoUrl(item.storagePath).then(setSrc);
  }, [item.storagePath]);

  return (
    <button
      onClick={onClick}
      className="group relative text-left rounded-sm overflow-hidden bg-[#0a1120] border-2 border-[#1a2333] hover:border-[#ffb000] hover:shadow-[0_0_15px_rgba(255,176,0,0.2)] transition-all flex flex-col"
    >
      <div className="w-full aspect-[4/3] bg-[#050a14] overflow-hidden relative">
        {src ? (
          <img
            src={src}
            alt={item.location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <ImageIcon className="w-6 h-6" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1120] via-transparent to-transparent opacity-80" />
      </div>
      <div className="p-2.5 bg-[#0d1627]">
        <div className="text-xs font-bold text-zinc-200 group-hover:text-[#ffb000] truncate">
          {item.location.name}
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#32cd32] font-mono mt-0.5">
          <MapPin className="w-2.5 h-2.5" />
          <span>{item.location.x}, {item.location.y}, {item.location.z}</span>
        </div>
      </div>
    </button>
  );
}
