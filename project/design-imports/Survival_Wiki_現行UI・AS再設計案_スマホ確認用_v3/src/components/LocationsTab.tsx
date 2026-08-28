import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUpDown, Package, Sparkles, MapPin } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { LocationCard } from './LocationCard';
import { playAddSound, playHoverSound, playConfirmSound } from '../lib/soundEngine';
import { useViewMode } from '../context/ViewModeContext';

interface LocationsTabProps {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onOpenCreate: () => void;
  onOpenChest: () => void;
  onSelectLocation: (loc: LocationWithPhotos) => void;
  onOpenSns: (loc: LocationWithPhotos) => void;
}

export function LocationsTab({
  world,
  locations,
  onOpenCreate,
  onOpenChest,
  onSelectLocation,
  onOpenSns,
}: LocationsTabProps) {
  const { isMobile } = useViewMode();
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

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* Search & Action Controls Bar */}
      <div className="bg-[#141824] border border-slate-800 p-2.5 sm:p-3 rounded-xs space-y-2.5">
        {/* Top: Search Input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="拠点名・タグ・メモで検索..."
            className="w-full min-h-[40px] pl-9 pr-4 py-1.5 bg-[#0f121b] border border-slate-700 text-white text-xs sm:text-sm placeholder-slate-500 focus:border-amber-400 outline-none transition-colors rounded-xs"
          />
        </div>

        {/* Bottom Row: Actions (Sort, Chest, New Record) */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Left: Sort Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">並び替え:</span>
            </span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="min-h-[36px] bg-[#0f121b] border border-slate-700 text-slate-200 text-xs px-2 py-1 outline-none font-mono cursor-pointer rounded-xs"
            >
              <option value="newest">新しい順 (NEWEST)</option>
              <option value="oldest">古い順 (OLDEST)</option>
              <option value="checkpoint">チェックポイント優先</option>
            </select>
          </div>

          {/* Right: Chest & Create Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onOpenChest();
              }}
              onMouseEnter={playHoverSound}
              title="すべての写真を見る"
              className="min-h-[36px] px-3 py-1.5 border border-amber-500/70 bg-[#161a25] text-amber-300 hover:border-amber-400 font-mono text-xs font-bold flex items-center gap-1.5 active:scale-95 cursor-pointer rounded-xs"
            >
              <Package className="w-3.5 h-3.5 text-amber-400" />
              <span>CHEST ({totalPhotos})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playAddSound();
                onOpenCreate();
              }}
              onMouseEnter={playHoverSound}
              className="min-h-[36px] px-3.5 sm:px-4 py-1.5 bg-amber-500 text-black font-black text-xs font-mono border-b-2 border-amber-700 hover:bg-amber-400 active:translate-y-0.5 shadow-md flex items-center gap-1.5 cursor-pointer rounded-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>新規記録</span>
            </button>
          </div>
        </div>

        {/* Tags Filter Pill List */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={`px-2 py-0.5 text-[10px] font-mono font-bold shrink-0 transition-colors rounded-xs ${
                selectedTag === null
                  ? 'bg-amber-500 text-black'
                  : 'bg-[#0f121b] text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              ALL ({locations.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2 py-0.5 text-[10px] font-mono shrink-0 transition-colors rounded-xs ${
                  selectedTag === tag
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-[#0f121b] text-slate-300 border border-slate-700 hover:border-amber-500'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Locations Grid */}
      {filtered.length === 0 ? (
        <div className="border-2 border-slate-800 bg-[#141824] p-8 text-center space-y-3 rounded-xs">
          <div className="w-12 h-12 border border-slate-700 bg-[#0e121a] flex items-center justify-center mx-auto text-slate-400">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">記録が見つかりません</h3>
          <p className="text-xs text-slate-400">
            条件を変更するか、右上の「+ 新規記録」ボタンから座標や冒険を記録しましょう。
          </p>
        </div>
      ) : (
        <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {filtered.map((loc) => (
            <LocationCard
              key={loc.id}
              world={world}
              location={loc}
              onClick={() => onSelectLocation(loc)}
              onOpenSns={() => onOpenSns(loc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
