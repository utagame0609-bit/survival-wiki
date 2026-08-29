import type { LocationWithPhotos } from '@/lib/types';

type LocationDetailInfoProps = {
  location: LocationWithPhotos;
};

export function LocationDetailInfo({ location }: LocationDetailInfoProps) {
  return (
    <>
      <div className="p-4 bg-[#141824] border border-[#2d3548]">
        <h4 className="text-xs text-amber-400 font-bold uppercase mb-2">共有URL // SHARE URL</h4>
        <p className="text-slate-500 text-sm leading-relaxed">共有URL機能は現在準備中です。</p>
      </div>

      {location.members.length > 0 && (
        <div>
          <h4 className="text-xs text-cyan-400 font-bold uppercase mb-2">同行メンバー</h4>
          <div className="flex flex-wrap gap-2">
            {location.members.map((member) => (
              <span
                key={member.id}
                className="px-2.5 py-1 bg-[#12151f] border border-cyan-500/40 text-cyan-300 text-xs font-medium"
              >
                @{member.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-slate-400 text-right font-mono">
        記録日時: {new Date(location.created_at).toLocaleString('ja-JP')}
      </div>
    </>
  );
}
