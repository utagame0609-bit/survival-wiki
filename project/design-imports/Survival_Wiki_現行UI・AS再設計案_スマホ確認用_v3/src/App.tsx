import React, { useState, useEffect } from 'react';
import { WorldWithMembers } from './types';
import { Header } from './components/Header';
import { WorldSelectScreen } from './components/WorldSelectScreen';
import { WorldCreateModal } from './components/WorldCreateModal';
import { WorldScreen } from './components/WorldScreen';
import { SettingsModal, SettingsButton } from './components/SettingsModal';
import { soundEngine } from './lib/soundEngine';
import { ViewModeProvider, useViewMode } from './context/ViewModeContext';
import { Smartphone, Monitor } from 'lucide-react';

function AppContent() {
  const { viewMode, isMobile, toggleViewMode } = useViewMode();
  const [currentWorld, setCurrentWorld] = useState<WorldWithMembers | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateWorld, setShowCreateWorld] = useState(false);
  const [worldToEdit, setWorldToEdit] = useState<WorldWithMembers | null>(null);

  // Resume audio on first user gesture
  useEffect(() => {
    const handleFirstClick = () => {
      soundEngine.init();
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('keydown', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    window.addEventListener('keydown', handleFirstClick);
    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('keydown', handleFirstClick);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0e17] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Header */}
      <Header
        title={currentWorld ? `UTAPEDIA // ${currentWorld.name}` : 'UTAPEDIA // 冒険の書'}
        onBack={currentWorld ? () => setCurrentWorld(null) : undefined}
        onHome={currentWorld ? () => setCurrentWorld(null) : undefined}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col w-full items-center justify-start">
        <div className="w-full max-w-5xl px-3 sm:px-6 py-3 sm:py-6 flex-1 flex flex-col">
          {currentWorld ? (
            <WorldScreen
              world={currentWorld}
              onUpdateWorld={(updated) => setCurrentWorld(updated)}
            />
          ) : (
            <WorldSelectScreen
              onSelectWorld={(world) => setCurrentWorld(world)}
              onOpenCreate={() => {
                setWorldToEdit(null);
                setShowCreateWorld(true);
              }}
              onOpenEdit={(world) => {
                setWorldToEdit(world);
                setShowCreateWorld(true);
              }}
            />
          )}
        </div>
      </main>

      {/* Floating System Config Button */}
      <SettingsButton onClick={() => setShowSettings(true)} />

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {/* World Create/Edit Modal */}
      {showCreateWorld && (
        <WorldCreateModal
          worldToEdit={worldToEdit}
          onClose={() => {
            setShowCreateWorld(false);
            setWorldToEdit(null);
          }}
          onSaved={(newWorld) => {
            setShowCreateWorld(false);
            setWorldToEdit(null);
            setCurrentWorld(newWorld);
          }}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ViewModeProvider>
      <AppContent />
    </ViewModeProvider>
  );
}

export default App;
