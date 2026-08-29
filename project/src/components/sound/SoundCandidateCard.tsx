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
    <div
      className={`bg-[#1e2330] border-2 p-4 flex flex-col justify-between transition-all ${
        isPlaying
          ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-[#142820]'
          : 'border-[#2d3548] hover:border-slate-500'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] px-2 py-0.5 bg-[#141824] border border-slate-700 text-slate-300 font-bold">
              {candidate.categoryJa}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white mt-1.5">{candidate.nameJa}</h3>
            <p className="text-[10px] text-slate-400 font-mono">{candidate.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onPlay(candidate)}
            onMouseEnter={playHoverSound}
            className={`min-h-[44px] min-w-[44px] p-3 border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isPlaying
                ? 'border-emerald-400 bg-emerald-400 text-black scale-105 shadow-[0_0_12px_#34d399]'
                : 'border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-black active:scale-95'
            }`}
            title="試聴・再生"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed mb-3">{candidate.description}</p>
      </div>
      <div className="pt-2.5 border-t border-[#2d3548] space-y-1 text-[10px] sm:text-xs font-mono text-slate-300">
        <div className="flex items-center justify-between text-emerald-400 font-bold">
          <span>TONE: {candidate.toneInfo}</span>
        </div>
        <div className="text-slate-400">演出: {candidate.keyCharacteristic}</div>
      </div>
    </div>
  );
}
