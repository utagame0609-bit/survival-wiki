import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { CalendarDays, FileText, MapPin, X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { fetchLocations } from '@/lib/db';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';
import { playHoverSound, playModalCloseSound } from '@/lib/sound';

type Props = {
  worldId: string;
  location: LocationWithPhotos;
  onClose: () => void;
};

function formatRecordedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function RoseRelatedRecordModal({ worldId, location, onClose }: Props) {
  const [resolvedLocation, setResolvedLocation] = useState(location);

  useEffect(() => {
    let active = true;
    setResolvedLocation(location);

    fetchLocations(worldId)
      .then((locations) => {
        if (!active) return;
        const fullLocation = locations.find((item) => item.id === location.id);
        if (fullLocation) setResolvedLocation(fullLocation);
      })
      .catch(() => {
        // Keep the article-side location data as a safe fallback.
      });

    return () => {
      active = false;
    };
  }, [worldId, location.id]);

  const mainPhoto = resolvedLocation.photos.find((photo) => photo.is_main) ?? resolvedLocation.photos[0] ?? null;

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  return createPortal((
    <div
      className="fixed inset-0 z-[240] flex items-center justify-center overflow-y-auto bg-[#09090b]/90 p-3 backdrop-blur-md sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden border-2 border-[#171315] bg-[#D8C6A5] text-[#171315] shadow-[10px_10px_0px_rgba(0,0,0,0.55)] sm:border-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-15 [background-image:radial-gradient(rgba(23,19,21,0.25)_1px,transparent_0)] [background-size:4px_4px]"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -top-1 left-[18%] h-7 w-24 -rotate-2 border border-[#171315]/20 bg-[#CDB991]/90 shadow-sm" aria-hidden="true" />

        <header className="relative z-10 flex shrink-0 items-start justify-between gap-4 border-b-4 border-[#171315] px-4 pb-3 pt-5 sm:px-7 sm:pb-4 sm:pt-7">
          <div className="min-w-0">
            <div className="font-['Cinzel',serif] text-[10px] font-black uppercase tracking-[0.2em] text-[#6E1F2B] sm:text-xs">
              ROSE'S LAST CALL // ARCHIVE CLIPPING
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="font-['Shippori_Mincho',serif] text-xl font-black leading-tight sm:text-3xl">RELATED DISPATCH</h2>
              <span className="border-2 border-[#6E1F2B] bg-[#6E1F2B]/10 px-2 py-0.5 font-serif text-[10px] font-black text-[#6E1F2B] sm:text-xs">関連記録</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            aria-label="閉じる"
            className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-[#171315] bg-[#171315] text-[#E7D9BE] transition-transform hover:-rotate-3 hover:scale-105 sm:h-10 sm:w-10"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 sm:px-7 sm:py-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-7">
            <div className="min-w-0">
              <div className="relative rotate-[-1deg] border-2 border-[#171315] bg-[#E7D9BE] p-2 shadow-[5px_5px_0px_#171315]">
                {mainPhoto ? (
                  <LocationPhotoImage
                    storagePath={mainPhoto.storage_path}
                    alt={resolvedLocation.name}
                    className="aspect-[4/3] w-full object-cover contrast-[1.03] sepia-[0.08]"
                  />
                ) : (
                  <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#BFAE8E]">
                    <MapPin className="h-12 w-12 text-[#66504A]" />
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#171315]/25 pt-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#66504A]">
                  <span>ARCHIVE PHOTO</span>
                  <span>{mainPhoto ? 'PRIMARY RECORD' : 'NO PHOTO'}</span>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="inline-block border border-[#6E1F2B] bg-[#6E1F2B] px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-widest text-[#E7D9BE]">REPORT CARD</div>
              <h3 className="mt-2 break-words border-b-2 border-[#171315] pb-2 font-['Shippori_Mincho',serif] text-xl font-black leading-snug sm:text-2xl">{resolvedLocation.name}</h3>

              <dl className="mt-3 divide-y divide-[#171315]/25 border-y border-[#171315]/35 text-xs sm:text-sm">
                <div className="grid grid-cols-[72px_1fr] gap-3 py-2">
                  <dt className="flex items-center gap-1 font-black text-[#6E1F2B]"><CalendarDays className="h-3.5 w-3.5" />日時</dt>
                  <dd className="min-w-0 font-mono font-bold">{formatRecordedAt(resolvedLocation.created_at)}</dd>
                </div>
                {resolvedLocation.has_coordinates && (
                  <div className="grid grid-cols-[72px_1fr] gap-3 py-2">
                    <dt className="flex items-center gap-1 font-black text-[#6E1F2B]"><MapPin className="h-3.5 w-3.5" />座標</dt>
                    <dd className="min-w-0 break-words font-mono font-bold">X:{resolvedLocation.x} Y:{resolvedLocation.y} Z:{resolvedLocation.z}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 border-l-4 border-[#6E1F2B] bg-[#171315]/5 p-3.5 sm:p-4">
                <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-black uppercase tracking-wider text-[#6E1F2B]">
                  <FileText className="h-3.5 w-3.5" />
                  RECORD MEMO
                </div>
                <p className="whitespace-pre-wrap break-words font-['Shippori_Mincho',serif] text-sm leading-[1.8] sm:text-[15px]">
                  {resolvedLocation.detail_memo || 'この記録には詳細メモが残されていない。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-t-4 border-[#6E1F2B] bg-[#171315] px-4 py-3 text-[#D8C6A5] sm:px-7">
          <span className="font-['Cinzel',serif] text-[10px] font-black uppercase tracking-widest sm:text-xs">SURVIVAL WIKI ❖ RELATED DISPATCH</span>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="border border-[#D8C6A5]/50 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-wider transition-colors hover:border-[#B78A45] hover:text-[#B78A45]"
          >
            CLOSE
          </button>
        </footer>
      </section>
    </div>
  ), document.body);
}
