import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, Copy, RotateCcw, Sparkles, X } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, NarratorDialogue, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { supabase } from '@/lib/supabase';
import { playAddSound, playCancelSound, playConfirmSound, playDeleteSound, playErrorSound, playHoverSound, playSaveSound } from '@/lib/sound';
import { playNpcBgm, stopNpcBgm } from '@/lib/bgm';

const WIKI_GENERATE_COOLDOWN_MS = 5000;
type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';

async function addWikiPhotoMarkers(content: string, photos: { storage_path: string }[]) {
  if (!content || photos.length === 0) return content;
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const maxInsertions = Math.min(photos.length, Math.max(0, blocks.length - 1));
  if (maxInsertions === 0) return content;
  const positions: number[] = [];
  const available = blocks.length - 1;
  let previous = 0;
  for (let index = 0; index < maxInsertions; index += 1) {
    let position = maxInsertions === available
      ? index + 1
      : Math.floor(((index + 1) * available) / (maxInsertions + 1));
    position = Math.max(1, position);
    if (position <= previous) position = previous + 1;
    position = Math.min(available, position);
    positions.push(position);
    previous = position;
  }
  const urls = await Promise.all(photos.slice(0, maxInsertions).map((photo) => getPhotoUrl(photo.storage_path)));
  for (let index = positions.length - 1; index >= 0; index -= 1) {
    blocks.splice(positions[index], 0, `<!--WIKI_PHOTO:${urls[index]}-->`);
  }
  return blocks.join('\n\n');
}

const styleMeta: Record<WikiStyleId, { title: string; subtitle: string; accent: string }> = {
  wikipedia: { title: '百科事典 Wiki風', subtitle: '体系的・客観的解説', accent: 'text-amber-400' },
  scp: { title: '特異事象報告 (SCP風)', subtitle: '調査員ログ・異常観測', accent: 'text-cyan-300' },
  ancient: { title: '古代伝承の詩', subtitle: '語り継がれる叙事詩・神話', accent: 'text-orange-400' },
};

export function WikiTabRedesigned({ world, reloadKey, onOpenLocation, onArticleStateChange }: { world: WorldWithMembers; reloadKey: number; onOpenLocation?: (locationId: string) => void; onArticleStateChange?: (isArticle: boolean) => void }) {
  const [style, setStyle] = useState<WikiStyleId | null>(null);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetTarget, setResetTarget] = useState(false);
  const [copied, setCopied] = useState(false);
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
      } else {
        const saved = await fetchWikiArticle(world.id, nextStyle);
        setArticle(saved?.content ?? null);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(style);
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [world.id, style, reloadKey]);

  useEffect(() => {
    const bgmByStyle: Record<WikiStyleId, 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient'> = {
      wikipedia: 'npc_bgm_wikipedia', scp: 'npc_bgm_scp', ancient: 'npc_bgm_ancient',
    };
    if (!style) {
      stopNpcBgm();
      return;
    }
    playNpcBgm(bgmByStyle[style]);
    return () => stopNpcBgm();
  }, [style]);

  useEffect(() => {
    onArticleStateChange?.(article !== null);
  }, [article, onArticleStateChange]);

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || resetting || article !== null || style === null || locations.length === 0 || now < cooldownUntil) return;
    setGenerating(true);
    setError('');
    playAddSound();
    try {
      const result = await openRouterTestProvider.generate({ world, locations, style });
      await saveWikiArticle(world.id, style, result.content);
      setArticle(result.content);
      playSaveSound();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      const until = Date.now() + WIKI_GENERATE_COOLDOWN_MS;
      setCooldownUntil(until);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => setCooldownUntil(0), WIKI_GENERATE_COOLDOWN_MS);
      setGenerating(false);
    }
  };

  const confirmReset = async () => {
    if (!resetTarget || !style || !article || resetting) return;
    setResetTarget(false);
    setResetting(true);
    setError('');
    playDeleteSound();
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

  const handleCopy = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(article);
      setCopied(true);
      playConfirmSound();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      playErrorSound();
    }
  };

  const handleAiTest = async () => {
    setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('wiki-ai-test', { body: { message: 'wiki-ai-connectivity-test' } });
      if (invokeError) throw invokeError;
      if (!data?.ok) throw new Error('AIテストFunctionから正常な応答がありません。');
      window.alert(`AI接続テスト成功: ${data.message}`);
    } catch (e) {
      setError(`AI接続テスト失敗: ${(e as Error).message}`);
    }
  };

  const articleHasPhotos = useMemo(() => locations.flatMap((location) => location.photos).filter((photo, index, list) => list.findIndex((item) => item.storage_path === photo.storage_path) === index).sort((a, b) => a.created_at.localeCompare(b.created_at)), [locations]);
  const mainPhoto = articleHasPhotos[0] ?? null;
  const additionalPhotos = articleHasPhotos.slice(1, 5);
  const [articleWithPhotos, setArticleWithPhotos] = useState(article ?? '');
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const marked = await addWikiPhotoMarkers(article ?? '', additionalPhotos);
        const mainUrl = mainPhoto ? await getPhotoUrl(mainPhoto.storage_path) : null;
        if (!cancelled) {
          setArticleWithPhotos(marked);
          setMainPhotoUrl(mainUrl);
        }
      } catch {
        if (!cancelled) setArticleWithPhotos(article ?? '');
      }
    };
    void run();
    return () => { cancelled = true; };
  }, [article, mainPhoto?.storage_path, additionalPhotos.map((photo) => photo.storage_path).join('|')]);

  if (loading) return <Spinner label="旅の書（Wiki）を読み込み中" />;

  const hasArticle = article !== null;
  const isWikipedia = style === 'wikipedia';
  const narrator = style ? NARRATORS[style] : null;

  const locationLinks = locations.map((location) => ({ name: location.name, onClick: () => onOpenLocation?.(location.id) }));

  return (
    <div className="w-full space-y-3 sm:space-y-4 font-sans">
      {error && <ErrorBanner message={error} />}

      {!hasArticle && (
        <section className="w-full border-2 border-cyan-500/70 bg-[#0f1424] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,.5)]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0"><h2 className="text-xs sm:text-sm font-bold text-cyan-300 font-mono truncate">冒険譚・年代記自動編纂</h2><p className="text-[9px] sm:text-[10px] text-slate-400 truncate">記録を、どんな世界の物語として残す？</p></div>
            </div>
            <span className="shrink-0 text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5">対象記録: {locations.length}件</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {WIKI_STYLES.map((wikiStyle) => {
              const id = wikiStyle.id as WikiStyleId;
              const selected = style === id;
              const meta = styleMeta[id];
              const npc = NARRATORS[id];
              return (
                <button key={id} type="button" onClick={() => { playConfirmSound(); setStyle(id); setArticle(null); }} onMouseEnter={playHoverSound} disabled={generating || resetting}
                  className={`relative min-w-0 border-2 p-1.5 sm:p-2 text-left transition-all ${selected ? 'border-amber-500 bg-[#161a24]' : 'border-slate-700 bg-[#0c101c] hover:border-slate-500'}`}>
                  <div className="flex items-center gap-1.5">
                    <PixelNarrator style={id} compact />
                    <div className="min-w-0">
                      <div className={`text-[8px] sm:text-[9px] font-mono font-bold ${selected ? 'text-amber-400' : 'text-cyan-300'}`}>STYLE {id === 'wikipedia' ? '01' : id === 'scp' ? '02' : '03'}</div>
                      <div className={`text-[10px] sm:text-[11px] leading-tight font-bold truncate ${selected ? 'text-white' : 'text-slate-200'}`}>{meta.title}</div>
                      <div className="text-[8px] sm:text-[9px] text-slate-500 truncate">{meta.subtitle}</div>
                    </div>
                  </div>
                  {selected && <span className="absolute right-1 top-1 text-[7px] font-mono text-amber-400">SELECTED</span>}
                  <p className={`mt-1.5 text-[8px] sm:text-[9px] leading-relaxed line-clamp-2 ${npc.text}`}>{npc.quote}</p>
                </button>
              );
            })}
          </div>

          <button type="button" onClick={handleGenerate} onMouseEnter={playHoverSound} disabled={style === null || locations.length === 0 || generating || resetting || cooldownUntil > Date.now()}
            className="w-full mt-2.5 min-h-[44px] py-2.5 bg-cyan-500 text-black font-black font-mono text-xs sm:text-sm border-b-2 border-cyan-700 hover:bg-cyan-400 disabled:opacity-40 flex items-center justify-center gap-2">
            {generating ? <><span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />AI が冒険譚を編纂中...</> : <><Sparkles className="w-4 h-4" />このワールドの Wiki 冒険譚を生成する</>}
          </button>
          {locations.length === 0 && <p className="mt-2 text-[9px] text-amber-400 text-center font-mono">※ まずロケーションを1件以上記録してください。</p>}
          {locations.length > 0 && <p className="mt-2 text-[9px] sm:text-[10px] text-slate-500 leading-relaxed">記録された座標・メモ・写真を元に、選択した流派の「旅の書」を編纂します。</p>}
          {style === null && locations.length > 0 && <button type="button" onClick={handleAiTest} onMouseEnter={playHoverSound} className="mt-2 text-[9px] text-emerald-400 font-mono underline">AI接続テスト</button>}
        </section>
      )}

      {hasArticle && style && narrator && (
        <section className="border-2 border-slate-700 bg-[#0f1424] overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-slate-800">
            <div className={`flex items-center gap-2 text-xs sm:text-sm font-bold font-mono ${styleMeta[style].accent}`}>
              <BookOpen className="w-4 h-4" />
              <span>{styleMeta[style].title}</span>
            </div>
            <button type="button" onClick={() => setResetTarget(true)} onMouseEnter={playHoverSound} className="min-h-[36px] px-2.5 border border-slate-700 text-slate-400 hover:text-amber-400 text-[10px] font-mono flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" />リセット</button>
          </div>

          <NarratorDialogue style={style} />

          {isWikipedia ? (
            <article className="mt-4 mx-3 sm:mx-4 mb-4 border border-[#a2a9b1] bg-white text-[#202122]">
              <div className="px-4 sm:px-6 py-3 border-b border-[#c8ccd1] flex items-center gap-3">
                {mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="h-10 w-10 object-cover border border-[#c8ccd1]" />}
                <div><div className="font-serif text-lg sm:text-2xl">ウタペディア</div><div className="text-[10px] text-[#54595d]">Survival Wiki // {world.name}</div></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-4 p-4 sm:p-5">
                <div className="min-w-0"><MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} /></div>
                <aside className="border border-[#c8ccd1] bg-[#f8f9fa] p-3 h-fit text-sm">
                  <div className="font-semibold border-b border-[#c8ccd1] pb-2">基本情報</div>
                  <div className="mt-2 space-y-2"><div><b>名称</b><div>{world.name}</div></div><div><b>プレイヤー</b><div>{world.player ?? '不明'}</div></div><div><b>記録地点</b><div>{locations.length}</div></div><div><b>参加メンバー</b><div>{world.members.length}</div></div></div>
                </aside>
              </div>
            </article>
          ) : (
            <article className={`mx-3 sm:mx-4 mb-4 mt-4 border-2 p-4 sm:p-6 ${style === 'scp' ? 'bg-[#07141b] border-cyan-400/60 text-zinc-200' : 'bg-[#160e09] border-orange-500/60 text-[#ead8bf]'}`}>
              <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} className={style === 'ancient' ? 'font-serif' : 'font-sans'} />
            </article>
          )}

          <div className="flex flex-col sm:flex-row gap-2 px-3 sm:px-4 pb-4">
            <button type="button" onClick={handleCopy} onMouseEnter={playHoverSound} className="flex-1 min-h-[44px] border-2 border-slate-700 bg-[#121724] text-slate-200 font-bold hover:border-cyan-400 flex items-center justify-center gap-2 text-xs"><Copy className="w-4 h-4" />{copied ? 'コピー完了' : '本文をコピー'}</button>
          </div>
        </section>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setResetTarget(false); } }}>
          <div className="w-full max-w-md bg-[#0d1627] border-2 border-red-700 shadow-[0_0_35px_rgba(0,0,0,.7)] p-5">
            <div className="flex items-center gap-2 text-red-300 font-bold"><AlertTriangle className="w-5 h-5" />旅の書をリセットしますか？</div>
            <p className="mt-2 text-xs text-slate-400">生成済みのWiki記事と流派選択を初期化します。</p>
            <div className="grid grid-cols-2 gap-2 mt-5"><button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} onMouseEnter={playHoverSound} className="min-h-[42px] border border-slate-700 text-slate-300">キャンセル</button><button type="button" onClick={confirmReset} onMouseEnter={playHoverSound} className="min-h-[42px] bg-red-700 text-white font-bold">リセットする</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
