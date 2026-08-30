import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Paperclip,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  AlertTriangle,
  ZoomIn,
  Stamp,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Layers,
} from 'lucide-react';
import { ActiveSimulationState, AnomalyArticleData, EvidencePhoto } from '../types';

interface Props {
  data: AnomalyArticleData;
  state: ActiveSimulationState;
  isMobile?: boolean;
}

export const ProposalA_DeclassifiedDossier: React.FC<Props> = ({ data, state, isMobile = false }) => {
  const [selectedPhoto, setSelectedPhoto] = useState<EvidencePhoto | null>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [declassifiedMode, setDeclassifiedMode] = useState(true);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

  const visiblePhotos = data.photos.slice(0, state.photoCount);
  const leadPhoto = visiblePhotos.length > 0 ? visiblePhotos[0] : null;
  const secondaryPhotos = visiblePhotos.length > 1 ? visiblePhotos.slice(1) : [];

  const activeSections = state.textLength === 'full' ? data.sections : data.shortSections;
  const summaryText = state.textLength === 'full' ? data.executiveSummary : data.shortExecutiveSummary;

  return (
    <div className="relative font-sans antialiased text-[#d1d1d1] w-full max-w-full overflow-x-hidden">
      {/* High-Density Classified Dossier Paper Binder */}
      <div className="bg-[#0f0f12] border border-[#333338] shadow-2xl overflow-hidden relative">
        {/* Top File Binder Header Strip */}
        <div className="bg-[#141418] border-b border-[#333338] px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-[#888]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="w-2 h-2 bg-[#ff3e3e] inline-block animate-pulse shrink-0" />
            <span className="font-bold text-[#ff3e3e] tracking-wider uppercase truncate">
              TOP SECRET // SCP_DOSSIER
            </span>
            <span className="text-[#444] hidden xs:inline">|</span>
            <span className="hidden xs:inline">CASE: {data.caseId}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeclassifiedMode(!declassifiedMode)}
              className="flex items-center gap-1 bg-[#1a0a0a] hover:bg-[#2a1010] text-[#ff3e3e] border border-[#ff3e3e]/60 px-2 py-0.5 font-bold tracking-wider font-mono text-[9px] sm:text-[10px] transition-colors"
            >
              {declassifiedMode ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              <span>{declassifiedMode ? '機密解除中' : '黒塗り適用中'}</span>
            </button>
            <span className="hidden sm:inline text-[#666] text-[9px]">FORM SOCO-ARCH-08</span>
          </div>
        </div>

        {/* Paper Document Canvas (Clean Light Tone with High Density SCP Markings) */}
        <div className="bg-[#f5f2ea] text-[#1c1917] p-3.5 sm:p-8 lg:p-10 w-full max-w-full">
          {/* Top Dossier Title & Stamp Header */}
          <div className="border-b-2 border-[#1c1917] pb-4 sm:pb-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1 sm:space-y-1.5 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#78716c]">
                  <FileText className="w-3.5 h-3.5 text-[#b91c1c] shrink-0" />
                  <span className="font-bold tracking-wider uppercase truncate">
                    SPECIAL ANOMALY OBSERVATION DOSSIER
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl lg:text-3xl font-serif font-black text-[#1c1917] tracking-tight leading-snug break-words">
                  『{data.locationName}』における被検体「{data.player}」の異常侵入及び知的迷走調書
                </h1>
                <p className="text-[10px] sm:text-xs font-mono text-[#78716c]">
                  CLEARANCE: LV-{data.securityClearance} // CLASSIFICATION: {data.objectClass} // DATE: {data.recordingDate}
                </p>
              </div>

              {/* Crimson Stamp Badge */}
              <div className="shrink-0 self-start sm:self-auto">
                <div className="border-2 border-[#b91c1c] text-[#b91c1c] px-2.5 py-1 font-mono text-center uppercase rotate-[-2deg] bg-red-50/80 shadow-xs">
                  <div className="text-[10px] font-black tracking-wider border-b border-[#b91c1c] pb-0.5">
                    SOCO ARCHIVE
                  </div>
                  <div className="text-[9px] font-bold tracking-tight pt-0.5">
                    CLASS: {data.objectClass}
                  </div>
                  <div className="text-[8px] text-[#7f1d1d]">{data.itemNumber}</div>
                </div>
              </div>
            </div>

            {/* Official High-Density Archival Meta Strip */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#ece6d8] border border-[#d6cfc0] p-2.5 text-[11px] font-mono">
              <div>
                <span className="text-[9px] text-[#78716c] block">ITEM NUMBER</span>
                <span className="font-bold text-[#1c1917]">{data.itemNumber}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#78716c] block">OBJECT CLASS</span>
                <span className="font-bold text-[#b91c1c] flex items-center gap-0.5">
                  <ShieldAlert className="w-3 h-3" />
                  {data.objectClass}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-[#78716c] block">PRIMARY SUBJECT</span>
                <span className="font-bold text-[#1c1917] truncate block">{data.player}</span>
              </div>
              <div>
                <span className="text-[9px] text-[#78716c] block">TARGET SECTOR</span>
                <span className="font-bold text-[#1c1917] truncate block">{data.locationName}</span>
              </div>

              {/* Dynamic Metadata: Coordinates */}
              {state.hasCoordinates && data.coordinates && (
                <div className="col-span-2 sm:col-span-2 bg-[#e2dcce] p-1.5 border border-[#cfc6b4]">
                  <span className="text-[9px] text-[#78716c] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#b91c1c]" />
                    OBSERVATION COORDINATES (XYZ)
                  </span>
                  <span className="font-bold text-[#1c1917] text-xs truncate block">
                    X:{data.coordinates.x} / Y:{data.coordinates.y} / Z:{data.coordinates.z}
                  </span>
                </div>
              )}

              {/* Dynamic Metadata: Companions */}
              {state.hasParty && data.companions && data.companions.length > 0 && (
                <div className="col-span-2 sm:col-span-2 bg-[#e2dcce] p-1.5 border border-[#cfc6b4]">
                  <span className="text-[9px] text-[#78716c]">ASSOCIATED ENTITIES (D-CLASS)</span>
                  <span className="font-bold text-[#1c1917] text-xs truncate block">
                    {data.companions.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Red Warning Banner Strip */}
          <div className="bg-[#fee2e2] border-l-3 sm:border-l-4 border-[#dc2626] p-2.5 sm:p-3 mb-5 text-xs text-[#991b1b] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#dc2626] mt-0.5" />
            <div className="text-[11px] sm:text-[12px] leading-relaxed">
              <span className="font-bold font-mono uppercase mr-1">WARNING:</span>
              {data.warningNotice}
            </div>
          </div>

          {/* High Density Containment Protocol Box */}
          <section className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#b91c1c] mb-1.5 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 bg-[#b91c1c] inline-block" /> 特別収容プロトコル (SPECIAL CONTAINMENT PROCEDURES)
            </h3>
            <div className="bg-[#1a1a1c] text-[#d1d1d1] border border-[#2a2a2e] p-3 sm:p-4 text-xs sm:text-sm leading-relaxed font-serif shadow-inner">
              対象は半径500メートルの立ち入り禁止区域内に隔離される必要がある。区域内での電子機器の使用は一切禁止されており、違反者は
              {declassifiedMode ? (
                <span className="text-[#ff3e3e] font-bold mx-1">[Dクラス強制格下げ処分]</span>
              ) : (
                <span className="bg-black text-black select-none px-2 py-0.2 mx-1 font-mono">████████</span>
              )}
              の対象となる。研究員は防護服を着用し、一回あたり15分以上の滞在は許されない。
            </div>
          </section>

          {/* Executive Summary with Attached Lead Photo */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
              <div className="flex-1 space-y-2.5 min-w-0">
                <div className="flex items-center gap-2 border-b border-[#d6cfc0] pb-1">
                  <span className="font-mono text-xs font-bold text-[#b91c1c]">§ 0.0</span>
                  <h2 className="text-sm sm:text-base font-bold text-[#1c1917]">調書要旨 (Executive Abstract)</h2>
                </div>
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#292524] text-justify font-sans">
                  {summaryText}
                </p>
                <div className="text-[11px] font-mono text-[#78716c] pt-0.5">
                  調書作成官：{data.doctorTitle}　{data.doctorName}
                </div>
              </div>

              {/* Lead Evidence Photo (Exhibit A-1) */}
              {leadPhoto ? (
                <div className="w-full md:w-64 shrink-0 bg-white p-2 border border-[#d6cfc0] shadow-sm relative group">
                  <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-[#b91c1c] text-white px-2 py-0.5 text-[9px] font-mono font-bold shadow-xs">
                    <Paperclip className="w-2.5 h-2.5" />
                    <span>EXHIBIT A-1</span>
                  </div>
                  <div className="aspect-video sm:aspect-4/3 w-full bg-slate-900 overflow-hidden relative mt-1">
                    <img
                      src={leadPhoto.url}
                      alt={leadPhoto.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setSelectedPhoto(leadPhoto)}
                      className="absolute bottom-1 right-1 p-1 bg-black/80 text-white text-[10px] flex items-center gap-0.5"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mt-1.5 text-[10px] font-mono text-[#44403c] space-y-0.5">
                    <div className="font-bold text-[#1c1917] truncate">{leadPhoto.title}</div>
                    <div className="text-[9px] text-[#78716c]">{leadPhoto.timestamp}</div>
                  </div>
                </div>
              ) : (
                /* 0 Photos Fallback */
                <div className="w-full md:w-60 shrink-0 bg-[#ebe5d6] p-3 border border-dashed border-[#b91c1c]/40 text-center">
                  <Stamp className="w-5 h-5 mx-auto text-[#b91c1c]/60 mb-1" />
                  <div className="text-[9px] font-mono font-bold text-[#b91c1c] uppercase">
                    NO PHYSICAL EVIDENCE ATTACHED
                  </div>
                  <p className="text-[9px] text-[#78716c] mt-0.5">
                    電磁障害により光学撮影データ未収容。ログ調書のみ保全。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* MOBILE PHOTO CAROUSEL / SWIPE DRAWER (When 2+ photos exist on mobile/compact view) */}
          {secondaryPhotos.length > 0 && (
            <div className="mb-6 bg-[#ebe5d6] border border-[#d6cfc0] p-3">
              <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                <span className="font-bold text-[#b91c1c] flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  追加添付証拠写真 ({secondaryPhotos.length}件)
                </span>
                <span className="text-[10px] text-[#78716c]">
                  {activeCarouselIdx + 1} / {secondaryPhotos.length}
                </span>
              </div>

              {/* Active Secondary Evidence Card */}
              {secondaryPhotos[activeCarouselIdx] && (
                <div className="bg-white border border-[#d6cfc0] p-2 flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-full sm:w-44 aspect-video sm:aspect-square bg-slate-900 overflow-hidden relative shrink-0">
                    <img
                      src={secondaryPhotos[activeCarouselIdx].url}
                      alt={secondaryPhotos[activeCarouselIdx].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <button
                      onClick={() => setSelectedPhoto(secondaryPhotos[activeCarouselIdx])}
                      className="absolute bottom-1 right-1 p-1 bg-black/80 text-white text-[10px]"
                    >
                      <ZoomIn className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-full font-mono text-xs space-y-1">
                    <div className="text-[10px] text-[#b91c1c] font-bold">
                      [{secondaryPhotos[activeCarouselIdx].code}]
                    </div>
                    <div className="font-bold text-[#1c1917] text-xs sm:text-sm">
                      {secondaryPhotos[activeCarouselIdx].title}
                    </div>
                    <p className="text-[#57534e] font-sans text-[11px] leading-relaxed">
                      {secondaryPhotos[activeCarouselIdx].caption}
                    </p>
                    <div className="text-[9px] text-[#78716c]">
                      撮影日時: {secondaryPhotos[activeCarouselIdx].timestamp}
                    </div>
                  </div>
                </div>
              )}

              {/* Thumbnail Strip Controls */}
              {secondaryPhotos.length > 1 && (
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#d6cfc0]">
                  <div className="flex gap-1.5 overflow-x-auto">
                    {secondaryPhotos.map((photo, pIdx) => (
                      <button
                        key={photo.id}
                        onClick={() => setActiveCarouselIdx(pIdx)}
                        className={`w-10 h-7 overflow-hidden border transition-all ${
                          activeCarouselIdx === pIdx
                            ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]'
                            : 'border-[#cfc6b4] opacity-70'
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
                        setActiveCarouselIdx(
                          (prev) => (prev - 1 + secondaryPhotos.length) % secondaryPhotos.length
                        )
                      }
                      className="p-1 bg-white border border-[#d6cfc0] text-[#78716c] hover:text-[#b91c1c]"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveCarouselIdx((prev) => (prev + 1) % secondaryPhotos.length)
                      }
                      className="p-1 bg-white border border-[#d6cfc0] text-[#78716c] hover:text-[#b91c1c]"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Collapsible Table of Contents */}
          <div className="my-5 bg-[#ebe5d6] border border-[#d6cfc0] overflow-hidden">
            <button
              onClick={() => setIndexOpen(!indexOpen)}
              className="w-full px-3 py-2 flex items-center justify-between text-xs font-mono font-bold text-[#44403c] hover:bg-[#e2dcce] transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#b91c1c]" />
                <span>調書目次 (INDEX - {activeSections.length} SECTIONS)</span>
              </div>
              {indexOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {indexOpen && (
              <div className="px-3 py-2.5 border-t border-[#d6cfc0] bg-[#f2eee4] space-y-1.5 text-xs font-mono">
                {activeSections.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className="block text-[#57534e] hover:text-[#b91c1c] hover:underline truncate"
                  >
                    <span className="font-bold text-[#b91c1c] mr-1.5">{sec.number}</span>
                    <span>{sec.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Main Dossier Sections */}
          <div className="space-y-6 sm:space-y-8">
            {activeSections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="border-t border-[#d6cfc0] pt-4 sm:pt-6 relative"
              >
                {/* Section Title Header */}
                <div className="mb-2.5">
                  <span className="text-[11px] font-mono font-bold text-[#b91c1c] block uppercase tracking-wider">
                    {section.number}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1c1917] tracking-tight">
                    {section.title}
                  </h3>
                  {section.subTitle && (
                    <p className="text-[11px] text-[#78716c] font-mono mt-0.5">{section.subTitle}</p>
                  )}
                </div>

                {/* Section Body Paragraphs */}
                <div className="space-y-2.5">
                  {section.paragraphs.map((p, pIdx) => (
                    <p
                      key={pIdx}
                      className="text-[14px] sm:text-[15px] text-[#292524] leading-relaxed text-justify font-sans"
                    >
                      {p}
                    </p>
                  ))}

                  {/* Incident Log Entries */}
                  {section.logEntries && section.logEntries.length > 0 && (
                    <div className="my-3.5 bg-[#0a0a0c] text-[#d1d1d1] border-l-3 border-[#b91c1c] p-3 font-mono text-xs space-y-2">
                      <div className="text-[10px] text-[#ff3e3e] uppercase font-bold tracking-wider flex items-center justify-between">
                        <span>[TRANSCRIPT LOG: EVENT STREAM]</span>
                        <span className="text-[#666] text-[9px]">AUDIO_VERIFIED</span>
                      </div>
                      {section.logEntries.map((log, lIdx) => (
                        <div key={lIdx} className="space-y-0.5 border-t border-[#222] pt-1.5 first:border-0 first:pt-0">
                          <div className="text-[9px] text-[#ff3e3e] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#888]" />
                            <span>{log.time}</span>
                            {log.speaker && <span className="text-[#888]">/ {log.speaker}</span>}
                          </div>
                          <div className="text-[#ccc] pl-3 text-[12px] sm:text-[13px] leading-snug">
                            {log.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Official Directive Callout Box */}
                  {section.callout && (
                    <div className="my-3.5 bg-[#f8f5ee] border border-[#cfc6b4] p-3 relative">
                      <div className="text-[9px] font-mono font-bold text-[#b91c1c] uppercase tracking-wider mb-0.5">
                        {section.callout.label}
                      </div>
                      <p className="text-xs sm:text-[13px] italic text-[#44403c] font-serif leading-relaxed">
                        {section.callout.text}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Dossier Footer Sign-off & Seal */}
          <div className="mt-8 pt-5 border-t-2 border-[#1c1917] flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[#78716c]">
            <div>
              <div className="font-bold text-[#1c1917]">ARCHIVAL VERIFICATION COMPLETED</div>
              <div className="text-[9px]">特異点監視機関 SOCO 保管番号: {data.caseId}</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[9px] text-[#78716c]">SIGNATURE OF LEAD EXAMINER</div>
                <div className="font-serif italic text-sm sm:text-base font-bold text-[#b91c1c]">
                  Dr. Arc, Ph.D.
                </div>
              </div>
              <div className="w-10 h-10 border-2 border-dashed border-[#b91c1c] flex items-center justify-center text-[8px] text-[#b91c1c] font-bold rotate-12">
                SEALED
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Evidence Photos */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-[#111114] border-2 border-[#ff3e3e] max-w-2xl w-full p-3 sm:p-4 text-slate-100 font-mono text-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#333] pb-2 mb-3">
              <span className="text-[#ff3e3e] font-bold flex items-center gap-1.5 truncate">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                EXHIBIT FORENSIC VIEWER // {selectedPhoto.code}
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
              <div className="text-[9px] text-[#666] pt-0.5 font-mono">
                撮影日時: {selectedPhoto.timestamp} / 観測状態: {selectedPhoto.status}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
