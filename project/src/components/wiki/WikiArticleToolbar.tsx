import { ArrowRight, CalendarDays, CalendarRange, Globe2 } from 'lucide-react';
import { PixelNarrator } from '@/components/wiki/WikiNarrator';
import { playHoverSound } from '@/lib/sound';
import type { WikiScopeType } from '@/lib/wikiScope';

export type WikiArticleToolbarStyleId = 'wikipedia' | 'scp' | 'ancient';

type SavedState = Record<WikiArticleToolbarStyleId, boolean>;

const styleMeta: Record<WikiArticleToolbarStyleId, { title: string; shortTitle: string }> = {
  wikipedia: { title: '百科事典 Wiki風', shortTitle: '百科事典' },
  scp: { title: '特異事象報告 (SCP風)', shortTitle: 'SCP報告' },
  ancient: { title: '古代伝承の詩', shortTitle: '古代伝承' },
};

const scopeIcon = {
  month: CalendarDays,
  year: CalendarRange,
  world: Globe2,
} satisfies Record<WikiScopeType, typeof CalendarDays>;

export function WikiArticleToolbar({
  style,
  saved,
  scopeType,
  scopeLabel,
  onSelectStyle,
  onBack,
}: {
  style: WikiArticleToolbarStyleId;
  saved: SavedState;
  scopeType: WikiScopeType;
  scopeLabel: string;
  onSelectStyle: (style: WikiArticleToolbarStyleId) => void;
  onBack: () => void;
}) {
  const ScopeIcon = scopeIcon[scopeType];

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#1E293B] bg-[#0F172A] p-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        onMouseEnter={playHoverSound}
        className="game-ui-font hidden min-h-[38px] items-center justify-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3 text-xs text-[#94A3B8] transition-colors hover:border-[#F59E0B]/50 hover:text-[#F59E0B] md:flex md:justify-start"
      >
        <ArrowRight className="h-4 w-4 rotate-180 text-[#F59E0B]" />
        <span>編纂官一覧に戻る</span>
      </button>

      <div className="game-ui-font flex min-h-[34px] items-center justify-center gap-1.5 rounded border border-[#334155] bg-[#0B1018] px-2.5 text-[10px] text-[#CBD5E1] sm:mr-auto sm:text-[11px]">
        <ScopeIcon className="h-3.5 w-3.5 text-[#06B6D4]" />
        <span>{scopeLabel}</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center md:ml-auto">
        {(Object.keys(saved) as WikiArticleToolbarStyleId[]).map((id) => {
          const active = id === style;
          const available = saved[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectStyle(id)}
              onMouseEnter={!active ? playHoverSound : undefined}
              disabled={active}
              title={active ? `${styleMeta[id].title}・表示中` : available ? `${styleMeta[id].title}の${scopeLabel}を開く` : `${styleMeta[id].title}で${scopeLabel}を生成する`}
              className={`game-ui-font flex min-w-0 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-[10px] transition-all sm:px-3 sm:text-xs ${active ? 'bg-[#06B6D4] font-bold text-[#0B1018] shadow-[0_0_10px_rgba(6,182,212,0.3)]' : available ? 'border border-[#334155] bg-[#161F30] text-[#94A3B8] hover:text-[#E2E8F0]' : 'border border-[#1E293B] bg-[#101722] text-[#64748B] opacity-65 hover:opacity-100'}`}
            >
              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12">
                <PixelNarrator style={id} compact />
              </span>
              <span className="hidden truncate sm:inline">{styleMeta[id].shortTitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
