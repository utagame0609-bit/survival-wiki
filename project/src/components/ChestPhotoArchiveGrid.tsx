import { Shield } from 'lucide-react';
import { ChestFullImage } from '@/components/ChestFullImage';
import type { CollectionItem } from '@/lib/chestCollection';
import { playConfirmSound, playHoverSound } from '@/lib/sound';

type ChestPhotoArchiveGridProps = {
  items: CollectionItem[];
  selectedIndex: number;
  onSelect: (item: CollectionItem) => void;
};

type CheckpointLocation = CollectionItem['location'] & {
  is_checkpoint?: boolean;
};

function isCheckpointLocation(location: CollectionItem['location']): boolean {
  return Boolean((location as CheckpointLocation).is_checkpoint);
}

export function ChestPhotoArchiveGrid({ items, selectedIndex, onSelect }: ChestPhotoArchiveGridProps) {
  return (
    <div className="space-y-2 lg:col-span-5">
      <div className="game-ui-font flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
        <span>写真アーカイブ一覧</span>
        <span className="text-[10px] text-[#64748B]">タップで拡大プレビュー</span>
      </div>

      <div className="grid max-h-[380px] grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-3">
        {items.map((item, index) => {
          const isSelected = selectedIndex === index;
          return (
            <button
              key={`${item.storagePath}-${item.location.id}-${index}`}
              type="button"
              onClick={() => {
                playConfirmSound();
                onSelect(item);
              }}
              onMouseEnter={playHoverSound}
              className={`group relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                isSelected
                  ? 'scale-95 border-[#F59E0B] ring-2 ring-[#F59E0B]/40 shadow-md'
                  : 'border-[#1E293B] opacity-75 hover:border-[#06B6D4]/60 hover:opacity-100'
              }`}
              aria-label={`${item.location.name} の写真を表示`}
            >
              <ChestFullImage storagePath={item.storagePath} alt={item.location.name} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1018] to-transparent p-1">
                <div className="game-ui-font truncate text-[8px] leading-tight text-[#F1F5F9]">
                  {item.location.name}
                </div>
              </div>
              {isCheckpointLocation(item.location) && (
                <div className="absolute left-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F59E0B] text-[#0B1018]">
                  <Shield className="h-2.5 w-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
