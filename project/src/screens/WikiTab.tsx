import { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, RotateCcw } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { supabase } from '@/lib/supabase';

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
    setLoading(true); setError('');
    try {
      const locs = await fetchLocations(world.id); setLocations(locs);
      if (nextStyle === null) { setArticle(null); return; }
      const art = await fetchWikiArticle(world.id, nextStyle); setArticle(art?.content ?? null);
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load(style);
    return () => { if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current); };
  }, [world.id, style, reloadKey]);

  const handleStyleSelect = (nextStyle: WikiStyleId) => { if (!generating && !resetting) setStyle(nextStyle); };

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || now < cooldownUntil || locations.length === 0 || style === null) return;
    setGenerating(true); setError('');
    try {
      const result = await openRouterTestProvider.generate({ world, locations, style });
      await saveWikiArticle(world.id, style, result.content); setArticle(result.content);
    } catch (e) { setError((e as Error).message); }
    finally {
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
    setResetting(true); setError('');
    try { await resetWikiArticle(world.id, style); setArticle(null); setStyle(null); }
    catch (e) { setError((e as Error).message); }
    finally { setResetting(false); }
  };

  const handleAiTest = async () => {
    setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('wiki-ai-test', {
        body: { message: 'wiki-ai-connectivity-test' },
      });
      if (invokeError) throw invokeError;
      if (!data?.ok) throw new Error('AIテストFunctionから正常な応答がありません。');
      window.alert(`AI接続テスト成功: ${data.message}`);
    } catch (e) {
      setError(`AI接続テスト失敗: ${(e as Error).message}`);
    }
  };

  const styleConfig = style ? WIKI_STYLES.find((s) => s.id === style) : null;
  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();
  const isGeneratedWikipedia = hasArticle && style === 'wikipedia';

  return (
    <div className={isGeneratedWikipedia ? 'w-full' : 'w-full px-4 py-4 max-w-3xl mx-auto'}>
      {!isGeneratedWikipedia && <div className="mb-4">
        <p className="text-sm font-medium text-stone-700 mb-2">スタイル</p>
        <div className="flex gap-2 overflow-x-auto pb-1">{WIKI_STYLES.map((s) => <button key={s.id} onClick={() => handleStyleSelect(s.id)} disabled={generating || resetting} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${style === s.id ? 'bg-emerald-600 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}>{s.name}</button>)}</div>
        {styleConfig && <p className="text-xs text-stone-400 mt-1">{styleConfig.description}</p>}
      </div>}
      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="Wikiを読み込み中" /> : <WikiContent world={world} style={style} hasArticle={hasArticle} article={article} generating={generating} resetting={resetting} cooldownActive={cooldownActive} onGenerate={handleGenerate} onReset={handleReset} onAiTest={handleAiTest} locationCount={locations.length} isGeneratedWikipedia={isGeneratedWikipedia} />}
    </div>
  );
}

function WikiContent({ world, style, hasArticle, article, generating, resetting, cooldownActive, onGenerate, onReset, onAiTest, locationCount, isGeneratedWikipedia }: { world: WorldWithMembers; style: string | null; hasArticle: boolean; article: string | null; generating: boolean; resetting: boolean; cooldownActive: boolean; onGenerate: () => void; onReset: () => void; onAiTest: () => void; locationCount: number; isGeneratedWikipedia: boolean }) {
  const isWikipedia = style === 'wikipedia'; const isScp = style === 'scp'; const isAncient = style === 'ancient';
  const pageClass = isWikipedia ? 'bg-white text-stone-800 border-stone-300' : isScp ? 'bg-stone-100 text-stone-900 border-stone-700' : isAncient ? 'bg-[#f4ecd8] text-[#3f3022] border-[#b8a17d]' : '';
  const headerClass = isWikipedia ? 'bg-stone-50 border-stone-200 text-stone-700' : isScp ? 'bg-stone-200 border-stone-500 text-stone-900' : isAncient ? 'bg-[#e9ddc2] border-[#b8a17d] text-[#4a3826]' : '';
  const articleClass = isWikipedia ? 'bg-white border-stone-200 text-stone-800' : isScp ? 'bg-[#eeeeee] border-stone-500 text-stone-900' : isAncient ? 'bg-[#f4ecd8] border-[#a98e68] text-[#3f3022]' : 'bg-white border-stone-200 text-stone-800';

  const actionButtons = <div className="flex gap-2 mb-4 px-4 pt-4 sm:px-6">
    <button onClick={onGenerate} disabled={generating || resetting || cooldownActive || locationCount === 0 || style === null} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50">
      {generating ? <><Spinner /><span>生成中...</span></> : hasArticle ? <><RefreshCw className="w-5 h-5" />更新</> : <><Sparkles className="w-5 h-5" />記事を生成</>}
    </button>
    <button onClick={onReset} disabled={!hasArticle || !style || generating || resetting} className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-stone-300 bg-white text-stone-600 font-medium shadow-sm hover:bg-stone-50 active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>
    {style === null && <button onClick={onAiTest} className="shrink-0 px-3 py-3 rounded-2xl border border-sky-200 bg-sky-50 text-sky-700 text-sm font-medium">AI接続テスト</button>}
  </div>;

  if (style === null) return <div>{actionButtons}<EmptyState message="スタイルを選択すると、Wiki記事を作成できます。" /></div>;

  if (isGeneratedWikipedia) return <div className="min-h-screen bg-white text-[#202122]">
    {actionButtons}
    <article className="w-full bg-white px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mt-2 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-8">
          <div className="min-w-0"><MarkdownRenderer content={article ?? ''} /></div>
          <aside className="border border-[#a2a9b1] bg-[#f8f9fa] p-3 h-fit text-sm">
            <div className="border-b border-[#c8ccd1] pb-2 font-semibold text-base">基本情報</div>
            <div className="mt-3 divide-y divide-[#c8ccd1]">
              <div className="py-2"><span className="font-semibold">名称</span><div className="mt-1">{world.name}</div></div>
              <div className="py-2"><span className="font-semibold">記録地点</span><div className="mt-1">{locationCount}</div></div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  </div>;

  return <div className={`border shadow-sm overflow-hidden transition-colors duration-300 ${pageClass}`}>
    <div className={`px-5 py-4 border-b ${headerClass}`}><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 opacity-70" /><div><p className="text-sm font-semibold">{isWikipedia ? 'Wikipedia' : isScp ? 'SCP FOUNDATION' : '古文書'}</p><p className="text-xs opacity-60">{isWikipedia ? '百科事典風' : isScp ? '機密記録風' : '絶望的な古文書風'}</p></div></div></div>
    <div className={`px-5 py-6 sm:px-8 sm:py-8 ${articleClass}`}><div className={`border-l-4 pl-5 sm:pl-6 ${isWikipedia ? 'border-stone-300' : isScp ? 'border-stone-700' : 'border-[#8f7654]'}`}>
      {actionButtons}{locationCount === 0 && !hasArticle && <EmptyState message="ロケーションを記録すると、Wiki記事を生成できます。" />}{hasArticle && article && <article className={`border p-5 sm:p-7 shadow-sm ${articleClass}`}><MarkdownRenderer content={article} className={isAncient ? 'font-serif' : 'font-sans'} /></article>}{!hasArticle && locationCount > 0 && isWikipedia && <WikipediaPreviewSkeleton worldName={world.name} />}
    </div></div>
  </div>;
}

function WikipediaPreviewSkeleton({ worldName }: { worldName: string }) {
  return <section className="mt-6 border border-stone-300 bg-white text-stone-800 px-5 py-6 sm:px-8 sm:py-8"><div className="border-b border-stone-400 pb-2"><h1 className="text-2xl sm:text-3xl font-normal leading-tight">{worldName}</h1></div><div className="mt-5 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px] gap-6"><div className="space-y-3"><div className="h-4 w-full bg-stone-100" /><div className="h-4 w-11/12 bg-stone-100" /><div className="h-4 w-4/5 bg-stone-100" /></div><div className="border border-stone-300 bg-stone-50 p-2"><div className="h-28 bg-stone-200" /><div className="mt-3 space-y-2"><div className="h-3 w-full bg-stone-200" /><div className="h-3 w-4/5 bg-stone-200" /><div className="h-3 w-5/6 bg-stone-200" /></div></div></div><div className="mt-7 border border-stone-300 bg-stone-50 p-4 max-w-sm"><div className="h-4 w-16 bg-stone-300 mb-3" /><div className="space-y-2"><div className="h-3 w-32 bg-stone-200" /><div className="h-3 w-40 bg-stone-200" /><div className="h-3 w-28 bg-stone-200" /><div className="h-3 w-36 bg-stone-200" /></div></div><div className="mt-8 border-b border-stone-400 pb-1"><div className="h-5 w-40 bg-stone-200" /></div><div className="mt-4 space-y-3"><div className="h-4 w-full bg-stone-100" /><div className="h-4 w-11/12 bg-stone-100" /><div className="h-4 w-5/6 bg-stone-100" /><div className="h-4 w-3/4 bg-stone-100" /></div><div className="mt-8 border-b border-stone-400 pb-1"><div className="h-5 w-32 bg-stone-200" /></div><div className="mt-4 space-y-3"><div className="h-4 w-full bg-stone-100" /><div className="h-4 w-10/12 bg-stone-100" /><div className="h-4 w-4/5 bg-stone-100" /></div></section>;
}
