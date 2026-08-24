import { X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { EmptyState } from '@/components/Feedback';
import { playModalOpenSound, playChestOpenSound } from '@/lib/sound';

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
    <div className="fixed inset-0 z-40 bg-[#11120f] text-stone-100 overflow-y-auto">
      <div className="min-h-full px-4 py-4 max-w-3xl mx-auto">
        <div className="flex items-center justify-between h-12 border-b border-[#2d3028] mb-5">
          <div className="flex items-center gap-2">
            <span className="relative block w-5 h-4 rounded-[2px] border border-amber-700/80 bg-gradient-to-b from-amber-700/90 to-amber-900/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(0,0,0,0.35)]" aria-hidden="true">
              <span className="absolute left-[-1px] right-[-1px] top-[4px] h-[3px] border-y border-amber-500/60 bg-amber-800/90" />
              <span className="absolute left-1/2 top-[5px] -translate-x-1/2 w-[3px] h-[4px] rounded-[1px] border border-amber-300/60 bg-amber-500/80" />
            </span>
            <h2 className="text-sm font-semibold tracking-[0.14em] text-zinc-200">COLLECTION</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="コレクションを閉じる" className="w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:bg-[#292b24] hover:text-stone-100 active:scale-[0.96] transition-all"><X className="w-5 h-5" /></button>
        </div>
        {collectionItems.length === 0 ? (
          <EmptyState message="まだ記録写真がありません。" />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
            {collectionItems.map((item) => (
              <CollectionSlot key={`${item.location.id}-${item.storagePath}`} item={item} onOpen={() => { playModalOpenSound(); onOpenLocation(item.location); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CollectionSlot({ item, onOpen }: { item: CollectionItem; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="group aspect-square rounded-md border border-zinc-700/90 bg-[#1b1c18] p-1.5 sm:p-2 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02),inset_0_0_14px_rgba(0,0,0,0.45)] hover:border-emerald-700/70 hover:bg-[#20221d] active:scale-[0.98] transition-all">
    <div className="relative w-full h-full overflow-hidden rounded-sm bg-zinc-950 border border-zinc-800/90">
      <img src={getPhotoUrl(item.storagePath)} alt={item.location.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]" />
      <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-gradient-to-t from-black/80 via-black/45 to-transparent pt-4">
        <div className="text-[10px] sm:text-[11px] text-zinc-200 truncate">{item.location.name}</div>
      </div>
    </div>
  </button>;
}
