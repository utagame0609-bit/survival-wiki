import { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, RotateCcw, AlertTriangle, X, Trash2 } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { StyleSelector } from '@/components/wiki/StyleSelector';
import { NarratorDialogue, NARRATORS } from '@/components/wiki/WikiNarrator';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { supabase } from '@/lib/supabase';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import { playAddSound, playConfirmSound, playSaveSound, playCancelSound, playDeleteSound, playErrorSound, playHoverSound } from '@/lib/sound';
import { playNpcBgm, stopNpcBgm } from '@/lib/bgm';

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

  useEffect(() => {
    const npcBgmByStyle: Record<string, 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient'> = {
      wikipedia: 'npc_bgm_wikipedia',
      scp: 'npc_bgm_scp',
      ancient: 'npc_bgm_ancient',
    };
    if (style === null) {
      stopNpcBgm();
      return;
    }
    const bgmId = npcBgmByStyle[style];
    if (!bgmId) {
      stopNpcBgm();
      return;
    }
    playNpcBgm(bgmId);
    return () => { stopNpcBgm(); };
  }, [style]);

  const handleStyleSelect = (nextStyle: WikiStyleId) => {
    if (generating || resetting || nextStyle === style) return;
    setLoading(true); setArticle(null); setStyle(nextStyle);
  };

  const handleGenerate = async () => {
    const now = Date.now();
    if (generating || article !== null || now < cooldownUntil || locations.length === 0 || style === null) return;
    playAddSound(); setGenerating(true); setError('');
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

  const handleReset = () => { if (!style || !article || resetting) return; playErrorSound(); setResetTarget(true); };
  const confirmReset = async () => {
    if (!resetTarget || !style || !article || resetting) return;
    const resetStyle = style; setResetTarget(false); playDeleteSound(); setResetting(true); setError('');
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

  const hasArticle = article !== null;
  const cooldownActive = cooldownUntil > Date.now();
  const isGeneratedWikipedia = hasArticle && style === 'wikipedia';
  useEffect(() => { onArticleStateChange?.(hasArticle); }, [hasArticle, onArticleStateChange]);

  return (
    <div className={isGeneratedWikipedia ? 'w-full' : 'w-full space-y-4 sm:space-y-6 font-sans'}>
      {!isGeneratedWikipedia && <StyleSelector style={style} generating={generating} resetting={resetting} onSelect={(id) => { playConfirmSound(); handleStyleSelect(id); }} />}
      {error && <ErrorBanner message={error} />}
      {loading ? <Spinner label="旅の書（Wiki）を読み込み中" /> : <WikiContent world={world} style={style} hasArticle={hasArticle} article={article} generating={generating} resetting={resetting} cooldownActive={cooldownActive} onGenerate={handleGenerate} onReset={handleReset} onAiTest={handleAiTest} locationCount={locations.length} locations={locations} isGeneratedWikipedia={isGeneratedWikipedia} onOpenLocation={onOpenLocation} />}
      {resetTarget && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { playCancelSound(); setResetTarget(false); } }}>
        <div role="dialog" aria-modal="true" aria-labelledby="reset-wiki-title" className="w-full max-w-md overflow-hidden rounded-sm bg-[#0d1627] border-4 border-double border-red-700 shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_25px_rgba(239,68,68,0.25)]">
          <div className="px-6 pt-6 pb-5 text-center"><div className="mx-auto mb-4 w-12 h-12 rounded-sm bg-red-950/80 border-2 border-red-700 flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-400" /></div><h2 id="reset-wiki-title" className="text-base font-bold text-red-200">旅の書（Wiki記事）をリセットしますか？</h2><p className="mt-2 text-sm text-[#ffb000] font-bold break-words">「{world.name}」</p><p className="mt-3 text-xs leading-5 text-zinc-400 font-mono">この操作は元に戻せません。<br />生成された旅の書と現在の流派選択が初期化されます。</p></div>
          <div className="grid grid-cols-2 gap-3 px-6 pb-6"><button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} onMouseEnter={playHoverSound} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#1a2333] border border-[#334155] text-zinc-300 hover:text-white text-xs font-bold"><X className="w-4 h-4" />キャンセル</button><button type="button" onClick={confirmReset} onMouseEnter={playHoverSound} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-red-900 border-2 border-red-600 text-red-100 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"><Trash2 className="w-4 h-4" />リセットする</button></div>
        </div>
      </div>}
    </div>
  );
}

function WikiContent({ world, style, hasArticle, article, generating, resetting, cooldownActive, onGenerate, onReset, onAiTest, locationCount, locations, isGeneratedWikipedia, onOpenLocation }: { world: WorldWithMembers; style: string | null; hasArticle: boolean; article: string | null; generating: boolean; resetting: boolean; cooldownActive: boolean; onGenerate: () => void; onReset: () => void; onAiTest: () => void; locationCount: number; locations: LocationWithPhotos[]; isGeneratedWikipedia: boolean; onOpenLocation?: (locationId: string) => void }) {
  const isWikipedia = style === 'wikipedia'; const isScp = style === 'scp'; const isAncient = style === 'ancient';
  const pageClass = isWikipedia ? 'bg-[#0d1627] text-zinc-200 border-amber-500' : isScp ? 'bg-[#07141b] text-zinc-200 border-cyan-400' : isAncient ? 'bg-[#160e09] text-[#ead8bf] border-orange-500' : 'bg-[#0d1627] text-zinc-200 border-[#2d3548]';
  const headerClass = isWikipedia ? 'bg-[#101b2d] border-amber-500 text-amber-400' : isScp ? 'bg-[#0a1820] border-cyan-400 text-cyan-300' : 'bg-[#1a1009] border-orange-500 text-orange-400';
  const articleClass = isWikipedia ? 'bg-[#07101c] border-[#334155] text-zinc-200' : isScp ? 'bg-[#07141b] border-[#1b5365] text-zinc-200' : 'bg-[#160e09] border-[#6e4a2d] text-[#ead8bf]';
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
  const actionButtons = <div className="flex flex-col sm:flex-row gap-2 px-4 pt-5 sm:px-6 pb-5"><button type="button" onClick={onGenerate} onMouseEnter={playHoverSound} disabled={hasArticle || generating || resetting || cooldownActive || locationCount === 0 || style === null} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 rounded-sm bg-amber-500 border-2 border-amber-400 text-black font-black shadow-[0_0_18px_rgba(245,158,11,0.18)] hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-40">{generating ? <><Spinner /><span>編纂中...</span></> : <><Sparkles className="w-5 h-5" />旅の書を生成</>}</button><button type="button" onClick={onReset} onMouseEnter={playHoverSound} disabled={!hasArticle || !style || generating || resetting} className="shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-[#334155] bg-[#1a2333] text-zinc-300 font-bold hover:border-amber-500 hover:text-amber-400 active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>{style === null && <button type="button" onClick={onAiTest} onMouseEnter={playHoverSound} className="shrink-0 min-h-[44px] px-3 py-3 rounded-sm border-2 border-[#1a2333] bg-[#1a2333] text-emerald-400 text-sm font-bold">AI接続テスト</button>}</div>;

  if (style === null) return <div className="rounded-sm border-2 border-double border-[#2d3548] bg-[#1e2330] p-6 sm:p-8 text-center"><BookOpen className="w-10 h-10 mx-auto text-amber-400/60 mb-3" /><EmptyState message="上の3つから、旅の書のスタイルを選択してください。" /></div>;

  if (isGeneratedWikipedia) return <div className="min-h-screen bg-white text-[#202122]"><header className="w-full bg-white px-4 py-3 sm:px-8"><div className="mx-auto flex w-full max-w-7xl items-center gap-4"><img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="h-14 w-14 rounded-full object-cover border border-[#a2a9b1]" /><div><div className="font-serif text-[30px] leading-none font-normal tracking-tight">ウタペディア</div><div className="font-serif text-[13px] leading-tight text-[#54595d] mt-1">Survival Wiki</div></div></div></header><article className="w-full bg-white px-4 py-4 sm:px-8"><div className="mx-auto w-full max-w-7xl"><div className="mt-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8"><div className="min-w-0 h-[calc(100vh-150px)]"><MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} /></div><aside className="border border-[#a2a9b1] bg-[#f8f9fa] p-3 h-fit text-sm">{mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="w-full aspect-[4/3] object-cover border border-[#c8ccd1] mb-3" />}<div className="border-b border-[#c8ccd1] pb-2 font-semibold text-base">基本情報</div><div className="mt-3 divide-y divide-[#c8ccd1]"><div className="py-2"><span className="font-semibold">名称</span><div className="mt-1">{world.name}</div></div><div className="py-2"><span className="font-semibold">プレイヤー</span><div className="mt-1">{world.player ?? '不明'}</div></div><div className="py-2"><span className="font-semibold">記録地点</span><div className="mt-1">{locationCount}</div></div><div className="py-2"><span className="font-semibold">参加メンバー</span><div className="mt-1">{world.members.length}</div></div><div className="py-2"><span className="font-semibold">記録開始</span><div className="mt-1">{new Date(world.created_at).toLocaleDateString('ja-JP')}</div></div></div>{locations.length > 0 && <div className="mt-4 border-t border-[#c8ccd1] pt-3"><div className="font-semibold text-base mb-2">関連ロケーション</div><div className="space-y-1.5">{locations.map((location) => <button type="button" key={location.id} onClick={() => onOpenLocation?.(location.id)} onMouseEnter={playHoverSound} className="w-full text-left py-1.5 border-b border-[#eaecf0] last:border-b-0 hover:bg-[#eaecf0] rounded-sm px-1 transition-colors"><div className="font-medium text-[#36c]">{location.name}</div><div className="text-xs text-[#54595d] font-mono">X {location.x} / Y {location.y} / Z {location.z}</div></button>)}</div></div>}</aside></div></div></article>{actionButtons}</div>;

  const narrator = NARRATORS[style];
  return <div className={`border-2 shadow-lg overflow-hidden transition-colors duration-300 ${pageClass}`}><div className={`px-4 sm:px-5 py-4 border-b-2 ${headerClass}`}><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 opacity-80" /><div><p className="text-sm font-bold font-mono">{isWikipedia ? 'WIKIPEDIA CHRONICLE' : isScp ? 'SCP FOUNDATION // SECURE LOG' : 'LOST CHRONICLE // 古文書'}</p><p className="text-[10px] opacity-70 font-mono">{isWikipedia ? '百科事典編纂流派' : isScp ? '機密記録編纂流派' : '絶望古文書編纂流派'}</p></div></div></div><div className="px-4 py-5 sm:px-6 sm:py-7"><NarratorDialogue style={style} /><div className="mt-6 rounded-sm border-2 border-dashed border-[#334155] bg-[#050a14] p-6 sm:p-10 text-center"><Sparkles className="w-9 h-9 mx-auto text-amber-400 mb-4" /><h2 className={`text-base sm:text-lg font-bold ${narrator.text}`}>冒険の記憶が揃いました</h2><p className="mt-3 text-xs sm:text-sm leading-6 text-slate-400">記録された {locationCount} 箇所の拠点を元に、選ばれた流派で「旅の書」を編纂できます。</p></div>{hasArticle && article && <article className={`mt-5 border-2 p-5 sm:p-7 shadow-sm ${articleClass}`}><MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} className={isAncient ? 'font-serif' : 'font-sans'} /></article>}{!hasArticle && locationCount > 0 && <div className="mt-5 rounded-sm border border-[#334155] bg-[#0a1120] px-4 py-5 text-center text-xs text-slate-500 font-mono">READY // {narrator.name} が編纂を待機中</div>}{actionButtons}</div></div>;
}
