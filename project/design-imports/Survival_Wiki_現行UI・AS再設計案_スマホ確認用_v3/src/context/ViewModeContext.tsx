import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewMode } from '../types';
import { soundEngine } from '../lib/soundEngine';

interface ViewModeContextType {
  viewMode: ViewMode;
  isMobile: boolean;
  toggleViewMode: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('pc');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'mobile' ? 'pc' : 'mobile'));
  };

  const toggleSound = () => {
    if (soundEnabled) {
      soundEngine.setMasterVolume(0);
      setSoundEnabled(false);
    } else {
      soundEngine.setMasterVolume(0.5);
      setSoundEnabled(true);
    }
  };

  // isMobile is true if user explicitly switched to 'mobile' viewMode OR screen width is < 768px
  const isMobile = viewMode === 'mobile' || windowWidth < 768;

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        isMobile,
        toggleViewMode,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
