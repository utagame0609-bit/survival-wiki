import { AlertCircle, ArrowRight, CheckCircle2, Play, ScrollText, Sparkles } from 'lucide-react';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { WIKI_STYLES } from '@/lib/wiki';
import { playHoverSound } from '@/lib/sound';

export type WikiCompilerStyleId = 'wikipedia' | 'scp' | 'ancient';
export type WikiCompilerSavedState = Record<WikiCompilerStyleId, boolean>;

type Props = {
  style: WikiCompilerStyleId | null;
  saved: WikiCompilerSavedState;
  locationCount: number;
  generating: boolean;
  resetting: boolean;
  cooldownUntil: number;
  onSelectStyle: (style: WikiCompilerStyleId) => void;
  onGenerate: () => void;
};

const styleMeta: Record<WikiCompilerStyleId, { title: string; shortTitle: string; subtitle: string }> = {
  wikipedia: { title: '百科事典 Wiki風', shortTitle: '百科事典', subtitle: '体系的・客観的解説' },
  scp: { title: '特異事象報告 (SCP風)', shortTitle: 'SCP報告', subtitle: '調査員ログ・異常観測' },
  ancient: { title: '古代伝承の詩', shortTitle: '古代伝承', subtitle: '語り継がれる叙事詩・神話' },
};

const styleCardAccent: Record<WikiCompilerStyleId, { selected: string; idle: string; pill: string }> = {
  wikipedia: {
    selected: 'scale-[1.02] border-[#B89A5A] bg-[#181713] shadow-[0_0_14px_rgba(184,154,90,0.18)]',
    idle: 'border-[#302D25] bg-[#0F172A]/80 opacity-90 hover:border-[#B89A5A]/55 hover:opacity-100',
    pill: 'border-[#B89A5A]/45 text-[#C9AE72]',
  },
  scp: {
    selected: 'scale-[1.02] border-[#4F8F9A] bg-[#111B22] shadow-[0_0_14px_rgba(79,143,154,0.18)]',
    idle: 'border-[#24343A] bg-[#0F172A]/80 opacity-90 hover:border-[#4F8F9A]/55 hover:opacity-100',
    pill: 'border-[#4F8F9A]/45 text-[#6FA9B1]',
  },
  ancient: {
    selected: 'scale-[1.02] border-[#9A635D] bg-[#1A1517] shadow-[0_0_14px_rgba(154,99,93,0.18)]',
    idle: 'border-[#37292A] bg-[#0F172A]/80 opacity-90 hover:border-[#9A635D]/55 hover:opacity-100',
    pill: 'border-[#9A635D]/45 text-[#B57D77]',
  },
};

export function WikiCompilerHome({
  style,
  saved,
  locationCount,
  generating,
  resetting,
  cooldownUntil,
  onSelectStyle,
  onGenerate,
}: Props) {
  const narrator = style ? NARRATORS[style] : null;
  const selectedWikiStyle = style ? WIKI_STYLES.find((item) => item.id === style) : null;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-4 sm:space-y-6">
      <section className="hud-bracket-cyan relative overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="game-ui-font flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#06B6D4] sm:text-[11px]">
              <ScrollText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">AI CHRONICLE COMPILER // 旅の書 (WIKI)</span>
            </div>
            <h2 className="game-ui-font mt-1 text-lg font-bold tracking-wider text-[#F8FAFC] sm:text-xl">
              冒険譚・年代記 自動編纂
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#94A3B8]">
              蓄積された探索記録をもとに、3名の編纂官がそれぞれの世界観・流派で旅の書を編纂します。
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-[#334155] bg-[#0B1018] px-3.5 py-2 text-center sm:flex-col sm:gap-1">
            <span className="game-ui-font text-[10px] text-[#64748B]">保存済み記事</span>
            <div className="game-ui-font text-sm font-bold text-[#06B6D4]">
              {Object.values(saved).filter(Boolean).length} / 3 STYLES
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="game-ui-font mb-2.5 flex items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <span>編纂官（3つのスタイル）を選択</span>
          <span className="text-[10px] text-[#64748B]">タップで切り替え</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {WIKI_STYLES.map((wikiStyle) => {
            const id = wikiStyle.id as WikiCompilerStyleId;
            const selected = style === id;
            const meta = styleMeta[id];
            const npc = NARRATORS[id];
            const accent = styleCardAccent[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectStyle(id)}
                onMouseEnter={playHoverSound}
                disabled={generating || resetting}
                title={`${meta.title}${saved[id] ? '・保存済み' : ''}`}
                className={`relative flex min-w-0 flex-col items-center rounded-xl border-2 p-2.5 text-center transition-all duration-200 sm:p-4 ${selected ? accent.selected : accent.idle}`}
              >
                <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                  {saved[id] ? (
                    <span className="game-ui-font flex items-center gap-0.5 rounded border border-[#10B981]/40 bg-[#10B981]/20 px-1 py-0.5 text-[8px] text-[#10B981] sm:px-1.5 sm:text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span className="hidden sm:inline">保存済</span>
                    </span>
                  ) : (
                    <span className="game-ui-font rounded bg-[#1E293B] px-1 py-0.5 text-[8px] text-[#64748B] sm:px-1.5 sm:text-[9px]">未編纂</span>
                  )}
                </div>

                <div className="mb-2 mt-1 sm:mb-3">
                  <PixelNarrator style={id} />
                </div>
                <span className={`game-ui-font mb-0.5 whitespace-nowrap rounded border bg-[#0B1018] px-2 py-0.5 text-[10px] font-bold sm:mb-1 sm:text-xs ${accent.pill}`}>
                  {meta.shortTitle}
                </span>
                <h3 className="game-ui-font line-clamp-1 text-[10px] font-bold text-[#F8FAFC] sm:text-sm">{npc.name}</h3>
                <p className="mt-0.5 hidden line-clamp-1 text-[10px] text-[#64748B] sm:block">{npc.role}</p>
              </button>
            );
          })}
        </div>
      </section>

      {style && narrator && selectedWikiStyle && (
        <section className="hud-bracket scroll-mt-20 space-y-4 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 sm:p-5">
          <div className="flex items-start gap-3.5">
            <PixelNarrator style={style} />
            <div className="min-w-0 flex-1">
              <div className="game-ui-font text-xs font-bold text-[#06B6D4]">{narrator.role}</div>
              <h3 className="game-ui-font mt-0.5 text-base font-bold text-[#F8FAFC] sm:text-lg">{narrator.name}</h3>
              <p className="mt-1.5 rounded border border-[#1E293B] bg-[#0B1018]/80 p-2.5 text-xs italic leading-relaxed text-[#E2E8F0]">
                「{narrator.quote}」
              </p>
            </div>
          </div>

          <div className="border-t border-[#1E293B] pt-3 text-xs leading-relaxed text-[#94A3B8]">
            <span className="game-ui-font mr-1.5 font-bold text-[#F59E0B]">【スタイル特徴】</span>
            {selectedWikiStyle.description}。{styleMeta[style].subtitle}を基調に、このワールドの記録を再構成します。
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
            <div className="game-ui-font text-[11px] text-[#64748B]">
              {locationCount > 0 ? (
                <span>参照可能な探索ログ: {locationCount} 件</span>
              ) : (
                <span className="flex items-center gap-1 text-[#EF4444]">
                  <AlertCircle className="h-3 w-3" />記録が0件のため編纂できません
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onGenerate}
              onMouseEnter={playHoverSound}
              disabled={saved[style] || locationCount === 0 || generating || resetting || cooldownUntil > Date.now()}
              className="game-ui-font inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-[#F59E0B] px-6 py-3 text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_0_15px_rgba(245,158,11,0.35)] transition-all hover:bg-[#D97706] active:scale-95 disabled:opacity-40 sm:text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>{saved[style] ? '保存済み記事を開いています' : 'この流派でWikiを自動編纂する'}</span>
              {!saved[style] && <Play className="h-3.5 w-3.5 fill-current" />}
              {saved[style] && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
