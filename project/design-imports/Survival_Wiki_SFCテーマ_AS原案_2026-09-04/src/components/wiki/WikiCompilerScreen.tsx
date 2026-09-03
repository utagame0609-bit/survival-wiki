import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Scroll,
  Shield,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  BookMarked,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { WikiCompiler, WikiCompilerStyle, WikiScope, WikiArticle, World } from '../../types';

interface WikiCompilerScreenProps {
  world: World;
  compilers: WikiCompiler[];
  savedArticles: Record<string, WikiArticle>;
  onGenerateArticle: (style: WikiCompilerStyle, scope: WikiScope, periodLabel: string) => void;
  onReadArticle: (article: WikiArticle) => void;
  isGenerating: boolean;
}

export const WikiCompilerScreen: React.FC<WikiCompilerScreenProps> = ({
  world,
  compilers,
  savedArticles,
  onGenerateArticle,
  onReadArticle,
  isGenerating,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<WikiCompilerStyle>('wikipedia');
  const [selectedScope, setSelectedScope] = useState<WikiScope>('month');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026年8月期');

  const activeCompiler = compilers.find((c) => c.id === selectedStyle) || compilers[0];

  const currentArticleKey = `${world.id}-${selectedStyle}-${selectedScope}`;
  const existingArticle = savedArticles[currentArticleKey];

  const handleExecuteCompile = () => {
    onGenerateArticle(selectedStyle, selectedScope, selectedPeriod);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: AI Wiki Compiler HUD */}
      <div className="sfc-panel p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute inset-0 sfc-scanlines pointer-events-none opacity-40" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] flex items-center justify-center shadow-inner">
              <Scroll className="w-6 h-6 text-[var(--accent-blue)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-[var(--accent-blue)] text-white text-[10px] font-dot px-2 py-0.5 rounded font-bold">
                  AI WIKI CHRONICLE
                </span>
                <span className="font-dot text-xs text-[var(--text-muted)] font-bold">
                  旅の書・編纂室
                </span>
              </div>
              <h2 className="font-sfc-title text-base sm:text-xl font-bold text-[var(--text-main)] mt-0.5">
                冒険記録の知能体系化・自動編纂エンジン
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-dot text-xs">
            <div className="px-3 py-1.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] shadow-inner flex items-center gap-2">
              <span className="w-2 h-2 rounded-full sfc-led-green" />
              <span>LOGS READY: <strong>{world.recordsCount} RECORDS</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Compiler Setup Grid: 3-Step Game Command Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step 1: Select Compiler Persona (3 Compilers) */}
        <div className="lg:col-span-12 space-y-3">
          <div className="flex items-center gap-2 px-1">
            <span className="w-3 h-3 rounded-full bg-[var(--accent-blue)] text-white text-[9px] font-dot flex items-center justify-center font-bold">
              1
            </span>
            <h3 className="font-dot text-sm font-bold tracking-wider text-[var(--text-main)]">
              編纂官（ペルソナ）を選択 (SELECT COMPILER PERSONA)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {compilers.map((compiler) => {
              const isSelected = selectedStyle === compiler.id;
              return (
                <div
                  key={compiler.id}
                  onClick={() => setSelectedStyle(compiler.id)}
                  className={`sfc-panel p-4 cursor-pointer transition-all duration-150 relative ${
                    isSelected
                      ? 'ring-3 ring-[var(--accent-blue)] scale-[1.02] shadow-lg'
                      : 'hover:border-[var(--border-dark)] opacity-85 hover:opacity-100'
                  }`}
                >
                  {/* Selected Cursor Badge */}
                  {isSelected && (
                    <div className="absolute -top-2.5 right-3 bg-[var(--accent-blue)] text-white text-[10px] font-dot px-2 py-0.5 rounded shadow flex items-center gap-1 font-bold">
                      <span>▶ SELECTED</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-[var(--border-dark)] shadow bg-black shrink-0">
                        <img
                          src={compiler.avatarUrl}
                          alt={compiler.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span
                          className="text-[10px] font-dot px-2 py-0.5 rounded text-white font-bold inline-block mb-1"
                          style={{ backgroundColor: compiler.badgeColor }}
                        >
                          {compiler.title}
                        </span>
                        <h4 className="font-dot text-sm font-bold text-[var(--text-main)]">
                          {compiler.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-[var(--text-main)] bg-[var(--surface-label)] p-2.5 rounded border border-[var(--border-main)] leading-relaxed shadow-inner">
                      {compiler.description}
                    </p>

                    <div className="p-2 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-[11px] text-[var(--text-muted)] italic">
                      {compiler.sampleTone}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Scope & Period (Game Command Matrix) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="sfc-panel p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-main)] pb-2">
              <span className="w-3 h-3 rounded-full bg-[var(--accent-yellow)] text-black text-[9px] font-dot flex items-center justify-center font-bold">
                2
              </span>
              <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
                編纂範囲・対象期間の選定 (COMMAND PARAMETERS)
              </h3>
            </div>

            {/* Scope Selection (Command Buttons) */}
            <div className="space-y-2">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                【編纂スコープ】
              </label>
              <div className="grid grid-cols-3 gap-2 font-dot">
                <button
                  type="button"
                  onClick={() => setSelectedScope('month')}
                  className={`p-2.5 rounded text-xs text-center border-2 transition-all ${
                    selectedScope === 'month'
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--border-dark)] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]'
                      : 'bg-[var(--surface-recessed)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--surface-1)]'
                  }`}
                >
                  <span className="block font-bold">月刊記録</span>
                  <span className="text-[10px] opacity-80">MONTHLY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScope('year')}
                  className={`p-2.5 rounded text-xs text-center border-2 transition-all ${
                    selectedScope === 'year'
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--border-dark)] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]'
                      : 'bg-[var(--surface-recessed)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--surface-1)]'
                  }`}
                >
                  <span className="block font-bold">年間記録</span>
                  <span className="text-[10px] opacity-80">YEARLY</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedScope('world')}
                  className={`p-2.5 rounded text-xs text-center border-2 transition-all ${
                    selectedScope === 'world'
                      ? 'bg-[var(--accent-blue)] text-white border-[var(--border-dark)] shadow-[inset_1px_1px_2px_rgba(255,255,255,0.4)]'
                      : 'bg-[var(--surface-recessed)] text-[var(--text-main)] border-[var(--border-main)] hover:bg-[var(--surface-1)]'
                  }`}
                >
                  <span className="block font-bold">ワールド史全記</span>
                  <span className="text-[10px] opacity-80">WORLD CHRONICLE</span>
                </button>
              </div>
            </div>

            {/* Target Period Selector */}
            <div className="space-y-2">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                【対象期間ラベル】
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full p-2.5 rounded bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] text-xs font-dot text-[var(--text-main)] focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
              >
                <option value="2026年8月期">2026年8月期（オロチ砦防衛・開拓月）</option>
                <option value="2026年7月期">2026年7月期（初期探査月）</option>
                <option value="2026年度通年">2026年度（創世第壱期通年）</option>
                <option value="全期間（創世記〜現在）">全期間（創世記〜現在）</option>
              </select>
            </div>

            {/* Action Command Buttons */}
            <div className="pt-3 border-t border-[var(--border-groove)] flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleExecuteCompile}
                disabled={isGenerating}
                className="sfc-btn sfc-btn-convex sfc-btn-b px-5 py-3 text-sm font-dot flex-1 flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>AI編纂中 (COMPILING...)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>編纂を実行 (EXECUTE COMPILE)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: Current Compiled Article Status / Reader Access */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sfc-panel p-5 space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-main)] pb-2">
                <span className="font-dot text-xs font-bold text-[var(--text-main)]">
                  ARCHIVE STATUS
                </span>
                <span className="font-dot text-[10px] text-[var(--text-muted)]">
                  1 PERSONA / 3 MAX
                </span>
              </div>

              {existingArticle ? (
                <div className="space-y-3 bg-[var(--surface-label)] p-3.5 rounded border border-[var(--border-main)] shadow-inner">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-green)]" />
                    <span className="font-dot text-xs text-[var(--accent-green)] font-bold">
                      編纂済み記事が保存されています
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-dot text-[var(--text-muted)] block">
                      {existingArticle.period_label}
                    </span>
                    <h4 className="font-dot text-sm font-bold text-[var(--text-main)] mt-0.5 line-clamp-2">
                      {existingArticle.title}
                    </h4>
                  </div>

                  <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                    {existingArticle.lead_text}
                  </p>

                  <button
                    type="button"
                    onClick={() => onReadArticle(existingArticle)}
                    className="sfc-btn sfc-btn-convex sfc-btn-x w-full py-2.5 text-xs font-dot flex items-center justify-center gap-2 shadow"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>記事を全画面で閲覧 (READ ARTICLE)</span>
                  </button>
                </div>
              ) : (
                <div className="p-6 text-center space-y-3 bg-[var(--surface-recessed)] rounded border border-dashed border-[var(--border-main)]">
                  <BookMarked className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-50" />
                  <p className="font-dot text-xs text-[var(--text-muted)] leading-relaxed">
                    現在選択されている条件（{activeCompiler.name} / {selectedScope === 'month' ? '月刊' : selectedScope === 'year' ? '年間' : '全記'}）の記事はまだ編纂されていません。
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    「編纂を実行」ボタンを押すとAIが記録をまとめ上げます。
                  </p>
                </div>
              )}
            </div>

            {/* Hint Box */}
            <div className="p-2.5 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] text-[10px] text-[var(--text-muted)] leading-relaxed">
              ※AI Wiki記事は3人格（エルナン/Dr.アーク/マダム・ロゼ）それぞれ固有の書式（百科事典/機密Dossier/荒野タブロイド）でレンダリングされます。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
