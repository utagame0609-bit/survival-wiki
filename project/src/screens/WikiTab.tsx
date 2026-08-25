import { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, RotateCcw, AlertTriangle, X, Trash2, Glasses, Shield, ScrollText } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
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

const STYLE_PREVIEWS: Record<string, { eyebrow: string; title: string; icon: typeof Glasses; sample: string; badges: string[]; tone: string }> = {
  wikipedia: {
    eyebrow: 'STYLE 01 // ウタペディア',
    title: '百科事典・民俗学者',
    icon: Glasses,
    sample: '「ふむ……この記録によれば、ここで無残にも骨を埋めた冒険者は星の数ほどいるようだ。」',
    badges: ['事実＋毒舌な脚色', '情報密度：高'],
    tone: '客観的に見せかけて、知的に刺す。',
  },
  scp: {
    eyebrow: 'STYLE 02 // SCP FOUNDATION',
    title: '機密報告・上級研究員',
    icon: Shield,
    sample: '「対象地点における異常行動の詳細は不明。記録者本人の生存能力にも疑義がある。」',
    badges: ['機密文書風', '冷徹・不穏'],
    tone: '世界の異常を、淡々と記録する。',
  },
  ancient: {
    eyebrow: 'STYLE 03 // LOST CHRONICLE',
    title: '絶望古文書・吟遊詩人',
    icon: ScrollText,
    sample: '「かつて愚かな旅人がこの地を訪れた。彼らが何を求めたのか、知る者はもういない。」',
    badges: ['悲壮感', '伝承・叙事詩風'],
    tone: '記録を、滅びゆく物語へ変える。',
  },
};

export function WikiTab({ world, reloadKey, onOpenLocation, onArticleStateChange }: { world: WorldWithMembers; reloadKey: number; onOpenLocation?: (locationId: string) => void; onArticleStateChange?: (isArticle: boolean) => void }) {
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
    <div className={isGeneratedWikipedia ? 'w-full' : 'w-full px-4 sm:px-6 py-6 max-w-4xl mx-auto'}>
      {!isGeneratedWikipedia && (
        <div className="mb-6 rounded-sm border-2 border-[#1a2333] bg-[#0d1627] p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#1a2333]">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[#ffb000] font-mono text-xs">▶</span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#ffb000] tracking-wide font-mono uppercase">CHRONICLE FORMAT // 旅の書・編纂流派</p>
                <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 truncate">記録を、どんな世界の物語として残す？</p>
              </div>
            </div>
            <span className="hidden sm:inline text-[10px] text-zinc-600 font-mono">SELECT YOUR CHRONICLE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {WIKI_STYLES.map((s) => {
              const preview = STYLE_PREVIEWS[s.id];
              const Icon = preview?.icon ?? BookOpen;
              const selected = style === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { playConfirmSound(); handleStyleSelect(s.id); }}
                  disabled={generating || resetting}
                  className={`selectable-pulse ${selected ? 'selectable-pulse-active' : ''} group relative overflow-hidden rounded-sm border-2 p-3.5 text-left transition-all duration-200 ${selected ? 'border-[#ffb000] bg-[#1a2333] shadow-[0_0_18px_rgba(255,176,0,0.22)]' : 'border-[#1a2333] bg-[#050a14] hover:border-[#334155] hover:bg-[#111c30]'}`}
                >
                  <div className="absolute right-[-12px] top-[-18px] text-[#ffb000]/[0.035] transition-transform duration-300 group-hover:scale-110">
                    <Icon size={100} strokeWidth={1} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm border border-[#334155] bg-[#0a1120] text-[#32cd32]">{preview?.eyebrow ?? s.name}</span>
                      {selected && <span className="text-[9px] font-mono font-bold text-[#ffb000]">▶ SELECTED</span>}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-[#ffb000] bg-[#ffb000]/10 text-[#ffb000]' : 'border-[#334155] bg-[#0d1627] text-zinc-500'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-sm font-bold truncate ${selected ? 'text-[#ffb000]' : 'text-zinc-200'}`}>{preview?.title ?? s.name}</h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{preview?.tone ?? s.description}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-sm border border-[#1a2333] bg-[#0a1120] p-2.5">
                      <p className="text-[10px] sm:text-[11px] leading-relaxed text-zinc-300 font-serif">{preview?.sample ?? s.description}</p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(preview?.badges ?? [s.description]).map((badge) => <span key={badge} className="rounded-sm border border-[#334155] bg-[#111c30] px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">{badge}</span>)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="旅の書（Wiki）を読み込み中" /> : <WikiContent world={world} style={style} hasArticle={hasArticle} article={article} generating={generating} resetting={resetting} cooldownActive={cooldownActive} onGenerate={handleGenerate} onReset={handleReset} onAiTest={handleAiTest} locationCount={locations.length} locations={locations} isGeneratedWikipedia={isGeneratedWikipedia} onOpenLocation={onOpenLocation} />}

      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setResetTarget(false); } }}>
          <div role="dialog" aria-modal="true" aria-labelledby="reset-wiki-title" className="w-full max-w-md overflow-hidden rounded-sm bg-[#0d1627] border-4 border-double border-red-700 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_25px_rgba(239,68,68,0.25)]">
            <div className="px-6 pt-6 pb-5 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-sm bg-red-950/80 border-2 border-red-700 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-400" /></div>
              <h2 id="reset-wiki-title" className="text-base font-bold text-red-200">旅の書（Wiki記事）をリセットしますか？</h2>
              <p className="mt-2 text-sm text-[#ffb000] font-bold break-words">「{world.name}」</p>
              <p className="mt-3 text-xs leading-5 text-zinc-400 font-mono">この操作は元に戻せません。<br />生成された旅の書と現在の流派選択が初期化されます。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 px-6 pb-6">
              <button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#1a2333] border border-[#334155] text-zinc-300 hover:text-white text-xs font-bold"><X className="w-4 h-4" />キャンセル</button>
              <button type="button" onClick={confirmReset} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-red-900 border-2 border-red-600 text-red-100 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"><Trash2 className="w-4 h-4" />リセットする</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WikiContent({ world, style, hasArticle, article, generating, resetting, cooldownActive, onGenerate, onReset, onAiTest, locationCount, locations, isGeneratedWikipedia, onOpenLocation }: { world: WorldWithMembers; style: string | null; hasArticle: boolean; article: string | null; generating: boolean; resetting: boolean; cooldownActive: boolean; onGenerate: () => void; onReset: () => void; onAiTest: () => void; locationCount: number; locations: LocationWithPhotos[]; isGeneratedWikipedia: boolean; onOpenLocation?: (locationId: string) => void }) {
  const isWikipedia = style === 'wikipedia'; const isScp = style === 'scp'; const isAncient = style === 'ancient';
  const pageClass = isWikipedia ? 'bg-white text-stone-800 border-stone-300' : isScp ? 'bg-stone-100 text-stone-900 border-stone-700' : isAncient ? 'bg-[#f4ecd8] text-[#3f3022] border-[#b8a17d]' : '';
  const headerClass = isWikipedia ? 'bg-stone-50 border-stone-200 text-stone-700' : isScp ? 'bg-stone-200 border-stone-500 text-stone-900' : isAncient ? 'bg-[#e9ddc2] border-[#b8a17d] text-[#4a3826]' : '';
  const articleClass = isWikipedia ? 'bg-white border-stone-200 text-stone-800' : isScp ? 'bg-[#eeeeee] border-stone-500 text-stone-900' : isAncient ? 'bg-[#f4ecd8] border-[#a98e68] text-[#3f3022]' : 'bg-white border-stone-200 text-stone-800';
  const allPhotos = locations.flatMap((location) => location.photos).filter((photo, index, photos) => photos.findIndex((item) => item.storage_path === photo.storage_path) === index).sort((a, b) => a.created_at.localeCompare(b.created_at)).slice(0, 5);
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
        if (!cancelled) { setArticleWithPhotoMarkers(markerContent); setMainPhotoUrl(mainUrl); }
      } catch { if (!cancelled) setArticleWithPhotoMarkers(article ?? ''); }
    };
    loadPhotos();
    return () => { cancelled = true; };
  }, [article, mainPhoto?.storage_path, additionalPhotos.map((photo) => photo.storage_path).join('|')]);

  const locationLinks = locations.map((location) => ({ name: location.name, onClick: () => onOpenLocation?.(location.id) }));

  const actionButtons = <div className="flex gap-2 px-4 pt-4 sm:px-6"><button onClick={onGenerate} disabled={hasArticle || generating || resetting || cooldownActive || locationCount === 0 || style === null} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-sm bg-[#ffb000] border-2 border-[#ffb000] text-[#0a1120] font-black shadow-[0_0_18px_rgba(255,176,0,0.18)] hover:bg-[#ffc033] active:scale-[0.98] transition-all disabled:opacity-40">{generating ? <><Spinner /><span>編纂中...</span></> : <><Sparkles className="w-5 h-5" />旅の書を生成</>}</button><button onClick={onReset} disabled={!hasArticle || !style || generating || resetting} className="shrink-0 flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-[#334155] bg-[#1a2333] text-zinc-300 font-bold hover:border-[#ffb000] hover:text-[#ffb000] active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>{style === null && <button onClick={onAiTest} className="shrink-0 px-3 py-3 rounded-sm border-2 border-[#1a2333] bg-[#1a2333] text-[#32cd32] text-sm font-bold">AI接続テスト</button>}</div>;

  if (style === null) return <div className="rounded-sm border-2 border-double border-[#1a2333] bg-[#0d1627] p-6 sm:p-8 text-center"><BookOpen className="w-10 h-10 mx-auto text-[#ffb000]/60 mb-3" /><EmptyState message="上の3つから、旅の書のスタイルを選択してください。" /></div>;

  if (isGeneratedWikipedia) return <div className="min-h-screen bg-white text-[#202122]"><header className="w-full bg-white px-4 py-3 sm:px-8"><div className="mx-auto flex w-full max-w-7xl items-center gap-4"><img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="h-14 w-14 rounded-full object-cover border border-[#a2a9b1]" /><div><div className="font-serif text-[30px] leading-none font-normal tracking-tight">ウタペディア</div><div className="font-serif text-[13px] leading-tight text-[#54595d] mt-1">Survival Wiki</div></div></div></header><article className="w-full bg-white px-4 py-4 sm:px-8"><div className="mx-auto w-full max-w-7xl"><div className="mt-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8"><div className="min-w-0 h-[calc(100vh-150px)]"><MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} /></div><aside className="border border-[#a2a9b1] bg-[#f8f9fa] p-3 h-fit text-sm">{mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="w-full aspect-[4/3] object-cover border border-[#c8ccd1] mb-3" />}<div className="border-b border-[#c8ccd1] pb-2 font-semibold text-base">基本情報</div><div className="mt-3 divide-y divide-[#c8ccd1]"><div className="py-2"><span className="font-semibold">名称</span><div className="mt-1">{world.name}</div></div><div className="py-2"><span className="font-semibold">プレイヤー</span><div className="mt-1">{world.player ?? '不明'}</div></div><div className="py-2"><span className="font-semibold">記録地点</span><div className="mt-1">{locationCount}</div></div><div className="py-2"><span className="font-semibold">参加メンバー</span><div className="mt-1">{world.members.length}</div></div><div className="py-2"><span className="font-semibold">記録開始</span><div className="mt-1">{new Date(world.created_at).toLocaleDateString('ja-JP')}</div></div></div>{locations.length > 0 && <div className="mt-4 border-t border-[#c8ccd1] pt-3"><div className="font-semibold text-base mb-2">関連ロケーション</div><div className="space-y-1.5">{locations.map((location) => <button type="button" key={location.id} onClick={() => onOpenLocation?.(location.id)} className="w-full text-left py-1.5 border-b border-[#eaecf0] last:border-b-0 hover:bg-[#eaecf0] rounded-sm px-1 transition-colors"><div className="font-medium text-[#36c]">{location.name}</div><div className="text-xs text-[#54595d] font-mono">X {location.x} / Y {location.y} / Z {location.z}</div></button>)}</div></div>}</aside></div></div></article>{actionButtons}</div>;

  return <div className={`border-2 border-[#1a2333] shadow-lg overflow-hidden transition-colors duration-300 ${pageClass}`}><div className={`px-5 py-4 border-b-2 ${headerClass}`}><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 opacity-70" /><div><p className="text-sm font-bold">{isWikipedia ? 'WIKIPEDIA' : isScp ? 'SCP FOUNDATION' : 'LOST CHRONICLE'}</p><p className="text-xs opacity-60">{isWikipedia ? '百科事典風' : isScp ? '機密記録風' : '絶望的な古文書風'}</p></div></div></div><div className={`px-5 py-6 sm:px-8 sm:py-8 ${articleClass}`}><div className={`border-l-4 pl-5 sm:pl-6 ${isWikipedia ? 'border-stone-300' : isScp ? 'border-stone-700' : 'border-[#8f7654]'}`}>{locationCount === 0 && !hasArticle && <EmptyState message="ロケーションを記録すると、旅の書を生成できます。" />}{hasArticle && article && <article className={`border p-5 sm:p-7 shadow-sm ${articleClass}`}><MarkdownRenderer content={article} locationLinks={locationLinks} className={isAncient ? 'font-serif' : 'font-sans'} /></article>}{!hasArticle && locationCount > 0 && isWikipedia && <WikipediaPreviewSkeleton worldName={world.name} />}</div></div>{actionButtons}</div>;
}

function WikipediaPreviewSkeleton({ worldName }: { worldName: string }) {
  return <section className="mt-6 border border-stone-300 bg-white text-stone-800 px-5 py-6 sm:px-8 sm:py-8"><div className="border-b border-stone-400 pb-2"><h1 className="text-2xl sm:text-3xl font-normal">{worldName}</h1></div><div className="mt-6 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-8"><div className="min-w-0 space-y-4"><div className="h-5 bg-stone-100 rounded w-3/4" /><div className="h-5 bg-stone-100 rounded w-full" /><div className="h-5 bg-stone-100 rounded w-5/6" /><div className="h-24 bg-stone-50 rounded border border-stone-200" /></div><aside className="border border-stone-300 bg-stone-50 p-3"><div className="h-40 bg-stone-100 rounded" /><div className="mt-3 h-4 bg-stone-100 rounded w-1/2" /><div className="mt-3 h-4 bg-stone-100 rounded w-2/3" /></aside></div></section>;
}
