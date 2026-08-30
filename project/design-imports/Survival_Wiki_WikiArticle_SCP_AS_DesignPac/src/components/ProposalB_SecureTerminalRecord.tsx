import React, { useState } from 'react';
import {
  Terminal,
  Activity,
  Shield,
  Layers,
  ChevronRight,
  MapPin,
  Clock,
  Radio,
  Eye,
  Maximize2,
  AlertCircle,
  Sliders,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { ActiveSimulationState, AnomalyArticleData, EvidencePhoto } from '../types';

interface Props {
  data: AnomalyArticleData;
  state: ActiveSimulationState;
  isMobile?: boolean;
}

export const ProposalB_SecureTerminalRecord: React.FC<Props> = ({ data, state, isMobile = false }) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);
  const [activeTabSec, setActiveTabSec] = useState<string>('sec-01');

  const visiblePhotos = data.photos.slice(0, state.photoCount);
  const currentPhoto = visiblePhotos[activePhotoIdx] || visiblePhotos[0] || null;

  const activeSections = state.textLength === 'full' ? data.sections : data.shortSections;
  const summaryText = state.textLength === 'full' ? data.executiveSummary : data.shortExecutiveSummary;

  const isOneColumn = isMobile || state.viewport === 'mobile' || state.viewport === 'direct_mobile';

  return (
    <div className="font-sans antialiased text-[#d1d1d1] w-full max-w-full overflow-x-hidden">
      {/* Secure Terminal Record Shell - High Density */}
      <div className="bg-[#0a0a0c] border border-[#333] shadow-2xl overflow-hidden">
        {/* Top Telemetry & Clearance Status Bar */}
        <div className="bg-[#111] border-b border-[#333] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-[#00ffcc] font-bold">
              <Terminal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-[11px] sm:text-xs">SECURE DB // {data.itemNumber}</span>
            </div>
            <span className="text-[#444] hidden xs:inline">|</span>
            <div className="flex items-center gap-1 text-[#00ffcc] text-[10px] sm:text-[11px]">
              <span className="w-1.5 h-1.5 bg-[#00ffcc] animate-pulse inline-block" />
              <span>ENCRYPTED [AES-512]</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px]">
            <span className="bg-[#1a1a1e] text-[#aaa] px-1.5 py-0.5 border border-[#333]">
              LV-{data.securityClearance}
            </span>
            <span className="bg-[#1a0a0a] text-[#ff3e3e] px-1.5 py-0.5 border border-[#ff3e3e]/60 font-bold">
              THREAT: {data.objectClass}
            </span>
          </div>
        </div>

        {/* Header Telemetry Block (Anomaly Metadata) */}
        <div className="p-3.5 sm:p-6 bg-[#0d0d0f] border-b border-[#333]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[9px] sm:text-[10px] font-mono text-[#00ffcc] uppercase tracking-[2px] mb-0.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00ffcc] shrink-0" />
                <span>ANOMALY TELEMETRY LOG</span>
              </div>
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-white tracking-tight break-words">
                『{data.locationName}』異常実体観測及び空間歪曲インシデント調書
              </h1>
              <p className="text-[10px] sm:text-xs text-[#888] font-mono mt-0.5">
                SUBJECT: {data.player} // SECTOR: {data.locationName} // TIME: {data.recordingDate}
              </p>
            </div>

            {/* Live Vector Telemetry Pill */}
            <div className="flex items-center gap-2 flex-wrap shrink-0">
              {state.hasCoordinates && data.coordinates && (
                <div className="bg-[#111] border border-[#00ffcc]/40 px-2 sm:px-3 py-1 font-mono text-[10px] sm:text-xs text-[#00ffcc] flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#00ffcc]" />
                  <span>
                    VECTOR: [{data.coordinates.x}, {data.coordinates.y}, {data.coordinates.z}]
                  </span>
                </div>
              )}
              {state.hasParty && data.companions && (
                <div className="bg-[#111] border border-[#a855f7]/40 px-2 sm:px-3 py-1 font-mono text-[10px] sm:text-xs text-[#d8b4fe]">
                  ENTITIES: {data.companions.length} OBSERVED
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Optical Evidence Feed Carousel (Presented seamlessly at top for mobile & 1-column views) */}
        {isOneColumn && (
          <div className="p-3 bg-[#0a0a0c] border-b border-[#333]">
            <div className="flex items-center justify-between text-xs font-mono text-[#888] mb-2">
              <span className="text-[#00ffcc] font-bold flex items-center gap-1 text-[11px]">
                <Radio className="w-3 h-3 text-[#00ffcc] animate-pulse" />
                OPTICAL SENSOR FEED
              </span>
              {visiblePhotos.length > 0 && (
                <span className="text-[10px] bg-[#111] text-[#00ffcc] px-1.5 py-0.5 border border-[#00ffcc]/60">
                  FEED {activePhotoIdx + 1} / {visiblePhotos.length}
                </span>
              )}
            </div>

            {visiblePhotos.length > 0 ? (
              <div className="space-y-2">
                <div className="relative aspect-video overflow-hidden border border-[#333] bg-[#000]">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 text-xs font-mono">
                    <div className="font-bold text-white text-[11px] sm:text-xs truncate">
                      {currentPhoto.code}: {currentPhoto.title}
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-[#aaa] truncate">
                      {currentPhoto.caption}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(currentPhoto)}
                    className="absolute top-2 right-2 p-1 bg-black/80 text-[#00ffcc] border border-[#333]"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumbnail Pager Bar */}
                {visiblePhotos.length > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex gap-1.5 overflow-x-auto">
                      {visiblePhotos.map((photo, idx) => (
                        <button
                          key={photo.id}
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`w-12 h-8 overflow-hidden shrink-0 border transition-all ${
                            activePhotoIdx === idx
                              ? 'border-[#00ffcc] ring-1 ring-[#00ffcc]'
                              : 'border-[#333] opacity-60'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt=""
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          setActivePhotoIdx(
                            (prev) => (prev - 1 + visiblePhotos.length) % visiblePhotos.length
                          )
                        }
                        className="p-1 bg-[#111] border border-[#333] text-[#888] hover:text-[#00ffcc]"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() =>
                          setActivePhotoIdx((prev) => (prev + 1) % visiblePhotos.length)
                        }
                        className="p-1 bg-[#111] border border-[#333] text-[#888] hover:text-[#00ffcc]"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#111] border border-dashed border-[#333] text-center text-[10px] sm:text-xs text-[#666] font-mono">
                [OPTICAL SENSOR FEED: OFFLINE // ログデータのみ閲覧可能]
              </div>
            )}
          </div>
        )}

        {/* Main Content Area (High Density Multi-Rail split for desktop / 1-column for mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 w-full">
          {/* Left Rail: Collapsible Section Nav (Desktop Only) */}
          {!isOneColumn && (
            <aside className="hidden lg:block lg:col-span-3 bg-[#0d0d0f] border-r border-[#333] p-4 font-mono text-xs space-y-4">
              <div className="text-[10px] text-[#666] uppercase tracking-wider font-bold flex items-center gap-1.5 pb-2 border-b border-[#333]">
                <Layers className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>INDEX / SECTIONS</span>
              </div>
              <nav className="space-y-1">
                {activeSections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#b-${sec.id}`}
                    onClick={() => setActiveTabSec(sec.id)}
                    className={`block px-2.5 py-2 text-xs transition-colors ${
                      activeTabSec === sec.id
                        ? 'bg-[#141416] text-[#00ffcc] border-l-2 border-[#00ffcc] font-bold'
                        : 'text-[#888] hover:text-[#eee] hover:bg-[#111]'
                    }`}
                  >
                    <div className="text-[10px] text-[#666]">{sec.number}</div>
                    <div className="truncate">{sec.title.split('(')[0]}</div>
                  </a>
                ))}
              </nav>

              {/* Threat Level Bar */}
              <div className="pt-4 border-t border-[#333] space-y-2">
                <div className="text-[10px] text-[#666] flex items-center justify-between">
                  <span>THREAT INDEX</span>
                  <span className="text-[#ff3e3e] font-bold">LEVEL 4.8</span>
                </div>
                <div className="w-full bg-[#222] h-1.5 overflow-hidden">
                  <div className="bg-[#ff3e3e] h-full w-[80%]" />
                </div>
              </div>
            </aside>
          )}

          {/* Central Channel: Dedicated High-Contrast Reading Column */}
          <div
            className={`p-3.5 sm:p-6 lg:p-8 bg-[#141416] ${
              !isOneColumn ? 'lg:col-span-6' : 'col-span-12'
            }`}
          >
            {/* Executive Abstract Panel */}
            <div className="bg-[#111] border border-[#333] p-3.5 sm:p-4 mb-5 text-sm">
              <div className="text-xs font-mono text-[#00ffcc] font-bold mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>EXECUTIVE LOG SUMMARY // 概要要約</span>
              </div>
              <p className="text-[#ccc] leading-relaxed font-sans text-[14px] sm:text-[15px]">
                {summaryText}
              </p>
            </div>

            {/* Special Containment Protocol Box in Terminal */}
            <div className="bg-[#1a0a0a] border-l-2 border-[#ff3e3e] p-3.5 sm:p-4 mb-5">
              <div className="text-[10px] font-mono text-[#ff3e3e] uppercase font-bold tracking-wider mb-1">
                CONTAINMENT DIRECTIVE
              </div>
              <p className="text-xs sm:text-[13px] text-[#ddd] font-serif leading-relaxed">
                対象は半径500メートルの立ち入り禁止区域内に隔離される必要がある。区域内での電子機器の使用は一切禁止されており、違反者は強制格下げの対象となる。
              </p>
            </div>

            {/* Sections Stream */}
            <div className="space-y-6 sm:space-y-8">
              {activeSections.map((sec) => (
                <section
                  key={sec.id}
                  id={`b-${sec.id}`}
                  className="space-y-2.5 border-t border-[#333] pt-4 sm:pt-5"
                >
                  <div>
                    <span className="text-[11px] font-mono text-[#00ffcc] font-bold block">
                      {sec.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold text-white">{sec.title}</h2>
                    {sec.subTitle && (
                      <p className="text-[11px] text-[#888] font-mono">{sec.subTitle}</p>
                    )}
                  </div>

                  {/* Paragraphs */}
                  <div className="space-y-2.5 text-[14px] sm:text-[15px] text-[#ccc] leading-relaxed font-sans text-justify">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* Transcripts / Audio Intercepts */}
                  {sec.logEntries && (
                    <div className="my-3 bg-[#000] border-l-2 border-[#ff3e3e] p-3 font-mono text-xs space-y-2">
                      <div className="text-[10px] text-[#ff3e3e] font-bold">
                        [AUDIO INTERCEPT STREAM]
                      </div>
                      {sec.logEntries.map((log, lIdx) => (
                        <div key={lIdx} className="space-y-0.5">
                          <span className="text-[9px] text-[#666]">{log.time}</span>
                          <p className="text-[#aaa] pl-2 text-[12px] sm:text-[13px] leading-snug">
                            {log.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Callout */}
                  {sec.callout && (
                    <div className="my-3 bg-[#111] border border-[#333] p-3 text-xs font-mono">
                      <div className="text-[#ff3e3e] font-bold mb-0.5 text-[10px]">
                        {sec.callout.label}
                      </div>
                      <p className="text-[#888] italic text-[12px]">{sec.callout.text}</p>
                    </div>
                  )}
                </section>
              ))}
            </div>
          </div>

          {/* Right Rail: Evidence Camera Vault & Attachment Index (Desktop Only) */}
          {!isOneColumn && (
            <aside className="hidden lg:block lg:col-span-3 bg-[#0a0a0c] border-l border-[#333] flex flex-col overflow-hidden font-mono text-xs">
              <div className="p-4 border-b border-[#333] bg-[#111]">
                <div className="text-[10px] text-[#666] uppercase mb-2 flex items-center justify-between">
                  <span>Visual Evidence</span>
                  <span className="text-[#00ffcc]">[{visiblePhotos.length} FEEDS]</span>
                </div>
                {visiblePhotos.length > 0 ? (
                  <div className="space-y-3">
                    {visiblePhotos.slice(0, 2).map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => setSelectedPhoto(photo)}
                        className="aspect-video bg-[#000] border border-[#444] relative overflow-hidden flex items-center justify-center cursor-pointer group"
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                        <div className="text-[10px] absolute bottom-2 left-2 text-[#888] font-mono truncate max-w-[85%]">
                          {photo.code}: {photo.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="aspect-square bg-[#111] border border-[#444] relative overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full bg-stripe opacity-20" />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[#444] font-mono">
                        PHOTO_UNAVAILABLE
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attachment Index Section */}
              <div className="flex-1 p-4 bg-[#0d0d0f] space-y-4">
                <div className="text-[10px] text-[#666] uppercase mb-3">Attachment Index</div>
                <ul className="space-y-2 text-[10px] font-mono text-[#888]">
                  <li className="flex justify-between hover:text-[#00ffcc] cursor-pointer">
                    <span>&gt; SENSOR_MAP_A.dat</span> <span className="text-[#666]">[8kb]</span>
                  </li>
                  <li className="flex justify-between hover:text-[#00ffcc] cursor-pointer">
                    <span>&gt; AUDIO_LOG_04.mp3</span> <span className="text-[#666]">[1.2mb]</span>
                  </li>
                  <li className="flex justify-between hover:text-[#00ffcc] cursor-pointer">
                    <span>&gt; BIO_READING.xml</span> <span className="text-[#666]">[42kb]</span>
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-[#111] border-t border-[#333] text-center text-[10px] text-[#444]">
                STATUS: SYNC_COMPLETE
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[#0a0a0c] border-2 border-[#00ffcc] max-w-2xl w-full p-3 sm:p-4 text-slate-100 font-mono text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
              <span className="text-[#00ffcc] font-bold truncate">
                SENSOR TELEMETRY // {selectedPhoto.code}
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-[#888] hover:text-white px-2 py-0.5 bg-[#222] border border-[#444] text-xs font-mono"
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
