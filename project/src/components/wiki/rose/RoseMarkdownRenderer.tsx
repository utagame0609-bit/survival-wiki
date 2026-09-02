import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Camera, Edit3 } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';

type LocationLink = {
  name: string;
  onClick: () => void;
};

export type RoseResolvedPhoto = {
  id: string;
  url: string;
  alt: string;
  title: string;
};

type Props = {
  content: string;
  photos?: RoseResolvedPhoto[];
  locationLinks?: LocationLink[];
  onOpenPhoto?: (index: number) => void;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function inlineText(text: string, locationLinks: LocationLink[]): ReactNode[] {
  const locationNames = locationLinks.map((item) => item.name).filter(Boolean).sort((a, b) => b.length - a.length);
  const locationPattern = locationNames.length > 0 ? locationNames.map(escapeRegExp).join('|') : '(?!)';
  const parts = text.split(new RegExp(`(\\*\\*[^*]+\\*\\*|\`[^\`]+\`|${locationPattern})`, 'g'));

  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="border-b-2 border-[#6E1F2B] bg-[#6E1F2B]/15 px-1 py-0.5 font-black text-[#171315]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="border border-[#171315]/20 bg-[#171315]/10 px-1.5 py-0.5 font-mono text-xs font-bold text-[#6E1F2B]">{part.slice(1, -1)}</code>;
    }
    const location = locationLinks.find((item) => item.name === part);
    if (location) {
      return (
        <button
          key={index}
          type="button"
          onClick={location.onClick}
          onMouseEnter={playHoverSound}
          onFocus={playHoverSound}
          className="font-black text-[#6E1F2B] underline decoration-[#6E1F2B] underline-offset-2 hover:text-[#9A3D49]"
        >
          {part}
        </button>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

export function RoseMarkdownRenderer({ content, photos = [], locationLinks = [], onOpenPhoto }: Props) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let quoteLines: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      blocks.push(<p key={`p-${blocks.length}`} className="mb-4 text-left font-serif text-[15px] leading-[1.68] text-[#171315] sm:mb-5 sm:text-justify sm:text-[17.5px] sm:leading-[1.8]">{inlineText(text, locationLinks)}</p>);
    }
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`list-${blocks.length}`} className="my-4 space-y-2 pl-1 sm:my-5 sm:space-y-2.5 sm:pl-2">
        {listItems.map((item, index) => (
          <li key={index} className="flex items-start gap-2.5 font-serif text-[14.5px] leading-relaxed text-[#171315] sm:gap-3 sm:text-[16.5px]">
            <span className="mt-0.5 shrink-0 text-sm font-black text-[#6E1F2B]">×</span>
            <span className="min-w-0 flex-1 break-words">{inlineText(item, locationLinks)}</span>
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  const flushQuote = () => {
    if (quoteLines.length === 0) return;
    const text = quoteLines.join(' ').trim();
    blocks.push(
      <aside key={`quote-${blocks.length}`} aria-label="マダム・ロゼの赤鉛筆注釈" className="relative my-5 border-2 border-[#9A3D49]/50 border-l-4 border-l-[#6E1F2B] bg-black/5 p-3.5 shadow-sm sm:my-6 sm:p-5">
        <div className="mb-2 flex items-center gap-1.5 font-['Cinzel',serif] text-[11px] font-black uppercase tracking-wider text-[#6E1F2B] sm:gap-2 sm:text-xs">
          <Edit3 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span>ROSE'S RED PENCIL NOTE ❖ 赤鉛筆注釈</span>
        </div>
        <div className="font-serif text-[14px] italic leading-relaxed text-[#171315] sm:text-[16.5px]">{inlineText(text, locationLinks)}</div>
      </aside>,
    );
    quoteLines = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushAll();
      return;
    }

    const photoMatch = trimmed.match(/^<!--ROSE_PHOTO:(\d+)-->$/);
    if (photoMatch) {
      flushAll();
      const photoIndex = Number(photoMatch[1]) - 1;
      const photo = photos[photoIndex];
      if (!photo) return;
      blocks.push(
        <figure key={`photo-${index}`} className="my-6 border-2 border-[#171315] bg-[#D8C6A5] p-2.5 shadow-[3px_3px_0px_#171315] sm:my-7 sm:border-[3px] sm:p-3 sm:shadow-[4px_4px_0px_#171315]">
          <button type="button" onClick={() => onOpenPhoto?.(photoIndex)} className="relative block w-full overflow-hidden border border-[#171315] bg-[#171315] text-left">
            <img src={photo.url} alt={photo.alt} className="max-h-[480px] w-full object-contain contrast-[1.08] sepia-[0.1]" />
            <span className="absolute left-2 top-2 flex items-center gap-1.5 border border-[#E7D9BE]/40 bg-[#171315]/90 px-2 py-0.5 font-mono text-[10px] font-bold text-[#E7D9BE]">
              <Camera className="h-3.5 w-3.5 text-[#B78A45]" />現場記録写真 #{String(photoIndex + 1).padStart(2, '0')}
            </span>
          </button>
          <figcaption className="mt-2 flex flex-wrap items-center justify-center gap-1.5 border-t border-[#171315]/20 pt-1.5 text-center font-serif text-xs text-[#66504A]">
            <span className="font-bold text-[#6E1F2B]">【写真】</span><span className="font-medium text-[#171315]">{photo.title}</span>
          </figcaption>
        </figure>,
      );
      return;
    }

    if (/^#{1,6}\s+/.test(trimmed)) {
      flushAll();
      const match = trimmed.match(/^(#{1,6})\s+(.+)$/)!;
      const level = match[1].length;
      const text = match[2];
      if (level <= 2) {
        blocks.push(
          <div key={`h-${index}`} className="mb-3.5 mt-7 sm:mb-5 sm:mt-10">
            <div className="mb-1.5 flex items-center gap-2"><span className="font-['Cinzel',serif] text-[11px] font-black uppercase tracking-widest text-[#6E1F2B] sm:text-xs">DISPATCH SECTION ❖ 重要項目</span><span className="h-[2px] flex-1 bg-[#6E1F2B]/40" /></div>
            <h2 className="border-y border-[#171315]/20 border-l-4 border-[#6E1F2B] bg-[#D8C6A5]/80 py-1.5 pl-3 font-serif text-lg font-black text-[#171315] shadow-[2px_2px_0px_#171315] sm:py-2 sm:pl-4 sm:text-2xl sm:shadow-[3px_3px_0px_#171315]">{inlineText(text, locationLinks)}</h2>
          </div>,
        );
      } else {
        blocks.push(<h3 key={`h-${index}`} className="mb-2.5 mt-5 flex items-center gap-2 border-b-2 border-[#B78A45]/60 pb-1.5 font-serif text-base font-bold text-[#171315] sm:mb-3.5 sm:mt-7 sm:text-xl"><span className="shrink-0 font-black text-[#6E1F2B]">❖</span><span>{inlineText(text, locationLinks)}</span></h3>);
      }
      return;
    }

    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      flushList();
      quoteLines.push(trimmed.replace(/^>\s?/, ''));
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    if (/^---+$/.test(trimmed)) {
      flushAll();
      blocks.push(<div key={`hr-${index}`} className="my-7 flex items-center justify-center gap-3 sm:my-8"><span className="h-[2px] flex-1 bg-[#171315]/40" /><span className="font-['Cinzel',serif] text-xs font-black uppercase tracking-widest text-[#6E1F2B]">❖ ROSE'S LAST CALL ❖</span><span className="h-[2px] flex-1 bg-[#171315]/40" /></div>);
      return;
    }

    if (listItems.length > 0) flushList();
    if (quoteLines.length > 0) flushQuote();
    paragraph.push(trimmed);
  });

  flushAll();

  return <div className="drop-cap-lead min-w-0 max-w-full break-words text-[#171315] [overflow-wrap:anywhere]">{blocks}</div>;
}
