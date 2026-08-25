import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { EmptyState } from '@/components/Feedback';
import { playModalOpenSound } from '@/lib/sound';

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
  return (
    <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md text-slate-100 overflow-y-auto font-mono flex items-center justify-center p-3 sm:p-6">
      <div className="relative z-10 w-full max-w-4xl max-h-[calc(100vh-32px)] overflow-hidden rounded-sm bg-[#0a1120] border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1627] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="relative block w-5 h-4 rounded-[1px] border border-amber-500 bg-amber-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" aria-hidden="true">
              <span className="absolute left-[-1px] right-[-1px] top-[4px] h-[2px] bg-[#06090e]" />
              <span className="absolute left-1/2 top-[5px] -translate-x-1/2 w-[2px] h-[3px] bg-amber-300" />
            </span>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">TACTICAL PHOTO ARCHIVE</p>
              <h2 className="text-sm sm:text-base font-bold text-amber-400 uppercase tracking-wider">宝箱コレクション (CHEST LOG)</h2>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="コレクションを閉じる" className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-400 hover:bg-[#1a2333] hover:text-amber-400 transition-colors border border-transparent hover:border-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6">
          {collectionItems.length === 0 ? (
            <EmptyState message="まだ記録写真がありません。" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {collectionItems.map((item, idx) => (
                <CollectionSlot key={`${item.location.id}-${item.storagePath}`} slotNumber={idx + 1} item={item} onOpen={() => { playModalOpenSound(); onOpenLocation(item.location); }} />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-[#0d1627] flex-shrink-0 text-xs text-slate-400">
          <span>TOTAL ARCHIVES: <strong className="text-emerald-400">{collectionItems.length}</strong></span>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-sm bg-[#1a2333] border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 font-bold text-xs uppercase cursor-pointer">
            閉じる (CLOSE)
          </button>
        </div>
      </div>
    </div>
  );
}

function CollectionSlot({ item, slotNumber, onOpen }: { item: CollectionItem; slotNumber: number; onOpen: () => void }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    getPhotoUrl(item.storagePath)
      .then((url) => {
        if (!active) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url.startsWith('blob:') ? url : null;
        setSrc(url);
      })
      .catch(() => {
        if (active) setSrc(null);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [item.storagePath]);

  return (
    <button type="button" onClick={onOpen} className="group relative aspect-square rounded-sm border border-slate-800 bg-[#090d16] p-1 text-left shadow-md hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-[0.98] transition-all cursor-pointer overflow-hidden flex flex-col">
      <div className="relative w-full h-full overflow-hidden rounded-sm bg-[#050a14] border border-slate-800">
        {src ? (
          <img src={src} alt={item.location.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-[#050a14]" aria-hidden="true" />
        )}
        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-sm bg-[#06090e]/90 border border-slate-700 text-[9px] font-mono text-amber-400 font-bold">
          SLOT {String(slotNumber).padStart(2, '0')}
        </span>
        <div className="absolute inset-x-0 bottom-0 px-2 py-1.5 bg-gradient-to-t from-[#06090e] via-[#06090e]/80 to-transparent pt-4">
          <div className="text-[11px] font-bold text-slate-200 group-hover:text-amber-400 truncate">{item.location.name}</div>
        </div>
      </div>
    </button>
  );
}
