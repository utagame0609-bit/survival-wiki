import React, { useState, useEffect } from 'react';
import { World, LogEntry } from './types';
import { storage } from './lib/storage';
import { sound } from './audio/soundEngine';
import { WorldSelectScreen } from './components/WorldSelectScreen';
import { WorldMainHub } from './components/WorldMainHub';
import { WorldModal } from './components/WorldModal';
import { QuickLogModal } from './components/QuickLogModal';
import { LogDetailModal } from './components/LogDetailModal';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { SoundStudioModal } from './components/SoundStudioModal';

export default function App() {
  // Application State
  const [worlds, setWorlds] = useState<World[]>([]);
  const [allLogs, setAllLogs] = useState<LogEntry[]>([]);
  const [activeWorldId, setActiveWorldId] = useState<string | null>(null);
  const [deviceMode, setDeviceMode] = useState<'mobile-frame' | 'responsive'>(storage.getDeviceMode());

  // Modal States
  const [isWorldModalOpen, setIsWorldModalOpen] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);

  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [quickLogPrefill, setQuickLogPrefill] = useState<{
    locationName?: string;
    coordinates?: { x: number; y: number; z: number };
    area?: string;
  } | null>(null);

  const [selectedLogForDetail, setSelectedLogForDetail] = useState<LogEntry | null>(null);
  const [isSoundSettingsOpen, setIsSoundSettingsOpen] = useState(false);
  const [isSoundStudioOpen, setIsSoundStudioOpen] = useState(false);

  // Initialize Storage Data
  useEffect(() => {
    const loadedWorlds = storage.getWorlds();
    const loadedLogs = storage.getAllLogs();
    setWorlds(loadedWorlds);
    setAllLogs(loadedLogs);

    // Initial audio setup
    const soundCfg = storage.getSoundConfig();
    sound.setMasterVolume(soundCfg.masterVolume);
    sound.setBgmVolume(soundCfg.bgmVolume);
    sound.setSeVolume(soundCfg.seVolume);
    sound.setReverbWet(soundCfg.reverbWet);

    // Auto-open last opened world if requested or start with world select
    const lastWorldId = storage.getLastOpenedWorld();
    if (lastWorldId && loadedWorlds.some((w) => w.id === lastWorldId)) {
      setActiveWorldId(lastWorldId);
    } else {
      sound.playBgm('world-select');
    }
  }, []);

  // Handle world switch BGM
  useEffect(() => {
    if (!activeWorldId) {
      sound.playBgm('world-select');
    }
  }, [activeWorldId]);

  const activeWorld = worlds.find((w) => w.id === activeWorldId) || null;
  const currentWorldLogs = activeWorldId ? allLogs.filter((l) => l.worldId === activeWorldId) : [];

  // Toggle Device Frame Mode
  const handleToggleDeviceMode = () => {
    const next = deviceMode === 'mobile-frame' ? 'responsive' : 'mobile-frame';
    setDeviceMode(next);
    storage.setDeviceMode(next);
  };

  // --- World Actions ---
  const handleSelectWorld = (world: World) => {
    setActiveWorldId(world.id);
    storage.setLastOpenedWorld(world.id);
  };

  const handleBackToWorldSelect = () => {
    setActiveWorldId(null);
    storage.setLastOpenedWorld('');
  };

  const handleSaveWorld = (worldData: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingWorld) {
      const updated = storage.updateWorld(editingWorld.id, worldData);
      setWorlds(storage.getWorlds());
      if (activeWorldId === editingWorld.id) {
        // active world updated
      }
    } else {
      const created = storage.createWorld(worldData);
      setWorlds(storage.getWorlds());
      setActiveWorldId(created.id);
      storage.setLastOpenedWorld(created.id);
    }
    setIsWorldModalOpen(false);
    setEditingWorld(null);
  };

  const handleDeleteWorld = (worldId: string) => {
    storage.deleteWorld(worldId);
    setWorlds(storage.getWorlds());
    setAllLogs(storage.getAllLogs());
    if (activeWorldId === worldId) {
      setActiveWorldId(null);
      storage.setLastOpenedWorld('');
    }
  };

  // --- Log Actions ---
  const handleOpenQuickLog = (prefill?: {
    locationName?: string;
    coordinates?: { x: number; y: number; z: number };
    area?: string;
  }) => {
    setEditingLog(null);
    setQuickLogPrefill(prefill || null);
    setIsQuickLogOpen(true);
  };

  const handleSaveLog = (logData: Omit<LogEntry, 'id' | 'worldId' | 'createdAt'>) => {
    if (!activeWorldId) return;

    if (editingLog) {
      storage.updateLog(editingLog.id, logData);
    } else {
      storage.createLog(activeWorldId, logData);
    }

    setAllLogs(storage.getAllLogs());
    setWorlds(storage.getWorlds());
    setIsQuickLogOpen(false);
    setEditingLog(null);
    setQuickLogPrefill(null);
  };

  const handleDeleteLog = (logId: string) => {
    storage.deleteLog(logId);
    setAllLogs(storage.getAllLogs());
    setSelectedLogForDetail(null);
  };

  const handleToggleStar = (logId: string) => {
    const log = allLogs.find((l) => l.id === logId);
    if (!log) return;
    const updated = storage.updateLog(logId, { starred: !log.starred });
    setAllLogs(storage.getAllLogs());
    if (selectedLogForDetail?.id === logId) {
      setSelectedLogForDetail(updated);
    }
  };

  return (
    <div className="bg-[#07090f] min-h-screen text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Screen 1: World Select (実質トップ画面) */}
      {!activeWorld ? (
        <WorldSelectScreen
          worlds={worlds}
          allLogs={allLogs}
          onSelectWorld={handleSelectWorld}
          onCreateWorld={() => {
            setEditingWorld(null);
            setIsWorldModalOpen(true);
          }}
          onEditWorld={(w) => {
            setEditingWorld(w);
            setIsWorldModalOpen(true);
          }}
          onDeleteWorld={handleDeleteWorld}
          onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
          deviceMode={deviceMode}
          onToggleDeviceMode={handleToggleDeviceMode}
        />
      ) : (
        /* Screen 2: World Main Hub (スマートフォンファースト新HUD) */
        <WorldMainHub
          world={activeWorld}
          worlds={worlds}
          logs={currentWorldLogs}
          onSelectWorld={handleSelectWorld}
          onCreateWorld={() => {
            setEditingWorld(null);
            setIsWorldModalOpen(true);
          }}
          onBackToWorldSelect={handleBackToWorldSelect}
          onOpenQuickLog={handleOpenQuickLog}
          onOpenLogDetail={(log) => setSelectedLogForDetail(log)}
          onOpenSoundSettings={() => setIsSoundSettingsOpen(true)}
          deviceMode={deviceMode}
          onToggleDeviceMode={handleToggleDeviceMode}
        />
      )}

      {/* --- Modals --- */}

      {/* World Create/Edit Modal */}
      {isWorldModalOpen && (
        <WorldModal
          worldToEdit={editingWorld}
          onSave={handleSaveWorld}
          onClose={() => {
            setIsWorldModalOpen(false);
            setEditingWorld(null);
          }}
        />
      )}

      {/* Quick Log Modal */}
      {isQuickLogOpen && activeWorld && (
        <QuickLogModal
          world={activeWorld}
          logToEdit={
            editingLog ||
            (quickLogPrefill
              ? ({
                  id: '',
                  worldId: activeWorld.id,
                  dayNumber: Math.max(
                    1,
                    new Set(currentWorldLogs.map((l) => l.dayNumber || 1)).size
                  ),
                  timestamp: '',
                  locationName: quickLogPrefill.locationName || '',
                  coordinates: quickLogPrefill.coordinates,
                  area: quickLogPrefill.area,
                  memo: '',
                  photos: [],
                  createdAt: '',
                } as any)
              : null)
          }
          onSave={handleSaveLog}
          onClose={() => {
            setIsQuickLogOpen(false);
            setEditingLog(null);
            setQuickLogPrefill(null);
          }}
        />
      )}

      {/* Log Detail & Photo Showcase Modal */}
      {selectedLogForDetail && activeWorld && (
        <LogDetailModal
          log={selectedLogForDetail}
          world={activeWorld}
          onClose={() => setSelectedLogForDetail(null)}
          onEdit={(log) => {
            setSelectedLogForDetail(null);
            setEditingLog(log);
            setIsQuickLogOpen(true);
          }}
          onDelete={handleDeleteLog}
          onToggleStar={handleToggleStar}
        />
      )}

      {/* Sound Settings Modal */}
      {isSoundSettingsOpen && (
        <SoundSettingsModal
          onClose={() => setIsSoundSettingsOpen(false)}
          onOpenSoundStudio={() => setIsSoundStudioOpen(true)}
        />
      )}

      {/* Sound Development Studio Modal */}
      {isSoundStudioOpen && (
        <SoundStudioModal onClose={() => setIsSoundStudioOpen(false)} />
      )}
    </div>
  );
}
