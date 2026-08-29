import { Camera, X } from 'lucide-react';
import type { RefObject } from 'react';
import { playHoverSound } from '@/lib/sound';

type LocationPhotoFieldProps = {
  preview: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (file: File | null) => void;
  onClear: () => void;
};

export function LocationPhotoField({ preview, inputRef, onSelect, onClear }: LocationPhotoFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
        <Camera className="w-4 h-4 text-amber-400" />
        TACTICAL PHOTO // 記録写真
      </label>
      {preview ? (
        <div className="relative overflow-hidden rounded-sm border-2 border-slate-700 bg-[#050a14] shadow-md group">
          <img src={preview} alt="メイン写真" className="w-full h-44 sm:h-52 object-cover pixelated" />
          <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
          <button
            type="button"
            onClick={onClear}
            onMouseEnter={playHoverSound}
            className="absolute top-2 right-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-sm bg-[#0a1120]/90 border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500 transition-all hover:-translate-y-[2px] shadow-md cursor-pointer"
            aria-label="写真を削除"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onMouseEnter={playHoverSound}
          className="group w-full min-h-[120px] rounded-sm border-2 border-dashed border-slate-700 bg-[#090d16] flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-400 hover:bg-[#0d1627] hover:-translate-y-[3px] transition-all cursor-pointer"
        >
          <Camera className="w-8 h-8 mb-2 text-amber-500/80 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-wide">カメラ / 写真ライブラリから選択</span>
          <span className="text-[10px] text-slate-600 mt-1">TAP TO SELECT</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
      />
    </div>
  );
}
