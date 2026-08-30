import React from 'react';
import {
  FileText,
  Terminal,
  FolderLock,
  Smartphone,
  Monitor,
  Columns,
  Image,
  Compass,
  Users,
  AlignLeft,
  Sparkles,
  Award,
  ShieldAlert,
  Maximize,
  TabletSmartphone,
} from 'lucide-react';
import { ActiveSimulationState, PhotoCountOption, ProposalId, ViewportMode } from '../types';
import { PROPOSALS_DATA } from '../data/proposalsData';

interface Props {
  state: ActiveSimulationState;
  onChange: (updates: Partial<ActiveSimulationState>) => void;
  activeTab: 'preview' | 'evaluation';
  setActiveTab: (tab: 'preview' | 'evaluation') => void;
}

export const StateControlBar: React.FC<Props> = ({
  state,
  onChange,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-[#0a0a0c] border-b border-[#333338] text-xs text-[#d1d1d1] font-mono shadow-2xl">
      {/* Top Bar: Proposal Selection & Main View Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Branding & Proposals */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-[#111114] border border-[#ff3e3e] text-[#ff3e3e] text-[10px] tracking-widest uppercase font-bold">
            <span className="w-1.5 h-1.5 bg-[#ff3e3e] rounded-none animate-pulse" />
            <span>TOP SECRET</span>
            <span className="text-[#444]">|</span>
            <span className="text-[#aaa]">SURVIVAL_WIKI</span>
          </div>

          {/* Proposal Tabs */}
          <div className="flex items-center bg-[#111114] p-0.5 border border-[#333338] overflow-x-auto max-w-full">
            <button
              onClick={() => {
                onChange({ proposal: 'proposal-a' });
                setActiveTab('preview');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 transition-all text-[11px] sm:text-xs font-mono tracking-tight whitespace-nowrap ${
                state.proposal === 'proposal-a' && activeTab === 'preview'
                  ? 'bg-[#1a0a0a] text-white border-l-2 border-[#ff3e3e] font-bold'
                  : 'text-[#888] hover:text-[#eee] hover:bg-[#1a1a1e]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#ff3e3e]" />
              <span>A案：機密調書 (Dossier)</span>
              <span className="text-[8px] bg-[#c53030] text-white px-1.5 py-0.2 uppercase font-bold tracking-wider hidden xs:inline">
                ★第1推奨
              </span>
            </button>

            <button
              onClick={() => {
                onChange({ proposal: 'proposal-b' });
                setActiveTab('preview');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 transition-all text-[11px] sm:text-xs font-mono tracking-tight whitespace-nowrap ${
                state.proposal === 'proposal-b' && activeTab === 'preview'
                  ? 'bg-[#0a1515] text-[#00ffcc] border-l-2 border-[#00ffcc] font-bold'
                  : 'text-[#888] hover:text-[#eee] hover:bg-[#1a1a1e]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-[#00ffcc]" />
              <span>B案：保安端末 (Terminal)</span>
            </button>

            <button
              onClick={() => {
                onChange({ proposal: 'proposal-c' });
                setActiveTab('preview');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 transition-all text-[11px] sm:text-xs font-mono tracking-tight whitespace-nowrap ${
                state.proposal === 'proposal-c' && activeTab === 'preview'
                  ? 'bg-[#1a1608] text-[#f59e0b] border-l-2 border-[#f59e0b] font-bold'
                  : 'text-[#888] hover:text-[#eee] hover:bg-[#1a1a1e]'
              }`}
            >
              <FolderLock className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>C案：証拠ファイル (Binder)</span>
            </button>
          </div>
        </div>

        {/* Right: Evaluation & Viewport */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Design Specs / Evaluation Tab */}
          <button
            onClick={() => setActiveTab(activeTab === 'evaluation' ? 'preview' : 'evaluation')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 border transition-all text-[11px] sm:text-xs tracking-wider uppercase font-bold ${
              activeTab === 'evaluation'
                ? 'bg-[#c53030] text-white border-[#ff3e3e] shadow-[0_0_10px_rgba(255,62,62,0.3)]'
                : 'bg-[#111114] text-[#aaa] border-[#333338] hover:border-[#666] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-[#ff3e3e]" />
            <span>[ 3案比較・推奨評価 ]</span>
          </button>

          {/* Viewport Mode Switcher */}
          <div className="flex items-center bg-[#111114] p-0.5 border border-[#333338]">
            <button
              onClick={() => onChange({ viewport: 'pc' })}
              title="PC大画面ビュー (ワイド画面 & 左サイドバー)"
              className={`flex items-center gap-1 px-2 py-1 transition-all text-[10px] ${
                state.viewport === 'pc'
                  ? 'bg-[#222228] text-[#00ffcc] border border-[#444] font-bold'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PC</span>
            </button>

            <button
              onClick={() => onChange({ viewport: 'mobile' })}
              title="スマホ実機枠 (390px モックアップ端末)"
              className={`flex items-center gap-1 px-2 py-1 transition-all text-[10px] ${
                state.viewport === 'mobile'
                  ? 'bg-[#222228] text-[#00ffcc] border border-[#444] font-bold'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">実機枠 (390px)</span>
            </button>

            <button
              onClick={() => onChange({ viewport: 'direct_mobile' })}
              title="スマホ直接表示 (枠なし100%幅 レスポンシブ実画面)"
              className={`flex items-center gap-1 px-2 py-1 transition-all text-[10px] ${
                state.viewport === 'direct_mobile'
                  ? 'bg-[#222228] text-[#00ffcc] border border-[#444] font-bold'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              <TabletSmartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">スマホ直接</span>
            </button>

            <button
              onClick={() => onChange({ viewport: 'split' })}
              title="PC/スマホ 並列比較"
              className={`flex items-center gap-1 px-2 py-1 transition-all text-[10px] hidden md:flex ${
                state.viewport === 'split'
                  ? 'bg-[#222228] text-[#00ffcc] border border-[#444] font-bold'
                  : 'text-[#666] hover:text-[#aaa]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">並列比較</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Bar: Edge-Case & Data State Simulation Controllers (High Density) */}
      <div className="bg-[#08080a] px-3 sm:px-4 py-1.5 border-t border-[#222226] flex flex-wrap items-center justify-between text-[11px] gap-2 text-[#888]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#ff3e3e] font-bold text-[10px] sm:text-[11px]">STATE_SIMULATOR:</span>
          <span className="text-[#666] text-[10px] hidden sm:inline">// 欠損値・負荷シミュレーション</span>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          {/* Photo Count (0, 1, 3, 5) */}
          <div className="flex items-center gap-1 bg-[#111114] px-1.5 sm:px-2 py-0.5 border border-[#333338]">
            <Image className="w-3 h-3 text-[#888]" />
            <span className="text-[#666] text-[10px] mr-0.5">写真:</span>
            {([5, 3, 1, 0] as PhotoCountOption[]).map((count) => (
              <button
                key={count}
                onClick={() => onChange({ photoCount: count })}
                className={`px-1.5 py-0.2 text-[9px] sm:text-[10px] font-mono transition-all ${
                  state.photoCount === count
                    ? 'bg-[#222228] text-[#00ffcc] border border-[#00ffcc]/50 font-bold'
                    : 'text-[#666] hover:text-[#aaa]'
                }`}
              >
                {count === 0 ? '0枚 (未収容)' : `${count}枚`}
              </button>
            ))}
          </div>

          {/* Coordinates Toggle */}
          <button
            onClick={() => onChange({ hasCoordinates: !state.hasCoordinates })}
            className={`flex items-center gap-1 px-2 py-0.5 border transition-all text-[9px] sm:text-[10px] uppercase font-mono ${
              state.hasCoordinates
                ? 'bg-[#111114] text-[#00ffcc] border-[#00ffcc]/50 font-bold'
                : 'bg-[#0d0d0f] text-[#555] border-[#222] line-through'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>GPS: {state.hasCoordinates ? 'XYZ座標あり' : '座標欠損'}</span>
          </button>

          {/* Party/Companions Toggle */}
          <button
            onClick={() => onChange({ hasParty: !state.hasParty })}
            className={`flex items-center gap-1 px-2 py-0.5 border transition-all text-[9px] sm:text-[10px] uppercase font-mono ${
              state.hasParty
                ? 'bg-[#111114] text-[#a855f7] border-[#a855f7]/50 font-bold'
                : 'bg-[#0d0d0f] text-[#555] border-[#222] line-through'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>同行者: {state.hasParty ? '3名同行' : '単独調査'}</span>
          </button>

          {/* Text Length Toggle */}
          <button
            onClick={() =>
              onChange({ textLength: state.textLength === 'full' ? 'short' : 'full' })
            }
            className={`flex items-center gap-1 px-2 py-0.5 border transition-all text-[9px] sm:text-[10px] uppercase font-mono ${
              state.textLength === 'full'
                ? 'bg-[#1a0a0a] text-[#ff3e3e] border-[#ff3e3e]/50 font-bold'
                : 'bg-[#111114] text-[#888] border-[#333338]'
            }`}
          >
            <AlignLeft className="w-3 h-3" />
            <span>
              本文: {state.textLength === 'full' ? 'フル (2,800字)' : 'ショート (800字)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
