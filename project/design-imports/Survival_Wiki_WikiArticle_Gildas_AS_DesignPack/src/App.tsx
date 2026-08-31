/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { OuterHudFrame } from './components/OuterHudFrame';
import { ControlToolbar } from './components/ControlToolbar';
import { ProposalA } from './components/proposals/ProposalA';
import { ProposalB } from './components/proposals/ProposalB';
import { ProposalC } from './components/proposals/ProposalC';
import { PhotoModal } from './components/PhotoModal';
import { EvaluationView } from './components/EvaluationView';
import {
  SCENARIO_ACHIEVEMENT_RETURN,
  SCENARIO_DAILY_LEGEND,
  SCENARIO_PRECIOUS_MEMORY,
} from './data/dummyData';
import {
  ProposalType,
  ContentScenarioType,
  PhotoFilterCount,
  CoordinateState,
  CompanionState,
  DateState,
  DeviceViewportMode,
  WikiArticleData,
  PhotoItem,
} from './types';
import { Smartphone, Sparkles, Battery, Wifi, Signal } from 'lucide-react';

export default function App() {
  const [proposal, setProposal] = useState<ProposalType>('proposalA');
  const [scenario, setScenario] = useState<ContentScenarioType>('achievement-return');
  const [photoCount, setPhotoCount] = useState<PhotoFilterCount>(5);
  const [dateState, setDateState] = useState<DateState>('present');
  const [coordinateState, setCoordinateState] = useState<CoordinateState>('present');
  const [companionState, setCompanionState] = useState<CompanionState>('present');
  const [viewportMode, setViewportMode] = useState<DeviceViewportMode>('fluid');
  const [showEvaluation, setShowEvaluation] = useState<boolean>(false);

  // Photo modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalIndex, setModalIndex] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Select base scenario data
  const baseScenarioData = useMemo<WikiArticleData>(() => {
    switch (scenario) {
      case 'daily-legend':
        return SCENARIO_DAILY_LEGEND;
      case 'precious-memory':
        return SCENARIO_PRECIOUS_MEMORY;
      case 'achievement-return':
      default:
        return SCENARIO_ACHIEVEMENT_RETURN;
    }
  }, [scenario]);

  // Slice photos based on selected count and current scenario
  const activePhotos = useMemo<PhotoItem[]>(() => {
    const rawPhotos = baseScenarioData.photos;
    if (photoCount === 0 || !rawPhotos || rawPhotos.length === 0) return [];
    if (photoCount === 1) return [rawPhotos[0]];
    if (photoCount === 3) {
      return [
        rawPhotos[0],
        rawPhotos[Math.floor(rawPhotos.length / 2)] || rawPhotos[1],
        rawPhotos[rawPhotos.length - 1],
      ].filter(Boolean);
    }
    return rawPhotos.slice(0, 5);
  }, [photoCount, baseScenarioData]);

  // Construct active dynamic article data with missing-data awareness
  const currentArticleData = useMemo<WikiArticleData>(() => {
    return {
      ...baseScenarioData,
      timestamp: dateState === 'none' ? undefined : baseScenarioData.timestamp,
      photos: activePhotos,
      coordinates:
        coordinateState === 'none'
          ? null
          : coordinateState === 'zero'
          ? { x: 0, y: 0, z: 0 }
          : baseScenarioData.coordinates,
      companions:
        companionState === 'none'
          ? []
          : baseScenarioData.companions,
    };
  }, [baseScenarioData, dateState, activePhotos, coordinateState, companionState]);

  const handlePhotoClick = (index: number) => {
    if (activePhotos.length > 0 && index >= 0 && index < activePhotos.length) {
      setModalIndex(index);
      setModalOpen(true);
    }
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleScrollBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  // Render the active proposal component
  const renderProposalContent = () => {
    const commonProps = {
      data: currentArticleData,
      photos: activePhotos,
      hasCoordinates: coordinateState !== 'none',
      isZeroCoordinates: coordinateState === 'zero',
      hasCompanions: companionState === 'present',
      hasDate: dateState === 'present',
      onPhotoClick: handlePhotoClick,
    };

    switch (proposal) {
      case 'proposalA':
        return <ProposalA {...commonProps} />;
      case 'proposalB':
        return <ProposalB {...commonProps} />;
      case 'proposalC':
      default:
        return <ProposalC {...commonProps} />;
    }
  };

  return (
    <OuterHudFrame onScrollToTop={handleScrollTop} onScrollToBottom={handleScrollBottom}>
      {/* Interactive Control Toolbar for Reviewers */}
      <ControlToolbar
        proposal={proposal}
        onSelectProposal={setProposal}
        scenario={scenario}
        onSelectScenario={setScenario}
        photoCount={photoCount}
        onSelectPhotoCount={setPhotoCount}
        dateState={dateState}
        onSelectDateState={setDateState}
        coordinateState={coordinateState}
        onSelectCoordinateState={setCoordinateState}
        companionState={companionState}
        onSelectCompanionState={setCompanionState}
        viewportMode={viewportMode}
        onSelectViewportMode={setViewportMode}
        showEvaluation={showEvaluation}
        onToggleEvaluation={() => setShowEvaluation(!showEvaluation)}
      />

      {/* Main View Area */}
      {showEvaluation ? (
        /* 12-Item Comparison Evaluation View */
        <EvaluationView />
      ) : viewportMode === 'mobile-390' ? (
        /* Dedicated 390px Smartphone Simulator Frame */
        <div className="flex-1 w-full flex flex-col items-center justify-start py-8 px-2 bg-[#06090e]">
          <div className="text-center mb-3 text-xs text-amber-300 font-cinzel flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Dedicated 390px Mobile Viewport Simulation (No PC Scale-down)</span>
          </div>

          <div className="relative w-[390px] h-[820px] max-h-[85vh] bg-[#070b10] rounded-[44px] border-[6px] border-[#252f40] shadow-2xl shadow-black overflow-hidden flex flex-col ring-1 ring-amber-500/30">
            {/* Dynamic Island / Top Notch Mockup */}
            <div className="shrink-0 h-9 bg-black px-6 flex items-center justify-between text-[11px] text-white select-none z-20">
              <span className="font-semibold">9:41</span>
              <div className="w-20 h-4 bg-stone-900 rounded-full flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-amber-400/80" />
              </div>
              <div className="flex items-center gap-1.5 text-stone-300">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>

            {/* Simulated 390px Scrollable Body */}
            <div ref={containerRef} className="flex-1 w-full overflow-y-auto overflow-x-hidden relative">
              {renderProposalContent()}
            </div>

            {/* Home Indicator Mockup */}
            <div className="shrink-0 h-6 bg-[#090d14] flex items-center justify-center select-none z-20">
              <div className="w-32 h-1 bg-stone-600 rounded-full" />
            </div>
          </div>
        </div>
      ) : viewportMode === 'desktop' ? (
        /* 1440px Constrained Desktop Simulator */
        <div className="flex-1 w-full max-w-[1440px] mx-auto overflow-x-hidden">
          {renderProposalContent()}
        </div>
      ) : (
        /* Full Fluid Responsive */
        <div className="flex-1 w-full overflow-x-hidden">
          {renderProposalContent()}
        </div>
      )}

      {/* Accessible Photo Modal Viewer */}
      <PhotoModal
        photos={activePhotos}
        currentIndex={modalIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onNavigate={setModalIndex}
      />
    </OuterHudFrame>
  );
}
