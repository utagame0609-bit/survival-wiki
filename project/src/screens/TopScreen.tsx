import { useEffect, useState } from 'react';
import { Box, Dna, Lock, Settings, X } from 'lucide-react';
import type { Game } from '@/lib/types';
import { fetchGames } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import {
  getSoundVolume,
  isSoundEnabled,
  playCancelSound,
  playConfirmSound,
  playModalCloseSound,
  playModalOpenSound,
  playToggleSound,
  setSoundVolume,
  toggleSound,
} from '@/lib/sound';

export function TopScreen({ navigate }: { navigate: NavigateFn }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled());
  const [soundVolume, setSoundVolumeState] = useState(getSoundVolume());

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const openSettings = () => {
    playModalOpenSound();
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    playModalCloseSound();
    setSettingsOpen(false);
  };

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundEnabled(next);
    if (next) playToggleSound();
  };

  const handleVolumeChange = (value: number) => {
    setSoundVolumeState(setSoundVolume(value));
  };

  return (
    <div
      className="min-h-screen text-stone-100"
      style={{
        background:
          'radial-gradient(circle at 15% 30%, rgba(35, 70, 25, 0.22), transparent 38%), radial-gradient(circle at 85% 75%, rgba(80, 60, 25, 0.08), transparent 35%), #11120f',
      }}
    >
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-100 tracking-tight">ゲームを選択</h1>
        <p className="mt-1 text-sm text-stone-400">記録を始めるゲームを選んでください</p>
      </div>

      <div className="px-5 max-w-3xl mx-auto">
        {loading && <Spinner label="ゲームを読み込み中" />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} navigate={navigate} />
            ))}
            <div className="min-h-36 rounded-2xl bg-[#1b1c18] border border-[#2d3028] flex items-center px-5 text-stone-500">
              <div className="w-14 h-14 shrink-0 rounded-xl bg-[#3a2a12] flex items-center justify-center mr-4">
                <Dna className="w-9 h-9 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-400">カスタムワールド</p>
                <p className="text-xs mt-1">準備中</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={openSettings}
        aria-label="設定"
        className="fixed bottom-5 right-5 w-12 h-12 rounded-full bg-[#292b24] text-stone-200 border border-[#3a3d34] shadow-lg shadow-black/30 flex items-center justify-center hover:bg-[#34372e] active:scale-95 transition-all"
      >
        <Settings className="w-5 h-5" />
      </button>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <button aria-label="閉じる" className="absolute inset-0" onClick={closeSettings} />
          <div className="relative z-10 w-full max-w-md bg-[#1b1c18] text-stone-100 border border-[#3a3d34] shadow-2xl rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d3028]">
              <h2 className="text-lg font-semibold">設定</h2>
              <button
                onClick={closeSettings}
                aria-label="閉じる"
                className="p-2 rounded-lg text-stone-400 hover:bg-[#292b24] hover:text-stone-100 active:scale-95 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-stone-200">サウンド</h3>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-300">SE</p>
                    <p className="text-xs mt-1 text-stone-500">アプリ内の効果音</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={soundEnabled}
                    onClick={handleSoundToggle}
                    className={`relative w-12 h-7 rounded-full border transition-colors ${soundEnabled ? 'bg-emerald-700 border-emerald-600' : 'bg-[#292b24] border-[#45483e]'}`}
                  >
                    <span className={`absolute top-1 w-5 h-5 rounded-full bg-stone-100 transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="se-volume" className="text-sm text-stone-300">SE音量</label>
                    <span className="text-sm font-mono text-emerald-400">{soundVolume}</span>
                  </div>
                  <input
                    id="se-volume"
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={soundVolume}
                    onChange={(event) => handleVolumeChange(Number(event.target.value))}
                    disabled={!soundEnabled}
                    className="w-full accent-emerald-500 disabled:opacity-40"
                  />
                  <div className="mt-1 flex justify-between text-[11px] text-stone-500">
                    <span>現在の音量</span>
                    <span>最大</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GameCard({ game, navigate }: { game: Game; navigate: NavigateFn }) {
  if (!game.available) {
    return (
      <div className="min-h-36 rounded-2xl bg-[#1b1c18] border border-[#2d3028] flex items-center px-5 text-stone-500">
        <Lock className="w-8 h-8 mr-4 shrink-0" />
        <div>
          <p className="text-sm font-medium text-stone-400">{game.name}</p>
          <p className="text-xs mt-1">準備中</p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        playConfirmSound();
        navigate({ name: 'worldList', gameId: game.id, gameName: game.name });
      }}
      className="min-h-36 rounded-2xl bg-[#1b1c18] border border-emerald-800/80 flex items-center px-5 text-left text-stone-100 shadow-lg shadow-black/20 hover:border-emerald-600 hover:bg-[#20231c] active:scale-[0.99] transition-all"
    >
      <div className="w-14 h-14 shrink-0 rounded-xl bg-[#1f3a20] flex items-center justify-center mr-4">
        <Box className="w-9 h-9 text-emerald-400" />
      </div>
      <div>
        <p className="text-lg font-bold">{game.name}</p>
        <p className="text-xs mt-1 text-emerald-400">タップして開始</p>
      </div>
    </button>
  );
}
