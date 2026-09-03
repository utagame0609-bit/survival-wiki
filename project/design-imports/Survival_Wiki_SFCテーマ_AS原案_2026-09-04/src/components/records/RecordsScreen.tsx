import React, { useState } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Archive,
  MapPin,
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Share2,
  Edit3,
  Trash2,
  Compass,
  Sparkles,
} from 'lucide-react';
import { RecordItem } from '../../types';

interface RecordsScreenProps {
  records: RecordItem[];
  onAddRecord: () => void;
  onSelectRecord: (record: RecordItem) => void;
  onEditRecord: (record: RecordItem) => void;
  onDeleteRecord: (record: RecordItem) => void;
  onOpenChest: () => void;
  onShareSns: (record: RecordItem) => void;
}

export const RecordsScreen: React.FC<RecordsScreenProps> = ({
  records,
  onAddRecord,
  onSelectRecord,
  onEditRecord,
  onDeleteRecord,
  onOpenChest,
  onShareSns,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Collect available months
  const availableMonths = Array.from(
    new Set(
      records.map((r) => {
        const parts = r.date.split('/');
        return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : r.date;
      })
    )
  );

  // Filter & sort
  const filteredRecords = records
    .filter((r) => {
      const matchSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.detail_memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMonth =
        selectedMonth === 'all' || r.date.startsWith(selectedMonth);

      const matchCategory =
        selectedCategory === 'all' || r.category === selectedCategory;

      return matchSearch && matchMonth && matchCategory;
    })
    .sort((a, b) => {
      const timeA = new Date(`${a.date} ${a.time}`).getTime();
      const timeB = new Date(`${b.date} ${b.time}`).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

  const categoryLabels: Record<string, { label: string; color: string }> = {
    base: { label: '拠点設営', color: 'bg-emerald-700 text-white' },
    resource: { label: '鉱脈・資源', color: 'bg-amber-600 text-white' },
    structure: { label: '古代遺跡', color: 'bg-blue-700 text-white' },
    hazard: { label: '危険地帯', color: 'bg-red-600 text-white' },
    exploration: { label: '未知探査', color: 'bg-purple-700 text-white' },
  };

  return (
    <div className="space-y-5">
      {/* Controls & Command Bar */}
      <div className="sfc-panel p-4 space-y-3">
        {/* Top Row: Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Main Action Group: ADD RECORD (B: Green) & CHEST (Y: Yellow) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* ADD RECORD Button */}
            <button
              type="button"
              onClick={onAddRecord}
              className="sfc-btn sfc-btn-convex sfc-btn-b px-4 py-2 text-xs sm:text-sm font-dot flex items-center gap-2 shadow-md flex-1 sm:flex-none justify-center"
            >
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                B
              </span>
              <Plus className="w-4 h-4" />
              <span>記録を追加 (ADD RECORD)</span>
            </button>

            {/* CHEST Button (Photo Gallery / Album) */}
            <button
              type="button"
              onClick={onOpenChest}
              className="sfc-btn sfc-btn-convex sfc-btn-y px-3.5 py-2 text-xs sm:text-sm font-dot flex items-center gap-2 shadow-md flex-1 sm:flex-none justify-center"
              title="宝箱・写真ギャラリー (CHEST)"
            >
              <Archive className="w-4 h-4 text-amber-900" />
              <span>CHEST (宝箱写真館)</span>
            </button>
          </div>

          {/* Sort & Order Button */}
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-3 py-1.5 text-xs font-dot flex items-center gap-1.5"
              title="日付順並び替え"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'desc' ? '新しい順 ▼' : '古い順 ▲'}</span>
            </button>
          </div>
        </div>

        {/* Filter Row: Search & Month Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-[var(--border-groove)] items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="地点名、座標、メモ、メンバーで検索..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
            />
          </div>

          {/* Month Filter Controller Tabs */}
          <div className="md:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[10px] font-dot text-[var(--text-muted)] shrink-0 font-bold">
              期間:
            </span>
            <button
              type="button"
              onClick={() => setSelectedMonth('all')}
              className={`px-2.5 py-1 text-xs font-dot rounded sfc-btn ${
                selectedMonth === 'all'
                  ? 'sfc-btn-x text-white'
                  : 'sfc-btn-neutral text-[var(--text-muted)]'
              }`}
            >
              全期間
            </button>
            {availableMonths.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedMonth(m)}
                className={`px-2.5 py-1 text-xs font-dot rounded sfc-btn shrink-0 ${
                  selectedMonth === m
                    ? 'sfc-btn-x text-white'
                    : 'sfc-btn-neutral text-[var(--text-muted)]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="sfc-panel p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-recessed)] flex items-center justify-center border border-[var(--border-main)]">
              <Compass className="w-6 h-6 text-[var(--text-muted)]" />
            </div>
            <p className="font-dot text-sm text-[var(--text-main)] font-bold">
              条件に一致する冒険記録が見つかりませんでした
            </p>
            <button
              type="button"
              onClick={onAddRecord}
              className="sfc-btn sfc-btn-convex sfc-btn-b px-4 py-1.5 text-xs font-dot"
            >
              最初の記録を刻む
            </button>
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const cat = record.category ? categoryLabels[record.category] : null;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="sfc-panel p-4 sm:p-5 hover:border-[var(--accent-blue)] transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Left accent indicator strip */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[var(--accent-blue)] opacity-80 group-hover:opacity-100" />

                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 pl-1">
                  {/* Main Content Info */}
                  <div className="space-y-2.5 flex-1 w-full">
                    {/* Top Row: Index, Title, Coordinates & Category */}
                    <div className="flex items-center gap-2 flex-wrap justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-dot text-xs px-2 py-0.5 rounded bg-[var(--border-dark)] text-white font-bold">
                          LOG #{String(filteredRecords.length - index).padStart(2, '0')}
                        </span>

                        <h3 className="font-dot text-base sm:text-lg font-bold text-[var(--text-main)] group-hover:text-[var(--accent-blue)] transition-colors">
                          {record.name}
                        </h3>

                        {cat && (
                          <span className={`text-[9px] font-dot px-2 py-0.5 rounded font-bold ${cat.color}`}>
                            {cat.label}
                          </span>
                        )}
                      </div>

                      {/* Coordinates Matrix Badge */}
                      {record.has_coordinates && record.x !== undefined && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--surface-recessed)] border border-[var(--border-main)] font-dot text-xs text-[var(--text-main)] shadow-inner">
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent-red)]" />
                          <span>
                            X: <strong>{record.x}</strong>, Y: <strong>{record.y}</strong>, Z: <strong>{record.z}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Date, Time & Companion Badges */}
                    <div className="flex items-center gap-3 text-xs font-dot text-[var(--text-muted)] flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {record.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {record.time}
                      </span>

                      {record.members && record.members.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span className="text-[var(--text-main)] font-bold">
                            {record.members.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Detail Memo */}
                    <p className="text-xs sm:text-sm text-[var(--text-main)] bg-[var(--surface-label)] p-3 rounded border border-[var(--border-main)] leading-relaxed shadow-inner">
                      {record.detail_memo}
                    </p>
                  </div>

                  {/* Right Thumbnail & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-groove)]">
                    {/* Thumbnail Image if available */}
                    {record.photos && record.photos.length > 0 ? (
                      <div className="relative w-24 h-18 sm:w-28 sm:h-20 rounded border-2 border-[var(--border-dark)] overflow-hidden shadow bg-black shrink-0">
                        <img
                          src={record.photos[0].url}
                          alt={record.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {record.photos.length > 1 && (
                          <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-dot px-1 rounded flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5" />
                            +{record.photos.length - 1}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-24 h-18 sm:w-28 sm:h-20 rounded border-2 border-dashed border-[var(--border-main)] bg-[var(--surface-recessed)] flex flex-col items-center justify-center text-[var(--text-muted)] text-[9px] font-dot shrink-0">
                        <ImageIcon className="w-4 h-4 mb-0.5 opacity-50" />
                        NO PHOTO
                      </div>
                    )}

                    {/* Quick Card Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {/* SNS Share */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onShareSns(record);
                        }}
                        className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1.5 rounded"
                        title="SNS共有カード"
                      >
                        <Share2 className="w-3.5 h-3.5 text-[var(--accent-blue)]" />
                      </button>

                      {/* Edit */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditRecord(record);
                        }}
                        className="sfc-btn sfc-btn-convex sfc-btn-y p-1.5 rounded"
                        title="記録編集"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(record);
                        }}
                        className="sfc-btn sfc-btn-convex sfc-btn-a p-1.5 rounded"
                        title="記録削除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
