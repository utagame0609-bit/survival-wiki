import { useEffect, useState } from 'react';
import { Camera, X, Plus, UserRound } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, deleteWorldMemberPhoto } from '@/lib/db';
import { Header } from '@/components/Navigation';
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
      const oldMemberPaths = members.filter((m) => m.name.trim() && m.existingPath).map((m) => ({ name: m.name.trim(), path: m.existingPath as string }));
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
          const blob = await fetchPhotoBlob(memberState.existingPath);
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
      <div className="min-h-screen bg-[#11120f] text-zinc-100">
        <Header title="ワールド編集" onBack={goBack} />
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11120f] text-zinc-100">
      <Header title={isEdit ? 'ワールド編集' : 'ワールド作成'} onBack={goBack} />
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/20 via-zinc-900/95 to-zinc-900/90 shadow-[0_0_28px_rgba(16,185,129,0.08),0_20px_50px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-zinc-800/90 px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <h2 className="text-lg font-semibold text-zinc-100">ワールドを編集</h2>
            </div>
            <button type="button" onClick={() => { playCloseSound(); goBack(); }} aria-label="閉じる" className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800/70 hover:text-zinc-200">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 p-5">
            {error && <ErrorBanner message={error} />}

            <Field label="ワールド名" required>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: サバイバル第1ワールド" className={inputClass} />
            </Field>

            <Field label="プレイヤー">
              <PhotoNameInput name={player} onNameChange={setPlayer} previewUrl={playerPhotoPreview} onPhotoChange={setPlayerPhoto} inputClass={inputClass} />
            </Field>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300">関連メンバー</label>
                <button type="button" onClick={addMember} className="flex items-center gap-1 text-sm text-emerald-400 transition-colors hover:text-emerald-300">
                  <Plus className="h-4 w-4" /> 追加
                </button>
              </div>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <PhotoPicker previewUrl={member.previewUrl} onChange={(file) => setMemberPhoto(index, file)} />
                    <input type="text" value={member.name} onChange={(e) => updateMemberName(index, e.target.value)} placeholder={`メンバー${index + 1}`} className={inputClass} />
                    {members.length > 1 && (
                      <button type="button" onClick={() => removeMember(index)} className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-red-950/30 hover:text-red-300" aria-label="メンバーを削除">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Field label="メモ">
              <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="ワールドの概要や目標など" rows={3} className={`${inputClass} resize-none`} />
            </Field>
          </div>

          <div className="flex gap-2 border-t border-zinc-800/90 bg-zinc-950/30 px-5 py-4">
            <button type="button" onClick={() => { playCloseSound(); goBack(); }} disabled={saving} className="flex-1 rounded-xl border border-zinc-700/80 bg-zinc-800/80 py-2.5 font-medium text-zinc-300 transition-all hover:border-zinc-600 hover:bg-zinc-800 disabled:opacity-50">キャンセル</button>
            <button type="button" onClick={handleSave} disabled={saving} className="flex-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-2.5 font-bold text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.08)] transition-all hover:border-emerald-400/60 hover:bg-emerald-500/15 disabled:opacity-50">
              {saving ? '保存中...' : '更新する'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}{required && <span className="ml-1 text-red-400">*</span>}</label>
      {children}
    </div>
  );
}

function PhotoNameInput({ name, onNameChange, previewUrl, onPhotoChange, inputClass }: { name: string; onNameChange: (value: string) => void; previewUrl: string; onPhotoChange: (file: File | null) => void; inputClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <PhotoPicker previewUrl={previewUrl} onChange={onPhotoChange} />
      <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="あなたの名前" className={inputClass} />
    </div>
  );
}

function PhotoPicker({ previewUrl, onChange }: { previewUrl: string; onChange: (file: File | null) => void }) {
  return (
    <label className="relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-emerald-700/80 bg-zinc-950/80 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.06)] transition-all hover:border-emerald-400/80 hover:shadow-[0_0_14px_rgba(16,185,129,0.12)]">
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-5 w-5" />}
      <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border border-zinc-800 bg-black/80 text-emerald-300"><Camera className="h-2.5 w-2.5" /></span>
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
