import { Download, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { playCancelSound, playToggleSound } from '@/lib/sound';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type SettingsAppActionsProps = {
  installPrompt: BeforeInstallPromptEvent | null;
  onInstallPromptUsed: () => void;
};

export function SettingsAppActions({ installPrompt, onInstallPromptUsed }: SettingsAppActionsProps) {
  const handleInstall = async () => {
    playToggleSound();
    if (!installPrompt) {
      window.alert('この環境ではアプリのインストール確認画面を直接開けません。ブラウザのメニューから「ホーム画面に追加」または「アプリをインストール」を選択してください。');
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    onInstallPromptUsed();
  };

  const handleLogout = async () => {
    playCancelSound();
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Failed to log out:', error);
  };

  return (
    <>
      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={handleInstall}
          className="flex w-full items-center justify-center gap-2 border border-sky-500/70 bg-sky-950/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-sky-300 transition-all hover:border-sky-400 hover:bg-sky-900/50 active:scale-[0.98] cursor-pointer"
        >
          <Download className="h-4 w-4 text-sky-400" />
          ホーム画面に追加 (PWA INSTALL)
        </button>
        <p className="mt-1.5 text-center text-[11px] leading-4 text-slate-500">オフラインでも高速起動できるスタンドアロンHUDとして利用できます。</p>
      </div>

      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="flex w-full items-center justify-center gap-2 border border-rose-500/60 bg-rose-950/20 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-300 transition-all hover:border-rose-400 hover:bg-rose-950/40 hover:text-rose-200 active:scale-[0.98] cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-rose-400" />
          ログアウト (LOG OUT)
        </button>
        <p className="mt-1.5 text-center text-[11px] leading-4 text-slate-500">現在のアカウントからログアウトします。</p>
      </div>
    </>
  );
}
