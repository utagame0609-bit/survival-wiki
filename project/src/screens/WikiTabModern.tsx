import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, ChevronDown, ChevronLeft, ChevronUp, Copy, RotateCcw, Share2, Sparkles } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, NarratorDialogue, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { playAddSound, playCancelSound, playConfirmSound, playDeleteSound, playHoverSound, playSaveSound } from '@/lib/sound';
import { playNpcBgm, stopNpcBgm } from '@/lib/bgm';

type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';
type SavedState = Record<WikiStyleId, boolean>;

const EMPTY_SAVED: SavedState = { wikipedia: false, scp: false, ancient: false };
const WIKI_GENERATE_COOLDOWN_MS = 5000;

const styleMeta: Record<WikiStyleId, { title: string; shortTitle: string; subtitle: string; accent: string }> = {
  wikipedia: { title: '百科事典 Wiki風', shortTitle: '百科事典', subtitle: '体系的・客観的解説', accent: 'text-amber-400' },
  scp: { title: '特異事象報告 (SCP風)', shortTitle: 'SCP報告', subtitle: '調査員ログ・異常観測', accent: 'text-cyan-300' },
  ancient: { title: '古代伝承の詩', shortTitle: '古代伝承', subtitle: '語り継がれる叙事詩・神話', accent: 'text-orange-400' },
};

function uniquePhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos)
    .filter((photo, index, list) => list.findIndex((item) => item.storage_path === photo.storage_path) === index)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

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

export function WikiTabModern({
  world,
  reloadKey,
  onOpenLocation,
  onArticleStateChange,
}: {
  world: WorldWithMembers;
  reloadKey: number;
  onOpenLocation?: (locationId: string) => void;
  onArticleStateChange?: (isArticle: boolean) => void;
}) {
  const [style, setStyle] = useState<WikiStyleId | null>(null);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedState>(EMPTY_SAVED);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetTarget, setResetTarget] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [error, setError] = useState('');
  const [articleWithPhotos, setArticleWithPhotos] = useState('');
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);
  const [scrollTarget, setScrollTarget] = useState<'bottom' | 'top'>('bottom');
  const [footerVisible, setFooterVisible] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);

  const load = async (nextStyle: WikiStyleId | null = style) => {
    setLoading(true);
    setError('');
    try {
      const locs = await fetchLocations(world.id);
      setLocations(locs);

      const entries = await Promise.all(
        (Object.keys(EMPTY_SAVED) as WikiStyleId[]).map(async (id) => {
          const item = await fetchWikiArticle(world.id, id);
          return [id, Boolean(item?.content)] as const;
        }),
      );
      setSaved(Object.fromEntries(entries) as SavedState);

      if (nextStyle === null) {
        setArticle(null);
      } else {
        const item = await fetchWikiArticle(world.id, nextStyle);
        setArticle(item?.content ?? null);
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
  }, [world.id, reloadKey, style]);

  useEffect(() => {
    const bgmByStyle: Record<WikiStyleId, 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient'> = {
      wikipedia: 'npc_bgm_wikipedia',
      scp: 'npc_bgm_scp',
      ancient: 'npc_bgm_ancient',
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

  useEffect(() => {
    if (!article) return;
    const updateTarget = () => {
      const threshold = Math.max(420, window.innerHeight * 0.7);
      setScrollTarget(window.scrollY > threshold ? 'top' : 'bottom');
    };
    updateTarget();
    window.addEventListener('scroll', updateTarget, { passive: true });
    return () => window.removeEventListener('scroll', updateTarget);
  }, [article]);

  useEffect(() => {
    if (!article || !footerRef.current || typeof IntersectionObserver === 'undefined') {
      setFooterVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setFooterVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [article]);

  const articlePhotos = useMemo(() => uniquePhotos(locations), [locations]);
  const mainPhoto = articlePhotos[0] ?? null;
  const additionalPhotos = articlePhotos.slice(1, 5);

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
        if (!cancelled) {
          setArticleWithPhotos(article ?? '');
          setMainPhotoUrl(null);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [article, mainPhoto?.storage_path, additionalPhotos.map((photo) => photo.storage_path).join('|')]);

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || resetting || article !== null || !style || locations.length === 0 || now < cooldownUntil) return;
    setGenerating(true);
    setError('');
    playAddSound();
    try {
      const result = await openRouterTestProvider.generate({ world, locations, style });
      await saveWikiArticle(world.id, style, result.content);
      setArticle(result.content);
      setSaved((current) => ({ ...current, [style]: true }));
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
      setSaved((current) => ({ ...current, [style]: false }));
      setArticle(null);
      setStyle(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const handleBackToWiki = () => {
    playCancelSound();
    setArticle(null);
    setStyle(null);
    setCopied(false);
    setShared(false);
  };

  const openStyle = (id: WikiStyleId) => {
    if (!saved[id] || id === style) return;
    playConfirmSound();
    setStyle(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(article);
      setCopied(true);
      setShared(false);
      playConfirmSound();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('本文をコピーできませんでした。');
    }
  };

  const handleShare = async () => {
    if (!article) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: `ウタペディア // ${world.name}`, text: article });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(article);
        setShared(true);
      }
      playConfirmSound();
      window.setTimeout(() => setShared(false), 1800);
    } catch {
      // User-cancelled native share dialogs are intentionally silent.
    }
  };

  const handleWarp = () => {
    if (scrollTarget === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  if (loading) return <Spinner label="旅の書（Wiki）を読み込み中" />;

  const hasArticle = article !== null;
  const isWikipedia = style === 'wikipedia';
  const narrator = style ? NARRATORS[style] : null;
  const locationLinks = locations.map((location) => ({
    name: location.name,
    onClick: () => onOpenLocation?.(location.id),
  }));

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-x-hidden sm:space-y-4 font-sans">
      {error && <ErrorBanner message={error} />}

      {!hasArticle && (
        <section className="w-full min-w-0 border-2 border-cyan-500/70 bg-[#0f1424] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,.5)]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-cyan-300 font-mono truncate">冒険譚・年代記自動編纂</h2>
                <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">記録を、どんな世界の物語として残す？</p>
              </div>
            </div>
            <span className="shrink-0 text-[9px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5">
              保存: {Object.values(saved).filter(Boolean).length}/3
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {WIKI_STYLES.map((wikiStyle) => {
              const id = wikiStyle.id as WikiStyleId;
              const selected = style === id;
              const meta = styleMeta[id];
              const npc = NARRATORS[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    playConfirmSound();
                    setStyle(id);
                    setArticle(null);
                  }}
                  onMouseEnter={playHoverSound}
                  disabled={generating || resetting}
                  className={`relative min-w-0 overflow-hidden border-2 p-1.5 text-left transition-all hover:-translate-y-[3px] sm:p-2 ${selected ? 'border-amber-500 bg-[#161a24] shadow-[0_0_14px_rgba(245,158,11,.18)]' : 'border-slate-700 bg-[#0c101c] hover:border-slate-500'}`}
                >
                  <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
                    <PixelNarrator style={id} compact />
                    <div className="min-w-0 flex-1">
                      <div className={`text-[7px] sm:text-[9px] font-mono font-bold ${selected ? 'text-amber-400' : 'text-cyan-300'}`}>
                        STYLE {id === 'wikipedia' ? '01' : id === 'scp' ? '02' : '03'}
                      </div>
                      <div className={`truncate text-[9px] sm:text-[11px] leading-tight font-bold ${selected ? 'text-white' : 'text-slate-200'}`}>
                        {meta.shortTitle}
                      </div>
                    </div>
                  </div>
                  {saved[id] && <span className="absolute right-1 top-1 text-[6px] sm:text-[7px] font-mono text-emerald-400">SAVED</span>}
                  <p className={`mt-1.5 line-clamp-2 text-[7px] sm:text-[9px] leading-relaxed ${npc.text}`}>{npc.quote}</p>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            onMouseEnter={playHoverSound}
            disabled={!style || saved[style] || locations.length === 0 || generating || resetting || cooldownUntil > Date.now()}
            className="w-full mt-2.5 min-h-[44px] py-2.5 bg-cyan-500 text-black font-black font-mono text-xs sm:text-sm border-b-2 border-cyan-700 hover:bg-cyan-400 disabled:opacity-40 flex items-center justify-center gap-2 hover:-translate-y-[2px] transition-all"
          >
            {generating ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />AI が冒険譚を編纂中...
              </>
            ) : saved[style ?? 'wikipedia'] ? (
              <><BookOpen className="w-4 h-4" />保存済みWikiを開いています</>
            ) : (
              <><Sparkles className="w-4 h-4" />このワールドの Wiki 冒険譚を生成する</>
            )}
          </button>
          {locations.length === 0 && <p className="mt-2 text-[9px] text-amber-400 text-center font-mono">※ まずロケーションを1件以上記録してください。</p>}
          {locations.length > 0 && <p className="mt-2 text-[9px] sm:text-[10px] text-slate-500 leading-relaxed">記録された座標・メモ・写真を元に、選択した流派の「旅の書」を編纂します。保存済みの流派はカードから直接開けます。</p>}
        </section>
      )}

      {hasArticle && style && narrator && (
        <section className="min-w-0 max-w-full overflow-x-hidden border-2 border-slate-700 bg-[#0f1424]">
          <div className="sticky top-0 z-10 border-b border-slate-800 bg-[#0f1424]/95 px-2.5 py-2 backdrop-blur-sm sm:px-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBackToWiki}
                onMouseEnter={playHoverSound}
                className="min-h-[38px] shrink-0 px-2 border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:-translate-y-[2px] text-[9px] sm:text-[10px] font-mono flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />WIKI一覧
              </button>

              <div className="grid min-w-0 flex-1 grid-cols-3 gap-1">
                {(Object.keys(EMPTY_SAVED) as WikiStyleId[]).map((id) => {
                  const active = id === style;
                  const available = saved[id];
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => openStyle(id)}
                      onMouseEnter={available && !active ? playHoverSound : undefined}
                      disabled={!available || active}
                      title={available ? styleMeta[id].title : `${styleMeta[id].title}（未生成）`}
                      className={`flex min-w-0 items-center justify-center gap-1 border px-1 py-1 transition-all ${
                        active
                          ? 'border-amber-400 bg-amber-500/15 text-amber-300'
                          : available
                            ? 'border-slate-700 bg-[#0b101b] text-slate-300 hover:border-cyan-400 hover:text-cyan-300 hover:-translate-y-[2px]'
                            : 'border-slate-800 bg-[#090d15] text-slate-600 opacity-45 cursor-not-allowed'
                      }`}
                    >
                      <PixelNarrator style={id} compact />
                      <span className="hidden min-w-0 truncate text-[8px] font-mono font-bold sm:inline">{styleMeta[id].shortTitle}</span>
                      <span className="text-[8px] font-mono font-black sm:hidden">{id === 'wikipedia' ? '01' : id === 'scp' ? '02' : '03'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <NarratorDialogue style={style} />

          {isWikipedia ? (
            <article className="mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border border-[#a2a9b1] bg-white text-[#202122] sm:mx-4">
              <div className="flex min-w-0 items-center gap-3 border-b border-[#c8ccd1] px-4 py-3 sm:px-6">
                {mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="h-10 w-10 shrink-0 object-cover border border-[#c8ccd1]" />}
                <div className="min-w-0">
                  <div className="truncate font-serif text-lg sm:text-2xl">ウタペディア</div>
                  <div className="truncate text-[10px] text-[#54595d]">Survival Wiki // {world.name}</div>
                </div>
              </div>
              <div className="grid min-w-0 max-w-full grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0 max-w-full overflow-x-hidden">
                  <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} />
                </div>
                <aside className="min-w-0 h-fit border border-[#c8ccd1] bg-[#f8f9fa] p-3 text-sm">
                  <div className="font-semibold border-b border-[#c8ccd1] pb-2">基本情報</div>
                  <div className="mt-2 space-y-2">
                    <div><b>名称</b><div className="break-words">{world.name}</div></div>
                    <div><b>プレイヤー</b><div className="break-words">{world.player ?? '不明'}</div></div>
                    <div><b>記録地点</b><div>{locations.length}</div></div>
                    <div><b>参加メンバー</b><div>{world.members.length}</div></div>
                  </div>
                </aside>
              </div>
            </article>
          ) : (
            <article className={`mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border-2 p-4 sm:mx-4 sm:p-6 ${style === 'scp' ? 'bg-[#07141b] border-cyan-400/60 text-zinc-200' : 'bg-[#160e09] border-orange-500/60 text-[#ead8bf]'}`}>
              <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} className={style === 'ancient' ? 'font-serif' : 'font-sans'} />
            </article>
          )}

          <div ref={footerRef} className="border-t border-slate-800 bg-[#0f1424] px-3 py-3 sm:px-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleShare}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] border-2 border-cyan-500/60 bg-[#0d1624] text-cyan-300 font-bold hover:border-cyan-300 hover:bg-cyan-500/10 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Share2 className="w-4 h-4" />{shared ? '共有完了' : '共有'}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] border-2 border-slate-700 bg-[#121724] text-slate-200 font-bold hover:border-cyan-400 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Copy className="w-4 h-4" />{copied ? 'コピー完了' : '本文コピー'}
              </button>
              <button
                type="button"
                onClick={() => setResetTarget(true)}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] border-2 border-slate-700 bg-[#121724] text-slate-300 font-bold hover:border-amber-400 hover:text-amber-300 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <RotateCcw className="w-4 h-4" />リセット
              </button>
              <button
                type="button"
                onClick={handleBackToWiki}
                onMouseEnter={playHoverSound}
                className="min-h-[44px] border-2 border-amber-500/70 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20 hover:-translate-y-[2px] transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <BookOpen className="w-4 h-4" />Wiki一覧
              </button>
            </div>
          </div>
        </section>
      )}

      {hasArticle && !footerVisible && (
        <button
          type="button"
          onClick={handleWarp}
          onMouseEnter={playHoverSound}
          className="fixed right-3 bottom-16 z-30 min-h-[40px] px-2.5 border border-slate-600 bg-[#111624]/80 text-slate-300/70 font-mono text-[9px] sm:text-[10px] opacity-50 hover:opacity-100 hover:bg-[#111624] hover:border-amber-400 hover:text-amber-300 hover:-translate-y-[2px] focus:opacity-100 active:opacity-100 transition-all shadow-lg flex items-center gap-1.5"
          aria-label={scrollTarget === 'top' ? 'ページ上部へ移動' : 'ページ最下部へ移動'}
        >
          {scrollTarget === 'top' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {scrollTarget === 'top' ? 'TOP' : '最下部'}
        </button>
      )}

      {resetTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setResetTarget(false); } }}>
          <div className="w-full max-w-md bg-[#0d1627] border-2 border-red-700 shadow-[0_0_35px_rgba(0,0,0,.7)] p-5">
            <div className="flex items-center gap-2 text-red-300 font-bold"><AlertTriangle className="w-5 h-5" />旅の書をリセットしますか？</div>
            <p className="mt-2 text-xs text-slate-400">この流派の保存済みWiki記事だけを削除します。他の流派の記事は残ります。</p>
            <div className="grid grid-cols-2 gap-2 mt-5">
              <button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} onMouseEnter={playHoverSound} className="min-h-[42px] border border-slate-700 text-slate-300 hover:-translate-y-[2px] transition-all">キャンセル</button>
              <button type="button" onClick={confirmReset} onMouseEnter={playHoverSound} className="min-h-[42px] bg-red-700 text-white font-bold hover:bg-red-600 hover:-translate-y-[2px] transition-all">リセットする</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
