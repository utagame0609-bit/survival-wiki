import { Play } from 'lucide-react';

export type BgmCandidate = {
  id: 'bgm_world_select' | 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
  name: string;
  nameJa: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
};

type BgmCandidateCardProps = {
  candidate: BgmCandidate;
  isPlaying: boolean;
  onPlay: (candidate: BgmCandidate) => void;
};

export function BgmCandidateCard({ candidate, isPlaying, onPlay }: BgmCandidateCardProps) {
  return (
    <div
      className={`bg-[#1e2330] border-2 p-4 flex flex-col justify-between transition-all ${
        isPlaying
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] bg-[#12262d]'
          : 'border-cyan-500/30 hover:border-cyan-500/60'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] px-2 py-0.5 bg-[#141824] border border-cyan-500/30 text-cyan-300 font-bold">
              {candidate.id === 'bgm_world_select' ? 'WORLD / SAVE BGM' : 'NPC PERSONALITY BGM'}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white mt-1.5">{candidate.nameJa}</h3>
            <p className="text-[10px] text-cyan-400 font-mono">{candidate.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onPlay(candidate)}
            className={`min-h-[44px] min-w-[44px] p-3 border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              isPlaying
                ? 'border-cyan-400 bg-cyan-400 text-black scale-105 shadow-[0_0_12px_#22d3ee]'
                : 'border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-400 hover:text-black active:scale-95'
            }`}
            title={isPlaying ? '停止' : 'ループ試聴'}
          >
            <Play className="w-4 h-4 fill-current" />
          </button>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed mb-3">{candidate.description}</p>
      </div>
      <div className="pt-2.5 border-t border-[#2d3548] space-y-1 text-[10px] sm:text-xs font-mono text-slate-300">
        <div className="flex items-center justify-between text-cyan-400 font-bold">
          <span>TONE: {candidate.toneInfo}</span>
        </div>
        <div className="text-slate-400">演出: {candidate.keyCharacteristic}</div>
      </div>
    </div>
  );
}
