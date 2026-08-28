import React from 'react';
import ReactMarkdown from 'react-markdown';
import { LocationWithPhotos } from '../types';

interface MarkdownRendererProps {
  content: string;
  locations?: LocationWithPhotos[];
  onSelectLocation?: (loc: LocationWithPhotos) => void;
}

export function MarkdownRenderer({ content, locations, onSelectLocation }: MarkdownRendererProps) {
  return (
    <div className="wiki-markdown-container text-slate-200 text-xs sm:text-sm leading-relaxed space-y-4 font-sans selection:bg-amber-500 selection:text-black">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-2xl font-black text-amber-400 border-b-2 border-amber-500/60 pb-2 mb-4 tracking-wide font-mono">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-lg font-bold text-white border-l-4 border-amber-400 pl-3 py-0.5 mt-6 mb-3 bg-[#131824]/60">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs sm:text-base font-bold text-cyan-300 mt-4 mb-2 flex items-center gap-1.5 font-mono">
              <span className="text-amber-400">▶</span> {children}
            </h3>
          ),
          p: ({ children }) => <p className="leading-relaxed mb-3 text-slate-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1.5 mb-3 text-slate-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-slate-300">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-slate-600 bg-[#121622] pl-4 py-2 my-3 text-slate-400 italic rounded-xs font-mono text-xs">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-t border-slate-800 my-4" />,
          strong: ({ children }) => <strong className="font-bold text-amber-300">{children}</strong>,
          em: ({ children }) => <em className="text-cyan-200 italic">{children}</em>,
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 bg-black/60 text-emerald-400 border border-slate-700 font-mono text-xs">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
