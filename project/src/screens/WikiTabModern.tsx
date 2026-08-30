import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Hand,
  Play,
  RotateCcw,
  ScrollText,
  Share2,
  Sparkles,
} from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, NarratorDialogue, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import {
  playCancelSound,
  playConfirmSound,
  playDeleteSound,
  playDialogueCharSound,
  playHoverSound,
  playWikiCompleteSound,
  playWikiGeneratingNoiseSound,
} from '@/lib/sound';
import { playNpcBgm, stopNpcBgm } from '@/lib/bgm';

type WikiStyleId = 'wikipedia' | 'scp' | 'ancient';
type SavedState = Record<WikiStyleId, boolean>;
type RevealPhase = 'waiting' | 'result' | 'ready';
type GenerationReveal = {
  style: WikiStyleId;
  phase: RevealPhase;
  article: string;
  line: string;
};

const EMPTY_SAVED: SavedState = { wikipedia: false, scp: false, ancient: false };
const WIKI_GENERATE_COOLDOWN_MS = 5000;
const WIKI_SCROLL_HINT_SESSION_KEY = 'wiki-scroll-hint-shown';
const NARRATOR_MARKER = /<!--WIKI_NARRATOR:([\s\S]*?)-->/;

const WAITING_LINES: Record<WikiStyleId, string> = {
  wikipedia: '少し待ちたまえ。君の散らかった足跡を、せめて学術資料として読める形に整えているところだ。',
  scp: 'そのまま待機しろ。君の行動記録を機密資料として成立させるため、現在照合処理を行っている。',
  ancient: 'しばし待つがよい。愚かなる旅人よ……そなたの足跡を、後世に残す言葉へと編み直しておる。',
};

const styleMeta: Record<WikiStyleId, { title: string; shortTitle: string; subtitle: string }> = {
  wikipedia: { title: '百科事典 Wiki風', shortTitle: '百科事典', subtitle: '体系的・客観的解説' },
  scp: { title: '特異事象報告 (SCP風)', shortTitle: 'SCP報告', subtitle: '調査員ログ・異常観測' },
  ancient: { title: '古代伝承の詩', shortTitle: '古代伝承', subtitle: '語り継がれる叙事詩・神話' },
};

const styleCardAccent: Record<WikiStyleId, { selected: string; idle: string; pill: string }> = {
  wikipedia: {
    selected: 'scale-[1.02] border-[#B89A5A] bg-[#181713] shadow-[0_0_14px_rgba(184,154,90,0.18)]',
    idle: 'border-[#302D25] bg-[#0F172A]/80 opacity-90 hover:border-[#B89A5A]/55 hover:opacity-100',
    pill: 'border-[#B89A5A]/45 text-[#C9AE72]',
  },
  scp: {
    selected: 'scale-[1.02] border-[#4F8F9A] bg-[#111B22] shadow-[0_0_14px_rgba(79,143,154,0.18)]',
    idle: 'border-[#24343A] bg-[#0F172A]/80 opacity-90 hover:border-[#4F8F9A]/55 hover:opacity-100',
    pill: 'border-[#4F8F9A]/45 text-[#6FA9B1]',
  },
  ancient: {
    selected: 'scale-[1.02] border-[#9A635D] bg-[#1A1517] shadow-[0_0_14px_rgba(154,99,93,0.18)]',
    idle: 'border-[#37292A] bg-[#0F172A]/80 opacity-90 hover:border-[#9A635D]/55 hover:opacity-100',
    pill: 'border-[#9A635D]/45 text-[#B57D77]',
  },
};

function uniquePhotos(locations: LocationWithPhotos[]) {
  return locations
    .flatMap((location) => location.photos)
    .filter((photo, index, list) => list.findIndex((item) => item.storage_path === photo.storage_path) === index)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function splitWikiNarrator(content: string) {
  const match = content.match(NARRATOR_MARKER);
  return {
    content: content.replace(NARRATOR_MARKER, '').trim(),
    line: match?.[1]?.trim() ?? '',
  };
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
  backRequestKey = 0,
  onInternalBackAvailableChange,
}: {
  world: WorldWithMembers;
  reloadKey: number;
  onOpenLocation?: (locationId: string) => void;
  onArticleStateChange?: (isArticle: boolean) => void;
  backRequestKey?: number;
  onInternalBackAvailableChange?: (available: boolean) => void;
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
  const [generationReveal, setGenerationReveal] = useState<GenerationReveal | null>(null);
  const [typedReveal, setTypedReveal] = useState('');
  const [waitingComplete, setWaitingComplete] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const scrollHintStartYRef = useRef(0);
  const lastBackRequestRef = useRef(backRequestKey);

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
    onInternalBackAvailableChange?.(style !== null);
  }, [style, onInternalBackAvailableChange]);

  useEffect(() => {
    if (lastBackRequestRef.current === backRequestKey) return;
    lastBackRequestRef.current = backRequestKey;
    if (style === null) return;

    playCancelSound();
    setCopied(false);
    setShared(false);
    setArticle(null);
    setShowScrollHint(false);

    const previousStyle: WikiStyleId | null = style === 'ancient'
      ? 'scp'
      : style === 'scp'
        ? 'wikipedia'
        : null;
    setStyle(previousStyle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [backRequestKey, style]);

  useEffect(() => {
    if (!showScrollHint) return;
    const startY = scrollHintStartYRef.current;
    const handleScroll = () => {
      if (window.scrollY - startY >= 120) {
        setShowScrollHint(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showScrollHint]);

  useEffect(() => {
    if (!generationReveal) {
      setTypedReveal('');
      setWaitingComplete(false);
      return;
    }

    const text = generationReveal.phase === 'waiting'
      ? WAITING_LINES[generationReveal.style]
      : generationReveal.line;

    if (!text || generationReveal.phase === 'ready') return;

    let index = 0;
    setTypedReveal('');
    const timer = window.setInterval(() => {
      index = Math.min(text.length, index + 2);
      setTypedReveal(text.slice(0, index));
      if (index === 2 || index % 8 === 0) playDialogueCharSound();

      if (index >= text.length) {
        window.clearInterval(timer);
        if (generationReveal.phase === 'waiting') {
          setWaitingComplete(true);
        } else {
          setGenerationReveal((current) => current ? { ...current, phase: 'ready' } : current);
        }
      }
    }, 62);

    return () => window.clearInterval(timer);
  }, [generationReveal?.style, generationReveal?.phase, generationReveal?.line]);

  useEffect(() => {
    if (!generationReveal || generationReveal.phase !== 'waiting' || !waitingComplete || !generationReveal.article) return;
    const timer = window.setTimeout(() => {
      setGenerationReveal((current) => current ? { ...current, phase: 'result' } : current);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [generationReveal?.phase, generationReveal?.article, waitingComplete]);

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
  const parsedArticle = useMemo(() => splitWikiNarrator(article ?? ''), [article]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const marked = await addWikiPhotoMarkers(parsedArticle.content, additionalPhotos);
        const mainUrl = mainPhoto ? await getPhotoUrl(mainPhoto.storage_path) : null;
        if (!cancelled) {
          setArticleWithPhotos(marked);
          setMainPhotoUrl(mainUrl);
        }
      } catch {
        if (!cancelled) {
          setArticleWithPhotos(parsedArticle.content);
          setMainPhotoUrl(null);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [parsedArticle.content, mainPhoto?.storage_path, additionalPhotos.map((photo) => photo.storage_path).join('|')]);

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || resetting || article !== null || !style || locations.length === 0 || now < cooldownUntil) return;

    const selectedStyle = style;
    setShowScrollHint(false);
    setGenerating(true);
    setError('');
    setTypedReveal('');
    setWaitingComplete(false);
    setGenerationReveal({ style: selectedStyle, phase: 'waiting', article: '', line: '' });
    playWikiGeneratingNoiseSound();

    try {
      const result = await openRouterTestProvider.generate({ world, locations, style: selectedStyle });
      await saveWikiArticle(world.id, selectedStyle, result.content);
      setSaved((current) => ({ ...current, [selectedStyle]: true }));
      const parsed = splitWikiNarrator(result.content);
      setGenerationReveal((current) => current ? {
        ...current,
        article: result.content,
        line: parsed.line || NARRATORS[selectedStyle]?.quote || '……記録の編纂が完了した。',
      } : current);
    } catch (e) {
      setGenerationReveal(null);
      setError((e as Error).message);
    } finally {
      const until = Date.now() + WIKI_GENERATE_COOLDOWN_MS;
      setCooldownUntil(until);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => setCooldownUntil(0), WIKI_GENERATE_COOLDOWN_MS);
      setGenerating(false);
    }
  };

  const openGeneratedArticle = () => {
    if (!generationReveal?.article || generationReveal.phase !== 'ready') return;
    setArticle(generationReveal.article);
    setGenerationReveal(null);
    playWikiCompleteSound();
    window.scrollTo({ top: 0, behavior: 'auto' });
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
      setShowScrollHint(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const selectStyle = (id: WikiStyleId, showMobileHint = false) => {
    if (id === style) return;

    playConfirmSound();
    setCopied(false);
    setShared(false);
    setArticle(null);

    const shouldShowHint = showMobileHint
      && !saved[id]
      && typeof window !== 'undefined'
      && window.matchMedia('(max-width: 767px)').matches
      && window.sessionStorage.getItem(WIKI_SCROLL_HINT_SESSION_KEY) !== '1';

    if (shouldShowHint) {
      scrollHintStartYRef.current = window.scrollY;
      setShowScrollHint(true);
      window.sessionStorage.setItem(WIKI_SCROLL_HINT_SESSION_KEY, '1');
    } else {
      setShowScrollHint(false);
    }

    setStyle(id);

    if (!showMobileHint) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToCompilers = () => {
    playCancelSound();
    setCopied(false);
    setShared(false);
    setArticle(null);
    setStyle(null);
    setShowScrollHint(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(parsedArticle.content);
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
        await navigator.share({ title: `ウタペディア // ${world.name}`, text: parsedArticle.content });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(parsedArticle.content);
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
  const selectedWikiStyle = style ? WIKI_STYLES.find((item) => item.id === style) : null;

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-x-hidden sm:space-y-4 font-sans">
      {error && <ErrorBanner message={error} />}

      {!hasArticle && (
        <div className="mx-auto w-full max-w-4xl space-y-4 pb-4 sm:space-y-6">
          <section className="hud-bracket-cyan relative overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="min-w-0">
                <div className="game-ui-font flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#06B6D4] sm:text-[11px]">
                  <ScrollText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">AI CHRONICLE COMPILER // 旅の書 (WIKI)</span>
                </div>
                <h2 className="game-ui-font mt-1 text-lg font-bold tracking-wider text-[#F8FAFC] sm:text-xl">
                  冒険譚・年代記 自動編纂
                </h2>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#94A3B8]">
                  蓄積された探索記録をもとに、3名の編纂官がそれぞれの世界観・流派で旅の書を編纂します。
                </p>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-[#334155] bg-[#0B1018] px-3.5 py-2 text-center sm:flex-col sm:gap-1">
                <span className="game-ui-font text-[10px] text-[#64748B]">保存済み記事</span>
                <div className="game-ui-font text-sm font-bold text-[#06B6D4]">
                  {Object.values(saved).filter(Boolean).length} / 3 STYLES
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="game-ui-font mb-2.5 flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
              <span>編纂官（3つのスタイル）を選択</span>
              <span className="text-[10px] text-[#64748B]">タップで切り替え</span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {WIKI_STYLES.map((wikiStyle) => {
                const id = wikiStyle.id as WikiStyleId;
                const selected = style === id;
                const meta = styleMeta[id];
                const npc = NARRATORS[id];
                const accent = styleCardAccent[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectStyle(id, true)}
                    onMouseEnter={playHoverSound}
                    disabled={generating || resetting}
                    title={`${meta.title}${saved[id] ? '・保存済み' : ''}`}
                    className={`relative flex min-w-0 flex-col items-center rounded-xl border-2 p-2.5 text-center transition-all duration-200 sm:p-4 ${selected ? accent.selected : accent.idle}`}
                  >
                    <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                      {saved[id] ? (
                        <span className="game-ui-font flex items-center gap-0.5 rounded border border-[#10B981]/40 bg-[#10B981]/20 px-1 py-0.5 text-[8px] text-[#10B981] sm:px-1.5 sm:text-[10px]">
                          <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <span className="hidden sm:inline">保存済</span>
                        </span>
                      ) : (
                        <span className="game-ui-font rounded bg-[#1E293B] px-1 py-0.5 text-[8px] text-[#64748B] sm:px-1.5 sm:text-[9px]">未編纂</span>
                      )}
                    </div>

                    <div className="mb-2 mt-1 sm:mb-3">
                      <PixelNarrator style={id} />
                    </div>
                    <span className={`game-ui-font mb-0.5 whitespace-nowrap rounded border bg-[#0B1018] px-2 py-0.5 text-[10px] font-bold sm:mb-1 sm:text-xs ${accent.pill}`}>
                      {meta.shortTitle}
                    </span>
                    <h3 className="game-ui-font line-clamp-1 text-[10px] font-bold text-[#F8FAFC] sm:text-sm">{npc.name}</h3>
                    <p className="mt-0.5 hidden line-clamp-1 text-[10px] text-[#64748B] sm:block">{npc.role}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {style && narrator && selectedWikiStyle && (
            <section className="hud-bracket scroll-mt-20 space-y-4 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 sm:p-5">
              <div className="flex items-start gap-3.5">
                <PixelNarrator style={style} />
                <div className="min-w-0 flex-1">
                  <div className="game-ui-font text-xs font-bold text-[#06B6D4]">{narrator.role}</div>
                  <h3 className="game-ui-font mt-0.5 text-base font-bold text-[#F8FAFC] sm:text-lg">{narrator.name}</h3>
                  <p className="mt-1.5 rounded border border-[#1E293B] bg-[#0B1018]/80 p-2.5 text-xs italic leading-relaxed text-[#E2E8F0]">
                    「{narrator.quote}」
                  </p>
                </div>
              </div>

              <div className="border-t border-[#1E293B] pt-3 text-xs leading-relaxed text-[#94A3B8]">
                <span className="game-ui-font mr-1.5 font-bold text-[#F59E0B]">【スタイル特徴】</span>
                {selectedWikiStyle.description}。{styleMeta[style].subtitle}を基調に、このワールドの記録を再構成します。
              </div>

              <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
                <div className="game-ui-font text-[11px] text-[#64748B]">
                  {locations.length > 0 ? (
                    <span>参照可能な探索ログ: {locations.length} 件</span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#EF4444]">
                      <AlertCircle className="h-3 w-3" />記録が0件のため編纂できません
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleGenerate}
                  onMouseEnter={playHoverSound}
                  disabled={saved[style] || locations.length === 0 || generating || resetting || cooldownUntil > Date.now()}
                  className="game-ui-font inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-6 py-3 text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all hover:bg-[#D97706] active:scale-95 disabled:opacity-40 sm:text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{saved[style] ? '保存済み記事を開いています' : 'この流派でWikiを自動編纂する'}</span>
                  {!saved[style] && <Play className="h-3.5 w-3.5 fill-current" />}
                  {saved[style] && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {showScrollHint && !hasArticle && (
        <div aria-hidden="true" className="wiki-swipe-hint pointer-events-none fixed left-1/2 top-[56%] z-40 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <div className="wiki-swipe-trail" />
          <div className="wiki-swipe-ripple" />
          <div className="wiki-swipe-hand">
            <span className="wiki-swipe-touch" />
            <Hand className="wiki-swipe-hand-icon" strokeWidth={1.7} />
          </div>
        </div>
      )}

      {hasArticle && style && narrator && (
        <div className="mx-auto w-full max-w-4xl space-y-4 pb-5 sm:space-y-5">
          <div className="flex flex-col gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleBackToCompilers}
              onMouseEnter={playHoverSound}
              className="game-ui-font hidden min-h-[38px] items-center justify-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 text-xs text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:text-[#F59E0B] md:flex md:justify-start"
            >
              <ArrowRight className="h-4 w-4 rotate-180 text-[#F59E0B]" />
              <span>編纂官一覧に戻る</span>
            </button>

            <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center md:ml-auto">
              {(Object.keys(EMPTY_SAVED) as WikiStyleId[]).map((id) => {
                const active = id === style;
                const available = saved[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectStyle(id)}
                    onMouseEnter={!active ? playHoverSound : undefined}
                    disabled={active}
                    title={active ? `${styleMeta[id].title}・表示中` : available ? `${styleMeta[id].title}を開く` : `${styleMeta[id].title}を生成する`}
                    className={`game-ui-font flex min-w-0 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[10px] transition-all sm:px-3 sm:text-xs ${active ? 'bg-[#06B6D4] font-bold text-[#0B1018] shadow-[0_0_10px_rgba(6,182,212,0.3)]' : available ? 'border border-[#334155] bg-[#161F30] text-[#94A3B8] hover:text-[#E2E8F0]' : 'border border-[#1E293B] bg-[#101722] text-[#64748B] opacity-65 hover:opacity-100'}`}
                  >
                    <PixelNarrator style={id} compact />
                    <span className="hidden truncate sm:inline">{styleMeta[id].shortTitle}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <NarratorDialogue style={style} quote={parsedArticle.line} />

          <section className="hud-bracket min-w-0 max-w-full overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl">
            <div className="border-b border-[#1E293B] bg-[#0B1018] px-4 py-2.5 sm:px-5">
              <div className="game-ui-font flex items-center gap-2 text-[10px] tracking-wider text-[#64748B] sm:text-xs">
                <BookOpen className="h-3.5 w-3.5 text-[#06B6D4]" />
                <span>ARCHIVED WIKI ARTICLE // {styleMeta[style].shortTitle}</span>
              </div>
            </div>

            {isWikipedia ? (
              <article className="mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border border-[#a2a9b1] bg-white text-[#202122] sm:mx-4">
                <div className="flex min-w-0 items-center gap-3 border-b border-[#c8ccd1] px-4 py-3 sm:px-6">
                  {mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="h-10 w-10 shrink-0 border border-[#c8ccd1] object-cover" />}
                  <div className="min-w-0">
                    <div className="truncate font-serif text-lg sm:text-2xl">ウタペディア</div>
                    <div className="truncate text-[10px] text-[#54595d]">Survival Wiki // {world.name}</div>
                  </div>
                </div>
                <div className="grid min-w-0 max-w-full grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                  <div className="min-w-0 max-w-full overflow-x-hidden">
                    <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} />
                  </div>
                  <aside className="h-fit min-w-0 border border-[#c8ccd1] bg-[#f8f9fa] p-3 text-sm">
                    <div className="border-b border-[#c8ccd1] pb-2 font-semibold">基本情報</div>
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
              <article className={`mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border-2 p-4 sm:mx-4 sm:p-6 ${style === 'scp' ? 'border-cyan-400/60 bg-[#07141b] text-zinc-200' : 'border-orange-500/60 bg-[#160e09] text-[#ead8bf]'}`}>
                <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} className={style === 'ancient' ? 'font-serif' : 'font-sans'} />
              </article>
            )}
          </section>

          <div ref={footerRef} className="flex flex-col items-stretch justify-between gap-2.5 rounded-xl border border-[#1E293B] bg-[#0F172A] p-2.5 sm:flex-row sm:items-center sm:p-3.5">
            <button
              type="button"
              onClick={() => setResetTarget(true)}
              onMouseEnter={playHoverSound}
              className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded border border-transparent px-3 text-xs text-[#64748B] transition-colors hover:border-[#EF4444]/40 hover:bg-[#2A161C] hover:text-[#EF4444]"
            >
              <RotateCcw className="h-3.5 w-3.5" />この記事をリセット
            </button>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <button
                type="button"
                onClick={handleCopy}
                onMouseEnter={playHoverSound}
                className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 text-xs text-[#F8FAFC] transition-colors hover:bg-[#1E293B] sm:px-4"
              >
                <Copy className="h-3.5 w-3.5 text-[#06B6D4]" />{copied ? 'コピー完了' : '本文をコピー'}
              </button>
              <button
                type="button"
                onClick={handleShare}
                onMouseEnter={playHoverSound}
                className="game-ui-font flex min-h-[40px] items-center justify-center gap-1.5 rounded bg-[#06B6D4] px-3 text-xs font-bold text-[#0B1018] shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all hover:bg-[#0891B2] active:scale-95 sm:px-4"
              >
                <Share2 className="h-3.5 w-3.5" />{shared ? '共有完了' : '記事を共有'}
              </button>
            </div>
          </div>
        </div>
      )}

      {hasArticle && !footerVisible && (
        <button
          type="button"
          onClick={handleWarp}
          onMouseEnter={playHoverSound}
          title={scrollTarget === 'top' ? 'ページ上部へ' : 'ページ最下部へ'}
          aria-label={scrollTarget === 'top' ? 'ページ上部へ移動' : 'ページ最下部へ移動'}
          className="fixed bottom-20 right-2.5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-slate-600/70 bg-[#111624]/75 text-slate-300 opacity-30 shadow-lg backdrop-blur-sm transition-all hover:-translate-y-[2px] hover:border-amber-400 hover:bg-[#111624] hover:text-amber-300 hover:opacity-100 focus-visible:opacity-100 active:opacity-100"
        >
          {scrollTarget === 'top' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}

      {generationReveal && createPortal((
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05080E]/95 p-4 backdrop-blur-lg">
          <div className="hud-scanlines relative w-full max-w-lg space-y-5 rounded-2xl border-2 border-[#06B6D4] bg-[#0F172A] p-5 text-center shadow-[0_0_40px_rgba(6,182,212,0.3)] sm:p-7">
            <div className="mx-auto w-fit rounded-2xl border-2 border-[#06B6D4] bg-[#07101c] p-1 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
              <PixelNarrator style={generationReveal.style} />
            </div>

            <div>
              <div className="game-ui-font text-[10px] uppercase tracking-wider text-[#06B6D4] sm:text-xs">
                {NARRATORS[generationReveal.style]?.role}
              </div>
              <h3 className="game-ui-font mt-0.5 text-lg font-bold text-[#F8FAFC] sm:text-xl">
                {NARRATORS[generationReveal.style]?.name}
              </h3>
            </div>

            <div className="min-h-[110px] rounded-xl border border-[#1E293B] bg-[#0B1018] p-4 text-left sm:p-5">
              <p className="text-sm italic leading-relaxed text-[#E2E8F0] sm:text-base">
                「{typedReveal || '……'}{generationReveal.phase !== 'ready' && <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-[#06B6D4] align-middle" />}」
              </p>
            </div>

            {generationReveal.phase !== 'ready' ? (
              <div className="game-ui-font flex items-center justify-center gap-2 text-[10px] text-[#64748B] sm:text-xs">
                <Sparkles className="h-4 w-4 animate-spin text-[#06B6D4]" />
                <span>{generationReveal.phase === 'waiting' ? '年代記を編纂中…… 記録を照合しています' : '編纂結果を確定しています……'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={openGeneratedArticle}
                onMouseEnter={playHoverSound}
                className="game-ui-font flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-[#06B6D4] text-sm font-bold tracking-wider text-[#0B1018] shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:bg-[#0891B2] active:scale-95 sm:text-base"
              >
                <CheckCircle2 className="h-5 w-5" />
                <span>編纂完了 // 記事を読む</span>
              </button>
            )}
          </div>
        </div>
      ), document.body)}

      {resetTarget && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setResetTarget(false); } }}>
          <div className="w-full max-w-md border-2 border-red-700 bg-[#0d1627] p-5 shadow-[0_0_35px_rgba(0,0,0,.7)]">
            <div className="game-ui-font flex items-center gap-2 font-bold text-red-300"><AlertTriangle className="h-5 w-5" />旅の書をリセットしますか？</div>
            <p className="mt-2 text-xs text-slate-400">この人物の保存済みWiki記事だけを削除します。他の記事は残ります。</p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} onMouseEnter={playHoverSound} className="game-ui-font min-h-[42px] border border-slate-700 text-slate-300 transition-all hover:-translate-y-[2px]">キャンセル</button>
              <button type="button" onClick={confirmReset} onMouseEnter={playHoverSound} className="game-ui-font min-h-[42px] bg-red-700 font-bold text-white transition-all hover:-translate-y-[2px] hover:bg-red-600">リセットする</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
