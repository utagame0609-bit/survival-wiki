import React, { useState, useEffect } from 'react';
import {
  World,
  LocationRecord,
  WikiNpc,
  WikiArticle,
  AudioSettings,
} from './types';
import {
  INITIAL_WORLDS,
  INITIAL_RECORDS,
  INITIAL_NPCS,
  INITIAL_ARTICLES,
  INITIAL_AUDIO_SETTINGS,
} from './data/initialData';
import { Header } from './components/common/Header';
import { MobileBottomHud } from './components/common/MobileBottomHud';
import { WorldHeader } from './components/common/WorldHeader';
import { WorldSelectScreen } from './components/world/WorldSelectScreen';
import { WorldModal } from './components/world/WorldModal';
import { RecordsTimelineView } from './components/records/RecordsTimelineView';
import { RecordDetailModal } from './components/records/RecordDetailModal';
import { RecordFormModal } from './components/records/RecordFormModal';
import { ChestModal } from './components/records/ChestModal';
import { SnsShareModal } from './components/records/SnsShareModal';
import { WikiTopView } from './components/wiki/WikiTopView';
import { WikiCompilingModal } from './components/wiki/WikiCompilingModal';
import { WikiArticleView } from './components/wiki/WikiArticleView';
import { SettingsModal } from './components/settings/SettingsModal';
import { SoundStudioModal } from './components/settings/SoundStudioModal';
import { BookOpen, ScrollText } from 'lucide-react';
import { soundEngine } from './services/soundEngine';

export function App() {
  // App Core State
  const [activeScreen, setActiveScreen] = useState<'world_select' | 'world_main'>('world_select');
  const [activeWorldId, setActiveWorldId] = useState<string>('world-1');
  const [activeTab, setActiveTab] = useState<'records' | 'wiki'>('records');

  // Data Stores
  const [worlds, setWorlds] = useState<World[]>(INITIAL_WORLDS);
  const [recordsMap, setRecordsMap] = useState<Record<string, LocationRecord[]>>(INITIAL_RECORDS);
  const [savedArticles, setSavedArticles] = useState<Record<string, WikiArticle>>(INITIAL_ARTICLES);
  const [npcs] = useState<WikiNpc[]>(INITIAL_NPCS);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(INITIAL_AUDIO_SETTINGS);

  // Modal States
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [worldToEdit, setWorldToEdit] = useState<World | null>(null);

  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<LocationRecord | null>(null);
  const [isRecordDetailOpen, setIsRecordDetailOpen] = useState(false);

  const [recordToEdit, setRecordToEdit] = useState<LocationRecord | null>(null);
  const [isRecordFormOpen, setIsRecordFormOpen] = useState(false);

  const [isChestOpen, setIsChestOpen] = useState(false);

  const [recordForSns, setRecordForSns] = useState<LocationRecord | null>(null);
  const [isSnsShareOpen, setIsSnsShareOpen] = useState(false);

  const [compilingNpc, setCompilingNpc] = useState<WikiNpc | null>(null);
  const [isWikiCompilingOpen, setIsWikiCompilingOpen] = useState(false);
  const [activeWikiArticle, setActiveWikiArticle] = useState<WikiArticle | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);

  // Derived current world & records
  const currentWorld = worlds.find((w) => w.id === activeWorldId) || worlds[0];
  const currentRecords = recordsMap[activeWorldId] || [];

  // Available companions in current world
  const availableCompanions = currentWorld
    ? [currentWorld.leaderName, ...currentWorld.partyMembers.map((m) => m.name)]
    : [];

  // WORLD ACTIONS
  const handleSelectWorld = (worldId: string) => {
    setActiveWorldId(worldId);
    setActiveScreen('world_main');
    setActiveTab('records');
    setActiveWikiArticle(null);
  };

  const handleCreateWorld = () => {
    setWorldToEdit(null);
    setIsWorldModalOpen(true);
  };

  const handleEditWorld = (world: World) => {
    setWorldToEdit(world);
    setIsWorldModalOpen(true);
  };

  const handleDeleteWorld = (worldId: string) => {
    setWorlds((prev) => prev.filter((w) => w.id !== worldId));
    if (activeWorldId === worldId && worlds.length > 1) {
      setActiveWorldId(worlds.find((w) => w.id !== worldId)!.id);
    }
  };

  const handleSaveWorld = (worldData: Partial<World>) => {
    if (worldToEdit) {
      setWorlds((prev) =>
        prev.map((w) => (w.id === worldToEdit.id ? { ...w, ...worldData } : w))
      );
    } else {
      const newSlot = worlds.length + 1;
      const newWorld: World = {
        id: `world-${Date.now()}`,
        slotNumber: newSlot,
        name: worldData.name || `WORLD SLOT 0${newSlot}`,
        leaderName: worldData.leaderName || '開拓者',
        leaderAvatar:
          worldData.leaderAvatar ||
          'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
        memo: worldData.memo || '',
        partyMembers: worldData.partyMembers || [],
        createdAt: '2026-08-29',
        daysCount: 1,
        recordsCount: 0,
        lastRecordAt: '2026-08-29 12:00',
      };
      setWorlds((prev) => [...prev, newWorld]);
      setRecordsMap((prev) => ({ ...prev, [newWorld.id]: [] }));
      setActiveWorldId(newWorld.id);
      setActiveScreen('world_main');
    }
  };

  // RECORD ACTIONS
  const handleOpenRecordDetail = (record: LocationRecord) => {
    setSelectedRecordForDetail(record);
    setIsRecordDetailOpen(true);
  };

  const handleAddRecord = () => {
    setRecordToEdit(null);
    setIsRecordFormOpen(true);
  };

  const handleEditRecord = (record: LocationRecord) => {
    setRecordToEdit(record);
    setIsRecordFormOpen(true);
  };

  const handleDeleteRecord = (recordId: string) => {
    setRecordsMap((prev) => ({
      ...prev,
      [activeWorldId]: (prev[activeWorldId] || []).filter((r) => r.id !== recordId),
    }));
    // Update world record count
    setWorlds((prev) =>
      prev.map((w) =>
        w.id === activeWorldId
          ? { ...w, recordsCount: Math.max(0, w.recordsCount - 1) }
          : w
      )
    );
  };

  const handleSaveRecord = (recordData: Partial<LocationRecord>) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (recordToEdit) {
      setRecordsMap((prev) => ({
        ...prev,
        [activeWorldId]: (prev[activeWorldId] || []).map((r) =>
          r.id === recordToEdit.id ? { ...r, ...recordData } : r
        ),
      }));
      // Also update currently inspected detail if open
      if (selectedRecordForDetail && selectedRecordForDetail.id === recordToEdit.id) {
        setSelectedRecordForDetail({ ...selectedRecordForDetail, ...recordData });
      }
    } else {
      const newRec: LocationRecord = {
        id: `rec-${Date.now()}`,
        worldId: activeWorldId,
        dayNumber: currentWorld ? currentWorld.daysCount : 1,
        title: recordData.title || '新しい発見',
        memo: recordData.memo || '',
        createdAt: formattedNow,
        photoUrl: recordData.photoUrl,
        photos: recordData.photos || (recordData.photoUrl ? [recordData.photoUrl] : []),
        hasExplicitCoordinates: recordData.hasExplicitCoordinates ?? false,
        coordinates: recordData.coordinates,
        companions: recordData.companions || [],
      };
      setRecordsMap((prev) => ({
        ...prev,
        [activeWorldId]: [newRec, ...(prev[activeWorldId] || [])],
      }));
      // Update world stats
      setWorlds((prev) =>
        prev.map((w) =>
          w.id === activeWorldId
            ? {
                ...w,
                recordsCount: w.recordsCount + 1,
                lastRecordAt: formattedNow,
              }
            : w
        )
      );
    }
  };

  const handleOpenSnsShare = (record: LocationRecord) => {
    setRecordForSns(record);
    setIsSnsShareOpen(true);
  };

  // WIKI ACTIONS
  const handleStartCompileNpc = (npc: WikiNpc) => {
    setCompilingNpc(npc);
    setIsWikiCompilingOpen(true);
  };

  const handleFinishCompile = (article: WikiArticle) => {
    setIsWikiCompilingOpen(false);
    const key = `${activeWorldId}_${article.style}`;
    setSavedArticles((prev) => ({ ...prev, [key]: article }));
    setActiveWikiArticle(article);
  };

  const handleReadArticle = (article: WikiArticle) => {
    setActiveWikiArticle(article);
  };

  const handleSwitchArticleStyle = (style: 'encyclopedia' | 'scp' | 'ancient') => {
    const key = `${activeWorldId}_${style}`;
    const article = savedArticles[key];
    if (article) {
      setActiveWikiArticle(article);
    } else {
      const targetNpc = npcs.find((n) => n.style === style) || npcs[0];
      handleStartCompileNpc(targetNpc);
    }
  };

  const handleResetStyleArticle = (style: string) => {
    const key = `${activeWorldId}_${style}`;
    setSavedArticles((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setActiveWikiArticle(null);
  };

  // AUDIO SETTINGS
  const handleToggleMute = () => {
    const newMuted = !audioSettings.isMuted;
    setAudioSettings((prev) => ({ ...prev, isMuted: newMuted }));
    if (newMuted) {
      soundEngine.mute();
    } else {
      soundEngine.unmute();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1018] text-[#F8FAFC] flex flex-col font-game selection:bg-[#F59E0B] selection:text-[#0B1018]">
      {/* Top Header */}
      <Header
        title={
          activeScreen === 'world_select'
            ? 'WORLD SELECT'
            : currentWorld?.name || 'SURVIVAL LOG'
        }
        subTitle={
          activeScreen === 'world_select'
            ? 'UTAPEDIA // 冒険の書一覧'
            : `SLOT 0${currentWorld?.slotNumber || 1} // ${currentWorld?.leaderName}`
        }
        onBack={
          activeScreen === 'world_main'
            ? () => {
                setActiveScreen('world_select');
                setActiveWikiArticle(null);
              }
            : undefined
        }
        onHome={
          activeScreen === 'world_main'
            ? () => {
                setActiveScreen('world_select');
                setActiveWikiArticle(null);
              }
            : undefined
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={audioSettings.isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeScreen === 'world_select' ? (
          /* SCREEN 1: WORLD SELECT SCREEN */
          <WorldSelectScreen
            worlds={worlds}
            onSelectWorld={handleSelectWorld}
            onCreateWorld={handleCreateWorld}
            onEditWorld={handleEditWorld}
            onDeleteWorld={handleDeleteWorld}
          />
        ) : (
          /* SCREEN 2: IN-WORLD ACTIVE INTERFACE */
          <div>
            {/* World Metadata Header */}
            {currentWorld && (
              <WorldHeader
                world={currentWorld}
                onEditWorld={() => handleEditWorld(currentWorld)}
              />
            )}

            {/* Desktop Navigation Tabs (Hidden on Mobile, handled cleanly in MobileBottomHud) */}
            <div className="hidden md:flex items-center gap-2 mb-6 border-b border-[#1E293B] pb-3">
              <button
                id="desktop-tab-records"
                type="button"
                onClick={() => {
                  soundEngine.playSe('tab_switch');
                  setActiveTab('records');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-game tracking-wider transition-all ${
                  activeTab === 'records'
                    ? 'bg-[#161F30] text-[#F59E0B] border border-[#F59E0B]/60 shadow-[0_0_12px_rgba(245,158,11,0.2)] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30]/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#F59E0B]" />
                <span>冒険の記録 (TIMELINE)</span>
                <span className="px-1.5 py-0.2 bg-[#0B1018] rounded text-[10px] font-mono text-[#94A3B8]">
                  {currentRecords.length}
                </span>
              </button>

              <button
                id="desktop-tab-wiki"
                type="button"
                onClick={() => {
                  soundEngine.playSe('tab_switch');
                  setActiveTab('wiki');
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-game tracking-wider transition-all ${
                  activeTab === 'wiki'
                    ? 'bg-[#0E2A3A] text-[#06B6D4] border border-[#06B6D4]/60 shadow-[0_0_12px_rgba(6,182,212,0.2)] font-bold'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#161F30]/50'
                }`}
              >
                <ScrollText className="w-4 h-4 text-[#06B6D4]" />
                <span>旅の書 (AI WIKI CHRONICLE)</span>
                <span className="px-1.5 py-0.2 bg-[#0B1018] rounded text-[10px] font-mono text-[#06B6D4]">
                  {Object.keys(savedArticles).length}/3
                </span>
              </button>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'records' ? (
              <RecordsTimelineView
                records={currentRecords}
                onSelectRecord={handleOpenRecordDetail}
                onOpenChest={() => setIsChestOpen(true)}
                onAddRecord={handleAddRecord}
              />
            ) : activeWikiArticle ? (
              <WikiArticleView
                article={activeWikiArticle}
                npcs={npcs}
                allRecords={currentRecords}
                onSwitchStyle={handleSwitchArticleStyle}
                onBackToWikiList={() => setActiveWikiArticle(null)}
                onSelectRecordForDetail={handleOpenRecordDetail}
                onResetStyleArticle={handleResetStyleArticle}
              />
            ) : (
              <WikiTopView
                npcs={npcs}
                savedArticles={savedArticles}
                recordsCount={currentRecords.length}
                onSelectNpcToCompile={handleStartCompileNpc}
                onReadArticle={handleReadArticle}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom HUD (Shown only on small screens) */}
      <MobileBottomHud
        currentTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'wiki' && activeWikiArticle) {
            // keep or show wiki
          }
        }}
        onBack={
          activeWikiArticle
            ? () => setActiveWikiArticle(null)
            : activeScreen === 'world_main'
            ? () => {
                setActiveScreen('world_select');
                setActiveWikiArticle(null);
              }
            : undefined
        }
        onHome={
          activeScreen === 'world_main'
            ? () => {
                setActiveScreen('world_select');
                setActiveWikiArticle(null);
              }
            : undefined
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        isMuted={audioSettings.isMuted}
        onToggleMute={handleToggleMute}
        inWorld={activeScreen === 'world_main'}
      />

      {/* MODALS */}
      {/* 1. World Create / Edit Modal */}
      <WorldModal
        worldToEdit={worldToEdit}
        isOpen={isWorldModalOpen}
        onClose={() => setIsWorldModalOpen(false)}
        onSave={handleSaveWorld}
      />

      {/* 2. Record Detail Modal */}
      <RecordDetailModal
        record={selectedRecordForDetail}
        isOpen={isRecordDetailOpen}
        onClose={() => setIsRecordDetailOpen(false)}
        onEdit={(rec) => {
          setIsRecordDetailOpen(false);
          handleEditRecord(rec);
        }}
        onDelete={(recId) => {
          handleDeleteRecord(recId);
        }}
        onShare={(rec) => {
          handleOpenSnsShare(rec);
        }}
      />

      {/* 3. Record Form (Quick Log) Modal */}
      <RecordFormModal
        recordToEdit={recordToEdit}
        isOpen={isRecordFormOpen}
        onClose={() => setIsRecordFormOpen(false)}
        onSave={handleSaveRecord}
        availableCompanions={availableCompanions}
      />

      {/* 4. CHEST (Photo Vault Gallery) Modal */}
      <ChestModal
        records={currentRecords}
        isOpen={isChestOpen}
        onClose={() => setIsChestOpen(false)}
        onSelectRecordForDetail={handleOpenRecordDetail}
      />

      {/* 5. SNS Share Text Modal */}
      {currentWorld && (
        <SnsShareModal
          record={recordForSns}
          world={currentWorld}
          isOpen={isSnsShareOpen}
          onClose={() => setIsSnsShareOpen(false)}
        />
      )}

      {/* 6. Wiki Compiling Typewriter Effect Modal */}
      {compilingNpc && (
        <WikiCompilingModal
          npc={compilingNpc}
          isOpen={isWikiCompilingOpen}
          onFinish={handleFinishCompile}
        />
      )}

      {/* 7. Settings Config Modal */}
      <SettingsModal
        settings={audioSettings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSet) =>
          setAudioSettings((prev) => ({ ...prev, ...newSet }))
        }
        onOpenSoundStudio={() => {
          setIsSettingsOpen(false);
          setIsSoundStudioOpen(true);
        }}
      />

      {/* 8. Sound Studio (28 SE verification console) Modal */}
      <SoundStudioModal
        isOpen={isSoundStudioOpen}
        onClose={() => setIsSoundStudioOpen(false)}
      />
    </div>
  );
}
export default App;
