import { Fragment, type ReactNode } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  Paperclip,
  Stamp,
  ZoomIn,
} from 'lucide-react';
import type { ScpDossierV1 } from '@/lib/wikiScp';

export type ScpEvidenceView = {
  id: string;
  code: string;
  url: string;
  title: string;
  caption: string;
  timestamp: string;
};

type ScpLocationLink = {
  name: string;
  onClick: () => void;
};

type Props = {
  dossier: ScpDossierV1;
  evidencePhotos: ScpEvidenceView[];
  activeCarouselIdx: number;
  setActiveCarouselIdx: (index: number | ((current: number) => number)) => void;
  indexOpen: boolean;
  setIndexOpen: (open: boolean) => void;
  declassifiedMode: boolean;
  setSelectedPhoto: (photo: ScpEvidenceView | null) => void;
  locationLinks?: ScpLocationLink[];
};

function renderScpLinkedText(text: string, links: ScpLocationLink[]): ReactNode[] {
  if (!text || links.length === 0) return [text];
  const candidates = links
    .filter((link) => link.name && text.includes(link.name))
    .sort((a, b) => b.name.length - a.name.length);
  if (candidates.length === 0) return [text];

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  while (cursor < text.length) {
    const next = candidates
      .map((link) => ({ link, index: text.indexOf(link.name, cursor) }))
      .filter((entry) => entry.index >= 0)
      .sort((a, b) => a.index - b.index || b.link.name.length - a.link.name.length)[0];

    if (!next) {
      nodes.push(<Fragment key={`text-${key++}`}>{text.slice(cursor)}</Fragment>);
      break;
    }
    if (next.index > cursor) {
      nodes.push(<Fragment key={`text-${key++}`}>{text.slice(cursor, next.index)}</Fragment>);
    }
    nodes.push(
      <button
        key={`location-${key++}`}
        type="button"
        onClick={next.link.onClick}
        className="font-semibold text-[#b91c1c] underline decoration-[#b91c1c]/45 underline-offset-2 transition-colors hover:text-[#7f1d1d]"
      >
        {next.link.name}
      </button>,
    );
    cursor = next.index + next.link.name.length;
  }
  return nodes;
}

export function ScpDossierBodyPaper({ dossier, evidencePhotos, activeCarouselIdx, setActiveCarouselIdx, indexOpen, setIndexOpen, declassifiedMode, setSelectedPhoto, locationLinks = [] }: Props) {
  const leadPhoto = evidencePhotos[0] ?? null;
  const secondaryPhotos = evidencePhotos.slice(1);
  const activeSecondary = secondaryPhotos[activeCarouselIdx] ?? secondaryPhotos[0] ?? null;

  return (
    <div className="w-full overflow-hidden border border-[#333338] bg-[#0f0f12] shadow-2xl">
      <div className="w-full bg-[#f5f2ea] p-4 text-[#1c1917] sm:p-8 lg:p-10">
        <section className="mb-6"><h3 className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#b91c1c] sm:text-sm"><span className="inline-block h-2 w-2 bg-[#b91c1c]" />特別収容プロトコル (SPECIAL CONTAINMENT PROCEDURES)</h3><div className="border border-[#2a2a2e] bg-[#1a1a1c] p-3 font-serif text-xs leading-relaxed text-[#d1d1d1] shadow-inner sm:p-4 sm:text-sm">{declassifiedMode ? renderScpLinkedText(dossier.containmentProcedure, locationLinks) : <span className="select-none bg-black px-2 text-black">████████████████████████████████████████</span>}</div></section>
        <div className="mb-6 sm:mb-8"><div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row"><div className="min-w-0 flex-1 space-y-2.5"><div className="flex items-center gap-2 border-b border-[#d6cfc0] pb-1"><span className="font-mono text-xs font-bold text-[#b91c1c]">§ 0.0</span><h2 className="text-sm font-bold text-[#1c1917] sm:text-base">調書要旨 (Executive Abstract)</h2></div><p className="text-justify text-[14px] leading-relaxed text-[#292524] sm:text-[15px]">{renderScpLinkedText(dossier.executiveSummary, locationLinks)}</p><div className="pt-0.5 font-mono text-[11px] text-[#78716c]">調書作成官：特異点研究員 Dr.アーク</div></div>{leadPhoto ? <EvidenceCard photo={leadPhoto} lead onOpen={setSelectedPhoto} /> : <div className="w-full shrink-0 border border-dashed border-[#b91c1c]/40 bg-[#ebe5d6] p-3 text-center md:w-60"><Stamp className="mx-auto mb-1 h-5 w-5 text-[#b91c1c]/60" /><div className="font-mono text-[9px] font-bold uppercase text-[#b91c1c]">NO PHYSICAL EVIDENCE ATTACHED</div><p className="mt-0.5 text-[9px] text-[#78716c]">光学撮影データ未収容。ログ調書のみ保全。</p></div>}</div></div>
        {secondaryPhotos.length > 0 && activeSecondary && <div className="mb-6 border border-[#d6cfc0] bg-[#ebe5d6] p-3"><div className="mb-2 flex items-center justify-between font-mono text-[11px]"><span className="flex items-center gap-1 font-bold text-[#b91c1c]"><Paperclip className="h-3 w-3" />追加添付証拠写真 ({secondaryPhotos.length}件)</span><span className="text-[10px] text-[#78716c]">{activeCarouselIdx + 1} / {secondaryPhotos.length}</span></div><div className="flex flex-col items-center gap-3 border border-[#d6cfc0] bg-white p-2 sm:flex-row"><div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-900 sm:aspect-square sm:w-44"><img src={activeSecondary.url} alt={activeSecondary.title} className="h-full w-full object-cover" /><button type="button" onClick={() => setSelectedPhoto(activeSecondary)} className="absolute bottom-1 right-1 bg-black/80 p-1 text-white"><ZoomIn className="h-3 w-3" /></button></div><div className="w-full space-y-1 font-mono text-xs"><div className="text-[10px] font-bold text-[#b91c1c]">[{activeSecondary.code}]</div><div className="text-xs font-bold text-[#1c1917] sm:text-sm">{activeSecondary.title}</div><p className="font-sans text-[11px] leading-relaxed text-[#57534e]">{activeSecondary.caption}</p><div className="text-[9px] text-[#78716c]">撮影日時: {activeSecondary.timestamp}</div></div></div>{secondaryPhotos.length > 1 && <div className="mt-2 flex items-center justify-between border-t border-[#d6cfc0] pt-2"><div className="flex gap-1.5 overflow-x-auto">{secondaryPhotos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setActiveCarouselIdx(index)} className={`h-7 w-10 overflow-hidden border ${activeCarouselIdx === index ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]' : 'border-[#cfc6b4] opacity-70'}`}><img src={photo.url} alt="" className="h-full w-full object-cover" /></button>)}</div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => setActiveCarouselIdx((current) => (current - 1 + secondaryPhotos.length) % secondaryPhotos.length)} className="border border-[#d6cfc0] bg-white p-1 text-[#78716c] hover:text-[#b91c1c]"><ChevronLeft className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setActiveCarouselIdx((current) => (current + 1) % secondaryPhotos.length)} className="border border-[#d6cfc0] bg-white p-1 text-[#78716c] hover:text-[#b91c1c]"><ChevronRight className="h-3.5 w-3.5" /></button></div></div>}</div>}
        <div className="my-5 overflow-hidden border border-[#d6cfc0] bg-[#ebe5d6]"><button type="button" onClick={() => setIndexOpen(!indexOpen)} className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs font-bold text-[#44403c] transition-colors hover:bg-[#e2dcce]"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-[#b91c1c]" /><span>調書目次 (INDEX - {dossier.sections.length} SECTIONS)</span></div>{indexOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>{indexOpen && <div className="space-y-1.5 border-t border-[#d6cfc0] bg-[#f2eee4] px-3 py-2.5 font-mono text-xs">{dossier.sections.map((section) => <a key={section.id} href={`#${section.id}`} className="block truncate text-[#57534e] hover:text-[#b91c1c] hover:underline"><span className="mr-1.5 font-bold text-[#b91c1c]">{section.number}</span>{section.title}</a>)}</div>}</div>
        <div className="space-y-6 sm:space-y-8">{dossier.sections.map((section) => <article key={section.id} id={section.id} className="relative border-t border-[#d6cfc0] pt-4 sm:pt-6"><div className="mb-2.5"><span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#b91c1c]">{section.number}</span><h3 className="text-base font-bold tracking-tight text-[#1c1917] sm:text-lg">{section.title}</h3>{section.subTitle && <p className="mt-0.5 font-mono text-[11px] text-[#78716c]">{section.subTitle}</p>}</div><div className="space-y-2.5">{section.paragraphs.map((paragraph, index) => <p key={index} className="text-justify text-[14px] leading-relaxed text-[#292524] sm:text-[15px]">{renderScpLinkedText(paragraph, locationLinks)}</p>)}{section.logEntries && section.logEntries.length > 0 && <div className="my-3.5 space-y-2 border-l-[3px] border-[#b91c1c] bg-[#0a0a0c] p-3 font-mono text-xs text-[#d1d1d1]"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#ff3e3e]"><span>[TRANSCRIPT LOG: EVENT STREAM]</span><span className="text-[9px] text-[#666]">AUDIO_VERIFIED</span></div>{section.logEntries.map((log, index) => <div key={index} className="space-y-0.5 border-t border-[#222] pt-1.5 first:border-0 first:pt-0"><div className="flex items-center gap-1 text-[9px] font-bold text-[#ff3e3e]"><Clock className="h-3 w-3 text-[#888]" /><span>{log.time}</span>{log.speaker && <span className="text-[#888]">/ {log.speaker}</span>}</div><div className="pl-3 text-[12px] leading-snug text-[#ccc] sm:text-[13px]">{renderScpLinkedText(log.text, locationLinks)}</div></div>)}</div>}{section.callout && <div className="relative my-3.5 border border-[#cfc6b4] bg-[#f8f5ee] p-3"><div className="mb-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#b91c1c]">{section.callout.label}</div><p className="font-serif text-xs italic leading-relaxed text-[#44403c] sm:text-[13px]">{declassifiedMode || section.callout.type !== 'REDACTED' ? renderScpLinkedText(section.callout.text, locationLinks) : <span className="select-none bg-black px-2 text-black">████████████████</span>}</p></div>}</div></article>)}</div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t-2 border-[#1c1917] pt-5 font-mono text-xs text-[#78716c] sm:flex-row"><div><div className="font-bold text-[#1c1917]">ARCHIVAL VERIFICATION COMPLETED</div><div className="text-[9px]">特異点監視機関 SOCO 保管番号: {dossier.caseId}</div></div><div className="flex items-center gap-3"><div className="text-right"><div className="text-[9px] text-[#78716c]">SIGNATURE OF LEAD EXAMINER</div><div className="font-serif text-sm font-bold italic text-[#b91c1c] sm:text-base">Dr. Arc, Ph.D.</div></div><div className="flex h-10 w-10 rotate-12 items-center justify-center border-2 border-dashed border-[#b91c1c] text-[8px] font-bold text-[#b91c1c]">SEALED</div></div></div>
      </div>
    </div>
  );
}

function EvidenceCard({ photo, lead, onOpen }: { photo: ScpEvidenceView; lead?: boolean; onOpen: (photo: ScpEvidenceView) => void }) {
  return <div className={`group relative w-full shrink-0 border border-[#d6cfc0] bg-white p-2 shadow-sm ${lead ? 'md:w-64' : 'md:w-60'}`}><div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-[#b91c1c] px-2 py-0.5 font-mono text-[9px] font-bold text-white"><Paperclip className="h-2.5 w-2.5" />{photo.code}</div><div className="relative mt-1 aspect-video w-full overflow-hidden bg-slate-900 sm:aspect-[4/3]"><img src={photo.url} alt={photo.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /><button type="button" onClick={() => onOpen(photo)} className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/80 p-1 text-[10px] text-white"><ZoomIn className="h-3 w-3" /></button></div><div className="mt-1.5 space-y-0.5 font-mono text-[10px] text-[#44403c]"><div className="truncate font-bold text-[#1c1917]">{photo.title}</div><div className="text-[9px] text-[#78716c]">{photo.timestamp}</div></div></div>;
}
