import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Compass, Users, Check } from 'lucide-react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto, getPhotoUrl } from '@/lib/db';
import { playSaveSound, playCancelSound, playConfirmSound, playHoverSound, playInputFocusSound, playNewRecordSound } from '@/lib/sound';
import { LocationPhotoField } from '@/components/LocationPhotoField';

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
  const toggleMember = (id: string) => {
    playConfirmSound();
    const next = new Set(selectedMembers); if (next.has(id)) next.delete(id); else next.add(id); setSelectedMembers(next);
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

      <div>
        <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400"><Compass className="w-4 h-4" /><span>COORDINATES // 空間座標</span></span>
          <span className="text-[10px] text-slate-500 font-normal">FORMAT: X Y Z</span>
        </label>
        <input type="text" inputMode="numeric" value={coordsText} onChange={(e) => setCoordsText(e.target.value)} onFocus={playInputFocusSound} placeholder="100 64 -20" className="location-input text-base font-mono tabular-nums text-emerald-300 placeholder-slate-600" />
        {coordsError && <p className="mt-1 text-xs text-rose-400">{coordsError}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">LOCATION NAME // ロケーション名</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} onFocus={playInputFocusSound} placeholder="例: 始原のキャンプサイト" className="location-input text-sm text-slate-100 placeholder-slate-600" />
      </div>

      <LocationPhotoField
        preview={mainPreview}
        inputRef={fileInputRef}
        onSelect={handleMainSelect}
        onClear={clearMainPreview}
      />

      <button type="button" onClick={() => { setDetailOpen(!detailOpen); playConfirmSound(); }} onMouseEnter={playHoverSound} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-sm border border-sky-500/30 bg-sky-950/10 text-xs font-bold text-sky-400 hover:text-sky-300 hover:border-sky-400/60 transition-colors pt-2 cursor-pointer">
        <span className="flex items-center gap-1.5"><ChevronDown className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />EXPAND PARAMETERS // 詳細メモ・仲間</span><span className="text-[10px] text-slate-500">{detailOpen ? 'OPEN' : 'CLOSED'}</span>
      </button>

      {detailOpen && <div className="space-y-4 p-4 rounded-sm bg-[#090d16] border border-slate-800">
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">FIELD NOTES // 詳細メモ</label>
          <textarea value={detailMemo} onChange={(e) => setDetailMemo(e.target.value)} onFocus={playInputFocusSound} placeholder="この場所についての地形・資源・魔物などのメモ" rows={3} className="location-input resize-none text-xs leading-relaxed text-slate-200" />
        </div>
        {members.length > 0 && <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><Users className="w-4 h-4 text-cyan-400" />COMPANIONS // 同行メンバー</label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => { const checked = selectedMembers.has(m.id); return <button type="button" key={m.id} onClick={() => toggleMember(m.id)} onMouseEnter={playHoverSound} className={`min-h-[40px] px-3 py-1.5 rounded-sm text-xs font-mono border-2 transition-all cursor-pointer flex items-center gap-1.5 ${checked ? 'bg-cyan-950/50 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.18)] font-bold' : 'bg-[#0d1627] text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'}`}>{checked && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}{m.name}</button>; })}
          </div>
        </div>}
        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">TIMESTAMP // 記録日時</label>
          <input type="datetime-local" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} onFocus={playInputFocusSound} className="location-input text-xs" />
        </div>
      </div>}

      <div className="flex gap-3 pt-4 pb-1 border-t border-slate-800">
        <button type="button" onClick={() => { playCancelSound(); onCancel(); }} onMouseEnter={playHoverSound} className="flex-1 min-h-[44px] py-2.5 rounded-sm bg-[#141824] border-2 border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98] transition-all text-xs uppercase tracking-wider cursor-pointer">キャンセル</button>
        <button type="button" onClick={handleSubmit} onMouseEnter={playHoverSound} disabled={saving} className="flex-1 min-h-[44px] py-2.5 rounded-sm bg-amber-500 text-slate-950 font-black border-b-2 border-amber-700 shadow-[0_0_16px_rgba(245,158,11,0.22)] hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer">{saving ? 'SAVING // 保存中...' : editing ? '▶ 更新を記録' : '▶ 冒険の書に刻む'}</button>
      </div>
      <style>{`.location-input{width:100%;padding:.7rem .8rem;border-radius:.25rem;border:1px solid #334155;background:#090d16;color:#f1f5f9;outline:none;transition:border-color 160ms ease,box-shadow 160ms ease,background 160ms ease}.location-input::placeholder{color:#64748b}.location-input:focus{border-color:#38bdf8;background:#0d1627;box-shadow:0 0 0 1px #38bdf8,0 0 14px rgba(56,189,248,.15)}`}</style>
    </div>
  );
}

function toLocalInput(iso: string): string { const d = new Date(iso); const pad = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`; }
