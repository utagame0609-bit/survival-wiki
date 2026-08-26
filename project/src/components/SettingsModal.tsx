import { ArrowLeft, Download, LogOut, Settings, Volume2, VolumeX, Sliders, Music2, Waves } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SoundStudioScreen } from '@/screens/SoundStudioScreen';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { saveUserSoundSettings } from '@/lib/userSoundSettings';
import { getBgmChannelSettings, setBgmChannelEnabled, subscribeToBgmChannelSettings, type BgmChannelSettings } from '@/lib/bgmSettings';
import { supabase } from '@/lib/supabase';
import { getSoundVolume, isSoundEnabled, playCancelSound, playConfirmSound, playModalCloseSound, playToggleSound, setSoundVolume, toggleSound } from '@/lib/sound';

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }> };

type SettingsModalProps = {
  onClose: () => void;
  installPrompt: BeforeInstallPromptEvent | null;
  onInstallPromptUsed: () => void;
};

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

  const openSettings = () => {
    playConfirmSound();
    setSettingsOpen(true);
  };

  const closeSettings = () => setSettingsOpen(false);

  return (
    <>
      <button
        onClick={openSettings}
        aria-label="設定"
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-sm bg-[#0d1627] text-amber-400 border-2 border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:bg-amber-500 hover:text-slate-950 active:scale-95 transition-all cursor-pointer"
      >
        <Settings className="w-5 h-5" />
      </button>
      {settingsOpen && (
        <SettingsModal
          onClose={closeSettings}
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
  const [reverbAmount, setReverbAmount] = useState(Math.round(getStoredReverbAmount() * 100));
  const [soundStudioOpen, setSoundStudioOpen] = useState(false);
  const [soundDetailOpen, setSoundDetailOpen] = useState(false);
  const [bgmChannels, setBgmChannels] = useState<BgmChannelSettings>(getBgmChannelSettings());

  useEffect(() => subscribeToReverbAmount((value) => setReverbAmount(Math.round(value * 100))), []);
  useEffect(() => subscribeToBgmChannelSettings(setBgmChannels), []);

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

  if (soundStudioOpen && import.meta.env.DEV) {
    return <SoundStudioScreen onBack={() => setSoundStudioOpen(false)} />;
  }

  const channelRows: Array<{ key: keyof BgmChannelSettings; label: string; detail: string }> = [
    { key: 'lead', label: 'メロディ', detail: 'CH1 // PULSE LEAD' },
    { key: 'harmony', label: 'アルペジオ', detail: 'CH2 // ARPEGGIO' },
    { key: 'bass', label: 'ベース', detail: 'CH3 // TRIANGLE BASS' },
    { key: 'drums', label: 'ドラム', detail: 'CH4 // NOISE DRUMS' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono">
      <button
        aria-label="設定を閉じる"
        className="absolute inset-0"
        onClick={() => {
          playModalCloseSound();
          onClose();
        }}
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-sm border-2 border-amber-500/70 bg-[#0a1120] text-slate-100 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_24px_rgba(245,158,11,0.15)]">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0d1627] px-5 py-4">
          <div className="flex items-center gap-3">
            {soundDetailOpen && (
              <button
                type="button"
                onClick={() => {
                  setSoundDetailOpen(false);
                  playCancelSound();
                }}
                aria-label="音声設定に戻る"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-slate-700 bg-[#0a1120] text-slate-400 hover:border-slate-500 hover:text-slate-100 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div>
              <p className="text-[11px] font-extrabold tracking-widest text-emerald-400 uppercase font-mono flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>{soundDetailOpen ? 'AUDIO DETAIL // 音声詳細' : 'SYSTEM CONFIGURATION // 設定'}</span>
              </p>
              <h2 className="mt-0.5 text-base font-bold text-amber-400">{soundDetailOpen ? '音声詳細設定' : 'システム環境設定'}</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSoundStudioOpen(true);
              playConfirmSound();
            }}
            aria-label="サウンド開発コンソール"
            title="サウンド開発コンソール"
            className="relative z-20 pointer-events-auto flex shrink-0 items-center gap-1.5 rounded-sm border border-cyan-500/60 bg-cyan-950/20 px-2.5 py-2 text-[10px] font-bold tracking-wider text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-all cursor-pointer"
          >
            <Music2 className="h-3.5 w-3.5" />
            開発音源
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5">
          {soundDetailOpen ? (
            <section className="rounded-sm border border-slate-800 bg-[#090d16] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-600" />}
                  <div>
                    <p className="text-xs font-bold text-slate-200 uppercase tracking-wider">SOUND EFFECTS // 効果音</p>
                    <p className="mt-0.5 text-[11px] text-slate-500 font-mono">操作フィードバック音の再生</p>
                  </div>
                </div>
                <button type="button" role="switch" aria-checked={soundEnabled} aria-label="SEのオンオフ" onClick={handleSoundToggle} className={`relative flex h-6 w-11 shrink-0 items-center rounded-sm border p-0.5 transition-colors cursor-pointer ${soundEnabled ? 'border-emerald-500 bg-emerald-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'border-slate-700 bg-slate-900'}`}>
                  <span className={`block h-4 w-4 rounded-sm transition-transform ${soundEnabled ? 'translate-x-5 bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'translate-x-0 bg-slate-600'}`} />
                </button>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="se-volume" className="text-xs font-bold text-slate-300 uppercase tracking-wider">SE VOLUME // 音量</label>
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-sm bg-[#050a14] border border-slate-800">{soundVolume}%</span>
                </div>
                <input id="se-volume" type="range" min="0" max="100" step="1" value={soundVolume} onChange={(event) => handleVolumeChange(Number(event.target.value))} disabled={!soundEnabled} className="mt-3 w-full accent-amber-500 disabled:opacity-40 cursor-pointer" />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono"><span>0 MUTE</span><span>50 DEFAULT</span><span>100 MAX</span></div>
              </div>

              <div className="mt-5 border-t border-slate-800/80 pt-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="se-reverb" className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider"><Waves className="h-4 w-4 text-cyan-400" /> SE REVERB // 残響</label>
                  <span className="font-mono text-xs font-bold text-cyan-300 px-2 py-0.5 rounded-sm bg-[#050a14] border border-slate-800">{reverbAmount}%</span>
                </div>
                <input id="se-reverb" type="range" min="0" max="100" step="1" value={reverbAmount} onChange={(event) => handleReverbChange(Number(event.target.value))} disabled={!soundEnabled} className="mt-3 w-full accent-cyan-500 disabled:opacity-40 cursor-pointer" />
                <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-mono"><span>0 DRY</span><span>18 DEFAULT</span><span>100 MAX</span></div>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div><p className="text-xs font-bold text-slate-200 uppercase tracking-wider">WORLD SELECT BGM</p><p className="mt-0.5 text-[11px] text-slate-500 font-mono">再生チャンネル設定</p></div>
                  <Music2 className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  {channelRows.map(({ key, label, detail }) => (
                    <div key={key} className="flex items-center justify-between rounded-sm border border-slate-800 bg-[#050a14] px-3 py-2.5">
                      <div><p className="text-xs font-bold text-slate-300">{label}</p><p className="mt-0.5 text-[9px] tracking-wider text-slate-600">{detail}</p></div>
                      <button type="button" role="switch" aria-checked={bgmChannels[key]} aria-label={`${label}のオンオフ`} onClick={() => handleBgmChannelToggle(key)} className={`relative flex h-6 w-11 shrink-0 items-center rounded-sm border p-0.5 transition-colors cursor-pointer ${bgmChannels[key] ? 'border-cyan-500 bg-cyan-950 shadow-[0_0_10px_rgba(6,182,212,0.2)]' : 'border-slate-700 bg-slate-900'}`}>
                        <span className={`block h-4 w-4 rounded-sm transition-transform ${bgmChannels[key] ? 'translate-x-5 bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'translate-x-0 bg-slate-600'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500 font-mono">メロディ・アルペジオ・ベース・ドラムを個別にON/OFFできます。</p>
              </div>
            </section>
          ) : (
            <section className="rounded-sm border border-slate-800 bg-[#090d16] p-4">
              <button type="button" onClick={() => { setSoundDetailOpen(true); playConfirmSound(); }} className="flex w-full items-center justify-between gap-4 rounded-sm border border-cyan-500/40 bg-cyan-950/20 px-4 py-3 text-left hover:border-cyan-400/70 hover:bg-cyan-950/30 transition-all cursor-pointer">
                <div className="flex items-center gap-3"><Waves className="h-5 w-5 text-cyan-400" /><div><p className="text-xs font-bold text-slate-200 uppercase tracking-wider">AUDIO DETAIL // 音声詳細</p><p className="mt-0.5 text-[11px] text-slate-500 font-mono">SE・残響・ワールド選択BGMの詳細設定</p></div></div>
                <span className="text-cyan-400 text-xs font-bold">OPEN ›</span>
              </button>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <button type="button" onClick={handleInstall} className="flex w-full items-center justify-center gap-2 rounded-sm border border-sky-500/70 bg-sky-950/40 px-4 py-2.5 text-xs font-bold text-sky-300 hover:bg-sky-900/50 hover:border-sky-400 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider"><Download className="h-4 w-4 text-sky-400" />ホーム画面に追加 (PWA INSTALL)</button>
                <p className="mt-2 text-center text-[11px] leading-5 text-slate-500 font-mono">オフラインでも高速起動できるスタンドアロンHUDとして利用できます。</p>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <button type="button" onClick={() => void handleLogout()} className="flex w-full items-center justify-center gap-2 rounded-sm border border-rose-500/60 bg-rose-950/20 px-4 py-2.5 text-xs font-bold text-rose-300 hover:border-rose-400 hover:bg-rose-950/40 hover:text-rose-200 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider"><LogOut className="h-4 w-4 text-rose-400" />ログアウト (LOG OUT)</button>
                <p className="mt-2 text-center text-[11px] leading-5 text-slate-500 font-mono">現在のアカウントからログアウトします。</p>
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-800 bg-[#0d1627] px-5 py-3">
          <button onClick={() => { playCancelSound(); onClose(); }} className="rounded-sm border border-slate-700 bg-[#0a1120] px-4 py-1.5 text-xs font-bold text-slate-400 hover:border-slate-500 hover:text-slate-100 active:scale-95 transition-all cursor-pointer uppercase tracking-wider">閉じる (CLOSE)</button>
        </div>
      </div>
    </div>
  );
}
