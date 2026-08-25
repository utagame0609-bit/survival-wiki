import { ArrowLeft, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toggleSound, isSoundMuted, playConfirmSound } from '@/lib/sound';

export type NavigateFn = (route: { name: string; [key: string]: any }) => void;

export function Header({ title, onBack }: { title: string; onBack?: () => void }) {
  const [muted, setMuted] = useState(isSoundMuted());

  const handleToggleSound = () => {
    const isNowMuted = !toggleSound();
    setMuted(isNowMuted);
  };

  return (
    <header className="sticky top-0 z-40 border-b-2 border-white/20 bg-[#0a1120]/95 backdrop-blur-md px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onBack();
              }}
              className="pixel-btn flex h-8 items-center gap-1.5 px-3 text-[10px] text-[#0a1120]"
              title="もどる"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>BACK</span>
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center border-2 border-white bg-[#1a2333] text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="pixel-font text-[8px] tracking-widest amber-text crt-glow">SURVIVAL WIKI</div>
              <h1 className="retro-font text-sm font-bold tracking-wider text-[#f0f0f0] sm:text-base">
                {title || 'サバイバル・ワールド記録'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleSound}
            className="flex h-8 items-center gap-1.5 border border-white/30 bg-[#162032] px-2.5 retro-font text-xs text-zinc-300 hover:border-white hover:text-white transition-colors"
            title={muted ? 'BGM/SEをオンにする' : 'ミュートにする'}
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-[#3df30b]" />}
            <span className="hidden sm:inline pixel-font text-[8px]">{muted ? 'MUTE' : 'SOUND'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
