import { useState } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import { createWorld, fetchWorld, saveWorldMemberPhoto, saveWorldPlayerPhoto } from '@/lib/db';
import { playCloseSound, playAddSound } from '@/lib/sound';
import { ErrorBanner } from '@/components/Feedback';

type MemberDraft = { name: string; photo: File | null };

export function WorldCreateModal({
  gameId,
  onClose,
  onCreated,
}: {
  gameId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([{ name: '', photo: null }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const memberNames = members.map((member) => member.name.trim()).filter(Boolean);
      const world = await createWorld(gameId, {
        name: name.trim(),
        player: player.trim(),
        memo: memo.trim(),
        members: memberNames,
      });

      if (playerPhoto) await saveWorldPlayerPhoto(world.id, playerPhoto);

      const createdWorld = await fetchWorld(world.id);
      if (createdWorld) {
        const namedDrafts = members.filter((member) => member.name.trim());
        for (let index = 0; index < namedDrafts.length; index += 1) {
          const photo = namedDrafts[index].photo;
          const createdMember = createdWorld.members[index];
          if (photo && createdMember) await saveWorldMemberPhoto(createdMember.id, photo);
        }
      }

      playAddSound();
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="world-create-modal-panel w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/95 to-zinc-900/90 border border-emerald-900/60 shadow-[0_0_28px_rgba(16,185,129,0.08),0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <h2 className="text-lg font-semibold text-zinc-100">ワールドを追加</h2>
          </div>
          <button type="button" onClick={() => { playCloseSound(); onClose(); }} aria-label="閉じる" className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <ErrorBanner message={error} />}

          <Field label="ワールド名" required>
            <input autoFocus type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="例: サバイバル第1ワールド" className="modal-input" />
          </Field>

          <Field label="プレイヤー">
            <div className="flex items-center gap-3">
              <PhotoPicker file={playerPhoto} onChange={setPlayerPhoto} label="プレイヤー写真" />
              <input type="text" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="あなたの名前" className="modal-input flex-1" />
            </div>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-300">関連メンバー</label>
              <button type="button" onClick={() => setMembers([...members, { name: '', photo: null }])} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"><Plus className="w-4 h-4" />追加</button>
            </div>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <PhotoPicker file={member.photo} onChange={(photo) => { const next = [...members]; next[index] = { ...next[index], photo }; setMembers(next); }} label={`メンバー${index + 1}写真`} />
                  <input type="text" value={member.name} onChange={(event) => { const next = [...members]; next[index] = { ...next[index], name: event.target.value }; setMembers(next); }} placeholder={`メンバー${index + 1}`} className="modal-input flex-1" />
                  {members.length > 1 && <button type="button" onClick={() => setMembers(members.filter((_, i) => i !== index))} className="w-10 h-10 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center transition-colors" aria-label="メンバーを削除"><X className="w-5 h-5" /></button>}
                </div>
              ))}
            </div>
          </div>

          <Field label="メモ">
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="ワールドの概要や目標など" rows={3} className="modal-input resize-none" />
          </Field>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800/90 bg-zinc-950/30">
          <button type="button" onClick={() => { playCloseSound(); onClose(); }} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 transition-all">キャンセル</button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_16px_rgba(16,185,129,0.08)] hover:bg-emerald-500/15 hover:border-emerald-400/60 disabled:opacity-50 transition-all">{saving ? '保存中...' : '追加する'}</button>
        </div>
      </div>

      <style>{`
        .modal-input { width: 100%; padding: 0.65rem 0.75rem; border-radius: 0.75rem; border: 1px solid rgba(63, 63, 70, 0.9); background: rgba(24, 24, 27, 0.88); color: #f4f4f5; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease; }
        .modal-input::placeholder { color: #71717a; }
        .modal-input:focus { border-color: rgba(16, 185, 0.75); background: rgba(24, 24, 27, 0.96); box-shadow: 0 0 0 2px rgba(16, 185, 0, 0.12), 0 0 14px rgba(16, 185, 129, 0.05); }
        .world-create-modal-panel { animation: world-create-modal-in 180ms cubic-bezier(.22,.8,.35,1) both; transform-origin: center; }
        @keyframes world-create-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .world-create-modal-panel { animation: none; } }
      `}</style>
    </div>
  );
}

function PhotoPicker({ file, onChange, label }: { file: File | null; onChange: (file: File | null) => void; label: string }) {
  const [preview, setPreview] = useState<string>('');

  const handleChange = (nextFile: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    const nextPreview = nextFile ? URL.createObjectURL(nextFile) : '';
    setPreview(nextPreview);
    onChange(nextFile);
  };

  return (
    <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-[2px] border border-emerald-700/60 bg-zinc-950/80 flex items-center justify-center text-emerald-700 hover:border-emerald-400/70 hover:text-emerald-300 transition-colors" title={label}>
      {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>{children}</div>;
}
