import { useState, type FormEvent } from 'react';
import { MapPin, Users, Calendar, AlignLeft, Sparkles, Check, X, Shield } from 'lucide-react';
import type { LocationWithPhotos, Member } from '@/lib/types';
import { playConfirmSound, playSaveSound, playCancelSound } from '@/lib/sound';

export function LocationForm({
  worldId,
  members,
  editing,
  onSave,
  onComplete,
  onCancel,
  saving
}: {
  worldId: string;
  members: Member[];
  editing: LocationWithPhotos | null;
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
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [x, setX] = useState(editing?.x ?? 0);
  const [y, setY] = useState(editing?.y ?? 64);
  const [z, setZ] = useState(editing?.z ?? 0);
  const [detailMemo, setDetailMemo] = useState(editing?.detail_memo ?? '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    editing?.members.map((m) => m.id) ?? (members.length > 0 ? [members[0].id] : [])
  );
  const [formError, setFormError] = useState('');

  const toggleMember = (id: string) => {
    playConfirmSound();
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('ロケーション名を入力してください。');
      return;
    }
    setFormError('');
    try {
      await onSave({
        name: name.trim(),
        x: Number(x) || 0,
        y: Number(y) || 0,
        z: Number(z) || 0,
        detail_memo: detailMemo.trim(),
        created_at: editing?.created_at ?? new Date().toISOString(),
        member_ids: selectedMemberIds
      });
      playSaveSound();
      await onComplete();
    } catch {
      // handled upstream
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[#e2e8f0] font-dot">
      {formError && (
        <div className="p-2.5 rounded-sm bg-red-950/80 border border-red-800 text-red-300 text-xs font-mono">
          {formError}
        </div>
      )}

      {/* Location Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#ffb000] flex items-center gap-1.5 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-[#ffb000]" />
          <span>LOCATION NAME // ロケーション名</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例：始原のキャンプサイト、翡翠の遺跡..."
          required
          className="w-full px-3.5 py-2.5 rounded-sm bg-[#050a14] border-2 border-[#1a2333] focus:border-[#ffb000] focus:shadow-[0_0_12px_rgba(255,176,0,0.2)] text-sm text-[#e2e8f0] placeholder:text-zinc-600 outline-none transition-all font-mono"
        />
      </div>

      {/* XYZ Coordinates */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-[#32cd32] flex items-center gap-1.5 font-mono">
          <MapPin className="w-3.5 h-3.5 text-[#32cd32]" />
          <span>WORLD COORDINATES // 空間座標 (X / Y / Z)</span>
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2 rounded-sm bg-[#050a14] border-2 border-[#1a2333] focus-within:border-[#ffb000] flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-[#ffb000]">X AXIS</span>
            <input
              type="number"
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className="w-full text-center bg-transparent text-[#e2e8f0] font-mono font-bold text-sm outline-none mt-1"
            />
          </div>
          <div className="p-2 rounded-sm bg-[#050a14] border-2 border-[#1a2333] focus-within:border-[#32cd32] flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-[#32cd32]">Y HEIGHT</span>
            <input
              type="number"
              value={y}
              onChange={(e) => setY(Number(e.target.value))}
              className="w-full text-center bg-transparent text-[#e2e8f0] font-mono font-bold text-sm outline-none mt-1"
            />
          </div>
          <div className="p-2 rounded-sm bg-[#050a14] border-2 border-[#1a2333] focus-within:border-cyan-400 flex flex-col items-center">
            <span className="text-[10px] font-mono font-bold text-cyan-400">Z AXIS</span>
            <input
              type="number"
              value={z}
              onChange={(e) => setZ(Number(e.target.value))}
              className="w-full text-center bg-transparent text-[#e2e8f0] font-mono font-bold text-sm outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* Companions / Members */}
      {members.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>PARTY MEMBERS // 探索パーティー</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const selected = selectedMemberIds.includes(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`px-3 py-1.5 rounded-sm text-xs font-bold border flex items-center gap-1.5 transition-all ${
                    selected
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                      : 'bg-[#050a14] border-[#1a2333] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {selected && <Check className="w-3 h-3 text-cyan-400" />}
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Detail Memo */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-mono">
          <AlignLeft className="w-3.5 h-3.5 text-[#ffb000]" />
          <span>RESEARCH LOG // 冒険メモ・調査記録</span>
        </label>
        <textarea
          rows={3}
          value={detailMemo}
          onChange={(e) => setDetailMemo(e.target.value)}
          placeholder="発見した物資、周辺の気候や魔物の気配などを記録..."
          className="w-full px-3.5 py-2.5 rounded-sm bg-[#050a14] border-2 border-[#1a2333] focus:border-[#ffb000] focus:shadow-[0_0_12px_rgba(255,176,0,0.2)] text-xs text-[#e2e8f0] placeholder:text-zinc-600 outline-none resize-none transition-all leading-relaxed font-mono"
        />
      </div>

      {/* Buttons */}
      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={() => {
            playCancelSound();
            onCancel();
          }}
          disabled={saving}
          className="command-btn flex-1 py-2.5 rounded-sm bg-[#1a2333] border border-[#334155] text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5"
        >
          <X className="w-4 h-4" />
          <span>キャンセル</span>
        </button>
        <button
          type="submit"
          disabled={saving}
          className="command-btn flex-1 py-2.5 rounded-sm bg-[#ffb000] hover:bg-[#ffc033] border-2 border-[#ffb000] text-[#0a1120] font-black text-xs shadow-[0_0_15px_rgba(255,176,0,0.3)] flex items-center justify-center gap-1.5"
        >
          {saving ? (
            <span>記録保存中...</span>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>{editing ? '変更を冒険の書に上書き' : '新たな地を記録する'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
