import React, { useState, useMemo } from 'react';
import { LocationRecord } from '../../types';
import { Search, ArrowUpDown, Box, Plus, Clock, Users, MapPin, Image as ImageIcon } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface RecordsTimelineViewProps {
  records: LocationRecord[];
  onSelectRecord: (record: LocationRecord) => void;
  onOpenChest: () => void;
  onAddRecord: () => void;
}

export const RecordsTimelineView: React.FC<RecordsTimelineViewProps> = ({
  records,
  onSelectRecord,
  onOpenChest,
  onAddRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Count total photos across all records
  const totalPhotosCount = useMemo(() => {
    return records.reduce((sum, r) => sum + (r.photos?.length || (r.photoUrl ? 1 : 0)), 0);
  }, [records]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = records.filter((rec) => {
      if (!q) return true;
      return (
        rec.title.toLowerCase().includes(q) ||
        rec.memo.toLowerCase().includes(q) ||
        rec.companions.some((c) => c.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [records, searchQuery, sortOrder]);

  // Group records by Date (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const groups: { dateStr: string; dayNumber: number; records: LocationRecord[] }[] = [];
    filteredRecords.forEach((rec) => {
      const dateStr = rec.createdAt.split('T')[0];
      let group = groups.find((g) => g.dateStr === dateStr);
      if (!group) {
        group = { dateStr, dayNumber: rec.dayNumber, records: [] };
        groups.push(group);
      }
      group.records.push(rec);
    });
    return groups;
  }, [filteredRecords]);

  return (
    <div className="w-full pb-20 md:pb-6">
      {/* Controls Bar: Search, Sort Order, CHEST Photo Gallery Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#0F172A]/70 p-3 rounded-lg border border-[#1E293B]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="タイトル・メモ・同行者で探索記録を検索..."
            className="w-full pl-9 pr-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#F59E0B] rounded text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
          />
        </div>

        {/* Sort & CHEST buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Sort Order Toggle */}
          <button
            id="btn-sort-records"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_cursor');
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest');
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161F30] hover:bg-[#1E293B] border border-[#334155] rounded text-xs font-game text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            title="並び順を切り替え"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{sortOrder === 'newest' ? '新しい順' : '古い順'}</span>
          </button>

          {/* CHEST Photo Gallery Trigger with Badge */}
          <button
            id="btn-open-chest"
            type="button"
            onClick={() => {
              soundEngine.playSe('chest_open');
              onOpenChest();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#161F30] hover:bg-[#1E293B] border border-[#F59E0B]/60 hover:border-[#F59E0B] rounded text-xs font-game text-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.15)] transition-all active:scale-95"
            title="CHEST 写真宝箱を開く"
          >
            <Box className="w-4 h-4 text-[#F59E0B]" />
            <span>CHEST</span>
            <span className="ml-0.5 px-1.5 py-0.2 bg-[#F59E0B]/20 text-[#F59E0B] rounded text-[10px] font-mono font-bold">
              {totalPhotosCount}枚
            </span>
          </button>
        </div>
      </div>

      {/* Date-Grouped Timeline List */}
      {groupedByDate.length > 0 ? (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.dateStr} className="space-y-3">
              {/* Date Group Banner */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#161F30] px-3 py-1 rounded border border-[#334155]/60 shadow-sm">
                  <span className="text-xs font-mono font-bold text-[#F59E0B]">
                    DAY {String(group.dayNumber).padStart(2, '0')}
                  </span>
                  <span className="text-[#334155] text-xs">//</span>
                  <span className="text-xs font-mono text-[#94A3B8]">
                    {group.dateStr}
                  </span>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1E293B] to-transparent" />
                <span className="text-[11px] font-mono text-[#64748B]">
                  {group.records.length} RECORDS
                </span>
              </div>

              {/* Records Grid for this Date Group */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {group.records.map((rec) => {
                  const timeStr = rec.createdAt.includes('T')
                    ? rec.createdAt.split('T')[1].substring(0, 5)
                    : rec.createdAt.split(' ')[1] || '12:00';

                  return (
                    <div
                      key={rec.id}
                      id={`record-card-${rec.id}`}
                      onClick={() => {
                        soundEngine.playSe('menu_select');
                        onSelectRecord(rec);
                      }}
                      className="group relative bg-[#0F172A]/80 hover:bg-[#131E35] border border-[#1E293B] hover:border-[#F59E0B]/60 rounded-lg p-3 sm:p-3.5 cursor-pointer transition-all duration-200 shadow-md flex items-start gap-3.5"
                    >
                      {/* Photo Thumbnail or Placeholder */}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded bg-[#0B1018] shrink-0 overflow-hidden border border-[#334155] relative">
                        {rec.photoUrl ? (
                          <img
                            src={rec.photoUrl}
                            alt={rec.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#64748B]">
                            <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                            <span className="text-[9px] font-mono mt-1">NO PIC</span>
                          </div>
                        )}

                        {/* Multi-photo indicator if more than 1 */}
                        {rec.photos && rec.photos.length > 1 && (
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-[#0B1018]/80 text-[#06B6D4] text-[9px] font-mono rounded border border-[#06B6D4]/40">
                            +{rec.photos.length}
                          </span>
                        )}
                      </div>

                      {/* Record Content Info (Clean hierarchy: Time + Title + 1-line memo + Companions) */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                        <div>
                          {/* Time & Companions bar */}
                          <div className="flex items-center justify-between text-[11px] font-mono text-[#64748B] mb-1">
                            <span className="flex items-center gap-1 text-[#06B6D4]">
                              <Clock className="w-3 h-3" />
                              {timeStr}
                            </span>

                            {/* Coordinates badge preview only if entered */}
                            {rec.hasExplicitCoordinates && rec.coordinates && (
                              <span className="text-[10px] font-mono text-[#94A3B8]/80 flex items-center gap-0.5">
                                <MapPin className="w-2.5 h-2.5 text-[#F59E0B]" />
                                X:{rec.coordinates.x} Y:{rec.coordinates.y} Z:{rec.coordinates.z}
                              </span>
                            )}
                          </div>

                          {/* Record Title */}
                          <h4 className="text-sm sm:text-base font-game font-bold text-[#F1F5F9] group-hover:text-[#FDE68A] transition-colors leading-snug line-clamp-1">
                            {rec.title}
                          </h4>

                          {/* Memo preview snippet */}
                          <p className="text-xs text-[#94A3B8] font-jp line-clamp-2 mt-1 leading-relaxed">
                            {rec.memo}
                          </p>
                        </div>

                        {/* Bottom Metadata: Companions */}
                        {rec.companions.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 text-[10px] font-mono text-[#64748B]">
                            <Users className="w-2.5 h-2.5 text-[#06B6D4]" />
                            <span className="truncate">
                              同行: {rec.companions.join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-[#0F172A]/40 rounded-lg border border-dashed border-[#1E293B]">
          <Box className="w-12 h-12 text-[#64748B] mx-auto mb-3" />
          <h3 className="text-sm font-game text-[#94A3B8]">
            探索記録が見つかりません
          </h3>
          <p className="text-xs text-[#64748B] font-jp mt-1 max-w-sm mx-auto">
            {searchQuery
              ? '検索条件に一致する記録がありません。キーワードを変更してください。'
              : 'まだ記録がありません。右下の「記録を追加」から日々の発見を記録しましょう。'}
          </p>
        </div>
      )}

      {/* Floating Action Button (FAB) for Add Record */}
      <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-8 z-30">
        <button
          id="btn-add-record-fab"
          type="button"
          onClick={() => {
            soundEngine.playSe('new_record');
            onAddRecord();
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs sm:text-sm tracking-wider shadow-[0_4px_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>記録を追加</span>
        </button>
      </div>
    </div>
  );
};
