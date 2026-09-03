import { ChevronDown, ChevronUp, Sliders, Sparkles, Smartphone, X } from 'lucide-react';
import { useState } from 'react';
import { SoundStudioPanel } from '@/components/settings/SoundStudioPanel';
import { playConfirmSound, playHoverSound, playModalCloseSound } from '@/lib/sound';
import type { BeforeInstallPromptEvent } from '@/lib/pwaInstall';
import { BasicSoundSettings } from '@/components/settings/BasicSoundSettings';
import { SettingsAppActions } from '@/components/settings/SettingsAppActions';

type SettingsModalProps = {
  onClose: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstallPromptUsed: () => void;
};

export function SettingsModal({ onClose, installPrompt, onInstallPromptUsed }: SettingsModalProps) {
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
    window.dispatchEvent(new CustomEvent('survival-wiki:settings-closed'));
  };

  if (soundStudioOpen) {
    return (
      <SoundStudioPanel
        onBack={() => {
          setSoundStudioOpen(false);
          window.dispatchEvent(new CustomEvent('survival-wiki:sound-studio-closed'));
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05080E]/85 p-2 font-mono backdrop-blur-md sm:p-4">
      <button aria-label="設定を閉じる" className="absolute inset-0" onClick={handleClose} />

      <div className="hud-bracket relative z-10 my-auto w-full max-w-lg overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3 sm:py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <Sliders className="h-4 w-4 shrink-0 text-[#F59E0B]" />
            <h2 className="truncate text-sm font-bold tracking-wider text-[#F8FAFC]">
              SYSTEM CONFIG // 設定
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            aria-label="設定を閉じる"
            className="rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className={`${advancedOpen ? 'max-h-[calc(100dvh-8rem)] overflow-y-auto' : 'overflow-visible'} space-y-3 p-3 sm:max-h-[80vh] sm:space-y-5 sm:overflow-y-auto sm:p-5`}
        >
          <section className="space-y-2.5 rounded-lg border border-[#1E293B] bg-[#0B1018]/80 p-3 sm:space-y-3.5 sm:p-3.5">
            <div className="text-xs font-bold text-[#F59E0B]">16-bit 音響システム設定</div>
            <BasicSoundSettings />
          </section>

          <section className="overflow-hidden rounded-lg border border-[#1E293B] bg-[#0B1018]/60">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                setAdvancedOpen((current) => !current);
              }}
              onMouseEnter={playHoverSound}
              aria-expanded={advancedOpen}
              className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-[#161F30]/80 sm:py-3"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold tracking-wide text-[#F8FAFC]">詳細設定</div>
                <div className="mt-0.5 truncate text-[10px] text-[#64748B]">SOUND STUDIO / PWA / APP ACTIONS</div>
              </div>
              {advancedOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-[#F59E0B]" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-[#94A3B8]" />
              )}
            </button>

            {advancedOpen && (
              <div className="space-y-4 border-t border-[#1E293B] p-3.5">
                <button
                  type="button"
                  onClick={() => {
                    playConfirmSound();
                    setSoundStudioOpen(true);
                  }}
                  onMouseEnter={playHoverSound}
                  className="flex w-full items-center justify-center gap-1.5 rounded border border-[#F59E0B]/40 bg-[#161F30] px-3 py-2 text-xs font-bold text-[#F59E0B] shadow-sm transition-all hover:border-[#F59E0B] hover:bg-[#1E293B]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>SOUND STUDIO // 効果音テスト室を開く</span>
                </button>

                <div className="space-y-3 border-t border-[#1E293B] pt-4">
                  <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                    <Smartphone className="h-3.5 w-3.5 text-[#06B6D4]" />
                    <span>スマートフォン・PWA対応</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#64748B]">
                    ホーム画面へ追加すると、フルスクリーン起動に対応したスタンドアロンHUDとして利用できます。
                  </p>
                  <SettingsAppActions installPrompt={installPrompt} onInstallPromptUsed={onInstallPromptUsed} />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#1E293B] bg-[#0B1018] px-4 py-2.5 text-xs text-[#64748B] sm:py-3">
          <span className="truncate">UTAPEDIA SURVIVAL WIKI</span>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="shrink-0 rounded bg-[#F59E0B] px-4 py-1.5 text-xs font-bold text-[#0B1018] transition-colors hover:bg-[#D97706]"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
