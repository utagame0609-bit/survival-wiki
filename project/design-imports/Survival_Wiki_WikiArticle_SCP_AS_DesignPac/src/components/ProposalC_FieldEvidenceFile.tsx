import React, { useState } from 'react';
import {
  FolderOpen,
  MapPin,
  Clock,
  FileCheck,
  AlertOctagon,
  ZoomIn,
  CornerDownRight,
  Shield,
  Layers,
  ChevronRight,
  Paperclip,
} from 'lucide-react';
import { ActiveSimulationState, AnomalyArticleData, EvidencePhoto } from '../types';

interface Props {
  data: AnomalyArticleData;
  state: ActiveSimulationState;
  isMobile?: boolean;
}

export const ProposalC_FieldEvidenceFile: React.FC<Props> = ({ data, state, isMobile = false }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);

  const visiblePhotos = data.photos.slice(0, state.photoCount);
  const activeSections = state.textLength === 'full' ? data.sections : data.shortSections;
  const summaryText = state.textLength === 'full' ? data.executiveSummary : data.shortExecutiveSummary;

  return (
    <div className="font-sans antialiased text-[#d1d1d1] w-full max-w-full overflow-x-hidden">
      {/* High Density Field Binder Container */}
      <div className="bg-[#0a0a0c] border border-[#333] shadow-2xl overflow-hidden">
        {/* Binder Spine Header & Case Code */}
        <div className="bg-[#111] border-b border-[#333] p-3.5 sm:p-6 text-yellow-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-mono text-[#f59e0b] font-bold">
                <FolderOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span className="truncate">FIELD CASE BINDER // {data.caseId}</span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-white break-words">
                事件現場調書：『{data.locationName}』異常事象と知的崩壊の時系列ファイル
              </h1>
              <p className="text-[10px] sm:text-xs font-mono text-[#888]">
                PRIMARY SUBJECT: {data.player} // SECTOR: {data.locationName}
              </p>
            </div>

            {/* Case File Badge */}
            <div className="shrink-0 bg-[#1a1608] border border-[#f59e0b]/60 px-2.5 sm:px-3 py-1.5 text-center font-mono self-start sm:self-auto">
              <div className="text-[9px] text-[#f59e0b] font-bold">CASE STAGES</div>
              <div className="text-sm sm:text-base font-bold text-white">{activeSections.length} FOLDERS</div>
            </div>
          </div>

          {/* Dynamic Vector & Companions Strip */}
          {(state.hasCoordinates || state.hasParty) && (
            <div className="mt-3 pt-2.5 border-t border-[#222] flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono text-[#aaa]">
              {state.hasCoordinates && data.coordinates && (
                <div className="flex items-center gap-1 bg-[#000] px-2 py-0.5 border border-[#333]">
                  <MapPin className="w-3 h-3 text-[#f59e0b]" />
                  <span>
                    GPS: X:{data.coordinates.x} Y:{data.coordinates.y} Z:{data.coordinates.z}
                  </span>
                </div>
              )}
              {state.hasParty && data.companions && (
                <div className="flex items-center gap-1 bg-[#000] px-2 py-0.5 border border-[#333]">
                  <Shield className="w-3 h-3 text-[#f59e0b]" />
                  <span>ENTITIES: {data.companions.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lead Case Abstract Banner */}
        <div className="p-3.5 sm:p-6 bg-[#0d0d0f] border-b border-[#333]">
          <div className="max-w-3xl space-y-1.5">
            <div className="text-xs font-mono font-bold text-[#f59e0b] flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#f59e0b]" />
              <span>CASE OVERVIEW // 調査主任概況要旨</span>
            </div>
            <p className="text-[14px] sm:text-[15px] text-[#ccc] leading-relaxed font-sans text-justify">
              {summaryText}
            </p>
          </div>
        </div>

        {/* Chronological Folder Steps */}
        <div className="p-3.5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
          {activeSections.map((section, idx) => {
            const photoForThisStage = visiblePhotos[idx] || null;

            return (
              <div
                key={section.id}
                className="bg-[#141416] border border-[#333] overflow-hidden shadow-md"
              >
                {/* Folder Chapter Tab Header */}
                <div className="bg-[#111] px-3 sm:px-4 py-2 border-b border-[#333] flex flex-wrap items-center justify-between gap-1.5 text-xs font-mono">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="bg-[#f59e0b] text-black px-1.5 py-0.2 font-bold text-[9px] sm:text-[10px] tracking-wider shrink-0">
                      STAGE {idx + 1}
                    </span>
                    <span className="text-[#888] font-bold text-[11px]">{section.number}</span>
                    <span className="text-white font-bold text-xs sm:text-sm">{section.title}</span>
                  </div>
                  <span className="text-[#666] text-[9px] hidden xs:inline">
                    FOLDER {idx + 1} / {activeSections.length}
                  </span>
                </div>

                {/* Folder Content */}
                <div className="p-3.5 sm:p-6 space-y-4">
                  {/* Photo Evidence Plate */}
                  {photoForThisStage ? (
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#000] p-2.5 border border-[#333]">
                      <div className="sm:col-span-5 aspect-video sm:aspect-4/3 overflow-hidden relative group border border-[#444]">
                        <img
                          src={photoForThisStage.url}
                          alt={photoForThisStage.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-[#f59e0b] text-black text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2">
                          EVIDENCE #{idx + 1}
                        </div>
                        <button
                          onClick={() => setSelectedPhoto(photoForThisStage)}
                          className="absolute bottom-1.5 right-1.5 p-1 bg-black/80 text-white text-xs border border-[#333]"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="sm:col-span-7 font-mono text-xs space-y-1">
                        <div className="text-[#f59e0b] font-bold text-xs sm:text-sm">
                          {photoForThisStage.title}
                        </div>
                        <p className="text-[#aaa] font-sans text-[11px] leading-relaxed">
                          {photoForThisStage.caption}
                        </p>
                        <div className="text-[9px] text-[#666]">
                          RECORDED: {photoForThisStage.timestamp}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* Section Paragraphs */}
                  <div className="space-y-2.5 text-[14px] sm:text-[15px] text-[#ccc] leading-relaxed font-sans text-justify">
                    {section.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* Transcript Log Entries */}
                  {section.logEntries && (
                    <div className="bg-[#000] border-l-2 border-[#f59e0b] p-3 font-mono text-xs space-y-1.5">
                      <div className="text-[9px] text-[#f59e0b] font-bold">
                        [FIELD AUDIO TRANSCRIPT]
                      </div>
                      {section.logEntries.map((log, lIdx) => (
                        <div key={lIdx} className="space-y-0.5">
                          <span className="text-[9px] text-[#666]">{log.time}</span>
                          <p className="text-[#aaa] pl-2 text-[12px] sm:text-[13px]">{log.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Callout: Dr. Arc's Clinical Assessment */}
                  {section.callout && (
                    <div className="bg-[#1a1608] border border-[#f59e0b]/40 p-3 text-xs font-mono text-yellow-100">
                      <div className="text-[#f59e0b] font-bold flex items-center gap-1.5 mb-0.5 text-[10px]">
                        <CornerDownRight className="w-3.5 h-3.5" />
                        <span>{section.callout.label}</span>
                      </div>
                      <p className="italic text-yellow-200/90 text-[12px] sm:text-[13px] leading-relaxed">
                        {section.callout.text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Binder Footer Seal */}
        <div className="p-3.5 sm:p-6 bg-[#111] border-t border-[#333] flex items-center justify-between text-xs font-mono text-[#888]">
          <div className="text-[10px] sm:text-xs">CASE BINDER SEALED // SOCO ARCHIVES</div>
          <div className="text-[#f59e0b] font-bold text-[10px] sm:text-xs">DR. ARC CLINICAL DOSSIER</div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[#111] border-2 border-[#f59e0b] max-w-2xl w-full p-3 sm:p-4 text-slate-100 font-mono text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
              <span className="text-[#f59e0b] font-bold truncate">
                EVIDENCE ANALYSIS // {selectedPhoto.code}
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-[#888] hover:text-white px-2 py-0.5 bg-[#222] border border-[#444] text-xs"
              >
                [ CLOSE ]
              </button>
            </div>
            <div className="max-h-[55vh] bg-black flex items-center justify-center overflow-hidden border border-[#333]">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[55vh] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="text-sm font-bold text-white">{selectedPhoto.title}</div>
              <p className="text-[#aaa] font-sans text-xs">{selectedPhoto.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
