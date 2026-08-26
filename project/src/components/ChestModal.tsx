import { useState, useEffect } from 'react';
import { X, Sparkles, MapPin, ExternalLink, Camera } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { playConfirmSound, playCancelSound, playModalCloseSound } from '@/lib/sound';

type CollectionItem = {
  location: LocationWithPhotos;
  storagePath: string;
};

type ChestModalProps = {
  collectionItems: CollectionItem[];
  onClose: () => void;
  onOpenLocation: (location: LocationWithPhotos) => void;
};

export function ChestModal({ collectionItems, onClose, onOpenLocation }: ChestModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CollectionItem | null>(null);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm font-mono"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#161a24] border-b-2 border-[#2d3548]">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="relative block w-6 h-5 border-2 border-amber-400 bg-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              <span className="absolute left-0 right-0 top-[4px] h-[2px] bg-[#141824]" />
              <span className="absolute left-1/2 top-[4px] -translate-x-1/2 w-[4px] h-[4px] bg-amber-300" />
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">宝箱コレクション</h2>
              <p className="text-xs text-slate-300 font-mono">旅の中で記録された全 {collectionItems.length} 枚の探検写真</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {collectionItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Camera className="w-12 h-12 mx-auto text-slate-500 mb-2" />
              <p className="text-sm font-bold text-white">まだ宝箱に写真がありません。</p>
              <p className="text-xs text-slate-400 mt-1">ロケーション作成時に写真を添付するとここに保管されます。</p>
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

        <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-t-2 border-[#2d3548] flex justify-between items-center text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CAPACITY: UNLIMITED</span>
          </div>
          <button type="button" onClick={handleClose} className="min-h-[38px] px-4 py-1.5 bg-[#141824] text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500 font-bold text-xs cursor-pointer">
            閉じる
          </button>
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-mono"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              playModalCloseSound();
              setSelectedPhoto(null);
            }
          }}
        >
          <div className="relative max-w-2xl w-full bg-[#1e2330] border-2 border-amber-500 overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between px-4 py-3 bg-[#161a24] border-b border-[#2d3548]">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-white truncate">{selectedPhoto.location.name}</span>
              </div>
              <button type="button" onClick={() => { playModalCloseSound(); setSelectedPhoto(null); }} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer" aria-label="写真を閉じる">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ChestFullImage storagePath={selectedPhoto.storagePath} alt={selectedPhoto.location.name} />
              <div className="mt-3 p-3 bg-[#141824] border border-[#2d3548] text-xs font-mono">
                <div className="flex items-center justify-between gap-3 text-emerald-400 font-bold">
                  <span>POS: X:{selectedPhoto.location.x} Y:{selectedPhoto.location.y} Z:{selectedPhoto.location.z}</span>
                  <span className="text-slate-400 shrink-0">{new Date(selectedPhoto.location.created_at).toLocaleDateString('ja-JP')}</span>
                </div>
                {selectedPhoto.location.detail_memo && <p className="mt-2 text-slate-200 leading-relaxed border-t border-[#2d3548] pt-2 font-sans text-xs sm:text-sm">{selectedPhoto.location.detail_memo}</p>}
              </div>
              <div className="mt-3 flex justify-end">
                <button type="button" onClick={() => {
                  playConfirmSound();
                  const loc = selectedPhoto.location;
                  setSelectedPhoto(null);
                  onClose();
                  onOpenLocation(loc);
                }} className="min-h-[44px] px-4 py-2 bg-amber-500 text-black font-black border-b-2 border-amber-700 hover:bg-amber-400 text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer">
                  <ExternalLink className="w-4 h-4 stroke-[3]" />
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
    let active = true;
    getPhotoUrl(item.storagePath).then((url) => { if (active) setSrc(url); }).catch(() => {});
    return () => { active = false; };
  }, [item.storagePath]);

  return (
    <button type="button" onClick={onClick} className="group relative overflow-hidden bg-[#141824] border-2 border-[#2d3548] hover:border-amber-400 transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.5)] text-left cursor-pointer">
      <div className="w-full aspect-[4/3] bg-[#12151f] overflow-hidden">
        {src ? <img src={src} alt={item.location.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 pixelated" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><Camera className="w-6 h-6" /></div>}
      </div>
      <div className="p-2.5 bg-[#161a24] border-t border-[#2d3548]">
        <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">{item.location.name}</div>
        <div className="text-[10px] text-emerald-400 font-mono mt-0.5 font-bold">X:{item.location.x} Z:{item.location.z}</div>
      </div>
    </button>
  );
}

function ChestFullImage({ storagePath, alt }: { storagePath: string; alt: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => { getPhotoUrl(storagePath).then(setSrc).catch(() => {}); }, [storagePath]);
  if (!src) return <div className="w-full h-72 bg-[#070c18] animate-pulse" />;
  return <img src={src} alt={alt} className="w-full max-h-[60vh] object-contain bg-black pixelated" />;
}
