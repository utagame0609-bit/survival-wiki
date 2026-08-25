import { useEffect, useState } from 'react';
import { Camera, X, Plus } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, deleteWorldMemberPhoto } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { playCloseSound, playSaveSound } from '@/lib/sound';

type MemberPhotoState = {
  name: string;
  file: File | null;
  previewUrl: string;
  existingPath: string | null;
};

export function WorldCreateScreen({
  gameId,
  gameName,
  worldId,
  navigate,
  goBack,
}: {
  gameId: string;
  gameName: string;
  worldId?: string;
  navigate: NavigateFn;
  goBack: () => void;
}) {
  const isEdit = Boolean(worldId);
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [playerPhotoFile, setPlayerPhotoFile] = useState<File | null>(null);
  const [playerPhotoPreview, setPlayerPhotoPreview] = useState('');
  const [playerExistingPath, setPlayerExistingPath] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberPhotoState[]>([{ name: '', file: null, previewUrl: '', existingPath: null }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!worldId) return;
    fetchWorld(worldId)
      .then(async (w) => {
        if (!w) return;
        setName(w.name);
        setPlayer(w.player ?? '');
        setMemo(w.memo ?? '');
        setPlayerExistingPath(w.player_photo_path ?? null);
        if (w.player_photo_path) {
          try { setPlayerPhotoPreview(await getPhotoUrl(w.player_photo_path)); } catch { setPlayerPhotoPreview(''); }
        }
        const loadedMembers = await Promise.all(w.members.map(async (m) => ({
          name: m.name,
          file: null,
          previewUrl: m.photo_path ? await getPhotoUrl(m.photo_path).catch(() => '') : '',
          existingPath: m.photo_path ?? null,
        })));
        setMembers(loadedMembers.length > 0 ? loadedMembers : [{ name: '', file: null, previewUrl: '', existingPath: null }]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [worldId]);

  const setPlayerPhoto = (file: File | null) => {
    if (!file) return;
    setPlayerPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPlayerPhotoPreview(url);
  };

  const setMemberPhoto = (index: number, file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMembers((current) => current.map((member, i) => i === index ? { ...member, file, previewUrl: url } : member));
  };

  const updateMemberName = (index: number, value: string) => {
    setMembers((current) => current.map((member, i) => i === index ? { ...member, name: value } : member));
  };

  const addMember = () => setMembers((current) => [...current, { name: '', file: null, previewUrl: '', existingPath: null }]);
  const removeMember = (index: number) => setMembers((current) => current.filter((_, i) => i !== index));

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }
    setSaving(true);
    try {
      const memberNames = members.map((m) => m.name.trim()).filter(Boolean);
      const oldPlayerPath = playerExistingPath;
      const existingMemberBlobs = new Map<string, Blob>();
      if (isEdit) {
        const existingMembers = members.filter((member) => member.name.trim() && member.existingPath && !member.file);
        for (const member of existingMembers) {
          if (member.existingPath) {
            existingMemberBlobs.set(member.existingPath, await fetchPhotoBlob(member.existingPath));
          }
        }
      }
      let savedWorldId = worldId;

      if (isEdit && worldId) {
        await updateWorld(worldId, { name, player, memo, members: memberNames });
        savedWorldId = worldId;
      } else {
        const created = await createWorld(gameId, { name, player, memo, members: memberNames });
        savedWorldId = created.id;
      }

      const refreshed = savedWorldId ? await fetchWorld(savedWorldId) : null;
      if (!refreshed) throw new Error('保存したワールドを確認できませんでした');

      if (playerPhotoFile) {
        await saveWorldPlayerPhoto(savedWorldId as string, playerPhotoFile);
      } else if (oldPlayerPath) {
        const blob = await fetchPhotoBlob(oldPlayerPath);
        await saveWorldPlayerPhoto(savedWorldId as string, new File([blob], 'player.webp', { type: 'image/webp' }));
        if (oldPlayerPath !== refreshed.player_photo_path) await deleteWorldMemberPhoto(oldPlayerPath).catch(() => undefined);
      }

      const savedMembers = refreshed.members;
      const oldPathsToDelete: string[] = [];
      for (let index = 0; index < memberNames.length; index += 1) {
        const memberState = members.filter((m) => m.name.trim())[index];
        const savedMember = savedMembers[index];
        if (!memberState || !savedMember) continue;
        if (memberState.file) {
          await saveWorldMemberPhoto(savedMember.id, memberState.file);
        } else if (memberState.existingPath) {
          const blob = existingMemberBlobs.get(memberState.existingPath);
          if (!blob) throw new Error('既存メンバー写真を保持できませんでした');
          await saveWorldMemberPhoto(savedMember.id, new File([blob], 'member.webp', { type: 'image/webp' }));
          oldPathsToDelete.push(memberState.existingPath);
        }
      }
      for (const path of oldPathsToDelete) await deleteWorldMemberPhoto(path).catch(() => undefined);

      if (isEdit) playSaveSound();
      goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-zinc-700/90 bg-zinc-900/85 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-500/70 transition-colors';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="world-edit-modal-panel w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/95 to-zinc-900/90 border border-emerald-900/60 shadow-[0_0_28px_rgba(16,185,129,0.08),0_20px_50px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <h2 className="text-lg font-semibold text-zinc-100">ワールドを編集</h2>
          </div>
          <button type="button" onClick={() => { playCloseSound(); goBack(); }} aria-label="閉じる" className="w-9 h-9 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/70 flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-4">
          {error && <ErrorBanner message={error} />}

          <Field label="ワールド名" required>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="例: サバイバル第1ワールド" className="modal-input" />
          </Field>

          <Field label="プレイヤー">
            <div className="flex items-center gap-3">
              <PhotoPicker previewUrl={playerPhotoPreview} onChange={setPlayerPhoto} label="プレイヤー写真" />
              <input type="text" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="あなたの名前" className="modal-input flex-1" />
            </div>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-300">関連メンバー</label>
              <button type="button" onClick={addMember} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"><Plus className="w-4 h-4" />追加</button>
            </div>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <PhotoPicker previewUrl={member.previewUrl} onChange={(file) => setMemberPhoto(index, file)} label={`メンバー${index + 1}写真`} />
                  <input type="text" value={member.name} onChange={(event) => updateMemberName(index, event.target.value)} placeholder={`メンバー${index + 1}`} className="modal-input flex-1" />
                  {members.length > 1 && <button type="button" onClick={() => removeMember(index)} className="w-10 h-10 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center transition-colors" aria-label="メンバーを削除"><X className="w-5 h-5" /></button>}
                </div>
              ))}
            </div>
          </div>

          <Field label="メモ">
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="ワールドの概要や目標など" rows={3} className="modal-input resize-none" />
          </Field>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-zinc-800/90 bg-zinc-950/30">
          <button type="button" onClick={() => { playCloseSound(); goBack(); }} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-600 disabled:opacity-50 transition-all">キャンセル</button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold shadow-[0_0_16px_rgba(16,185,129,0.08)] hover:bg-emerald-500/15 hover:border-emerald-400/60 disabled:opacity-50 transition-all">{saving ? '保存中...' : '更新する'}</button>
        </div>
      </div>

      <style>{`
        .modal-input { width: 100%; padding: 0.65rem 0.75rem; border-radius: 0.75rem; border: 1px solid rgba(63, 63, 70, 0.9); background: rgba(24, 24, 27, 0.88); color: #f4f4f5; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease; }
        .modal-input::placeholder { color: #71717a; }
        .modal-input:focus { border-color: rgba(16, 185, 0.75); background: rgba(24, 24, 27, 0.96); box-shadow: 0 0 0 2px rgba(16, 185, 0, 0.12), 0 0 14px rgba(16, 185, 129, 0.05); }
        .world-edit-modal-panel { animation: world-edit-modal-in 180ms cubic-bezier(.22,.8,.35,1) both; transform-origin: center; }
        @keyframes world-edit-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .world-edit-modal-panel { animation: none; } }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>{children}</div>;
}

function PhotoPicker({ previewUrl, onChange, label }: { previewUrl: string; onChange: (file: File | null) => void; label: string }) {
  return (
    <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-emerald-700/60 bg-zinc-950/80 flex items-center justify-center text-emerald-700 hover:border-emerald-400/70 hover:text-emerald-300 transition-colors" title={label}>
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}

async function fetchPhotoBlob(storagePath: string): Promise<Blob> {
  const url = await getPhotoUrl(storagePath);
  const response = await fetch(url);
  if (!response.ok) throw new Error('既存写真を読み込めませんでした');
  const blob = await response.blob();
  if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  return blob;
}
