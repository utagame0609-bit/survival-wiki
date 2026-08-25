import React from 'react';

export function MarkdownRenderer({
  content,
  locationLinks = [],
  className = ''
}: {
  content: string;
  locationLinks?: { name: string; onClick: () => void }[];
  className?: string;
}) {
  if (!content) return null;

  // Split by markdown lines
  const lines = content.split('\n');

  return (
    <div className={`space-y-4 text-inherit leading-relaxed ${className}`}>
      {lines.map((line, idx) => {
        // Photo marker replacement
        if (line.includes('<!--WIKI_PHOTO:')) {
          const match = line.match(/<!--WIKI_PHOTO:(.*?)-->/);
          if (match && match[1]) {
            return (
              <div key={idx} className="my-5 p-1.5 rounded-sm border-2 border-[#334155] bg-[#050a14] shadow-md">
                <img
                  src={match[1]}
                  alt="観測記録写真"
                  className="w-full max-h-72 object-cover rounded-sm"
                />
                <div className="text-[10px] text-center text-zinc-400 font-mono py-1.5 flex items-center justify-center gap-1.5">
                  <span className="text-[#ffb000]">◆</span>
                  <span>【冒険の書：添付観測記録写真】</span>
                </div>
              </div>
            );
          }
        }

        // H1 Title
        if (line.startsWith('# ')) {
          return (
            <div key={idx} className="pb-3 pt-1 border-b-2 border-[#ffb000] mb-4">
              <h1 className="text-xl sm:text-2xl font-bold tracking-wide font-dot text-[#ffb000] flex items-center gap-2">
                <span className="text-sm font-mono px-1.5 py-0.5 bg-[#ffb000]/10 border border-[#ffb000]/40 rounded-sm">章</span>
                <span>{line.replace('# ', '')}</span>
              </h1>
            </div>
          );
        }

        // H2 Title
        if (line.startsWith('## ')) {
          return (
            <h2
              key={idx}
              className="text-base sm:text-lg font-bold mt-6 pb-1.5 border-b border-[#1a2333] tracking-wide font-dot text-[#ffb000] flex items-center gap-2"
            >
              <span className="text-[#ffb000] text-xs">◆</span>
              <span>{line.replace('## ', '')}</span>
            </h2>
          );
        }

        // H3 Title
        if (line.startsWith('### ')) {
          const locName = line.replace('### ', '');
          const matchingLink = locationLinks.find((l) => locName.includes(l.name));
          return (
            <h3
              key={idx}
              className="text-sm sm:text-base font-bold mt-4 text-[#32cd32] font-dot flex items-center justify-between gap-2 bg-[#050a14] p-2.5 rounded-sm border border-[#1a2333]"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-[#ffb000]">▸</span>
                <span className="truncate">{locName}</span>
              </div>
              {matchingLink && (
                <button
                  type="button"
                  onClick={matchingLink.onClick}
                  className="command-btn shrink-0 text-[11px] px-2.5 py-1 rounded-sm bg-[#1a2333] border border-[#32cd32]/50 text-[#32cd32] hover:bg-[#32cd32] hover:text-[#0a1120] font-mono font-bold transition-colors flex items-center gap-1"
                >
                  <span>拠点記録</span>
                  <span>▶</span>
                </button>
              )}
            </h3>
          );
        }

        // Bullet point
        if (line.startsWith('* ') || line.startsWith('- ')) {
          const itemText = line.substring(2);
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 text-xs sm:text-sm">
              <span className="text-[#ffb000] mt-1 font-mono text-xs">▸</span>
              <span className="text-zinc-300">{renderFormattedText(itemText, locationLinks)}</span>
            </div>
          );
        }

        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        // Normal paragraph
        return (
          <p key={idx} className="text-xs sm:text-sm leading-relaxed text-zinc-300">
            {renderFormattedText(line, locationLinks)}
          </p>
        );
      })}
    </div>
  );
}

function renderFormattedText(
  text: string,
  locationLinks: { name: string; onClick: () => void }[]
) {
  // Bold formatting **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldContent = part.slice(2, -2);
      return (
        <strong key={i} className="font-bold text-[#ffb000]">
          {boldContent}
        </strong>
      );
    }
    return part;
  });
}
