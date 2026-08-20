import { useEffect, useRef, useState } from 'react';
import { Sparkles, RefreshCw, BookOpen } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, saveWikiArticle } from '@/lib/db';
import { WIKI_STYLES, generateWiki } from '@/lib/wiki';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

const WIKI_GENERATE_COOLDOWN_MS = 5000;

export function WikiTab({
  world,
  reloadKey,
}: {
  world: WorldWithMembers;
  reloadKey: number;
}) {
  const [style, setStyle] = useState(WIKI_STYLES[0].id);
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [error, setError] = useState('');
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [locs, art] = await Promise.all([
        fetchLocations(world.id),
        fetchWikiArticle(world.id, style),
      ]);
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
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
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

  const styleConfig = WIKI_STYLES.find((s) => s.id === style);
  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      {/* Style selector */}
      <div className="mb-4">
        <p className="text-sm font-medium text-stone-700 mb-2">スタイル</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {WIKI_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                style === s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-stone-600 border border-stone-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        {styleConfig && (
          <p className="text-xs text-stone-400 mt-1">{styleConfig.description}</p>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner label="Wikiを読み込み中" />
      ) : (
        <WikiContent
          style={style}
          hasArticle={hasArticle}
          article={article}
          generating={generating}
          cooldownActive={cooldownActive}
          onGenerate={handleGenerate}
          locationCount={locations.length}
        />
      )}
    </div>
  );
}

function WikiContent({
  style,
  hasArticle,
  article,
  generating,
  cooldownActive,
  onGenerate,
  locationCount,
}: {
  style: string;
  hasArticle: boolean;
  article: string | null;
  generating: boolean;
  cooldownActive: boolean;
  onGenerate: () => void;
  locationCount: number;
}) {
  const themeClass =
    style === 'scp'
      ? 'bg-stone-900 text-stone-200 border-stone-700'
      : style === 'psycho'
        ? 'bg-purple-950 text-purple-100 border-purple-800'
        : 'bg-white text-stone-800 border-stone-300';

  return (
    <div>
      {/* Generate / Update button */}
      <button
        onClick={onGenerate}
        disabled={generating || cooldownActive || locationCount === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 mb-4"
      >
        {generating ? (
          <>
            <Spinner />
            <span>生成中...</span>
          </>
        ) : hasArticle ? (
          <>
            <RefreshCw className="w-5 h-5" />
            更新
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            記事を生成
          </>
        )}
      </button>

      {locationCount === 0 && !hasArticle && (
        <EmptyState message="ロケーションを記録すると、Wiki記事を生成できます。" />
      )}

      {/* Article display */}
      {hasArticle && article && (
        <div className={`rounded-2xl border p-5 ${themeClass}`}>
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-current/20">
            <BookOpen className="w-5 h-5 opacity-70" />
            <span className="text-sm font-medium opacity-70">
              {style === 'scp' ? 'SCP財団 内部記録' : style === 'psycho' ? '研究記録' : '百科事典'}
            </span>
          </div>
          <div className="prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{article}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
