import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Eye,
  EyeOff,
  FileText,
  MapPin,
  Paperclip,
  ShieldAlert,
  Stamp,
  Users,
  ZoomIn,
} from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { getPhotoUrl } from '@/lib/db';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';
import { parseStoredScpDossier, type ScpDossierV1 } from '@/lib/wikiScp';

type LocationLink = {
  name: string;
  onClick: () => void;
};

type Props = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  content: string;
  mainPhotoUrl: string | null;
  narratorLine: string;
  locationLinks: LocationLink[];
};

type EvidenceView = {
  id: string;
  code: string;
  url: string;
  title: string;
  caption: string;
  timestamp: string;
};

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function firstCoordinateLocation(locations: LocationWithPhotos[]) {
  return locations.find((location) => location.has_coordinates) ?? null;
}

function oldestRecordingDate(locations: LocationWithPhotos[]) {
  const values = locations
    .map((location) => location.created_at)
    .filter(Boolean)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return values[0] ? formatTimestamp(values[0]) : 'DATE_UNVERIFIED';
}

function legacyItemNumber(content: string, worldId: string) {
  const match = content.match(/(?:項目番号|Item Number)\s*[:：]\s*([^\n]+)/i);
  return match?.[1]?.replace(/\*\*/g, '').trim() || `CASE-${worldId.slice(0, 8).toUpperCase()}`;
}

export function ScpDossierArticle({
  world,
  locations,
  content,
  mainPhotoUrl,
  narratorLine,
  locationLinks,
}: Props) {
  const dossier = useMemo(() => parseStoredScpDossier(content), [content]);
  const narrator = NARRATORS.scp;
  const coordinateLocation = firstCoordinateLocation(locations);
  const companions = world.members.map((member) => member.name).filter(Boolean);
  const [caseDataOpen, setCaseDataOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [declassifiedMode, setDeclassifiedMode] = useState(true);
  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<EvidenceView | null>(null);
  const [evidencePhotos, setEvidencePhotos] = useState<EvidenceView[]>([]);

  const sourcePhotos = useMemo(() => locations
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .flatMap((location) => location.photos
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .slice(0, 5), [locations]);

  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    const loadPhotos = async () => {
      const resolved = await Promise.all(sourcePhotos.map(async ({ location, photo }, index) => {
        const url = await getPhotoUrl(photo.storage_path);
        if (url.startsWith('blob:')) blobUrls.push(url);
        return {
          id: photo.id,
          code: index === 0 ? 'EXHIBIT A-1' : `EVIDENCE ${String(index + 1).padStart(2, '0')}`,
          url,
          title: location.name,
          caption: location.detail_memo?.trim() || `${location.name}で保全された観測写真。`,
          timestamp: formatTimestamp(photo.created_at),
        } satisfies EvidenceView;
      }));
      if (!cancelled) {
        setEvidencePhotos(resolved);
        setActiveCarouselIdx(0);
      }
    };

    void loadPhotos().catch(() => {
      if (!cancelled) setEvidencePhotos([]);
    });

    return () => {
      cancelled = true;
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [sourcePhotos]);

  if (!dossier) {
    return (
      <div className="scp-as-shell grid w-full grid-cols-1 overflow-hidden bg-[#0a0a0c] text-[#d1d1d1] lg:grid-cols-[288px_minmax(0,1fr)]">
        <ResearcherAside
          objectClass="CLASSIFIED"
          narratorLine={narratorLine || narrator.quote}
          coordinateLocation={coordinateLocation}
          companions={companions}
          recordingDate={oldestRecordingDate(locations)}
        />
        <main className="min-w-0 bg-[#141416] p-3 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <div className="border-b border-[#333] pb-3 font-mono text-[10px] text-[#888]">
              LEGACY_SCP_RECORD // RESET AND RE-COMPILE TO UPGRADE DOSSIER
            </div>
            <div className="border border-[#333338] bg-[#0f0f12] shadow-2xl">
              <div className="border-b border-[#333338] bg-[#141418] px-4 py-2 font-mono text-[10px] font-bold tracking-wider text-[#ff3e3e]">
                TOP SECRET // LEGACY SCP DOSSIER
              </div>
              <div className="bg-[#f5f2ea] p-4 text-[#1c1917] sm:p-8">
                {mainPhotoUrl && (
                  <figure className="float-none mb-5 ml-auto w-full max-w-sm border border-[#d6cfc0] bg-white p-2 shadow-sm sm:w-72">
                    <img src={mainPhotoUrl} alt="代表証拠写真" className="aspect-video w-full border border-[#57534e] object-cover" />
                  </figure>
                )}
                <MarkdownRenderer content={content} locationLinks={locationLinks} className="font-sans" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="scp-as-shell w-full overflow-hidden bg-[#0a0a0c] text-[#d1d1d1]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-[288px_minmax(0,1fr)]">
        <ResearcherAside
          objectClass={dossier.objectClass}
          narratorLine={narratorLine || narrator.quote}
          coordinateLocation={coordinateLocation}
          companions={companions}
          recordingDate={oldestRecordingDate(locations)}
        />

        <main className="min-w-0 bg-[#141416] p-3 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-4 sm:space-y-6">
            <div className="flex flex-col justify-between gap-2 border-b border-[#333] pb-2.5 font-mono text-xs sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-[10px] sm:text-xs">
                <span className="shrink-0 font-bold uppercase tracking-widest text-[#00ffcc]">SECURE_DOSSIER</span>
                <span className="text-[#444]">|</span>
                <span className="truncate text-[#888]">CASE: {dossier.caseId}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1 overflow-x-auto py-0.5">
                <span className="whitespace-nowrap border border-[#333] bg-[#1a1a1c] px-2 py-0.5 text-[9px] text-[#666] sm:text-[10px]">百科事典 (Hernan)</span>
                <span className="whitespace-nowrap border border-[#ff3e3e] bg-[#1a0a0a] px-2 py-0.5 text-[9px] font-bold text-[#ff3e3e] shadow-[0_0_8px_rgba(255,62,62,0.2)] sm:text-[10px]">SCP調 (Dr.アーク) ★</span>
                <span className="whitespace-nowrap border border-[#333] bg-[#1a1a1c] px-2 py-0.5 text-[9px] text-[#666] sm:text-[10px]">古代伝承 (Gildas)</span>
              </div>
            </div>

            <MobileCaseData
              dossier={dossier}
              narratorLine={narratorLine || narrator.quote}
              coordinateLocation={coordinateLocation}
              companions={companions}
              recordingDate={oldestRecordingDate(locations)}
              open={caseDataOpen}
              onToggle={() => setCaseDataOpen((current) => !current)}
              player={world.player || '記録者'}
              worldName={world.name}
            />

            <div className="flex flex-col justify-between gap-1.5 border-b border-[#333] pb-3 sm:flex-row sm:items-end">
              <div className="min-w-0">
                <div className="mb-0.5 font-mono text-[9px] uppercase tracking-[2px] text-[#00ffcc] sm:text-[10px]">CONFIDENTIAL_ANOMALY_RECORD</div>
                <h2 className="break-words text-lg font-bold tracking-tight text-white sm:text-2xl">案件番号：{dossier.itemNumber} [{world.name}]</h2>
              </div>
              <div className="shrink-0 font-mono text-[10px] text-[#666] sm:text-right">SERIAL: <span className="font-bold text-[#d1d1d1]">{dossier.caseId}</span></div>
            </div>

            <DossierPaper
              dossier={dossier}
              world={world}
              coordinateLocation={coordinateLocation}
              companions={companions}
              evidencePhotos={evidencePhotos}
              activeCarouselIdx={activeCarouselIdx}
              setActiveCarouselIdx={setActiveCarouselIdx}
              indexOpen={indexOpen}
              setIndexOpen={setIndexOpen}
              declassifiedMode={declassifiedMode}
              setDeclassifiedMode={setDeclassifiedMode}
              setSelectedPhoto={setSelectedPhoto}
            />

            {locationLinks.length > 0 && (
              <div className="border border-[#333] bg-[#0f0f12] p-3 font-mono">
                <div className="mb-2 text-[10px] font-bold tracking-wider text-[#00ffcc]">RELATED_RECORDS // SOURCE LOCATIONS</div>
                <div className="flex flex-wrap gap-1.5">
                  {locationLinks.map((location) => (
                    <button
                      key={location.name}
                      type="button"
                      onClick={location.onClick}
                      className="border border-[#333] bg-[#16161a] px-2 py-1 text-[10px] text-[#aaa] transition-colors hover:border-[#00ffcc]/60 hover:text-[#00ffcc]"
                    >
                      &gt; {location.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-2xl border-2 border-[#ff3e3e] bg-[#111114] p-3 font-mono text-xs text-slate-100 shadow-2xl sm:p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#333] pb-2">
              <span className="flex min-w-0 items-center gap-1.5 truncate font-bold text-[#ff3e3e]"><ShieldAlert className="h-4 w-4 shrink-0" />EXHIBIT FORENSIC VIEWER // {selectedPhoto.code}</span>
              <button type="button" onClick={() => setSelectedPhoto(null)} className="shrink-0 border border-[#444] bg-[#222] px-2 py-0.5 text-[#aaa] hover:text-white">[ CLOSE ]</button>
            </div>
            <div className="flex max-h-[60vh] items-center justify-center overflow-hidden border border-[#333] bg-black">
              <img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[60vh] w-auto object-contain" />
            </div>
            <div className="mt-2.5 space-y-1">
              <div className="text-sm font-bold text-white">{selectedPhoto.title}</div>
              <p className="font-sans text-xs text-[#aaa]">{selectedPhoto.caption}</p>
              <div className="pt-0.5 text-[9px] text-[#666]">撮影日時: {selectedPhoto.timestamp}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResearcherAside({
  objectClass,
  narratorLine,
  coordinateLocation,
  companions,
  recordingDate,
}: {
  objectClass: string;
  narratorLine: string;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  recordingDate: string;
}) {
  return (
    <aside className="hidden border-r border-[#333] bg-[#0d0d0f] p-4 lg:flex lg:flex-col lg:space-y-4">
      <div>
        <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[#666]">Researcher ID</div>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden border border-[#444] bg-[#222]">
            <PixelNarrator style="scp" compact />
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 border border-[#111] bg-[#00ffcc]" />
          </div>
          <div className="min-w-0 space-y-0.5 font-mono">
            <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">Dr. Ark <span className="text-[9px] font-normal text-[#888]">(特異点観測官)</span></div>
            <div className="text-[9px] font-bold tracking-wider text-[#ff3e3e]">CLEARANCE: LEVEL 5</div>
            <div className="text-[9px] text-[#666]">ID: ARK-994-SOCO</div>
          </div>
        </div>
      </div>

      <div className="border-l-2 border-[#ff3e3e] bg-[#1a0a0a] py-1.5 pl-3">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[#666]">Classification</div>
        <div className="break-words font-mono text-base font-bold tracking-tighter text-[#ff3e3e]">{objectClass}</div>
      </div>

      <div className="space-y-1.5 border border-[#333] bg-[#111] p-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#666]"><span>Location Data</span><span className={coordinateLocation ? 'text-[#00ffcc]' : 'text-[#777]'}>{coordinateLocation ? 'GPS_LOCKED' : 'SENSOR_OFFLINE'}</span></div>
        {coordinateLocation ? (
          <div className="grid grid-cols-2 gap-y-1.5 font-mono text-[11px]">
            <span className="text-[#888]">X:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.x}</span>
            <span className="text-[#888]">Y:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.y}</span>
            <span className="text-[#888]">Z:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.z}</span>
            <span className="text-[#888]">Timestamp:</span><span className="text-right text-[#d1d1d1]">{recordingDate}</span>
          </div>
        ) : <div className="font-mono text-xs italic text-[#777]">None [Sensor Offline]</div>}
      </div>

      {companions.length > 0 && (
        <div className="border border-[#333] bg-[#111] p-3">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase text-[#666]"><span>Accompanying</span><span className="text-[9px] text-[#888]">{companions.length} ENTITIES</span></div>
          <div className="space-y-1 font-mono text-xs">
            {companions.map((name, index) => <div key={`${name}-${index}`} className="flex items-center justify-between text-[11px] text-[#aaa]"><span className="text-[#888]">&gt; D-{index + 104}:</span><span className="font-bold text-[#d1d1d1]">{name}</span></div>)}
          </div>
        </div>
      )}

      <div className="relative mt-2 border border-[#222] bg-[#111] p-3.5 text-[11px] italic leading-relaxed text-[#888]">
        <span className="absolute -top-2 left-2 bg-[#0d0d0f] px-2 font-mono text-[9px] font-bold tracking-wider text-[#666]">NPC_COMMENTS</span>
        <p className="mt-1 font-sans text-[#aaa]">「{narratorLine}」</p>
        <div className="mt-2 text-right font-mono text-[9px] text-[#ff3e3e]">— Dr. Ark / SPECIAL OBSERVATION UNIT</div>
      </div>

      <div className="mt-auto border border-[#222] bg-[#111] p-2.5 text-center font-mono text-[10px] tracking-widest text-[#555]"><span className="mr-1.5 text-[#00ffcc]">●</span>CONNECTION_STABLE</div>
    </aside>
  );
}

function MobileCaseData({
  dossier,
  narratorLine,
  coordinateLocation,
  companions,
  recordingDate,
  open,
  onToggle,
  player,
  worldName,
}: {
  dossier: ScpDossierV1;
  narratorLine: string;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  recordingDate: string;
  open: boolean;
  onToggle: () => void;
  player: string;
  worldName: string;
}) {
  return (
    <div className="space-y-2 border border-[#333] bg-[#0f0f12] p-3 font-mono text-xs shadow-md lg:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[#444] bg-[#222]"><PixelNarrator style="scp" compact /><div className="absolute bottom-0 right-0 h-2 w-2 bg-[#00ffcc]" /></div>
          <div className="min-w-0"><div className="truncate text-[11px] font-bold leading-none text-white">Dr. Ark <span className="text-[9px] font-normal text-[#888]">(特異点観測官)</span></div><div className="mt-0.5 text-[9px] font-bold text-[#ff3e3e]">LV-{dossier.securityClearance} // ARK-994</div></div>
        </div>
        <div className="shrink-0 border border-[#ff3e3e] bg-[#1a0a0a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff3e3e]">{dossier.objectClass}</div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 border-t border-[#222] pt-1.5 text-[10px]">
        {coordinateLocation && <div className="flex items-center gap-1 border border-[#26262e] bg-[#141418] p-1.5 text-[#aaa]"><MapPin className="h-3 w-3 shrink-0 text-[#00ffcc]" /><span className="truncate">{coordinateLocation.x}, {coordinateLocation.y}, {coordinateLocation.z}</span></div>}
        {companions.length > 0 && <div className="flex items-center gap-1 border border-[#26262e] bg-[#141418] p-1.5 text-[#aaa]"><Users className="h-3 w-3 shrink-0 text-[#a855f7]" /><span className="truncate">{companions.length}同行者追跡中</span></div>}
      </div>

      <div className="border-l-2 border-[#ff3e3e] bg-[#141418] p-2 font-sans text-[11px] leading-snug text-[#bbb]"><span className="mb-0.5 block font-mono text-[9px] font-bold text-[#ff3e3e]">NPC_MEMO:</span>「{narratorLine}」</div>

      <button type="button" onClick={onToggle} className="flex w-full items-center justify-center gap-1 pt-1 text-[9px] text-[#666] transition-colors hover:text-[#aaa]">{open ? '診断テレメトリを閉じる' : '診断テレメトリ詳細を表示'}{open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</button>
      {open && <div className="grid grid-cols-2 gap-1 border-t border-[#222] pt-2 text-[9px] text-[#777]"><div>SECTOR: {worldName}</div><div>SUBJECT: {player}</div><div>DATE: {recordingDate}</div><div>STATUS: DECLASSIFIED</div></div>}
    </div>
  );
}

function DossierPaper({
  dossier,
  world,
  coordinateLocation,
  companions,
  evidencePhotos,
  activeCarouselIdx,
  setActiveCarouselIdx,
  indexOpen,
  setIndexOpen,
  declassifiedMode,
  setDeclassifiedMode,
  setSelectedPhoto,
}: {
  dossier: ScpDossierV1;
  world: WorldWithMembers;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  evidencePhotos: EvidenceView[];
  activeCarouselIdx: number;
  setActiveCarouselIdx: (index: number | ((current: number) => number)) => void;
  indexOpen: boolean;
  setIndexOpen: (open: boolean) => void;
  declassifiedMode: boolean;
  setDeclassifiedMode: (open: boolean) => void;
  setSelectedPhoto: (photo: EvidenceView | null) => void;
}) {
  const leadPhoto = evidencePhotos[0] ?? null;
  const secondaryPhotos = evidencePhotos.slice(1);
  const activeSecondary = secondaryPhotos[activeCarouselIdx] ?? secondaryPhotos[0] ?? null;

  return (
    <div className="relative w-full max-w-full overflow-hidden border border-[#333338] bg-[#0f0f12] font-sans antialiased text-[#d1d1d1] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333338] bg-[#141418] px-3 py-2 font-mono text-[10px] text-[#888] sm:px-4 sm:text-[11px]">
        <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 shrink-0 bg-[#ff3e3e]" /><span className="truncate font-bold uppercase tracking-wider text-[#ff3e3e]">TOP SECRET // SCP_DOSSIER</span><span className="hidden text-[#444] sm:inline">|</span><span className="hidden sm:inline">CASE: {dossier.caseId}</span></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => setDeclassifiedMode(!declassifiedMode)} className="flex items-center gap-1 border border-[#ff3e3e]/60 bg-[#1a0a0a] px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#ff3e3e] transition-colors hover:bg-[#2a1010] sm:text-[10px]">{declassifiedMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{declassifiedMode ? '機密解除中' : '黒塗り適用中'}</button><span className="hidden text-[9px] text-[#666] sm:inline">FORM SOCO-ARCH-08</span></div>
      </div>

      <div className="w-full max-w-full bg-[#f5f2ea] p-3.5 text-[#1c1917] sm:p-8 lg:p-10">
        <div className="mb-5 border-b-2 border-[#1c1917] pb-5 sm:mb-6 sm:pb-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#78716c]"><FileText className="h-3.5 w-3.5 shrink-0 text-[#b91c1c]" /><span className="truncate font-bold uppercase tracking-wider">SPECIAL ANOMALY OBSERVATION DOSSIER</span></div>
              <h1 className="break-words font-serif text-lg font-black leading-snug tracking-tight text-[#1c1917] sm:text-2xl lg:text-3xl">{dossier.title}</h1>
              <p className="font-mono text-[10px] text-[#78716c] sm:text-xs">CLEARANCE: LV-{dossier.securityClearance} // CLASSIFICATION: {dossier.objectClass}</p>
            </div>
            <div className="shrink-0 self-start rotate-[-2deg] border-2 border-[#b91c1c] bg-red-50/80 px-2.5 py-1 text-center font-mono uppercase text-[#b91c1c]"><div className="border-b border-[#b91c1c] pb-0.5 text-[10px] font-black tracking-wider">SOCO ARCHIVE</div><div className="pt-0.5 text-[9px] font-bold">CLASS: {dossier.objectClass}</div><div className="text-[8px] text-[#7f1d1d]">{dossier.itemNumber}</div></div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border border-[#d6cfc0] bg-[#ece6d8] p-2.5 font-mono text-[11px] sm:grid-cols-4">
            <div><span className="block text-[9px] text-[#78716c]">ITEM NUMBER</span><span className="font-bold text-[#1c1917]">{dossier.itemNumber}</span></div>
            <div><span className="block text-[9px] text-[#78716c]">OBJECT CLASS</span><span className="flex items-center gap-0.5 font-bold text-[#b91c1c]"><ShieldAlert className="h-3 w-3" />{dossier.objectClass}</span></div>
            <div><span className="block text-[9px] text-[#78716c]">PRIMARY SUBJECT</span><span className="block truncate font-bold text-[#1c1917]">{world.player || '記録者'}</span></div>
            <div><span className="block text-[9px] text-[#78716c]">TARGET SECTOR</span><span className="block truncate font-bold text-[#1c1917]">{world.name}</span></div>
            {coordinateLocation && <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5"><span className="flex items-center gap-1 text-[9px] text-[#78716c]"><MapPin className="h-3 w-3 text-[#b91c1c]" />OBSERVATION COORDINATES (XYZ)</span><span className="block truncate text-xs font-bold text-[#1c1917]">X:{coordinateLocation.x} / Y:{coordinateLocation.y} / Z:{coordinateLocation.z}</span></div>}
            {companions.length > 0 && <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5"><span className="text-[9px] text-[#78716c]">ASSOCIATED ENTITIES (D-CLASS)</span><span className="block truncate text-xs font-bold text-[#1c1917]">{companions.join(', ')}</span></div>}
          </div>
        </div>

        <div className="mb-5 flex items-start gap-2 border-l-4 border-[#dc2626] bg-[#fee2e2] p-3 text-xs text-[#991b1b]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" /><div className="text-[11px] leading-relaxed sm:text-[12px]"><span className="mr-1 font-mono font-bold uppercase">WARNING:</span>{dossier.warningNotice}</div></div>

        <section className="mb-6">
          <h3 className="mb-1.5 flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-[#b91c1c]"><span className="inline-block h-2 w-2 bg-[#b91c1c]" />特別収容プロトコル (SPECIAL CONTAINMENT PROCEDURES)</h3>
          <div className="border border-[#2a2a2e] bg-[#1a1a1c] p-3 font-serif text-xs leading-relaxed text-[#d1d1d1] shadow-inner sm:p-4 sm:text-sm">{declassifiedMode ? dossier.containmentProcedure : <span className="select-none bg-black px-2 text-black">████████████████████████████████████████</span>}</div>
        </section>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col items-start gap-4 sm:gap-6 md:flex-row">
            <div className="min-w-0 flex-1 space-y-2.5"><div className="flex items-center gap-2 border-b border-[#d6cfc0] pb-1"><span className="font-mono text-xs font-bold text-[#b91c1c]">§ 0.0</span><h2 className="text-sm font-bold text-[#1c1917] sm:text-base">調書要旨 (Executive Abstract)</h2></div><p className="text-justify text-[14px] leading-relaxed text-[#292524] sm:text-[15px]">{dossier.executiveSummary}</p><div className="pt-0.5 font-mono text-[11px] text-[#78716c]">調書作成官：特異点研究員 Dr.アーク</div></div>
            {leadPhoto ? <EvidenceCard photo={leadPhoto} lead onOpen={setSelectedPhoto} /> : <div className="w-full shrink-0 border border-dashed border-[#b91c1c]/40 bg-[#ebe5d6] p-3 text-center md:w-60"><Stamp className="mx-auto mb-1 h-5 w-5 text-[#b91c1c]/60" /><div className="font-mono text-[9px] font-bold uppercase text-[#b91c1c]">NO PHYSICAL EVIDENCE ATTACHED</div><p className="mt-0.5 text-[9px] text-[#78716c]">光学撮影データ未収容。ログ調書のみ保全。</p></div>}
          </div>
        </div>

        {secondaryPhotos.length > 0 && activeSecondary && (
          <div className="mb-6 border border-[#d6cfc0] bg-[#ebe5d6] p-3">
            <div className="mb-2 flex items-center justify-between font-mono text-[11px]"><span className="flex items-center gap-1 font-bold text-[#b91c1c]"><Paperclip className="h-3 w-3" />追加添付証拠写真 ({secondaryPhotos.length}件)</span><span className="text-[10px] text-[#78716c]">{activeCarouselIdx + 1} / {secondaryPhotos.length}</span></div>
            <div className="flex flex-col items-center gap-3 border border-[#d6cfc0] bg-white p-2 sm:flex-row"><div className="relative aspect-video w-full shrink-0 overflow-hidden bg-slate-900 sm:aspect-square sm:w-44"><img src={activeSecondary.url} alt={activeSecondary.title} className="h-full w-full object-cover" /><button type="button" onClick={() => setSelectedPhoto(activeSecondary)} className="absolute bottom-1 right-1 bg-black/80 p-1 text-white"><ZoomIn className="h-3 w-3" /></button></div><div className="w-full space-y-1 font-mono text-xs"><div className="text-[10px] font-bold text-[#b91c1c]">[{activeSecondary.code}]</div><div className="text-xs font-bold text-[#1c1917] sm:text-sm">{activeSecondary.title}</div><p className="font-sans text-[11px] leading-relaxed text-[#57534e]">{activeSecondary.caption}</p><div className="text-[9px] text-[#78716c]">撮影日時: {activeSecondary.timestamp}</div></div></div>
            {secondaryPhotos.length > 1 && <div className="mt-2 flex items-center justify-between border-t border-[#d6cfc0] pt-2"><div className="flex gap-1.5 overflow-x-auto">{secondaryPhotos.map((photo, index) => <button key={photo.id} type="button" onClick={() => setActiveCarouselIdx(index)} className={`h-7 w-10 overflow-hidden border ${activeCarouselIdx === index ? 'border-[#b91c1c] ring-1 ring-[#b91c1c]' : 'border-[#cfc6b4] opacity-70'}`}><img src={photo.url} alt="" className="h-full w-full object-cover" /></button>)}</div><div className="flex shrink-0 items-center gap-1"><button type="button" onClick={() => setActiveCarouselIdx((current) => (current - 1 + secondaryPhotos.length) % secondaryPhotos.length)} className="border border-[#d6cfc0] bg-white p-1 text-[#78716c] hover:text-[#b91c1c]"><ChevronLeft className="h-3.5 w-3.5" /></button><button type="button" onClick={() => setActiveCarouselIdx((current) => (current + 1) % secondaryPhotos.length)} className="border border-[#d6cfc0] bg-white p-1 text-[#78716c] hover:text-[#b91c1c]"><ChevronRight className="h-3.5 w-3.5" /></button></div></div>}
          </div>
        )}

        <div className="my-5 overflow-hidden border border-[#d6cfc0] bg-[#ebe5d6]"><button type="button" onClick={() => setIndexOpen(!indexOpen)} className="flex w-full items-center justify-between px-3 py-2 font-mono text-xs font-bold text-[#44403c] transition-colors hover:bg-[#e2dcce]"><div className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-[#b91c1c]" /><span>調書目次 (INDEX - {dossier.sections.length} SECTIONS)</span></div>{indexOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</button>{indexOpen && <div className="space-y-1.5 border-t border-[#d6cfc0] bg-[#f2eee4] px-3 py-2.5 font-mono text-xs">{dossier.sections.map((section) => <a key={section.id} href={`#${section.id}`} className="block truncate text-[#57534e] hover:text-[#b91c1c] hover:underline"><span className="mr-1.5 font-bold text-[#b91c1c]">{section.number}</span>{section.title}</a>)}</div>}</div>

        <div className="space-y-6 sm:space-y-8">
          {dossier.sections.map((section) => (
            <article key={section.id} id={section.id} className="relative border-t border-[#d6cfc0] pt-4 sm:pt-6">
              <div className="mb-2.5"><span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#b91c1c]">{section.number}</span><h3 className="text-base font-bold tracking-tight text-[#1c1917] sm:text-lg">{section.title}</h3>{section.subTitle && <p className="mt-0.5 font-mono text-[11px] text-[#78716c]">{section.subTitle}</p>}</div>
              <div className="space-y-2.5">
                {section.paragraphs.map((paragraph, index) => <p key={index} className="text-justify text-[14px] leading-relaxed text-[#292524] sm:text-[15px]">{paragraph}</p>)}
                {section.logEntries && section.logEntries.length > 0 && <div className="my-3.5 space-y-2 border-l-[3px] border-[#b91c1c] bg-[#0a0a0c] p-3 font-mono text-xs text-[#d1d1d1]"><div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#ff3e3e]"><span>[TRANSCRIPT LOG: EVENT STREAM]</span><span className="text-[9px] text-[#666]">AUDIO_VERIFIED</span></div>{section.logEntries.map((log, index) => <div key={index} className="space-y-0.5 border-t border-[#222] pt-1.5 first:border-0 first:pt-0"><div className="flex items-center gap-1 text-[9px] font-bold text-[#ff3e3e]"><Clock className="h-3 w-3 text-[#888]" /><span>{log.time}</span>{log.speaker && <span className="text-[#888]">/ {log.speaker}</span>}</div><div className="pl-3 text-[12px] leading-snug text-[#ccc] sm:text-[13px]">{log.text}</div></div>)}</div>}
                {section.callout && <div className="relative my-3.5 border border-[#cfc6b4] bg-[#f8f5ee] p-3"><div className="mb-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-[#b91c1c]">{section.callout.label}</div><p className="font-serif text-xs italic leading-relaxed text-[#44403c] sm:text-[13px]">{declassifiedMode || section.callout.type !== 'REDACTED' ? section.callout.text : <span className="select-none bg-black px-2 text-black">████████████████</span>}</p></div>}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t-2 border-[#1c1917] pt-5 font-mono text-xs text-[#78716c] sm:flex-row"><div><div className="font-bold text-[#1c1917]">ARCHIVAL VERIFICATION COMPLETED</div><div className="text-[9px]">特異点監視機関 SOCO 保管番号: {dossier.caseId}</div></div><div className="flex items-center gap-3"><div className="text-right"><div className="text-[9px] text-[#78716c]">SIGNATURE OF LEAD EXAMINER</div><div className="font-serif text-sm font-bold italic text-[#b91c1c] sm:text-base">Dr. Arc, Ph.D.</div></div><div className="flex h-10 w-10 rotate-12 items-center justify-center border-2 border-dashed border-[#b91c1c] text-[8px] font-bold text-[#b91c1c]">SEALED</div></div></div>
      </div>
    </div>
  );
}

function EvidenceCard({ photo, lead, onOpen }: { photo: EvidenceView; lead?: boolean; onOpen: (photo: EvidenceView) => void }) {
  return (
    <div className={`group relative w-full shrink-0 border border-[#d6cfc0] bg-white p-2 shadow-sm ${lead ? 'md:w-64' : 'md:w-60'}`}>
      <div className="absolute -top-2.5 left-3 flex items-center gap-1 bg-[#b91c1c] px-2 py-0.5 font-mono text-[9px] font-bold text-white"><Paperclip className="h-2.5 w-2.5" />{photo.code}</div>
      <div className="relative mt-1 aspect-video w-full overflow-hidden bg-slate-900 sm:aspect-[4/3]"><img src={photo.url} alt={photo.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /><button type="button" onClick={() => onOpen(photo)} className="absolute bottom-1 right-1 flex items-center gap-0.5 bg-black/80 p-1 text-[10px] text-white"><ZoomIn className="h-3 w-3" /></button></div>
      <div className="mt-1.5 space-y-0.5 font-mono text-[10px] text-[#44403c]"><div className="truncate font-bold text-[#1c1917]">{photo.title}</div><div className="text-[9px] text-[#78716c]">{photo.timestamp}</div></div>
    </div>
  );
}
