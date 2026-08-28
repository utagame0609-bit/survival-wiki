import { BookOpen, ScrollText, Shield, Sparkles } from 'lucide-react';
import type { ComponentType } from 'react';
import { WIKI_STYLES } from '@/lib/wiki';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { playHoverSound } from '@/lib/sound';

type WikiGenerationPanelProps = {
  style: string | null;
  generating: boolean;
  resetting: boolean;
  locationCount: number;
  onSelect: (style: string) => void;
  onGenerate: () => void;
};

type IconProps = { className?: string; size?: number; strokeWidth?: number };

const STYLE_META: Record<string, { icon: ComponentType<IconProps>; title: string; subtitle: string }> = {
  wikipedia: { icon: BookOpen, title: '百科事典 Wiki風', subtitle: '体系的・客観的解説' },
  scp: { icon: Shield, title: '特異事象報告 (SCP風)', subtitle: '調査員ログ・異常観測' },
  ancient: { icon: ScrollText, title: '古代伝承の詩', subtitle: '語り継がれる叙事詩・神話' },
};

export function WikiGenerationPanel({ style, generating, resetting, locationCount, onSelect, onGenerate }: WikiGenerationPanelProps) {
  return (
    <section className="w-full border-2 border-cyan-500/70 bg-[#0f1424] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-cyan-300 font-mono truncate">冒険譚・年代記自動編纂</h2>
            <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">記録を、どんな世界の物語として残す？</p>
          </div>
        </div>
        <span className="shrink-0 text-[9px] sm:text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-1.5 py-0.5">対象記録: {locationCount}件</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {WIKI_STYLES.map((wikiStyle) => {
          const meta = STYLE_META[wikiStyle.id] ?? { icon: BookOpen, title: wikiStyle.name, subtitle: wikiStyle.description };
          const Icon = meta.icon;
          const selected = style === wikiStyle.id;
          const narrator = NARRATORS[wikiStyle.id];
          return (
            <button key={wikiStyle.id} type="button" onClick={() => onSelect(wikiStyle.id)} onMouseEnter={playHoverSound} disabled={generating || resetting}
              className={`relative min-w-0 border-2 p-1.5 sm:p-2 text-left transition-all ${selected ? 'border-amber-500 bg-[#161a24] shadow-[0_0_14px_rgba(245,158,11,.16)]' : 'border-slate-700 bg-[#0c101c] hover:border-slate-500'}`}>
              <div className="flex items-center gap-1.5">
                <PixelNarrator style={wikiStyle.id} compact />
                <div className="min-w-0">
                  <div className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-bold ${selected ? 'text-amber-400' : 'text-cyan-300'}`}>
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>STYLE {wikiStyle.id === 'wikipedia' ? '01' : wikiStyle.id === 'scp' ? '02' : '03'}</span>
                  </div>
                  <div className={`text-[10px] sm:text-[11px] font-bold leading-tight truncate ${selected ? 'text-white' : 'text-slate-200'}`}>{meta.title}</div>
                  <div className="text-[8px] sm:text-[9px] text-slate-500 truncate">{meta.subtitle}</div>
                </div>
              </div>
              {selected && <span className="absolute right-1 top-1 text-[8px] font-mono text-amber-400">SELECTED</span>}
              <p className={`mt-1.5 text-[8px] sm:text-[9px] leading-relaxed line-clamp-2 ${narrator?.text ?? 'text-slate-400'}`}>{narrator?.quote ?? wikiStyle.description}</p>
            </button>
          );
        })}
      </div>

      <button type="button" onClick={onGenerate} onMouseEnter={playHoverSound} disabled={generating || resetting || style === null || locationCount === 0}
        className="w-full mt-2.5 min-h-[44px] py-2.5 px-4 bg-cyan-500 text-black font-black font-mono text-xs sm:text-sm border-b-2 border-cyan-700 hover:bg-cyan-400 active:translate-y-0.5 disabled:opacity-40 flex items-center justify-center gap-2 transition-all">
        {generating ? <><span className="inline-block h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />AI が冒険譚を編纂中...</> : <><Sparkles className="w-4 h-4" />このワールドの Wiki 冒険譚を生成する</>}
      </button>

      <p className="mt-2 text-[9px] sm:text-[10px] text-slate-500 leading-relaxed font-sans">記録された座標・メモ・写真を元に、選択した流派の「旅の書」を編纂します。</p>
    </section>
  );
}
