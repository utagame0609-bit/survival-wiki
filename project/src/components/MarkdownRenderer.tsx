import type { ReactNode } from 'react';

type Props = {
  content: string;
  className?: string;
};

type Heading = {
  level: 2 | 3;
  text: string;
  id: string;
};

function inlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index} className="rounded bg-stone-100 px-1 py-0.5 text-[0.9em]">{part.slice(1, -1)}</code>;
    }
    return <span key={index}>{part}</span>;
  });
}

function splitTableRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

export function MarkdownRenderer({ content, className = '' }: Props) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  const headings: Heading[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let tableLines: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(' ').trim();
    if (text) {
      blocks.push(<p key={`p-${blocks.length}`} className="my-3">{inlineMarkdown(text)}</p>);
    }
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-4 list-disc space-y-1 pl-6">
        {listItems.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}
      </ul>,
    );
    listItems = [];
  };

  const flushTable = () => {
    if (tableLines.length < 2) {
      tableLines.forEach((line) => paragraph.push(line));
      tableLines = [];
      return;
    }
    const header = splitTableRow(tableLines[0]);
    const bodyLines = tableLines.slice(2);
    blocks.push(
      <div key={`table-${blocks.length}`} className="my-5 overflow-x-auto border border-[#a2a9b1]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[#eaecf0]">
            <tr>{header.map((cell, index) => <th key={index} className="border border-[#c8ccd1] px-3 py-2 font-semibold">{inlineMarkdown(cell)}</th>)}</tr>
          </thead>
          <tbody>
            {bodyLines.map((line, rowIndex) => {
              const cells = splitTableRow(line);
              return <tr key={rowIndex}>{header.map((_, cellIndex) => <td key={cellIndex} className="border border-[#c8ccd1] px-3 py-2 align-top">{inlineMarkdown(cells[cellIndex] ?? '')}</td>)}</tr>;
            })}
          </tbody>
        </table>
      </div>,
    );
    tableLines = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
  };

  let headingCount = 0;
  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushAll();
      return;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushParagraph();
      flushList();
      tableLines.push(trimmed);
      return;
    }

    if (tableLines.length > 0) flushTable();

    if (/^#{1,3}\s+/.test(trimmed)) {
      flushAll();
      const match = trimmed.match(/^(#{1,3})\s+(.+)$/)!;
      const level = match[1].length;
      const text = match[2].replace(/^#+\s*/, '');
      const common = 'scroll-mt-4 font-normal text-[#202122]';
      const id = `wiki-heading-${headingCount++}`;
      if (level === 1) {
        blocks.push(<h1 key={`h-${index}`} className={`${common} my-5 border-b border-[#a2a9b1] pb-2 text-2xl sm:text-3xl`}>{inlineMarkdown(text)}</h1>);
      } else {
        headings.push({ level: level as 2 | 3, text, id });
        if (level === 2) blocks.push(<h2 id={id} key={`h-${index}`} className={`${common} mt-8 mb-3 border-b border-[#a2a9b1] pb-1 text-xl sm:text-2xl`}>{inlineMarkdown(text)}</h2>);
        else blocks.push(<h3 id={id} key={`h-${index}`} className={`${common} mt-6 mb-2 text-lg sm:text-xl font-semibold`}>{inlineMarkdown(text)}</h3>);
      }
      return;
    }

    if (/^---+$/.test(trimmed)) {
      flushAll();
      blocks.push(<hr key={`hr-${index}`} className="my-6 border-0 border-t border-[#a2a9b1]" />);
      return;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      listItems.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    if (listItems.length > 0) flushList();
    paragraph.push(trimmed);
  });

  flushAll();

  const tableOfContents = headings.length >= 2 ? (
    <nav aria-label="目次" className="my-6 border border-[#a2a9b1] bg-[#f8f9fa] p-4 text-sm">
      <div className="mb-2 font-semibold text-[#202122]">目次</div>
      <ol className="space-y-1">
        {headings.map((heading, index) => (
          <li key={heading.id} className={heading.level === 3 ? 'ml-5' : ''}>
            <button
              type="button"
              onClick={() => document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-left text-[#36c] hover:underline"
            >
              {index + 1}. {heading.text}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  ) : null;

  return <div className={`wiki-markdown text-[15px] leading-7 ${className}`}>{tableOfContents}{blocks}</div>;
}
