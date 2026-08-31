import React from 'react';
import {
  ProposalType,
  PhotoFilterCount,
  CoordinateState,
  CompanionState,
  DateState,
  DeviceViewportMode,
  ContentScenarioType,
} from '../types';
import {
  Layers,
  Image as ImageIcon,
  Compass,
  Users,
  Calendar,
  Smartphone,
  Monitor,
  Maximize2,
  Table,
  Sparkles,
  BookOpen,
  Flame,
  Heart,
} from 'lucide-react';

interface ControlToolbarProps {
  proposal: ProposalType;
  onSelectProposal: (p: ProposalType) => void;
  scenario: ContentScenarioType;
  onSelectScenario: (s: ContentScenarioType) => void;
  photoCount: PhotoFilterCount;
  onSelectPhotoCount: (count: PhotoFilterCount) => void;
  coordinateState: CoordinateState;
  onSelectCoordinateState: (state: CoordinateState) => void;
  companionState: CompanionState;
  onSelectCompanionState: (state: CompanionState) => void;
  dateState: DateState;
  onSelectDateState: (state: DateState) => void;
  viewportMode: DeviceViewportMode;
  onSelectViewportMode: (mode: DeviceViewportMode) => void;
  showEvaluation: boolean;
  onToggleEvaluation: () => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  proposal,
  onSelectProposal,
  scenario,
  onSelectScenario,
  photoCount,
  onSelectPhotoCount,
  coordinateState,
  onSelectCoordinateState,
  companionState,
  onSelectCompanionState,
  dateState,
  onSelectDateState,
  viewportMode,
  onSelectViewportMode,
  showEvaluation,
  onToggleEvaluation,
}) => {
  return (
    <div
      id="evaluation-control-toolbar"
      className="sticky top-[49px] z-30 bg-[#090d14]/95 border-b border-amber-500/30 backdrop-blur-md px-3 sm:px-6 py-2.5 shadow-md"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Proposal Selector (A/B/C) */}
        <div className="flex items-center gap-1.5 bg-[#121926] p-1 rounded-xl border border-amber-500/30">
          <span className="text-[11px] font-cinzel text-amber-400 font-bold px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">提案：</span>
          </span>
          <button
            id="btn-proposal-a"
            onClick={() => onSelectProposal('proposalA')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              proposal === 'proposalA'
                ? 'bg-cyan-600 text-white font-bold shadow-sm ring-1 ring-cyan-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            A案: 旅人年代記
          </button>
          <button
            id="btn-proposal-b"
            onClick={() => onSelectProposal('proposalB')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              proposal === 'proposalB'
                ? 'bg-amber-600 text-white font-bold shadow-sm ring-1 ring-amber-400'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            B案: 装飾写本集
          </button>
          <button
            id="btn-proposal-c"
            onClick={() => onSelectProposal('proposalC')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              proposal === 'proposalC'
                ? 'bg-amber-500 text-stone-950 font-black shadow-sm ring-1 ring-amber-300'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            C案: 追憶手記
          </button>
        </div>

        {/* Content Mode / Scenario Switcher */}
        <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-xl border border-amber-500/30 text-[11px]">
          <span className="text-amber-400 font-bold px-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden md:inline">題材：</span>
          </span>
          <button
            id="btn-scenario-achievement"
            onClick={() => onSelectScenario('achievement-return')}
            title="達成・帰還譚（山嶺の野営・星空・冒険）"
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              scenario === 'achievement-return'
                ? 'bg-cyan-950 text-cyan-200 font-bold border border-cyan-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>達成・帰還譚</span>
          </button>
          <button
            id="btn-scenario-daily"
            onClick={() => onSelectScenario('daily-legend')}
            title="日常伝説化（キャンプ椅子・肉焼き・小ネタ神話）"
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              scenario === 'daily-legend'
                ? 'bg-amber-950 text-amber-200 font-bold border border-amber-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>日常伝説化</span>
          </button>
          <button
            id="btn-scenario-memory"
            onClick={() => onSelectScenario('precious-memory')}
            title="大切な記憶（家族との海・笑顔・記念写真）"
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              scenario === 'precious-memory'
                ? 'bg-rose-950 text-rose-200 font-bold border border-rose-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>大切な記憶</span>
          </button>
        </div>

        {/* State Modifiers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Photo Count Switcher */}
          <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-1.5 flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-amber-400" />
              <span>写真:</span>
            </span>
            {[5, 3, 1, 0].map((num) => (
              <button
                key={num}
                id={`btn-photo-count-${num}`}
                onClick={() => onSelectPhotoCount(num as PhotoFilterCount)}
                className={`px-2 py-0.5 rounded transition-all ${
                  photoCount === num
                    ? 'bg-amber-500/30 text-amber-300 font-bold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {num}枚
              </button>
            ))}
          </div>

          {/* Date Switcher (Fact vs Missing) */}
          <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-400" />
              <span>日付:</span>
            </span>
            <button
              id="btn-date-present"
              onClick={() => onSelectDateState('present')}
              className={`px-2 py-0.5 rounded transition-all ${
                dateState === 'present'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              あり
            </button>
            <button
              id="btn-date-none"
              onClick={() => onSelectDateState('none')}
              className={`px-2 py-0.5 rounded transition-all ${
                dateState === 'none'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              なし
            </button>
          </div>

          {/* Coordinates Switcher */}
          <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-1.5 flex items-center gap-1">
              <Compass className="w-3 h-3 text-cyan-400" />
              <span>座標:</span>
            </span>
            <button
              onClick={() => onSelectCoordinateState('present')}
              className={`px-2 py-0.5 rounded transition-all ${
                coordinateState === 'present'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              あり
            </button>
            <button
              onClick={() => onSelectCoordinateState('none')}
              className={`px-2 py-0.5 rounded transition-all ${
                coordinateState === 'none'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              なし
            </button>
            <button
              onClick={() => onSelectCoordinateState('zero')}
              className={`px-2 py-0.5 rounded transition-all ${
                coordinateState === 'zero'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              0/0/0
            </button>
          </div>

          {/* Companions Switcher */}
          <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800 text-[11px]">
            <span className="text-slate-400 px-1.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span>同行者:</span>
            </span>
            <button
              onClick={() => onSelectCompanionState('present')}
              className={`px-2 py-0.5 rounded transition-all ${
                companionState === 'present'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              あり
            </button>
            <button
              onClick={() => onSelectCompanionState('none')}
              className={`px-2 py-0.5 rounded transition-all ${
                companionState === 'none'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              なし
            </button>
          </div>
        </div>

        {/* Viewport & Evaluation Matrix Switchers */}
        <div className="flex items-center gap-2">
          {/* Viewport Selector */}
          <div className="flex items-center gap-1 bg-[#121926] p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              id="btn-viewport-desktop"
              title="PC表示（1440px基準）"
              onClick={() => onSelectViewportMode('desktop')}
              className={`p-1.5 rounded transition-all ${
                viewportMode === 'desktop'
                  ? 'bg-slate-700 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-viewport-mobile-sim"
              title="スマホ表示（390px 専用1カラムシミュレーター）"
              onClick={() => onSelectViewportMode('mobile-390')}
              className={`p-1.5 rounded transition-all ${
                viewportMode === 'mobile-390'
                  ? 'bg-amber-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-viewport-fluid"
              title="レスポンシブ自由可変"
              onClick={() => onSelectViewportMode('fluid')}
              className={`p-1.5 rounded transition-all ${
                viewportMode === 'fluid'
                  ? 'bg-slate-700 text-amber-300 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle Evaluation Matrix Button */}
          <button
            id="btn-toggle-evaluation"
            onClick={onToggleEvaluation}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              showEvaluation
                ? 'bg-amber-500 text-stone-900 border-amber-400 shadow-md'
                : 'bg-[#151f2e] text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>12項目比較表</span>
          </button>
        </div>
      </div>
    </div>
  );
};
