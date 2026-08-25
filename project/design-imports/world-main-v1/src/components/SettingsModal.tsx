import { useState } from 'react';
import { Settings, Volume2, VolumeX, Sparkles, X, Shield } from 'lucide-react';
import { playConfirmSound, playModalOpenSound, playModalCloseSound } from '@/lib/sound';

export function SettingsButton() {
  const [open, setOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleOpen = () => {
    if (!open) {
      playModalOpenSound();
      setOpen(true);
    } else {
      playModalCloseSound();
      setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleOpen}
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-sm bg-[#0d1627] border-2 border-[#1a2333] text-[#ffb000] hover:border-[#ffb000] shadow-[0_4px_15px_rgba(0,0,0,0.8)] flex items-center justify-center active:scale-95 transition-all"
        aria-label="設定を開く"
        title="システム設定"
      >
        <Settings className="w-5 h-5 animate-spin-slow" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) toggleOpen();
          }}
        >
          <div className="w-full max-w-sm rounded-sm bg-[#0d1627] border-2 border-[#1a2333] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden text-[#e2e8f0] font-dot">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a1120] border-b-2 border-[#1a2333]">
              <div className="flex items-center gap-2 text-[#ffb000] font-bold font-mono">
                <Sparkles className="w-4 h-4 text-[#ffb000]" />
                <span>SYSTEM CONFIG // 環境設定</span>
              </div>
              <button
                onClick={toggleOpen}
                className="w-7 h-7 rounded-sm border border-[#334155] bg-[#1a2333] text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-sm bg-[#0a1120] border border-[#1a2333]">
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#32cd32]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-500" />
                  )}
                  <div>
                    <div className="font-bold text-zinc-200">効果音（8bit/16bit SE）</div>
                    <div className="text-[10px] text-zinc-400 font-mono">レトロゲーム効果音の再生</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playConfirmSound();
                    setSoundEnabled(!soundEnabled);
                  }}
                  className={`command-btn px-3 py-1 rounded-sm font-bold font-mono transition-all ${
                    soundEnabled
                      ? 'bg-[#32cd32] text-[#0a1120] border border-[#32cd32] shadow-[0_0_10px_rgba(50,205,50,0.3)]'
                      : 'bg-[#1a2333] border-[#334155] text-zinc-400'
                  }`}
                >
                  {soundEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3 rounded-sm bg-[#0a1120] border border-[#1a2333] space-y-1 text-zinc-400 text-[11px] leading-relaxed font-mono">
                <div className="text-[#ffb000] font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>【案A：クエスト日記・旅の書】</span>
                </div>
                <p>Elegant Dark × 16bitレトロゲームの冒険の書デザインシステムが適用されています。</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#0a1120] border-t border-[#1a2333] text-center">
              <button
                onClick={toggleOpen}
                className="command-btn w-full py-2 rounded-sm bg-[#1a2333] hover:bg-[#223048] border border-[#334155] text-[#ffb000] font-bold text-xs"
              >
                決定して閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
