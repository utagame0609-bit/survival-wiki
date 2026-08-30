import React, { useState } from 'react';
import { ActiveSimulationState, PhotoCountOption, ProposalId, ViewportMode } from './types';
import { sampleArcArticle } from './data/arcArticleData';
import { StateControlBar } from './components/StateControlBar';
import { OuterTerminalShell } from './components/OuterTerminalShell';
import { ProposalA_DeclassifiedDossier } from './components/ProposalA_DeclassifiedDossier';
import { ProposalB_SecureTerminalRecord } from './components/ProposalB_SecureTerminalRecord';
import { ProposalC_FieldEvidenceFile } from './components/ProposalC_FieldEvidenceFile';
import { DesignEvaluationPanel } from './components/DesignEvaluationPanel';
import { Smartphone, Monitor, ShieldAlert, Sparkles, TabletSmartphone } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<ActiveSimulationState>({
    proposal: 'proposal-a',
    viewport: 'pc',
    photoCount: 5,
    hasCoordinates: true,
    hasParty: true,
    textLength: 'full',
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'evaluation'>('preview');

  const handleStateChange = (updates: Partial<ActiveSimulationState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const renderActiveProposal = (isMobile: boolean = false) => {
    switch (state.proposal) {
      case 'proposal-a':
        return <ProposalA_DeclassifiedDossier data={sampleArcArticle} state={state} isMobile={isMobile} />;
      case 'proposal-b':
        return <ProposalB_SecureTerminalRecord data={sampleArcArticle} state={state} isMobile={isMobile} />;
      case 'proposal-c':
        return <ProposalC_FieldEvidenceFile data={sampleArcArticle} state={state} isMobile={isMobile} />;
      default:
        return <ProposalA_DeclassifiedDossier data={sampleArcArticle} state={state} isMobile={isMobile} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#d1d1d1] flex flex-col font-sans selection:bg-[#c53030] selection:text-white">
      {/* Top High Density Simulation & Evaluation Switcher Bar */}
      <StateControlBar
        state={state}
        onChange={handleStateChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main View Area */}
      <div className="flex-1 w-full">
        {activeTab === 'evaluation' ? (
          <div className="p-3 sm:p-8">
            <DesignEvaluationPanel
              onSelectProposal={(id) => {
                handleStateChange({ proposal: id });
                setActiveTab('preview');
              }}
            />
          </div>
        ) : (
          <div className="w-full">
            {/* 1. PC FULL VIEW (Desktop Wide Layout with Left Aside) */}
            {state.viewport === 'pc' && (
              <OuterTerminalShell
                articleData={sampleArcArticle}
                state={state}
                onStateChange={handleStateChange}
                isMobileFrame={false}
              >
                {renderActiveProposal(false)}
              </OuterTerminalShell>
            )}

            {/* 2. SMARTPHONE MOCKUP FRAME VIEW (390px Simulated Device) */}
            {state.viewport === 'mobile' && (
              <div className="py-6 px-2 sm:px-3 flex flex-col items-center justify-center bg-[#070709] min-h-[calc(100vh-80px)]">
                {/* Mobile Device Frame Header Indicator */}
                <div className="mb-3 flex items-center justify-between gap-3 text-xs font-mono text-[#00ffcc] bg-[#111] px-3.5 py-1.5 border border-[#333] max-w-[410px] w-full">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>スマホ実機枠 (390px × 844px)</span>
                  </div>
                  <button
                    onClick={() => handleStateChange({ viewport: 'direct_mobile' })}
                    className="text-[10px] text-[#ff3e3e] hover:underline"
                  >
                    [ 枠なし全画面で表示 ]
                  </button>
                </div>

                {/* Mobile Phone Mockup Body */}
                <div className="w-full max-w-[410px] bg-[#000000] p-2 sm:p-2.5 shadow-[0_0_60px_rgba(0,0,0,0.9)] border-4 border-[#333] relative overflow-hidden">
                  {/* Dynamic Island Notch */}
                  <div className="w-28 h-4 bg-[#111] mx-auto mb-2 flex items-center justify-center relative z-50 border border-[#222]">
                    <div className="w-2.5 h-2.5 bg-[#00ffcc]/60 rounded-full mr-2" />
                    <div className="w-10 h-1 bg-[#333]" />
                  </div>

                  {/* Mobile Screen Container */}
                  <div className="overflow-hidden max-h-[780px] overflow-y-auto bg-[#0a0a0c] border border-[#222]">
                    <OuterTerminalShell
                      articleData={sampleArcArticle}
                      state={state}
                      onStateChange={handleStateChange}
                      isMobileFrame={true}
                    >
                      {renderActiveProposal(true)}
                    </OuterTerminalShell>
                  </div>
                </div>
              </div>
            )}

            {/* 3. SMARTPHONE DIRECT FULL-PAGE VIEW (100% Responsive Clean Single-Column) */}
            {state.viewport === 'direct_mobile' && (
              <div className="w-full min-h-[calc(100vh-80px)] bg-[#0a0a0c]">
                <OuterTerminalShell
                  articleData={sampleArcArticle}
                  state={state}
                  onStateChange={handleStateChange}
                  isMobileFrame={true}
                >
                  {renderActiveProposal(true)}
                </OuterTerminalShell>
              </div>
            )}

            {/* 4. SPLIT SIDE-BY-SIDE VIEW (PC & MOBILE TOGETHER) */}
            {state.viewport === 'split' && (
              <div className="p-3 sm:p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start max-w-7xl mx-auto">
                {/* Left: Desktop PC View */}
                <div className="xl:col-span-8 bg-[#0d0d0f] border border-[#333] overflow-hidden shadow-2xl">
                  <div className="bg-[#111] px-4 py-2 border-b border-[#333] flex items-center justify-between text-xs font-mono text-[#aaa]">
                    <span className="flex items-center gap-1.5 text-[#00ffcc] font-bold">
                      <Monitor className="w-4 h-4 text-[#00ffcc]" />
                      PCデスクトップ表示 (ワイド読書ビュー)
                    </span>
                    <span className="text-[11px] text-[#666]">1280px Grid</span>
                  </div>
                  <div className="max-h-[850px] overflow-y-auto">
                    <OuterTerminalShell
                      articleData={sampleArcArticle}
                      state={state}
                      onStateChange={handleStateChange}
                      isMobileFrame={false}
                    >
                      {renderActiveProposal(false)}
                    </OuterTerminalShell>
                  </div>
                </div>

                {/* Right: Mobile View */}
                <div className="xl:col-span-4 flex flex-col items-center">
                  <div className="w-full bg-[#0d0d0f] border border-[#333] overflow-hidden shadow-2xl">
                    <div className="bg-[#111] px-4 py-2 border-b border-[#333] flex items-center justify-between text-xs font-mono text-[#aaa]">
                      <span className="flex items-center gap-1.5 text-[#ff3e3e] font-bold">
                        <Smartphone className="w-4 h-4 text-[#ff3e3e]" />
                        スマホ実機表示 (390px 1カラム)
                      </span>
                      <span className="text-[11px] text-[#666]">390px 1-Col</span>
                    </div>
                    <div className="max-h-[850px] overflow-y-auto bg-[#0a0a0c]">
                      <OuterTerminalShell
                        articleData={sampleArcArticle}
                        state={state}
                        onStateChange={handleStateChange}
                        isMobileFrame={true}
                      >
                        {renderActiveProposal(true)}
                      </OuterTerminalShell>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
