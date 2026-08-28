import { Settings, Disc, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SoundStudioScreen } from '@/screens/SoundStudioScreen';
import { playConfirmSound, playModalCloseSound } from '@/lib/sound';
import { BasicSoundSettings } from '@/components/BasicSoundSettings';
import { WorldBgmChannelSettings } from '@/components/WorldBgmChannelSettings';
import { SettingsAppActions } from '@/components/SettingsAppActions';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> };
type SettingsModalProps = { onClose: () => void; installPrompt: BeforeInstallPromptEvent | null; onInstallPromptUsed: () => void };

type SettingsButtonProps = {
  showButton?: boolean;
};

export function SettingsButton({ showButton = true }: SettingsButtonProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleOpenSettings = () => {
      playConfirmSound();
      setSettingsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('survival-wiki:settings', handleOpenSettings);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('survival-wiki:settings', handleOpenSettings);
    };
  }, []);

  return (
    <>
      {showButton && (
        <button
          type="button"
          onClick={() => { playConfirmSound(); setSettingsOpen(true); }}
          aria-label="設定"
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center border-2 border-amber-500/80 bg-[#0d1627] text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-500 hover:text-slate-950 active:scale-95 cursor-pointer"
        >
          <Settings className="h-5 w-5" />
        </button>
      )}

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          installPrompt={installPrompt}
          onInstallPromptUsed={() => setInstallPrompt(null)}
        />
      )}
    </>
  );
}

export function SettingsModal({ onClose, installPrompt, onInstallPromptUsed }: SettingsModalProps) {
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  if (soundStudioOpen) return <SoundStudioScreen onBack={() => setSoundStudioOpen(false)} />;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 font-mono backdrop-blur-sm">
      <button aria-label="設定を閉じる" className="absolute inset-0" onClick={handleClose} />

      <div className="relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-sm border-2 border-amber-500/70 bg-[#0a1120] text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_24px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1627] px-5 py-3.5">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
              <span>⌁</span>
              <span>SYSTEM CONFIGURATION // 設定</span>
            </p>
            <h2 className="mt-0.5 text-base font-bold text-amber-400">システム環境設定</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="設定を閉じる"
            className="flex h-8 w-8 items-center justify-center text-amber-400 transition-colors hover:text-amber-300 active:scale-95 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-3 overflow-y-auto p-4">
          <BasicSoundSettings />
          <WorldBgmChannelSettings />
          <button
            type="button"
            onClick={() => { setSoundStudioOpen(true); playConfirmSound(); }}
            className="flex w-full items-center justify-center gap-2 border border-cyan-500/60 bg-[#070c18] py-2.5 font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400 hover:bg-cyan-950/40 cursor-pointer"
          >
            <Disc className="h-4 w-4 text-cyan-400" />
            <span className="text-center text-xs leading-5">サウンド開発コンソール (Sound Studio) を開く</span>
          </button>
          <SettingsAppActions installPrompt={installPrompt} onInstallPromptUsed={onInstallPromptUsed} />
        </div>

        <div className="flex justify-end border-t border-slate-800 bg-[#0d1627] px-5 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="border-b-2 border-amber-700 bg-amber-500 px-4 py-1.5 text-xs font-bold text-black transition-all hover:bg-amber-400 active:scale-95 cursor-pointer"
          >
            完了 (OK)
          </button>
        </div>
      </div>
    </div>
  );
}
