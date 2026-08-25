import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Camera, X, Compass } from 'lucide-react';
import type { WorldMember, LocationWithPhotos } from '@/lib/types';
import { parseCoords, formatCoords } from '@/lib/coords';
import { uploadPhoto, deletePhoto, getPhotoUrl } from '@/lib/db';
import { playAddSound, playSaveSound, playCancelSound } from '@/lib/sound';

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
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    if (!existingMainPhoto) {
      setMainPreview(null);
      return () => {
        active = false;
      };
    }

    getPhotoUrl(existingMainPhoto.storage_path)
      .then((url) => {
        if (active) {
          setMainPreview(url);
        } else if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      })
      .catch(() => {
        if (active) setMainPreview(null);
      });

    return () => {
      active = false;
      setMainPreview((current) => {
        if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
        return null;
      });
    };
  }, [existingMainPhoto]);

  const handleMainSelect = (file: File | null) => {
    if (!file) return;
    setMainPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setMainFile(file);
  };

  const clearMainPreview = () => {
    setMainFile(null);
    setMainPreview((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      const locationId = await onSave({
        name,
        x: coords.x,
        y: coords.y,
        z: coords.z,
        detail_memo: detailMemo,
        created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString(),
        member_ids: Array.from(selectedMembers),
      });
      if (mainFile) {
        if (existingMainPhoto) await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
        await uploadPhoto(locationId, mainFile, true);
      } else if (editing && !mainPreview && existingMainPhoto) {
        await deletePhoto(existingMainPhoto.id, existingMainPhoto.storage_path);
      }
      if (editing) {
        playSaveSound();
      } else {
        playAddSound();
      }
      onComplete();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="px-5 py-5 max-w-3xl mx-auto space-y-4 text-slate-100 font-mono">
      {error && (
        <div className="p-3 rounded-sm bg-rose-950/40 border border-rose-500/60 text-rose-300 text-xs font-mono shadow-[0_0_12px_rgba(244,63,94,0.15)] flex items-center gap-2">
          <span className="text-rose-400 font-bold">[!]</span>
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>COORDINATES // 空間座標</span>
          </span>
          <span className="text-[10px] text-slate-500 font-normal">FORMAT: X Y Z</span>
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={coordsText}
          onChange={(e) => setCoordsText(e.target.value)}
          placeholder="100 64 -20"
          className="modal-input text-base font-mono tabular-nums text-emerald-300 placeholder-slate-600"
        />
        {coordsError && <p className="mt-1 text-xs text-rose-400 font-mono">{coordsError}</p>}
      </div>

      <div>
        <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase tracking-wider">
          LOCATION NAME // ロケーション名
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 始原のキャンプサイト"
          className="modal-input text-sm text-slate-100 placeholder-slate-600"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
          TACTICAL PHOTO // 記録写真
        </label>
        {mainPreview ? (
          <div className="relative overflow-hidden rounded-sm border-2 border-slate-700 bg-[#050a14] shadow-md group">
            <img src={mainPreview} alt="メイン写真" className="w-full h-44 object-cover" />
            <div className="absolute inset-0 border border-emerald-500/20 pointer-events-none" />
            <button
              type="button"
              onClick={clearMainPreview}
              className="absolute top-2 right-2 p-1.5 rounded-sm bg-[#0a1120]/90 border border-slate-700 text-slate-300 hover:text-rose-400 hover:border-rose-500 transition-colors shadow-md"
              aria-label="写真を削除"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group w-full h-28 rounded-sm border-2 border-dashed border-slate-700 bg-[#090d16] flex flex-col items-center justify-center text-slate-400 hover:border-amber-500 hover:text-amber-400 hover:bg-[#0d1627] transition-all"
          >
            <Camera className="w-7 h-7 mb-1.5 group-hover:scale-110 text-amber-500/80 transition-transform" />
            <span className="text-xs font-bold tracking-wide">📸 撮影 / 探検画像を選択</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleMainSelect(e.target.files?.[0] ?? null)}
        />
      </div>

      <button
        type="button"
        onClick={() => setDetailOpen(!detailOpen)}
        className="flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors pt-1"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${detailOpen ? 'rotate-180' : ''}`} />
        <span>EXPAND PARAMETERS // 詳細メモ・仲間{detailOpen ? ' ▲' : ' ▼'}</span>
      </button>

      {detailOpen && (
        <div className="space-y-4 p-4 rounded-sm bg-[#090d16] border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              FIELD NOTES // 詳細メモ
            </label>
            <textarea
              value={detailMemo}
              onChange={(e) => setDetailMemo(e.target.value)}
              placeholder="この場所についての地形・資源・魔物などのメモ"
              rows={3}
              className="modal-input resize-none text-xs leading-relaxed text-slate-200"
            />
          </div>
          {members.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                COMPANIONS // 同行メンバー
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((m) => {
                  const checked = selectedMembers.has(m.id);
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`px-3 py-1.5 rounded-sm text-xs font-mono border transition-all ${
                        checked
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold'
                          : 'bg-[#0d1627] text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {checked ? '▶ ' : '+ '}
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              TIMESTAMP // 記録日時
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="modal-input text-xs"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 px-0 pt-4 pb-2 border-t border-slate-800 bg-transparent">
        <button
          type="button"
          onClick={() => {
            playCancelSound();
            onCancel();
          }}
          className="flex-1 py-2.5 rounded-sm bg-[#1a2333] border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98] transition-all text-xs uppercase tracking-wider"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 py-2.5 rounded-sm bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:bg-amber-400 active:scale-[0.98] transition-all disabled:opacity-50 text-xs uppercase tracking-wider"
        >
          {saving ? 'SAVING // 保存中...' : '▶ 保存する (SAVE)'}
        </button>
      </div>

      <style>{`
        .modal-input {
          width: 100%;
          padding: 0.65rem 0.75rem;
          border-radius: 0.25rem;
          border: 1px solid #334155;
          background: #090d16;
          color: #f1f5f9;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .modal-input::placeholder { color: #64748b; }
        .modal-input:focus {
          border-color: #38bdf8;
          background: #0d1627;
          box-shadow: 0 0 0 1px #38bdf8, 0 0 14px rgba(56, 189, 248, 0.15);
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
