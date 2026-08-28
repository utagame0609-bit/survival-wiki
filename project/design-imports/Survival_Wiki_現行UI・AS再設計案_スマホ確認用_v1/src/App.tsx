import React, { useState, useEffect } from 'react';
import { World, AdventureRecord, SoundConfig } from './types';
import { StorageService } from './lib/storage';
import { NavigationHeader } from './components/NavigationHeader';
import { WorldSelectScreen } from './components/WorldSelectScreen';
import { WorldHubScreen } from './components/WorldHubScreen';
import { WorldConfigModal } from './components/WorldConfigModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { SoundStudioModal } from './components/settings/SoundStudioModal';
import { soundEngine, playConfirmSound, playCancelSound, playModalOpenSound } from './audio/soundEngine';

export function App() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [records, setRecords] = useState<AdventureRecord[]>([]);
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);

  // Modals state
  const [isCreatingWorld, setIsCreatingWorld] = useState(false);
  const [worldToEdit, setWorldToEdit] = useState<World | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);

  // Sound Mute state
  const [isMuted, setIsMuted] = useState(false);

  // Initial load
  useEffect(() => {
    StorageService.init();
    const loadedWorlds = StorageService.getWorlds();
    const loadedRecords = StorageService.getRecords();
    const lastActiveId = StorageService.getActiveWorldId();
    const soundCfg = StorageService.getSoundConfig();

    setWorlds(loadedWorlds);
    setRecords(loadedRecords);
    setIsMuted(soundCfg.muted);
    soundEngine.setConfig(soundCfg);

    // If last active world still exists, restore it; otherwise stay on world select
    if (lastActiveId && loadedWorlds.some((w) => w.id === lastActiveId)) {
      setActiveWorldId(lastActiveId);
    }
  }, []);

  const activeWorld = worlds.find((w) => w.id === activeWorldId) || null;
  const activeWorldRecords = records.filter((r) => r.worldId === activeWorldId);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const cfg = soundEngine.getConfig();
    const nextCfg: SoundConfig = { ...cfg, muted: nextMuted };
    soundEngine.setConfig(nextCfg);
    StorageService.saveSoundConfig(nextCfg);
  };

  // World Operations
  const handleSelectWorld = (world: World) => {
    setActiveWorldId(world.id);
    StorageService.setActiveWorldId(world.id);
  };

  const handleBackToSlots = () => {
    setActiveWorldId(null);
    StorageService.setActiveWorldId(null);
  };

  const handleSaveWorld = (world: World) => {
    const saved = StorageService.saveWorld(world);
    const updatedWorlds = StorageService.getWorlds();
    setWorlds(updatedWorlds);
    setIsCreatingWorld(false);
    setWorldToEdit(null);
    // If it was just created, open it immediately
    if (!activeWorldId) {
      setActiveWorldId(saved.id);
      StorageService.setActiveWorldId(saved.id);
    }
  };

  const handleDeleteWorld = (world: World) => {
    if (window.confirm(`冒険の書「${world.name}」を削除しますか？`)) {
      StorageService.deleteWorld(world.id);
      const updatedWorlds = StorageService.getWorlds();
      const updatedRecords = StorageService.getRecords();
      setWorlds(updatedWorlds);
      setRecords(updatedRecords);
      if (activeWorldId === world.id) {
        setActiveWorldId(null);
        StorageService.setActiveWorldId(null);
      }
    }
  };

  // Record Operations
  const handleAddRecord = (record: AdventureRecord) => {
    StorageService.addRecord(record);
    setRecords(StorageService.getRecords());
  };

  const handleUpdateRecord = (record: AdventureRecord) => {
    StorageService.updateRecord(record);
    setRecords(StorageService.getRecords());
  };

  const handleDeleteRecord = (record: AdventureRecord) => {
    StorageService.deleteRecord(record.id);
    setRecords(StorageService.getRecords());
  };

  const handleResetAllData = () => {
    StorageService.resetAllData();
    const updatedWorlds = StorageService.getWorlds();
    const updatedRecords = StorageService.getRecords();
    setWorlds(updatedWorlds);
    setRecords(updatedRecords);
    setActiveWorldId(null);
    StorageService.setActiveWorldId(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E5E5E5] flex flex-col font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Universal App Navigation Header */}
      <NavigationHeader
        title={activeWorld ? activeWorld.name : 'UTAPEDIA - 冒険の書'}
        subtitle={
          activeWorld
            ? `PLAYER: ${activeWorld.player} // ${activeWorldRecords.length} LOGS`
            : 'ADVENTURE LOG & AI CHRONICLE'
        }
        onBack={activeWorld ? handleBackToSlots : undefined}
        onHome={activeWorld ? handleBackToSlots : undefined}
        onOpenSettings={() => {
          playModalOpenSound();
          setIsSettingsOpen(true);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        genreTag={activeWorld?.genre}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {activeWorld ? (
          <WorldHubScreen
            world={activeWorld}
            records={activeWorldRecords}
            onBackToSlots={handleBackToSlots}
            onUpdateWorld={handleSaveWorld}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
          />
        ) : (
          <WorldSelectScreen
            worlds={worlds}
            records={records}
            onSelectWorld={handleSelectWorld}
            onCreateWorld={() => {
              playModalOpenSound();
              setWorldToEdit(null);
              setIsCreatingWorld(true);
            }}
            onEditWorld={(w) => {
              playModalOpenSound();
              setWorldToEdit(w);
              setIsCreatingWorld(true);
            }}
            onDeleteWorld={handleDeleteWorld}
          />
        )}
      </main>

      {/* Create / Edit World Modal */}
      {isCreatingWorld && (
        <WorldConfigModal
          initialWorld={worldToEdit}
          onSave={handleSaveWorld}
          onClose={() => {
            setIsCreatingWorld(false);
            setWorldToEdit(null);
          }}
        />
      )}

      {/* Global Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onOpenSoundStudio={() => {
            setIsSettingsOpen(false);
            setIsSoundStudioOpen(true);
          }}
          onResetData={handleResetAllData}
        />
      )}

      {/* 16-Bit Sound Studio Modal */}
      {isSoundStudioOpen && (
        <SoundStudioModal onClose={() => setIsSoundStudioOpen(false)} />
      )}
    </div>
  );
}

export default App;
