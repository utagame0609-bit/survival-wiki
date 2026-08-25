import { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen, RotateCcw, AlertTriangle, X, Trash2, Shield, Scroll, FileCode2 } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NarratorBox } from '@/components/NarratorBox';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { supabase } from '@/lib/supabase';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import { playAddSound, playConfirmSound, playSaveSound, playCancelSound, playDeleteSound, playErrorSound } from '@/lib/sound';

const WIKI_GENERATE_COOLDOWN_MS = 5000;
type WikiStyleId = string;

async function addWikiPhotoMarkers(content: string, photos: { storage_path: string }[]) {
  if (!content || photos.length === 0) return content;
  const blocks = content.replace(/\r\n/g, '\n').split(/\n\s*\n/);
  const maxInsertions = Math.min(photos.length, Math.max(0, blocks.length - 1));
  if (maxInsertions === 0) return content;
  const positions: number[] = [];
  if (maxInsertions === blocks.length - 1) {
    for (let index = 1; index < blocks.length; index += 1) positions.push(index);
  } else {
    const available = blocks.length - 1;
    let previous = 0;
    for (let index = 0; index < maxInsertions; index += 1) {
      let position = Math.floor(((index + 1) * available) / (maxInsertions + 1));
      position = Math.max(1, position);
      if (position <= previous) position = previous + 1;
      position = Math.min(available, position);
      positions.push(position);
      previous = position;
    }
  }
  const urls = await Promise.all(photos.slice(0, maxInsertions).map((photo) => getPhotoUrl(photo.storage_path)));
  const insertions = positions.map((position, index) => ({ position, url: urls[index] }));
  for (let index = insertions.length - 1; index >= 0; index -= 1) {
    const { position, url } = insertions[index];
    blocks.splice(position, 0, `<!--WIKI_PHOTO:${url}-->`);
  }
  return blocks.join('\n\n');
}

export function WikiTab({ world, reloadKey, onOpenLocation, onArticleStateChange }: { key?: string | number; world: WorldWithMembers; reloadKey: number; onOpenLocation?: (locationId: string) => void; onArticleStateChange?: (isArticle: boolean) => void }) {
  const [style, setStyle] = useState<WikiStyleId | null>(null);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetTarget, setResetTarget] = useState(false);
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

  const handleStyleSelect = (nextStyle: WikiStyleId) => {
    if (generating || resetting || nextStyle === style) return;
    setLoading(true);
    setArticle(null);
    setStyle(nextStyle);
  };

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || article !== null || now < cooldownUntil || locations.length === 0 || style === null) return;
    playAddSound();
    setGenerating(true); setError('');
    try {
      const result = await openRouterTestProvider.generate({ world, locations, style });
      await saveWikiArticle(world.id, style, result.content); setArticle(result.content); playSaveSound();
    } catch (e) { setError((e as Error).message); }
    finally {
      const nextCooldownUntil = Date.now() + WIKI_GENERATE_COOLDOWN_MS;
      setCooldownUntil(nextCooldownUntil);
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => setCooldownUntil(0), WIKI_GENERATE_COOLDOWN_MS);
      setGenerating(false);
    }
  };

  const handleReset = () => {
    if (!style || !article || resetting) return;
    playErrorSound();
    setResetTarget(true);
  };

  const confirmReset = async () => {
    if (!resetTarget || !style || !article || resetting) return;
    const resetStyle = style;
    setResetTarget(false);
    playDeleteSound();
    setResetting(true); setError('');
    try { await resetWikiArticle(world.id, resetStyle); setArticle(null); setStyle(null); }
    catch (e) { setError((e as Error).message); }
    finally { setResetting(false); }
  };

  const handleAiTest = async () => {
    setError('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('wiki-ai-test', { body: { message: 'wiki-ai-connectivity-test' } });
      if (invokeError) throw invokeError;
      if (!data?.ok) throw new Error('AIテストFunctionから正常な応答がありません。');
      window.alert(`AI接続テスト成功: ${data.message}`);
    } catch (e) { setError(`AI接続テスト失敗: ${(e as Error).message}`); }
  };

  const styleConfig = style ? WIKI_STYLES.find((s) => s.id === style) : null;
  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();
  const isGeneratedWikipedia = hasArticle && style === 'wikipedia';

  useEffect(() => {
    onArticleStateChange?.(hasArticle);
  }, [hasArticle, onArticleStateChange]);

  return (
    <div className={isGeneratedWikipedia ? 'w-full font-dot' : 'w-full px-4 sm:px-6 py-6 max-w-4xl mx-auto font-dot'}>
      {/* Style Command Selection Bar (RPG Chronicle Format Select) */}
      {!isGeneratedWikipedia && (
        <div className="mb-6 p-4 sm:p-5 rounded-sm bg-[#0d1627] border-2 border-[#1a2333] shadow-lg">
          <div className="flex items-center justify-between gap-2 mb-3.5 pb-2 border-b border-[#1a2333]">
            <div className="flex items-center gap-2">
              <span className="text-[#ffb000] font-mono text-xs">▶</span>
              <p className="text-xs sm:text-sm font-bold text-[#ffb000] tracking-wide font-mono uppercase">
                CHRONICLE FORMAT // 旅の書・編纂流派選択
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              SELECT STYLE TO OPEN ADVENTURE LOG
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {WIKI_STYLES.map((s, index) => {
              const isSelected = style === s.id;
              const formatNum = `0${index + 1}`;
              return (
                <button
                  key={s.id}
                  onClick={() => { playConfirmSound(); handleStyleSelect(s.id); }}
                  disabled={generating || resetting}
                  className={`command-btn p-3.5 rounded-sm text-xs font-bold text-left transition-all border-2 flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#1a2333] border-[#ffb000] text-[#ffb000] shadow-[0_0_15px_rgba(255,176,0,0.25)]'
                      : 'bg-[#050a14] border-[#1a2333] text-zinc-400 hover:text-zinc-200 hover:border-[#334155] hover:bg-[#111c30]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#050a14] border border-[#334155] text-[#32cd32]">
                      STYLE {formatNum}
                    </span>
                    {isSelected && (
                      <span className="text-[#ffb000] text-[10px] font-mono font-bold flex items-center gap-0.5">
                        <span>▶</span> SELECTED
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm truncate text-[#e2e8f0]">
                    {s.name}
                  </span>
                  <span className="text-[10px] text-zinc-400 line-clamp-2 font-normal font-mono leading-relaxed">
                    {s.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner label="旅の書（Wiki）を読み込み中" />
      ) : (
        <WikiContent
          world={world}
          style={style}
          hasArticle={hasArticle}
          article={article}
          generating={generating}
          resetting={resetting}
          cooldownActive={cooldownActive}
          onGenerate={handleGenerate}
          onReset={handleReset}
          onAiTest={handleAiTest}
          locationCount={locations.length}
          locations={locations}
          isGeneratedWikipedia={isGeneratedWikipedia}
          onOpenLocation={onOpenLocation}
        />
      )}

      {/* Reset Confirmation Modal */}
      {resetTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm font-dot"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              playCancelSound();
              setResetTarget(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-wiki-title"
            className="w-full max-w-md overflow-hidden rounded-sm bg-[#0d1627] border-4 border-double border-red-700 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_25px_rgba(239,68,68,0.25)]"
          >
            <div className="px-6 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-sm bg-red-950/80 border-2 border-red-700 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 id="reset-wiki-title" className="text-base font-bold text-red-200">
                旅の書（Wiki記事）をリセットしますか？
              </h2>
              <p className="mt-2 text-sm text-[#ffb000] font-bold break-words">
                「{world.name}」
              </p>
              <p className="mt-3 text-xs leading-5 text-zinc-400 font-mono">
                この操作は元に戻せません。<br />
                生成された旅の書と現在の流派選択が初期化されます。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => {
                  playCancelSound();
                  setResetTarget(false);
                }}
                className="command-btn flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#1a2333] border border-[#334155] text-zinc-300 hover:text-white text-xs font-bold"
              >
                <X className="w-4 h-4" />
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="command-btn flex items-center justify-center gap-2 py-2.5 rounded-sm bg-red-900 border-2 border-red-600 text-red-100 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              >
                <Trash2 className="w-4 h-4" />
                リセットする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WikiContent({
  world,
  style,
  hasArticle,
  article,
  generating,
  resetting,
  cooldownActive,
  onGenerate,
  onReset,
  onAiTest,
  locationCount,
  locations,
  isGeneratedWikipedia,
  onOpenLocation
}: {
  world: WorldWithMembers;
  style: string | null;
  hasArticle: boolean;
  article: string | null;
  generating: boolean;
  resetting: boolean;
  cooldownActive: boolean;
  onGenerate: () => void;
  onReset: () => void;
  onAiTest: () => void;
  locationCount: number;
  locations: LocationWithPhotos[];
  isGeneratedWikipedia: boolean;
  onOpenLocation?: (locationId: string) => void;
}) {
  const isWikipedia = style === 'wikipedia';
  const isScp = style === 'scp';
  const isAncient = style === 'ancient';

  const allPhotos = locations
    .flatMap((location) => location.photos)
    .filter((photo, index, photos) => photos.findIndex((item) => item.storage_path === photo.storage_path) === index)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .slice(0, 5);

  const mainPhoto = allPhotos[0] ?? null;
  const additionalPhotos = allPhotos.slice(1, 5);
  const [articleWithPhotoMarkers, setArticleWithPhotoMarkers] = useState(article ?? '');
  const [mainPhotoUrl, setMainPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadPhotos = async () => {
      try {
        const markerContent = await addWikiPhotoMarkers(article ?? '', additionalPhotos);
        const mainUrl = mainPhoto ? await getPhotoUrl(mainPhoto.storage_path) : null;
        if (!cancelled) {
          setArticleWithPhotoMarkers(markerContent);
          setMainPhotoUrl(mainUrl);
        }
      } catch (e) {
        if (!cancelled) setArticleWithPhotoMarkers(article ?? '');
      }
    };
    loadPhotos();
    return () => {
      cancelled = true;
    };
  }, [article, mainPhoto?.storage_path, additionalPhotos.map((photo) => photo.storage_path).join('|')]);

  const locationLinks = locations.map((location) => ({
    name: location.name,
    onClick: () => onOpenLocation?.(location.id)
  }));

  const styleLabel = isWikipedia
    ? '百科事典編纂流派（ウタペディア）'
    : isScp
    ? '特異点機密報告流派（SCP FOUNDATION）'
    : isAncient
    ? '封印絶望古文書流派（LOST CHRONICLE）'
    : '未選択';

  const actionButtons = (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onGenerate}
        disabled={hasArticle || generating || resetting || cooldownActive || locationCount === 0 || style === null}
        className="command-btn flex-1 flex items-center justify-center gap-2 py-3.5 rounded-sm bg-[#ffb000] hover:bg-[#ffc033] border-2 border-[#ffb000] text-[#0a1120] font-black text-xs sm:text-sm shadow-[0_0_25px_rgba(255,176,0,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {generating ? (
          <>
            <Spinner />
            <span>冒険の書を編纂中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-[#0a1120]" />
            <span>【旅の書を開く・編纂を開始】 (OPEN CHRONICLE)</span>
          </>
        )}
      </button>
      {hasArticle && (
        <button
          onClick={onReset}
          disabled={!hasArticle || !style || generating || resetting}
          className="command-btn shrink-0 flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-sm border-2 border-[#334155] bg-[#1a2333] text-zinc-300 font-bold text-xs hover:border-[#ffb000] hover:text-[#ffb000] disabled:opacity-40"
        >
          <RotateCcw className="w-4 h-4" />
          <span>書をリセット</span>
        </button>
      )}
      {style === null && (
        <button
          onClick={onAiTest}
          className="command-btn shrink-0 px-3 py-3.5 rounded-sm border-2 border-[#1a2333] bg-[#1a2333] text-[#32cd32] text-xs font-bold font-mono"
        >
          AI接続テスト
        </button>
      )}
    </div>
  );

  if (style === null) {
    return (
      <div className="space-y-4">
        <div className="p-6 sm:p-8 rounded-sm bg-[#0d1627] border-4 border-double border-[#1a2333] text-center space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-[#ffb000]/60 animate-pulse" />
          <h3 className="text-base font-bold text-[#ffb000]">
            旅の書・編纂の書式を選択してください
          </h3>
          <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto leading-relaxed">
            上記3つの流派（百科事典・機密報告・絶望古文書）から好みの形式を選択すると、記録された拠点を元に【冒険の書】を開くことができます。
          </p>
        </div>
        {actionButtons}
      </div>
    );
  }

  // Generated Wikipedia Full View (Utapedia)
  if (isGeneratedWikipedia) {
    return (
      <div className="min-h-screen bg-[#0a1120] text-[#e2e8f0] pb-16 font-dot">
        {/* Utapedia Top Header */}
        <header className="w-full bg-[#0d1627] border-b-4 border-double border-[#ffb000] px-4 py-3 sm:px-8 shadow-lg">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={UTAPEDIA_AVATAR}
                alt="ウタペディア"
                className="h-12 w-12 rounded-sm object-cover border-2 border-[#ffb000] shadow-md"
              />
              <div>
                <div className="text-xl sm:text-2xl font-bold text-[#ffb000] tracking-wide flex items-center gap-2">
                  <span>ウタペディア大百科事典</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#ffb000]/15 border border-[#ffb000] text-[#ffb000]">
                    OFFICIAL ARCHIVE
                  </span>
                </div>
                <div className="text-xs text-[#32cd32] font-mono">
                  WORLD CHRONICLE SYSTEM // 冒険の書・公的調査録
                </div>
              </div>
            </div>
            <button
              onClick={onReset}
              className="command-btn px-3.5 py-2 rounded-sm border-2 border-[#334155] bg-[#1a2333] text-zinc-300 text-xs font-bold hover:text-[#ffb000] hover:border-[#ffb000]"
            >
              書をリセット
            </button>
          </div>
        </header>

        {/* Content Body */}
        <article className="w-full px-4 py-6 sm:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-6">
              {/* Article Main - Heavy Retro Document Window */}
              <div className="min-w-0 p-6 sm:p-8 rounded-sm bg-[#0d1627] border-4 border-double border-[#1a2333] shadow-[0_0_30px_rgba(0,0,0,0.6)]">
                <NarratorBox style="wikipedia" />
                <MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} />
              </div>

              {/* Sidebar Info Table */}
              <aside className="border-2 border-[#1a2333] bg-[#0d1627] p-4 rounded-sm h-fit text-xs font-mono space-y-4 shadow-md">
                {mainPhotoUrl && (
                  <div className="rounded-sm overflow-hidden border-2 border-[#334155]">
                    <img src={mainPhotoUrl} alt="代表写真" className="w-full aspect-[4/3] object-cover" />
                  </div>
                )}
                <div className="border-b-2 border-[#ffb000] pb-2 font-bold text-sm text-[#ffb000] font-dot flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#ffb000]" />
                  <span>◆ 基本世界観情報</span>
                </div>
                <div className="divide-y divide-[#1a2333]">
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-400 font-bold">世界名称</span>
                    <span className="text-[#e2e8f0] font-bold">{world.name}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-400 font-bold">探検者</span>
                    <span className="text-[#ffb000] font-bold">{world.player ?? '不明'}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-400 font-bold">記録地点数</span>
                    <span className="text-[#32cd32] font-bold">{locationCount} 拠点</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-400 font-bold">パーティー</span>
                    <span className="text-zinc-200">{world.members.length} 名</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-zinc-400 font-bold">記録開始</span>
                    <span className="text-zinc-300">
                      {new Date(world.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>

                {locations.length > 0 && (
                  <div className="mt-4 border-t-2 border-[#1a2333] pt-3">
                    <div className="font-bold text-xs text-[#ffb000] font-dot mb-2">
                      ◆ 関連ロケーション一覧
                    </div>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <button
                          type="button"
                          key={location.id}
                          onClick={() => onOpenLocation?.(location.id)}
                          className="w-full text-left p-2.5 rounded-sm bg-[#050a14] border border-[#1a2333] hover:border-[#ffb000] hover:bg-[#111c30] transition-colors"
                        >
                          <div className="font-bold text-[#ffb000] truncate">{location.name}</div>
                          <div className="text-[10px] text-[#32cd32] font-mono mt-0.5">
                            POS: X:{location.x} Y:{location.y} Z:{location.z}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </article>
      </div>
    );
  }

  // Heavy Retro Message Window View for All Styles (Book of Adventure Presentation)
  return (
    <div className="space-y-4">
      <div className="rounded-sm border-4 border-double border-[#ffb000] bg-[#0d1627] shadow-[0_0_35px_rgba(255,176,0,0.15),inset_0_0_20px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
        {/* Ornate Retro Header / Book Ribbon */}
        <div className="px-4 sm:px-6 py-4 bg-[#080e1a] border-b-2 border-[#1a2333] flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#050a14] border-2 border-[#ffb000] text-[#ffb000] flex items-center justify-center shadow-md shrink-0">
              <BookOpen className="w-5 h-5 text-[#ffb000]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-[#ffb000]/15 border border-[#ffb000] text-[#ffb000] font-bold">
                  CHRONICLE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#ffb000] tracking-wide">
                  【 冒険の書：{world.name} 】
                </h2>
              </div>
              <p className="text-xs text-[#32cd32] font-mono mt-0.5">
                流派: {styleLabel} // 拠点観測数: {locationCount} 箇所
              </p>
            </div>
          </div>

          {hasArticle && (
            <div className="text-xs text-zinc-500 font-mono">
              READING MODE ACTIVE
            </div>
          )}
        </div>

        {/* Chronicle Document Body */}
        <div className="p-5 sm:p-8 bg-[#060c18] text-[#e2e8f0]">
          {locationCount === 0 && !hasArticle && (
            <EmptyState message="ロケーションを記録すると、旅の書（Wiki記事）を編纂できます。" />
          )}

          {/* 16-bit Pixel Art Chronicler Narrator Box */}
          {style && <NarratorBox style={style} />}

          {hasArticle && article && (
            <article className="mt-4 p-4 sm:p-6 rounded-sm bg-[#091122] border-2 border-[#1a2333] shadow-inner">
              <MarkdownRenderer
                content={article}
                locationLinks={locationLinks}
                className={isAncient ? 'font-serif text-amber-100' : isScp ? 'font-mono text-zinc-200' : 'font-dot'}
              />
            </article>
          )}

          {!hasArticle && locationCount > 0 && (
            <div className="py-6 text-center space-y-2.5">
              <Sparkles className="w-7 h-7 mx-auto text-[#ffb000] animate-pulse" />
              <h4 className="text-sm font-bold text-[#ffb000]">
                冒険の記憶が揃いました
              </h4>
              <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto leading-relaxed">
                記録された {locationCount} 箇所の拠点を元に、選ばれた流派（{styleLabel}）で【冒険の書】を開くことができます。
              </p>
            </div>
          )}
        </div>

        {/* Bottom Chronicle Action Bar */}
        <div className="p-4 bg-[#080e1a] border-t-2 border-[#1a2333]">
          {actionButtons}
        </div>
      </div>
    </div>
  );
}
