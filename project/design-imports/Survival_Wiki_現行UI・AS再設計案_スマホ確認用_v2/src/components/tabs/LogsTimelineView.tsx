import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, MapPin, Star, ArrowUpDown, Sparkles, Filter, Camera, Users, ChevronRight } from 'lucide-react';
import { World, LogEntry } from '../../types';
import { sound } from '../../audio/soundEngine';

interface LogsTimelineViewProps {
  world: World;
  logs: LogEntry[];
  onOpenLog: (log: LogEntry) => void;
  onQuickLog: () => void;
}

export const LogsTimelineView: React.FC<LogsTimelineViewProps> = ({
  world,
  logs,
  onOpenLog,
  onQuickLog,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default newest first for mobile
  const [starredOnly, setStarredOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => l.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [logs]);

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        if (starredOnly && !log.starred) return false;
        if (selectedTag && (!log.tags || !log.tags.includes(selectedTag))) return false;
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          log.locationName.toLowerCase().includes(q) ||
          log.memo.toLowerCase().includes(q) ||
          log.area?.toLowerCase().includes(q) ||
          log.tags?.some((t) => t.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchQuery, sortOrder, starredOnly, selectedTag]);

  // Group by Day Number
  const groupedByDay = useMemo(() => {
    const map = new Map<number, LogEntry[]>();
    filteredLogs.forEach((log) => {
      const day = log.dayNumber || 1;
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(log);
    });
    return Array.from(map.entries()).sort((a, b) => (sortOrder === 'desc' ? b[0] - a[0] : a[0] - b[0]));
  }, [filteredLogs, sortOrder]);

  return (
    <div className="space-y-4 pb-24 font-sans">
      {/* Search & Quick Filter Toolbar */}
      <div className="bg-[#121214] border-2 border-[#333338] rounded-xl p-3 space-y-2.5 shadow-[4px_4px_0px_#000000]">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="日誌・場所・メモを検索..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0a0a0c] border border-[#333338] text-xs text-[#dcdcdc] placeholder-[#666666] focus:border-[#ff8c00] outline-none transition terminal-font"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white text-xs terminal-font"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Toggle */}
          <button
            type="button"
            onClick={() => {
              sound.playHover();
              setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
            }}
            className="px-2.5 py-2 rounded-lg bg-[#18181c] border border-[#333338] text-[#aaaaaa] hover:text-[#ff8c00] text-xs terminal-font flex items-center gap-1 shrink-0 cursor-pointer active:scale-95 transition shadow-[2px_2px_0px_#000000]"
            title="並び替え"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#ff8c00]" />
            <span className="hidden sm:inline">{sortOrder === 'desc' ? '新' : '旧'}</span>
          </button>

          {/* Star Filter */}
          <button
            type="button"
            onClick={() => {
              sound.playHover();
              setStarredOnly(!starredOnly);
            }}
            className={`p-2 rounded-lg border text-xs flex items-center justify-center shrink-0 cursor-pointer transition shadow-[2px_2px_0px_#000000] ${
              starredOnly
                ? 'bg-[#ff8c00]/20 border-[#ff8c00] text-[#ff8c00]'
                : 'bg-[#18181c] border-[#333338] text-[#666666] hover:text-[#aaaaaa]'
            }`}
            title="お気に入り"
          >
            <Star className={`w-4 h-4 ${starredOnly ? 'fill-[#ff8c00]' : ''}`} />
          </button>
        </div>

        {/* Tags horizontal scroll */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
            <button
              onClick={() => {
                sound.playHover();
                setSelectedTag(null);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] terminal-font shrink-0 transition cursor-pointer ${
                selectedTag === null
                  ? 'bg-[#ff8c00] text-black font-bold shadow-[2px_2px_0px_#000000]'
                  : 'bg-[#18181c] text-[#888888] hover:text-[#dcdcdc] border border-[#333338]'
              }`}
            >
              ALL ({logs.length})
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => {
                  sound.playHover();
                  setSelectedTag(selectedTag === t ? null : t);
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] terminal-font shrink-0 transition cursor-pointer ${
                  selectedTag === t
                    ? 'bg-[#ffa500] text-black font-bold shadow-[2px_2px_0px_#000000]'
                    : 'bg-[#18181c] text-[#888888] hover:text-[#ff8c00] border border-[#333338]'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {logs.length === 0 && (
        <div className="border-2 border-dashed border-[#333338] bg-[#121214] rounded-xl p-8 text-center space-y-4 shadow-[4px_4px_0px_#000000]">
          <div className="w-14 h-14 rounded-xl bg-[#ff8c00]/15 border-2 border-[#ff8c00] flex items-center justify-center mx-auto text-[#ff8c00] shadow-[2px_2px_0px_#000000]">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white terminal-font">まだ冒険日誌がありません</h3>
            <p className="text-xs text-[#888888] max-w-sm mx-auto leading-relaxed">
              下の「＋」ボタンから、今日訪れた場所・出来事・写真を1つの記録として残しましょう。
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              sound.playConfirm();
              onQuickLog();
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#ff8c00] hover:bg-[#ffa500] text-black font-black text-xs terminal-font shadow-[3px_3px_0px_#000000] active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>最初の冒険を記録する</span>
          </button>
        </div>
      )}

      {/* Filtered Empty State */}
      {logs.length > 0 && filteredLogs.length === 0 && (
        <div className="bg-[#121214] border border-[#333338] rounded-xl p-6 text-center text-[#888888] text-xs terminal-font shadow-[3px_3px_0px_#000000]">
          条件に一致する記録が見つかりませんでした。
        </div>
      )}

      {/* Timeline Stream */}
      {groupedByDay.map(([day, dayLogs]) => (
        <section key={day} className="space-y-3">
          {/* Day Header Marker */}
          <div className="flex items-center gap-2.5 sticky top-14 z-10 py-1 bg-[#0a0a0c]/90 backdrop-blur-md">
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[#141417] border-2 border-[#ff8c00] shadow-[2px_2px_0px_#000000]">
              <span className="w-2 h-2 rounded-full bg-[#00ff41] animate-pulse" />
              <span className="terminal-font font-black text-xs text-[#ff8c00]">
                DAY {String(day).padStart(2, '0')}
              </span>
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#ff8c00]/40 to-transparent" />
            <span className="text-[11px] terminal-font text-[#888888] font-bold">
              {dayLogs.length} EVENTS
            </span>
          </div>

          {/* Day Logs List */}
          <div className="space-y-3 pl-1 sm:pl-2">
            {dayLogs.map((log) => (
              <LogCard
                key={log.id}
                log={log}
                world={world}
                onClick={() => {
                  sound.playConfirm();
                  onOpenLog(log);
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

interface LogCardProps {
  log: LogEntry;
  world: World;
  onClick: () => void;
}

const LogCard: React.FC<LogCardProps> = ({ log, world, onClick }) => {
  const firstPhoto = log.photos && log.photos.length > 0 ? log.photos[0] : null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => sound.playHover()}
      className="group relative bg-[#121214] hover:bg-[#16161a] border-2 border-[#333338] hover:border-[#ff8c00] rounded-xl p-4 transition-all duration-150 shadow-[3px_3px_0px_#000000] hover:shadow-[4px_4px_0px_#ff8c00] cursor-pointer overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row gap-3.5">
        {/* Thumbnail Preview if photo exists */}
        {firstPhoto && (
          <div className="sm:w-32 sm:h-24 w-full h-36 rounded-lg overflow-hidden bg-black shrink-0 relative border-2 border-[#333338]">
            <img
              src={firstPhoto.url}
              alt={log.locationName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {log.photos.length > 1 && (
              <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] terminal-font text-white font-bold flex items-center gap-0.5 border border-[#333338]">
                <Camera className="w-3 h-3 text-[#ff8c00]" />+{log.photos.length - 1}
              </span>
            )}
          </div>
        )}

        {/* Text & Meta Information */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Location & Coordinates */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ff8c00] shrink-0" />
                <h4 className="text-sm sm:text-base font-bold text-white group-hover:text-[#ff8c00] transition truncate terminal-font">
                  {log.locationName}
                </h4>
                {log.starred && <Star className="w-3.5 h-3.5 text-[#ff8c00] fill-[#ff8c00] shrink-0" />}
              </div>
              <p className="text-[11px] terminal-font text-[#888888]">{log.timestamp}</p>
            </div>

            {/* Coordinates / Area badge */}
            {log.coordinates ? (
              <span className="px-2 py-0.5 rounded bg-[#0a0a0c] border border-[#333338] text-[11px] terminal-font text-[#00ff41] font-bold shrink-0">
                X:{log.coordinates.x} Z:{log.coordinates.z}
              </span>
            ) : log.area ? (
              <span className="px-2 py-0.5 rounded bg-[#0a0a0c] border border-[#333338] text-[11px] terminal-font text-[#ff8c00] font-bold shrink-0 truncate max-w-[120px]">
                {log.area}
              </span>
            ) : null}
          </div>

          {/* Memo Preview */}
          <p className="text-xs sm:text-sm text-[#dcdcdc] line-clamp-2 leading-relaxed font-sans">
            {log.memo}
          </p>

          {/* Tags & Footer Details */}
          <div className="flex items-center justify-between pt-1 text-[11px] terminal-font text-[#888888]">
            <div className="flex flex-wrap items-center gap-1">
              {log.tags?.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded bg-[#0a0a0c] border border-[#333338] text-[10px] text-[#ff8c00]"
                >
                  #{t}
                </span>
              ))}
              {log.tags && log.tags.length > 3 && (
                <span className="text-[10px] text-[#666666]">+{log.tags.length - 3}</span>
              )}
            </div>

            <span className="text-[#ff8c00] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-bold text-xs">
              OPEN <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
