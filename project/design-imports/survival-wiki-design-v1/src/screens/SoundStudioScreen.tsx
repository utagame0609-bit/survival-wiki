import { useState, useEffect } from 'react';
import { Volume2, Play, Waves, Radio, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Navigation';
import { SOUND_CANDIDATES, type SoundCandidate } from '@/lib/soundCandidates';
import { playSoundCandidatePreview } from '@/lib/soundCandidatePreviewEngine';
import { getStoredReverbAmount, setStoredReverbAmount } from '@/lib/soundReverb';
import { playCancelSound, playConfirmSound } from '@/lib/sound';

export function SoundStudioScreen({ goBack }: { goBack: () => void }) {
  const [reverb, setReverb] = useState<number>(() => Math.round(getStoredReverbAmount() * 100));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  useEffect(() => {
    setStoredReverbAmount(reverb / 100);
  }, [reverb]);

  const categories = [
    { id: 'all', label: '全SE (ALL)' },
    { id: 'system', label: 'システム操作音' },
    { id: 'screen', label: '画面・ナビゲーション音' },
    { id: 'action', label: 'キャラクター＆アクション音' },
    { id: 'wiki', label: 'Wiki編纂・AI演出音' },
  ];

  const filteredCandidates = SOUND_CANDIDATES.filter((c) =>
    selectedCategory === 'all' ? true : c.category === selectedCategory
  );

  const handlePlay = (candidate: SoundCandidate) => {
    setActivePlayingId(candidate.id);
    playSoundCandidatePreview(candidate.id);
    setTimeout(() => {
      setActivePlayingId(null);
    }, 400);
  };

  return (
    <div className="relative min-h-screen bg-[#070c18] text-[#f0f0f0] font-mono flex flex-col select-none overflow-x-hidden">
      <div className="scanline-overlay" />
      <Header title="SOUND STUDIO // 16BIT 音響研究所" onBack={goBack} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-6 sm:px-8 flex-1 flex flex-col space-y-6">
        {/* Studio Header Card */}
        <div className="rounded-sm bg-[#0a1120] border-4 border-double border-[#ffb000] p-5 shadow-[0_0_25px_rgba(255,176,0,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-[#32cd32] animate-pulse" />
              <span className="text-[10px] font-bold text-[#32cd32] uppercase">
                WEB AUDIO API 16BIT SYNTHESIS ENGINE
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-[#ffb000]">
              効果音・BGM デザインコンソール
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              本番アプリへ移植可能な各UI・画面アクション用SEの試聴・検証用スタジオです。
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playCancelSound();
              goBack();
            }}
            className="px-4 py-2 bg-[#10192d] border border-[#334155] text-zinc-300 hover:text-[#ffb000] hover:border-[#ffb000] rounded-sm text-xs font-bold flex items-center gap-1.5 self-start md:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>アプリへ戻る</span>
          </button>
        </div>

        {/* Global Reverb Studio Control */}
        <div className="p-4 sm:p-5 rounded-sm bg-[#0d1627] border-2 border-[#1a2333] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Waves className="w-4 h-4" />
              <span>グローバル空間反響 (MASTER REVERB)</span>
            </div>
            <span className="text-sm font-bold text-[#ffb000]">{reverb}%</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={reverb}
            onChange={(e) => setReverb(Number(e.target.value))}
            className="w-full accent-[#ffb000] cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-zinc-500">
            <span>DRY (0% - クリスプ・直接音)</span>
            <span>DUNGEON (50% - 地下洞窟)</span>
            <span>CATHEDRAL (100% - 深宇宙大聖堂)</span>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 border-b-2 border-[#1a2333] pb-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  playConfirmSound();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-sm text-xs font-bold transition-all border ${
                  isSelected
                    ? 'border-[#ffb000] bg-[#10192d] text-[#ffb000] shadow-[0_0_10px_rgba(255,176,0,0.2)]'
                    : 'border-[#334155] bg-[#0d1627] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Sound Candidate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((candidate) => {
            const isPlaying = activePlayingId === candidate.id;
            return (
              <div
                key={candidate.id}
                className={`rounded-sm bg-[#0d1627] border-2 p-4 flex flex-col justify-between transition-all ${
                  isPlaying
                    ? 'border-[#32cd32] shadow-[0_0_20px_rgba(50,205,50,0.25)] bg-[#10221c]'
                    : 'border-[#1a2333] hover:border-zinc-500'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#050a14] border border-[#334155] text-zinc-400">
                        {candidate.categoryJa}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-100 mt-1">{candidate.nameJa}</h3>
                      <p className="text-[10px] text-zinc-500 font-mono">{candidate.name}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePlay(candidate)}
                      className={`p-3 rounded-sm border flex items-center justify-center transition-all shrink-0 ${
                        isPlaying
                          ? 'border-[#32cd32] bg-[#32cd32] text-black scale-110 shadow-[0_0_12px_#32cd32]'
                          : 'border-[#ffb000] bg-[#ffb000]/10 text-[#ffb000] hover:bg-[#ffb000] hover:text-black active:scale-95'
                      }`}
                      title="試聴・再生"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    {candidate.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1a2333] space-y-1 text-[10px] font-mono text-zinc-400">
                  <div className="flex items-center justify-between text-[#32cd32]">
                    <span>TONE: {candidate.toneInfo}</span>
                  </div>
                  <div className="text-zinc-500">演出: {candidate.keyCharacteristic}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
