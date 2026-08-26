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
    <div className={`wiki-markdown-body space-y-4 text-xs sm:text-sm leading-relaxed ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-black text-[#ffb000] border-b-2 border-[#ffb000]/40 pb-2 mb-4 tracking-wide font-mono flex items-center gap-2">
              <span className="text-[#32cd32]">#</span>
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold text-[#ffb000] border-l-4 border-[#ffb000] pl-3 my-4 tracking-wide font-mono bg-[#1a2333]/30 py-1 rounded-r-sm">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-[#32cd32] my-3 tracking-wide font-mono flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#ffb000]" />
              <span>{children}</span>
            </h3>
          ),
          p: ({ children }) => <p className="text-zinc-200 leading-6 sm:leading-7 my-2.5 font-mono">{children}</p>,
          ul: ({ children }) => <ul className="space-y-1.5 my-3 pl-4 list-disc list-inside text-zinc-300 font-mono">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1.5 my-3 pl-4 list-decimal list-inside text-zinc-300 font-mono">{children}</ol>,
          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-4 border-[#ffb000] bg-[#070c18] p-3 sm:p-4 rounded-r-sm text-amber-200/90 font-serif italic shadow-inner">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="px-1.5 py-0.5 rounded-sm bg-[#10192d] border border-[#334155] text-[#32cd32] text-xs font-mono">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="p-3 sm:p-4 rounded-sm bg-[#050a14] border border-[#1a2333] overflow-x-auto text-xs text-[#32cd32] font-mono my-3">
              {children}
            </pre>
          ),
          hr: () => <hr className="my-5 border-t border-[#1a2333]" />,
          img: ({ src, alt }) => (
            <div className="my-4 rounded-sm overflow-hidden border-2 border-[#334155] bg-[#050a14] shadow-lg max-w-lg mx-auto">
              <img src={src} alt={alt || 'Wiki Archive Photo'} className="w-full h-56 object-cover" />
              {alt && <div className="p-2 text-center text-[10px] text-zinc-400 font-mono bg-[#0d1627] border-t border-[#1a2333]">{alt}</div>}
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse border border-[#1a2333] text-xs font-mono">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-[#1a2333] border border-[#334155] p-2 text-left text-[#ffb000] font-bold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="border border-[#1a2333] p-2 bg-[#0d1627] text-zinc-300">{children}</td>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>

      {locationLinks.length > 0 && (
        <div className="mt-6 pt-4 border-t border-[#1a2333]">
          <div className="text-xs font-bold text-[#ffb000] font-mono mb-2 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>本文に登場する拠点・ロケーション一覧:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {locationLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={link.onClick}
                className="px-2.5 py-1 rounded-sm bg-[#10192d] border border-[#334155] text-sky-400 text-xs font-mono hover:border-[#ffb000] hover:text-[#ffb000] transition-colors"
              >
                📍 {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
