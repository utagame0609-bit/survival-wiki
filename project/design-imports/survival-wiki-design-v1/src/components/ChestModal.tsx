import { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, ExternalLink, Camera } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playConfirmSound, playCancelSound, playModalCloseSound } from '@/lib/sound';

interface CollectionItem {
  location: LocationWithPhotos;
  storagePath: string;
}

interface ChestModalProps {
  collectionItems: CollectionItem[];
  onClose: () => void;
  onOpenLocation: (location: LocationWithPhotos) => void;
}

export function ChestModal({ collectionItems, onClose, onOpenLocation }: ChestModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CollectionItem | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm font-mono"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a1120] border-2 border-amber-500/60 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0d1627] border-b-2 border-[#1a2333]">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="relative block w-5 h-4 border border-amber-500 bg-amber-600 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            >
              <span className="absolute left-0 right-0 top-[3px] h-[2px] bg-[#0a1120]" />
              <span className="absolute left-1/2 top-[3px] -translate-x-1/2 w-[3px] h-[4px] bg-amber-300" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-amber-400 font-mono tracking-wide">
                TREASURE ARCHIVE // 宝箱コレクション
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                旅の中で記録された全 {collectionItems.length} 枚の探検写真
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {collectionItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono">
              <Camera className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-xs">まだ宝箱に写真がありません。</p>
              <p className="text-[11px] text-slate-600 mt-1">
                ロケーション作成時に写真を添付するとここに保管されます。
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {collectionItems.map((item, idx) => (
                <ChestPhotoCard
                  key={`${item.storagePath}-${idx}`}
                  item={item}
                  onClick={() => {
                    playConfirmSound();
                    setSelectedPhoto(item);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0d1627] border-t border-[#1a2333] flex justify-between items-center text-[10px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>COLLECTION CAPACITY: UNLIMITED</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="px-4 py-1.5 bg-[#070c18] text-slate-300 hover:text-amber-400 border border-slate-700 hover:border-amber-500 font-bold"
          >
            閉じる
          </button>
        </div>
      </div>

      {/* Full Photo Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              playCancelSound();
              setSelectedPhoto(null);
            }
          }}
        >
          <div className="relative max-w-2xl w-full bg-[#0a1120] border-2 border-amber-500 overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.3)]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d1627] border-b border-[#1a2333]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-400 truncate">
                  {selectedPhoto.location.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ChestFullImage storagePath={selectedPhoto.storagePath} alt={selectedPhoto.location.name} />
              <div className="mt-3 p-3 bg-[#070c18] border border-[#1a2333] text-xs font-mono">
                <div className="flex items-center justify-between text-emerald-400">
                  <span>POS: X:{selectedPhoto.location.x} Y:{selectedPhoto.location.y} Z:{selectedPhoto.location.z}</span>
                  <span className="text-slate-500">{new Date(selectedPhoto.location.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {selectedPhoto.location.detail_memo && (
                  <p className="mt-2 text-slate-300 leading-relaxed border-t border-[#1a2333] pt-2">
                    {selectedPhoto.location.detail_memo}
                  </p>
                )}
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playConfirmSound();
                    const loc = selectedPhoto.location;
                    setSelectedPhoto(null);
                    onClose();
                    onOpenLocation(loc);
                  }}
                  className="px-4 py-2 bg-amber-500 text-black font-bold border-b-2 border-amber-700 hover:bg-amber-400 text-xs flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>この拠点詳細を開く</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChestPhotoCard({ item, onClick }: { item: CollectionItem; onClick: () => void }) {
  const [src, setSrc] = useState('');

  useEffect(() => {
    getPhotoUrl(item.storagePath).then(setSrc).catch(() => {});
  }, [item.storagePath]);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden bg-[#070c18] border-2 border-[#1a2333] hover:border-amber-500 transition-all hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] text-left cursor-pointer"
    >
      <div className="w-full aspect-[4/3] bg-[#050811] overflow-hidden">
        {src ? (
          <img
            src={src}
            alt={item.location.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pixelated"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <Camera className="w-6 h-6" />
          </div>
        )}
      </div>
      <div className="p-2 bg-[#0d1627] border-t border-[#1a2333]">
        <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400 truncate">
          {item.location.name}
        </div>
        <div className="text-[9px] text-emerald-400 font-mono mt-0.5">
          X:{item.location.x} Z:{item.location.z}
        </div>
      </div>
    </button>
  );
}

function ChestFullImage({ storagePath, alt }: { storagePath: string; alt: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    getPhotoUrl(storagePath).then(setSrc).catch(() => {});
  }, [storagePath]);

  if (!src) return <div className="w-full h-72 bg-[#070c18] animate-pulse" />;
  return <img src={src} alt={alt} className="w-full max-h-[60vh] object-contain bg-black pixelated" />;
}
