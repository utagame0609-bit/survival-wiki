import type { LocationWithPhotos } from '@/lib/types';
import { PixelNarrator } from '@/components/wiki/WikiNarrator';

type Props = {
  objectClass: string;
  narratorLine: string;
  coordinateLocation: LocationWithPhotos | null;
  companions: string[];
  recordingDate: string;
  embedded?: boolean;
};

export function ScpResearcherAside({
  objectClass,
  narratorLine,
  coordinateLocation,
  companions,
  recordingDate,
  embedded = false,
}: Props) {
  return (
    <aside className={`${embedded ? 'flex h-full' : 'hidden lg:flex'} flex-col space-y-4 border border-[#333] bg-[#0d0d0f] p-4 shadow-2xl`}>
      <div><div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[#666]">Researcher ID</div><div className="flex items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden border border-[#444] bg-[#222]"><PixelNarrator style="scp" compact /></div><div className="min-w-0 space-y-0.5 font-mono"><div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">Dr. Ark <span className="text-[9px] font-normal text-[#888]">(特異点観測官)</span></div><div className="text-[9px] font-bold tracking-wider text-[#ff3e3e]">CLEARANCE: LEVEL 5</div><div className="text-[9px] text-[#666]">ID: ARK-994-SOCO</div></div></div></div>
      <div className="border-l-2 border-[#ff3e3e] bg-[#1a0a0a] py-1.5 pl-3"><div className="font-mono text-[10px] uppercase tracking-wider text-[#666]">Classification</div><div className="break-words font-mono text-base font-bold tracking-tighter text-[#ff3e3e]">{objectClass}</div></div>
      <div className="space-y-1.5 border border-[#333] bg-[#111] p-3"><div className="flex items-center justify-between font-mono text-[10px] uppercase text-[#666]"><span>Location Data</span><span className={coordinateLocation ? 'text-[#00ffcc]' : 'text-[#777]'}>{coordinateLocation ? 'GPS_LOCKED' : 'SENSOR_OFFLINE'}</span></div>{coordinateLocation ? <div className="grid grid-cols-2 gap-y-1.5 font-mono text-[11px]"><span className="text-[#888]">X:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.x}</span><span className="text-[#888]">Y:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.y}</span><span className="text-[#888]">Z:</span><span className="text-right text-[#d1d1d1]">{coordinateLocation.z}</span><span className="text-[#888]">Timestamp:</span><span className="text-right text-[#d1d1d1]">{recordingDate}</span></div> : <div className="font-mono text-xs italic text-[#777]">None [Sensor Offline]</div>}</div>
      {companions.length > 0 && <div className="border border-[#333] bg-[#111] p-3"><div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase text-[#666]"><span>Accompanying</span><span className="text-[9px] text-[#888]">{companions.length} ENTITIES</span></div><div className="space-y-1 font-mono text-xs">{companions.map((name, index) => <div key={`${name}-${index}`} className="flex items-center justify-between text-[11px] text-[#aaa]"><span className="text-[#888]">&gt; D-{index + 104}:</span><span className="font-bold text-[#d1d1d1]">{name}</span></div>)}</div></div>}
      <div className="relative mt-2 border border-[#222] bg-[#111] p-3.5 text-[11px] italic leading-relaxed text-[#888]"><span className="absolute -top-2 left-2 bg-[#0d0d0f] px-2 font-mono text-[9px] font-bold tracking-wider text-[#666]">NPC_COMMENTS</span><p className="mt-1 font-sans text-[#aaa]">「{narratorLine}」</p><div className="mt-2 text-right font-mono text-[9px] text-[#ff3e3e]">— Dr. Ark / SPECIAL OBSERVATION UNIT</div></div>
      <div className="mt-auto border border-[#222] bg-[#111] p-2.5 text-center font-mono text-[10px] tracking-widest text-[#555]"><span className="mr-1.5 text-[#00ffcc]">●</span>CONNECTION_STABLE</div>
    </aside>
  );
}
