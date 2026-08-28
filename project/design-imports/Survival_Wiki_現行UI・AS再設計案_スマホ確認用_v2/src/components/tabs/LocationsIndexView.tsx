import React, { useState, useMemo } from 'react';
import { MapPin, Search, Navigation, Compass, Layers, ChevronRight, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { World, LogEntry } from '../../types';
import { sound } from '../../audio/soundEngine';

interface LocationsIndexViewProps {
  world: World;
  logs: LogEntry[];
  onOpenLog: (log: LogEntry) => void;
  onQuickLogWithLocation: (locationName: string, coordinates?: { x: number; y: number; z: number }, area?: string) => void;
}

export const LocationsIndexView: React.FC<LocationsIndexViewProps> = ({
  world,
  logs,
  onOpenLog,
  onQuickLogWithLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null);

  // Group logs by Location Name
  const locationGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        coordinates?: { x: number; y: number; z: number };
        area?: string;
        logs: LogEntry[];
        latestLog: LogEntry;
        photoCount: number;
        firstVisited: string;
        lastVisited: string;
      }
    >();

    logs.forEach((log) => {
      const locKey = log.locationName.trim();
      if (!map.has(locKey)) {
        map.set(locKey, {
          name: locKey,
          coordinates: log.coordinates,
          area: log.area,
          logs: [],
          latestLog: log,
          photoCount: 0,
          firstVisited: log.timestamp,
          lastVisited: log.timestamp,
        });
      }

      const group = map.get(locKey)!;
      group.logs.push(log);
      group.photoCount += log.photos ? log.photos.length : 0;
      if (!group.coordinates && log.coordinates) group.coordinates = log.coordinates;
      if (!group.area && log.area) group.area = log.area;

      // Track latest
      if (new Date(log.createdAt).getTime() > new Date(group.latestLog.createdAt).getTime()) {
        group.latestLog = log;
        group.lastVisited = log.timestamp;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.logs.length - a.logs.length);
  }, [logs]);

  const filteredLocations = useMemo(() => {
    if (!searchQuery.trim()) return locationGroups;
    const q = searchQuery.toLowerCase();
    return locationGroups.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.area?.toLowerCase().includes(q) ||
        (loc.coordinates && `x:${loc.coordinates.x} z:${loc.coordinates.z}`.includes(q))
    );
  }, [locationGroups, searchQuery]);

  return (
    <div className="space-y-4 pb-24 font-sans">
      {/* Concept Header Card */}
      <div className="bg-[#121214] border-2 border-[#333338] rounded-xl p-4 shadow-[4px_4px_0px_#000000] space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#ff8c00] animate-spin-slow" />
            <h3 className="text-sm font-black text-white terminal-font tracking-wider">
              LOCATION INDEX // 探索地点・拠点索引
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded bg-[#ff8c00]/20 text-[#ff8c00] terminal-font text-[10px] font-bold border border-[#ff8c00]">
            {locationGroups.length} LOCATIONS
          </span>
        </div>
        <p className="text-xs text-[#aaaaaa] leading-relaxed font-sans">
          これまでに記録された全地点のコンパス索引です。地点をタップすると、その場所で起きたすべての記録ログを即座に振り返ることができます。
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="地点名・エリア・座標で索引を検索..."
          className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#0a0a0c] border-2 border-[#333338] text-xs text-[#dcdcdc] placeholder-[#666666] focus:border-[#ff8c00] outline-none transition terminal-font shadow-[2px_2px_0px_#000000]"
        />
      </div>

      {/* Empty State */}
      {locationGroups.length === 0 && (
        <div className="border-2 border-dashed border-[#333338] bg-[#121214] rounded-xl p-8 text-center text-[#888888] text-xs terminal-font space-y-2 shadow-[3px_3px_0px_#000000]">
          <Navigation className="w-8 h-8 mx-auto text-[#666666] mb-2" />
          <p className="font-bold text-white">登録された地点がありません</p>
          <p>日誌に記録をつけると、自動的にこの地点インデックスが作成されます。</p>
        </div>
      )}

      {/* Locations Index List */}
      <div className="space-y-3">
        {filteredLocations.map((loc) => {
          const isExpanded = expandedLocation === loc.name;
          const samplePhoto = loc.logs.find((l) => l.photos?.length > 0)?.photos[0];

          return (
            <div
              key={loc.name}
              className={`rounded-xl border-2 transition-all duration-150 overflow-hidden shadow-[3px_3px_0px_#000000] ${
                isExpanded
                  ? 'bg-[#18181c] border-[#ff8c00]'
                  : 'bg-[#121214] hover:bg-[#16161a] border-[#333338] hover:border-[#ff8c00]'
              }`}
            >
              {/* Location Main Row */}
              <div
                onClick={() => {
                  sound.playHover();
                  setExpandedLocation(isExpanded ? null : loc.name);
                }}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Pin or Photo Icon */}
                  <div className="w-10 h-10 rounded-lg bg-[#0a0a0c] border-2 border-[#333338] flex items-center justify-center shrink-0 overflow-hidden shadow-[2px_2px_0px_#000000]">
                    {samplePhoto ? (
                      <img src={samplePhoto.url} alt={loc.name} className="w-full h-full object-cover" />
                    ) : (
                      <MapPin className="w-5 h-5 text-[#ff8c00]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-bold text-white truncate terminal-font">
                        {loc.name}
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-[#0a0a0c] border border-[#333338] text-[10px] terminal-font text-[#ff8c00] shrink-0">
                        {loc.logs.length} RECORDS
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] terminal-font text-[#888888] mt-0.5">
                      {loc.coordinates ? (
                        <span className="text-[#00ff41] font-bold">
                          X:{loc.coordinates.x} Y:{loc.coordinates.y} Z:{loc.coordinates.z}
                        </span>
                      ) : loc.area ? (
                        <span className="text-[#ff8c00] font-bold">{loc.area}</span>
                      ) : (
                        <span>位置未指定</span>
                      )}
                      <span>•</span>
                      <span>最終: {loc.lastVisited}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-7 h-7 rounded-lg bg-[#0a0a0c] border border-[#333338] flex items-center justify-center transition-transform ${
                      isExpanded ? 'rotate-90 text-[#ff8c00]' : 'text-[#888888]'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Expanded History Logs for this Location */}
              {isExpanded && (
                <div className="px-3.5 pb-4 pt-2 border-t border-[#333338] bg-[#0a0a0c]/80 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] terminal-font text-[#888888] pt-1">
                    <span>この地点の冒険ログ ({loc.logs.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.playConfirm();
                        onQuickLogWithLocation(loc.name, loc.coordinates, loc.area);
                      }}
                      className="text-[#ff8c00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" /> この地点で新記録
                    </button>
                  </div>

                  <div className="space-y-2">
                    {loc.logs.map((log) => (
                      <div
                        key={log.id}
                        onClick={() => {
                          sound.playConfirm();
                          onOpenLog(log);
                        }}
                        className="p-2.5 rounded-lg bg-[#121214] hover:bg-[#18181c] border border-[#333338] hover:border-[#ff8c00] transition cursor-pointer flex items-center justify-between gap-3 text-xs shadow-[2px_2px_0px_#000000]"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="px-1.5 py-0.5 rounded bg-[#ff8c00]/20 text-[#ff8c00] terminal-font font-bold text-[10px]">
                              DAY {String(log.dayNumber).padStart(2, '0')}
                            </span>
                            <span className="text-[#888888] text-[11px] terminal-font">{log.timestamp}</span>
                          </div>
                          <p className="text-[#dcdcdc] line-clamp-1 text-xs">{log.memo}</p>
                        </div>

                        {log.photos && log.photos.length > 0 && (
                          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#333338] bg-black">
                            <img src={log.photos[0].url} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
