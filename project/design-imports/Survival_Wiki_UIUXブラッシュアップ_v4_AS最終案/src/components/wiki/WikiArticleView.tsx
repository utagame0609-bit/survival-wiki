import React, { useState } from 'react';
import { WikiArticle, WikiNpc, LocationRecord } from '../../types';
import { ChevronLeft, Copy, Check, Share2, RefreshCw, Sparkles, BookOpen, AlertTriangle, ExternalLink, MapPin } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface WikiArticleViewProps {
  article: WikiArticle;
  npcs: WikiNpc[];
  allRecords: LocationRecord[];
  onSwitchStyle: (style: 'encyclopedia' | 'scp' | 'ancient') => void;
  onBackToWikiList: () => void;
  onSelectRecordForDetail: (record: LocationRecord) => void;
  onResetStyleArticle: (style: string) => void;
}

export const WikiArticleView: React.FC<WikiArticleViewProps> = ({
  article,
  npcs,
  allRecords,
  onSwitchStyle,
  onBackToWikiList,
  onSelectRecordForDetail,
  onResetStyleArticle,
}) => {
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const activeNpc = npcs.find((n) => n.id === article.npcId) || npcs[0];

  const handleCopy = () => {
    soundEngine.playSe('copy_success');
    const fullText = `# ${article.title}\n\n${article.subtitle}\n\n${article.summary}\n\n${article.contentMarkdown}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    soundEngine.playSe('danger_delete');
    onResetStyleArticle(article.style);
    setShowResetConfirm(false);
  };

  // Helper to render markdown text and turn bracketed location names like [第一前哨基地・灯台テラスの完成] into clickable pills
  const renderInteractiveMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Header 2
      if (line.startsWith('## ')) {
        return (
          <h3
            key={lIdx}
            className={`text-base sm:text-lg font-bold mt-5 mb-2 pb-1 border-b ${
              article.style === 'encyclopedia'
                ? 'text-[#1E293B] border-[#CBD5E1] font-jp'
                : article.style === 'scp'
                ? 'text-[#38BDF8] border-[#06B6D4]/40 font-mono'
                : 'text-[#FDE68A] border-[#D97706]/40 font-jp'
            }`}
          >
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Check for bracketed locations [Location Title]
      const parts = line.split(/(\[[^\]]+\])/g);
      return (
        <p
          key={lIdx}
          className={`text-sm leading-relaxed mb-3 ${
            article.style === 'encyclopedia'
              ? 'text-[#334155]'
              : article.style === 'scp'
              ? 'text-[#CBD5E1]'
              : 'text-[#FEF3C7]'
          }`}
        >
          {parts.map((part, pIdx) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const locationTitle = part.slice(1, -1);
              const matchedRecord = allRecords.find((r) =>
                r.title.includes(locationTitle) || locationTitle.includes(r.title)
              );

              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    if (matchedRecord) {
                      soundEngine.playSe('menu_select');
                      onSelectRecordForDetail(matchedRecord);
                    }
                  }}
                  className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold mx-1 transition-all ${
                    article.style === 'encyclopedia'
                      ? 'bg-[#E0E7FF] text-[#3730A3] hover:bg-[#C7D2FE] underline'
                      : article.style === 'scp'
                      ? 'bg-[#0E2A3A] text-[#06B6D4] hover:bg-[#153E54] border border-[#06B6D4]/40'
                      : 'bg-[#78350F]/40 text-[#FDE68A] hover:bg-[#78350F]/60 border border-[#D97706]/40'
                  }`}
                  title="クリックして探索記録の詳細を開く"
                >
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{locationTitle}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70 shrink-0" />
                </button>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-24 md:pb-10">
      {/* Top Style Switcher & Back Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F172A] p-3 rounded-lg border border-[#1E293B]">
        {/* Back Step */}
        <button
          id="btn-back-to-wiki-top"
          type="button"
          onClick={() => {
            soundEngine.playSe('menu_back');
            onBackToWikiList();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-game text-[#94A3B8] hover:text-[#F59E0B] hover:bg-[#161F30] border border-[#334155] transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4 text-[#F59E0B]" />
          <span>編纂官一覧に戻る</span>
        </button>

        {/* 3 Styles Quick Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {npcs.map((npc) => {
            const isActive = article.style === npc.style;
            return (
              <button
                key={npc.id}
                type="button"
                onClick={() => {
                  soundEngine.playSe('tab_switch');
                  onSwitchStyle(npc.style);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-game transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#06B6D4] text-[#0B1018] font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'bg-[#161F30] text-[#94A3B8] hover:text-[#E2E8F0] border border-[#334155]'
                }`}
              >
                <img
                  src={npc.avatar}
                  alt=""
                  className="w-4 h-4 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <span>{npc.shortStyleName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* NPC Dialogue Header Frame */}
      <div className="bg-[#0F172A] border border-[#1E293B] rounded-lg p-3 sm:p-4 flex items-center gap-3.5 hud-bracket">
        <img
          src={activeNpc.avatar}
          alt={activeNpc.name}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border-2 border-[#06B6D4]/60 shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#06B6D4] font-bold">
              {activeNpc.name}
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              ({activeNpc.role})
            </span>
          </div>
          <p className="text-xs text-[#E2E8F0] font-jp italic mt-0.5 leading-relaxed">
            {activeNpc.finishedQuote}
          </p>
        </div>
      </div>

      {/* MAIN ARTICLE PAPER CONTAINER (Style specific styling) */}
      <article
        id="wiki-article-container"
        className={`rounded-xl shadow-2xl p-4 sm:p-8 transition-all overflow-hidden ${
          article.style === 'encyclopedia'
            ? 'bg-[#F8FAFC] text-[#0F172A] border-2 border-[#CBD5E1]' // Iconic White Wikipedia Paper
            : article.style === 'scp'
            ? 'bg-[#0B141E] text-[#E2E8F0] border-2 border-[#06B6D4]/60 hud-scanlines' // Dark Cyan Classified Archive
            : 'bg-[#1C140E] text-[#FEF3C7] border-2 border-[#D97706]/60' // Ancient Amber Lore Scroll
        }`}
      >
        {/* Article Title & Subtitle */}
        <div
          className={`pb-4 mb-6 border-b ${
            article.style === 'encyclopedia'
              ? 'border-[#E2E8F0]'
              : article.style === 'scp'
              ? 'border-[#06B6D4]/30'
              : 'border-[#D97706]/30'
          }`}
        >
          <div
            className={`text-xs font-mono mb-1 tracking-widest uppercase ${
              article.style === 'encyclopedia'
                ? 'text-[#64748B]'
                : article.style === 'scp'
                ? 'text-[#06B6D4]'
                : 'text-[#F59E0B]'
            }`}
          >
            {article.subtitle}
          </div>

          <h1
            className={`text-xl sm:text-2xl font-bold tracking-tight ${
              article.style === 'encyclopedia'
                ? 'font-jp text-[#0F172A]'
                : article.style === 'scp'
                ? 'font-mono text-[#38BDF8]'
                : 'font-jp text-[#FDE68A]'
            }`}
          >
            {article.title}
          </h1>

          <div className="text-[11px] font-mono opacity-60 mt-1">
            GENERATED: {article.generatedAt} // WORLD ARCHIVE V3
          </div>
        </div>

        {/* Infobox & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Summary Lead Paragraph */}
          <div className="lg:col-span-8">
            <p
              className={`text-sm sm:text-base leading-relaxed font-jp ${
                article.style === 'encyclopedia'
                  ? 'text-[#1E293B]'
                  : article.style === 'scp'
                  ? 'text-[#E2E8F0]'
                  : 'text-[#FEF3C7]'
              }`}
            >
              {article.summary}
            </p>
          </div>

          {/* Key Stats Infobox Table (Wikipedia Side Infobox) */}
          <div
            className={`lg:col-span-4 p-3.5 rounded-lg border text-xs ${
              article.style === 'encyclopedia'
                ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#334155]'
                : article.style === 'scp'
                ? 'bg-[#0E2030] border-[#06B6D4]/40 text-[#94A3B8]'
                : 'bg-[#2A1C12] border-[#D97706]/40 text-[#FDE68A]'
            }`}
          >
            {article.photoUrls && article.photoUrls[0] && (
              <div className="mb-3 rounded overflow-hidden border border-black/10">
                <img
                  src={article.photoUrls[0]}
                  alt="Key Subject"
                  className="w-full aspect-video object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="font-bold font-mono text-[11px] mb-2 pb-1 border-b border-current/20">
              基本探索データ // METRICS
            </div>

            <dl className="space-y-1.5">
              {article.keyStats.map((stat, idx) => (
                <div key={idx} className="flex justify-between gap-2">
                  <dt className="opacity-70 font-mono">{stat.label}</dt>
                  <dd className="font-semibold text-right font-mono">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Markdown Body Content with Clickable Record Citations */}
        <div className="prose max-w-none">
          {renderInteractiveMarkdown(article.contentMarkdown)}
        </div>
      </article>

      {/* Delete / Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="p-4 bg-[#2A1218] border border-[#EF4444]/60 rounded-xl space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-game text-[#EF4444] font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>この流派（{activeNpc.shortStyleName}）の編纂記事をリセットしますか？</span>
          </div>
          <p className="text-xs text-[#94A3B8] font-jp">
            記事は削除され、再度NPCから新規編纂できるようになります。（探索記録自体は削除されません）
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded text-xs font-game text-[#94A3B8] hover:bg-[#1E293B]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-[#FFFFFF] font-game text-xs font-bold"
            >
              リセットを実行
            </button>
          </div>
        </div>
      )}

      {/* Bottom Article Actions Bar (Copy / Share / Reset) - Compact on mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#0F172A] p-2.5 sm:p-3.5 rounded-xl border border-[#1E293B]">
        {/* Safe isolated Danger Reset action */}
        <button
          id="btn-reset-wiki-article"
          type="button"
          onClick={() => {
            soundEngine.playSe('menu_cursor');
            setShowResetConfirm(true);
          }}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 sm:py-2 rounded text-xs font-game text-[#64748B] hover:text-[#EF4444] hover:bg-[#2A161C] border border-transparent hover:border-[#EF4444]/40 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>この記事をリセット</span>
        </button>

        {/* Copy & Share actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            id="btn-copy-wiki-article"
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded bg-[#161F30] hover:bg-[#1E293B] border border-[#334155] text-xs font-game text-[#F8FAFC] transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[#10B981]">コピー完了</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>本文をコピー</span>
              </>
            )}
          </button>

          <button
            id="btn-share-wiki-article"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_select');
              const text = `【Survival Wiki】『${article.title}』をAI編纂しました！\n#SurvivalWiki #冒険の書`;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_10px_rgba(6,182,212,0.3)] active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>記事を共有</span>
          </button>
        </div>
      </div>
    </div>
  );
};
