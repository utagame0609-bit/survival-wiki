import { ArrowLeft, Compass, Shield } from 'lucide-react';
import { playCancelSound } from '@/lib/sound';

export type NavigateFn = (to: string) => void;

export function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-[#0a1120] border-b-4 border-[#1a2333] shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Back Button & Emblem */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="command-btn flex items-center gap-1.5 px-3 py-2 rounded-sm bg-[#1a2333] text-zinc-300 hover:text-[#ffb000] hover:border-[#ffb000] active:scale-95 transition-all text-xs font-bold font-dot shrink-0"
            aria-label="ワールド選択へ戻る"
          >
            <ArrowLeft className="w-4 h-4 text-[#ffb000]" />
            <span className="hidden sm:inline">WORLD SELECT</span>
          </button>

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#ffb000] to-[#cc8e00] flex items-center justify-center rounded-sm border border-white/20 shadow-md shrink-0">
              <span className="text-[#0a1120] font-black text-lg sm:text-xl font-mono">A</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-[#ffb000] tracking-wide uppercase truncate">
                {title}
              </h1>
              <p className="text-[9px] sm:text-[10px] text-zinc-500 font-bold font-mono tracking-wider truncate">
                VER 1.0.4 - ADVENTURE LOG SYSTEM
              </p>
            </div>
          </div>
        </div>

        {/* Right: Live Telemetry & Status Badges */}
        <div className="flex items-center gap-3 shrink-0 font-mono">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">STATUS</p>
            <p className="text-xs text-[#32cd32] font-bold">LOG OPEN</p>
          </div>
          <div className="w-px h-6 sm:h-8 bg-zinc-800 hidden sm:block" />
          <div className="text-right">
            <p className="text-[9px] text-zinc-500 uppercase font-bold">SYSTEM</p>
            <p className="text-xs text-[#ffb000] font-bold">ONLINE</p>
          </div>
        </div>
      </div>
    </header>
  );
}

