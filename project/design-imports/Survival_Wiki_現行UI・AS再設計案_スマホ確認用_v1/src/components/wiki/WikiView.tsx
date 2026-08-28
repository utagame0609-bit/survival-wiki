import React, { useState, useEffect } from 'react';
import { Sparkles, BookOpen, Shield, Scroll, CheckCircle2, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { World, AdventureRecord, WikiStyle, WikiArticle } from '../../types';
import { NARRATOR_LIST } from '../../data/narrators';
import { StorageService } from '../../lib/storage';
import { generateWikiChronicle } from '../../lib/geminiWiki';
import { WikiReader } from './WikiReader';
import {
  playConfirmSound,
  playHoverSound,
  playMilestoneSound,
  playNarratorVoiceSound,
  soundEngine,
} from '../../audio/soundEngine';

interface WikiViewProps {
  world: World;
  records: AdventureRecord[];
}

export const WikiView: React.FC<WikiViewProps> = ({ world, records }) => {
  const [selectedStyle, setSelectedStyle] = useState<WikiStyle>('wikipedia');
  const [currentArticle, setCurrentArticle] = useState<WikiArticle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');

  // Load existing article for selected style if available
  useEffect(() => {
    const existing = StorageService.getWikiArticle(world.id, selectedStyle);
    setCurrentArticle(existing);
  }, [world.id, selectedStyle]);

  const activeNarrator = NARRATOR_LIST.find((n) => n.id === selectedStyle) || NARRATOR_LIST[0];

  const handleSelectStyle = (style: WikiStyle) => {
    setSelectedStyle(style);
    playNarratorVoiceSound(style);
    // Switch BGM according to style
    if (style === 'wikipedia') soundEngine.playBgm('wikipedia');
    else if (style === 'scp') soundEngine.playBgm('scp');
    else soundEngine.playBgm('ancient');
  };

  const handleGenerate = async () => {
    if (records.length === 0) return;
    setIsGenerating(true);
    soundEngine.playBgm(selectedStyle);
    playConfirmSound();

    setProgressText('全記録データを解析中 (PARSING RECORDS)...');

    setTimeout(() => {
      setProgressText('地点・座標・写真メタデータを統合中 (MERGING GEO DATA)...');
    }, 800);

    setTimeout(() => {
      setProgressText(`AI編纂官「${activeNarrator.name}」が文体を構築中 (SYNTHESIZING)...`);
    }, 1600);

    try {
      const article = await generateWikiChronicle(world, records, selectedStyle);
      StorageService.saveWikiArticle(article);
      setCurrentArticle(article);
      playMilestoneSound();
    } catch (err) {
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
      setProgressText('');
    }
  };

  const handleResetArticle = () => {
    StorageService.resetWikiArticle(world.id, selectedStyle);
    setCurrentArticle(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Top Banner: Status & Overview */}
      <div className="bg-[#141414] border border-[#262626] p-4 sm:p-5 rounded-sm shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-sm bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                  AI CHRONICLE COMPILER
                </span>
                <span className="text-xs font-mono text-[#D4AF37] font-medium hidden xs:inline">
                  ● READY TO COMPILE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#E5E5E5] font-mono mt-0.5">
                AI 旅の書 // 自動編纂システム
              </h2>
            </div>
          </div>

          <div className="text-xs font-mono text-[#A3A3A3] bg-[#0A0A0A] px-3 py-2 border border-[#262626] rounded-sm shrink-0">
            <span>ソースデータ: </span>
            <strong className="text-[#D4AF37]">{records.length} 件の日誌</strong>
            <span className="text-[#737373]"> / </span>
            <strong className="text-[#E5E5E5]">
              {records.reduce((sum, r) => sum + (r.photos?.length || 0), 0)} 枚の写真
            </strong>
          </div>
        </div>

        {/* 3 Narrator Style Cards Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {NARRATOR_LIST.map((narrator) => {
            const isSelected = selectedStyle === narrator.id;
            const hasArticle = Boolean(
              StorageService.getWikiArticle(world.id, narrator.id)
            );

            return (
              <button
                key={narrator.id}
                type="button"
                onClick={() => handleSelectStyle(narrator.id)}
                onMouseEnter={playHoverSound}
                className={`relative p-3.5 sm:p-4 text-left rounded-sm border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'border-[#262626] bg-[#0F0F0F] hover:border-[#333333]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{narrator.avatarEmoji}</span>
                    {hasArticle && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-medium bg-[#1F1F1F] text-[#D4AF37] border border-[#D4AF37]/40 rounded-sm">
                        編纂済
                      </span>
                    )}
                  </div>

                  <h3
                    className={`font-mono font-bold text-xs sm:text-sm mb-1 ${
                      isSelected ? 'text-[#D4AF37]' : 'text-[#E5E5E5]'
                    }`}
                  >
                    {narrator.name}
                  </h3>
                  <div className="text-[10px] font-mono text-[#D4AF37] font-medium mb-2">
                    {narrator.tagline}
                  </div>
                  <p className="text-xs text-[#737373] line-clamp-2 mb-3">
                    {narrator.description}
                  </p>
                </div>

                {/* Sample voice line */}
                <div className="p-2 bg-black/50 border border-[#262626] rounded-sm text-[11px] font-sans text-[#A3A3A3] italic">
                  &ldquo;{narrator.sampleVoiceLine}&rdquo;
                </div>
              </button>
            );
          })}
        </div>

        {/* Generate / Action Trigger */}
        <div className="mt-4 pt-4 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#737373] font-mono">
            選択中: <strong className="text-[#D4AF37]">{activeNarrator.name}</strong> （{activeNarrator.tone}）
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || records.length === 0}
            onMouseEnter={playHoverSound}
            className="w-full sm:w-auto px-6 py-3 bg-[#D4AF37] hover:bg-[#E5C158] disabled:opacity-50 text-black font-mono font-bold text-xs sm:text-sm border-b-2 border-[#A68824] active:border-b-0 active:translate-y-0.5 rounded-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
                <span>{progressText || '旅の書を錬成中...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-black stroke-none" />
                <span>
                  {currentArticle ? '▶ このスタイルで再編纂する' : '▶ 旅の書を自動編纂する (GENERATE)'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Article Output Reader */}
      {currentArticle ? (
        <WikiReader
          world={world}
          article={currentArticle}
          onRegenerate={handleGenerate}
          onReset={handleResetArticle}
        />
      ) : (
        <div className="border border-dashed border-[#262626] bg-[#141414]/70 p-8 sm:p-12 text-center rounded-sm">
          <BookOpen className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#E5E5E5] mb-1">
            まだ「{activeNarrator.name}」の旅の書は編纂されていません
          </h3>
          <p className="text-xs text-[#737373] max-w-md mx-auto mb-4">
            上部の「▶ 旅の書を自動編纂する」ボタンを押すと、記録された全日誌と写真を元にAIが独自の視点からクロニクル記事を書き上げます。
          </p>
        </div>
      )}
    </div>
  );
};
