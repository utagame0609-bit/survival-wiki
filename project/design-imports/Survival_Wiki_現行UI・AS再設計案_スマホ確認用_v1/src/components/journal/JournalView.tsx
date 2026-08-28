import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Camera,
  Tag,
  Sparkles,
  ArrowUpDown,
  Trophy,
  Copy,
  Check,
  Eye,
} from 'lucide-react';
import { World, AdventureRecord } from '../../types';
import {
  playCardOpenSound,
  playConfirmSound,
  playHoverSound,
  playMilestoneSound,
} from '../../audio/soundEngine';

interface JournalViewProps {
  world: World;
  records: AdventureRecord[];
  onOpenRecord: (record: AdventureRecord) => void;
  onCreateRecord: (day?: number) => void;
  onEditRecord: (record: AdventureRecord) => void;
  onDeleteRecord: (record: AdventureRecord) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  world,
  records,
  onOpenRecord,
  onCreateRecord,
  onEditRecord,
  onDeleteRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // Newest first by default
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.locationName.toLowerCase().includes(q);
        const matchMemo = r.memo.toLowerCase().includes(q);
        const matchTag = r.areaTag?.toLowerCase().includes(q);
        if (!matchName && !matchMemo && !matchTag) return false;
      }
      // Member filter
      if (selectedMemberId !== 'all') {
        if (!r.memberIds?.includes(selectedMemberId)) return false;
      }
      // Category filter
      if (selectedCategory !== 'all') {
        if (r.category !== selectedCategory) return false;
      }
      return true;
    });
  }, [records, searchQuery, selectedMemberId, selectedCategory]);

  // Group by Day number
  const dayGroups = useMemo(() => {
    const map = new Map<number, AdventureRecord[]>();
    filteredRecords.forEach((r) => {
      const group = map.get(r.dayNumber) || [];
      group.push(r);
      map.set(r.dayNumber, group);
    });

    const entries = Array.from(map.entries()).map(([day, recs]) => ({
      day,
      records: recs.sort((a, b) =>
        sortOrder === 'desc'
          ? new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
          : new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      ),
      dateStr: recs[0]?.recordedAt?.split(' ')[0] || '',
    }));

    return entries.sort((a, b) => (sortOrder === 'desc' ? b.day - a.day : a.day - b.day));
  }, [filteredRecords, sortOrder]);

  const toggleDay = (day: number) => {
    playCardOpenSound();
    setExpandedDays((prev) => ({
      ...prev,
      [day]: prev[day] === undefined ? false : !prev[day], // Default is open
    }));
  };

  const isDayExpanded = (day: number) => {
    return expandedDays[day] !== false; // Default true (expanded)
  };

  const handleCopyCoords = (record: AdventureRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!record.coords) return;
    const text = `X:${record.coords.x ?? 0} Y:${record.coords.y ?? 0} Z:${record.coords.z ?? 0}`;
    navigator.clipboard.writeText(text).catch(() => {});
    playConfirmSound();
    setCopiedId(record.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maxDay = records.reduce((max, r) => Math.max(max, r.dayNumber), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search & Filter Toolbar (Mobile-first compact toolbar) */}
      <div className="bg-[#141414] border border-[#262626] p-3 sm:p-4 rounded-sm space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="場所・メモ・タグを検索..."
              className="w-full pl-9 pr-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] text-xs sm:text-sm text-[#E5E5E5] placeholder-[#737373] rounded-sm focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] hover:border-[#D4AF37] text-[#A3A3A3] text-xs font-mono font-medium rounded-sm shrink-0 transition-colors cursor-pointer"
            title="並び替え"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="hidden xs:inline">{sortOrder === 'desc' ? '新しい順' : '古い順'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              onCreateRecord(maxDay);
            }}
            onMouseEnter={playHoverSound}
            className="flex items-center gap-1 px-3 sm:px-4 py-2 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono font-bold text-xs sm:text-sm border-b-2 border-[#A68824] active:border-b-0 active:translate-y-0.5 rounded-sm shrink-0 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ 記録</span>
          </button>
        </div>

        {/* Member & Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
          <span className="text-[#737373] text-[11px] mr-1">絞り込み:</span>

          {/* Member chips */}
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              setSelectedMemberId('all');
            }}
            className={`px-2 py-0.5 rounded-sm border text-[11px] transition-colors cursor-pointer ${
              selectedMemberId === 'all'
                ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold'
                : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:text-[#E5E5E5]'
            }`}
          >
            全員
          </button>
          {world.members.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playConfirmSound();
                setSelectedMemberId(selectedMemberId === m.id ? 'all' : m.id);
              }}
              className={`px-2 py-0.5 rounded-sm border text-[11px] transition-colors cursor-pointer ${
                selectedMemberId === m.id
                  ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                  : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:text-[#E5E5E5]'
              }`}
            >
              @{m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stream of Day Groups */}
      {dayGroups.length === 0 ? (
        <div className="border border-dashed border-[#262626] bg-[#141414]/70 p-8 sm:p-12 text-center rounded-sm">
          <MapPin className="w-10 h-10 text-[#737373] mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-[#E5E5E5] mb-1">
            {records.length === 0 ? 'まだ冒険日誌がありません' : '検索条件に一致する記録がありません'}
          </h3>
          <p className="text-xs text-[#737373] mb-5">
            {records.length === 0
              ? '「+ 記録」から最初の地点・体験・メモを登録してください。'
              : '検索ワードや絞り込み条件を変更してください。'}
          </p>
          {records.length === 0 && (
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onCreateRecord(1);
              }}
              onMouseEnter={playHoverSound}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono font-bold text-xs border-b-2 border-[#A68824] rounded-sm cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>最初の体験を記録する</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {dayGroups.map((group) => {
            const isExpanded = isDayExpanded(group.day);
            const isMilestone = group.day % 5 === 0 || group.day === 1;

            return (
              <div
                key={group.day}
                className="border border-[#262626] bg-[#141414] rounded-sm overflow-hidden shadow-md"
              >
                {/* Day Header Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleDay(group.day)}
                  onMouseEnter={playHoverSound}
                  className="w-full px-3.5 sm:px-4 py-2.5 bg-[#0F0F0F] hover:bg-[#1A1A1A] border-b border-[#222222] flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-mono font-bold border rounded-sm ${
                        isMilestone
                          ? 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/50 shadow-[0_0_8px_rgba(212,175,55,0.2)]'
                          : 'bg-[#1F1F1F] text-[#E5E5E5] border-[#2A2A2A]'
                      }`}
                    >
                      DAY {String(group.day).padStart(2, '0')}
                    </span>

                    <span className="text-xs sm:text-sm font-mono font-bold text-[#E5E5E5] truncate">
                      {group.dateStr || `第${group.day}日目の記録`}
                    </span>

                    <span className="text-[10px] font-mono text-[#D4AF37] font-medium hidden sm:inline">
                      ({group.records.length} 記録地点)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#737373]">
                    {isMilestone && (
                      <span className="hidden md:flex items-center gap-1 text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 border border-[#D4AF37]/30 rounded-sm">
                        <Trophy className="w-3 h-3 text-[#D4AF37]" />
                        <span>MILESTONE</span>
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#A3A3A3]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#A3A3A3]" />
                    )}
                  </div>
                </button>

                {/* Day Records Cards List */}
                {isExpanded && (
                  <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                    {group.records.map((record) => (
                      <div
                        key={record.id}
                        onClick={() => {
                          playCardOpenSound();
                          onOpenRecord(record);
                        }}
                        className="group relative bg-[#181818] hover:bg-[#1F1F1F] border border-[#262626] hover:border-[#D4AF37]/60 p-3.5 sm:p-4 rounded-sm transition-all duration-150 cursor-pointer shadow-sm"
                      >
                        {/* Record Top Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-[#242424] text-[#D4AF37] border border-[#333333] rounded-sm uppercase">
                              {record.category}
                            </span>
                            <span className="text-[11px] font-mono text-[#737373] flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#737373]" />
                              <span>{record.recordedAt.slice(-5)}</span>
                            </span>
                          </div>

                          {/* Coordinates Chip */}
                          {record.coords && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyCoords(record, e)}
                              className="flex items-center gap-1 px-2 py-0.5 bg-[#0A0A0A] border border-[#D4AF37]/30 text-[#D4AF37] hover:border-[#D4AF37] text-[10px] font-mono font-medium rounded-sm transition-colors cursor-pointer"
                              title="座標をコピー"
                            >
                              {copiedId === record.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3 text-[#D4AF37]" />
                              )}
                              <span>
                                X:{record.coords.x ?? 0} Y:{record.coords.y ?? 0} Z:{record.coords.z ?? 0}
                              </span>
                            </button>
                          )}
                        </div>

                        {/* Location Name & Area */}
                        <div className="mb-2">
                          <h4 className="text-sm sm:text-base font-bold text-[#E5E5E5] group-hover:text-[#D4AF37] transition-colors flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <span>{record.locationName}</span>
                          </h4>
                          {record.areaTag && (
                            <span className="text-[11px] font-mono text-[#737373] ml-5.5">
                              #{record.areaTag}
                            </span>
                          )}
                        </div>

                        {/* Narrative Memo */}
                        <p className="text-xs sm:text-sm text-[#A3A3A3] font-sans leading-relaxed line-clamp-3 mb-3">
                          {record.memo}
                        </p>

                        {/* Photos thumbnails preview */}
                        {record.photos && record.photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1 mb-3">
                            {record.photos.map((photo) => (
                              <div
                                key={photo.id}
                                className="relative w-20 h-16 sm:w-24 sm:h-18 shrink-0 rounded-sm overflow-hidden border border-[#2A2A2A] group-hover:border-[#D4AF37]/40 bg-black"
                              >
                                <img
                                  src={photo.url}
                                  alt={photo.caption || 'photo'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                {photo.caption && (
                                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] text-[#A3A3A3] font-mono px-1 truncate">
                                    {photo.caption}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Bottom Bar: Members and View CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#262626] text-[11px] font-mono text-[#737373]">
                          <div className="flex items-center gap-1">
                            {record.memberIds && record.memberIds.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-[#D4AF37]" />
                                {record.memberIds.map((id) => (
                                  <span key={id} className="text-[#A3A3A3]">
                                    @{world.members.find((m) => m.id === id)?.name || id}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span>単独記録</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-[#D4AF37] font-semibold group-hover:translate-x-0.5 transition-transform">
                            <Eye className="w-3.5 h-3.5" />
                            <span>詳細を見る</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
