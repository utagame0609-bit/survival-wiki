import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Globe2,
  Play,
  ScrollText,
  Sparkles,
} from 'lucide-react';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { playHoverSound } from '@/lib/sound';
import type { WikiCoverageMode, WikiScopeType } from '@/lib/wikiScope';

export type WikiCompilerStyleId = 'wikipedia' | 'scp' | 'ancient';
export type WikiCompilerSavedState = Record<WikiCompilerStyleId, boolean>;
export type WikiCompilerSavedCountState = Record<WikiCompilerStyleId, number>;

type Props = {
  style: WikiCompilerStyleId | null;
  saved: WikiCompilerSavedState;
  savedCountByStyle: WikiCompilerSavedCountState;
  savedArticleCount: number;
  locationCount: number;
  generating: boolean;
  resetting: boolean;
  cooldownUntil: number;
  scopeType: WikiScopeType;
  scopeKey: string;
  scopeLabel: string;
  scopeDescription: string;
  scopeMode: WikiCoverageMode;
  availableMonths: string[];
  availableYears: string[];
  scopeSlotLocked: boolean;
  onSelectStyle: (style: WikiCompilerStyleId) => void;
  onSelectScopeType: (scope: WikiScopeType) => void;
  onSelectScopeKey: (key: string) => void;
  onPrimaryAction: () => void;
};

const WIKI_STYLE_ORDER: WikiCompilerStyleId[] = ['wikipedia', 'scp', 'ancient'];

const styleMeta: Record<WikiCompilerStyleId, { title: string; shortTitle: string; description: string }> = {
  wikipedia: {
    title: '百科事典 Wiki風',
    shortTitle: '百科事典',
    description: '記録の背景や由来を読み解く、好奇心旺盛な民俗学者。あなたの冒険を百科事典として丁寧に編纂します。',
  },
  scp: {
    title: '特異事象報告 (SCP風)',
    shortTitle: 'SCP報告',
    description: 'あらゆる異常を冷静に分析する上級研究員。あなたの行動を機密調査記録として報告します。',
  },
  ancient: {
    title: "ROSE'S LAST CALL",
    shortTitle: '荒野新聞',
    description: '酒場と荒野のゴシップを仕切る毒舌編集長。大事な常連客であるあなたの騒動を、愛のある辛口記事に仕立てます。',
  },
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

const scopeMeta: Record<WikiScopeType, {
  label: string;
  shortLabel: string;
  helper: string;
  icon: typeof CalendarDays;
}> = {
  month: {
    label: '月刊記録',
    shortLabel: '月',
    helper: 'その月を細かく',
    icon: CalendarDays,
  },
  year: {
    label: '年間記録',
    shortLabel: '年',
    helper: '一年の流れ',
    icon: CalendarRange,
  },
  world: {
    label: 'ワールド史',
    shortLabel: '全期間',
    helper: '世界の歩み',
    icon: Globe2,
  },
};

function monthOptionLabel(value: string) {
  const [year, month] = value.split('-');
  return `${year}年${Number(month)}月`;
}

export function WikiCompilerHome({
  style,
  saved,
  savedCountByStyle,
  savedArticleCount,
  locationCount,
  generating,
  resetting,
  cooldownUntil,
  scopeType,
  scopeKey,
  scopeLabel,
  scopeDescription,
  scopeMode,
  availableMonths,
  availableYears,
  scopeSlotLocked,
  onSelectStyle,
  onSelectScopeType,
  onSelectScopeKey,
  onPrimaryAction,
}: Props) {
  const narrator = style ? NARRATORS[style] : null;
  const selectedStyleMeta = style ? styleMeta[style] : null;
  const currentScopeMeta = scopeMeta[scopeType];
  const currentScopeSaved = style ? saved[style] : false;
  const hasScopeRecords = locationCount > 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-4 sm:space-y-6">
      <section className="hud-bracket-cyan relative overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A]/80 p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <div className="game-ui-font flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#06B6D4] sm:text-[11px]">
              <ScrollText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">AI WIKI COMPILER // 旅の書 (WIKI)</span>
            </div>
            <h2 className="game-ui-font mt-1 text-lg font-bold tracking-wider text-[#F8FAFC] sm:text-xl">
              WIKI記事 自動編纂
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-[#94A3B8]">
              編纂官と振り返る範囲を選ぶと、蓄積した記録から一冊の記事を編纂します。
            </p>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-[#334155] bg-[#0B1018] px-3.5 py-2 text-center sm:flex-col sm:gap-1">
            <span className="game-ui-font text-[10px] text-[#64748B]">保存済み記事</span>
            <div className="game-ui-font text-sm font-bold text-[#06B6D4]">
              {savedArticleCount} / 9 ARTICLES
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
          {WIKI_STYLE_ORDER.map((id) => {
            const selected = style === id;
            const meta = styleMeta[id];
            const npc = NARRATORS[id];
            const accent = styleCardAccent[id];
            const savedCount = savedCountByStyle[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectStyle(id)}
                onMouseEnter={playHoverSound}
                disabled={generating || resetting}
                title={`${meta.title}・保存済み${savedCount}/3`}
                className={`relative flex min-w-0 flex-col items-center rounded-xl border-2 p-2.5 text-center transition-all duration-200 sm:p-4 ${selected ? accent.selected : accent.idle}`}
              >
                <div className="mb-1 flex h-4 w-full items-start justify-end sm:absolute sm:right-2 sm:top-2 sm:z-10 sm:mb-0 sm:h-auto sm:w-auto">
                  {savedCount > 0 ? (
                    <span className="game-ui-font flex items-center gap-0.5 rounded border border-[#10B981]/40 bg-[#10251F] px-1 py-0.5 text-[8px] text-[#10B981] sm:bg-[#10B981]/20 sm:px-1.5 sm:text-[10px]">
                      <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{savedCount}/3</span>
                    </span>
                  ) : (
                    <span className="game-ui-font rounded bg-[#1E293B] px-1 py-0.5 text-[8px] text-[#64748B] sm:px-1.5 sm:text-[9px]">未編纂</span>
                  )}
                </div>

                <div className="mb-2 sm:mb-3 sm:mt-1">
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

      {style && narrator && selectedStyleMeta && (
        <section className="hud-bracket scroll-mt-20 space-y-4 rounded-xl border border-[#1E293B] bg-[#0F172A] p-4 sm:p-5">
          <div className="flex items-stretch gap-3.5 sm:items-start">
            <div className="flex shrink-0 items-center sm:block">
              <PixelNarrator style={style} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="game-ui-font text-xs font-bold text-[#06B6D4]">{narrator.role}</div>
              <h3 className="game-ui-font mt-0.5 text-base font-bold text-[#F8FAFC] sm:text-lg">{narrator.name}</h3>
              <p className="mt-1.5 rounded border border-[#1E293B] bg-[#0B1018]/80 p-2.5 text-xs italic leading-relaxed text-[#E2E8F0]">
                「{narrator.quote}」
              </p>
            </div>
          </div>

          <div className="border-t border-[#1E293B] pt-3 text-xs leading-relaxed text-[#94A3B8]">
            <span className="game-ui-font mr-1.5 font-bold text-[#F59E0B]">【この編纂官について】</span>
            {selectedStyleMeta.description}
          </div>

          <div className="space-y-3 border-t border-[#1E293B] pt-3">
            <div>
              <div className="game-ui-font text-xs font-bold text-[#E2E8F0]">どこまでを一冊にする？</div>
              <p className="mt-1 text-[11px] leading-relaxed text-[#64748B]">
                月・年・ワールド全体で、記事の役割と情報密度が変わります。
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(scopeMeta) as WikiScopeType[]).map((id) => {
                const meta = scopeMeta[id];
                const Icon = meta.icon;
                const selected = scopeType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelectScopeType(id)}
                    onMouseEnter={playHoverSound}
                    disabled={generating || resetting}
                    className={`min-w-0 rounded-lg border px-2 py-2.5 text-left transition-all sm:px-3 ${selected
                      ? 'border-[#06B6D4]/70 bg-[#102330] shadow-[0_0_12px_rgba(6,182,212,0.12)]'
                      : 'border-[#273449] bg-[#0B1018] hover:border-[#475569]'}`}
                  >
                    <div className={`flex items-center gap-1.5 ${selected ? 'text-[#67E8F9]' : 'text-[#94A3B8]'}`}>
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="game-ui-font truncate text-[10px] font-bold sm:text-xs">{meta.label}</span>
                    </div>
                    <div className="mt-1 hidden text-[10px] leading-tight text-[#64748B] sm:block">{meta.helper}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-[#263247] bg-[#0B1018]/85 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="game-ui-font flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#F8FAFC]">
                    <span>{currentScopeMeta.label}</span>
                    <span className={`rounded border px-1.5 py-0.5 text-[9px] ${scopeMode === 'full'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
                      {scopeMode === 'full' ? '詳細編纂' : 'ダイジェスト'}
                    </span>
                    {scopeSlotLocked && (
                      <span className="rounded border border-[#10B981]/30 bg-[#10B981]/10 px-1.5 py-0.5 text-[9px] text-[#6EE7B7]">保存済み</span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">{scopeDescription}</p>
                </div>

                {scopeType === 'month' && (
                  <select
                    value={scopeKey}
                    onChange={(event) => onSelectScopeKey(event.target.value)}
                    disabled={scopeSlotLocked || generating || resetting || availableMonths.length === 0}
                    className="game-ui-font min-h-[38px] rounded border border-[#334155] bg-[#111827] px-2.5 text-[11px] text-[#E2E8F0] outline-none focus:border-[#06B6D4] disabled:opacity-65"
                    aria-label="編纂する月"
                  >
                    {availableMonths.map((month) => <option key={month} value={month}>{monthOptionLabel(month)}</option>)}
                  </select>
                )}

                {scopeType === 'year' && (
                  <select
                    value={scopeKey}
                    onChange={(event) => onSelectScopeKey(event.target.value)}
                    disabled={scopeSlotLocked || generating || resetting || availableYears.length === 0}
                    className="game-ui-font min-h-[38px] rounded border border-[#334155] bg-[#111827] px-2.5 text-[11px] text-[#E2E8F0] outline-none focus:border-[#06B6D4] disabled:opacity-65"
                    aria-label="編纂する年"
                  >
                    {availableYears.map((year) => <option key={year} value={year}>{year}年</option>)}
                  </select>
                )}

                {scopeType === 'world' && (
                  <div className="game-ui-font rounded border border-[#334155] bg-[#111827] px-3 py-2 text-[11px] text-[#CBD5E1]">全期間</div>
                )}
              </div>

              <div className="game-ui-font mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#1E293B] pt-2 text-[10px] text-[#64748B]">
                <span>対象: {scopeLabel}</span>
                <span>探索ログ: {locationCount}件</span>
                <span>本文上限: 3000文字</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-between gap-3 pt-1 sm:flex-row sm:items-center">
            <div className="game-ui-font text-[11px] text-[#64748B]">
              {hasScopeRecords ? (
                <span>この範囲の探索ログ: {locationCount} 件</span>
              ) : (
                <span className="flex items-center gap-1 text-[#EF4444]">
                  <AlertCircle className="h-3 w-3" />この範囲には記録がありません
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onPrimaryAction}
              onMouseEnter={playHoverSound}
              disabled={!hasScopeRecords || generating || resetting || cooldownUntil > Date.now()}
              className={`game-ui-font inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg px-6 py-3 text-xs font-bold tracking-wider text-[#0B1018] shadow-lg transition-all active:scale-95 disabled:opacity-40 sm:text-sm ${currentScopeSaved
                ? 'bg-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:bg-[#0891B2]'
                : 'bg-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:bg-[#D97706]'}`}
            >
              {currentScopeSaved ? <BookOpen className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              <span>{currentScopeSaved ? `${scopeLabel}の記事を読む` : `${scopeLabel}をこの流派で編纂する`}</span>
              {currentScopeSaved ? <ArrowRight className="h-4 w-4" /> : <Play className="h-3.5 w-3.5 fill-current" />}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}