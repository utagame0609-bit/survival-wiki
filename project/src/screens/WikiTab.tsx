import { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, RotateCcw } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle } from '@/lib/db';
import { WIKI_STYLES, generateWiki } from '@/lib/wiki';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

const WIKI_GENERATE_COOLDOWN_MS = 5000;

export function WikiTab({ world, reloadKey }: { world: WorldWithMembers; reloadKey: number }) {
  const [style, setStyle] = useState(WIKI_STYLES[0].id);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [error, setError] = useState('');
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [locs, art] = await Promise.all([fetchLocations(world.id), fetchWikiArticle(world.id, style)]);
      setLocations(locs);
      setArticle(art?.content ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    return () => { if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current); };
  }, [world.id, style, reloadKey]);

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || now < cooldownUntil || locations.length === 0) return;
    setGenerating(true);
    setError('');
    try {
      const result = await generateWiki({ world, locations, style });
      await saveWikiArticle(world.id, style, result.content);
      setArticle(result.content);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      const nextCooldownUntil = Date.now() + WIKI_GENERATE_COOLDOWN_MS;
      setCooldownUntil(nextCooldownUntil);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => setCooldownUntil(0), WIKI_GENERATE_COOLDOWN_MS);
      setGenerating(false);
    }
  };

  const handleReset = async () => {
    if (!article || resetting) return;
    const confirmed = window.confirm('このスタイルの記事をリセットして、未生成の状態に戻しますか？');
    if (!confirmed) return;
    setResetting(true);
    setError('');
    try {
      await resetWikiArticle(world.id, style);
      setArticle(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const styleConfig = WIKI_STYLES.find((s) => s.id === style);
  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <p className="text-sm font-medium text-stone-700 mb-2">スタイル</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {WIKI_STYLES.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${style === s.id ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>{s.name}</button>
          ))}
        </div>
        {styleConfig && <p className="text-xs text-stone-400 mt-1">{styleConfig.description}</p>}
      </div>
      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="Wikiを読み込み中" /> : <WikiContent style={style} hasArticle={hasArticle} article={article} generating={generating} resetting={resetting} cooldownActive={cooldownActive} onGenerate={handleGenerate} onReset={handleReset} locationCount={locations.length} />}
    </div>
  );
}

function WikiContent({ style, hasArticle, article, generating, resetting, cooldownActive, onGenerate, onReset, locationCount }: { style: string; hasArticle: boolean; article: string | null; generating: boolean; resetting: boolean; cooldownActive: boolean; onGenerate: () => void; onReset: () => void; locationCount: number }) {
  const themeClass = style === 'scp' ? 'bg-stone-900 text-stone-200 border-stone-700' : style === 'psycho' ? 'bg-purple-950 text-purple-100 border-purple-800' : 'bg-white text-stone-800 border-stone-300';

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={onGenerate} disabled={generating || resetting || cooldownActive || locationCount === 0} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50">
          {generating ? <><Spinner /><span>生成中...</span></> : hasArticle ? <><RefreshCw className="w-5 h-5" />更新</> : <><Sparkles className="w-5 h-5" />記事を生成</>}
        </button>
        <button onClick={onReset} disabled={!hasArticle || generating || resetting} className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-600 font-medium shadow-sm hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>
      </div>

      {locationCount === 0 && !hasArticle && <EmptyState message="ロケーションを記録すると、Wiki記事を生成できます。" />}

      {hasArticle && article && (
        <div className="rounded-xl border border-stone-300 bg-white text-stone-900 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-200 bg-stone-50">
            <BookOpen className="w-5 h-5 text-stone-600" />
            <span className="text-sm font-semibold text-stone-700">百科事典</span>
          </div>
          <article className="relative bg-white border-l-4 border-stone-200 px-5 py-6 sm:px-7 sm:py-8 font-serif leading-relaxed">
            <pre className="whitespace-pre-wrap font-serif text-[15px] leading-7 text-stone-800">{article}</pre>
          </article>
        </div>
      )}
    </div>
  );
}
