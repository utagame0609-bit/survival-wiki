import React, { useState, useMemo } from 'react';
import { MapPin, Compass, Copy, Check, ExternalLink, Tag, Navigation } from 'lucide-react';
import { World, AdventureRecord } from '../../types';
import { playConfirmSound, playHoverSound } from '../../audio/soundEngine';

interface AtlasViewProps {
  world: World;
  records: AdventureRecord[];
  onOpenRecord: (record: AdventureRecord) => void;
}

export const AtlasView: React.FC<AtlasViewProps> = ({
  world,
  records,
  onOpenRecord,
}) => {
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [copiedLocation, setCopiedLocation] = useState<string | null>(null);

  // Extract unique locations and group records
  const locationGroups = useMemo(() => {
    const map = new Map<string, AdventureRecord[]>();
    records.forEach((r) => {
      const list = map.get(r.locationName) || [];
      list.push(r);
      map.set(r.locationName, list);
    });

    return Array.from(map.entries()).map(([name, recs]) => {
      const latest = recs[0];
      const tags = Array.from(new Set(recs.map((r) => r.areaTag).filter(Boolean)));
      return {
        name,
        count: recs.length,
        records: recs,
        coords: latest.coords,
        tags,
        firstDay: Math.min(...recs.map((r) => r.dayNumber)),
        lastDay: Math.max(...recs.map((r) => r.dayNumber)),
      };
    });
  }, [records]);

  // Extract unique area tags
  const areaTags = useMemo(() => {
    const tags = new Set<string>();
    records.forEach((r) => {
      if (r.areaTag) tags.add(r.areaTag);
    });
    return Array.from(tags);
  }, [records]);

  const filteredLocations = useMemo(() => {
    if (selectedTag === 'all') return locationGroups;
    return locationGroups.filter((loc) => loc.tags.includes(selectedTag));
  }, [locationGroups, selectedTag]);

  const handleCopy = (locName: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    playConfirmSound();
    setCopiedLocation(locName);
    setTimeout(() => setCopiedLocation(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Atlas Header Summary */}
      <div className="bg-[#141414] border border-[#262626] p-4 rounded-sm shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#E5E5E5] flex items-center gap-2">
              <span>地点索引＆空間座標 (ATLAS INDEX)</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                全 {locationGroups.length} 地点
              </span>
            </h3>
            <p className="text-xs text-[#737373] font-mono mt-0.5">
              冒険中に到達した全観測地点・エリアタグ・座標データの統合インデックス
            </p>
          </div>
        </div>
      </div>

      {/* Area Tag Chips Cloud */}
      {areaTags.length > 0 && (
        <div className="bg-[#111111] border border-[#262626] p-3 rounded-sm">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#A3A3A3] mb-2">
            <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>エリアタグで絞り込み:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                setSelectedTag('all');
              }}
              className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors cursor-pointer ${
                selectedTag === 'all'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                  : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:text-[#E5E5E5]'
              }`}
            >
              全エリア ({locationGroups.length})
            </button>
            {areaTags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  playConfirmSound();
                  setSelectedTag(selectedTag === t ? 'all' : t);
                }}
                className={`px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors cursor-pointer ${
                  selectedTag === t
                    ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                    : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:text-[#E5E5E5]'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Locations Table / Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {filteredLocations.map((loc) => {
          const coordsStr = loc.coords
            ? `X:${loc.coords.x ?? 0} Y:${loc.coords.y ?? 0} Z:${loc.coords.z ?? 0}`
            : '座標データなし';

          return (
            <div
              key={loc.name}
              className="bg-[#141414] border border-[#262626] hover:border-[#D4AF37]/70 p-3.5 sm:p-4 rounded-sm transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <h4 className="font-bold text-sm sm:text-base text-[#E5E5E5]">
                      {loc.name}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-[#1F1F1F] text-[#A3A3A3] border border-[#2A2A2A] rounded-sm shrink-0">
                    {loc.count} 回記録
                  </span>
                </div>

                {loc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2.5">
                    {loc.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 text-[10px] font-mono bg-[#1C1C1C] text-[#D4AF37] border border-[#2A2A2A] rounded-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coordinates with 1-click copy */}
                <div className="flex items-center justify-between gap-2 p-2 bg-[#0A0A0A] border border-[#262626] rounded-sm text-xs font-mono mb-3">
                  <span className="text-[#D4AF37] font-medium truncate">
                    {coordsStr}
                  </span>
                  {loc.coords && (
                    <button
                      type="button"
                      onClick={() => handleCopy(loc.name, coordsStr)}
                      className="flex items-center gap-1 text-[10px] text-[#A3A3A3] hover:text-[#D4AF37] shrink-0 cursor-pointer"
                      title="座標をコピー"
                    >
                      {copiedLocation === loc.name ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-[#D4AF37]" />
                      )}
                      <span>{copiedLocation === loc.name ? '済' : 'コピー'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Associated records footer list */}
              <div className="border-t border-[#262626] pt-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[#737373] text-[11px]">
                  DAY {String(loc.firstDay).padStart(2, '0')}
                  {loc.lastDay !== loc.firstDay && ` 〜 DAY ${String(loc.lastDay).padStart(2, '0')}`}
                </span>

                <button
                  type="button"
                  onClick={() => onOpenRecord(loc.records[0])}
                  onMouseEnter={playHoverSound}
                  className="flex items-center gap-1 text-[#D4AF37] hover:text-[#E5C158] font-bold text-[11px] cursor-pointer"
                >
                  <span>日誌を開く</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
