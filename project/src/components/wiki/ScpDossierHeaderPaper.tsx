import { AlertTriangle, Eye, EyeOff, FileText, MapPin, ShieldAlert } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import type { ScpDossierV1 } from '@/lib/wikiScp';

type Props = {
  dossier: ScpDossierV1;
  world: WorldWithMembers;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  declassifiedMode: boolean;
  setDeclassifiedMode: (open: boolean) => void;
};

export function ScpDossierHeaderPaper({ dossier, world, coordinateLocation, companions, declassifiedMode, setDeclassifiedMode }: Props) {
  return (
    <div className="h-full overflow-hidden border border-[#333338] bg-[#0f0f12] shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333338] bg-[#141418] px-3 py-2 font-mono text-[10px] text-[#888] sm:px-4 sm:text-[11px]"><div className="flex items-center gap-2"><span className="inline-block h-2 w-2 shrink-0 bg-[#ff3e3e]" /><span className="truncate font-bold uppercase tracking-wider text-[#ff3e3e]">TOP SECRET // SCP_DOSSIER</span><span className="hidden text-[#444] sm:inline">|</span><span className="hidden sm:inline">CASE: {dossier.caseId}</span></div><div className="flex items-center gap-2"><button type="button" onClick={() => setDeclassifiedMode(!declassifiedMode)} className="flex items-center gap-1 border border-[#ff3e3e]/60 bg-[#1a0a0a] px-2 py-0.5 font-mono text-[9px] font-bold tracking-wider text-[#ff3e3e] transition-colors hover:bg-[#2a1010] sm:text-[10px]">{declassifiedMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}{declassifiedMode ? '機密解除中' : '黒塗り適用中'}</button><span className="hidden text-[9px] text-[#666] sm:inline">FORM SOCO-ARCH-08</span></div></div>
      <div className="flex h-full flex-col bg-[#f5f2ea] p-3.5 text-[#1c1917] sm:p-6 lg:p-7">
        <div className="border-b-2 border-[#1c1917] pb-3"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="min-w-0 space-y-1"><div className="flex items-center gap-1.5 font-mono text-[11px] text-[#78716c]"><FileText className="h-3.5 w-3.5 shrink-0 text-[#b91c1c]" /><span className="truncate font-bold uppercase tracking-wider">SPECIAL ANOMALY OBSERVATION DOSSIER</span></div><h1 className="break-words font-serif text-base font-black leading-snug tracking-tight text-[#1c1917] sm:text-xl lg:text-2xl">{dossier.title}</h1><p className="font-mono text-[10px] text-[#78716c] sm:text-xs">CLEARANCE: LV-{dossier.securityClearance} // CLASSIFICATION: {dossier.objectClass}</p></div><div className="shrink-0 self-start rotate-[-2deg] border-2 border-[#b91c1c] bg-red-50/80 px-2.5 py-1 text-center font-mono uppercase text-[#b91c1c]"><div className="border-b border-[#b91c1c] pb-0.5 text-[10px] font-black tracking-wider">SOCO ARCHIVE</div><div className="pt-0.5 text-[9px] font-bold">CLASS: {dossier.objectClass}</div><div className="text-[8px] text-[#7f1d1d]">{dossier.itemNumber}</div></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2 border border-[#d6cfc0] bg-[#ece6d8] p-2 font-mono text-[10px] sm:grid-cols-4 sm:text-[11px]"><div><span className="block text-[9px] text-[#78716c]">ITEM NUMBER</span><span className="font-bold text-[#1c1917]">{dossier.itemNumber}</span></div><div><span className="block text-[9px] text-[#78716c]">OBJECT CLASS</span><span className="flex items-center gap-0.5 font-bold text-[#b91c1c]"><ShieldAlert className="h-3 w-3" />{dossier.objectClass}</span></div><div><span className="block text-[9px] text-[#78716c]">PRIMARY SUBJECT</span><span className="block truncate font-bold text-[#1c1917]">{world.player || '記録者'}</span></div><div><span className="block text-[9px] text-[#78716c]">TARGET SECTOR</span><span className="block truncate font-bold text-[#1c1917]">{world.name}</span></div>{coordinateLocation && <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5"><span className="flex items-center gap-1 text-[9px] text-[#78716c]"><MapPin className="h-3 w-3 text-[#b91c1c]" />OBSERVATION COORDINATES (XYZ)</span><span className="block truncate text-[11px] font-bold text-[#1c1917] sm:text-xs">X:{coordinateLocation.x} / Y:{coordinateLocation.y} / Z:{coordinateLocation.z}</span></div>}{companions.length > 0 && <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5"><span className="text-[9px] text-[#78716c]">ASSOCIATED ENTITIES (D-CLASS)</span><span className="block truncate text-[11px] font-bold text-[#1c1917] sm:text-xs">{companions.join(', ')}</span></div>}</div>
        </div>
        <div className="mt-3 flex items-start gap-2 border-l-4 border-[#dc2626] bg-[#fee2e2] p-2.5 text-xs text-[#991b1b] sm:p-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]" /><div className="text-[11px] leading-relaxed sm:text-[12px]"><span className="mr-1 font-mono font-bold uppercase">WARNING:</span>{dossier.warningNotice}</div></div>
      </div>
    </div>
  );
}
