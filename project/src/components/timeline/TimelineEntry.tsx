import { Clock, MapPin } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { TimelinePhoto } from './TimelinePhoto';

type TimelineEntryProps = {
  loc: LocationWithPhotos;
};

export function TimelineEntry({ loc }: TimelineEntryProps) {
  const time = new Date(loc.created_at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const mainPhoto = loc.photos.find((photo) => photo.is_main);
  const hasMemo = Boolean(loc.detail_memo?.trim());

  return (
    <article className="overflow-hidden bg-[#12151f] border border-[#2d3548] hover:border-slate-600 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {mainPhoto ? (
          <div className="w-full sm:w-32 h-36 sm:h-auto sm:min-h-32 shrink-0 overflow-hidden bg-[#0b0f17] border-b sm:border-b-0 sm:border-r border-[#2d3548]">
            <TimelinePhoto storagePath={mainPhoto.storage_path} alt={loc.name} className="w-full h-full object-cover pixelated" />
          </div>
        ) : (
          <div className="w-full sm:w-20 h-14 sm:h-auto sm:min-h-20 shrink-0 bg-[#0b0f17] border-b sm:border-b-0 sm:border-r border-[#2d3548] flex items-center justify-center text-slate-600">
            <MapPin className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0 p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-bold text-white break-words">{loc.name}</h4>
            </div>
            <span className="shrink-0 text-[10px] sm:text-xs text-slate-400 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3" />{time}
            </span>
          </div>

          {hasMemo && (
            <p className="mt-2.5 text-xs sm:text-sm text-slate-100 leading-relaxed bg-[#161a24] p-3 border border-[#2d3548] whitespace-pre-wrap break-words">
              {loc.detail_memo}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
