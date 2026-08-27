import { useEffect, useRef, useState } from 'react';
import { Sparkles, BookOpen, RotateCcw, AlertTriangle, X, Trash2, Glasses, Shield, ScrollText, MessageSquareQuote } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { fetchLocations, fetchWikiArticle, resetWikiArticle, saveWikiArticle, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { WIKI_STYLES } from '@/lib/wiki';
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

const STYLE_PREVIEWS: Record<string, { eyebrow: string; title: string; icon: typeof Glasses; sample: string; badges: string[]; tone: string }> = {
  wikipedia: { eyebrow: 'STYLE 01 // ウタペディア', title: '百科事典・民俗学者', icon: Glasses, sample: '「ふむ……この記録によれば、ここで無残にも骨を埋めた冒険者は星の数ほどいるようだ。」', badges: ['事実＋毒舌な脚色', '情報密度：高'], tone: '客観的に見せかけて、知的に刺す。' },
  scp: { eyebrow: 'STYLE 02 // SCP FOUNDATION', title: '機密報告・上級研究員', icon: Shield, sample: '「対象地点における異常行動の詳細は不明。記録者本人の生存能力にも疑義がある。」', badges: ['機密文書風', '冷徹・不穏'], tone: '世界の異常を、淡々と記録する。' },
  ancient: { eyebrow: 'STYLE 03 // LOST CHRONICLE', title: '絶望古文書・吟遊詩人', icon: ScrollText, sample: '「かつて愚かな旅人がこの地を訪れた。彼らが何を求めたのか、知る者はもういない。」', badges: ['悲壮感', '伝承・叙事詩風'], tone: '記録を、滅びゆく物語へ変える。' },
};

const NARRATORS: Record<string, { name: string; role: string; quote: string; accent: string; panel: string; text: string }> = {
  wikipedia: { name: '民俗学者 エルナン', role: '百科事典編纂官', quote: 'ふむ……この記録から判断するに、君はまた随分と無計画だったようだね。', accent: '#ffb000', panel: 'bg-[#17130a] border-[#ffb000]', text: 'text-[#ffb000]' },
  scp: { name: '特異点研究員 Dr.アーク', role: '最高機密研究班', quote: '……記録を確認した。残念ながら、今回も君が原因である可能性を排除できない。', accent: '#22c7ff', panel: 'bg-[#07141b] border-[#22c7ff]', text: 'text-[#22c7ff]' },
  ancient: { name: '老吟遊詩人 ギルダス', role: '狂学者・古文書の語り部', quote: '……また一人、己の身の程を知らぬ者が、この地へ足を踏み入れたか。', accent: '#ff8a00', panel: 'bg-[#1a1009] border-[#ff8a00]', text: 'text-[#ff8a00]' },
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
          <div className="grid grid-cols-2 gap-3 px-6 pb-6"><button type="button" onClick={() => { playCancelSound(); setResetTarget(false); }} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-[#1a2333] border border-[#334155] text-zinc-300 hover:text-white text-xs font-bold"><X className="w-4 h-4" />キャンセル</button><button type="button" onClick={confirmReset} className="flex items-center justify-center gap-2 py-2.5 rounded-sm bg-red-900 border-2 border-red-600 text-red-100 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)]"><Trash2 className="w-4 h-4" />リセットする</button></div>
        </div>
      </div>}
    </div>
  );
}

function StyleSelector({ style, generating, resetting, onSelect }: { style: string | null; generating: boolean; resetting: boolean; onSelect: (id: string) => void }) {
  return <div className="rounded-sm border-2 border-[#2d3548] bg-[#1e2330] p-4 sm:p-5 shadow-lg"><div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2d3548]"><div className="flex items-center gap-2 min-w-0"><span className="text-amber-400 font-mono text-xs">▶</span><div><p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide font-mono uppercase">CHRONICLE FORMAT // 旅の書・編纂流派</p><p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">記録を、どんな世界の物語として残す？</p></div></div><span className="hidden sm:inline text-[10px] text-slate-500 font-mono">SELECT YOUR CHRONICLE</span></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{WIKI_STYLES.map((s) => { const preview = STYLE_PREVIEWS[s.id]; const Icon = preview?.icon ?? BookOpen; const selected = style === s.id; return <button key={s.id} type="button" onClick={() => onSelect(s.id)} disabled={generating || resetting} className={`group relative overflow-hidden rounded-sm border-2 p-3.5 text-left transition-all duration-200 min-h-[180px] ${selected ? 'border-amber-500 bg-[#161a24] shadow-[0_0_18px_rgba(245,158,11,0.2)]' : 'border-[#2d3548] bg-[#141824] hover:border-slate-500 hover:bg-[#181d2c]'}`}><div className="absolute right-[-12px] top-[-18px] text-amber-400/[0.035] transition-transform duration-300 group-hover:scale-110"><Icon size={100} strokeWidth={1} /></div><div className="relative z-10"><div className="flex items-center justify-between gap-2"><span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-slate-700 bg-[#12151f] text-emerald-400">{preview?.eyebrow ?? s.name}</span>{selected && <span className="text-[9px] font-mono font-bold text-amber-400">▶ SELECTED</span>}</div><div className="mt-3 flex items-center gap-2"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-[#0f131d] text-slate-500'}`}><Icon className="w-5 h-5" /></div><div className="min-w-0"><h3 className={`text-sm font-bold truncate ${selected ? 'text-amber-400' : 'text-white'}`}>{preview?.title ?? s.name}</h3><p className="text-[10px] text-slate-400 mt-0.5">{preview?.tone ?? s.description}</p></div></div><div className="mt-3 rounded-sm border border-[#2d3548] bg-[#12151f] p-2.5"><p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-200 font-serif">{preview?.sample ?? s.description}</p></div><div className="mt-2 flex flex-wrap gap-1.5">{(preview?.badges ?? [s.description]).map((badge) => <span key={badge} className="rounded-sm border border-slate-700 bg-[#181d2c] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">{badge}</span>)}</div></div></button>; })}</div></div>;
}

function PixelNarrator({ style }: { style: string }) {
  const isWikipedia = style === 'wikipedia'; const isScp = style === 'scp';
  const skin = isScp ? '#d8e7ef' : isWikipedia ? '#d8ad7b' : '#c9b08a';
  const hair = isScp ? '#16222b' : isWikipedia ? '#4b3022' : '#d8d4c9';
  const coat = isScp ? '#d7e1e6' : isWikipedia ? '#27364b' : '#5b3b27';
  return <div className="relative h-24 w-20 sm:h-28 sm:w-24 shrink-0 rounded-sm border-2 border-double border-white/70 bg-[#07101c] shadow-[inset_0_0_0_1px_rgba(255,176,0,.35),0_0_16px_rgba(0,0,0,.45)] overflow-hidden"><svg viewBox="0 0 64 72" className="h-full w-full [image-rendering:pixelated]" shapeRendering="crispEdges" aria-hidden="true"><rect x="8" y="58" width="48" height="8" fill={coat}/><rect x="14" y="35" width="36" height="27" fill={coat}/><rect x="20" y="25" width="24" height="22" fill={skin}/><rect x="17" y="18" width="30" height="12" fill={hair}/><rect x="20" y="15" width="24" height="7" fill={hair}/><rect x="22" y="29" width="5" height="3" fill="#0a1120"/><rect x="37" y="29" width="5" height="3" fill="#0a1120"/><rect x="28" y="37" width="9" height="2" fill="#6b3f32"/><rect x="24" y="45" width="16" height="4" fill="#0a1120"/>{isWikipedia && <><rect x="18" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/><rect x="34" y="27" width="12" height="7" fill="none" stroke="#d7b56d" strokeWidth="2"/><rect x="30" y="29" width="4" height="2" fill="#d7b56d"/><rect x="11" y="47" width="9" height="12" fill="#f1dfb6"/><rect x="44" y="45" width="8" height="13" fill="#8b5a36"/></>}{isScp && <><rect x="25" y="39" width="14" height="13" fill="#183342"/><rect x="40" y="42" width="12" height="9" fill="#122833" stroke="#22c7ff" strokeWidth="1"/><rect x="43" y="45" width="6" height="2" fill="#22c7ff"/></>}{!isWikipedia && !isScp && <><rect x="12" y="43" width="9" height="16" fill="#6e492f"/><rect x="44" y="43" width="8" height="15" fill="#4a3023"/><rect x="26" y="49" width="12" height="8" fill="#b89462"/></>}</svg><span className="absolute left-1 top-1 text-[7px] font-mono text-white/50">16BIT</span></div>;
}

function NarratorDialogue({ style }: { style: string }) {
  const narrator = NARRATORS[style] ?? NARRATORS.ancient;
  return <div className={`mt-5 rounded-sm border-2 p-4 sm:p-5 ${narrator.panel} shadow-[0_0_20px_rgba(0,0,0,.25)]`}><div className="flex flex-col sm:flex-row gap-4 sm:items-center"><div className="flex sm:flex-col items-center gap-2 sm:w-28 shrink-0"><PixelNarrator style={style} /><div className={`text-[9px] sm:text-[10px] font-bold font-mono text-center border px-2 py-1 rounded-sm ${narrator.text} border-current`}>{narrator.role}</div></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2 mb-2"><div className={`flex items-center gap-2 text-xs sm:text-sm font-bold font-mono ${narrator.text}`}><span className="inline-block h-2 w-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />【{narrator.name}】</div><span className="hidden sm:inline text-[9px] font-mono text-slate-500">CHRONICLER DIALOGUE</span></div><div className="relative rounded-sm border border-[#2d3548] bg-[#050a14] px-4 py-4 sm:px-5 sm:py-5 text-sm sm:text-base leading-7 text-slate-100 font-serif shadow-inner"><MessageSquareQuote className={`absolute -left-2 -top-2 h-5 w-5 ${narrator.text} bg-[#07101c]`} /><span className="text-slate-500 mr-1">「</span>{narrator.quote}<span className="text-slate-500 ml-1">」</span><span className={`absolute right-3 bottom-1 text-xs ${narrator.text}`}>▼</span></div></div></div></div>;
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
  const actionButtons = <div className="flex flex-col sm:flex-row gap-2 px-4 pt-5 sm:px-6 pb-5"><button type="button" onClick={onGenerate} onMouseEnter={playHoverSound} disabled={hasArticle || generating || resetting || cooldownActive || locationCount === 0 || style === null} className="flex-1 min-h-[44px] flex items-center justify-center gap-2 py-3 rounded-sm bg-amber-500 border-2 border-amber-400 text-black font-black shadow-[0_0_18px_rgba(245,158,11,0.18)] hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-40">{generating ? <><Spinner /><span>編纂中...</span></> : <><Sparkles className="w-5 h-5" />旅の書を生成</>}</button><button type="button" onClick={onReset} disabled={!hasArticle || !style || generating || resetting} className="shrink-0 min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-sm border-2 border-[#334155] bg-[#1a2333] text-zinc-300 font-bold hover:border-amber-500 hover:text-amber-400 active:scale-[0.98] transition-all disabled:opacity-40"><RotateCcw className="w-4 h-4" />リセット</button>{style === null && <button type="button" onClick={onAiTest} className="shrink-0 min-h-[44px] px-3 py-3 rounded-sm border-2 border-[#1a2333] bg-[#1a2333] text-emerald-400 text-sm font-bold">AI接続テスト</button>}</div>;

  if (style === null) return <div className="rounded-sm border-2 border-double border-[#2d3548] bg-[#1e2330] p-6 sm:p-8 text-center"><BookOpen className="w-10 h-10 mx-auto text-amber-400/60 mb-3" /><EmptyState message="上の3つから、旅の書のスタイルを選択してください。" /></div>;

  if (isGeneratedWikipedia) return <div className="min-h-screen bg-white text-[#202122]"><header className="w-full bg-white px-4 py-3 sm:px-8"><div className="mx-auto flex w-full max-w-7xl items-center gap-4"><img src={UTAPEDIA_AVATAR} alt="ウタペディア" className="h-14 w-14 rounded-full object-cover border border-[#a2a9b1]" /><div><div className="font-serif text-[30px] leading-none font-normal tracking-tight">ウタペディア</div><div className="font-serif text-[13px] leading-tight text-[#54595d] mt-1">Survival Wiki</div></div></div></header><article className="w-full bg-white px-4 py-4 sm:px-8"><div className="mx-auto w-full max-w-7xl"><div className="mt-1 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8"><div className="min-w-0 h-[calc(100vh-150px)]"><MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} /></div><aside className="border border-[#a2a9b1] bg-[#f8f9fa] p-3 h-fit text-sm">{mainPhotoUrl && <img src={mainPhotoUrl} alt="代表写真" className="w-full aspect-[4/3] object-cover border border-[#c8ccd1] mb-3" />}<div className="border-b border-[#c8ccd1] pb-2 font-semibold text-base">基本情報</div><div className="mt-3 divide-y divide-[#c8ccd1]"><div className="py-2"><span className="font-semibold">名称</span><div className="mt-1">{world.name}</div></div><div className="py-2"><span className="font-semibold">プレイヤー</span><div className="mt-1">{world.player ?? '不明'}</div></div><div className="py-2"><span className="font-semibold">記録地点</span><div className="mt-1">{locationCount}</div></div><div className="py-2"><span className="font-semibold">参加メンバー</span><div className="mt-1">{world.members.length}</div></div><div className="py-2"><span className="font-semibold">記録開始</span><div className="mt-1">{new Date(world.created_at).toLocaleDateString('ja-JP')}</div></div></div>{locations.length > 0 && <div className="mt-4 border-t border-[#c8ccd1] pt-3"><div className="font-semibold text-base mb-2">関連ロケーション</div><div className="space-y-1.5">{locations.map((location) => <button type="button" key={location.id} onClick={() => onOpenLocation?.(location.id)} className="w-full text-left py-1.5 border-b border-[#eaecf0] last:border-b-0 hover:bg-[#eaecf0] rounded-sm px-1 transition-colors"><div className="font-medium text-[#36c]">{location.name}</div><div className="text-xs text-[#54595d] font-mono">X {location.x} / Y {location.y} / Z {location.z}</div></button>)}</div></div>}</aside></div></div></article>{actionButtons}</div>;

  const narrator = NARRATORS[style];
  return <div className={`border-2 shadow-lg overflow-hidden transition-colors duration-300 ${pageClass}`}><div className={`px-4 sm:px-5 py-4 border-b-2 ${headerClass}`}><div className="flex items-center gap-2"><BookOpen className="w-5 h-5 opacity-80" /><div><p className="text-sm font-bold font-mono">{isWikipedia ? 'WIKIPEDIA CHRONICLE' : isScp ? 'SCP FOUNDATION // SECURE LOG' : 'LOST CHRONICLE // 古文書'}</p><p className="text-[10px] opacity-70 font-mono">{isWikipedia ? '百科事典編纂流派' : isScp ? '機密記録編纂流派' : '絶望古文書編纂流派'}</p></div></div></div><div className="px-4 py-5 sm:px-6 sm:py-7"><NarratorDialogue style={style} /><div className="mt-6 rounded-sm border-2 border-dashed border-[#334155] bg-[#050a14] p-6 sm:p-10 text-center"><Sparkles className="w-9 h-9 mx-auto text-amber-400 mb-4" /><h2 className={`text-base sm:text-lg font-bold ${narrator.text}`}>冒険の記憶が揃いました</h2><p className="mt-3 text-xs sm:text-sm leading-6 text-slate-400">記録された {locationCount} 箇所の拠点を元に、選ばれた流派で「旅の書」を編纂できます。</p></div>{hasArticle && article && <article className={`mt-5 border-2 p-5 sm:p-7 shadow-sm ${articleClass}`}><MarkdownRenderer content={articleWithPhotoMarkers} locationLinks={locationLinks} className={isAncient ? 'font-serif' : 'font-sans'} /></article>}{!hasArticle && locationCount > 0 && <div className="mt-5 rounded-sm border border-[#334155] bg-[#0a1120] px-4 py-5 text-center text-xs text-slate-500 font-mono">READY // {narrator.name} が編纂を待機中</div>}{actionButtons}</div></div>;
}
