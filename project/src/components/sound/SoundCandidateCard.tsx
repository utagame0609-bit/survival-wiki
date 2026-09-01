import { Play } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';
import type { SoundCandidate } from '@/lib/soundCandidates';

type SoundCandidateCardProps = {
  candidate: SoundCandidate;
  isPlaying: boolean;
  onPlay: (candidate: SoundCandidate) => void;
};

export function SoundCandidateCard({ candidate, isPlaying, onPlay }: SoundCandidateCardProps) {
  return (
    <button
      type="button"
      onClick={() => onPlay(candidate)}
      onMouseEnter={playHoverSound}
      className={`group relative flex min-h-[112px] flex-col justify-between overflow-hidden rounded-lg border p-3 text-left transition-all duration-150 ${
        isPlaying
          ? 'scale-[0.98] border-[#F59E0B] bg-[#F59E0B]/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
          : 'border-[#1E293B] bg-[#0B1018]/90 hover:border-[#06B6D4]/50 hover:bg-[#131E35]'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="line-clamp-1 text-xs font-bold text-[#F8FAFC] transition-colors group-hover:text-[#FDE68A]">
            {candidate.nameJa}
          </div>
          <div className="mt-0.5 truncate font-mono text-[9px] text-[#64748B]">{candidate.name}</div>
        </div>
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
            isPlaying
              ? 'border-[#F59E0B] bg-[#F59E0B] text-[#0B1018]'
              : 'border-[#334155] bg-[#161F30] text-[#06B6D4] group-hover:border-[#06B6D4]'
          }`}
        >
          <Play className="ml-0.5 h-3 w-3 fill-current" />
        </div>
      </div>

      <p className="line-clamp-2 text-[11px] leading-relaxed text-[#94A3B8]">{candidate.description}</p>

      <div className="mt-2 flex items-center justify-between border-t border-[#1E293B] pt-1 font-mono text-[9px] text-[#64748B]">
        <span className="truncate">{candidate.toneInfo}</span>
        <span className="ml-2 shrink-0 uppercase text-[#06B6D4]">{candidate.categoryJa}</span>
      </div>
    </button>
  );
}
