import React, { useState, useEffect } from 'react';
import { WikiNpc, WikiArticle } from '../../types';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface WikiCompilingModalProps {
  npc: WikiNpc;
  isOpen: boolean;
  onFinish: (article: WikiArticle) => void;
}

export const WikiCompilingModal: React.FC<WikiCompilingModalProps> = ({
  npc,
  isOpen,
  onFinish,
}) => {
  if (!isOpen) return null;

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let currentText = '';
    let charIdx = 0;
    const targetQuote = isCompleted
      ? npc.finishedQuote
      : npc.compilingQuote[quoteIndex] || npc.compilingQuote[0];

    const typeInterval = setInterval(() => {
      if (charIdx < targetQuote.length) {
        currentText += targetQuote[charIdx];
        setDisplayText(currentText);
        soundEngine.playSe('typewriter_beep');
        charIdx++;
      } else {
        clearInterval(typeInterval);
      }
    }, 45);

    return () => clearInterval(typeInterval);
  }, [quoteIndex, isCompleted, npc]);

  // Step through quotes and finish
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setQuoteIndex(1);
    }, 2200);

    const timer2 = setTimeout(() => {
      setQuoteIndex(2);
    }, 4400);

    const timer3 = setTimeout(() => {
      setIsCompleted(true);
      soundEngine.playSe('wiki_ready');
    }, 6600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleRead = () => {
    soundEngine.playSe('menu_select');
    // Construct or retrieve compiled article
    const newArticle: WikiArticle = {
      id: `art-${Date.now()}`,
      worldId: 'world-1',
      style: npc.style,
      npcId: npc.id,
      title:
        npc.style === 'encyclopedia'
          ? 'エメラルド諸島開拓史：東部沿岸域と海中遺構の総合知見'
          : npc.style === 'scp'
          ? '文書アーカイブ：ITEM-EMERALD-09「諸島海域異常構造群」'
          : '叙事詩：波濤を越えし開拓者たちの年代記',
      subtitle: `${npc.role} // ${npc.name} 編纂`,
      summary:
        '蓄積された日々の探索データをもとに、地理、拠点、生態系、未解明の遺構群を精緻に編纂した公式アーカイブである。',
      keyStats: [
        { label: '編纂完了日', value: '2026-08-29' },
        { label: '編纂官', value: npc.name },
        { label: '収録ログ件数', value: '6 件' },
        { label: '文体', value: npc.title },
      ],
      contentMarkdown: `## 1. 探索の端緒と基本観測

開拓隊による探索記録を体系的に整理した。沿岸拠点および海中遺構の調査ログに基づき、本諸島における活動状況が克明に記されている。

* **重要拠点**: 第一前哨基地・灯台テラス
* **特異点**: エメラルド珊瑚礁と海中洞窟

---

## 2. 結論

開拓活動は極めて良好な進捗を示しており、次期探査計画への移行が推奨される。`,
      photoUrls: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
      ],
      generatedAt: '2026-08-29 19:30',
    };

    onFinish(newArticle);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05080E]/95 backdrop-blur-lg">
      <div className="w-full max-w-lg bg-[#0F172A] border-2 border-[#06B6D4] rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] hud-scanlines relative">
        {/* NPC Avatar Portrait with glowing ring */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-2xl overflow-hidden border-2 border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          <img
            src={npc.avatar}
            alt={npc.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* NPC Details & Role */}
        <div>
          <div className="text-xs font-mono text-[#06B6D4] uppercase tracking-wider">
            {npc.role}
          </div>
          <h3 className="text-lg sm:text-xl font-game font-bold text-[#F8FAFC] mt-0.5">
            {npc.name}
          </h3>
        </div>

        {/* Compiling Typewriter Speech Bubble */}
        <div className="bg-[#0B1018] p-4 sm:p-5 rounded-xl border border-[#1E293B] min-h-[100px] flex items-center justify-center text-left">
          <p className="text-sm sm:text-base font-jp text-[#E2E8F0] leading-relaxed italic">
            {displayText}
            <span className="inline-block w-2 h-4 bg-[#06B6D4] ml-1 animate-pulse" />
          </p>
        </div>

        {/* Progress or Ready Status Action */}
        <div className="pt-2">
          {isCompleted ? (
            <button
              id="btn-read-compiled-article"
              type="button"
              onClick={handleRead}
              className="w-full py-3.5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B1018] font-game font-bold text-sm sm:text-base tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-95 animate-bounce"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>編纂完了 // 記事を読む</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#64748B]">
              <Sparkles className="w-4 h-4 text-[#06B6D4] animate-spin" />
              <span>年代記を編纂中…… しばらくお待ちください</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
