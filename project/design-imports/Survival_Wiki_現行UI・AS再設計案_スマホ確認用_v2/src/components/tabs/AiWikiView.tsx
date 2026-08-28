import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Shield, Scroll, RotateCcw, AlertTriangle, Check, ExternalLink, Loader2, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import { World, LogEntry, WikiStyleId, WikiArticle } from '../../types';
import { sound } from '../../audio/soundEngine';
import { storage } from '../../lib/storage';

interface AiWikiViewProps {
  world: World;
  logs: LogEntry[];
  onOpenLogById?: (logId: string) => void;
}

const STYLES: {
  id: WikiStyleId;
  name: string;
  author: string;
  role: string;
  desc: string;
  quote: string;
  icon: any;
  bgmTrack: 'wikipedia' | 'scp' | 'ancient';
  themeColor: {
    border: string;
    bg: string;
    text: string;
    badge: string;
  };
}[] = [
  {
    id: 'wikipedia',
    name: 'ウタペディア',
    author: '主任編纂官',
    role: '民俗学者 // 百科事典編纂',
    desc: '客観的に見せかけて、知的に刺す。事実と詳細なタイムラインから体系的百科事典を編纂。',
    quote: '「ふむ……この記録によれば、ここで無駄に時間を費やした冒険者は星の数ほどいるようだ。」',
    icon: BookOpen,
    bgmTrack: 'wikipedia',
    themeColor: {
      border: 'border-[#ff8c00]',
      bg: 'bg-[#141417]',
      text: 'text-[#ff8c00]',
      badge: 'bg-[#ff8c00]/20 text-[#ff8c00] border-[#ff8c00]',
    },
  },
  {
    id: 'scp',
    name: '機密報告書',
    author: 'Dr. アーク',
    role: '特異点上級研究員 // SCP財団',
    desc: '世界の異常性を、淡々と冷徹に記録。機密収容プロトコルと観測データとして再構成。',
    quote: '「……記録を確認した。残念ながら、今回も君が原因である可能性を排除できない。」',
    icon: Shield,
    bgmTrack: 'scp',
    themeColor: {
      border: 'border-[#00ff41]',
      bg: 'bg-[#101612]',
      text: 'text-[#00ff41]',
      badge: 'bg-[#00ff41]/20 text-[#00ff41] border-[#00ff41]',
    },
  },
  {
    id: 'ancient',
    name: '絶望古文書',
    author: '老吟遊詩人',
    role: '流浪の語り部 // 絶望叙事詩',
    desc: '過酷なサバイバル体験を、滅びゆく世界の神話・叙事詩として後世に語り継ぐ。',
    quote: '「かつて愚かな旅人がこの地を訪れた。彼らが何を求めたのか、知る者はもういない。」',
    icon: Scroll,
    bgmTrack: 'ancient',
    themeColor: {
      border: 'border-[#ffa500]',
      bg: 'bg-[#18120c]',
      text: 'text-[#ffa500]',
      badge: 'bg-[#ffa500]/20 text-[#ffa500] border-[#ffa500]',
    },
  },
];

export const AiWikiView: React.FC<AiWikiViewProps> = ({ world, logs }) => {
  const [selectedStyle, setSelectedStyle] = useState<WikiStyleId>('wikipedia');
  const [article, setArticle] = useState<WikiArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isResetConfirm, setIsResetConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing wiki article on style change
  useEffect(() => {
    const existing = storage.getWiki(world.id, selectedStyle);
    setArticle(existing || null);

    // Play appropriate narrator BGM
    const styleObj = STYLES.find((s) => s.id === selectedStyle);
    if (styleObj) {
      sound.playBgm(styleObj.bgmTrack);
    }
  }, [world.id, selectedStyle]);

  const currentStyleObj = STYLES.find((s) => s.id === selectedStyle)!;

  const handleGenerate = async () => {
    if (logs.length === 0) return;
    setIsGenerating(true);
    setErrorMessage('');
    sound.playWikiCompile();

    try {
      const response = await fetch('/api/generate-wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world,
          logs,
          style: selectedStyle,
        }),
      });

      if (!response.ok) throw new Error('Wiki生成リクエストに失敗しました');
      const data = await response.json();

      const saved = storage.saveWiki(world.id, selectedStyle, data.content);
      setArticle(saved);
      sound.playSaveLog();

      // Trigger fanfare confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#ff8c00', '#ffa500', '#00ff41', '#ffffff'],
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '生成中にエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    sound.playDelete();
    storage.deleteWiki(world.id, selectedStyle);
    setArticle(null);
    setIsResetConfirm(false);
  };

  return (
    <div className="space-y-4 pb-28 font-sans">
      {/* Style Selector Tabs (3 Personalities) */}
      <div className="grid grid-cols-3 gap-2 bg-[#121214] p-1.5 rounded-xl border-2 border-[#333338] shadow-[3px_3px_0px_#000000]">
        {STYLES.map((st) => {
          const Icon = st.icon;
          const isSelected = selectedStyle === st.id;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                sound.playConfirm();
                setSelectedStyle(st.id);
              }}
              className={`p-2.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center gap-1 shadow-[2px_2px_0px_#000000] ${
                isSelected
                  ? `${st.themeColor.bg} ${st.themeColor.border} border-2 shadow-[2px_2px_0px_#ff8c00]`
                  : 'bg-[#18181c] border-[#333338] text-[#888888] hover:text-[#dcdcdc]'
              }`}
            >
              <Icon
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  isSelected ? st.themeColor.text : 'text-[#666666]'
                }`}
              />
              <span className="text-[11px] sm:text-xs font-bold truncate w-full terminal-font">{st.name}</span>
            </button>
          );
        })}
      </div>

      {/* Narrator Dialogue Box */}
      <div
        className={`rounded-xl border-2 p-4 sm:p-5 transition-all shadow-[4px_4px_0px_#000000] ${currentStyleObj.themeColor.bg} ${currentStyleObj.themeColor.border}`}
      >
        <div className="flex items-start gap-3.5">
          {/* Narrator Icon / Avatar */}
          <div className="w-12 h-12 rounded-lg bg-[#0a0a0c] border-2 border-[#333338] flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#000000]">
            <currentStyleObj.icon className={`w-6 h-6 ${currentStyleObj.themeColor.text}`} />
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] terminal-font font-bold border ${currentStyleObj.themeColor.badge}`}>
                {currentStyleObj.role}
              </span>
              <span className="text-[10px] terminal-font text-[#888888]">
                {logs.length} RECORDS AVAILABLE
              </span>
            </div>

            <h4 className="text-sm font-bold text-white terminal-font">{currentStyleObj.author}</h4>
            <p className="text-xs text-[#dcdcdc] italic lore-font leading-relaxed">
              {currentStyleObj.quote}
            </p>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-950/80 border-2 border-rose-600 text-xs text-rose-200 terminal-font shadow-[3px_3px_0px_#000000]">
          {errorMessage}
        </div>
      )}

      {/* Generate / Compile Action Panel */}
      {!article && (
        <div className="bg-[#121214] border-2 border-dashed border-[#333338] rounded-xl p-6 sm:p-8 text-center space-y-4 shadow-[4px_4px_0px_#000000]">
          <div className="w-12 h-12 rounded-xl bg-[#ff8c00]/15 border-2 border-[#ff8c00] flex items-center justify-center mx-auto text-[#ff8c00] shadow-[2px_2px_0px_#000000]">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-white terminal-font">
              蓄積された {logs.length} 件の記録から「旅の書」を編纂
            </h3>
            <p className="text-xs text-[#aaaaaa] max-w-md mx-auto leading-relaxed">
              AIがこれまでに訪れた地点・体験メモ・写真を解析し、選ばれた流派（{currentStyleObj.name}）の語り口で独自の年代記記事へと作品化します。
            </p>
          </div>

          <button
            type="button"
            disabled={isGenerating || logs.length === 0}
            onClick={handleGenerate}
            className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#ff8c00] hover:bg-[#ffa500] disabled:opacity-50 text-black font-black text-sm terminal-font active:scale-95 transition shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>AI編纂中 // COMPILING CHRONICLE...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[3]" />
                <span>▶ この流派で旅の書を生成する</span>
              </>
            )}
          </button>

          {logs.length === 0 && (
            <p className="text-[11px] terminal-font text-rose-400">
              ※ Wikiを生成するには、まず日誌に1件以上の記録が必要です。
            </p>
          )}
        </div>
      )}

      {/* Generated Article Showcase */}
      {article && (
        <div className="space-y-3">
          {/* Article Toolbar */}
          <div className="flex items-center justify-between px-2 text-xs terminal-font text-[#888888]">
            <span className="flex items-center gap-1.5 text-[#00ff41] font-bold">
              <Check className="w-4 h-4" /> 編纂完了 ({new Date(article.updatedAt).toLocaleTimeString()})
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="text-[#ff8c00] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <Sparkles className="w-3.5 h-3.5" /> 再編纂
              </button>
              <button
                type="button"
                onClick={() => setIsResetConfirm(true)}
                className="text-rose-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> リセット
              </button>
            </div>
          </div>

          {/* Rendered Markdown Body */}
          <article
            className={`rounded-xl border-2 p-5 sm:p-7 shadow-[4px_4px_0px_#000000] overflow-x-auto leading-relaxed bg-[#121214] ${currentStyleObj.themeColor.border}`}
          >
            <div className="wiki-markdown prose prose-invert max-w-none space-y-4">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </article>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {isResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[#121214] border-2 border-rose-600 rounded-xl p-5 space-y-4 text-center shadow-[6px_6px_0px_#000000]">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white terminal-font">旅の書を初期化しますか？</h4>
              <p className="text-xs text-[#888888]">
                生成された「{currentStyleObj.name}」の記事をリセットします。日誌の元データは削除されません。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirm(false)}
                className="py-2 rounded-lg bg-[#18181c] border border-[#333338] text-[#888888] hover:text-white text-xs font-bold cursor-pointer terminal-font"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer terminal-font shadow-[2px_2px_0px_#000000]"
              >
                リセットする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
