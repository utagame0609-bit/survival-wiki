import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { WorldWithMembers, LocationWithPhotos } from '../types';
import { fetchLocations, deleteLocation } from '../lib/db';
import { WorldHeader } from './WorldHeader';
import { WorldTabs, TabType } from './WorldTabs';
import { TimelineRecordsTab } from './TimelineRecordsTab';
import { WikiTab } from './WikiTab';
import { RecordFormModal } from './RecordFormModal';
import { LocationDetailModal } from './LocationDetailModal';
import { ChestModal } from './ChestModal';
import { SnsShareModal } from './SnsShareModal';
import { playAddSound, playHoverSound } from '../lib/soundEngine';

interface WorldScreenProps {
  world: WorldWithMembers;
  onUpdateWorld: (updated: WorldWithMembers) => void;
}

export function WorldScreen({ world, onUpdateWorld }: WorldScreenProps) {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<LocationWithPhotos | null>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhotos | null>(null);
  const [showChestModal, setShowChestModal] = useState(false);
  const [snsLocation, setSnsLocation] = useState<LocationWithPhotos | null>(null);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await fetchLocations(world.id);
      setLocations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, [world.id]);

  const handleRecordSaved = (saved: LocationWithPhotos) => {
    setShowRecordModal(false);
    setLocationToEdit(null);
    loadLocations();
    // If it was being viewed in detail, update it
    if (selectedLocation && selectedLocation.id === saved.id) {
      setSelectedLocation(saved);
    }
  };

  const handleDeleteLocation = async (locId: string) => {
    await deleteLocation(locId);
    setSelectedLocation(null);
    loadLocations();
  };

  return (
    <div className="min-h-full pb-20 flex flex-col relative">
      {/* World Summary Header */}
      <WorldHeader world={world} />

      {/* Tabs Navigation (拠点・タイムライン / 冒険譚 Wiki) */}
      <WorldTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenCreateRecord={() => {
          setLocationToEdit(null);
          setShowRecordModal(true);
        }}
        recordCount={locations.length}
      />

      {/* Tab Panels */}
      {loading ? (
        <div className="py-16 text-center font-mono text-amber-400 space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs">探索ログをロード中 // LOADING...</p>
        </div>
      ) : (
        <>
          {activeTab === 'records' && (
            <TimelineRecordsTab
              world={world}
              locations={locations}
              onOpenCreate={() => {
                setLocationToEdit(null);
                setShowRecordModal(true);
              }}
              onOpenChest={() => setShowChestModal(true)}
              onSelectLocation={(loc) => setSelectedLocation(loc)}
              onOpenSns={(loc) => setSnsLocation(loc)}
            />
          )}

          {activeTab === 'wiki' && (
            <WikiTab
              world={world}
              locations={locations}
            />
          )}
        </>
      )}

      {/* Floating Action Button (FAB) for Add Record (Translucent glassmorphism with crisp readable text/icon) */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-8 z-30">
        <button
          type="button"
          onClick={() => {
            playAddSound();
            setLocationToEdit(null);
            setShowRecordModal(true);
          }}
          onMouseEnter={playHoverSound}
          title="新規記録を追加"
          className="flex items-center gap-2 px-4 py-2.5 sm:py-3 bg-[#0d1629]/90 hover:bg-[#152342] backdrop-blur-md text-amber-300 hover:text-amber-200 font-bold font-mono text-xs sm:text-sm border-2 border-amber-400/80 hover:border-amber-300 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.65),0_0_12px_rgba(245,158,11,0.25)] active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-amber-400/20 border border-amber-400 flex items-center justify-center">
            <Plus className="w-3.5 h-3.5 stroke-[3] text-amber-300" />
          </div>
          <span className="tracking-wide">記録を追加</span>
        </button>
      </div>

      {/* Record Creation / Quick Log Modal */}
      {showRecordModal && (
        <RecordFormModal
          world={world}
          locationToEdit={locationToEdit}
          onClose={() => {
            setShowRecordModal(false);
            setLocationToEdit(null);
          }}
          onSaved={handleRecordSaved}
        />
      )}

      {/* Location Detail Modal */}
      {selectedLocation && (
        <LocationDetailModal
          world={world}
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
          onEdit={(loc) => {
            setSelectedLocation(null);
            setLocationToEdit(loc);
            setShowRecordModal(true);
          }}
          onDelete={handleDeleteLocation}
          onOpenSns={(loc) => {
            setSelectedLocation(null);
            setSnsLocation(loc);
          }}
        />
      )}

      {/* Chest Gallery Modal */}
      {showChestModal && (
        <ChestModal
          world={world}
          locations={locations}
          onClose={() => setShowChestModal(false)}
          onSelectLocation={(loc) => {
            setShowChestModal(false);
            setSelectedLocation(loc);
          }}
        />
      )}

      {/* SNS (X) Share Modal */}
      {snsLocation && (
        <SnsShareModal
          world={world}
          location={snsLocation}
          onClose={() => setSnsLocation(null)}
        />
      )}
    </div>
  );
}
