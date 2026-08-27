import { BookOpen, Glasses, Shield, ScrollText } from 'lucide-react';
import { WIKI_STYLES } from '@/lib/wiki';

const STYLE_PREVIEWS: Record<string, { eyebrow: string; title: string; icon: typeof Glasses; sample: string; badges: string[]; tone: string }> = {
  wikipedia: { eyebrow: 'STYLE 01 // ウタペディア', title: '百科事典・民俗学者', icon: Glasses, sample: '「ふむ……この記録によれば、ここで無残にも骨を埋めた冒険者は星の数ほどいるようだ。」', badges: ['事実＋毒舌な脚色', '情報密度：高'], tone: '客観的に見せかけて、知的に刺す。' },
  scp: { eyebrow: 'STYLE 02 // SCP FOUNDATION', title: '機密報告・上級研究員', icon: Shield, sample: '「対象地点における異常行動の詳細は不明。記録者本人の生存能力にも疑義がある。」', badges: ['機密文書風', '冷徹・不穏'], tone: '世界の異常を、淡々と記録する。' },
  ancient: { eyebrow: 'STYLE 03 // LOST CHRONICLE', title: '絶望古文書・吟遊詩人', icon: ScrollText, sample: '「かつて愚かな旅人がこの地を訪れた。彼らが何を求めたのか、知る者はもういない。」', badges: ['悲壮感', '伝承・叙事詩風'], tone: '記録を、滅びゆく物語へ変える。' },
};

type Props = {
  style: string | null;
  generating: boolean;
  resetting: boolean;
  onSelect: (id: string) => void;
};

export function WikiStyleSelector({ style, generating, resetting, onSelect }: Props) {
  return (
    <div className="rounded-sm border-2 border-[#2d3548] bg-[#1e2330] p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[#2d3548]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-amber-400 font-mono text-xs">▶</span>
          <div>
            <p className="text-xs sm:text-sm font-bold text-amber-400 tracking-wide font-mono uppercase">CHRONICLE FORMAT // 旅の書・編纂流派</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">記録を、どんな世界の物語として残す？</p>
          </div>
        </div>
        <span className="hidden sm:inline text-[10px] text-slate-500 font-mono">SELECT YOUR CHRONICLE</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WIKI_STYLES.map((s) => {
          const preview = STYLE_PREVIEWS[s.id];
          const Icon = preview?.icon ?? BookOpen;
          const selected = style === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              disabled={generating || resetting}
              className={`group relative overflow-hidden rounded-sm border-2 p-3.5 text-left transition-all duration-200 min-h-[180px] ${selected ? 'border-amber-500 bg-[#161a24] shadow-[0_0_18px_rgba(245,158,11,0.2)]' : 'border-[#2d3548] bg-[#141824] hover:border-slate-500 hover:bg-[#181d2c]'}`}
            >
              <div className="absolute right-[-12px] top-[-18px] text-amber-400/[0.035] transition-transform duration-300 group-hover:scale-110"><Icon size={100} strokeWidth={1} /></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 border border-slate-700 bg-[#12151f] text-emerald-400">{preview?.eyebrow ?? s.name}</span>
                  {selected && <span className="text-[9px] font-mono font-bold text-amber-400">▶ SELECTED</span>}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-slate-700 bg-[#0f131d] text-slate-500'}`}><Icon className="w-5 h-5" /></div>
                  <div className="min-w-0"><h3 className={`text-sm font-bold truncate ${selected ? 'text-amber-400' : 'text-white'}`}>{preview?.title ?? s.name}</h3><p className="text-[10px] text-slate-400 mt-0.5">{preview?.tone ?? s.description}</p></div>
                </div>
                <div className="mt-3 rounded-sm border border-[#2d3548] bg-[#12151f] p-2.5"><p className="text-[10px] sm:text-[11px] leading-relaxed text-slate-200 font-serif">{preview?.sample ?? s.description}</p></div>
                <div className="mt-2 flex flex-wrap gap-1.5">{(preview?.badges ?? [s.description]).map((badge) => <span key={badge} className="rounded-sm border border-slate-700 bg-[#181d2c] px-1.5 py-0.5 text-[9px] font-mono text-slate-400">{badge}</span>)}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
