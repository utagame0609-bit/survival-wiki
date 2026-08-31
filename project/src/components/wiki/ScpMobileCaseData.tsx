import { ChevronDown, ChevronUp, MapPin, Users } from 'lucide-react';
import type { LocationWithPhotos } from '@/lib/types';
import { PixelNarrator } from '@/components/wiki/WikiNarrator';
import type { ScpDossierV1 } from '@/lib/wikiScp';

type Props = {
  dossier: ScpDossierV1;
  narratorLine: string;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  recordingDate: string;
  open: boolean;
  onToggle: () => void;
  player: string;
  worldName: string;
};

export function ScpMobileCaseData({ dossier, narratorLine, coordinateLocation, companions, recordingDate, open, onToggle, player, worldName }: Props) {
  return (
    <div className="space-y-2 border border-[#333] bg-[#0f0f12] p-3 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between gap-2"><div className="flex min-w-0 items-center gap-2"><div className="relative h-8 w-8 shrink-0 overflow-hidden border border-[#444] bg-[#222]"><PixelNarrator style="scp" compact /><div className="absolute bottom-0 right-0 h-2 w-2 bg-[#00ffcc]" /></div><div className="min-w-0"><div className="truncate text-[11px] font-bold leading-none text-white">Dr. Ark <span className="text-[9px] font-normal text-[#888]">(特異点観測官)</span></div><div className="mt-0.5 text-[9px] font-bold text-[#ff3e3e]">LV-{dossier.securityClearance} // ARK-994</div></div></div><div className="shrink-0 border border-[#ff3e3e] bg-[#1a0a0a] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#ff3e3e]">{dossier.objectClass}</div></div>
      <div className="grid grid-cols-2 gap-1.5 border-t border-[#222] pt-1.5 text-[10px]">{coordinateLocation && <div className="flex items-center gap-1 border border-[#26262e] bg-[#141418] p-1.5 text-[#aaa]"><MapPin className="h-3 w-3 shrink-0 text-[#00ffcc]" /><span className="truncate">{coordinateLocation.x}, {coordinateLocation.y}, {coordinateLocation.z}</span></div>}{companions.length > 0 && <div className="flex items-center gap-1 border border-[#26262e] bg-[#141418] p-1.5 text-[#aaa]"><Users className="h-3 w-3 shrink-0 text-[#a855f7]" /><span className="truncate">{companions.length}同行者追跡中</span></div>}</div>
      <div className="border-l-2 border-[#ff3e3e] bg-[#141418] p-2 font-sans text-[11px] leading-snug text-[#bbb]"><span className="mb-0.5 block font-mono text-[9px] font-bold text-[#ff3e3e]">NPC_MEMO:</span>「{narratorLine}」</div>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-center gap-1 pt-1 text-[9px] text-[#666] transition-colors hover:text-[#aaa]">{open ? '診断テレメトリを閉じる' : '診断テレメトリ詳細を表示'}{open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}</button>
      {open && <div className="grid grid-cols-2 gap-1 border-t border-[#222] pt-2 text-[9px] text-[#777]"><div>SECTOR: {worldName}</div><div>SUBJECT: {player}</div><div>DATE: {recordingDate}</div><div>STATUS: DECLASSIFIED</div></div>}
    </div>
  );
}
