import React from 'react';
import {
  Award,
  CheckCircle2,
  FileText,
  Terminal,
  FolderLock,
  Layers,
  Smartphone,
  Monitor,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { PROPOSALS_DATA } from '../data/proposalsData';
import { ProposalId } from '../types';

interface Props {
  onSelectProposal: (id: ProposalId) => void;
}

export const DesignEvaluationPanel: React.FC<Props> = ({ onSelectProposal }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 font-mono text-[#d1d1d1]">
      {/* 1. HERO EVALUATION BANNER */}
      <div className="bg-[#111114] border-2 border-[#ff3e3e] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#ff3e3e] font-bold uppercase tracking-widest">
              <Award className="w-4 h-4 text-[#ff3e3e]" />
              <span>CONFIDENTIAL UI/UX SPECIFICATION // PHASE 1</span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight font-sans">
              Dr.アーク SCP調記事ページ 3案比較・総合評価書
            </h1>
            <p className="text-xs sm:text-sm text-[#aaa] leading-relaxed font-sans">
              Survival Wikiの探索端末世界観を完全維持したまま、最高機密文書としての圧倒的なリアリティとスマートフォンでの3,000文字快適読書を両立する3つの設計構造を検証・評価します。
            </p>
          </div>

          {/* Recommended Proposal Quick Card */}
          <div className="shrink-0 bg-[#1a0a0a] border-2 border-[#ff3e3e] p-4 text-center max-w-xs shadow-xl">
            <span className="text-[9px] bg-[#c53030] text-white px-2 py-0.5 font-bold uppercase tracking-widest">
              OFFICIAL RECOMMENDATION
            </span>
            <div className="text-base font-bold text-white mt-1 font-sans">A案：DECLASSIFIED DOSSIER</div>
            <p className="text-xs text-[#ff9999] mt-1 font-sans">
              暗色端末×高コントラスト薄灰紙面（可読性・機密リアリティ・欠損耐性で最高評価）
            </p>
            <button
              onClick={() => onSelectProposal('proposal-a')}
              className="mt-3 w-full py-1.5 bg-[#c53030] hover:bg-[#b02828] text-white text-xs font-bold transition-colors shadow"
            >
              [ A案をプレビュー検証する ]
            </button>
          </div>
        </div>
      </div>

      {/* 2. THREE PROPOSALS SIDE-BY-SIDE SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
        {Object.values(PROPOSALS_DATA).map((spec) => (
          <div
            key={spec.id}
            className={`bg-[#0d0d0f] border p-5 flex flex-col justify-between transition-all hover:border-[#666] shadow-md ${
              spec.isRecommended
                ? 'border-[#ff3e3e] bg-[#140b0b]'
                : 'border-[#333]'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <div className="text-xs text-[#00ffcc] font-bold">{spec.nameEn}</div>
                {spec.isRecommended && (
                  <span className="text-[9px] bg-[#c53030] text-white px-1.5 py-0.2 font-bold tracking-wider">
                    ★第1推奨
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">{spec.nameJa}</h3>
              <p className="text-xs text-[#aaa] leading-relaxed">{spec.catchphrase}</p>

              {/* Specs Breakdown */}
              <div className="pt-2 border-t border-[#222] space-y-1.5 text-xs font-mono text-[#888]">
                <div>
                  <span className="text-[#666]">紙面構造:</span>{' '}
                  <span className="text-[#d1d1d1]">{spec.paperTypeJa}</span>
                </div>
                <div>
                  <span className="text-[#666]">写真の役割:</span>{' '}
                  <span className="text-[#d1d1d1]">{spec.photoRole.split('】')[0]}】</span>
                </div>
                <div>
                  <span className="text-[#666]">実装難易度:</span>{' '}
                  <span
                    className={`font-bold ${
                      spec.scores.implementationCost === 'LOW'
                        ? 'text-[#00ffcc]'
                        : spec.scores.implementationCost === 'MEDIUM'
                          ? 'text-[#f59e0b]'
                          : 'text-[#ff3e3e]'
                    }`}
                  >
                    {spec.scores.implementationCost}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#222] flex items-center justify-between font-mono">
              <div className="text-xs font-bold text-[#ff3e3e]">
                SCORE: {spec.recommendationRating} / 100
              </div>
              <button
                onClick={() => onSelectProposal(spec.id)}
                className="px-3 py-1 bg-[#111] hover:bg-[#222] text-[#00ffcc] text-xs border border-[#333] transition-colors"
              >
                [ VIEW ]
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. DETAILED EVALUATION MATRIX TABLE */}
      <div className="bg-[#0a0a0c] border border-[#333] overflow-hidden shadow-xl">
        <div className="bg-[#111] px-5 py-3 border-b border-[#333] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00ffcc] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#00ffcc]" />
            <span>3案比較 評価マトリクス (EVALUATION MATRIX)</span>
          </div>
          <span className="text-xs text-[#666]">優先評価基準に基づく客観比較</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0d0d0f] border-b border-[#333] text-[#888]">
                <th className="p-3.5 w-1/4">評価項目</th>
                <th className="p-3.5 w-1/4 text-[#ff3e3e] bg-[#1a0a0a]/60 border-x border-[#333] font-bold">
                  A案：解除済み機密文書 ★推奨
                </th>
                <th className="p-3.5 w-1/4 text-[#00ffcc]">B案：保安端末記録</th>
                <th className="p-3.5 w-1/4 text-[#f59e0b] border-l border-[#333]">
                  C案：現地証拠ファイル
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] text-[#ccc]">
              <tr>
                <td className="p-3.5 font-bold text-white bg-[#0a0a0c]">
                  1. スマホ長文可読性
                  <span className="block text-[10px] text-[#666] font-normal font-sans">
                    2500〜3000文字の眼精疲労軽減
                  </span>
                </td>
                <td className="p-3.5 bg-[#1a0a0a]/30 border-x border-[#333] font-bold text-[#ff9999]">
                  ★★★★★ (極めて高い)
                  <span className="block text-[11px] font-sans text-[#ddd] font-normal mt-0.5">
                    薄灰紙面×濃墨フォント。紙の書籍と同じ自然な眼球移動で長文を完読可能。
                  </span>
                </td>
                <td className="p-3.5">
                  ★★★★☆ (良好)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    高コントラスト暗色。短文は爽快だが、3000文字の連続読書ではやや眼圧が高い。
                  </span>
                </td>
                <td className="p-3.5 border-l border-[#333]">
                  ★★★★☆ (良好)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    フォルダ区切りで飽きにくいが、装飾カードの積み重ねで縦長になりやすい。
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-white bg-[#0a0a0c]">
                  2. 機密文書リアリティ
                  <span className="block text-[10px] text-[#666] font-normal font-sans">
                    Dr.アークの冷徹な世界観没入感
                  </span>
                </td>
                <td className="p-3.5 bg-[#1a0a0a]/30 border-x border-[#333] font-bold text-[#ff9999]">
                  ★★★★★ (完璧)
                  <span className="block text-[11px] font-sans text-[#ddd] font-normal mt-0.5">
                    極秘指定スタンプ、黒塗り、クリップ写真など、本物の機密報告書そのものの質感。
                  </span>
                </td>
                <td className="p-3.5">
                  ★★★★☆ (高い)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    サイバーセキュリティ・軍事端末の雰囲気。SF調の冷徹さがある。
                  </span>
                </td>
                <td className="p-3.5 border-l border-[#333]">
                  ★★★★★ (極めて高い)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    現地調査バインダーの生々しさ。捜査ファイルとしての臨場感が抜群。
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-white bg-[#0a0a0c]">
                  3. 写真0〜5枚・欠損耐性
                  <span className="block text-[10px] text-[#666] font-normal font-sans">
                    写真枚数変化・座標欠損への適応
                  </span>
                </td>
                <td className="p-3.5 bg-[#1a0a0a]/30 border-x border-[#333] font-bold text-[#ff9999]">
                  ★★★★★ (極めて柔軟)
                  <span className="block text-[11px] font-sans text-[#ddd] font-normal mt-0.5">
                    0枚時はアーカイブ公印スタンプで成立。座標・同行者欠損時も余白崩れゼロ。
                  </span>
                </td>
                <td className="p-3.5">
                  ★★★★☆ (良好)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    カルーセル化で枚数変化に強いが、0枚時のセンサーOFFLINE表示がやや無機質。
                  </span>
                </td>
                <td className="p-3.5 border-l border-[#333]">
                  ★★★☆☆ (普通)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    章ごとの写真リズムを前提とするため、0枚〜1枚時にフォルダ内の空白調整が必要。
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-white bg-[#0a0a0c]">
                  4. 既存Wiki端末との調和
                  <span className="block text-[10px] text-[#666] font-normal font-sans">
                    外側暗色HUDとの二重UI構造
                  </span>
                </td>
                <td className="p-3.5 bg-[#1a0a0a]/30 border-x border-[#333] font-bold text-[#ff9999]">
                  ★★★★★ (美しい対比)
                  <span className="block text-[11px] font-sans text-[#ddd] font-normal mt-0.5">
                    暗色の探索HUDの中に「機密書類を取り出して閲覧する」二重構造が最も明快。
                  </span>
                </td>
                <td className="p-3.5">
                  ★★★★★ (完全同系色)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    外側と完全に同一トーン。シームレスだが、紙面を開いた驚きはやや控えめ。
                  </span>
                </td>
                <td className="p-3.5 border-l border-[#333]">
                  ★★★★☆ (良好)
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    バインダー枠が端末内に綺麗に収まり、事件簿を開いた感覚が表現される。
                  </span>
                </td>
              </tr>

              <tr>
                <td className="p-3.5 font-bold text-white bg-[#0a0a0c]">
                  5. 実装負荷・保守性
                  <span className="block text-[10px] text-[#666] font-normal font-sans">
                    既存Markdown・DBのまま適用
                  </span>
                </td>
                <td className="p-3.5 bg-[#1a0a0a]/30 border-x border-[#333] font-bold text-[#00ffcc]">
                  【LOW】最も安全・高保守性
                  <span className="block text-[11px] font-sans text-[#ddd] font-normal mt-0.5">
                    通常の文書フロー＋装飾ヘッダーで成立するため、既存Markdown変換が極めて容易。
                  </span>
                </td>
                <td className="p-3.5 text-[#f59e0b] font-bold">
                  【MEDIUM】中程度
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    PC 3カラム＆スマホカルーセルの2系統レイアウト保守が必要。
                  </span>
                </td>
                <td className="p-3.5 border-l border-[#333] text-[#ff3e3e] font-bold">
                  【HIGH】やや高工数
                  <span className="block text-[11px] font-sans text-[#aaa] font-normal mt-0.5">
                    Markdown見出しを解析して各章フォルダに分割するパーサーロジックが必要。
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. WHY PROPOSAL A IS THE DEFINITIVE RECOMMENDATION */}
      <div className="bg-[#111114] border-2 border-[#ff3e3e] p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#ff3e3e] uppercase tracking-widest">
          <ShieldCheck className="w-5 h-5 text-[#ff3e3e]" />
          <span>OFFICIAL SELECTION RATIONALE // なぜA案を最も強く推奨するのか</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-sans">
          <div className="space-y-2 bg-[#0a0a0c] p-4 border border-[#333]">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff3e3e]" />
              理由1：3,000文字の「読了率」
            </div>
            <p className="text-[#aaa] text-xs leading-relaxed">
              Dr.アークの文章は、医学・科学・軍事調の硬質な日本語です。スマホの暗色画面でこれを長文読むと、文字のハレーションで目が疲労し途中で離脱されやすくなります。A案の薄灰紙面×濃墨文字（#1c1917）は、最も書籍に近く、最後までストレスなく読ませ切る圧倒的な力を持っています。
            </p>
          </div>

          <div className="space-y-2 bg-[#0a0a0c] p-4 border border-[#333]">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff3e3e]" />
              理由2：探索端末との「二重構造」
            </div>
            <p className="text-[#aaa] text-xs leading-relaxed">
              Survival Wikiの外側UI（暗色レトロターミナル）の中に、明るい機密調書がスッと開かれることで、「端末の深いストレージから物理的にスキャンされた極秘資料を引っ張り出した」という映画的な没入感が生まれます。
            </p>
          </div>

          <div className="space-y-2 bg-[#0a0a0c] p-4 border border-[#333]">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-[#ff3e3e]" />
              理由3：欠損データへの「鉄壁の耐性」
            </div>
            <p className="text-[#aaa] text-xs leading-relaxed">
              ユーザーが写真を1枚も撮っていない場合、座標を入力していない場合でも、公印スタンプとタイポグラフィだけで完全に「公文書」として成立します。空欄や崩れが一切生じないため、本番運用で最も安全です。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
