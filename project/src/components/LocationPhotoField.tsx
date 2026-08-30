import { Camera, Trash2, Upload } from 'lucide-react';
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
      <label className="mb-1.5 flex items-center justify-between text-xs game-ui-font text-[#94A3B8]">
        <span className="flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-[#06B6D4]" />
          記録写真（端末から写真を選択）
        </span>
        {preview && (
          <button
            type="button"
            onClick={onClear}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-0.5 text-[10px] text-[#EF4444] hover:underline cursor-pointer"
          >
            <Trash2 className="w-2.5 h-2.5" />
            写真を解除
          </button>
        )}
      </label>

      {preview ? (
        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-[#F59E0B]/60 bg-[#0B1018] group">
          <img src={preview} alt="メイン写真" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onMouseEnter={playHoverSound}
              className="px-3 py-1.5 rounded bg-[#161F30] text-xs game-ui-font text-[#F8FAFC] border border-[#334155] hover:border-[#F59E0B] cursor-pointer"
            >
              写真を変更
            </button>
            <button
              type="button"
              onClick={onClear}
              onMouseEnter={playHoverSound}
              className="px-3 py-1.5 rounded bg-[#2A161C] text-xs game-ui-font text-[#EF4444] border border-[#EF4444]/40 cursor-pointer"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onMouseEnter={playHoverSound}
          className="w-full py-6 px-4 rounded-lg border-2 border-dashed border-[#334155] hover:border-[#06B6D4]/60 bg-[#0B1018]/60 hover:bg-[#101926] transition-all cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-10 h-10 rounded-full bg-[#161F30] border border-[#334155] flex items-center justify-center text-[#06B6D4]">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <div className="text-xs game-ui-font text-[#F1F5F9] font-bold">
              写真ファイルを選択
            </div>
            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
              PNG / JPG / WEBP に対応
            </div>
          </div>
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
