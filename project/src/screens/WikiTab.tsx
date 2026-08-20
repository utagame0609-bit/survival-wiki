import { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, RotateCcw } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { WIKI_STYLES, generateWiki } from '@/lib/wiki';

const WIKI_GENERATE_COOLDOWN_MS = 5000;

type WikiStyleId = string;

export function WikiTab({ world, reloadKey }: { world: WorldWithMembers; reloadKey: number }) {
  const [style, setStyle] = useState<WikiStyleId | null>(null);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [error, setError] = useState('');
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async (nextStyle: WikiStyleId | null = style) => {
    setLoading(true);
    setError('');
    try {
      const locs = await fetchLocations(world.id);
      setLocations(locs);
      if (nextStyle === null) {
        setArticle(null);
        return;
      }
      const art = await fetchWikiArticle(world.id, nextStyle);
      setArticle(art?.content ?? null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(style);
    return () => { if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current); };
  }, [world.id, style, reloadKey]);

  const handleStyleSelect = (nextStyle: WikiStyleId) => {
    if (generating || resetting) return;
    setStyle(nextStyle);
  };

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || now < cooldownUntil || locations.length === 0 || style === null) return;
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
    if (!style || !article || resetting) return;
    const confirmed = window.confirm('この記事を削除して、Wikiを初期状態に戻しますか？\n記事と現在のスタイル選択が解除されます。');
    if (!confirmed) return;
    setResetting(true);
    setError('');
    try {
      await resetWikiArticle(world.id, style);
      setArticle(null);
      setStyle(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const styleConfig = style ? WIKI_STYLES.find((s) => s.id === style) : null;
  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <p className="text-sm font-medium text-stone-700 mb-2">スタイル</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {WIKI_STYLES.map((s) => (
            <button key={s.id} onClick={() => handleStyleSelect(s.id)} disabled={generating || resetting} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${style === s.id ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>{s.name}</button>
          ))}
        </div>
        {styleConfig && <p className="text-xs text-stone-400 mt-1">{styleConfig.description}</p>}
      </div>
      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="Wikiを読み込み中" /> : <WikiContent style={style} hasArticle={hasArticle} article={article} generating={generating} resetting={resetting} cooldownActive={cooldownActive} onGenerate={handleGenerate} onReset={handleReset} locationCount={locations.length} />}
    </div>
  );
}

function WikiContent({ style, hasArticle, article, generating, resetting, cooldownActive, onGenerate, onReset, locationCount }: { style: string | null; hasArticle: boolean; article: string | null; generating: boolean; resetting: boolean; cooldownActive: boolean; onGenerate: () => void; onReset: () => void; locationCount: number }) {
  const isWikipedia = style === 'wikipedia';
  const isScp = style === 'scp';
  const isAncient = style === 'ancient';
  const isNeutral = style === null;

  const pageClass = isWikipedia
    ? 'bg-white text-stone-800 border-stone-300'
    : isScp
      ? 'bg-stone-100 text-stone-900 border-stone-700'
      : isAncient
        ? 'bg-[#f4ecd8] text-[#3f3022] border-[#b8a17d]'
        : 'bg-white text-stone-800 border-stone-300';

  const headerClass = isWikipedia
    ? 'bg-stone-50 border-stone-200 text-stone-700'
    : isScp
      ? 'bg-stone-200 border-stone-500 text-stone-900'
      : isAncient
        ? 'bg-[#e9ddc2] border-[#b8a17d] text-[#4a3826]'
        : 'bg-stone-50 border-stone-200 text-stone-700';

  const articleClass = isWikipedia
    ? 'bg-white border-stone-200 text-stone-800'
    : isScp
      ? 'bg-[#eeeeee] border-stone-500 text-stone-900'
      : isAncient
        ? 'bg-[#f4ecd8] border-[#a98e68] text-[#3f3022]'
        : 'bg-white border-stone-200 text-stone-800';

  return (
    <div className={`rounded-2xl border shadow-sm overflow-hidden transition-colors duration-300 ${pageClass}`}>
      <div className={`px-4 py-4 border-b ${headerClass}`}>
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 opacity-70" />
          <div>
            <p className="text-sm font-semibold">
              {isWikipedia ? 'Wikipedia' : isScp ? 'SCP FOUNDATION' : isAncient ? '古文書' : 'Wiki'}
            </p>
            <p className="text-xs opacity-60">
              {isWikipedia ? '百科事典風' : isScp ? '機密記録風' : isAncient ? '絶望的な古文書風' : 'スタイル未選択'}
            </p>
          </div>
        </div>
      </div>

      <div className={`px-4 py-5 sm:px-6 sm:py-7 ${articleClass}`}>
        <div className={`border-l-4 pl-4 sm:pl-5 ${isWikipedia ? 'border-stone-300' : isScp ? 'border-stone-700' : isAncient ? 'border-[#8f7654]' : 'border-stone-200'}`}>
          <div className="flex gap-2 mb-4">
            <button onClick={onGenerate} disabled={generating || resetting || cooldownActive || locationCount === 0 || style === null} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50">
              {generating ? <><Spinner /><span>生成中...</span></> : hasArticle ? <><RefreshCw className="w-5 h-5" />更新</> : <><Sparkles className="w-5 h-5" />記事を生成</>}
            </button>
            <button onClick={onReset} disabled={!hasArticle || !style || generating || resetting} className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-600 font-medium shadow-sm hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>
          </div>

          {style === null && <EmptyState message="スタイルを選択すると、Wiki記事を作成できます。" />}
          {style !== null && locationCount === 0 && !hasArticle && <EmptyState message="ロケーションを記録すると、Wiki記事を生成できます。" />}

          {hasArticle && article && <article className={`rounded-xl border p-5 sm:p-7 shadow-sm ${articleClass}`}><pre className={`whitespace-pre-wrap text-[15px] leading-7 ${isAncient ? 'font-serif' : 'font-sans'}`}>{article}</pre></article>}
        </div>
      </div>
    </div>
  );
}
