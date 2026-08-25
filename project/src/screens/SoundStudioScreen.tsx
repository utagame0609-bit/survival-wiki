import { ArrowLeft, Play, Volume2 } from 'lucide-react';
import { playNewRecordSound } from '@/lib/sound';
import { SOUND_CANDIDATES, SoundCandidate } from '@/lib/soundCandidates';

const categoryOrder = ['system', 'screen', 'action', 'wiki'] as const;

export function SoundStudioScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#050811] text-slate-100 font-mono">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-[#070c18]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 rounded-sm border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-300 hover:border-amber-500 hover:text-amber-400">
            <ArrowLeft className="h-4 w-4" /> 戻る
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold tracking-[0.2em] text-emerald-400">DEVELOPMENT AUDIO // 開発音源</p>
            <h1 className="text-base font-bold text-amber-400">16bit × Switch Sound Studio</h1>
          </div>
          <div className="hidden items-center gap-2 rounded-sm border border-slate-700 bg-slate-900 px-3 py-2 text-[10px] text-slate-400 sm:flex">
            <Volume2 className="h-3.5 w-3.5 text-cyan-400" /> アプリ内試聴環境
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6">
        <section className="rounded-sm border border-slate-800 bg-[#0a1120] p-5 shadow-[0_0_30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <p className="text-[10px] font-bold tracking-widest text-emerald-400">SOUND DEVELOPMENT CONSOLE</p>
              <h2 className="mt-1 text-lg font-black text-slate-100">音源候補</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">正式採用前のSEをアプリ内で確認するための開発画面</p>
            </div>
            <span className="rounded-sm border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400">DEV ONLY</span>
          </div>

          <div className="mt-5 space-y-7">
            {categoryOrder.map((category) => {
              const candidates = SOUND_CANDIDATES.filter((sound) => sound.category === category);
              if (!candidates.length) return null;
              return (
                <section key={category}>
                  <div className="mb-3 flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <h3 className="text-sm font-bold text-slate-100">{candidates[0].categoryJa}</h3>
                    <span className="text-[10px] text-slate-500">({candidates.length}種)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {candidates.map((sound) => <SoundCandidateCard key={sound.id} sound={sound} />)}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

function SoundCandidateCard({ sound }: { sound: SoundCandidate }) {
  const isNewRecord = sound.id === 'new_record';

  return (
    <article className="rounded-sm border border-slate-800 bg-[#0d1627] p-4 shadow-[0_0_18px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-slate-100">{sound.nameJa}</h4>
          <p className="mt-1 text-[11px] text-slate-500">{sound.name}</p>
        </div>
        <span className="shrink-0 rounded-sm border border-amber-500/50 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">{sound.category.toUpperCase()}</span>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">{sound.description}</p>

      <div className="mt-3 rounded-sm border border-slate-800 bg-[#070c18] px-3 py-2">
        <p className="text-[10px] leading-4 text-cyan-300">✣ {sound.toneInfo}</p>
      </div>

      <p className="mt-3 text-[11px] leading-5 text-slate-500">{sound.keyCharacteristic}</p>

      {isNewRecord && (
        <button type="button" onClick={playNewRecordSound} className="mt-4 flex w-full items-center justify-center gap-2 rounded-sm border border-amber-500/70 bg-transparent px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10">
          <Play className="h-3.5 w-3.5 fill-current" /> 試聴
        </button>
      )}
    </article>
  );
}
