import React from 'react';
import { X, Printer, Share2, ArrowLeft, Shield, Sparkles, BookOpen, Quote } from 'lucide-react';
import { WikiArticle } from '../../types';

interface WikiArticleModalProps {
  article: WikiArticle | null;
  onClose: () => void;
  onShare?: (article: WikiArticle) => void;
}

export const WikiArticleModal: React.FC<WikiArticleModalProps> = ({
  article,
  onClose,
  onShare,
}) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* SFC Window Shell Container */}
      <div className="sfc-window w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* SFC Console Shell Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full sfc-led-red" />
            <span className="font-dot text-xs font-bold text-[var(--text-main)]">
              WIKI ARCHIVE READER // {article.period_label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-a px-2.5 py-1 text-xs font-dot flex items-center gap-1"
              title="閉じる"
            >
              <X className="w-3.5 h-3.5" />
              <span>閉じる (CLOSE)</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body with Persona-Specific Styling */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 bg-white text-slate-900">
          {/* Persona Style 1: Wikipedia Encyclopedia (Hernan) */}
          {article.compiler_style === 'wikipedia' && (
            <div className="space-y-6 font-serif max-w-3xl mx-auto">
              <div className="border-b border-slate-300 pb-4">
                <div className="text-xs font-sans text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-sans font-bold">
                    公認学術録
                  </span>
                  <span>編纂官: {article.compiler_name}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold font-sans text-slate-900 leading-tight">
                  {article.title}
                </h1>
                <p className="text-sm font-sans text-slate-600 mt-1 italic">
                  {article.subtitle}
                </p>
              </div>

              {/* Lead paragraph */}
              <div className="bg-slate-50 p-4 rounded border-l-4 border-slate-700 text-sm leading-relaxed">
                <p>{article.lead_text}</p>
              </div>

              {/* Sections */}
              <div className="space-y-6 font-sans">
                {article.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-1">
                      {section.heading}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {section.body}
                    </p>
                    {section.quote && (
                      <blockquote className="pl-4 border-l-2 border-slate-400 text-xs text-slate-600 italic my-2">
                        {section.quote}
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>

              {/* Verdict */}
              {article.verdict_or_classification && (
                <div className="mt-8 p-3 rounded bg-slate-100 border border-slate-300 text-xs font-sans font-bold text-slate-800">
                  {article.verdict_or_classification}
                </div>
              )}
            </div>
          )}

          {/* Persona Style 2: SCP Classified Dossier (Dr. Ark) */}
          {article.compiler_style === 'scp' && (
            <div className="space-y-6 font-mono max-w-3xl mx-auto bg-slate-950 text-emerald-400 p-6 rounded-lg border-2 border-emerald-600 shadow-2xl">
              <div className="border-b-2 border-emerald-600 pb-4 text-center">
                <div className="inline-block bg-red-900/80 text-red-200 border border-red-500 px-3 py-1 text-xs font-bold tracking-widest uppercase mb-2">
                  TOP SECRET // CLASSIFIED LEVEL 4
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-emerald-300">
                  {article.title}
                </h1>
                <p className="text-xs text-emerald-500 mt-1">
                  特別監査責任者: {article.compiler_name}
                </p>
              </div>

              {/* Lead text */}
              <div className="bg-emerald-950/40 p-4 rounded border border-emerald-700 text-xs sm:text-sm text-emerald-300 leading-relaxed">
                <p>{article.lead_text}</p>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {article.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-emerald-400 border-b border-emerald-800 pb-1 uppercase tracking-wider">
                      ▶ {section.heading}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-sans">
                      {section.body}
                    </p>
                    {section.quote && (
                      <div className="bg-black/60 p-2.5 rounded border-l-2 border-emerald-500 text-xs text-emerald-300 italic font-mono">
                        {section.quote}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Classification */}
              {article.verdict_or_classification && (
                <div className="p-3 bg-red-950/60 border border-red-600 rounded text-center text-xs font-bold text-red-300">
                  {article.verdict_or_classification}
                </div>
              )}
            </div>
          )}

          {/* Persona Style 3: Madame Rose Wilderness Tabloid */}
          {article.compiler_style === 'ancient' && (
            <div className="space-y-6 font-serif max-w-3xl mx-auto bg-amber-50/50 p-6 rounded border-2 border-amber-300 text-amber-950">
              <div className="text-center border-b-2 border-amber-400 pb-4">
                <span className="text-xs font-sans tracking-widest text-amber-700 uppercase font-bold">
                  荒野の吟遊詩人・マダム・ロゼの叙事詩
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-900 mt-2 leading-tight">
                  {article.title}
                </h1>
                <p className="text-sm text-amber-800 italic mt-1 font-sans">
                  {article.subtitle}
                </p>
              </div>

              {/* Lead text */}
              <div className="bg-amber-100/60 p-4 rounded-lg border border-amber-300 text-sm leading-relaxed text-amber-900 italic">
                <Quote className="w-5 h-5 text-amber-600 mb-1 opacity-60" />
                <p>{article.lead_text}</p>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {article.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-lg font-bold text-amber-900 border-b border-amber-300 pb-1">
                      {section.heading}
                    </h3>
                    <p className="text-sm text-amber-950 leading-relaxed font-sans">
                      {section.body}
                    </p>
                    {section.quote && (
                      <div className="bg-amber-200/40 p-3 rounded-r-lg border-l-4 border-amber-600 text-xs font-bold text-amber-900 italic">
                        {section.quote}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Verdict */}
              {article.verdict_or_classification && (
                <div className="p-3 bg-amber-200 rounded border border-amber-400 text-center text-xs font-bold text-amber-900">
                  {article.verdict_or_classification}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SFC Footer Navigation */}
        <div className="bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] px-4 py-2.5 flex items-center justify-between text-xs font-dot">
          <span className="text-[var(--text-muted)]">
            RECORDED AT: {article.generated_at}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-1.5 font-bold"
          >
            戻る (BACK)
          </button>
        </div>
      </div>
    </div>
  );
};
