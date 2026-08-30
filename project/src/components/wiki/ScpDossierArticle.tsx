import { AlertTriangle, FileText, MapPin, ShieldAlert } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { NARRATORS, PixelNarrator } from '@/components/wiki/WikiNarrator';

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

function extractField(content: string, labels: string[]) {
  for (const label of labels) {
    const match = content.match(new RegExp(`${label}\\s*[:：]\\s*([^\\n]+)`, 'i'));
    if (match?.[1]) return match[1].replace(/\*\*/g, '').trim();
  }
  return null;
}

function extractArticleTitle(content: string, worldName: string) {
  const match = content.match(/^#\s+(.+)$/m);
  return match?.[1]?.replace(/\*\*/g, '').trim() || `『${worldName}』異常観測調書`;
}

function removeFirstHeading(content: string) {
  return content.replace(/^#\s+.+\n?/m, '').trim();
}

export function ScpDossierArticle({
  world,
  locations,
  content,
  mainPhotoUrl,
  narratorLine,
  locationLinks,
}: Props) {
  const narrator = NARRATORS.scp;
  const coordinateLocation = locations.find((location) => location.has_coordinates);
  const companions = world.members.map((member) => member.name).filter(Boolean);
  const itemNumber = extractField(content, ['項目番号', 'Item Number']) || `CASE-${world.id.slice(0, 8).toUpperCase()}`;
  const objectClass = extractField(content, ['オブジェクトクラス', 'Object Class']) || 'CLASSIFIED';
  const articleTitle = extractArticleTitle(content, world.name);
  const body = removeFirstHeading(content);

  return (
    <div className="scp-as-shell w-full overflow-hidden bg-[#0a0a0c] text-[#d1d1d1]">
      <div className="grid w-full grid-cols-1 lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="hidden border-r border-[#333] bg-[#0d0d0f] p-4 lg:flex lg:flex-col lg:gap-4">
          <div>
            <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-[#666]">Researcher ID</div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 border border-[#444] bg-[#111] p-0.5">
                <PixelNarrator style="scp" compact />
              </div>
              <div className="min-w-0 font-mono">
                <div className="text-sm font-bold text-white">Dr. Ark <span className="text-[9px] font-normal text-[#777]">(特異点観測官)</span></div>
                <div className="text-[9px] font-bold tracking-wider text-[#ff3e3e]">CLEARANCE: LEVEL 5</div>
                <div className="text-[9px] text-[#666]">ID: ARK-SW-05</div>
              </div>
            </div>
          </div>

          <div className="border-l-2 border-[#ff3e3e] bg-[#1a0a0a] py-2 pl-3">
            <div className="font-mono text-[9px] uppercase tracking-wider text-[#666]">Classification</div>
            <div className="break-words font-mono text-sm font-bold text-[#ff3e3e]">{objectClass}</div>
          </div>

          <div className="border border-[#333] bg-[#111] p-3 font-mono">
            <div className="mb-2 flex items-center justify-between text-[9px] uppercase text-[#666]">
              <span>Location Data</span>
              <span className={coordinateLocation ? 'text-[#00ffcc]' : 'text-[#777]'}>{coordinateLocation ? 'GPS_LOCKED' : 'SENSOR_OFFLINE'}</span>
            </div>
            {coordinateLocation ? (
              <div className="space-y-1.5 text-[10px] text-[#aaa]">
                <div className="flex justify-between gap-2"><span>X:</span><b className="text-[#ddd]">{coordinateLocation.x}</b></div>
                <div className="flex justify-between gap-2"><span>Y:</span><b className="text-[#ddd]">{coordinateLocation.y}</b></div>
                <div className="flex justify-between gap-2"><span>Z:</span><b className="text-[#ddd]">{coordinateLocation.z}</b></div>
              </div>
            ) : (
              <div className="text-[10px] italic text-[#777]">座標情報なし</div>
            )}
          </div>

          {companions.length > 0 && (
            <div className="border border-[#333] bg-[#111] p-3 font-mono">
              <div className="mb-2 flex items-center justify-between text-[9px] uppercase text-[#666]"><span>Accompanying</span><span>{companions.length} ENTITIES</span></div>
              <div className="space-y-1 text-[10px] text-[#aaa]">
                {companions.map((name, index) => (
                  <div key={`${name}-${index}`} className="flex justify-between gap-2"><span className="text-[#777]">&gt; D-{String(index + 104).padStart(3, '0')}:</span><b className="truncate text-[#ddd]">{name}</b></div>
                ))}
              </div>
            </div>
          )}

          <div className="relative border border-[#222] bg-[#111] p-3.5 text-[11px] italic leading-relaxed text-[#aaa]">
            <span className="absolute -top-2 left-2 bg-[#0d0d0f] px-2 font-mono text-[9px] font-bold tracking-wider text-[#666]">NPC_COMMENTS</span>
            <p className="mt-1">「{narratorLine || narrator.quote}」</p>
            <div className="mt-2 text-right font-mono text-[9px] text-[#ff3e3e]">— Dr. Ark / SPECIAL OBSERVATION UNIT</div>
          </div>
        </aside>

        <main className="min-w-0 bg-[#141416] p-3 sm:p-5 lg:p-7">
          <div className="mx-auto w-full max-w-[1180px] space-y-4">
            <div className="flex flex-col justify-between gap-2 border-b border-[#333] pb-2.5 font-mono sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-2 text-[10px] sm:text-xs">
                <span className="shrink-0 font-bold uppercase tracking-widest text-[#00ffcc]">SECURE_DOSSIER</span>
                <span className="text-[#444]">|</span>
                <span className="truncate text-[#888]">CASE: {itemNumber}</span>
              </div>
              <div className="text-[9px] font-bold text-[#ff3e3e] sm:text-[10px]">SCP調 (Dr.アーク) ★</div>
            </div>

            <div className="border-b border-[#333] pb-3">
              <div className="mb-1 font-mono text-[9px] uppercase tracking-[2px] text-[#00ffcc] sm:text-[10px]">CONFIDENTIAL_ANOMALY_RECORD</div>
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <h2 className="min-w-0 break-words text-xl font-bold tracking-tight text-white sm:text-2xl">案件番号：{itemNumber} [{world.name}]</h2>
                <div className="shrink-0 font-mono text-[9px] text-[#666]">ARCHIVE: <span className="font-bold text-[#d1d1d1]">SURVIVAL_WIKI</span></div>
              </div>
            </div>

            <div className="border border-[#333338] bg-[#0f0f12] shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#333338] bg-[#141418] px-3 py-2 font-mono text-[9px] text-[#888] sm:px-4 sm:text-[10px]">
                <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 bg-[#ff3e3e]"/><b className="tracking-wider text-[#ff3e3e]">TOP SECRET // SCP_DOSSIER</b></div>
                <span className="text-[#666]">FORM SW-ARCH-08</span>
              </div>

              <div className="bg-[#f5f2ea] p-4 text-[#1c1917] sm:p-7 lg:p-9">
                <div className="mb-5 border-b-2 border-[#1c1917] pb-5">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-[#78716c]"><FileText className="h-3.5 w-3.5 shrink-0 text-[#b91c1c]"/>SPECIAL ANOMALY OBSERVATION DOSSIER</div>
                      <h1 className="break-words font-serif text-xl font-black leading-snug text-[#1c1917] sm:text-2xl lg:text-3xl">{articleTitle}</h1>
                      <p className="mt-2 font-mono text-[9px] text-[#78716c] sm:text-[10px]">CLEARANCE: LV-5 // CLASSIFICATION: {objectClass}</p>
                    </div>
                    <div className="shrink-0 self-start rotate-[-2deg] border-2 border-[#b91c1c] bg-red-50/80 px-3 py-1 text-center font-mono uppercase text-[#b91c1c]">
                      <div className="border-b border-[#b91c1c] pb-0.5 text-[9px] font-black tracking-wider">SOCO ARCHIVE</div>
                      <div className="pt-0.5 text-[8px] font-bold">CLASS: {objectClass}</div>
                      <div className="text-[7px] text-[#7f1d1d]">{itemNumber}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 border border-[#d6cfc0] bg-[#ece6d8] p-2.5 font-mono text-[10px] sm:grid-cols-4">
                    <div><span className="block text-[8px] text-[#78716c]">ITEM NUMBER</span><b>{itemNumber}</b></div>
                    <div><span className="block text-[8px] text-[#78716c]">OBJECT CLASS</span><b className="flex items-center gap-1 text-[#b91c1c]"><ShieldAlert className="h-3 w-3"/>{objectClass}</b></div>
                    <div><span className="block text-[8px] text-[#78716c]">PRIMARY SUBJECT</span><b className="block truncate">{world.player || '記録者'}</b></div>
                    <div><span className="block text-[8px] text-[#78716c]">TARGET SECTOR</span><b className="block truncate">{world.name}</b></div>
                    {coordinateLocation && (
                      <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5">
                        <span className="flex items-center gap-1 text-[8px] text-[#78716c]"><MapPin className="h-3 w-3 text-[#b91c1c]"/>OBSERVATION COORDINATES (XYZ)</span>
                        <b className="block truncate text-[10px]">X:{coordinateLocation.x} / Y:{coordinateLocation.y} / Z:{coordinateLocation.z}</b>
                      </div>
                    )}
                    {companions.length > 0 && (
                      <div className="col-span-2 border border-[#cfc6b4] bg-[#e2dcce] p-1.5"><span className="block text-[8px] text-[#78716c]">ASSOCIATED ENTITIES</span><b className="block truncate text-[10px]">{companions.join(', ')}</b></div>
                    )}
                  </div>
                </div>

                <div className="mb-5 flex items-start gap-2 border-l-4 border-[#dc2626] bg-[#fee2e2] p-3 text-[#991b1b]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#dc2626]"/>
                  <div className="text-[10px] leading-relaxed sm:text-[11px]"><b className="mr-1 font-mono">WARNING:</b>本資料は最高機密の異常観測アーカイブとして保管されています。記録内容の取り扱いには注意してください。</div>
                </div>

                {mainPhotoUrl && (
                  <div className="mb-6 flex justify-end">
                    <figure className="relative w-full max-w-sm border border-[#d6cfc0] bg-white p-2 shadow-sm sm:w-72">
                      <div className="absolute -top-2.5 left-3 bg-[#b91c1c] px-2 py-0.5 font-mono text-[8px] font-bold text-white">EXHIBIT A-1</div>
                      <img src={mainPhotoUrl} alt="代表証拠写真" className="mt-1 aspect-video w-full border border-[#57534e] bg-black object-cover"/>
                    </figure>
                  </div>
                )}

                <div className="scp-as-markdown min-w-0 max-w-full">
                  <MarkdownRenderer content={body} locationLinks={locationLinks} className="font-sans" />
                </div>

                <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t-2 border-[#1c1917] pt-5 font-mono text-[9px] text-[#78716c] sm:flex-row sm:items-center">
                  <div><div className="font-bold text-[#1c1917]">ARCHIVAL VERIFICATION COMPLETED</div><div>Survival Wiki // {itemNumber}</div></div>
                  <div className="text-right"><div className="text-[8px]">SIGNATURE OF LEAD EXAMINER</div><div className="font-serif text-sm font-bold italic text-[#b91c1c]">Dr. Arc</div></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
