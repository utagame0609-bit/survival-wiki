import React, { useState, useTransition, useDeferredValue } from 'react';
import { Plus, Search, MapPin, Edit3, Trash2, Camera, Navigation, Sparkles } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { deleteLocation, createLocation, updateLocation, getPhotoUrl } from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { ChestModal } from '@/components/ChestModal';
import {
  playConfirmSound,
  playCancelSound,
  playDeleteSound,
  playChestOpenSound,
  playModalOpenSound,
  playModalCloseSound,
} from '@/lib/sound';

type Mode =
  | { type: 'list' }
  | { type: 'new' }
  | { type: 'edit'; location: LocationWithPhotos };

export function LocationsTab({
  world,
  locations,
  onRefresh,
  onNavigateToTimeline,
}: {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  onRefresh: () => Promise<void>;
  onNavigateToTimeline?: (locationId: string) => void;
}) {
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationWithPhotos | null>(null);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const deferredSearch = useDeferredValue(search);

  // Extract all photos for treasure chest
  const collectionItems = React.useMemo(() => {
    const items: { location: LocationWithPhotos; storagePath: string }[] = [];
    locations.forEach((loc) => {
      loc.photos.forEach((photo) => {
        items.push({ location: loc, storagePath: photo.storage_path });
      });
    });
    return items;
  }, [locations]);

  // Filter locations
  const filteredLocations = React.useMemo(() => {
    return locations.filter((loc) => {
      const matchSearch =
        !deferredSearch ||
        loc.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        (loc.detail_memo && loc.detail_memo.toLowerCase().includes(deferredSearch.toLowerCase()));

      const matchMember =
        selectedMember === 'all' ||
        loc.members.some((m) => m.id === selectedMember);

      return matchSearch && matchMember;
    });
  }, [locations, deferredSearch, selectedMember]);

  const handleSave = async (input: {
    name: string;
    x: number;
    y: number;
    z: number;
    detail_memo: string;
    created_at: string;
    member_ids: string[];
  }): Promise<string> => {
    setSaving(true);
    try {
      if (mode.type === 'edit') {
        const updated = await updateLocation(mode.location.id, input);
        return updated.id;
      } else {
        const created = await createLocation(world.id, input);
        return created.id;
      }
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    await onRefresh();
    setMode({ type: 'list' });
  };

  const handleDelete = async (loc: LocationWithPhotos) => {
    if (!window.confirm(`「${loc.name}」を削除しますか？`)) return;
    playDeleteSound();
    await deleteLocation(loc.id);
    await onRefresh();
    if (selectedLocation?.id === loc.id) {
      setSelectedLocation(null);
    }
  };

  const openNewForm = () => {
    playModalOpenSound();
    setMode({ type: 'new' });
  };

  const openEditForm = (loc: LocationWithPhotos) => {
    playModalOpenSound();
    setMode({ type: 'edit', location: loc });
  };

  const closeModal = () => {
    playModalCloseSound();
    setMode({ type: 'list' });
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between bg-[#1e2330] p-3 sm:p-4 border-2 border-[#2d3548] shadow-md">
        <div className="flex-1 flex items-center gap-2 bg-[#12151f] border border-slate-700 px-3.5 py-2.5 focus-within:border-amber-500 min-h-[44px]">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => startTransition(() => setSearch(e.target.value))}
            placeholder="ロケーション名やメモを検索..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="min-h-[32px] min-w-[32px] flex items-center justify-center text-xs text-slate-400 hover:text-white"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {world.members.length > 0 && (
            <select
              value={selectedMember}
              onChange={(e) => {
                playConfirmSound();
                setSelectedMember(e.target.value);
              }}
              className="min-h-[44px] px-3 py-2.5 bg-[#12151f] border border-slate-700 text-slate-200 text-xs sm:text-sm outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">全メンバー ({world.members.length})</option>
              {world.members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => {
              playChestOpenSound();
              setCollectionOpen(true);
            }}
            className="min-h-[44px] px-3.5 py-2.5 bg-[#12151f] border border-amber-500/50 text-amber-400 text-xs sm:text-sm font-bold hover:bg-amber-500/15 flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">CHEST</span>
            <span className="font-mono">({collectionItems.length})</span>
          </button>

          <button
            type="button"
            onClick={openNewForm}
            className="min-h-[44px] flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 bg-amber-500 text-black text-xs sm:text-sm font-black border-b-3 border-amber-700 hover:bg-amber-400 active:border-b-0 active:translate-y-0.5 shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ 新規記録</span>
          </button>
        </div>
      </div>

      {/* Locations Grid */}
      {filteredLocations.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-[#2d3548] bg-[#141824]/60 p-6">
          <MapPin className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <p className="text-base font-bold text-white">ロケーションがありません</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {search ? '検索条件に一致する記録が見つかりませんでした。' : '「+ 新規記録」から最初の拠点を登録してください。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((loc, idx) => (
            <LocationCard
              key={loc.id}
              index={idx + 1}
              location={loc}
              onSelect={() => {
                playConfirmSound();
                setSelectedLocation(loc);
              }}
              onEdit={() => openEditForm(loc)}
              onDelete={() => handleDelete(loc)}
              onTimeline={() => onNavigateToTimeline?.(loc.id)}
            />
          ))}
        </div>
      )}

      {/* Modal: New / Edit */}
      {mode.type !== 'list' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 bg-black/85 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
            <div className="px-4 sm:px-5 py-3 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xs px-2.5 py-0.5 border border-amber-500/50 bg-amber-500/15 text-amber-300 font-bold font-mono">
                  {mode.type === 'edit' ? 'EDIT' : 'NEW'}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {mode.type === 'edit' ? 'ロケーション編集' : '新規拠点記録'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer"
                aria-label="閉じる"
              >
                ×
              </button>
            </div>
            <LocationForm
              worldId={world.id}
              members={world.members}
              editing={mode.type === 'edit' ? mode.location : null}
              onSave={handleSave}
              onComplete={handleComplete}
              onCancel={closeModal}
              saving={saving}
            />
          </div>
        </div>
      )}

      {/* Modal: Detail View */}
      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          onClose={() => {
            playModalCloseSound();
            setSelectedLocation(null);
          }}
          onEdit={() => {
            const loc = selectedLocation;
            setSelectedLocation(null);
            openEditForm(loc);
          }}
          onDelete={() => handleDelete(selectedLocation)}
          onTimeline={() => {
            const loc = selectedLocation;
            setSelectedLocation(null);
            onNavigateToTimeline?.(loc.id);
          }}
        />
      )}

      {/* Modal: Treasure Chest */}
      {collectionOpen && (
        <ChestModal
          collectionItems={collectionItems}
          onClose={() => setCollectionOpen(false)}
          onOpenLocation={(loc) => setSelectedLocation(loc)}
        />
      )}
    </div>
  );
}

function LocationCard({
  index,
  location,
  onSelect,
  onEdit,
  onDelete,
  onTimeline,
}: {
  index: number;
  location: LocationWithPhotos;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTimeline: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState('');

  React.useEffect(() => {
    const main = location.photos.find((p) => p.is_main) || location.photos[0];
    if (main) {
      getPhotoUrl(main.storage_path).then(setPhotoUrl).catch(() => {});
    }
  }, [location.photos]);

  const locCode = String(index).padStart(2, '0');

  return (
    <div
      onClick={onSelect}
      className="group relative bg-[#1e2330] border-2 border-[#2d3548] hover:border-amber-500/80 p-4 sm:p-4.5 flex flex-col justify-between transition-all duration-150 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] cursor-pointer"
    >
      <div>
        {/* Photo preview banner if available */}
        {photoUrl && (
          <div className="w-full h-36 mb-3 overflow-hidden bg-[#12151f] border border-[#2d3548]">
            <img src={photoUrl} alt={location.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pixelated" />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-2 py-0.5 border border-cyan-500/40 shrink-0 font-mono">
              LOC_{locCode}
            </span>
            <h3 className="font-bold text-base text-white group-hover:text-amber-300 truncate">
              {location.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono shrink-0">
            {new Date(location.created_at).toLocaleDateString('ja-JP')}
          </span>
        </div>

        {/* Coordinates */}
        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[#12151f] border border-slate-700 text-xs text-emerald-400 font-bold mb-3 font-mono">
          <Navigation className="w-3.5 h-3.5 text-amber-400" />
          <span>X: {location.x}</span>
          <span className="text-slate-600">|</span>
          <span>Y: {location.y}</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-300">Z: {location.z}</span>
        </div>

        {/* Memo snippet */}
        {location.detail_memo && (
          <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed mb-3 bg-[#141824]/80 p-2.5 border border-[#2d3548]">
            {location.detail_memo}
          </p>
        )}

        {/* Members */}
        {location.members.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {location.members.map((m) => (
              <span key={m.id} className="text-xs px-2 py-0.5 bg-[#12151f] border border-cyan-500/40 text-cyan-300 font-medium">
                @{m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Action footer */}
      <div className="pt-3 border-t border-[#2d3548] flex items-center justify-between text-xs" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onTimeline}
          className="min-h-[36px] text-cyan-300 hover:text-cyan-200 font-bold hover:underline flex items-center gap-1 text-xs cursor-pointer"
        >
          タイムライン →
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            title="編集"
            aria-label={`${location.name}を編集`}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-amber-400 bg-[#12151f] border border-slate-700 hover:border-amber-500 cursor-pointer transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="削除"
            aria-label={`${location.name}を削除`}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-red-400 hover:text-red-300 bg-[#12151f] border border-slate-700 hover:border-red-600 cursor-pointer transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function LocationDetailModal({
  location,
  onClose,
  onEdit,
  onDelete,
  onTimeline,
}: {
  location: LocationWithPhotos;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTimeline: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm text-xs sm:text-sm font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden motion-safe:animate-[modal-enter_180ms_cubic-bezier(.22,.8,.35,1)]">
        <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-b-2 border-[#2d3548] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white truncate">{location.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white text-lg cursor-pointer"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Coordinates Bar */}
          <div className="p-3.5 bg-[#12151f] border border-slate-700 flex items-center justify-around text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">X COORDINATE</div>
              <div className="text-base font-bold text-emerald-400 font-mono">{location.x}</div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Y ELEVATION</div>
              <div className="text-base font-bold text-emerald-400 font-mono">{location.y}</div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Z COORDINATE</div>
              <div className="text-base font-bold text-cyan-300 font-mono">{location.z}</div>
            </div>
          </div>

          {/* Details Memo */}
          {location.detail_memo && (
            <div className="p-4 bg-[#141824] border border-[#2d3548]">
              <h4 className="text-xs text-amber-400 font-bold uppercase mb-2">探索・観測メモ</h4>
              <p className="text-slate-100 text-sm leading-relaxed whitespace-pre-wrap">{location.detail_memo}</p>
            </div>
          )}

          {/* Member badges */}
          {location.members.length > 0 && (
            <div>
              <h4 className="text-xs text-cyan-400 font-bold uppercase mb-2">同行メンバー</h4>
              <div className="flex flex-wrap gap-2">
                {location.members.map((m) => (
                  <span key={m.id} className="px-2.5 py-1 bg-[#12151f] border border-cyan-500/40 text-cyan-300 text-xs font-medium">
                    @{m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-slate-400 text-right font-mono">
            記録日時: {new Date(location.created_at).toLocaleString('ja-JP')}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-5 py-3.5 bg-[#161a24] border-t border-[#2d3548] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onTimeline}
            className="min-h-[40px] px-3.5 py-2 bg-[#12151f] text-cyan-300 border border-cyan-500/50 hover:border-cyan-400 font-bold text-xs cursor-pointer"
          >
            タイムライン表示
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="min-h-[40px] px-3.5 py-2 bg-[#12151f] text-slate-200 border border-slate-700 hover:border-amber-500 hover:text-amber-400 font-bold text-xs cursor-pointer"
            >
              編集
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="min-h-[40px] px-3.5 py-2 bg-red-950/50 text-red-300 border border-red-800 hover:bg-red-900/60 font-bold text-xs cursor-pointer"
            >
              削除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
