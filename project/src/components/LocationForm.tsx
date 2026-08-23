import { useRef, useState } from 'react';
import { ChevronDown, Camera, X } from 'lucide-react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto, getPhotoUrl } from '@/lib/db';
import { playSaveSound } from '@/lib/sound';

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
      playSaveSound();
      onComplete();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="px-5 py-5 max-w-3xl mx-auto space-y-4 text-zinc-100">
      {error && <div className="p-3 rounded-xl bg-red-950/35 border border-red-900/60 text-red-300 text-sm">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">座標</label>
        <input type="text" inputMode="numeric" value={coordsText} onChange={(e) => setCoordsText(e.target.value)} placeholder="100 64 -20" className="modal-input text-lg font-mono tabular-nums" />
        {coordsError && <p className="mt-1 text-xs text-red-400">{coordsError}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">ロケーション名</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: 拠点" className="modal-input" />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1.5">メイン写真</label>
        {mainPreview ? (
          <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_0_14px_rgba(0,0,0,0.18)]">
            <img src={mainPreview} alt="メイン写真" className="w-full h-44 object-cover" />
            <button type="button" onClick={() => { setMainFile(null); setMainPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-950/85 border border-zinc-700 text-zinc-300 hover:text-red-300 hover:border-red-900/60 transition-colors" aria-label="写真を削除"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => fileInputRef.current?.click()} className="group w-full h-28 rounded-xl border border-zinc-700/80 bg-zinc-900/88 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 transition-all"><Camera className="w-8 h-8 mb-1 group-hover:scale-105 transition-transform" /><span className="text-sm">撮影・選択</span></button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleMainSelect(e.target.files?.[0] ?? null)} />
      </div>

      <button type="button" onClick={() => setDetailOpen(!detailOpen)} className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"><ChevronDown className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />詳細{detailOpen ? '▲' : '▼'}</button>

      {detailOpen && (
        <div className="space-y-4 p-4 rounded-xl bg-zinc-950/30 border border-zinc-800">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">詳細メモ</label>
            <textarea value={detailMemo} onChange={(e) => setDetailMemo(e.target.value)} placeholder="この場所についてのメモ" rows={3} className="modal-input resize-none" />
          </div>
          {members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">関連メンバー</label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => {
                  const checked = selectedMembers.has(m.id);
                  return <button type="button" key={m.id} onClick={() => toggleMember(m.id)} className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${checked ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40' : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'}`}>{m.name}</button>;
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">作成日時</label>
            <input type="datetime-local" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} className="modal-input" />
          </div>
        </div>
      )}

      <div className="flex gap-2 px-0 py-4 border-t border-zinc-800/90 bg-zinc-950/30">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-600 active:scale-[0.98] transition-all">キャンセル</button>
        <button type="button" onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_16px_rgba(16,185,129,0.08)] hover:bg-emerald-500/15 hover:border-emerald-400/60 active:scale-[0.98] transition-all disabled:opacity-50">{saving ? '保存中...' : '保存'}</button>
      </div>

      <style>{`
        .modal-input {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(63, 63, 70, 0.9);
          background: rgba(24, 24, 27, 0.88);
          color: #f4f4f5;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .modal-input::placeholder { color: #71717a; }
        .modal-input:focus {
          border-color: rgba(16, 185, 0.75);
          background: rgba(24, 24, 27, 0.96);
          box-shadow: 0 0 0 2px rgba(16, 185, 0, 0.12), 0 0 14px rgba(16, 185, 0, 0.05);
        }
      `}</style>
    </div>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
