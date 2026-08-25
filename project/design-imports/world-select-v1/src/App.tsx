import { useState } from 'react';
import { WorldListScreen } from '@/components/WorldListScreen';
import { ArrowLeft, Calendar, BookOpen, Users } from 'lucide-react';
import { playConfirmSound, playCancelSound } from '@/lib/sound';

type Route =
  | { name: 'worldList' }
  | { name: 'world'; worldId: string; worldName: string }
  | { name: 'worldCreate'; gameId: string; gameName: string; worldId?: string };

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>({ name: 'worldList' });
  const [gameName] = useState('サバイバル冒険記・アレフガルド編');
  const [gameId] = useState('game-survival');

  const navigate = (route: { name: string; [key: string]: any }) => {
    setCurrentRoute(route as Route);
  };

  const goBack = () => {
    playCancelSound();
    setCurrentRoute({ name: 'worldList' });
  };

  return (
    <div className="min-h-screen bg-[#0a1120] text-[#f0f0f0] selection:bg-amber-500 selection:text-black">
      {currentRoute.name === 'worldList' && (
        <WorldListScreen
          gameId={gameId}
          gameName={gameName}
          navigate={navigate}
          goBack={() => {
            playConfirmSound();
          }}
        />
      )}

      {currentRoute.name === 'world' && (
        <div className="min-h-screen bg-[#0a1120] p-4 sm:p-8 retro-font flex flex-col items-center justify-center">
          <div className="scanline-overlay" />
          <div className="relative z-10 w-full max-w-2xl">
            <div className="double-border bg-[#0a1120] p-6 text-[#f0f0f0] shadow-[0_0_40px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <div className="pixel-font text-[9px] tracking-widest green-text crt-glow">QUEST ACTIVE</div>
                  <h1 className="text-xl font-bold text-white sm:text-2xl mt-1">
                    {currentRoute.worldName}
                  </h1>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="pixel-btn flex items-center gap-1.5 px-3 py-2 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK</span>
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div className="border border-white/20 bg-[#162032] p-4">
                  <p className="text-sm leading-relaxed text-zinc-300">
                    冒険の書「{currentRoute.worldName}」をロードしました。<br />
                    セーブデータ選択画面から正常にゲーム本編または拠点録へ移行できます。
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-white/20 bg-[#10192d] p-3 text-center">
                    <Calendar className="mx-auto h-5 w-5 text-amber-400" />
                    <div className="mt-1 pixel-font text-[8px] amber-text">DAYS</div>
                    <div className="pixel-font text-base font-bold text-white mt-1">035</div>
                  </div>
                  <div className="border border-white/20 bg-[#10192d] p-3 text-center">
                    <BookOpen className="mx-auto h-5 w-5 text-[#3df30b]" />
                    <div className="mt-1 pixel-font text-[8px] green-text">RECORDS</div>
                    <div className="pixel-font text-base font-bold text-white mt-1">003</div>
                  </div>
                  <div className="border border-white/20 bg-[#10192d] p-3 text-center">
                    <Users className="mx-auto h-5 w-5 text-[#00d4ff]" />
                    <div className="mt-1 pixel-font text-[8px] blue-text">PARTY</div>
                    <div className="pixel-font text-base font-bold text-white mt-1">005</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentRoute.name === 'worldCreate' && (
        <div className="min-h-screen bg-[#0a1120] p-4 sm:p-8 retro-font flex flex-col items-center justify-center">
          <div className="scanline-overlay" />
          <div className="relative z-10 w-full max-w-2xl">
            <div className="double-border bg-[#0a1120] p-6 text-[#f0f0f0]">
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <div className="pixel-font text-[9px] tracking-widest amber-text">EDIT WORLD</div>
                  <h1 className="text-xl font-bold text-white mt-1">ワールド設定の編集</h1>
                </div>
                <button
                  type="button"
                  onClick={goBack}
                  className="pixel-btn flex items-center gap-1.5 px-3 py-2 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>BACK</span>
                </button>
              </div>
              <div className="mt-6 border border-white/20 bg-[#162032] p-4">
                <p className="text-sm text-zinc-300">
                  ID: {currentRoute.worldId} のワールド設定を編集する画面です。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
