import { useEffect, useState } from 'react';
import { Boxes, Lock } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-50">
      <div className="px-5 pt-12 pb-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">ゲームを選択</h1>
        <p className="mt-1 text-sm text-stone-500">記録を始めるゲームを選んでください</p>
      </div>

      <div className="px-5 max-w-3xl mx-auto">
        {loading && <Spinner label="ゲームを読み込み中" />}
        {error && <ErrorBanner message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <GameCard key={game.id} game={game} navigate={navigate} />
            ))}
            <div className="aspect-square rounded-3xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400">
              <Lock className="w-8 h-8 mb-2" />
              <p className="text-sm font-medium">カスタムワールド</p>
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
      <div className="aspect-square rounded-3xl bg-stone-100 border border-stone-200 flex flex-col items-center justify-center text-stone-400">
        <Lock className="w-8 h-8 mb-2" />
        <p className="text-sm font-medium">{game.name}</p>
        <p className="text-xs mt-1">準備中</p>
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate({ name: 'worldList', gameId: game.id, gameName: game.name })}
      className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500 to-green-700 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
    >
      <Boxes className="w-12 h-12 mb-3" />
      <p className="text-lg font-bold">{game.name}</p>
      <p className="text-xs mt-1 text-emerald-100">タップして開始</p>
    </button>
  );
}
