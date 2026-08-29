import React, { useState } from 'react';
import { WikiNpc, WikiArticle } from '../../types';
import { Sparkles, ScrollText, CheckCircle2, BookOpen, AlertCircle, ArrowRight, Play } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface WikiTopViewProps {
  npcs: WikiNpc[];
  savedArticles: Record<string, WikiArticle>;
  recordsCount: number;
  onSelectNpcToCompile: (npc: WikiNpc) => void;
  onReadArticle: (article: WikiArticle) => void;
}

export const WikiTopView: React.FC<WikiTopViewProps> = ({
  npcs,
  savedArticles,
  recordsCount,
  onSelectNpcToCompile,
  onReadArticle,
}) => {
  const [selectedNpcId, setSelectedNpcId] = useState<string>(npcs[0]?.id || 'hernan');
  const activeNpc = npcs.find((n) => n.id === selectedNpcId) || npcs[0];

  const savedCount = Object.keys(savedArticles).length;
  const isSelectedSaved = !!savedArticles[`world-1_${activeNpc.style}`];

  const handleNpcClick = (npc: WikiNpc) => {
    soundEngine.playSe('wiki_npc_select');
    setSelectedNpcId(npc.id);
  };

  const handleActionClick = () => {
    const existingArticle = savedArticles[`world-1_${activeNpc.style}`];
    if (existingArticle) {
      soundEngine.playSe('menu_select');
      onReadArticle(existingArticle);
    } else {
      soundEngine.playSe('save_record');
      onSelectNpcToCompile(activeNpc);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      {/* Title & Compilation Intro Header */}
      <div className="bg-[#0F172A]/80 border border-[#1E293B] rounded-lg p-4 sm:p-5 relative overflow-hidden hud-bracket-cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-[#06B6D4] tracking-widest uppercase flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5" />
              <span>AI CHRONICLE COMPILER // 旅の書 (WIKI)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-game font-bold text-[#F8FAFC] tracking-wider mt-1">
              冒険譚・年代記 自動編纂
            </h2>
            <p className="text-xs text-[#94A3B8] font-jp mt-1 max-w-xl leading-relaxed">
              蓄積された日々の探索記録をもとに、3名の編纂官がそれぞれの世界観・流派で本格的な百科事典記事を自動執筆します。
            </p>
          </div>

          {/* Saved Articles Progress Badge */}
          <div className="shrink-0 bg-[#0B1018] px-3.5 py-2 rounded-lg border border-[#334155] flex sm:flex-col items-center justify-between gap-2 sm:gap-1 text-center">
            <span className="text-[10px] font-mono text-[#64748B]">保存済み記事</span>
            <div className="text-sm font-mono font-bold text-[#06B6D4]">
              {savedCount} / {npcs.length} STYLES
            </div>
          </div>
        </div>
      </div>

      {/* 3 NPC Cards Showcase (Clean 3-column layout on PC, responsive readable grid on mobile without cutoffs) */}
      <div>
        <div className="text-xs font-game text-[#94A3B8] mb-2.5 flex items-center justify-between">
          <span>編纂官（3つのスタイル）を選択</span>
          <span className="text-[10px] font-mono text-[#64748B]">
            タップで切り替え
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {npcs.map((npc) => {
            const isSelected = selectedNpcId === npc.id;
            const hasArticle = !!savedArticles[`world-1_${npc.style}`];

            return (
              <button
                key={npc.id}
                id={`npc-card-${npc.id}`}
                type="button"
                onClick={() => handleNpcClick(npc)}
                className={`relative flex flex-col items-center text-center p-2.5 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#132238] border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]'
                    : 'bg-[#0F172A]/80 border-[#1E293B] hover:border-[#334155] opacity-80 hover:opacity-100'
                }`}
              >
                {/* Saved state badge */}
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                  {hasArticle ? (
                    <span className="flex items-center gap-0.5 px-1 sm:px-1.5 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[8px] sm:text-[10px] font-mono border border-[#10B981]/40">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span className="hidden sm:inline">保存済</span>
                    </span>
                  ) : (
                    <span className="px-1 sm:px-1.5 py-0.5 rounded bg-[#1E293B] text-[#64748B] text-[8px] sm:text-[9px] font-mono">
                      未編纂
                    </span>
                  )}
                </div>

                {/* Avatar Portrait */}
                <div className="relative w-12 h-12 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 mb-2 sm:mb-3 mt-1 shrink-0 transition-all border-[#334155] group-hover:border-[#06B6D4]">
                  <img
                    src={npc.avatar}
                    alt={npc.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Primary Style Pill (Prominent on mobile and desktop) */}
                <span className="px-2 py-0.5 rounded bg-[#0B1018] text-[#06B6D4] text-[11px] sm:text-xs font-game font-bold border border-[#06B6D4]/30 whitespace-nowrap mb-0.5 sm:mb-1">
                  {npc.shortStyleName}
                </span>

                {/* NPC Name (Clean display, full name/role detailed below when selected) */}
                <h4 className="text-[11px] sm:text-sm font-game font-bold text-[#F8FAFC] line-clamp-1">
                  {npc.name}
                </h4>

                {/* Role subtitle (visible on PC) */}
                <p className="text-[10px] font-jp text-[#64748B] line-clamp-1 mt-0.5 hidden sm:block">
                  {npc.role}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected NPC Active Dossier Card */}
      {activeNpc && (
        <div className="bg-[#0F172A] border border-[#1E293B] rounded-xl p-4 sm:p-5 space-y-4 hud-bracket">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* NPC Greeting & Lore */}
            <div className="flex items-start gap-3.5 min-w-0 flex-1">
              <img
                src={activeNpc.avatar}
                alt={activeNpc.name}
                className="w-14 h-14 rounded-lg object-cover border-2 border-[#06B6D4]/60 shrink-0"
                referrerPolicy="no-referrer"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#06B6D4] font-bold">
                    {activeNpc.role}
                  </span>
                  <span className="text-[10px] font-mono text-[#64748B]">
                    // {activeNpc.title}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-game font-bold text-[#F8FAFC] mt-0.5">
                  {activeNpc.name}
                </h3>

                <p className="text-xs text-[#E2E8F0] font-jp italic mt-1.5 bg-[#0B1018]/80 p-2.5 rounded border border-[#1E293B] leading-relaxed">
                  {activeNpc.greeting}
                </p>
              </div>
            </div>
          </div>

          {/* Style Description & Layout Preview Note */}
          <div className="pt-2 border-t border-[#1E293B] text-xs font-jp text-[#94A3B8] leading-relaxed">
            <span className="text-[#F59E0B] font-game font-bold mr-1.5">【スタイル特徴】</span>
            {activeNpc.description}
          </div>

          {/* Compile or Read Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="text-[11px] font-mono text-[#64748B]">
              {recordsCount > 0 ? (
                <span>参照可能な探索ログ: {recordsCount} 件</span>
              ) : (
                <span className="text-[#EF4444] flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  記録が0件のため編纂できません
                </span>
              )}
            </div>

            <button
              id="btn-compile-or-read-wiki"
              type="button"
              disabled={recordsCount === 0}
              onClick={handleActionClick}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-game font-bold text-xs sm:text-sm tracking-wider transition-all shadow-lg active:scale-95 ${
                isSelectedSaved
                  ? 'bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B1018] shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] shadow-[0_0_15px_rgba(245,158,11,0.35)]'
              }`}
            >
              {isSelectedSaved ? (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>保存済み記事を読む（{activeNpc.shortStyleName}）</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>この流派でWikiを自動編纂する</span>
                  <Play className="w-3.5 h-3.5 fill-current" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
