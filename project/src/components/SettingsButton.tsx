import { Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SettingsModal } from '@/components/SettingsModal';
import type { BeforeInstallPromptEvent } from '@/lib/pwaInstall';
import { playConfirmSound, playHoverSound } from '@/lib/sound';

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
          onMouseEnter={playHoverSound}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center border-2 border-amber-500/80 bg-[#0d1627] text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:-translate-y-[3px] hover:bg-amber-500 hover:text-slate-950 active:scale-95 cursor-pointer"
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
