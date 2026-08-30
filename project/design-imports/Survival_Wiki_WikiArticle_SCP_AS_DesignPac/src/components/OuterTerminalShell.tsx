import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  Settings,
  BookOpen,
  FileCode,
  Home,
  ShieldAlert,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Radio,
  Share2,
  Copy,
  Terminal,
  Activity,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ActiveSimulationState, AnomalyArticleData } from '../types';

interface Props {
  articleData: AnomalyArticleData;
  state: ActiveSimulationState;
  onStateChange: (updates: Partial<ActiveSimulationState>) => void;
  children: React.ReactNode;
  isMobileFrame?: boolean;
}

export const OuterTerminalShell: React.FC<Props> = ({
  articleData,
  state,
  onStateChange,
  children,
  isMobileFrame = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [caseDataOpen, setCaseDataOpen] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div
      className={`min-h-screen bg-[#0a0a0c] text-[#d1d1d1] font-sans flex flex-col ${
        isMobileFrame
          ? 'w-full max-w-[420px] mx-auto shadow-2xl border-x border-[#2a2a30] overflow-x-hidden'
          : 'w-full overflow-x-hidden'
      }`}
    >
      {/* 1. TOP HEADER (High Density Terminal Header) */}
      <header className="h-12 sm:h-14 border-b border-[#333] bg-[#111114] flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden min-w-0">
          <div className="text-[#ff3e3e] font-mono text-[10px] sm:text-xs border border-[#ff3e3e] px-1.5 sm:px-2 py-0.5 tracking-widest shrink-0 font-bold">
            TOP SECRET
          </div>
          <div className="h-3.5 w-[1px] bg-[#333] shrink-0" />
          <h1 className="font-mono text-[11px] sm:text-xs tracking-tight text-[#888] truncate">
            SURVIVAL_WIKI // RECORD_TERMINAL
          </h1>
          <span className="text-[#444] hidden md:inline">/</span>
          <span className="text-white font-mono text-xs font-bold hidden md:inline truncate">
            {articleData.locationName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {}}
            className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#1a1a1e] border border-[#333] text-[9px] sm:text-[10px] uppercase tracking-wider hover:bg-[#25252b] text-[#aaa] font-mono transition-colors"
          >
            [ BACK ]
          </button>
          <button
            onClick={handleShare}
            className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#1a1a1e] border border-[#333] text-[9px] sm:text-[10px] uppercase tracking-wider hover:bg-[#25252b] text-[#00ffcc] font-mono transition-colors"
          >
            [ {shared ? 'SHARED' : 'SHARE'} ]
          </button>
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#c53030] hover:bg-[#b02828] text-white text-[9px] sm:text-[10px] uppercase tracking-wider font-mono font-bold transition-colors"
          >
            [ {copied ? 'COPIED' : 'EXPORT'} ]
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE WITH DESKTOP SIDEBAR OR MOBILE COMPACT BLOCK */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden w-full">
        {/* Left Aside: ONLY visible on Desktop (lg and up) when NOT in mobile mockup */}
        {!isMobileFrame && (
          <aside className="hidden lg:flex w-72 border-r border-[#333] flex-col p-4 bg-[#0d0d0f] shrink-0 space-y-4">
            {/* Researcher Profile Block */}
            <div>
              <div className="text-[10px] text-[#666] uppercase mb-1.5 font-mono tracking-wider">
                Researcher ID
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#222] border border-[#444] flex items-center justify-center overflow-hidden shrink-0 relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                    alt="Dr. Ark"
                    className="w-full h-full object-cover grayscale contrast-150 opacity-80"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stripe opacity-20 pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00ffcc] border border-[#111]" />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-bold tracking-tight text-white font-mono flex items-center gap-1.5">
                    <span>Dr. Ark</span>
                    <span className="text-[10px] text-[#888] font-normal font-sans">(特異点観測官)</span>
                  </div>
                  <div className="text-[9px] text-[#ff3e3e] font-mono font-bold tracking-wider">
                    CLEARANCE: LEVEL 5
                  </div>
                  <div className="text-[9px] text-[#666] font-mono">ID: ARK-994-SOCO</div>
                </div>
              </div>
            </div>

            {/* Classification Banner */}
            <div className="border-l-2 border-[#ff3e3e] pl-3 py-1.5 bg-[#1a0a0a]">
              <div className="text-[10px] text-[#666] uppercase font-mono tracking-wider">
                Classification
              </div>
              <div className="text-base font-bold text-[#ff3e3e] tracking-tighter font-mono">
                KETER / 脅威度：極 [滅亡級]
              </div>
            </div>

            {/* Location Data Grid */}
            <div className="p-3 border border-[#333] bg-[#111] space-y-1.5">
              <div className="text-[10px] text-[#666] uppercase font-mono flex items-center justify-between">
                <span>Location Data</span>
                <span className="text-[#00ffcc] text-[9px]">
                  {state.hasCoordinates ? 'GPS_LOCKED' : 'SENSOR_OFFLINE'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5 text-[11px] font-mono">
                <span className="text-[#888]">Latitude:</span>
                <span className="text-right text-[#d1d1d1]">
                  {state.hasCoordinates && articleData.coordinates ? `${articleData.coordinates.x}°N` : '35.6895'}
                </span>
                <span className="text-[#888]">Longitude:</span>
                <span className="text-right text-[#d1d1d1]">
                  {state.hasCoordinates && articleData.coordinates ? `${articleData.coordinates.z}°E` : '139.6917'}
                </span>
                <span className="text-[#888]">Altitude:</span>
                <span className="text-right text-[#d1d1d1]">
                  {state.hasCoordinates && articleData.coordinates ? `${articleData.coordinates.y}m` : '45.2m'}
                </span>
                <span className="text-[#888]">Timestamp:</span>
                <span className="text-right text-[#d1d1d1]">{articleData.recordingDate}</span>
              </div>
            </div>

            {/* Accompanying / Party Information */}
            <div className="p-3 border border-[#333] bg-[#111]">
              <div className="text-[10px] text-[#666] uppercase font-mono mb-1.5 flex items-center justify-between">
                <span>Accompanying</span>
                <span className="text-[#888] text-[9px] font-mono">
                  {state.hasParty ? '3 ENTITIES' : 'SOLO'}
                </span>
              </div>
              {state.hasParty && articleData.companions ? (
                <div className="space-y-1 font-mono text-xs">
                  {articleData.companions.map((comp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-[#aaa]">
                      <span className="text-[#888]">&gt; D-{idx + 104}:</span>
                      <span className="font-bold text-[#d1d1d1]">{comp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs italic text-[#888] font-mono">None [Solo Expedition]</div>
              )}
            </div>

            {/* NPC Dialogue Box */}
            <div className="p-3.5 bg-[#111] border border-[#222] italic text-[11px] leading-relaxed text-[#888] relative mt-2">
              <span className="absolute -top-2 left-2 bg-[#0d0d0f] px-2 text-[9px] text-[#666] font-mono font-bold tracking-wider">
                NPC_COMMENTS
              </span>
              <p className="font-sans text-[#aaa] mt-1">
                「{articleData.doctorComment}」
              </p>
              <div className="text-right mt-2 text-[9px] font-mono text-[#ff3e3e]">
                — Dr. Ark / SPECIAL OBSERVATION UNIT
              </div>
            </div>

            {/* Connection Status Foot */}
            <div className="p-2.5 bg-[#111] border border-[#222] text-center font-mono text-[10px] text-[#555] tracking-widest mt-auto">
              <span className="text-[#00ffcc] animate-pulse mr-1.5">●</span>
              CONNECTION_STABLE // 127.0.0.1
            </div>
          </aside>
        )}

        {/* Central Article Container: 1-Column Responsive Stream */}
        <section className="flex-1 flex flex-col bg-[#141416] p-3 sm:p-6 lg:p-8 overflow-y-auto relative w-full max-w-full">
          <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
            {/* Top Navigation Strip with 3 NPC Selector Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#333] font-mono text-xs">
              <div className="flex items-center gap-2 overflow-x-auto text-[10px] sm:text-xs">
                <span className="text-[#00ffcc] font-bold tracking-widest uppercase shrink-0">
                  SECURE_DOSSIER
                </span>
                <span className="text-[#444]">|</span>
                <span className="text-[#888] truncate">CASE: {articleData.caseId}</span>
              </div>

              {/* 3 NPC Selector Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto py-0.5 shrink-0">
                <div className="px-2 py-0.5 bg-[#1a1a1c] border border-[#333] text-[#666] text-[9px] sm:text-[10px] whitespace-nowrap cursor-not-allowed">
                  百科事典 (Hernan)
                </div>
                <div className="px-2 py-0.5 bg-[#1a0a0a] border border-[#ff3e3e] text-[#ff3e3e] text-[9px] sm:text-[10px] font-bold whitespace-nowrap shadow-[0_0_8px_rgba(255,62,62,0.2)]">
                  SCP調 (Dr.アーク) ★
                </div>
                <div className="px-2 py-0.5 bg-[#1a1a1c] border border-[#333] text-[#666] text-[9px] sm:text-[10px] whitespace-nowrap cursor-not-allowed">
                  古代伝承 (Gildas)
                </div>
              </div>
            </div>

            {/* SMARTPHONE-ONLY COMPACT "CASE DATA" BLOCK (Header Integration) */}
            {isMobileFrame && (
              <div className="bg-[#0f0f12] border border-[#333] p-3 text-xs font-mono space-y-2 shadow-md">
                {/* Researcher + Threat Badge Line */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-[#222] border border-[#444] shrink-0 relative overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                        alt="Dr. Ark"
                        className="w-full h-full object-cover grayscale opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#00ffcc]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-[11px] leading-none truncate">
                        Dr. Ark <span className="text-[9px] text-[#888] font-normal">(特異点観測官)</span>
                      </div>
                      <div className="text-[9px] text-[#ff3e3e] font-bold mt-0.5">
                        LV-5 // ARK-994
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 bg-[#1a0a0a] border border-[#ff3e3e] text-[#ff3e3e] px-2 py-0.5 font-bold text-[9px] uppercase tracking-wider">
                    {articleData.objectClass}
                  </div>
                </div>

                {/* Compact Telemetry Row */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#222] text-[10px]">
                  <div className="bg-[#141418] p-1.5 border border-[#26262e] flex items-center gap-1 text-[#aaa]">
                    <MapPin className="w-3 h-3 text-[#00ffcc] shrink-0" />
                    <span className="truncate">
                      {state.hasCoordinates && articleData.coordinates
                        ? `${articleData.coordinates.x}, ${articleData.coordinates.y}, ${articleData.coordinates.z}`
                        : 'SENSOR_OFFLINE'}
                    </span>
                  </div>

                  <div className="bg-[#141418] p-1.5 border border-[#26262e] flex items-center gap-1 text-[#aaa]">
                    <Users className="w-3 h-3 text-[#a855f7] shrink-0" />
                    <span className="truncate">
                      {state.hasParty ? '3同行者追跡中' : '単独調査 (Solo)'}
                    </span>
                  </div>
                </div>

                {/* Dr. Ark Compact Comment (Collapsible toggle for extra details) */}
                <div className="bg-[#141418] p-2 border-l-2 border-[#ff3e3e] text-[11px] text-[#bbb] font-sans leading-snug">
                  <span className="text-[9px] font-mono text-[#ff3e3e] font-bold block mb-0.5">
                    NPC_MEMO:
                  </span>
                  「{articleData.doctorComment}」
                </div>

                <button
                  onClick={() => setCaseDataOpen(!caseDataOpen)}
                  className="w-full pt-1 text-[9px] text-[#666] hover:text-[#aaa] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{caseDataOpen ? '診断テレメトリを閉じる' : '診断テレメトリ詳細を表示'}</span>
                  {caseDataOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {caseDataOpen && (
                  <div className="pt-2 border-t border-[#222] grid grid-cols-2 gap-1 text-[9px] text-[#777]">
                    <div>SECTOR: {articleData.locationName}</div>
                    <div>SUBJECT: {articleData.player}</div>
                    <div>DATE: {articleData.recordingDate}</div>
                    <div>STATUS: ENCRYPTED [AES-512]</div>
                  </div>
                )}
              </div>
            )}

            {/* Article Heading (Primary Focus) */}
            <div className="pb-3 border-b border-[#333] flex flex-col sm:flex-row sm:items-end justify-between gap-1.5">
              <div className="min-w-0">
                <div className="text-[9px] sm:text-[10px] font-mono text-[#00ffcc] mb-0.5 tracking-[2px] uppercase">
                  CONFIDENTIAL_ANOMALY_RECORD
                </div>
                <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white break-words">
                  案件番号：ARK-772 [{articleData.locationName}]
                </h2>
              </div>
              <div className="sm:text-right font-mono shrink-0 text-[10px] text-[#666]">
                SERIAL: <span className="text-[#d1d1d1] font-bold">S-00452-981</span>
              </div>
            </div>

            {/* Injected Re-designed Article Children */}
            <div className="w-full max-w-full overflow-x-hidden">{children}</div>

            {/* Bottom Actions Bar */}
            <div className="pt-4 mt-6 border-t border-[#333] flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono">
              <div className="text-[#888] text-[10px] sm:text-xs">
                <span className="text-[#00ffcc] font-bold">ACTION:</span> 記事クリップボード転送
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-[#222] hover:bg-[#333] border border-[#444] text-[#d1d1d1] text-[10px] sm:text-xs transition-colors"
                >
                  {copied ? '[ COPIED ]' : '[ COPY ARTICLE ]'}
                </button>
                <button
                  onClick={handleShare}
                  className="px-2.5 py-1 bg-[#111] hover:bg-[#222] border border-[#00ffcc]/60 text-[#00ffcc] text-[10px] sm:text-xs transition-colors"
                >
                  {shared ? '[ LINK SHARED ]' : '[ SHARE ]'}
                </button>
                <button
                  onClick={() => alert('記事の再編纂リクエストを送信しました')}
                  className="px-2.5 py-1 bg-[#1a0a0a] hover:bg-[#2a1010] border border-[#ff3e3e]/60 text-[#ff3e3e] text-[10px] sm:text-xs transition-colors"
                >
                  [ RE-COMPILE ]
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. MOBILE BOTTOM HUD (Smartphone Navigation) */}
      {isMobileFrame && (
        <div className="sticky bottom-0 z-40 bg-[#111114] border-t border-[#333] px-2 py-1.5 flex items-center justify-around text-[10px] text-[#888] font-mono shadow-2xl shrink-0">
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#888] hover:text-[#fff]">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>[ BACK ]</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#00ffcc]">
            <Volume2 className="w-3.5 h-3.5" />
            <span>BGM</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#888]">
            <Settings className="w-3.5 h-3.5" />
            <span>CONFIG</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#888]">
            <BookOpen className="w-3.5 h-3.5" />
            <span>RECORD</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#ff3e3e] bg-[#1a0a0a] border border-[#ff3e3e] font-bold">
            <FileCode className="w-3.5 h-3.5 text-[#ff3e3e]" />
            <span>WIKI</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 py-0.5 px-2 text-[#888]">
            <Home className="w-3.5 h-3.5" />
            <span>HOME</span>
          </button>
        </div>
      )}
    </div>
  );
};
