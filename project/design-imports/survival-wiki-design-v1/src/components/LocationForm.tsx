import React, { useState, useEffect } from 'react';
import { Camera, X, Check, Compass, Users } from 'lucide-react';
import type { LocationWithPhotos, WorldMember } from '@/lib/types';
import { saveLocationPhoto, getPhotoUrl } from '@/lib/db';
import { playConfirmSound, playCancelSound, playSaveSound } from '@/lib/sound';

interface LocationFormProps {
  worldId: string;
  members: WorldMember[];
  editing?: LocationWithPhotos | null;
  onSave: (input: {
    name: string;
    x: number;
    y: number;
    z: number;
    detail_memo: string;
    created_at: string;
    member_ids: string[];
  }) => Promise<string>;
  onComplete: () => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export function LocationForm({
  members,
  editing,
  onSave,
  onComplete,
  onCancel,
  saving,
}: LocationFormProps) {
  const [name, setName] = useState(editing?.name || '');
  const [x, setX] = useState<number>(editing?.x ?? 0);
  const [y, setY] = useState<number>(editing?.y ?? 64);
  const [z, setZ] = useState<number>(editing?.z ?? 0);
  const [detailMemo, setDetailMemo] = useState(editing?.detail_memo || '');
  const [createdAt, setCreatedAt] = useState(
    editing?.created_at
      ? new Date(editing.created_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    editing ? editing.members.map((m) => m.id) : []
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editing?.photos && editing.photos.length > 0) {
      const main = editing.photos.find((p) => p.is_main) || editing.photos[0];
      if (main) {
        getPhotoUrl(main.storage_path).then(setPhotoPreview).catch(() => {});
      }
    }
  }, [editing]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleMember = (mId: string) => {
    playConfirmSound();
    setSelectedMemberIds((prev) =>
      prev.includes(mId) ? prev.filter((id) => id !== mId) : [...prev, mId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('ロケーション名を入力してください。');
      return;
    }

    try {
      const savedId = await onSave({
        name: name.trim(),
        x: Number(x) || 0,
        y: Number(y) || 0,
        z: Number(z) || 0,
        detail_memo: detailMemo.trim(),
        created_at: new Date(createdAt).toISOString(),
        member_ids: selectedMemberIds,
      });

      if (photoFile && savedId) {
        await saveLocationPhoto(savedId, photoFile, true);
      }

      playSaveSound();
      await onComplete();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs sm:text-sm">
      {error && (
        <div className="p-2.5 bg-red-950/60 border border-red-500 text-red-300 text-xs font-bold">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-amber-400 mb-1.5 uppercase">
          ロケーション名称 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 北部水晶洞窟・第2前哨基地"
          className="w-full px-3 py-2 bg-[#070c18] border border-slate-700 text-slate-100 placeholder:text-slate-600 focus:border-amber-500 focus:shadow-[0_0_10px_rgba(245,158,11,0.2)] outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-1.5 uppercase">
          <Compass className="w-3.5 h-3.5" />
          <span>空間座標 (X / Y / Z)</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">X 座標 (East/West)</span>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-[#070c18] border border-slate-700 text-slate-100 text-center font-bold focus:border-emerald-400 outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Y 高度 (Height)</span>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-[#070c18] border border-slate-700 text-slate-100 text-center font-bold focus:border-emerald-400 outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block mb-0.5">Z 座標 (North/South)</span>
            <input
              type="number"
              value={z}
              onChange={(e) => setZ(Number(e.target.value))}
              className="w-full px-2.5 py-2 bg-[#070c18] border border-slate-700 text-slate-100 text-center font-bold focus:border-cyan-400 outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-amber-400" />
          <span>現場写真・スクリーンショット</span>
        </label>
        <div className="flex items-center gap-3">
          <label className="relative flex-1 h-28 border-2 border-dashed border-slate-700 bg-[#070c18] hover:border-amber-500 cursor-pointer flex flex-col items-center justify-center p-2 text-center group transition-colors overflow-hidden">
            {photoPreview ? (
              <img src={photoPreview} alt="プレビュー" className="w-full h-full object-cover pixelated" />
            ) : (
              <>
                <Camera className="w-6 h-6 text-slate-500 group-hover:text-amber-400 transition-colors mb-1" />
                <span className="text-[11px] text-slate-400 group-hover:text-slate-200">
                  クリックして写真を選択またはドラッグ＆ドロップ
                </span>
              </>
            )}
            <input type="file" accept="image/*" onChange={handlePhotoSelect} className="sr-only" />
          </label>
          {photoPreview && (
            <button
              type="button"
              onClick={() => {
                setPhotoFile(null);
                setPhotoPreview('');
              }}
              className="px-2.5 py-1.5 border border-red-800 bg-red-950/40 text-red-400 hover:text-red-300 text-xs"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      {members.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-cyan-400 mb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>同行メンバー</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = selectedMemberIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`px-3 py-1.5 text-xs border flex items-center gap-1.5 transition-all ${
                    selected
                      ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300 font-bold shadow-[0_0_8px_rgba(34,211,238,0.25)]'
                      : 'border-slate-700 bg-[#070c18] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  {selected ? <Check className="w-3 h-3 text-cyan-400" /> : null}
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">記録日時</label>
        <input
          type="datetime-local"
          value={createdAt}
          onChange={(e) => setCreatedAt(e.target.value)}
          className="w-full px-3 py-2 bg-[#070c18] border border-slate-700 text-slate-200 focus:border-amber-500 outline-none text-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-300 mb-1.5">冒険・調査メモ</label>
        <textarea
          value={detailMemo}
          onChange={(e) => setDetailMemo(e.target.value)}
          placeholder="発見した物資、周辺の脅威、次の探索計画など..."
          rows={3}
          className="w-full px-3 py-2 bg-[#070c18] border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-amber-500 outline-none resize-none text-xs leading-5"
        />
      </div>

      <div className="flex gap-3 pt-3 border-t border-[#1a2333]">
        <button
          type="button"
          onClick={() => {
            playCancelSound();
            onCancel();
          }}
          disabled={saving}
          className="flex-1 py-2.5 bg-[#070c18] border border-slate-700 text-slate-300 font-bold hover:border-slate-500 active:scale-98 transition-all disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 bg-amber-500 text-black font-bold border-b-2 border-amber-700 shadow-[0_2px_8px_rgba(245,158,11,0.2)] hover:bg-amber-400 active:border-b-0 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? '保存中...' : editing ? '▶ 更新を記録' : '▶ 冒険の書に刻む'}
        </button>
      </div>
    </form>
  );
}
