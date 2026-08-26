import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, BookOpen, Edit3, Check, Copy, AlertCircle, RotateCcw } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers, WikiArticle } from '@/lib/types';
import { fetchWikiArticle, saveWikiArticle, resetWikiArticle } from '@/lib/db';
import { WIKI_STYLES } from '@/lib/wiki';
import { openRouterTestProvider } from '@/lib/wikiOpenRouter';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import { UTAPEDIA_AVATAR } from '@/assets/utapediaAvatar';
import {
  playConfirmSound,
  playCancelSound,
  playSaveSound,
  playTabSwitchSound,
} from '@/lib/sound';
import { playSoundCandidatePreview } from '@/lib/soundCandidatePreviewEngine';

interface WikiTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onNavigateToLocation?: (locationId: string) => void;
}

export function WikiTab({ world, locations, onNavigateToLocation }: WikiTabProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('wikipedia');
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadArticle = async (styleId: string) => {
    setLoading(true);
    setError('');
    try {
      const art = await fetchWikiArticle(world.id, styleId);
      setArticle(art);
      if (art) {
        setEditContent(art.content);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticle(selectedStyle);
  }, [world.id, selectedStyle]);

  const handleStyleChange = (styleId: string) => {
    playTabSwitchSound();
    setSelectedStyle(styleId);
    setEditing(false);
  };

  const handleGenerate = async () => {
    if (locations.length === 0) {
      setError('拠点が記録されていません。「ロケーション」タブで拠点を追加してから生成してください。');
      return;
    }

    setGenerating(true);
    setError('');
    playSoundCandidatePreview('wiki_generating_noise');

    try {
      const result = await openRouterTestProvider.generate({
        world,
        locations,
        style: selectedStyle,
      });

      const saved = await saveWikiArticle(world.id, selectedStyle, result.content);
      setArticle(saved);
      setEditContent(saved.content);
      setEditing(false);
      playSoundCandidatePreview('wiki_complete');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const saved = await saveWikiArticle(world.id, selectedStyle, editContent);
      setArticle(saved);
      setEditing(false);
      playSaveSound();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('この記事をリセットして初期状態に戻しますか？')) return;
    try {
      await resetWikiArticle(world.id, selectedStyle);
      setArticle(null);
      setEditContent('');
      setEditing(false);
      playConfirmSound();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleCopy = () => {
    if (!article) return;
    navigator.clipboard.writeText(article.content);
    setCopied(true);
    playConfirmSound();
    setTimeout(() => setCopied(false), 2000);
  };

  // Location links mapping
  const locationLinks = locations.map((loc) => ({
    name: loc.name,
    onClick: () => onNavigateToLocation?.(loc.id),
  }));

  return (
    <div className="space-y-6 font-mono">
      {/* Utapedia Chronicler Header Banner */}
      <div className="bg-[#0a1120] border-2 border-[#1a2333] p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-[#070c18] border-2 border-amber-500 overflow-hidden p-1 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          <img src={UTAPEDIA_AVATAR} alt="ウタペディア民俗学者" className="w-full h-full object-contain pixelated" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black shadow-[0_0_6px_#10b981]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              CHRONICLER_AI
            </span>
            <h2 className="text-sm sm:text-base font-bold text-slate-100">
              ウタペディア自動編纂システム
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            「記録された全 {locations.length} 箇所の拠点と探索メモを解析し、後世に残すための百科事典・年代記記事を編纂いたします。」
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 text-black font-bold border-b-2 border-amber-700 hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 shadow-[0_2px_8px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 text-xs sm:text-sm cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'AI編纂中...' : article ? '記事を再編纂する' : 'Wiki記事を生成する'}</span>
        </button>
      </div>

      {/* Style selector tabs */}
      <div className="flex flex-wrap gap-1 border-b-2 border-[#1a2333] pb-0">
        {WIKI_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => handleStyleChange(style.id)}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
                isSelected
                  ? 'border-amber-500 bg-[#0d1627] text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#0a1120]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{style.name}</span>
            </button>
          );
        })}
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Article Content Area */}
      {loading ? (
        <Spinner label="アーカイブ文書を照会中..." />
      ) : generating ? (
        <div className="py-20 text-center border-2 border-amber-500 bg-[#0d1627] p-8 space-y-4 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-base font-bold text-amber-400 tracking-widest animate-pulse font-mono">
            AI MATRIX GENERATION IN PROGRESS
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            全拠点の空間座標、時系列データ、同行メンバーの行動ログを照合し、文体を構成中...
          </p>
        </div>
      ) : !article ? (
        <div className="py-16 text-center border-2 border-dashed border-[#1a2333] bg-[#070c18]/60 p-8 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-300">まだこの記事は編纂されていません</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            上部の「Wiki記事を生成する」ボタンを押すと、このワールドの記録に基づいた百科事典記事が自動生成されます。
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            className="mt-4 px-4 py-2 bg-[#070c18] border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 text-xs font-bold inline-flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>今すぐ編纂を開始</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#0a1120] border-2 border-[#1a2333] p-5 sm:p-8 shadow-xl">
          {/* Article Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#1a2333]">
            <div className="text-[11px] text-slate-400 font-mono">
              最終編纂: {new Date(article.updated_at || article.created_at).toLocaleString('ja-JP')}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#070c18] border border-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'コピー完了' : 'Markdownコピー'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playConfirmSound();
                  setEditing(!editing);
                }}
                className={`px-3 py-1.5 border text-xs flex items-center gap-1.5 ${
                  editing
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold'
                    : 'border-slate-700 bg-[#070c18] text-slate-300 hover:border-amber-500 hover:text-amber-400'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editing ? 'プレビュー表示' : '手動編集'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                title="記事リセット"
                className="p-1.5 border border-red-900 bg-red-950/30 text-red-400 hover:bg-red-900/50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Edit Mode vs Render Mode */}
          {editing ? (
            <div className="space-y-4">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={18}
                className="w-full p-4 bg-[#070c18] border border-slate-700 text-slate-100 font-mono text-xs leading-6 focus:border-amber-500 outline-none resize-y"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playCancelSound();
                    setEditing(false);
                    setEditContent(article.content);
                  }}
                  className="px-4 py-2 bg-[#070c18] border border-slate-700 text-slate-300 text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-5 py-2 bg-amber-500 text-black font-bold border-b-2 border-amber-700 hover:bg-amber-400 text-xs flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>編集内容を保存</span>
                </button>
              </div>
            </div>
          ) : (
            <MarkdownRenderer
              content={article.content}
              locationLinks={locationLinks}
            />
          )}
        </div>
      )}
    </div>
  );
}
