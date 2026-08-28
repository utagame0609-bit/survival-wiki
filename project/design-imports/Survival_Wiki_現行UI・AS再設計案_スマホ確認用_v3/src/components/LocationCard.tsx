import React from 'react';
import { Shield, Youtube, Share2, MapPin, Users, Calendar } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { playHoverSound, playConfirmSound } from '../lib/soundEngine';

interface LocationCardProps {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onClick: () => void;
  onOpenSns: () => void;
}

export function LocationCard({
  world,
  location,
  onClick,
  onOpenSns,
}: LocationCardProps) {
  const primaryPhoto = location.photos[0]?.storage_path;
  const formattedDate = location.created_at
    ? new Date(location.created_at).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const memberNames = location.member_ids
    .map((id) => world.members.find((m) => m.id === id)?.name)
    .filter(Boolean) as string[];

  return (
    <div
      onClick={() => {
        playConfirmSound();
        onClick();
      }}
      onMouseEnter={playHoverSound}
      className="group relative border-2 border-slate-700/90 bg-[#161a25] hover:border-amber-400 transition-all shadow-[0_3px_12px_rgba(0,0,0,0.3)] flex flex-col justify-between cursor-pointer rounded-xs overflow-hidden"
    >
      {/* Top Image or Fallback */}
      <div className="relative aspect-video w-full bg-black border-b-2 border-slate-800 overflow-hidden">
        {primaryPhoto ? (
          <img
            src={primaryPhoto}
            alt={location.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1017] text-slate-500 font-mono text-xs gap-1">
            <MapPin className="w-6 h-6 text-amber-500/60" />
            <span>NO PHOTO</span>
          </div>
        )}

        {/* Checkpoint Tag Badge */}
        {location.is_checkpoint && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500/95 text-black font-mono text-[10px] font-black border border-amber-300 flex items-center gap-1 shadow-md rounded-xs">
            <Shield className="w-3 h-3" />
            <span>CHECKPOINT</span>
          </div>
        )}

        {/* YouTube Link Badge */}
        {location.youtube_url && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/95 text-white font-mono text-[9px] font-bold border border-red-400 flex items-center gap-1 shadow-md rounded-xs">
            <Youtube className="w-3 h-3" />
            <span>VIDEO</span>
          </div>
        )}

        {/* Bottom Coordinates Overlay on Photo */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-2.5 py-1.5 flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-amber-300 bg-black/60 px-1.5 py-0.2 border border-amber-500/50 rounded-xs">
            X:{location.x} Y:{location.y} Z:{location.z}
          </span>
          <span className="text-[10px] font-mono text-slate-300">
            {formattedDate}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 sm:p-3.5 space-y-2 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Location Title */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
            {location.name}
          </h3>

          {/* Memo Preview */}
          {location.detail_memo ? (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-sans">
              {location.detail_memo}
            </p>
          ) : (
            <p className="text-xs text-slate-500 italic font-mono">（メモ未入力）</p>
          )}
        </div>

        {/* Meta & Actions Footer */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          {/* Members Involved */}
          {memberNames.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                <Users className="w-2.5 h-2.5 text-cyan-400" />
              </span>
              {memberNames.map((name, i) => (
                <span
                  key={i}
                  className="px-1 py-0.2 bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[9px] font-mono font-bold rounded-xs"
                >
                  @{name}
                </span>
              ))}
            </div>
          )}

          {/* Tags & SNS Button */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {/* Tags */}
            <div className="flex items-center gap-1 overflow-hidden">
              {location.tags.slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-xs truncate max-w-[80px]"
                >
                  {t}
                </span>
              ))}
              {location.tags.length > 2 && (
                <span className="text-[9px] font-mono text-slate-500">
                  +{location.tags.length - 2}
                </span>
              )}
            </div>

            {/* SNS Share Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                playHoverSound();
                onOpenSns();
              }}
              onMouseEnter={playHoverSound}
              title="X (Twitter) ポストを作成"
              className="px-2 py-1 bg-cyan-950/60 border border-cyan-500/50 hover:bg-cyan-500 hover:text-black text-cyan-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer rounded-xs shrink-0"
            >
              <Share2 className="w-3 h-3" />
              <span>𝕏 共有</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
