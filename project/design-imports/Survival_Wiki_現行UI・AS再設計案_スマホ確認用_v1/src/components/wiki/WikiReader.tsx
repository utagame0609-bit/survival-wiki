import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, RefreshCw, Trash2, Sparkles, BookOpen, Shield, FileText, Share2 } from 'lucide-react';
import { WikiArticle, World } from '../../types';
import { playConfirmSound, playDeleteSound, playHoverSound } from '../../audio/soundEngine';

interface WikiReaderProps {
  world: World;
  article: WikiArticle;
  onRegenerate: () => void;
  onReset: () => void;
}

export const WikiReader: React.FC<WikiReaderProps> = ({
  world,
  article,
  onRegenerate,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(article.content).catch(() => {});
    playConfirmSound();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStyleTheme = () => {
    if (article.style === 'wikipedia') {
      return {
        wrapper: 'bg-[#141414] text-[#E5E5E5] border-[#262626]',
        header: 'bg-[#0A0A0A] border-[#262626] text-[#E5E5E5]',
        badge: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
        font: 'font-serif',
      };
    }
    if (article.style === 'scp') {
      return {
        wrapper: 'bg-[#0F0F0F] text-[#D4AF37] border-[#262626]',
        header: 'bg-[#0A0A0A] border-[#262626] text-[#E5E5E5]',
        badge: 'bg-red-950/40 text-red-400 border-red-800/40',
        font: 'font-mono',
      };
    }
    // ancient
    return {
      wrapper: 'bg-[#121212] text-[#E5E5E5] border-[#262626]',
      header: 'bg-[#0A0A0A] border-[#262626] text-[#D4AF37]',
      badge: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30',
      font: 'font-serif',
    };
  };

  const theme = getStyleTheme();

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-[#141414] border border-[#262626] p-3 sm:p-4 rounded-sm flex flex-wrap items-center justify-between gap-2.5 shadow-md">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
            AI 編纂済 // {article.style.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-[#737373]">
            生成日: {new Date(article.generatedAt).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#1F1F1F] border border-[#262626] text-[#E5E5E5] text-xs font-mono font-medium rounded-sm transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />}
            <span>{copied ? 'コピー完了' : '本文をコピー'}</span>
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-mono font-bold rounded-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>再編纂</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playDeleteSound();
              onReset();
            }}
            onMouseEnter={playHoverSound}
            className="p-1.5 text-[#737373] hover:text-red-400 bg-[#0A0A0A] border border-[#262626] rounded-sm transition-colors cursor-pointer"
            title="記事を消去してスタイル再選択"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The Article Document Container */}
      <article
        className={`border rounded-sm p-4 sm:p-8 sm:p-10 shadow-2xl transition-all ${theme.wrapper}`}
      >
        {/* Document Persona Banner */}
        <div className={`p-3 rounded-sm border mb-6 flex items-center justify-between ${theme.header}`}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs font-mono font-bold tracking-wider">
              {article.style === 'wikipedia'
                ? 'UTAPEDIA 百科事典編纂アーカイブ'
                : article.style === 'scp'
                ? 'SCP FOUNDATION // CLASSIFIED DOCUMENT'
                : '古文書・叙事詩ライブラリ'}
            </span>
          </div>

          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold border rounded-sm ${theme.badge}`}>
            {article.style === 'wikipedia' ? 'VERIFIED' : article.style === 'scp' ? 'EUCLID' : 'ANCIENT'}
          </span>
        </div>

        {/* Stats metadata box */}
        {article.stats && (
          <div className="mb-6 p-3 bg-black/40 border border-[#262626] rounded-sm text-xs font-mono flex flex-wrap gap-4 justify-around text-[#A3A3A3]">
            <div>
              <span className="text-[#737373]">対象日数: </span>
              <strong className="text-[#E5E5E5]">{article.stats.daysCount} 日間</strong>
            </div>
            <div>
              <span className="text-[#737373]">解析記録数: </span>
              <strong className="text-[#E5E5E5]">{article.stats.recordsCount} 件</strong>
            </div>
            <div>
              <span className="text-[#737373]">観測地点数: </span>
              <strong className="text-[#E5E5E5]">{article.stats.locationsCount} 箇所</strong>
            </div>
            <div>
              <span className="text-[#737373]">写真資料: </span>
              <strong className="text-[#E5E5E5]">{article.stats.photosCount} 枚</strong>
            </div>
          </div>
        )}

        {/* Markdown Render Body */}
        <div className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-[#E5E5E5] prose-h1:text-xl sm:prose-h1:text-2xl prose-h2:text-lg sm:prose-h2:text-xl prose-h3:text-base prose-p:leading-relaxed prose-p:text-[#D4D4D4] prose-li:my-1 prose-li:text-[#D4D4D4] prose-strong:text-[#E5E5E5] prose-a:text-[#D4AF37]">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
};
