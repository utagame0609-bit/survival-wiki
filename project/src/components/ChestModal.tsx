import { useState } from 'react';
import { Camera, X, Sparkles, MapPin, ExternalLink, Shield } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playConfirmSound, playModalCloseSound, playHoverSound } from '@/lib/sound';
import { ChestPhotoCard } from '@/components/ChestPhotoCard';
import { ChestFullImage } from '@/components/ChestFullImage';
import type { CollectionItem } from '@/components/locations/locationData';

type ChestModalProps = {
  collectionItems: CollectionItem[];
  onClose: () => void;
  onOpenLocation: (location: LocationWithPhotos) => void;
};

type CheckpointLocation = LocationWithPhotos & {
  is_checkpoint?: boolean;
};

function isCheckpointLocation(location: LocationWithPhotos): boolean {
  return Boolean((location as CheckpointLocation).is_checkpoint);
}

export function ChestModal({ collectionItems, onClose, onOpenLocation }: ChestModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CollectionItem | null>(null);
  const checkpointItems = collectionItems.filter((item) => isCheckpointLocation(item.location));
  const hasCheckpoint = checkpointItems.length > 0;
  const selectedIsCheckpoint = selectedPhoto ? isCheckpointLocation(selectedPhoto.location) : false;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleOpenLocation = () => {
    if (!selectedPhoto) return;
    playConfirmSound();
    onOpenLocation(selectedPhoto.location);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-[#1e2330] border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.28)] overflow-hidden flex flex-col motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#161a24] border-b-2 border-amber-500/60 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span aria-hidden="true" className="relative flex h-7 w-7 shrink-0 items-center justify-center border border-amber-400 bg-amber-500/20 text-amber-300 font-bold text-xs">📦</span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                CHEST // 宝箱ギャラリー <span className="font-mono text-amber-400">({collectionItems.length}枚)</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">各拠点・探索記録に紐づいたスクリーンショット一覧</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} onMouseEnter={playHoverSound} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1">
          {collectionItems.length === 0 ? (
            <div className="py-14 text-center">
              <Camera className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="text-sm font-bold text-white">まだ写真が保存されていません。</p>
              <p className="text-xs text-slate-400 mt-1">記録に写真を添付するとここに保管されます。</p>
            </div>
          ) : (
            <div className={hasCheckpoint ? 'grid grid-cols-1 md:grid-cols-3 gap-4 items-start' : 'block'}>
              <div className={hasCheckpoint ? 'md:col-span-2 space-y-2' : 'space-y-2'}>
                {hasCheckpoint && checkpointItems.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-300 pb-0.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>CHECKPOINT PHOTO // 大きく表示できる重要拠点</span>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {collectionItems.map((item, index) => {
                    const selected = selectedPhoto?.storagePath === item.storagePath && selectedPhoto?.location.id === item.location.id;
                    const checkpoint = isCheckpointLocation(item.location);
                    return (
                      <div key={`${item.storagePath}-${index}`} className={selected ? 'ring-2 ring-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]' : ''}>
                        <ChestPhotoCard item={item} onClick={() => setSelectedPhoto(item)} />
                        {checkpoint && (
                          <div className="mt-0.5 px-1.5 py-0.5 bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[8px] font-mono font-bold text-center">
                            CHECKPOINT
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {hasCheckpoint && (
                <aside className="border-2 border-slate-700 bg-[#11141e] p-3.5 flex flex-col gap-3 md:sticky md:top-0">
                  {selectedPhoto && selectedIsCheckpoint ? (
                    <>
                      <div className="aspect-video bg-black border border-slate-800 overflow-hidden">
                        <ChestFullImage storagePath={selectedPhoto.storagePath} alt={selectedPhoto.location.name} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-emerald-400 font-bold">
                          POS X:{selectedPhoto.location.x} Y:{selectedPhoto.location.y} Z:{selectedPhoto.location.z}
                        </div>
                        <h3 className="text-sm font-bold text-white line-clamp-2">{selectedPhoto.location.name}</h3>
                        <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed">
                          {selectedPhoto.location.detail_memo || '（メモなし）'}
                        </p>
                      </div>
                      <button type="button" onClick={handleOpenLocation} onMouseEnter={playHoverSound} className="w-full min-h-[44px] py-2.5 bg-amber-500 text-black font-black text-xs font-mono border-b-2 border-amber-700 hover:bg-amber-400 flex items-center justify-center gap-1.5 cursor-pointer">
                        <ExternalLink className="w-4 h-4" />
                        <span>このロケーション詳細を開く</span>
                      </button>
                    </>
                  ) : (
                    <div className="min-h-[220px] flex flex-col items-center justify-center text-center text-slate-500 font-mono text-xs gap-2">
                      <Shield className="w-8 h-8 text-amber-500/50" />
                      <span>重要チェックポイントの写真を選択してください</span>
                    </div>
                  )}
                </aside>
              )}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-t-2 border-[#2d3548] flex justify-between items-center text-[10px] sm:text-xs text-slate-400 font-mono shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CAPACITY: UNLIMITED</span>
          </div>
          <button type="button" onClick={handleClose} onMouseEnter={playHoverSound} className="min-h-[38px] px-4 py-1.5 bg-[#141824] text-slate-200 hover:text-amber-400 border border-slate-700 hover:border-amber-500 font-bold text-xs cursor-pointer">
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
