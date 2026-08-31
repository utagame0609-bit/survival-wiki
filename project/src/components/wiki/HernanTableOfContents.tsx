import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { playHoverSound } from '@/lib/sound';
import { parseStoredHernanArticle } from '@/lib/wikiHernan';

type HernanSections = NonNullable<ReturnType<typeof parseStoredHernanArticle>>['sections'];

type DesktopProps = {
  sections: HernanSections;
  activeSectionId: string;
  onSelectSection: (id: string) => void;
};

export function HernanDesktopTableOfContents({ sections, activeSectionId, onSelectSection }: DesktopProps) {
  return (
    <aside className="hidden lg:block">
      <div className="mb-2 flex items-center gap-1.5 border-b border-[#eaecf0] pb-2 font-mono text-[11px] font-bold text-neutral-600">
        <BookOpen className="h-3.5 w-3.5" />目次 (CONTENTS)
      </div>
      <nav className="space-y-1 text-[12px] leading-snug">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelectSection(section.id)}
            onMouseEnter={playHoverSound}
            className={`block w-full border-l-2 px-2 py-1.5 text-left transition-colors ${activeSectionId === `hernan-${section.id}` ? 'border-[#0645ad] bg-[#f3f6fb] font-semibold text-[#0645ad]' : 'border-transparent text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-[#0645ad]'}`}
          >
            <span className="mr-1 font-mono text-[10.5px] text-neutral-400">{section.number}</span>{section.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}

type MobileProps = {
  sections: HernanSections;
  open: boolean;
  onToggle: () => void;
  onSelectSection: (id: string) => void;
};

export function HernanMobileTableOfContents({ sections, open, onToggle, onSelectSection }: MobileProps) {
  return (
    <div className="mb-4 lg:hidden">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between border border-[#a2a9b1] bg-[#f8f9fa] px-3 py-2 text-left text-[12px] font-semibold text-neutral-700">
        <span className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />目次 ({sections.length})</span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <nav className="border-x border-b border-[#a2a9b1] bg-white p-2 text-[12px]">
          {sections.map((section) => (
            <button key={section.id} type="button" onClick={() => onSelectSection(section.id)} className="block w-full px-2 py-1.5 text-left text-[#0645ad] hover:underline">
              <span className="mr-1.5 font-mono text-[10.5px] text-neutral-400">{section.number}</span>{section.title}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
