import { useEffect, useState } from 'react';
import { Plus, MapPin, Trash2, Pencil, ChevronDown } from 'lucide-react';
import type { WorldWithMembers, LocationWithPhotos } from '@/lib/types';
import {
  fetchLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  getPhotoUrl,
} from '@/lib/db';
import { LocationForm } from '@/components/LocationForm';
import { Spinner, ErrorBanner, EmptyState } from '@/components/Feedback';

type Mode =
  | { type: 'list' }
  | { type: 'create' }
  | { type: 'edit'; location: LocationWithPhotos };

export function LocationsTab({
  world,
  reloadKey,
  onReload,
}: {
  world: WorldWithMembers;
  reloadKey: number;
  onReload: () => void;
}) {
  const [locations, setLocations] = useState<LocationWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<Mode>({ type: 'list' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = () => {
    setLoading(true);
    fetchLocations(world.id)
      .then(setLocations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [world.id, reloadKey]);

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
      let locationId: string;
      if (mode.type === 'edit') {
        await updateLocation(mode.location.id, input);
        locationId = mode.location.id;
      } else {
        const loc = await createLocation(world.id, input);
        locationId = loc.id;
      }
      setMode({ type: 'list' });
      onReload();
      return locationId;
    } catch (e) {
      setError((e as Error).message);
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (loc: LocationWithPhotos) => {
    if (!confirm(`「${loc.name}」を削除しますか？`)) return;
    try {
      await deleteLocation(loc.id);
      setExpanded((prev) => {
        const next = new Set(prev);
        next.delete(loc.id);
        return next;
      });
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
            <button
              onClick={() => setMode({ type: 'list' })}
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              キャンセル
            </button>
            <span className="text-sm font-medium text-stone-900">
              {mode.type === 'edit' ? 'ロケーション編集' : 'ロケーション追加'}
            </span>
            <div className="w-16" />
          </div>
        </div>
        <LocationForm
          worldId={world.id}
          members={world.members}
          editing={mode.type === 'edit' ? mode.location : null}
          onSave={handleSave}
          onCancel={() => setMode({ type: 'list' })}
          saving={saving}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 max-w-3xl mx-auto">
      <button
        onClick={() => setMode({ type: 'create' })}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all mb-4"
      >
        <Plus className="w-5 h-5" />
        ロケーションを追加
      </button>

      {error && <ErrorBanner message={error} />}
      {loading && <Spinner label="ロケーションを読み込み中" />}
      {!loading && locations.length === 0 && (
        <EmptyState message="ロケーションがありません。追加ボタンから記録を始めよう。" />
      )}
      {!loading && locations.length > 0 && (
        <div className="space-y-3">
          {locations.map((loc) => (
            <LocationCard
              key={loc.id}
              loc={loc}
              isExpanded={expanded.has(loc.id)}
              onToggle={() =>
                setExpanded((prev) => {
                  const next = new Set(prev);
                  if (next.has(loc.id)) next.delete(loc.id);
                  else next.add(loc.id);
                  return next;
                })
              }
              onEdit={() => setMode({ type: 'edit', location: loc })}
              onDelete={() => handleDelete(loc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LocationCard({
  loc,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  loc: LocationWithPhotos;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const mainPhoto = loc.photos.find((p) => p.is_main);
  const nearbyPhotos = loc.photos.filter((p) => !p.is_main).slice(0, 5);
  const createdAt = new Date(loc.created_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-2xl bg-white border border-stone-200 shadow-sm overflow-hidden">
      <button onClick={onToggle} className="w-full text-left active:scale-[0.99] transition-transform">
        <div className="flex gap-3 p-3">
          {mainPhoto ? (
            <img
              src={getPhotoUrl(mainPhoto.storage_path)}
              alt={loc.name}
              className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-8 h-8 text-stone-300" />
            </div>
          )}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <h3 className="font-semibold text-stone-900 truncate">{loc.name}</h3>
            </div>
            <p className="text-sm text-stone-500 font-mono mt-0.5">
              {loc.x}, {loc.y}, {loc.z}
            </p>
            {loc.members.length > 0 && (
              <p className="text-xs text-stone-400 mt-1 truncate">
                {loc.members.map((m) => m.name).join('・')}
              </p>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-stone-400 self-center flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-stone-100 px-4 pb-4 space-y-4">
          {mainPhoto && (
            <img
              src={getPhotoUrl(mainPhoto.storage_path)}
              alt={loc.name}
              className="w-full max-h-80 object-cover rounded-2xl mt-4"
            />
          )}

          {loc.detail_memo && (
            <div className="pt-4">
              <h3 className="text-sm font-medium text-stone-500 mb-1">詳細メモ</h3>
              <p className="text-stone-800 whitespace-pre-wrap">{loc.detail_memo}</p>
            </div>
          )}

          {loc.members.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-2">関連メンバー</h3>
              <div className="flex flex-wrap gap-2">
                {loc.members.map((member) => (
                  <span key={member.id} className="px-3 py-1.5 rounded-full bg-stone-100 text-sm text-stone-700">
                    {member.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {nearbyPhotos.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-stone-500 mb-3">近隣写真</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {nearbyPhotos.map((photo) => (
                  <img
                    key={photo.id}
                    src={getPhotoUrl(photo.storage_path)}
                    alt=""
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-stone-400">
            登録日時 {createdAt}
          </p>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-800 text-white font-medium hover:bg-stone-900 active:scale-[0.98] transition-all"
            >
              <Pencil className="w-4 h-4" /> 編集
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-red-500 border border-red-200 font-medium hover:bg-red-50 active:scale-[0.98] transition-all"
            >
              <Trash2 className="w-4 h-4" /> 削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
