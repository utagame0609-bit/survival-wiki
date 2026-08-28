import React, { useState } from 'react';
import { Sparkles, BookOpen, Copy, Check, RefreshCw, MessageSquare, Shield, Share2, Info } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { generateAiWiki } from '../lib/geminiClient';
import { playAddSound, playHoverSound, playSuccessSound, playConfirmSound } from '../lib/soundEngine';
import { useViewMode } from '../context/ViewModeContext';

interface WikiTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
}

export function WikiTab({ world, locations }: WikiTabProps) {
  const { isMobile } = useViewMode();
  const [style, setStyle] = useState<'wikipedia' | 'scp' | 'ancient'>('wikipedia');
  const [wikiContent, setWikiContent] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    playHoverSound();
    setGenerating(true);
    try {
      const res = await generateAiWiki({
        world,
        locations,
        style,
      });

      setWikiContent(res.content);
      playSuccessSound();
    } catch (e) {
      console.error('Wiki gen error:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!wikiContent) return;
    try {
      await navigator.clipboard.writeText(wikiContent);
      playSuccessSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Narrative AI Generator Controls - Compact & Fits in 1 screen */}
      <div className="border-2 border-cyan-500/70 bg-[#0f1424] p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.5)] rounded-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>冒険譚・年代記自動編纂</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded-xs">
            対象記録: {locations.length}件
          </span>
        </div>

        {/* Narrative Style Selection - Compact Grid */}
        <div className="space-y-1">
          <label className="block text-[11px] font-mono text-slate-300 font-bold">
            編纂スタイルを選択:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                playHoverSound();
                setStyle('wikipedia');
              }}
              className={`p-2 border text-left cursor-pointer transition-all rounded-xs flex items-center gap-2 ${
                style === 'wikipedia'
                  ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-sm'
                  : 'border-slate-700 bg-[#0c101c] text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-sm shrink-0">📖</span>
              <div className="min-w-0">
                <div className="text-xs font-bold font-mono text-cyan-300 truncate">百科事典 Wiki風</div>
                <div className="text-[9px] text-slate-400 truncate">体系的・客観的解説</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playHoverSound();
                setStyle('scp');
              }}
              className={`p-2 border text-left cursor-pointer transition-all rounded-xs flex items-center gap-2 ${
                style === 'scp'
                  ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-sm'
                  : 'border-slate-700 bg-[#0c101c] text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-sm shrink-0">🔬</span>
              <div className="min-w-0">
                <div className="text-xs font-bold font-mono text-cyan-300 truncate">特異事象報告 (SCP風)</div>
                <div className="text-[9px] text-slate-400 truncate">調査員ログ・異常観測</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                playHoverSound();
                setStyle('ancient');
              }}
              className={`p-2 border text-left cursor-pointer transition-all rounded-xs flex items-center gap-2 ${
                style === 'ancient'
                  ? 'border-cyan-400 bg-cyan-950/60 text-white shadow-sm'
                  : 'border-slate-700 bg-[#0c101c] text-slate-400 hover:border-slate-500'
              }`}
            >
              <span className="text-sm shrink-0">📜</span>
              <div className="min-w-0">
                <div className="text-xs font-bold font-mono text-cyan-300 truncate">古代伝承の詩</div>
                <div className="text-[9px] text-slate-400 truncate">語り継がれる叙事詩・神話</div>
              </div>
            </button>
          </div>
        </div>

        {/* Generate Button - Fits with style selector on 1 screen */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || locations.length === 0}
          onMouseEnter={playHoverSound}
          className="w-full min-h-[44px] py-2.5 px-4 bg-cyan-500 text-black font-black font-mono text-xs sm:text-sm border-b-3 border-cyan-700 hover:bg-cyan-400 active:translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_12px_rgba(6,182,212,0.25)] rounded-xs"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>AI が冒険譚を編纂中... // GENERATING...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>このワールドの Wiki 冒険譚を生成する</span>
            </>
          )}
        </button>

        {locations.length === 0 ? (
          <p className="text-[10px] text-amber-400 text-center font-mono">
            ※ 冒険譚を生成するには、まず1つ以上のロケーションを記録してください。
          </p>
        ) : (
          /* Descriptive text moved to bottom */
          <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-400 font-sans border-t border-slate-800">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <p>これまでに記録された座標・メモ・写真を元に、Gemini AIが世界の年代記を自動生成します。</p>
          </div>
        )}
      </div>

      {/* Generated Wiki Story Viewer */}
      {wikiContent && (
        <div className="border-2 border-slate-700 bg-[#0f1424] p-4 sm:p-5 rounded-xs space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">
                {world.name} // OFFICIAL CHRONICLE
              </h3>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              onMouseEnter={playHoverSound}
              className="px-2.5 py-1 bg-[#0c101c] border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 text-xs font-mono flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? 'コピー完了' : '本文コピー'}</span>
            </button>
          </div>

          <div className="prose prose-invert max-w-none text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2.5 font-sans whitespace-pre-wrap">
            {wikiContent}
          </div>
        </div>
      )}
    </div>
  );
}

