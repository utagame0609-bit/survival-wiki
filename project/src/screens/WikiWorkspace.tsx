import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { NARRATORS, NarratorDialogue } from '@/components/wiki/WikiNarrator';
import {
  WikiCompilerHome,
  type WikiCompilerSavedCountState,
  type WikiCompilerSavedState,
} from '@/components/wiki/WikiCompilerHome';
import { WikiGenerationRevealModal } from '@/components/wiki/WikiGenerationRevealModal';
import { WikiArticleToolbar } from '@/components/wiki/WikiArticleToolbar';
import { WikiArticleActions } from '@/components/wiki/WikiArticleActions';
import { WikiResetConfirmModal } from '@/components/wiki/WikiResetConfirmModal';
import { WikiArticleContent } from '@/components/wiki/WikiArticleContent';
import { addWikiPhotoMarkers, splitWikiNarrator, uniqueWikiPhotos } from '@/lib/wikiArticlePresentation';
import { scpDossierToPlainText } from '@/lib/wikiScp';
import { gildasChronicleToPlainText, parseStoredGildasChronicle } from '@/lib/wikiGildas';
import { hernanArticleToPlainText, parseStoredHernanArticle } from '@/lib/wikiHernan';
import { madameRoseArticleToPlainText, parseStoredMadameRoseArticle } from '@/lib/wikiRose';
import { generateWikiArticle } from '@/lib/wikiOpenRouter';
import {
  fetchScopedWikiArticles,
  findScopedWikiArticle,
  resetScopedWikiArticle,
  saveScopedWikiArticle,
  type ScopedWikiArticle,
} from '@/lib/wikiScopedArticles';
import {
  filterWikiLocations,
  formatWikiScopeLabel,
  getWikiAvailablePeriods,
  resolveWikiScope,
  WIKI_ARTICLE_CHAR_LIMIT,
  type WikiScopeType,
} from '@/lib/wikiScope';
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
type RevealPhase = 'waiting' | 'result' | 'ready';
type GenerationReveal = {
  style: WikiStyleId;
  phase: RevealPhase;
  article: string;
  line: string;
};

const EMPTY_SAVED: WikiCompilerSavedState = { wikipedia: false, scp: false, ancient: false };
const EMPTY_SAVED_COUNTS: WikiCompilerSavedCountState = { wikipedia: 0, scp: 0, ancient: 0 };
const WIKI_GENERATE_COOLDOWN_MS = 5000;

const WAITING_LINES: Record<WikiStyleId, string> = {
  wikipedia: '少し待ちたまえ。君の散らかった足跡を、せめて学術資料として読める形に整えているところだ。',
  scp: 'そのまま待機しろ。君の行動記録を機密資料として成立させるため、現在照合処理を行っている。',
  ancient: 'ちょっと待ちな。常連客の騒動を一面記事にするなら、見出しは慎重に選ばないとね。赤鉛筆を入れてるところさ。',
};

export function WikiWorkspace({
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
  const [articles, setArticles] = useState<ScopedWikiArticle[]>([]);
  const [articleRecord, setArticleRecord] = useState<ScopedWikiArticle | null>(null);
  const [scopeType, setScopeType] = useState<WikiScopeType>('world');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [pendingGeneratedArticle, setPendingGeneratedArticle] = useState<ScopedWikiArticle | null>(null);
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

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [locs, storedArticles] = await Promise.all([
        fetchLocations(world.id),
        fetchScopedWikiArticles(world.id),
      ]);
      setLocations(locs);
      setArticles(storedArticles);
      setArticleRecord(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, [world.id, reloadKey]);

  const availablePeriods = useMemo(() => getWikiAvailablePeriods(locations), [locations]);

  useEffect(() => {
    if (availablePeriods.months.length > 0 && !availablePeriods.months.includes(selectedMonth)) {
      setSelectedMonth(availablePeriods.months[0]);
    }
    if (availablePeriods.years.length > 0 && !availablePeriods.years.includes(selectedYear)) {
      setSelectedYear(availablePeriods.years[0]);
    }
  }, [availablePeriods.months.join('|'), availablePeriods.years.join('|')]);

  const scopeKey = scopeType === 'month'
    ? selectedMonth || availablePeriods.months[0] || ''
    : scopeType === 'year'
      ? selectedYear || availablePeriods.years[0] || ''
      : 'all';

  const scopeResolution = useMemo(
    () => resolveWikiScope(locations, scopeType, scopeKey),
    [locations, scopeType, scopeKey],
  );

  const currentScopeArticle = useMemo(
    () => style ? findScopedWikiArticle(articles, style, scopeType) : null,
    [articles, style, scopeType],
  );

  const saved = useMemo<WikiCompilerSavedState>(() => {
    if (articles.length === 0) return EMPTY_SAVED;
    return {
      wikipedia: Boolean(findScopedWikiArticle(articles, 'wikipedia', scopeType)),
      scp: Boolean(findScopedWikiArticle(articles, 'scp', scopeType)),
      ancient: Boolean(findScopedWikiArticle(articles, 'ancient', scopeType)),
    };
  }, [articles, scopeType]);

  const savedCountByStyle = useMemo<WikiCompilerSavedCountState>(() => {
    if (articles.length === 0) return EMPTY_SAVED_COUNTS;
    return {
      wikipedia: articles.filter((item) => item.style === 'wikipedia').length,
      scp: articles.filter((item) => item.style === 'scp').length,
      ancient: articles.filter((item) => item.style === 'ancient').length,
    };
  }, [articles]);

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
    onArticleStateChange?.(articleRecord !== null);
  }, [articleRecord, onArticleStateChange]);

  useEffect(() => {
    onInternalBackAvailableChange?.(style !== null || articleRecord !== null);
  }, [style, articleRecord, onInternalBackAvailableChange]);

  useEffect(() => {
    if (lastBackRequestRef.current === backRequestKey) return;
    lastBackRequestRef.current = backRequestKey;
    if (articleRecord) {
      playCancelSound();
      setCopied(false);
      setShared(false);
      setArticleRecord(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (style === null) return;

    playCancelSound();
    setCopied(false);
    setShared(false);
    setStyle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [backRequestKey, style, articleRecord]);

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

  const article = articleRecord?.content ?? null;

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

  const articleSourceLocations = useMemo(() => {
    if (!articleRecord) return scopeResolution.locations;
    return filterWikiLocations(locations, articleRecord.scope_type, articleRecord.scope_key);
  }, [articleRecord, locations, scopeResolution.locations]);

  const parsedArticle = useMemo(() => splitWikiNarrator(article ?? ''), [article]);
  const articleLocations = useMemo(() => {
    if (parsedArticle.photoStoragePaths.length === 0) return articleSourceLocations;
    const selectedPaths = new Set(parsedArticle.photoStoragePaths);
    return articleSourceLocations.map((location) => ({
      ...location,
      photos: location.photos.filter((photo) => selectedPaths.has(photo.storage_path)),
    }));
  }, [articleSourceLocations, parsedArticle.photoStoragePaths.join('|')]);
  const articlePhotos = useMemo(() => uniqueWikiPhotos(articleLocations), [articleLocations]);
  const mainPhoto = articlePhotos[0] ?? null;
  const additionalPhotos = articlePhotos.slice(1, 5);
  const isStructuredGildas = style === 'ancient' && Boolean(parseStoredGildasChronicle(parsedArticle.content));
  const isStructuredRose = style === 'ancient' && Boolean(parseStoredMadameRoseArticle(parsedArticle.content));
  const isStructuredHernan = style === 'wikipedia' && Boolean(parseStoredHernanArticle(parsedArticle.content));
  const articleExportText = useMemo(() => {
    if (style === 'scp') return scpDossierToPlainText(parsedArticle.content) ?? parsedArticle.content;
    if (style === 'ancient') {
      return madameRoseArticleToPlainText(parsedArticle.content, parsedArticle.line)
        ?? gildasChronicleToPlainText(parsedArticle.content, parsedArticle.line)
        ?? parsedArticle.content;
    }
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

  const syncScopeKeyToArticle = (item: ScopedWikiArticle | null) => {
    if (!item) return;
    setScopeType(item.scope_type);
    if (item.scope_type === 'month') setSelectedMonth(item.scope_key);
    if (item.scope_type === 'year') setSelectedYear(item.scope_key);
  };

  const replaceStoredArticle = (next: ScopedWikiArticle) => {
    setArticles((current) => [
      next,
      ...current.filter((item) => !(item.style === next.style && item.scope_type === next.scope_type)),
    ]);
  };

  const handleGenerate = async () => {
    const now = Date.now();
    if (
      generating
      || resetting
      || articleRecord !== null
      || !style
      || scopeResolution.locations.length === 0
      || currentScopeArticle
      || now < cooldownUntil
    ) return;

    const selectedStyle = style;
    setGenerating(true);
    setError('');
    setTypedReveal('');
    setWaitingComplete(false);
    setPendingGeneratedArticle(null);
    setGenerationReveal({ style: selectedStyle, phase: 'waiting', article: '', line: '' });
    playWikiGeneratingNoiseSound();

    try {
      const result = await generateWikiArticle(
        { world, locations: scopeResolution.locations, style: selectedStyle },
        {
          scopeType: scopeResolution.type,
          scopeKey: scopeResolution.key,
          scopeLabel: scopeResolution.label,
          mode: scopeResolution.mode,
          maxArticleChars: WIKI_ARTICLE_CHAR_LIMIT,
        },
      );
      const storedArticle = await saveScopedWikiArticle(
        world.id,
        selectedStyle,
        scopeResolution.type,
        scopeResolution.key,
        result.content,
      );
      replaceStoredArticle(storedArticle);
      setPendingGeneratedArticle(storedArticle);
      const parsed = splitWikiNarrator(result.content);
      setGenerationReveal((current) => current ? {
        ...current,
        article: result.content,
        line: parsed.line || NARRATORS[selectedStyle]?.quote || '……記録の編纂が完了した。',
      } : current);
    } catch (e) {
      setGenerationReveal(null);
      setPendingGeneratedArticle(null);
      setError((e as Error).message);
    } finally {
      const until = Date.now() + WIKI_GENERATE_COOLDOWN_MS;
      setCooldownUntil(until);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => setCooldownUntil(0), WIKI_GENERATE_COOLDOWN_MS);
      setGenerating(false);
    }
  };

  const handlePrimaryAction = () => {
    if (currentScopeArticle) {
      playConfirmSound();
      syncScopeKeyToArticle(currentScopeArticle);
      setArticleRecord(currentScopeArticle);
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    void handleGenerate();
  };

  const openGeneratedArticle = () => {
    if (!generationReveal?.article || generationReveal.phase !== 'ready' || !pendingGeneratedArticle) return;
    setArticleRecord(pendingGeneratedArticle);
    syncScopeKeyToArticle(pendingGeneratedArticle);
    setGenerationReveal(null);
    setPendingGeneratedArticle(null);
    playWikiCompleteSound();
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const confirmReset = async () => {
    if (!resetTarget || !style || !articleRecord || resetting) return;
    const target = articleRecord;
    setResetTarget(false);
    setResetting(true);
    setError('');
    playDeleteSound();
    try {
      await resetScopedWikiArticle(world.id, style, target.scope_type);
      setArticles((current) => current.filter((item) => !(item.style === style && item.scope_type === target.scope_type)));
      setArticleRecord(null);
      syncScopeKeyToArticle(target);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setResetting(false);
    }
  };

  const selectStyle = (id: WikiStyleId, preserveScrollPosition = false) => {
    if (id === style && articleRecord === null) return;

    playConfirmSound();
    setCopied(false);
    setShared(false);
    setArticleRecord(null);
    setStyle(id);

    const storedForScope = findScopedWikiArticle(articles, id, scopeType);
    if (storedForScope) syncScopeKeyToArticle(storedForScope);

    if (!preserveScrollPosition) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const selectStyleFromArticle = (id: WikiStyleId) => {
    if (!articleRecord || id === style) return;
    playConfirmSound();
    setCopied(false);
    setShared(false);
    setStyle(id);

    const target = findScopedWikiArticle(articles, id, articleRecord.scope_type);
    if (target) {
      syncScopeKeyToArticle(target);
      setArticleRecord(target);
    } else {
      setScopeType(articleRecord.scope_type);
      if (articleRecord.scope_type === 'month') setSelectedMonth(articleRecord.scope_key);
      if (articleRecord.scope_type === 'year') setSelectedYear(articleRecord.scope_key);
      setArticleRecord(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScopeType = (nextScope: WikiScopeType) => {
    if (nextScope === scopeType) return;
    playConfirmSound();
    setArticleRecord(null);
    setScopeType(nextScope);
    if (!style) return;
    const stored = findScopedWikiArticle(articles, style, nextScope);
    if (stored?.scope_type === 'month') setSelectedMonth(stored.scope_key);
    if (stored?.scope_type === 'year') setSelectedYear(stored.scope_key);
  };

  const handleSelectScopeKey = (key: string) => {
    playConfirmSound();
    if (scopeType === 'month') setSelectedMonth(key);
    if (scopeType === 'year') setSelectedYear(key);
  };

  const handleBackToCompilers = () => {
    playCancelSound();
    setCopied(false);
    setShared(false);
    setArticleRecord(null);
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

  const hasArticle = articleRecord !== null && article !== null;
  const narrator = style ? NARRATORS[style] : null;
  const locationLinks = articleSourceLocations.map((location) => ({
    name: location.name,
    onClick: () => onOpenLocation?.(location.id),
  }));
  const articleScopeLabel = articleRecord
    ? formatWikiScopeLabel(articleRecord.scope_type, articleRecord.scope_key)
    : scopeResolution.label;

  return (
    <div className="w-full min-w-0 max-w-full space-y-3 overflow-x-hidden sm:space-y-4 font-sans">
      {error && <ErrorBanner message={error} />}

      {!hasArticle && (
        <WikiCompilerHome
          style={style}
          saved={saved}
          savedCountByStyle={savedCountByStyle}
          savedArticleCount={articles.length}
          locationCount={scopeResolution.locations.length}
          generating={generating}
          resetting={resetting}
          cooldownUntil={cooldownUntil}
          scopeType={scopeType}
          scopeKey={scopeResolution.key}
          scopeLabel={scopeResolution.label}
          scopeDescription={scopeResolution.description}
          scopeMode={scopeResolution.mode}
          availableMonths={availablePeriods.months}
          availableYears={availablePeriods.years}
          scopeSlotLocked={Boolean(currentScopeArticle)}
          onSelectStyle={(id) => selectStyle(id, true)}
          onSelectScopeType={handleSelectScopeType}
          onSelectScopeKey={handleSelectScopeKey}
          onPrimaryAction={handlePrimaryAction}
        />
      )}

      {hasArticle && style && narrator && articleRecord && (
        <div className={`mx-auto w-full space-y-4 pb-5 sm:space-y-5 ${style === 'scp' || isStructuredGildas || isStructuredRose || isStructuredHernan ? 'max-w-[96rem]' : 'max-w-4xl'}`}>
          <WikiArticleToolbar
            style={style}
            saved={saved}
            scopeType={articleRecord.scope_type}
            scopeLabel={articleScopeLabel}
            onSelectStyle={selectStyleFromArticle}
            onBack={handleBackToCompilers}
          />

          {style !== 'scp' && !isStructuredGildas && !isStructuredRose && !isStructuredHernan && <NarratorDialogue style={style} quote={parsedArticle.line} />}

          <WikiArticleContent
            style={style}
            world={world}
            locations={articleLocations}
            parsedContent={parsedArticle.content}
            articleWithPhotos={articleWithPhotos}
            mainPhotoUrl={mainPhotoUrl}
            narratorLine={parsedArticle.line}
            locationLinks={locationLinks}
            isStructuredGildas={isStructuredGildas}
            isStructuredHernan={isStructuredHernan}
          />

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

      <WikiResetConfirmModal
        open={resetTarget}
        onCancel={() => setResetTarget(false)}
        onConfirm={confirmReset}
      />
    </div>
  );
}