import { useState } from 'react';
import { BookOpen, Shield, Compass, Swords, Sparkles, MapPin, Search } from 'lucide-react';
import type { WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playToggleSound } from '@/lib/sound';

type WikiSection = {
  id: string;
  category: string;
  title: string;
  badge: string;
  content: string;
  coordsSample?: string;
  tags: string[];
};

const WIKI_ARTICLES: WikiSection[] = [
  {
    id: 'w1',
    category: 'SURVIVAL BASIC',
    title: '拠点設営と標高・座標の基礎',
    badge: 'SLOT 01',
    content: '未知の空間に到着した際は、まず安全な水源と風除けとなる地形（岩陰や洞窟）を確保すること。空間座標 (X, Y, Z) のうち Y 軸は標高を表し、低層 (Y<30) は鉱脈が豊富だが危険な魔導反応が多く、高層 (Y>60) は視界が良好で安全である。',
    coordsSample: 'POS: X:100 Y:64 Z:-100',
    tags: ['拠点', '座標', 'Y軸標高', '安全基準'],
  },
  {
    id: 'w2',
    category: 'ANCIENT RUINS',
    title: '古代星門遺跡と魔導石柱群の探索規則',
    badge: 'SLOT 02',
    content: '翡翠に覆われた石柱群は古代文明の星間転送装置（星門）の痕跡と推測される。碑文の解読には魔導師の同行が必須。周囲に配置された防衛機構は夜間に活性化するため、日没前の撤退または周囲の結界展開を強く推奨する。',
    coordsSample: 'POS: X:280 Y:82 Z:-190',
    tags: ['古代遺跡', '星門', '結界', '魔導師'],
  },
  {
    id: 'w3',
    category: 'EXPEDITION TACTICS',
    title: '黒鉄地下大空洞の深層潜入マニュアル',
    badge: 'SLOT 03',
    content: '地下大空洞には発光キノコ群生地があり、自然光がない深層での貴重な光源となる。冷気噴出孔の近くには希少な冷光鉱石が生成されるが、凍傷と視界不良の危険があるため防寒装備とサーチライトを持参すること。',
    coordsSample: 'POS: X:410 Y:28 Z:50',
    tags: ['地下空洞', '冷気噴出孔', '鉱石採掘', '発光菌'],
  },
  {
    id: 'w4',
    category: 'TACTICAL LOG',
    title: '探検ログと宝箱写真アーカイブの活用法',
    badge: 'SLOT 04',
    content: 'HUD端末の「ロケーション記録」から撮影した写真は、宝箱コレクションとして自動的に保管される。同行したメンバーを記録しておくことで、後からタイムラインで誰といつどの拠点を訪れたかを振り返ることが可能。',
    tags: ['宝箱コレクション', '写真保存', 'メンバー記録'],
  },
];

export function WikiTab({ world }: { world: WorldWithMembers }) {
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<WikiSection>(WIKI_ARTICLES[0]);

  const filtered = WIKI_ARTICLES.filter(
    (a) =>
      a.title.includes(search) ||
      a.content.includes(search) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.tags.some((t) => t.includes(search))
  );

  return (
    <div className="min-h-full bg-[#06090e] text-[#e2e8f0] px-4 sm:px-6 py-6 max-w-4xl mx-auto font-mono">
      {/* Top Banner */}
      <div className="w-full mb-6 rounded-sm border border-slate-800 bg-[#090d16] p-4 px-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-sky-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(56,189,248,0.3)]">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-widest text-sky-400 uppercase font-mono">
              WIKI ARCHIVE // 旅の知識録
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              「{world.name}」の環境調査記録・生存指針データベース
            </p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-sky-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="知識録を検索..."
            className="w-full sm:w-60 pl-8 pr-3 py-1.5 rounded-sm bg-[#050a14] border border-slate-700 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Grid: Sidebar List + Article View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left list */}
        <div className="md:col-span-5 space-y-2.5">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
            ARTICLES // 項目一覧 ({filtered.length})
          </div>
          {filtered.map((art) => {
            const isActive = selectedArticle.id === art.id;
            return (
              <button
                key={art.id}
                type="button"
                onClick={() => {
                  playToggleSound();
                  setSelectedArticle(art);
                }}
                className={`w-full text-left p-3 rounded-sm border transition-all cursor-pointer ${
                  isActive
                    ? 'border-sky-500 bg-[#0d1627] shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'border-slate-800 bg-[#090d16] hover:border-slate-700 hover:bg-[#0c1322]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                    {art.category}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-sm bg-[#050a14] border border-slate-700 text-[9px] font-mono text-amber-400 font-bold">
                    {art.badge}
                  </span>
                </div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-sky-300' : 'text-slate-200'}`}>
                  {art.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Detail */}
        <div className="md:col-span-7">
          <div className="rounded-sm border border-slate-800 bg-[#090d16] p-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider">
                  [{selectedArticle.category}]
                </span>
                <h3 className="text-base font-bold text-amber-400 mt-0.5">
                  {selectedArticle.title}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-sm bg-amber-500/10 border border-amber-500/40 text-amber-400 font-mono text-xs font-bold">
                {selectedArticle.badge}
              </span>
            </div>

            {selectedArticle.coordsSample && (
              <div className="mb-4 p-2.5 rounded-sm bg-[#050a14] border border-slate-800 text-xs text-emerald-400 font-mono flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{selectedArticle.coordsSample}</span>
              </div>
            )}

            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">
              {selectedArticle.content}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-1.5">
              {selectedArticle.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-sm bg-[#050a14] border border-slate-700 text-[10px] text-slate-400 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
