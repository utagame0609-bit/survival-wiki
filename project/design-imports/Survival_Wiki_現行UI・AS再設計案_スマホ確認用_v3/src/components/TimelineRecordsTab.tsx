import React, { useState } from 'react';
import { Search, ArrowUpDown, Package, Plus, MapPin, Shield, Youtube, Share2, ChevronRight, Users, Clock } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { playConfirmSound, playHoverSound, playAddSound } from '../lib/soundEngine';

interface TimelineRecordsTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onOpenCreate: () => void;
  onOpenChest: () => void;
  onSelectLocation: (loc: LocationWithPhotos) => void;
  onOpenSns: (loc: LocationWithPhotos) => void;
}

export function TimelineRecordsTab({
  world,
  locations,
  onOpenCreate,
  onOpenChest,
  onSelectLocation,
  onOpenSns,
}: TimelineRecordsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'checkpoint'>('newest');

  // Count total photos
  const totalPhotos = locations.reduce((sum, loc) => sum + loc.photos.length, 0);

  // Extract all unique tags
  const allTags = Array.from(new Set(locations.flatMap((l) => l.tags)));

  // Filter & sort
  const filtered = locations
    .filter((loc) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.detail_memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTag = !selectedTag || loc.tags.includes(selectedTag);

      return matchSearch && matchTag;
    })
    .sort((a, b) => {
      if (sortOrder === 'checkpoint') {
        return (b.is_checkpoint ? 1 : 0) - (a.is_checkpoint ? 1 : 0);
      }
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  // Group filtered items by Date (YYYY-MM-DD) for timeline view
  const groupedByDay: { date: string; displayDate: string; items: LocationWithPhotos[] }[] = [];
  const mapByDate = new Map<string, LocationWithPhotos[]>();

  // If sorted newest first, maintain order in groups
  filtered.forEach((loc) => {
    const dateKey = loc.created_at.split('T')[0];
    if (!mapByDate.has(dateKey)) {
      mapByDate.set(dateKey, []);
    }
    mapByDate.get(dateKey)!.push(loc);
  });

  // Convert map to array with day numbers
  const sortedDates = Array.from(mapByDate.keys()).sort((a, b) => {
    return sortOrder === 'oldest' ? a.localeCompare(b) : b.localeCompare(a);
  });

  sortedDates.forEach((key, index) => {
    const items = mapByDate.get(key) || [];
    const dateObj = new Date(items[0]?.created_at || key);
    const displayDate = dateObj.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
    
    // Calculate Day index relative to first world creation or earliest date
    const dayLabel = `DAY ${String(index + 1).padStart(2, '0')}`;

    groupedByDay.push({
      date: key,
      displayDate: `${dayLabel} // ${displayDate}`,
      items,
    });
  });

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Search & Action Controls Bar */}
      <div className="bg-[#141824] border-2 border-slate-800 p-2.5 sm:p-3 rounded-xs space-y-2.5 shadow-md">
        {/* Top: Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="拠点名・タグ・メモで検索..."
            className="w-full min-h-[42px] pl-9 pr-4 py-2 bg-[#0f121b] border-2 border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:border-amber-400 outline-none transition-colors rounded-xs"
          />
        </div>

        {/* Action Controls: Sort Selector & CHEST button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Sort Selector */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xs:inline">並び順:</span>
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="min-h-[38px] bg-[#0f121b] border-2 border-slate-700 text-slate-200 text-xs px-2.5 py-1 outline-none font-mono cursor-pointer rounded-xs"
            >
              <option value="newest">新しい順 (NEWEST)</option>
              <option value="oldest">古い順 (OLDEST)</option>
              <option value="checkpoint">チェックポイント優先</option>
            </select>
          </div>

          {/* Right: CHEST Button & Total Count */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onOpenChest();
              }}
              onMouseEnter={playHoverSound}
              title="すべての写真ギャラリーを見る"
              className="min-h-[38px] px-3 py-1.5 border-2 border-amber-500/80 bg-[#161a25] text-amber-300 hover:border-amber-400 font-mono text-xs font-black flex items-center gap-1.5 active:scale-95 cursor-pointer rounded-xs shadow-sm"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>CHEST ({totalPhotos})</span>
            </button>
          </div>
        </div>

        {/* Tags Filter Pill List */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`min-h-[28px] px-2.5 py-0.5 text-[10px] sm:text-xs font-mono font-bold shrink-0 transition-colors rounded-xs cursor-pointer border ${
                selectedTag === null
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-[#0f121b] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              ALL ({locations.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`min-h-[28px] px-2.5 py-0.5 text-[10px] sm:text-xs font-mono shrink-0 transition-colors rounded-xs cursor-pointer border ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-black border-amber-400 font-bold'
                    : 'bg-[#0f121b] text-slate-300 border-slate-700 hover:border-amber-500'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Timeline Stream */}
      {groupedByDay.length === 0 ? (
        <div className="border-2 border-slate-800 bg-[#0f1424] p-8 text-center space-y-3 rounded-xs shadow-md">
          <div className="w-12 h-12 border-2 border-slate-700 bg-[#0c101c] flex items-center justify-center mx-auto text-slate-400 rounded-xs">
            <MapPin className="w-6 h-6 text-amber-400/80" />
          </div>
          <h3 className="text-sm font-bold text-white font-mono">記録が見つかりません</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            条件を変更するか、右下の「＋ 記録を追加」ボタンから現在地や冒険の記録を追加してください。
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6 pt-1">
          {groupedByDay.map((group) => (
            <div key={group.date} className="relative pl-4 sm:pl-6 border-l-2 border-amber-500/60 space-y-2.5">
              {/* Day Header Marker with Glowing Retro Dot */}
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-amber-500 border-2 border-black flex items-center justify-center shadow-[0_0_10px_#f59e0b]" />

              <div className="inline-flex items-center gap-2 bg-[#10141f] border-2 border-amber-500/50 px-3 py-1 font-mono text-xs font-bold text-amber-300 rounded-xs shadow-sm">
                <span>{group.displayDate}</span>
                <span className="text-[10px] text-amber-400/80 bg-amber-500/20 px-1.5 py-0.2 rounded-xs">
                  {group.items.length}件の記録
                </span>
              </div>

              {/* Day's Records Card Grid / List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {group.items.map((loc) => {
                  const timeStr = new Date(loc.created_at).toLocaleTimeString('ja-JP', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const primaryPhoto = loc.photos[0]?.storage_path;
                  const memberNames = loc.member_ids
                    .map((id) => world.members.find((m) => m.id === id)?.name)
                    .filter(Boolean) as string[];

                  return (
                    <div
                      key={loc.id}
                      onClick={() => {
                        playConfirmSound();
                        onSelectLocation(loc);
                      }}
                      onMouseEnter={playHoverSound}
                      className="group border-2 border-slate-700/90 bg-[#161a25] hover:border-amber-400 transition-all p-2.5 sm:p-3 flex items-start gap-3 cursor-pointer rounded-xs shadow-[0_3px_12px_rgba(0,0,0,0.3)] relative overflow-hidden"
                    >
                      {/* Left: Square Thumbnail */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-black border-2 border-slate-800 group-hover:border-amber-500/60 overflow-hidden rounded-xs relative">
                        {primaryPhoto ? (
                          <img
                            src={primaryPhoto}
                            alt={loc.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1017] text-slate-500 font-mono text-[9px]">
                            <MapPin className="w-5 h-5 text-amber-500/60 mb-0.5" />
                            <span>NO PIC</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Content Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        {/* Top Line: Time + Badges */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {timeStr}
                            </span>
                            {loc.is_checkpoint && (
                              <span className="px-1.5 py-0.2 bg-amber-500/25 text-amber-300 border border-amber-400 text-[9px] font-mono font-black rounded-xs flex items-center gap-0.5 shadow-xs">
                                <Shield className="w-2.5 h-2.5" />
                                CP
                              </span>
                            )}
                            {loc.youtube_url && (
                              <span className="px-1 py-0.2 bg-red-600/90 text-white text-[9px] font-mono font-bold rounded-xs flex items-center gap-0.5">
                                <Youtube className="w-2.5 h-2.5" />
                                VIDEO
                              </span>
                            )}
                          </div>

                          {/* Quick 𝕏 Share Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playHoverSound();
                              onOpenSns(loc);
                            }}
                            onMouseEnter={playHoverSound}
                            title="X (Twitter) ポストを作成"
                            className="p-1 text-cyan-400 hover:text-white bg-cyan-950/40 hover:bg-cyan-600 border border-cyan-500/40 rounded-xs transition-all active:scale-95 cursor-pointer"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate">
                          {loc.name}
                        </h4>

                        {/* Coordinates */}
                        <div className="font-mono text-[11px] font-bold text-emerald-400">
                          X:{loc.x} Y:{loc.y} Z:{loc.z}
                        </div>

                        {/* Memo preview snippet */}
                        {loc.detail_memo ? (
                          <p className="text-[11px] text-slate-300 line-clamp-1 font-sans">
                            {loc.detail_memo}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 italic font-mono">
                            （メモ未入力）
                          </p>
                        )}

                        {/* Companions tag pills */}
                        {memberNames.length > 0 && (
                          <div className="flex items-center gap-1 pt-0.5 overflow-hidden">
                            <Users className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                            {memberNames.map((name, i) => (
                              <span
                                key={i}
                                className="px-1 py-0.2 bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[8px] font-mono font-bold rounded-xs truncate max-w-[60px]"
                              >
                                @{name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Chevron arrow */}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 self-center transition-colors hidden xs:block" />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
