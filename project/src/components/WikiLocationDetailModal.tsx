import { FileText, MapPin, X } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { playHoverSound } from '@/lib/sound';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

type WikiLocationDetailModalProps = {
  location: LocationWithPhotos;
  onClose: () => void;
};

export function WikiLocationDetailModal({ location, onClose }: WikiLocationDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <button aria-label="閉じる" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-hidden rounded-sm bg-[#0a1120] text-[#e2e8f0] border-4 border-double border-[#ffb000] shadow-[0_0_25px_rgba(255,176,0,0.2),inset_0_0_10px_rgba(255,176,0,0.1)] flex flex-col motion-safe:animate-[wiki-modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0 border-b-2 border-[#1a2333] bg-[#0d1627] text-[#ffb000]">
          <div className="text-xs tracking-wider flex items-center gap-2.5">
            <img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="w-6 h-6 object-cover rounded-sm border border-[#ffb000]" />
            <span className="font-bold text-[#ffb000]">ウタペディア</span>
            <span className="text-zinc-600 font-mono">//</span>
            <span className="text-zinc-300">ロケーション詳細</span>
          </div>
          <button onClick={onClose} aria-label="閉じる" onMouseEnter={playHoverSound} className="p-1 rounded-sm text-zinc-400 hover:bg-[#1a2333] hover:text-[#ffb000] transition-colors border border-transparent hover:border-[#334155]">
            <X className="w-[18px] h-[18px]" />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain p-5 space-y-4">
          <div className="flex items-center gap-2 border-l-4 border-[#ffb000] pl-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#ffb000] break-words">{location.name}</h2>
          </div>

          <div className="p-1 rounded-sm border-2 border-[#334155] bg-[#0d1627]">
            {(() => {
              const mainPhoto = location.photos.find((photo) => photo.is_main);
              return mainPhoto ? (
                <LocationPhotoImage storagePath={mainPhoto.storage_path} alt={location.name} className="w-full h-48 sm:h-56 object-cover rounded-sm" />
              ) : (
                <div className="w-full h-48 sm:h-56 bg-[#1a2333] rounded-sm flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-zinc-600" />
                </div>
              );
            })()}
          </div>

          <table className="w-full text-xs border-collapse rounded-sm overflow-hidden border-2 border-[#1a2333] bg-[#0d1627]">
            <tbody>
              <tr className="border-b border-[#1a2333]">
                <th className="w-1/3 bg-[#1a2333] p-2.5 text-left font-bold text-[#ffb000] border-r border-[#1a2333]">座標 (X, Y, Z)</th>
                <td className={`p-2.5 font-mono font-bold ${location.has_coordinates ? 'text-[#32cd32]' : 'text-zinc-500'}`}>
                  {location.has_coordinates ? `X: ${location.x} / Y: ${location.y} / Z: ${location.z}` : '未入力'}
                </td>
              </tr>
              <tr>
                <th className="bg-[#1a2333] p-2.5 text-left font-bold text-[#ffb000] border-r border-[#1a2333]">記録日時</th>
                <td className="p-2.5 text-zinc-300 font-mono">{new Date(location.created_at).toLocaleString('ja-JP')}</td>
              </tr>
            </tbody>
          </table>

          <div className="p-3 text-xs rounded-sm border-l-4 bg-[#0d1627] border-[#32cd32] text-zinc-300">
            <div className="font-bold mb-1 flex items-center gap-1.5 text-[#32cd32]"><FileText className="w-3.5 h-3.5" /><span>記録資料</span></div>
            <p className="text-zinc-400 text-[11px] leading-relaxed font-mono">このロケーションは、ウタペディア冒険の書に永久記録された関連資料です。</p>
          </div>
        </div>

        <div className="p-3 bg-[#0d1627] border-t-2 border-[#1a2333] flex justify-end">
          <button onClick={onClose} onMouseEnter={playHoverSound} className="px-4 py-2 bg-[#1a2333] text-[#ffb000] text-xs font-bold font-mono border border-[#334155] hover:border-[#ffb000] transition-colors">閉じる (ESC)</button>
        </div>
      </div>

      <style>{`@keyframes wiki-modal-enter { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } } @media (prefers-reduced-motion: reduce) { .motion-safe\\:animate-\\[wiki-modal-enter_180ms_cubic-bezier\\(.22\\,.8\\,.35\\,1)\\] { animation: none !important; } }`}</style>
    </div>
  );
}
