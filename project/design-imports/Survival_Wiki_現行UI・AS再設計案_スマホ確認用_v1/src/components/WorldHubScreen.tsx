import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Archive,
  Compass,
  Sparkles,
  Plus,
  ArrowLeft,
  Users,
  Shield,
  Clock,
  Camera,
  MapPin,
  Flame,
} from 'lucide-react';
import { World, AdventureRecord, ActiveTab } from '../types';
import { JournalView } from './journal/JournalView';
import { ChestView } from './chest/ChestView';
import { AtlasView } from './atlas/AtlasView';
import { WikiView } from './wiki/WikiView';
import { RecordCreateModal } from './journal/RecordCreateModal';
import { RecordDetailModal } from './journal/RecordDetailModal';
import { WorldConfigModal } from './WorldConfigModal';
import {
  playConfirmSound,
  playHoverSound,
  playModalOpenSound,
  soundEngine,
} from '../audio/soundEngine';

interface WorldHubScreenProps {
  world: World;
  records: AdventureRecord[];
  onBackToSlots: () => void;
  onUpdateWorld: (world: World) => void;
  onAddRecord: (record: AdventureRecord) => void;
  onUpdateRecord: (record: AdventureRecord) => void;
  onDeleteRecord: (record: AdventureRecord) => void;
}

export const WorldHubScreen: React.FC<WorldHubScreenProps> = ({
  world,
  records,
  onBackToSlots,
  onUpdateWorld,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('journal');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [suggestedDayForNewRecord, setSuggestedDayForNewRecord] = useState<number>(1);
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<AdventureRecord | null>(null);
  const [recordToEdit, setRecordToEdit] = useState<AdventureRecord | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Play BGM according to genre on hub mount
  useEffect(() => {
    soundEngine.playBgm('journal');
  }, []);

  const uniqueDays = Array.from(new Set(records.map((r) => r.dayNumber))).length;
  const maxDay = records.reduce((max, r) => Math.max(max, r.dayNumber), 1);
  const totalPhotos = records.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
  const uniqueLocations = Array.from(new Set(records.map((r) => r.locationName)));

  const handleTabChange = (tab: ActiveTab) => {
    playConfirmSound();
    setActiveTab(tab);
    if (tab === 'wiki') {
      soundEngine.playBgm('wikipedia');
    } else {
      soundEngine.playBgm('journal');
    }
  };

  const handleOpenCreateRecord = (day?: number) => {
    playModalOpenSound();
    setRecordToEdit(null);
    setSuggestedDayForNewRecord(day || maxDay || 1);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditRecord = (record: AdventureRecord) => {
    playModalOpenSound();
    setSelectedRecordForDetail(null);
    setRecordToEdit(record);
    setIsCreateModalOpen(true);
  };

  const handleSaveRecord = (record: AdventureRecord) => {
    if (recordToEdit) {
      onUpdateRecord(record);
    } else {
      onAddRecord(record);
    }
    setIsCreateModalOpen(false);
    setRecordToEdit(null);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0A0A0A] text-[#E5E5E5] flex flex-col justify-between pb-20 sm:pb-8">
      <div className="max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* World Top Status Banner */}
        <div className="relative bg-[#141414] border border-[#262626] p-3 sm:p-4 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Player & World meta */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                {world.playerPhotoUrl ? (
                  <img
                    src={world.playerPhotoUrl}
                    alt={world.player}
                    className="w-12 h-12 rounded-sm object-cover border border-[#D4AF37]/50 shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-sm bg-[#1F1F1F] border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] font-mono font-bold text-lg">
                    {world.player.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 text-[8px] font-mono font-bold bg-[#D4AF37] text-black px-1 rounded-sm">
                  LV.{(uniqueDays || 1) * 3}
                </span>
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono truncate">
                    {world.name}
                  </h2>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
                    {world.genre.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#A3A3A3]">
                  <span className="text-[#E5E5E5] font-semibold">主: {world.player}</span>
                  {world.members.length > 0 && (
                    <span className="text-[#D4AF37]">
                      同行: {world.members.map((m) => `@${m.name}`).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Live Stats Counter */}
            <div className="flex items-center justify-around md:justify-end gap-3 sm:gap-5 py-1.5 px-3 bg-[#0A0A0A] border border-[#222222] rounded-sm font-mono text-xs shrink-0">
              <div className="text-center">
                <div className="text-[10px] text-[#737373]">DAYS</div>
                <div className="font-bold text-[#E5E5E5] sm:text-sm">
                  {uniqueDays || (records.length > 0 ? 1 : 0)} 日間
                </div>
              </div>
              <div className="h-5 w-px bg-[#262626]" />
              <div className="text-center">
                <div className="text-[10px] text-[#737373]">LOGS</div>
                <div className="font-bold text-[#D4AF37] sm:text-sm">
                  {records.length} 件
                </div>
              </div>
              <div className="h-5 w-px bg-[#262626]" />
              <div className="text-center">
                <div className="text-[10px] text-[#737373]">PHOTOS</div>
                <div className="font-bold text-[#A3A3A3] sm:text-sm">
                  {totalPhotos} 枚
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop / Tablet Tab Switcher */}
        <div className="hidden sm:grid grid-cols-4 gap-2 bg-[#141414] p-1.5 border border-[#262626] rounded-sm">
          {[
            { id: 'journal', label: '冒険日誌 (JOURNAL)', icon: BookOpen, count: records.length },
            { id: 'chest', label: '宝箱 (CHEST)', icon: Archive, count: totalPhotos },
            { id: 'atlas', label: '地点索引 (ATLAS)', icon: Compass, count: uniqueLocations.length },
            { id: 'wiki', label: '旅の書 (AI WIKI)', icon: Sparkles, badge: 'AI' },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTabChange(t.id as ActiveTab)}
                onMouseEnter={playHoverSound}
                className={`py-2.5 px-3 rounded-sm font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#D4AF37] text-black border-b-2 border-[#A68824] shadow-md'
                    : 'text-[#A3A3A3] hover:text-[#E5E5E5] hover:bg-[#1F1F1F]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
                {t.badge ? (
                  <span
                    className={`px-1 text-[9px] rounded-sm font-black ${
                      isSelected ? 'bg-black text-[#D4AF37]' : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                    }`}
                  >
                    {t.badge}
                  </span>
                ) : (
                  <span
                    className={`text-[10px] ${
                      isSelected ? 'text-black/80' : 'text-[#737373]'
                    }`}
                  >
                    ({t.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Viewport */}
        <div>
          {activeTab === 'journal' && (
            <JournalView
              world={world}
              records={records}
              onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
              onCreateRecord={handleOpenCreateRecord}
              onEditRecord={handleOpenEditRecord}
              onDeleteRecord={(rec) => onDeleteRecord(rec)}
            />
          )}

          {activeTab === 'chest' && (
            <ChestView
              world={world}
              records={records}
              onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
            />
          )}

          {activeTab === 'atlas' && (
            <AtlasView
              world={world}
              records={records}
              onOpenRecord={(rec) => setSelectedRecordForDetail(rec)}
            />
          )}

          {activeTab === 'wiki' && (
            <WikiView world={world} records={records} />
          )}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <div className="fixed bottom-16 right-4 sm:hidden z-30">
        <button
          type="button"
          onClick={() => handleOpenCreateRecord(maxDay)}
          onMouseEnter={playHoverSound}
          className="w-14 h-14 bg-[#D4AF37] text-black rounded-full shadow-[0_0_20px_rgba(212,175,55,0.4)] border border-[#E5C158] flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          aria-label="記録を追加"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#262626] py-1.5 px-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
        {[
          { id: 'journal', label: '日誌', icon: BookOpen },
          { id: 'chest', label: '宝箱', icon: Archive },
          { id: 'atlas', label: '地点', icon: Compass },
          { id: 'wiki', label: '旅の書', icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id as ActiveTab)}
              className={`flex flex-col items-center justify-center py-1 px-3 min-h-[44px] min-w-[56px] transition-colors cursor-pointer ${
                isSelected ? 'text-[#D4AF37] font-bold' : 'text-[#737373]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <RecordCreateModal
          world={world}
          existingRecord={recordToEdit}
          onSave={handleSaveRecord}
          onClose={() => {
            setIsCreateModalOpen(false);
            setRecordToEdit(null);
          }}
          suggestedDay={suggestedDayForNewRecord}
          recentLocations={uniqueLocations}
        />
      )}

      {selectedRecordForDetail && (
        <RecordDetailModal
          world={world}
          record={selectedRecordForDetail}
          onClose={() => setSelectedRecordForDetail(null)}
          onEdit={(rec) => handleOpenEditRecord(rec)}
          onDelete={(rec) => {
            onDeleteRecord(rec);
            setSelectedRecordForDetail(null);
          }}
        />
      )}

      {isConfigModalOpen && (
        <WorldConfigModal
          initialWorld={world}
          onSave={(updated) => {
            onUpdateWorld(updated);
            setIsConfigModalOpen(false);
          }}
          onClose={() => setIsConfigModalOpen(false)}
        />
      )}
    </div>
  );
};
