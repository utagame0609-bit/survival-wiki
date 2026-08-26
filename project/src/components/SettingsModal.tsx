import { Download, LogOut, Settings, Volume2, VolumeX, Music2, Waves, Disc, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SoundStudioScreen } from '@/screens/SoundStudioScreen';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { saveUserSoundSettings } from '@/lib/userSoundSettings';
import { getBgmChannelSettings, setBgmChannelEnabled, subscribeToBgmChannelSettings, type BgmChannelSettings } from '@/lib/bgmSettings';
import { getMasterBgmVolume, setMasterBgmVolume } from '@/lib/bgm';
import { supabase } from '@/lib/supabase';
import { getSoundVolume, isSoundEnabled, playCancelSound, playConfirmSound, playModalCloseSound, playToggleSound, setSoundVolume, toggleSound } from '@/lib/sound';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> };
type SettingsModalProps = { onClose: () => void; installPrompt: BeforeInstallPromptEvent | null; onInstallPromptUsed: () => void };

export function SettingsButton() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  return (
    <>
      <button
        onClick={() => { playConfirmSound(); setSettingsOpen(true); }}
        aria-label="設定"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-amber-500/80 bg-[#0d1627] text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] transition-all hover:bg-amber-500 hover:text-slate-950 active:scale-95 cursor-pointer"
      >
        <Settings className="h-5 w-5" />
      </button>
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
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [soundVolume, setSoundVolumeState] = useState(getSoundVolume());
  const [masterBgmVolume, setMasterBgmVolumeState] = useState(Math.round(getMasterBgmVolume() * 100));
  const [reverbAmount, setReverbAmount] = useState(Math.round(getStoredReverbAmount() * 100));
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);
  const [bgmChannels, setBgmChannels] = useState<BgmChannelSettings>(getBgmChannelSettings());

  useEffect(() => subscribeToReverbAmount((value) => setReverbAmount(Math.round(value * 100))), []);
  useEffect(() => subscribeToBgmChannelSettings(setBgmChannels), []);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
    if (next) playToggleSound();
  };

  const handleVolumeChange = (value: number) => {
    const normalized = setSoundVolume(value);
    setSoundVolumeState(normalized);
    void saveUserSoundSettings({
      seVolume: normalized,
      seReverb: Math.round(getStoredReverbAmount() * 100),
    }).catch((error) => console.error('Failed to save SE volume:', error));
  };

  const handleMasterBgmVolumeChange = (value: number) => {
    const normalized = setMasterBgmVolume(value / 100);
    setMasterBgmVolumeState(Math.round(normalized * 100));
  };

  const handleReverbChange = (value: number) => {
    const normalized = setStoredReverbAmount(value / 100);
    void saveUserSoundSettings({
      seVolume: getSoundVolume(),
      seReverb: Math.round(normalized * 100),
    }).catch((error) => console.error('Failed to save SE reverb:', error));
  };

  const handleBgmChannelToggle = (channel: keyof BgmChannelSettings) => {
    setBgmChannelEnabled(channel, !bgmChannels[channel]);
    playToggleSound();
  };

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

  if (soundStudioOpen) return <SoundStudioScreen onBack={() => setSoundStudioOpen(false)} />;

  const channelRows: Array<{ key: keyof BgmChannelSettings; label: string; detail: string }> = [
    { key: 'lead', label: 'メロディ', detail: 'CH1 // PULSE LEAD' },
    { key: 'harmony', label: 'アルペジオ', detail: 'CH2 // ARPEGGIO' },
    { key: 'bass', label: 'ベース', detail: 'CH3 // TRIANGLE BASS' },
    { key: 'drums', label: 'ドラム', detail: 'CH4 // NOISE DRUMS' },
  ];

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
          <section className="border border-slate-800 bg-[#090d16] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <Music2 className="h-4 w-4" />
                <span>BGM MASTER</span>
              </div>
              <span className="w-10 text-right font-bold text-cyan-300">{masterBgmVolume}%</span>
            </div>
            <input
              id="bgm-master-volume"
              type="range"
              min="0"
              max="100"
              step="1"
              value={masterBgmVolume}
              onChange={(event) => handleMasterBgmVolumeChange(Number(event.target.value))}
              className="w-full cursor-pointer accent-cyan-400"
            />
            <p className="text-[10px] leading-4 text-slate-500">ワールド選択画面で再生されるBGM全体の音量です。</p>
          </section>

          <section className="border border-violet-500/30 bg-[#090d16] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-violet-400">
                <Waves className="h-4 w-4" />
                <span>残響リバーブ効果 (REVERB)</span>
              </div>
              <span className="font-bold text-violet-300">{reverbAmount}%</span>
            </div>
            <input
              id="se-reverb"
              type="range"
              min="0"
              max="100"
              step="1"
              value={reverbAmount}
              onChange={(event) => handleReverbChange(Number(event.target.value))}
              disabled={!soundEnabled}
              className="w-full cursor-pointer accent-violet-400 disabled:opacity-40"
            />
            <p className="text-[10px] leading-4 text-slate-500">地下ダンジョンや洞窟のような反響音を付与します。</p>
          </section>

          <section className="border border-slate-800 bg-[#090d16] p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>SE 効果音音量</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-10 text-right font-bold text-amber-400">{soundVolume}%</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={soundEnabled}
                  aria-label="SEのオンオフ"
                  onClick={handleSoundToggle}
                  className={`border px-2 py-0.5 text-[10px] font-bold ${soundEnabled ? 'border-slate-700 bg-[#0d1627] text-slate-300' : 'border-red-500 bg-red-950/40 text-red-400'}`}
                >
                  {soundEnabled ? 'ACTIVE' : 'MUTED'}
                </button>
              </div>
            </div>
            <input
              id="se-volume"
              type="range"
              min="0"
              max="100"
              step="1"
              value={soundVolume}
              onChange={(event) => handleVolumeChange(Number(event.target.value))}
              disabled={!soundEnabled}
              className="w-full cursor-pointer accent-amber-500 disabled:opacity-40"
            />
          </section>

          <section className="border border-slate-800 bg-[#090d16] p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-cyan-400">
                <Music2 className="h-4 w-4" />
                <span>WORLD SELECT BGM</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-300">4 CHANNELS</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {channelRows.map(({ key, label, detail }) => (
                <div key={key} className="flex items-center justify-between gap-2 border border-slate-800 bg-[#050a14] px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-300">{label}</p>
                    <p className="mt-0.5 truncate text-[9px] tracking-wider text-slate-600">{detail}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bgmChannels[key]}
                    aria-label={`${label}のオンオフ`}
                    onClick={() => handleBgmChannelToggle(key)}
                    className={`relative flex h-6 w-11 shrink-0 items-center border p-0.5 transition-colors cursor-pointer ${bgmChannels[key] ? 'border-cyan-500 bg-cyan-950 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-slate-700 bg-slate-900'}`}
                  >
                    <span className={`block h-4 w-4 transition-transform ${bgmChannels[key] ? 'translate-x-5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'translate-x-0 bg-slate-600'}`} />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-[10px] leading-4 text-slate-500">メロディ・アルペジオ・ベース・ドラムを個別にON/OFFできます。</p>
          </section>

          <button
            type="button"
            onClick={() => { setSoundStudioOpen(true); playConfirmSound(); }}
            className="flex w-full items-center justify-center gap-2 border border-cyan-500/60 bg-[#070c18] py-2.5 font-bold text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all hover:border-cyan-400 hover:bg-cyan-950/40 cursor-pointer"
          >
            <Disc className="h-4 w-4 text-cyan-400" />
            <span className="text-center text-xs leading-5">サウンド開発コンソール (Sound Studio) を開く</span>
          </button>

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
