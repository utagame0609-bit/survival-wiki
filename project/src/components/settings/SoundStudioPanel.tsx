import { useEffect, useRef, useState } from 'react';
import { Sparkles, Volume2, Waves, X } from 'lucide-react';
import { BgmCandidateCard } from '@/components/sound/BgmCandidateCard';
import { SoundCandidateCard } from '@/components/sound/SoundCandidateCard';
import { BGM_CANDIDATES, type BgmCandidate } from '@/lib/bgmCandidates';
import { SOUND_CANDIDATES, type SoundCandidate } from '@/lib/soundCandidates';
import { isAudioPlaying, playSoundCandidatePreview, stopActiveAudio, subscribeSoundState } from '@/lib/soundCandidatePreviewEngine';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { getActiveBgmTarget, isWorldBgmPlaying, playWorldBgm, restoreBgmTarget, stopAllBgm, stopWorldBgm, type BgmTarget } from '@/lib/bgm';
import { playCancelSound, playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';

export function SoundStudioPanel({ onBack }: { onBack: () => void }) {
  const [reverb, setReverb] = useState<number>(() => Math.round(getStoredReverbAmount() * 100));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const previousBgmRef = useRef<BgmTarget>(null);

  useEffect(() => subscribeToReverbAmount((value) => setReverb(Math.round(value * 100))), []);
  useEffect(() => subscribeSoundState((id, isPlaying) => setActivePlayingId(isPlaying ? id : null)), []);
  useEffect(() => {
    previousBgmRef.current = getActiveBgmTarget();
    stopAllBgm(0);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      stopActiveAudio();
      stopAllBgm(0);
      restoreBgmTarget(previousBgmRef.current);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleClose = () => {
    playCancelSound();
    onBack();
  };

  const handleReverbChange = (value: number) => {
    setReverb(value);
    setStoredReverbAmount(value / 100);
  };

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'system', label: 'SYSTEM / UI' },
    { id: 'screen', label: 'SCREEN / NAV' },
    { id: 'action', label: 'ACTION & FX' },
    { id: 'wiki', label: 'WIKI & NPC' },
    { id: 'new_high', label: 'V2 HIGH' },
    { id: 'new_medium', label: 'V2 MID' },
    { id: 'bgm', label: 'BGM' },
  ];

  const filteredCandidates = selectedCategory === 'all'
    ? SOUND_CANDIDATES
    : selectedCategory === 'bgm'
      ? []
      : SOUND_CANDIDATES.filter((candidate) => candidate.category === selectedCategory);
  const showBgm = selectedCategory === 'all' || selectedCategory === 'bgm';

  const handlePlay = (candidate: SoundCandidate) => {
    if (isWorldBgmPlaying()) stopWorldBgm(0);
    setActivePlayingId(candidate.id);
    playSoundCandidatePreview(candidate.id);
    window.setTimeout(() => {
      if (!isAudioPlaying(candidate.id)) setActivePlayingId(null);
    }, 500);
  };

  const handleBgmPlay = (candidate: BgmCandidate) => {
    if (candidate.id === 'bgm_world_select') {
      if (isWorldBgmPlaying()) {
        stopWorldBgm(0);
        setActivePlayingId(null);
        return;
      }
      stopActiveAudio();
      playWorldBgm();
      setActivePlayingId(candidate.id);
      return;
    }

    if (isWorldBgmPlaying()) stopWorldBgm(0);
    setActivePlayingId(candidate.id);
    playSoundCandidatePreview(candidate.id);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#05080E]/90 p-2 backdrop-blur-md sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="hud-scanlines relative my-auto flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-[#F59E0B] bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#F59E0B] bg-[#161F30]">
              <Sparkles className="h-4 w-4 text-[#F59E0B]" />
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase leading-none tracking-widest text-[#06B6D4]">
                16-BIT CHIP-SYNTH CONSOLE
              </div>
              <h3 className="mt-0.5 truncate text-sm font-bold tracking-wider text-[#F8FAFC] sm:text-base">
                SOUND STUDIO // 効果音・BGM検証室
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            aria-label="Sound Studioを閉じる"
            className="rounded-lg p-1.5 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#1E293B] bg-[#0D1424] px-4 py-2.5">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                playConfirmSound();
                setSelectedCategory(category.id);
              }}
              onMouseEnter={playHoverSound}
              className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-bold transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#F59E0B] text-[#0B1018] shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'border border-[#334155] bg-[#161F30] text-[#94A3B8] hover:text-[#F8FAFC]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="mb-4 rounded-lg border border-[#1E293B] bg-[#0B1018]/80 p-3.5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-[#94A3B8]">
                <Waves className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
                <span className="truncate">REVERB DEPTH (空間残響)</span>
              </div>
              <span className="shrink-0 font-mono text-xs font-bold text-[#06B6D4]">{reverb}%</span>
            </div>
            <input
              aria-label="サウンドスタジオの残響量"
              type="range"
              min="0"
              max="100"
              value={reverb}
              onChange={(event) => handleReverbChange(Number(event.target.value))}
              onFocus={playInputFocusSound}
              onMouseEnter={playHoverSound}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-[#161F30] accent-[#06B6D4]"
            />
          </div>

          {showBgm && (
            <section className="mb-5 space-y-2.5">
              <div className="flex items-center gap-2 border-b border-[#1E293B] pb-2">
                <Volume2 className="h-4 w-4 text-[#06B6D4]" />
                <h4 className="text-xs font-bold tracking-wider text-[#F8FAFC]">BGM CANDIDATES // {BGM_CANDIDATES.length} TRACKS</h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {BGM_CANDIDATES.map((candidate) => (
                  <BgmCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isPlaying={activePlayingId === candidate.id}
                    onPlay={handleBgmPlay}
                  />
                ))}
              </div>
            </section>
          )}

          {selectedCategory !== 'bgm' && (
            <section className="space-y-2.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCandidates.map((candidate) => (
                  <SoundCandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isPlaying={activePlayingId === candidate.id}
                    onPlay={handlePlay}
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#1E293B] bg-[#0B1018] px-4 py-3 font-mono text-xs text-[#64748B]">
          <span className="min-w-0 truncate">WEB AUDIO API // PREVIEW CONSOLE</span>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="shrink-0 rounded bg-[#161F30] px-4 py-1.5 text-xs font-bold text-[#F8FAFC] transition-colors hover:bg-[#1E293B]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
