import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MapPin, Compass } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  locationLinks?: { name: string; onClick: () => void }[];
  className?: string;
}

export function MarkdownRenderer({ content, locationLinks = [], className = '' }: MarkdownRendererProps) {
  // Replace photo markers with markdown images if present
  const processedContent = content.replace(/<!--WIKI_PHOTO:(.*?)-->/g, '![]($1)');

  return (
    <div className={`wiki-markdown-body space-y-4 text-xs sm:text-sm leading-relaxed font-sans ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black text-amber-400 border-b-2 border-amber-500/40 pb-2 mb-4 tracking-wide font-sans flex items-center gap-2">
              <span className="text-emerald-400">#</span>
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-amber-300 border-l-4 border-amber-500 pl-3 my-4 tracking-wide font-sans bg-[#141824] py-1.5 border border-l-0 border-[#2d3548]">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-emerald-300 my-3 tracking-wide font-sans flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => <p className="text-slate-100 leading-6 sm:leading-7 my-2.5">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1.5 my-3 pl-4 list-disc list-inside text-slate-200">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1.5 my-3 pl-4 list-decimal list-inside text-slate-200">{children}</ol>,
          li: ({ children }) => <li className="text-slate-200 leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-amber-500 bg-[#141824] p-3 sm:p-4 text-amber-200 border border-l-0 border-[#2d3548] leading-relaxed shadow-inner">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-[#12151f] border border-slate-700 text-emerald-300 text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 sm:p-4 bg-[#12151f] border border-[#2d3548] overflow-x-auto text-xs text-emerald-300 font-mono my-3 leading-relaxed">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-5 border-t-2 border-[#2d3548]" />,
          img: ({ src, alt }) => (
            <div className="my-4 overflow-hidden border-2 border-[#2d3548] bg-[#12151f] shadow-lg max-w-lg mx-auto">
              <img src={src} alt={alt || 'Wiki Archive Photo'} className="w-full h-56 sm:h-64 object-cover" />
              {alt && <div className="p-2 text-center text-xs text-slate-300 font-mono bg-[#141824] border-t border-[#2d3548]">{alt}</div>}
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-[#2d3548] text-xs sm:text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[#141824] border border-[#2d3548] p-2.5 text-left text-amber-400 font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-[#2d3548] p-2.5 bg-[#1e2330] text-slate-200">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {locationLinks.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-[#2d3548]">
          <div className="text-xs sm:text-sm font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>本文に登場する拠点・ロケーション一覧:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {locationLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={link.onClick}
                className="min-h-[38px] px-3 py-1.5 bg-[#141824] border border-cyan-500/50 text-cyan-300 hover:border-amber-400 hover:text-amber-300 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📍</span>
                <span>{link.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
