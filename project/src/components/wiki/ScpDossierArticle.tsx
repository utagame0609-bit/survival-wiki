import { useMemo, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS } from '@/components/wiki/WikiNarrator';
import { ScpResearcherAside } from '@/components/wiki/ScpResearcherAside';
import { ScpMobileCaseData } from '@/components/wiki/ScpMobileCaseData';
import { ScpDossierHeaderPaper } from '@/components/wiki/ScpDossierHeaderPaper';
import { ScpDossierBodyPaper } from '@/components/wiki/ScpDossierBodyPaper';
import { formatScpTimestamp, useScpEvidencePhotos, type ScpEvidenceView } from '@/components/wiki/useScpEvidencePhotos';
import { parseStoredScpDossier } from '@/lib/wikiScp';

type LocationLink = { name: string; onClick: () => void };
type Props = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  content: string;
  mainPhotoUrl: string | null;
  narratorLine: string;
  locationLinks: LocationLink[];
};

function firstCoordinateLocation(locations: LocationWithPhotos[]) {
  return locations.find((location) => location.has_coordinates) ?? null;
}
function oldestRecordingDate(locations: LocationWithPhotos[]) {
  const values = locations.map((location) => location.created_at).filter(Boolean).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  return values[0] ? formatScpTimestamp(values[0]) : 'DATE_UNVERIFIED';
}

export function ScpDossierArticle({ world, locations, content, mainPhotoUrl, narratorLine, locationLinks }: Props) {
  const dossier = useMemo(() => parseStoredScpDossier(content), [content]);
  const narrator = NARRATORS.scp;
  const coordinateLocation = firstCoordinateLocation(locations);
  const companions = world.members.map((member) => member.name).filter(Boolean);
  const [caseDataOpen, setCaseDataOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [declassifiedMode, setDeclassifiedMode] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ScpEvidenceView | null>(null);
  const { evidencePhotos, activeCarouselIdx, setActiveCarouselIdx } = useScpEvidencePhotos(locations);
  const relatedLocationLinks = useMemo<LocationLink[]>(() => locationLinks.map((link) => {
    const evidencePhoto = evidencePhotos.find((photo) => photo.title === link.name);
    if (!evidencePhoto) return link;
    return {
      ...link,
      onClick: () => setSelectedPhoto(evidencePhoto),
    };
  }), [locationLinks, evidencePhotos]);

  if (!dossier) {
    return (
      <div className="scp-as-shell grid w-full grid-cols-1 overflow-hidden bg-[#0a0a0c] text-[#d1d1d1] lg:grid-cols-[288px_minmax(0,1fr)]">
        <ScpResearcherAside objectClass="CLASSIFIED" narratorLine={narratorLine || narrator.quote} coordinateLocation={coordinateLocation} companions={companions} recordingDate={oldestRecordingDate(locations)} />
        <main className="min-w-0 bg-[#141416] p-3 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <div className="border-b border-[#333] pb-3 font-mono text-[10px] text-[#888]">LEGACY_SCP_RECORD // RESET AND RE-COMPILE TO UPGRADE DOSSIER</div>
            <div className="border border-[#333338] bg-[#0f0f12] shadow-2xl">
              <div className="border-b border-[#333338] bg-[#141418] px-4 py-2 font-mono text-[10px] font-bold tracking-wider text-[#ff3e3e]">TOP SECRET // LEGACY SCP DOSSIER</div>
              <div className="bg-[#f5f2ea] p-4 text-[#1c1917] sm:p-8">
                {mainPhotoUrl && <figure className="float-none mb-5 ml-auto w-full max-w-sm border border-[#d6cfc0] bg-white p-2 shadow-sm sm:w-72"><img src={mainPhotoUrl} alt="代表証拠写真" className="aspect-video w-full border border-[#57534e] object-cover" /></figure>}
                <MarkdownRenderer content={content} locationLinks={locationLinks} className="font-sans" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const commonHeader = (
    <div className="flex flex-col justify-between gap-2 border-b border-[#333] pb-2.5 font-mono text-xs sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-2 overflow-x-auto text-[10px] sm:text-xs"><span className="shrink-0 font-bold uppercase tracking-widest text-[#00ffcc]">SECURE_DOSSIER</span><span className="text-[#444]">|</span><span className="truncate text-[#888]">CASE: {dossier.caseId}</span></div>
      <div className="flex shrink-0 items-center gap-1 overflow-x-auto py-0.5"><span className="whitespace-nowrap border border-[#333] bg-[#1a1a1c] px-2 py-0.5 text-[9px] text-[#666] sm:text-[10px]">百科事典 (Hernan)</span><span className="whitespace-nowrap border border-[#ff3e3e] bg-[#1a0a0a] px-2 py-0.5 text-[9px] font-bold text-[#ff3e3e] shadow-[0_0_8px_rgba(255,62,62,0.2)] sm:text-[10px]">SCP調 (Dr.アーク) ★</span><span className="whitespace-nowrap border border-[#333] bg-[#1a1a1c] px-2 py-0.5 text-[9px] text-[#666] sm:text-[10px]">古代伝承 (Gildas)</span></div>
    </div>
  );

  const bodyPaperProps = {
    dossier, evidencePhotos, activeCarouselIdx, setActiveCarouselIdx,
    indexOpen, setIndexOpen, declassifiedMode, setSelectedPhoto,
  };

  const headerPaper = (
    <ScpDossierHeaderPaper
      dossier={dossier}
      world={world}
      coordinateLocation={coordinateLocation}
      companions={companions}
      declassifiedMode={declassifiedMode}
      setDeclassifiedMode={setDeclassifiedMode}
    />
  );

  return (
    <div className="scp-as-shell w-full overflow-hidden bg-[#0a0a0c] text-[#d1d1d1]">
      <div className="bg-[#141416] p-3 sm:p-6 lg:p-8">
        <div className="mx-auto w-full max-w-[96rem] space-y-4 sm:space-y-5">
          {commonHeader}

          <div className="lg:hidden">
            <ScpMobileCaseData dossier={dossier} narratorLine={narratorLine || narrator.quote} coordinateLocation={coordinateLocation} companions={companions} recordingDate={oldestRecordingDate(locations)} open={caseDataOpen} onToggle={() => setCaseDataOpen((current) => !current)} player={world.player || '記録者'} worldName={world.name} />
            <div className="mt-4">{headerPaper}</div>
            <div className="mt-4"><ScpDossierBodyPaper {...bodyPaperProps} /></div>
          </div>

          <div className="hidden space-y-5 lg:block">
            <div className="grid w-full grid-cols-12 items-stretch gap-5">
              <div className="col-span-4 flex flex-col xl:col-span-3">
                <ScpResearcherAside objectClass={dossier.objectClass} narratorLine={narratorLine || narrator.quote} coordinateLocation={coordinateLocation} companions={companions} recordingDate={oldestRecordingDate(locations)} embedded />
              </div>
              <div className="col-span-8 xl:col-span-9">{headerPaper}</div>
            </div>
            <ScpDossierBodyPaper {...bodyPaperProps} />
          </div>

          {relatedLocationLinks.length > 0 && (
            <div className="border border-[#333] bg-[#0f0f12] p-3 font-mono">
              <div className="mb-2 text-[10px] font-bold tracking-wider text-[#00ffcc]">RELATED_RECORDS // SOURCE LOCATIONS</div>
              <div className="flex flex-wrap gap-1.5">{relatedLocationLinks.map((location) => <button key={location.name} type="button" onClick={location.onClick} className="border border-[#333] bg-[#16161a] px-2 py-1 text-[10px] text-[#aaa] transition-colors hover:border-[#00ffcc]/60 hover:text-[#00ffcc]">&gt; {location.name}</button>)}</div>
            </div>
          )}
        </div>
      </div>

      {selectedPhoto && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="w-full max-w-2xl border-2 border-[#ff3e3e] bg-[#111114] p-3 font-mono text-xs text-slate-100 shadow-2xl sm:p-4" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-[#333] pb-2"><span className="flex min-w-0 items-center gap-1.5 truncate font-bold text-[#ff3e3e]"><ShieldAlert className="h-4 w-4 shrink-0" />EXHIBIT FORENSIC VIEWER // {selectedPhoto.code}</span><button type="button" onClick={() => setSelectedPhoto(null)} className="shrink-0 border border-[#444] bg-[#222] px-2 py-0.5 text-[#aaa] hover:text-white">[ CLOSE ]</button></div>
            <div className="flex max-h-[60vh] items-center justify-center overflow-hidden border border-[#333] bg-black"><img src={selectedPhoto.url} alt={selectedPhoto.title} className="max-h-[60vh] w-auto object-contain" /></div>
            <div className="mt-2.5 space-y-1"><div className="text-sm font-bold text-white">{selectedPhoto.title}</div><p className="font-sans text-xs text-[#aaa]">{selectedPhoto.caption}</p><div className="pt-0.5 text-[9px] text-[#666]">撮影日時: {selectedPhoto.timestamp}</div></div>
          </div>
        </div>
      )}
    </div>
  );
}
