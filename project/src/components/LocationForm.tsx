import { useEffect, useRef, useState } from 'react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto, getPhotoUrl } from '@/lib/db';
import { playSaveSound, playCancelSound, playHoverSound, playInputFocusSound, playNewRecordSound } from '@/lib/sound';
import { LocationBasicFields } from '@/components/LocationBasicFields';
import { LocationPhotoField } from '@/components/LocationPhotoField';
import { LocationAdvancedFields } from '@/components/LocationAdvancedFields';
import { LocationFormActions } from '@/components/LocationFormActions';

type SaveInput = {
  name: string; x: number; y: number; z: number; detail_memo: string; created_at: string; member_ids: string[];
};
type Props = {
  worldId: string; members: WorldMember[]; editing?: LocationWithPhotos | null;
  onSave: (input: SaveInput) => Promise<string>; onComplete: () => void; onCancel: () => void; saving: boolean;
};

export function LocationForm({ members, editing, onSave, onComplete, onCancel, saving }: Props) {
  const [coordsText, setCoordsText] = useState(editing ? formatCoords({ x: editing.x, y: editing.y, z: editing.z }) : '');
  const [coordsError, setCoordsError] = useState('');
  const [name, setName] = useState(editing?.name ?? '');
  const [detailOpen, setDetailOpen] = useState(Boolean(editing));
  const [detailMemo, setDetailMemo] = useState(editing?.detail_memo ?? '');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(editing?.members.map((m) => m.id) ?? []));
  const [createdAt, setCreatedAt] = useState(editing ? toLocalInput(editing.created_at) : toLocalInput(new Date().toISOString()));
  const existingMain = editing?.photos.find((p) => p.is_main) ?? null;
  const [existingMainPhoto] = useState(existingMain);
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    if (!existingMainPhoto) { setMainPreview(null); return () => { active = false; }; }
    getPhotoUrl(existingMainPhoto.storage_path).then((url) => {
      if (active) setMainPreview(url); else if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    }).catch(() => { if (active) setMainPreview(null); });
    return () => { active = false; setMainPreview((current) => { if (current?.startsWith('blob:')) URL.revokeObjectURL(current); return null; }); };
  }, [existingMainPhoto]);

  const handleMainSelect = (file: File | null) => {
    if (!file) return;
    setMainPreview((current) => { if (current?.startsWith('blob:')) URL.revokeObjectURL(current); return URL.createObjectURL(file); });
    setMainFile(file);
  };
  const clearMainPreview = () => {
    setMainFile(null);
    setMainPreview((current) => { if (current?.startsWith('blob:')) URL.revokeObjectURL(current); return null; });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('ロケーション名を入力してください'); return; }
    const coords = parseCoords(coordsText);
    if (!coords) { setCoordsError('座標を「X Y Z」の形式で入力してください（例: 100 64 -20）'); return; }
    setCoordsError('');
    try {
      const locationId = await onSave({ name, x: coords.x, y: coords.y, z: coords.z, detail_memo: detailMemo, created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(), member_ids: Array.from(selectedMembers) });
      if (mainFile) {
        if (existingMainPhoto) await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
        await uploadPhoto(locationId, mainFile, true);
      } else if (editing && !mainPreview && existingMainPhoto) {
        await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
      }
      if (editing) playSaveSound(); else playNewRecordSound();
      onComplete();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="px-4 sm:px-5 py-4 sm:py-5 max-w-3xl mx-auto space-y-4 text-slate-100 font-mono">
      {error && <div className="p-3 rounded-sm bg-rose-950/50 border-2 border-rose-500/60 text-rose-200 text-xs shadow-[0_0_14px_rgba(244,63,94,0.15)] flex items-center gap-2"><span className="font-black text-rose-400">[!]</span><span>{error}</span></div>}

      <LocationBasicFields
        coordsText={coordsText}
        coordsError={coordsError}
        name={name}
        onCoordsChange={setCoordsText}
        onNameChange={setName}
      />

      <LocationPhotoField
        preview={mainPreview}
        inputRef={fileInputRef}
        onSelect={handleMainSelect}
        onClear={clearMainPreview}
      />

      <LocationAdvancedFields
        open={detailOpen}
        detailMemo={detailMemo}
        members={members}
        selectedMembers={selectedMembers}
        createdAt={createdAt}
        onToggleOpen={() => setDetailOpen((current) => !current)}
        onDetailMemoChange={setDetailMemo}
        onToggleMember={(id) => {
          const next = new Set(selectedMembers);
          if (next.has(id)) next.delete(id); else next.add(id);
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

      <style>{`.location-input{width:100%;padding:.7rem .8rem;border-radius:.25rem;border:1px solid #334155;background:#090d16;color:#f1f5f9;outline:none;transition:border-color 160ms ease,box-shadow 160ms ease,background 160ms ease}.location-input::placeholder{color:#64748b}.location-input:focus{border-color:#38bdf8;background:#0d1627;box-shadow:0 0 0 1px #38bdf8,0 0 14px rgba(56,189,248,.15)}`}</style>
    </div>
  );
}

function toLocalInput(iso: string): string { const d = new Date(iso); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
