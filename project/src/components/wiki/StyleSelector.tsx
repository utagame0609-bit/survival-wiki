import { BookOpen, Glasses, ScrollText, Shield } from 'lucide-react';
import type { ComponentType } from 'react';
import { WIKI_STYLES } from '@/lib/wiki';
import { playHoverSound } from '@/lib/sound';

type StylePreview = {
  eyebrow: string;
  title: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  sample: string;
  badges: string[];
  tone: string;
};

const STYLE_PREVIEWS: Record<string, StylePreview> = {
  wikipedia: {
    eyebrow: 'STYLE 01 // ウタペディア',
    title: '百科事典・民俗学者',
    icon: Glasses,
    sample: '「ふむ……この記録によれば、ここで無残にも骨を埋めた冒険者は星の数ほどいるようだ。」',
    badges: ['事実＋毒舌な脚色', '情報密度：高'],
    tone: '客観的に見せかけて、知的に刺す。',
  },
  scp: {
    eyebrow: 'STYLE 02 // SCP FOUNDATION',
    title: '機密報告・上級研究員',
    icon: Shield,
    sample: '「対象地点における異常行動の詳細は不明。記録者本人の生存能力にも疑義がある。」',
    badges: ['機密文書風', '冷徹・不穏'],
    tone: '世界の異常を、淡々と記録する。',
  },
  ancient: {
    eyebrow: 'STYLE 03 // LOST CHRONICLE',
    title: '絶望古文書・吟遊詩人',
    icon: ScrollText,
    sample: '「かつて愚かな旅人がこの地を訪れた。彼らが何を求めたのか、知る者はもういない。」',
    badges: ['悲壮感', '伝承・叙事詩風'],
    tone: '記録を、滅びゆく物語へ変える。',
  },
};

type StyleSelectorProps = {
  style: string | null;
  generating: boolean;
  resetting: boolean;
  onSelect: (id: string) => void;
};

export function StyleSelector({ style, generating, resetting, onSelect }: StyleSelectorProps) {
  return (
    <section className="w-full border-2 border-[#2d3548] bg-[#1e2330] p-3.5 sm:p-5 shadow-lg" aria-label="Wikiスタイル選択">
      <div className="mb-3.5 flex items-center justify-between gap-3 border-b border-[#2d3548] pb-3">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 text-xs font-mono text-amber-400">▶</span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold tracking-wide text-amber-400 font-mono">CHRONICLE FORMAT // 旅の書・編纂流派</p>
            <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">記録を、どんな世界の物語として残す？</p>
          </div>
        </div>
        <span className="hidden sm:inline shrink-0 text-[10px] text-slate-500 font-mono">SELECT YOUR CHRONICLE</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {WIKI_STYLES.map((s) => {
          const preview = STYLE_PREVIEWS[s.id];
          const Icon = preview?.icon ?? BookOpen;
          const selected = style === s.id;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              onMouseEnter={playHoverSound}
              disabled={generating || resetting}
              className={`group relative min-h-[150px] overflow-hidden border-2 p-3 text-left transition-all duration-200 sm:min-h-[175px] sm:p-3.5 ${
                selected
                  ? 'border-amber-500 bg-[#161a24] shadow-[0_0_18px_rgba(245,158,11,0.2)]'
                  : 'border-[#2d3548] bg-[#141824] hover:border-slate-500 hover:bg-[#181d2c]'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <div className="pointer-events-none absolute right-[-14px] top-[-18px] text-amber-400/[0.035] transition-transform duration-300 group-hover:scale-110">
                <Icon size={96} strokeWidth={1} />
              </div>

              <div className="relative z-10 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="min-w-0 truncate border border-slate-700 bg-[#12151f] px-1.5 py-0.5 text-[8px] font-mono font-bold text-emerald-400 sm:text-[9px]">
                    {preview?.eyebrow ?? s.name}
                  </span>
                  {selected && <span className="shrink-0 text-[8px] font-mono font-bold text-amber-400 sm:text-[9px]">▶ SELECTED</span>}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center border sm:h-9 sm:w-9 ${
                    selected
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-700 bg-[#0f131d] text-slate-500'
                  }`}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`truncate text-xs font-bold sm:text-sm ${selected ? 'text-amber-400' : 'text-white'}`}>
                      {preview?.title ?? s.name}
                    </h3>
                    <p className="mt-0.5 line-clamp-2 text-[9px] leading-relaxed text-slate-400 sm:text-[10px]">{preview?.tone ?? s.description}</p>
                  </div>
                </div>

                <div className="mt-2.5 border border-[#2d3548] bg-[#12151f] p-2 sm:mt-3 sm:p-2.5">
                  <p className="line-clamp-3 text-[9px] leading-relaxed text-slate-200 font-serif sm:text-[11px]">
                    {preview?.sample ?? s.description}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {(preview?.badges ?? [s.description]).map((badge) => (
                    <span key={badge} className="border border-slate-700 bg-[#181d2c] px-1.5 py-0.5 text-[8px] font-mono text-slate-400 sm:text-[9px]">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
