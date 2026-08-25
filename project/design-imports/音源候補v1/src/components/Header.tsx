import React from 'react';
import { Volume2, Sparkles, Sliders, Music, Layers } from 'lucide-react';
import { SoundCategory } from '../types';

interface HeaderProps {
  activeCategory: 'all' | SoundCategory | 'bgm';
  onSelectCategory: (cat: 'all' | SoundCategory | 'bgm') => void;
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  reverbWet: number;
  onReverbChange: (wet: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeCategory,
  onSelectCategory,
  masterVolume,
  onVolumeChange,
  reverbWet,
  onReverbChange,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        {/* Top Line: Brand & Master Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            {/* Joy-Con accent icon */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl shadow-inner">
              <div className="w-2.5 h-6 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
              <div className="w-2.5 h-6 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>16bit × Switch Sound Studio</span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Web Audio Synth
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                16bitレトロノスタルジー × Switch風残響音響エンジン
              </p>
            </div>
          </div>

          {/* Master Volume & Reverb Dials */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Master Volume */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400 font-mono">Master:</span>
              <span className="font-mono text-cyan-300 font-semibold w-8">
                {Math.round(masterVolume * 100)}%
              </span>
              <input
                id="master-vol-slider"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={masterVolume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Switch Reverb Wet */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400 font-mono">Switch残響:</span>
              <span className="font-mono text-rose-300 font-semibold w-8">
                {Math.round(reverbWet * 100)}%
              </span>
              <input
                id="reverb-slider"
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={reverbWet}
                onChange={(e) => onReverbChange(Number(e.target.value))}
                className="w-16 accent-rose-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => onSelectCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
              activeCategory === 'all'
                ? 'bg-slate-100 text-slate-950 border-white shadow-md font-semibold'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            全音源一覧 (12 SE + 1 BGM)
          </button>

          <button
            onClick={() => onSelectCategory('system')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 border ${
              activeCategory === 'system'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-md shadow-cyan-500/20'
                : 'bg-slate-900 text-cyan-400/90 border-slate-800 hover:border-cyan-500/40'
            }`}
          >
            1. システム基本音 (4種)
          </button>

          <button
            onClick={() => onSelectCategory('screen')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 border ${
              activeCategory === 'screen'
                ? 'bg-indigo-500 text-white border-indigo-400 font-semibold shadow-md shadow-indigo-500/20'
                : 'bg-slate-900 text-indigo-400/90 border-slate-800 hover:border-indigo-500/40'
            }`}
          >
            2. 画面切替演出音 (3種)
          </button>

          <button
            onClick={() => onSelectCategory('action')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 border ${
              activeCategory === 'action'
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-semibold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-amber-400/90 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            3. アクション体験音 (3種)
          </button>

          <button
            onClick={() => onSelectCategory('wiki')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 border ${
              activeCategory === 'wiki'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-semibold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-emerald-400/90 border-slate-800 hover:border-emerald-500/40'
            }`}
          >
            4. 生成解析音 (2種)
          </button>

          <button
            onClick={() => onSelectCategory('bgm')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-1.5 border ${
              activeCategory === 'bgm'
                ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white border-white font-semibold shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            ワールド選択BGM (約30秒)
          </button>
        </div>
      </div>
    </header>
  );
};
