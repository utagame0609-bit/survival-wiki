import { useEffect, useState } from 'react';
import { Box, Dna, Lock } from 'lucide-react';
import type { Game } from '@/lib/types';
import { fetchGames } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';

export function TopScreen({ navigate }: { navigate: NavigateFn }) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames()
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#11120f] text-stone-100">
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
            <div className="aspect-square rounded-3xl bg-[#1b1c18] border border-[#2d3028] flex flex-col items-center justify-center text-stone-500">
              <div className="w-14 h-14 rounded-2xl bg-[#25261f] flex items-center justify-center mb-3">
                <Dna className="w-9 h-9 text-stone-400" />
              </div>
              <p className="text-sm font-medium text-stone-400">カスタムワールド</p>
              <p className="text-xs mt-1">準備中</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, navigate }: { game: Game; navigate: NavigateFn }) {
  if (!game.available) {
    return (
      <div className="aspect-square rounded-3xl bg-[#1b1c18] border border-[#2d3028] flex flex-col items-center justify-center text-stone-500">
        <Lock className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium text-stone-400">{game.name}</p>
        <p className="text-xs mt-1">準備中</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate({ name: 'worldList', gameId: game.id, gameName: game.name })}
      className="aspect-square rounded-3xl bg-[#1b1c18] border border-emerald-800/80 flex flex-col items-center justify-center text-stone-100 shadow-lg shadow-black/20 hover:border-emerald-600 hover:bg-[#20231c] hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#1f3a20] flex items-center justify-center mb-3">
        <Box className="w-9 h-9 text-emerald-400" />
      </div>
      <p className="text-lg font-bold">{game.name}</p>
      <p className="text-xs mt-1 text-emerald-400">タップして開始</p>
    </button>
  );
}
