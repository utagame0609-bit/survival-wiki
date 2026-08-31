import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Layers, Smartphone, Monitor } from 'lucide-react';

interface EvaluationItem {
  no: number;
  name: string;
  scoreA: number;
  scoreB: number;
  scoreC: number;
  noteA: string;
  noteB: string;
  noteC: string;
}

const EVALUATION_DATA: EvaluationItem[] = [
  {
    no: 1,
    name: 'スマートフォン長文読書の快適さ',
    scoreA: 5,
    scoreB: 5,
    scoreC: 5,
    noteA: '初期状態で目次を閉じ、上部の「章を見る」からボトムシートでいつでも開閉可能。現在章が自然にわかり、1カラムで極上の読書感',
    noteB: '文字サイズ17px・行間1.9・インライン注釈で紙の文庫本並みの圧倒的没入感',
    noteC: '全幅カードと自然な余白で現代の旅ブログ感覚。最もテンポ良く読了できる'
  },
  {
    no: 2,
    name: 'PCでの特別感',
    scoreA: 5,
    scoreB: 4,
    scoreC: 4,
    noteA: '左側旅程マイルストーンレールと格調高い濃紺・金テーマが圧倒的な年代記感を演出',
    noteB: '中央写本カラムと金泥の額装が重厚で気品ある書物世界を確立',
    noteC: '旅情スタンプと写真リボンがパーソナルな手記として洗練'
  },
  {
    no: 3,
    name: '開いた瞬間のワクワク感',
    scoreA: 5,
    scoreB: 4,
    scoreC: 5,
    noteA: '静謐な格調と章節マイルストーンで「旅人の足跡を辿る冒険」の幕開けを感じる',
    noteB: '中世写本の金枠とドロップキャップで「世界に一冊の秘録」に出会う感動',
    noteC: '現代ユーザーが「自分のキャンプや旅もこう残したい！」と最も強く惹き込まれる'
  },
  {
    no: 4,
    name: 'ギルダス人格との一致',
    scoreA: 5,
    scoreB: 5,
    scoreC: 5,
    noteA: '旅人の足跡を後世に語り継ぐ老吟遊詩人ギルダスの編纂物として完全に一致',
    noteB: '老詩人が後世のために一字一字書き写した写本という舞台装置が完璧',
    noteC: '焚き火を囲んで語る老詩人の温もりと仲間への敬意が最も直接伝わる'
  },
  {
    no: 5,
    name: '写真5枚の魅力',
    scoreA: 4,
    scoreB: 4,
    scoreC: 5,
    noteA: '首位光景＋各章の挿絵として展開。やや縦スクロールが長くなる',
    noteB: '章ごとの額装写本挿画として品格高く配置。絵巻物のような統一感',
    noteC: '冒頭の追憶リボン＋文中の印画紙プレート。5枚の旅情が最も豊かに躍動'
  },
  {
    no: 6,
    name: '写真1枚の成立度',
    scoreA: 5,
    scoreB: 5,
    scoreC: 5,
    noteA: '「この旅で唯一残された象徴的光景」としてヒーロー枠が堂々完成',
    noteB: '写本の表紙を飾る金枠ミニチュアとして完璧な佇まい',
    noteC: '手帳の扉絵として、一枚の写真が持つ情緒を余すところなく昇華'
  },
  {
    no: 7,
    name: '写真0枚の成立度',
    scoreA: 5,
    scoreB: 5,
    scoreC: 4,
    noteA: '星辰のアストロラーベ風タイポグラフィ紋章により、写真なしでも豪華',
    noteB: '写本独自の装飾罫線と頭文字オーナメントで最初から完成された本に見える',
    noteC: 'クリーンに成立するが、写真がないとややテキスト主体の手記に寄る'
  },
  {
    no: 8,
    name: '大切な思い出を美しく扱えるか',
    scoreA: 5,
    scoreB: 5,
    scoreC: 5,
    noteA: '星空の静寂と永遠性により、家族や仲間との記憶が崇高な伝説へ昇華',
    noteB: '王国の記録書のような厳かな敬意が保たれ、大切な節目に相応しい',
    noteC: '焚き火の温もりと感謝が前面に出て、日常の宝物が最も愛おしく感じられる'
  },
  {
    no: 9,
    name: '日常の小ネタを楽しく伝説化できるか',
    scoreA: 5,
    scoreB: 4,
    scoreC: 5,
    noteA: '「荷の重さ20kg」「迷子＝精霊の小径」など日常の小事がいきなり神話化する面白さ',
    noteB: '重厚な写本スタイルと日常の失敗談のギャップで知的なユーモアが生まれる',
    noteC: '手帳のメモやスタンプと相まって、冒険コメディの躍動感が最高に生きる'
  },
  {
    no: 10,
    name: '長期間使っても飽きにくいか',
    scoreA: 4,
    scoreB: 5,
    scoreC: 5,
    noteA: '星辰テーマの完成度が高い分、日常的な短いメモでは少し大仰に感じる可能性',
    noteB: 'クラシックな書物タイポグラフィを基軸にしており、最も普遍的で飽きが来ない',
    noteC: '現代UIとファンタジーのバランスが絶妙で、旅行記や日常ログを量産しやすい'
  },
  {
    no: 11,
    name: 'Survival Wiki外側HUDとの相性',
    scoreA: 5,
    scoreB: 4,
    scoreC: 5,
    noteA: '暗色端末HUDと星辰年代記の「現在端末×過去神話」の二重構造が最高にマッチ',
    noteB: '暗色HUDの中に金枠写本が現れるコントラストは美しいが境界設計に配慮要',
    noteC: 'HUDのログ感覚と手記の親和性が非常に高く、自然に溶け込む'
  },
  {
    no: 12,
    name: '本番へ忠実移植できる現実性',
    scoreA: 4,
    scoreB: 5,
    scoreC: 5,
    noteA: 'サイドレールと目次連動のDOM構造があるため、若干CSS設計に注意が必要',
    noteB: '素直な単一カラムDOM構造で、Tailwindクラスのまま極めて容易に移植可能',
    noteC: 'コンポーネント構造が最もシンプルで、本番React環境への移植負荷が最小'
  }
];

export const EvaluationView: React.FC = () => {
  const totalA = EVALUATION_DATA.reduce((sum, item) => sum + item.scoreA, 0);
  const totalB = EVALUATION_DATA.reduce((sum, item) => sum + item.scoreB, 0);
  const totalC = EVALUATION_DATA.reduce((sum, item) => sum + item.scoreC, 0);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-10 text-slate-200 font-sans-clean">
      {/* Header Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-[#111824] border border-amber-500/30 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider mb-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Design Evaluation Matrix &bull; 12項目総合比較評価</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold font-serif-jp text-white mb-2">
          ギルダス記事閲覧領域 A/B/C案 比較検証結果
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-serif-jp">
          「現代ユーザーが自分のゲームログ・旅行・キャンプ・家族との写真をこのスタイルで記事化してみたい」と思えるワクワク感、スマホ390px完全1カラムでの長文可読性、写真0〜5枚の成立度を厳密に検証した評価表です。
        </p>

        {/* Score Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {/* Proposal A */}
          <div className="p-4 rounded-xl bg-[#162030] border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-cinzel text-cyan-300 font-semibold">Proposal A</span>
              <h3 className="font-serif-jp font-bold text-white text-base mt-0.5">旅人の年代記</h3>
              <p className="text-xs text-slate-400 mt-1">旅路と章節マイルストーンを刻む手記</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">総合スコア</span>
              <span className="text-2xl font-bold font-mono text-cyan-300">{totalA} <span className="text-xs text-slate-400">/ 60</span></span>
            </div>
          </div>

          {/* Proposal B */}
          <div className="p-4 rounded-xl bg-[#18202a] border border-amber-500/30 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-cinzel text-amber-300 font-semibold">Proposal B</span>
              <h3 className="font-serif-jp font-bold text-white text-base mt-0.5">吟遊詩人の装飾写本集</h3>
              <p className="text-xs text-slate-400 mt-1">金泥と額装挿画の格式高き中世写本</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
              <span className="text-xs text-slate-400">総合スコア</span>
              <span className="text-2xl font-bold font-mono text-amber-300">{totalB} <span className="text-xs text-slate-400">/ 60</span></span>
            </div>
          </div>

          {/* Proposal C (Recommended) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#162234] border-2 border-amber-400 shadow-lg flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-stone-950 font-bold text-[10px] font-cinzel rounded-bl">
              RECOMMENDED
            </div>
            <div>
              <span className="text-[11px] font-cinzel text-amber-400 font-bold">Proposal C</span>
              <h3 className="font-serif-jp font-bold text-white text-base mt-0.5">記憶の遺物帳／旅の追憶手記</h3>
              <p className="text-xs text-slate-300 mt-1">旅情と日常の宝物を温かく照らす手記</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-baseline justify-between">
              <span className="text-xs text-amber-300 font-semibold">総合スコア</span>
              <span className="text-2xl font-black font-mono text-amber-300">{totalC} <span className="text-xs text-slate-400">/ 60</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Item Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#0d131d] shadow-xl mb-10">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#141c28] border-b border-slate-700/80 text-slate-300 font-cinzel">
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3 w-52 font-serif-jp">評価項目（12項目）</th>
              <th className="p-3 w-64 border-l border-slate-800 text-cyan-300">A案: 旅人年代記</th>
              <th className="p-3 w-64 border-l border-slate-800 text-amber-300">B案: 装飾写本集</th>
              <th className="p-3 w-64 border-l border-slate-800 text-amber-200 bg-amber-950/20 font-bold">
                C案: 追憶手記 ★推奨
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-serif-jp">
            {EVALUATION_DATA.map((item) => (
              <tr key={item.no} className="hover:bg-slate-800/30 transition-colors">
                <td className="p-3 text-center font-mono text-slate-500">{item.no}</td>
                <td className="p-3 font-semibold text-white">{item.name}</td>
                {/* Proposal A */}
                <td className="p-3 border-l border-slate-800">
                  <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-cyan-300">
                    {'★'.repeat(item.scoreA)}{'☆'.repeat(5 - item.scoreA)}
                    <span className="text-slate-400 text-[11px] font-normal">({item.scoreA}/5)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.noteA}</p>
                </td>
                {/* Proposal B */}
                <td className="p-3 border-l border-slate-800">
                  <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-amber-300">
                    {'★'.repeat(item.scoreB)}{'☆'.repeat(5 - item.scoreB)}
                    <span className="text-slate-400 text-[11px] font-normal">({item.scoreB}/5)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.noteB}</p>
                </td>
                {/* Proposal C */}
                <td className="p-3 border-l border-slate-800 bg-amber-950/10">
                  <div className="flex items-center gap-1.5 mb-1 font-mono font-bold text-amber-300">
                    {'★'.repeat(item.scoreC)}{'☆'.repeat(5 - item.scoreC)}
                    <span className="text-amber-200/70 text-[11px] font-normal">({item.scoreC}/5)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug font-medium">{item.noteC}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommendation Summary Details */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#141d2a] border border-amber-500/30 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-xs font-cinzel text-amber-400 font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-5 h-5 text-amber-400" />
          <span>AI Studio Recommended Decision &bull; 推奨案の選定理由</span>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-200 font-serif-jp leading-relaxed">
          <h3 className="text-lg font-bold text-amber-200">
            結論：『C案：記憶の遺物帳／旅の追憶手記 (The Memory Reliquary)』を最も推奨します
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#0f1722] border border-amber-500/20">
              <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                C案が他2案より優れている点
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                <li><strong className="text-white">ユーザーの共感とワクワク感：</strong> ゲームログ・日常キャンプ・家族写真が「旅の追憶カード」として最も魅力的に映え、「自分もこのスタイルで残したい」という感情を最高潮に刺激します。</li>
                <li><strong className="text-white">スマホ390px完全1カラムの最適解：</strong> 装飾を無理に押し込まず、全幅フォトプレートと17px本文フォントで最も心地よい縦スクロール読書を実現。</li>
                <li><strong className="text-white">日常と大切な記憶の両立：</strong> 小さな失敗の伝説化も、家族との大切な思い出も、同じ器で温かく受け止められます。</li>
                <li><strong className="text-white">本番移植の圧倒的容易さ：</strong> 複雑なサイドレールに依存しないため、既存Survival Wikiコードベースへ最も安全・確実に移植できます。</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#0f1722] border border-amber-500/20">
              <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                採用前に確認すべき弱点と対策
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300">
                <li><strong className="text-white">PC画面での余白活用：</strong> A案の垂直ジャーニーレールのような大型ギミックがないため、PC超ワイド画面では本文最大幅（max-w-4xl）で中央配置されます（読書快適性としては理想的）。</li>
                <li><strong className="text-white">写真0枚時の演出：</strong> 写真がない場合、A/B案よりシンプルになりますが、今回実装した「形なき言霊の認証章」により品格を保持しています。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
