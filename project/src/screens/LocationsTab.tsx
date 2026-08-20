import { useEffect, useRef, useState } from 'react';
import { Plus, MapPin, Trash2, Pencil, ChevronDown } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import { fetchLocations, createLocation, updateLocation, deleteLocation, getPhotoUrl } from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

export function LocationsTab({ world, reloadKey, onReload }: { world: WorldWithMembers; reloadKey: number; onReload: () => void }) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const loadRequestRef = useRef(0);

  const load = () => {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    fetchLocations(world.id)
      .then((nextLocations) => {
        if (requestId !== loadRequestRef.current) return;
        setLocations(nextLocations);
      })
      .catch((e) => {
        if (requestId !== loadRequestRef.current) return;
        setError(e.message);
      })
      .finally(() => {
        if (requestId !== loadRequestRef.current) return;
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, [world.id, reloadKey]);

  const handleSave = async (input: { name: string; x: number; y: number; z: number; detail_memo: string; created_at: string; member_ids: string[] }): Promise<string> => {
    setSaving(true);
    try {
      if (mode.type === 'edit') {
        await updateLocation(mode.location.id, input);
        return mode.location.id;
      }
      const loc = await createLocation(world.id, input);
      return loc.id;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = () => {
    setMode({ type: 'list' });
    onReload();
  };

  const handleDelete = async (loc: LocationWithPhotos) => {
    if (!confirm(`「${loc.name}」を削除しますか？`)) return;
    try {
      await deleteLocation(loc.id);
      setExpanded((prev) => (prev === loc.id ? null : prev));
      onReload();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (mode.type === 'create' || mode.type === 'edit') {
    return (
      <div className="min-h-full bg-stone-50">
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200">
          <div className="flex items-center justify-between px-4 h-12 max-w-3xl mx-auto">
            <button onClick={() => setMode({ type: 'list' })} className="text-sm text-stone-600 hover:text-stone-900">キャンセル</button>
            <span className="text-sm font-medium text-stone-900">{mode.type === 'edit' ? 'ロケーション編集' : 'ロケーション追加'}</span>
            <div className="w-16" />
          </div>
        </div>
        <LocationForm
          worldId={world.id}
          members={world.members}
          editing={mode.type === 'edit' ? mode.location : null}
          onSave={handleSave}
          onComplete={handleComplete}
          onCancel={() => setMode({ type: 'list' })}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <button onClick={() => setMode({ type: 'create' })} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all">
          <Plus className="w-5 h-5" /> ロケーションを追加
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーションを読み込み中" />}
      {!loading && locations.length === 0 && <EmptyState message="ロケーションがありません。追加ボタンから記録を始めよう。" />}
      {!loading && locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((loc) => (
            <LocationCard key={loc.id} loc={loc} isExpanded={expanded === loc.id} onToggle={() => setExpanded((prev) => (prev === loc.id ? null : loc.id))} onEdit={() => setMode({ type: 'edit', location: loc })} onDelete={() => handleDelete(loc)} />
          ))}
        </div>
      )}
    </div>
  );
}

function LocationCard({ loc, isExpanded, onToggle, onEdit, onDelete }: { loc: LocationWithPhotos; isExpanded: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void }) {
  const mainPhoto = loc.photos.find((p) => p.is_main);
  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full text-left active:scale-[0.99] transition-transform">
        <div className="flex gap-3 p-3">
          {mainPhoto ? <img src={getPhotoUrl(mainPhoto.storage_path)} alt={loc.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" /> : <div className="w-20 h-20 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0"><MapPin className="w-8 h-8 text-stone-300" /></div>}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" /><h3 className="font-semibold text-stone-900 truncate">{loc.name}</h3></div>
            <p className="text-sm text-stone-500 font-mono mt-0.5">X {loc.x}　Y {loc.y}　Z {loc.z}</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-stone-400 self-center flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {isExpanded && <div className="border-t border-stone-100 px-4 py-3"><div className="flex gap-3"><button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 active:scale-[0.98] transition-all"><Pencil className="w-4 h-4" /> 編集</button><button onClick={onDelete} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-red-500 border border-red-200 font-medium hover:bg-red-50 active:scale-[0.98] transition-all"><Trash2 className="w-4 h-4" /> 削除</button></div></div>}
    </div>
  );
}
