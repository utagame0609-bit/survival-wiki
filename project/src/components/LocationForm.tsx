import { useRef, useState } from 'react';
import { ChevronDown, Camera, X } from 'lucide-react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto, getPhotoUrl } from '@/lib/db';

type SaveInput = {
  name: string;
  x: number;
  y: number;
  z: number;
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
  const [mainPreview, setMainPreview] = useState<string | null>(existingMain ? getPhotoUrl(existingMain.storage_path) : null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMainSelect = (file: File | null) => {
    if (!file) return;
    setMainFile(file);
    setMainPreview(URL.createObjectURL(file));
  };

  const toggleMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedMembers(next);
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) {
      setError('ロケーション名を入力してください');
      return;
    }
    const coords = parseCoords(coordsText);
    if (!coords) {
      setCoordsError('座標を「X Y Z」の形式で入力してください（例: 100 64 -20）');
      return;
    }
    setCoordsError('');

    try {
      const locationId = await onSave({ name, x: coords.x, y: coords.y, z: coords.z, detail_memo: detailMemo, created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(), member_ids: Array.from(selectedMembers) });
      if (mainFile) {
        if (existingMainPhoto) await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
        await uploadPhoto(locationId, mainFile, true);
      } else if (editing && !mainPreview && existingMainPhoto) {
        await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
      }
      onComplete();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-[#3a3d34] bg-[#20221d] text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/70';

  return (
    <div className="px-4 py-3 max-w-3xl mx-auto space-y-3 pb-3 bg-[#1b1c18] text-stone-100">
      {error && <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-300 text-sm">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">座標</label>
        <input type="text" inputMode="numeric" value={coordsText} onChange={(e) => setCoordsText(e.target.value)} placeholder="100 64 -20" className={`${inputClass} text-lg font-mono`} />
        {coordsError && <p className="mt-1 text-xs text-red-400">{coordsError}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">ロケーション名</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 拠点" className={inputClass} />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-1">メイン写真</label>
        {mainPreview ? (
          <div className="relative">
            <img src={mainPreview} alt="メイン写真" className="w-full h-44 object-cover rounded-xl" />
            <button onClick={() => { setMainFile(null); setMainPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button onClick={() => fileInputRef.current?.click()} className="w-full h-28 rounded-xl border-2 border-dashed border-[#3a3d34] bg-[#20221d] flex flex-col items-center justify-center text-stone-500 hover:border-emerald-500 hover:text-emerald-400 transition-colors"><Camera className="w-8 h-8 mb-1" /><span className="text-sm">撮影・選択</span></button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleMainSelect(e.target.files?.[0] ?? null)} />
      </div>
      <button onClick={() => setDetailOpen(!detailOpen)} className="flex items-center gap-1 text-sm font-medium text-stone-400 hover:text-stone-100 transition-colors"><ChevronDown className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />詳細{detailOpen ? '▲' : '▼'}</button>
      {detailOpen && <div className="space-y-3 p-3 rounded-2xl bg-[#20221d] border border-[#34372f]"><div><label className="block text-sm font-medium text-stone-300 mb-1">詳細メモ</label><textarea value={detailMemo} onChange={(e) => setDetailMemo(e.target.value)} placeholder="この場所についてのメモ" rows={3} className={`${inputClass} py-2.5 resize-none`} /></div>{members.length > 0 && <div><label className="block text-sm font-medium text-stone-300 mb-1">関連メンバー</label><div className="flex flex-wrap gap-2">{members.map((m) => { const checked = selectedMembers.has(m.id); return <button key={m.id} onClick={() => toggleMember(m.id)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${checked ? 'bg-emerald-700 text-white border-emerald-600' : 'bg-[#292b24] text-stone-300 border-[#3a3d34] hover:bg-[#34382e]'}`}>{m.name}</button>; })}</div></div>}<div><label className="block text-sm font-medium text-stone-300 mb-1">作成日時</label><input type="datetime-local" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} className={`${inputClass} py-2.5`} /></div></div>}
      <div className="flex gap-3 pt-1"><button onClick={onCancel} className="flex-1 py-2.5 rounded-2xl bg-[#292b24] border border-[#3a3d34] text-stone-300 font-medium hover:bg-[#34382e] active:scale-[0.98] transition-all">キャンセル</button><button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-2xl bg-emerald-700 text-white font-medium shadow-sm hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50">{saving ? '保存中...' : '保存'}</button></div>
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
