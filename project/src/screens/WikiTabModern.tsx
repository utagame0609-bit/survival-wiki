import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, NarratorDialogue } from '@/components/wiki/WikiNarrator';
import { WikiCompilerHome } from '@/components/wiki/WikiCompilerHome';
import { WikiGenerationRevealModal } from '@/components/wiki/WikiGenerationRevealModal';
import { WikiArticleToolbar } from '@/components/wiki/WikiArticleToolbar';
import { WikiArticleActions } from '@/components/wiki/WikiArticleActions';
import { ScpDossierArticle } from '@/components/wiki/ScpDossierArticle';
import { GildasChronicleArticle } from '@/components/wiki/GildasChronicleArticle';
import { HernanEncyclopediaArticle } from '@/components/wiki/HernanEncyclopediaArticle';
import { scpDossierToPlainText } from '@/lib/wikiScp';
import { gildasChronicleToPlainText, parseStoredGildasChronicle } from '@/lib/wikiGildas';
import { hernanArticleToPlainText, parseStoredHernanArticle } from '@/lib/wikiHernan';
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
const NARRATOR_MARKER = /<!--WIKI_NARRATOR:([\s\S]*?)-->/;

const WAITING_LINES: Record<WikiStyleId, string> = {
  wikipedia: '少し待ちたまえ。君の散らかった足跡を、せめて学術資料として読める形に整えているところだ。',
  scp: 'そのまま待機しろ。君の行動記録を機密資料として成立させるため、現在照合処理を行っている。',
  ancient: 'しばし待つがよい。旅人よ……そなたの足跡を、後世に残す物語へと編み直しておる。',
};

const styleMeta: Record<WikiStyleId, { title: string; shortTitle: string; subtitle: string }> = {
  wikipedia: { title: '百科事典 Wiki風', shortTitle: '百科事典', subtitle: '体系的・客観的解説' },
  scp: { title: '特異事象報告 (SCP風)', shortTitle: 'SCP報告', subtitle: '調査員ログ・異常観測' },
  ancient: { title: '古代伝承の詩', shortTitle: '古代伝承', subtitle: '語り継がれる叙事詩・神話' },
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
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
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

    const previousStyle: WikiStyleId | null = style === 'ancient'
      ? 'scp'
      : style === 'scp'
        ? 'wikipedia'
        : null;
    setStyle(previousStyle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [backRequestKey, style]);

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
  const isStructuredGildas = style === 'ancient' && Boolean(parseStoredGildasChronicle(parsedArticle.content));
  const isStructuredHernan = style === 'wikipedia' && Boolean(parseStoredHernanArticle(parsedArticle.content));
  const articleExportText = useMemo(() => {
    if (style === 'scp') return scpDossierToPlainText(parsedArticle.content) ?? parsedArticle.content;
    if (style === 'ancient') return gildasChronicleToPlainText(parsedArticle.content, parsedArticle.line) ?? parsedArticle.content;
    if (style === 'wikipedia') return hernanArticleToPlainText(parsedArticle.content, parsedArticle.line) ?? parsedArticle.content;
    return parsedArticle.content;
  }, [style, parsedArticle.content, parsedArticle.line]);

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
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const selectStyle = (id: WikiStyleId, preserveScrollPosition = false) => {
    if (id === style) return;

    playConfirmSound();
    setCopied(false);
    setShared(false);
    setArticle(null);
    setStyle(id);

    if (!preserveScrollPosition) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToCompilers = () => {
    playCancelSound();
    setCopied(false);
    setShared(false);
    setArticle(null);
    setStyle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = async () => {
    if (!article) return;
    try {
      await navigator.clipboard.writeText(articleExportText);
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
        await navigator.share({ title: `ウタペディア // ${world.name}`, text: articleExportText });
        setShared(true);
      } else {
        await navigator.clipboard.writeText(articleExportText);
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
        <WikiCompilerHome
          style={style}
          saved={saved}
          locationCount={locations.length}
          generating={generating}
          resetting={resetting}
          cooldownUntil={cooldownUntil}
          onSelectStyle={(id) => selectStyle(id, true)}
          onGenerate={handleGenerate}
        />
      )}

      {hasArticle && style && narrator && (
        <div className={`mx-auto w-full space-y-4 pb-5 sm:space-y-5 ${style === 'scp' || isStructuredGildas || isStructuredHernan ? 'max-w-[96rem]' : 'max-w-4xl'}`}>
          <WikiArticleToolbar
            style={style}
            saved={saved}
            onSelectStyle={(id) => selectStyle(id)}
            onBack={handleBackToCompilers}
          />

          {style !== 'scp' && !isStructuredGildas && !isStructuredHernan && <NarratorDialogue style={style} quote={parsedArticle.line} />}

          <section className="hud-bracket min-w-0 max-w-full overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl">
            <div className="border-b border-[#1E293B] bg-[#0B1018] px-4 py-2.5 sm:px-5">
              <div className="game-ui-font flex items-center gap-2 text-[10px] tracking-wider text-[#64748B] sm:text-xs">
                <BookOpen className="h-3.5 w-3.5 text-[#06B6D4]" />
                <span>ARCHIVED WIKI ARTICLE // {styleMeta[style].shortTitle}</span>
              </div>
            </div>

            {style === 'scp' ? (
              <ScpDossierArticle
                world={world}
                locations={locations}
                content={articleWithPhotos}
                mainPhotoUrl={mainPhotoUrl}
                narratorLine={parsedArticle.line}
                locationLinks={locationLinks}
              />
            ) : isStructuredGildas ? (
              <GildasChronicleArticle
                world={world}
                locations={locations}
                content={parsedArticle.content}
                narratorLine={parsedArticle.line}
                locationLinks={locationLinks}
              />
            ) : isStructuredHernan ? (
              <HernanEncyclopediaArticle
                world={world}
                locations={locations}
                content={parsedArticle.content}
                narratorLine={parsedArticle.line}
                locationLinks={locationLinks}
              />
            ) : isWikipedia ? (
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
              <article className="mx-3 mb-4 mt-4 min-w-0 max-w-full overflow-x-hidden border-2 border-orange-500/60 bg-[#160e09] p-4 text-[#ead8bf] sm:mx-4 sm:p-6">
                <MarkdownRenderer content={articleWithPhotos} locationLinks={locationLinks} className="font-serif" />
              </article>
            )}
          </section>

          <WikiArticleActions
            ref={footerRef}
            copied={copied}
            shared={shared}
            onReset={() => setResetTarget(true)}
            onCopy={handleCopy}
            onShare={handleShare}
          />
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

      <WikiGenerationRevealModal
        reveal={generationReveal}
        typedText={typedReveal}
        onOpenArticle={openGeneratedArticle}
      />

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
