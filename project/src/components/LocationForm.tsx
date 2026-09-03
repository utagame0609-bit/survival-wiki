import { useState } from 'react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto } from '@/lib/db';
import { playSaveSound, playInputFocusSound, playNewRecordSound } from '@/lib/sound';
import { LocationBasicFields } from '@/components/LocationBasicFields';
import { LocationPhotoField } from '@/components/LocationPhotoField';
import { LocationAdvancedFields } from '@/components/LocationAdvancedFields';
import { LocationFormActions } from '@/components/LocationFormActions';
import { useLocationMainPhoto } from '@/hooks/useLocationMainPhoto';

type SaveInput = {
  name: string;
  x: number;
  y: number;
  z: number;
  has_coordinates: boolean;
  detail_memo: string;
  created_at: string;
  member_ids: string[];
};

type Props = {
  worldId: string;
  members: WorldMember[];
  editing?: LocationWithPhotos | null;
  onSave: (input: SaveInput) => Promise<string>;
  onComplete: () => void;
  onCancel: () => void;
  saving: boolean;
};

export function LocationForm({ members, editing, onSave, onComplete, onCancel, saving }: Props) {
  const [coordsText, setCoordsText] = useState(
    editing?.has_coordinates ? formatCoords({ x: editing.x, y: editing.y, z: editing.z }) : '',
  );
  const [coordsError, setCoordsError] = useState('');
  const [name, setName] = useState(editing?.name ?? '');
  const [detailOpen, setDetailOpen] = useState(Boolean(editing));
  const [detailMemo, setDetailMemo] = useState(editing?.detail_memo ?? '');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(editing?.members.map((member) => member.id) ?? []),
  );
  const [createdAt, setCreatedAt] = useState(
    editing ? toLocalInput(editing.created_at) : toLocalInput(new Date().toISOString()),
  );
  const existingMain = editing?.photos.find((photo) => photo.is_main) ?? null;
  const [existingMainPhoto] = useState(existingMain);
  const {
    mainFile,
    mainPreview,
    fileInputRef,
    handleMainSelect,
    clearMainPreview,
  } = useLocationMainPhoto(existingMainPhoto);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setCoordsError('');

    if (!name.trim()) {
      setError('場所の名前（タイトル）を入力してください');
      return;
    }

    const trimmedCoords = coordsText.trim();
    const hasCoordinates = Boolean(trimmedCoords);
    const coords = hasCoordinates ? parseCoords(coordsText) : { x: 0, y: 0, z: 0 };
    if (!coords) {
      if (!detailOpen) setDetailOpen(true);
      setCoordsError('座標を入力する場合は「X Y Z」の3値で入力してください（例: 100 64 -20）');
      return;
    }

    try {
      const locationId = await onSave({
        name: name.trim(),
        x: coords.x,
        y: coords.y,
        z: coords.z,
        has_coordinates: hasCoordinates,
        detail_memo: detailMemo.trim(),
        created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
        member_ids: Array.from(selectedMembers),
      });

      if (mainFile) {
        if (existingMainPhoto) await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
        await uploadPhoto(locationId, mainFile, true);
      } else if (editing && !mainPreview && existingMainPhoto) {
        await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
      }

      if (editing) playSaveSound();
      else playNewRecordSound();
      onComplete();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="sfc-location-form p-4 sm:p-5 space-y-4 text-slate-100">
      {error && (
        <div className="p-3 rounded-lg bg-[#2A1218] border border-[#EF4444]/60 text-[#FCA5A5] text-xs flex items-center gap-2">
          <span className="font-black text-[#EF4444]">[!]</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3.5">
        <LocationBasicFields name={name} onNameChange={setName} />

        <div>
          <label className="block text-xs game-ui-font text-[#94A3B8] mb-1.5">
            体験メモ・発見の物語
          </label>
          <textarea
            value={detailMemo}
            onChange={(event) => setDetailMemo(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="その場所で起きた出来事、見つけた資材、周囲の状況などを自由にメモ..."
            rows={3}
            className="location-input w-full px-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none resize-none leading-relaxed"
          />
        </div>

        <LocationPhotoField
          preview={mainPreview}
          inputRef={fileInputRef}
          onSelect={handleMainSelect}
          onClear={clearMainPreview}
        />
      </div>

      <LocationAdvancedFields
        open={detailOpen}
        coordsText={coordsText}
        coordsError={coordsError}
        members={members}
        selectedMembers={selectedMembers}
        createdAt={createdAt}
        onToggleOpen={() => setDetailOpen((current) => !current)}
        onCoordsChange={setCoordsText}
        onCoordsError={setCoordsError}
        onToggleMember={(id) => {
          const next = new Set(selectedMembers);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          setSelectedMembers(next);
        }}
        onCreatedAtChange={setCreatedAt}
      />

      <LocationFormActions
        saving={saving}
        editing={Boolean(editing)}
        onCancel={onCancel}
        onSubmit={handleSubmit}
      />

      <style>{`.location-input{width:100%;border-radius:.375rem;border:1px solid #334155;background:#0b1018;color:#f8fafc;outline:none;transition:border-color 160ms ease,box-shadow 160ms ease,background 160ms ease}.location-input::placeholder{color:#64748b}.location-input:focus{border-color:#f59e0b;background:#0b1018;box-shadow:0 0 0 1px rgba(245,158,11,.15)}`}</style>
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
