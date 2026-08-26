import { useEffect, useState } from 'react';
import { Camera, X, Plus } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, deleteWorldMemberPhoto } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { playCloseSound, playModalCloseSound, playSaveSound } from '@/lib/sound';

type MemberPhotoState = {
  name: string;
  file: File | null;
  previewUrl: string;
  existingPath: string | null;
};

export function WorldCreateScreen({ gameId, gameName, worldId, navigate, goBack }: { gameId: string; gameName: string; worldId?: string; navigate: NavigateFn; goBack: () => void }) {
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
    fetchWorld(worldId).then(async (w) => {
      if (!w) return;
      setName(w.name); setPlayer(w.player ?? ''); setMemo(w.memo ?? ''); setPlayerExistingPath(w.player_photo_path ?? null);
      if (w.player_photo_path) { try { setPlayerPhotoPreview(await getPhotoUrl(w.player_photo_path)); } catch { setPlayerPhotoPreview(''); } }
      const loadedMembers = await Promise.all(w.members.map(async (m) => ({ name: m.name, file: null, previewUrl: m.photo_path ? await getPhotoUrl(m.photo_path).catch(() => '') : '', existingPath: m.photo_path ?? null })));
      setMembers(loadedMembers.length > 0 ? loadedMembers : [{ name: '', file: null, previewUrl: '', existingPath: null }]);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [worldId]);

  const setPlayerPhoto = (file: File | null) => { if (!file) return; setPlayerPhotoFile(file); setPlayerPhotoPreview(URL.createObjectURL(file)); };
  const setMemberPhoto = (index: number, file: File | null) => { if (!file) return; const url = URL.createObjectURL(file); setMembers((current) => current.map((member, i) => i === index ? { ...member, file, previewUrl: url } : member)); };
  const updateMemberName = (index: number, value: string) => setMembers((current) => current.map((member, i) => i === index ? { ...member, name: value } : member));
  const addMember = () => setMembers((current) => [...current, { name: '', file: null, previewUrl: '', existingPath: null }]);
  const removeMember = (index: number) => setMembers((current) => current.filter((_, i) => i !== index));

  const handleSave = async () => {
    setError('');
    if (!name.trim()) { setError('ワールド名を入力してください'); return; }
    setSaving(true);
    try {
      const memberNames = members.map((m) => m.name.trim()).filter(Boolean);
      const oldPlayerPath = playerExistingPath;
      const existingMemberBlobs = new Map<string, Blob>();
      if (isEdit) for (const member of members.filter((m) => m.name.trim() && m.existingPath && !m.file)) if (member.existingPath) existingMemberBlobs.set(member.existingPath, await fetchPhotoBlob(member.existingPath));
      let savedWorldId = worldId;
      if (isEdit && worldId) { await updateWorld(worldId, { name, player, memo, members: memberNames }); savedWorldId = worldId; }
      else { const created = await createWorld(gameId, { name, player, memo, members: memberNames }); savedWorldId = created.id; }
      const refreshed = savedWorldId ? await fetchWorld(savedWorldId) : null;
      if (!refreshed) throw new Error('保存したワールドを確認できませんでした');
      if (playerPhotoFile) await saveWorldPlayerPhoto(savedWorldId as string, playerPhotoFile);
      else if (oldPlayerPath) { const blob = await fetchPhotoBlob(oldPlayerPath); await saveWorldPlayerPhoto(savedWorldId as string, new File([blob], 'player.webp', { type: 'image/webp' })); if (oldPlayerPath !== refreshed.player_photo_path) await deleteWorldMemberPhoto(oldPlayerPath).catch(() => undefined); }
      const savedMembers = refreshed.members; const oldPathsToDelete: string[] = [];
      for (let index = 0; index < memberNames.length; index += 1) {
        const memberState = members.filter((m) => m.name.trim())[index]; const savedMember = savedMembers[index]; if (!memberState || !savedMember) continue;
        if (memberState.file) await saveWorldMemberPhoto(savedMember.id, memberState.file);
        else if (memberState.existingPath) { const blob = existingMemberBlobs.get(memberState.existingPath); if (!blob) throw new Error('既存メンバー写真を保持できませんでした'); await saveWorldMemberPhoto(savedMember.id, new File([blob], 'member.webp', { type: 'image/webp' })); oldPathsToDelete.push(memberState.existingPath); }
      }
      for (const path of oldPathsToDelete) await deleteWorldMemberPhoto(path).catch(() => undefined);
      if (isEdit) playSaveSound();
      goBack();
    } catch (e) { setError((e as Error).message); } finally { setSaving(false); }
  };

  if (loading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"><Spinner label="読み込み中" /></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 font-sans" onMouseDown={(event) => {
      if (event.target === event.currentTarget) { playModalCloseSound(); navigate({ name: 'worldList', gameId, gameName }); }
    }}>
      <div className="world-edit-modal-panel w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto bg-[#1e2330] border-2 border-amber-500/70 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b-2 border-[#2d3548] bg-[#161a24]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 border border-amber-400 bg-amber-500/20 text-amber-300 font-bold">WORLD CONFIG</span>
            <h2 className="text-sm sm:text-base font-bold text-white">{isEdit ? 'ワールドを編集' : 'ワールドを追加'}</h2>
          </div>
          <button
            type="button"
            onClick={() => { playCloseSound(); goBack(); }}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-5 space-y-4">
          {error && <ErrorBanner message={error} />}
          <Field label="ワールド名" required><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="例: サバイバル第1ワールド" className="modal-input" /></Field>
          <Field label="プレイヤー"><div className="flex items-center gap-3"><PhotoPicker previewUrl={playerPhotoPreview} onChange={setPlayerPhoto} label="プレイヤー写真" /><input type="text" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="あなたの名前" className="modal-input flex-1" /></div></Field>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-bold text-slate-200">関連メンバー</label>
              <button type="button" onClick={addMember} className="min-h-[36px] px-2.5 flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer">
                <Plus className="w-4 h-4" />追加
              </button>
            </div>
            <div className="space-y-2.5">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <PhotoPicker previewUrl={member.previewUrl} onChange={(file) => setMemberPhoto(index, file)} label={`メンバー${index + 1}写真`} />
                  <input type="text" value={member.name} onChange={(event) => updateMemberName(index, event.target.value)} placeholder={`メンバー${index + 1}`} className="modal-input flex-1" />
                  {members.length > 1 && (
                    <button type="button" onClick={() => removeMember(index)} className="min-h-[44px] min-w-[44px] border-2 border-slate-700 bg-[#141824] text-slate-400 hover:border-rose-500 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer" aria-label="メンバーを削除">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <Field label="メモ"><textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="ワールドの概要や目標など" rows={3} className="modal-input resize-none" /></Field>
        </div>
        <div className="flex gap-3 px-4 sm:px-5 py-4 border-t-2 border-[#2d3548] bg-[#161a24]">
          <button type="button" onClick={() => { playCloseSound(); goBack(); }} disabled={saving} className="flex-1 min-h-[44px] border-2 border-slate-700 bg-[#141824] text-slate-200 font-bold hover:border-slate-500 hover:text-white disabled:opacity-50 transition-all text-xs sm:text-sm cursor-pointer">キャンセル</button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 min-h-[44px] bg-amber-500 text-black font-black border-b-3 border-amber-700 shadow-[0_2px_12px_rgba(245,158,11,0.25)] hover:bg-amber-400 active:border-b-0 disabled:opacity-50 transition-all text-xs sm:text-sm cursor-pointer">▶ {saving ? '保存中...' : isEdit ? '更新する' : '追加する'}</button>
        </div>
      </div>
      <style>{`.modal-input { width: 100%; min-height: 44px; padding: 0.625rem 0.875rem; border: 2px solid #334155; background: #141824; color: #ffffff; outline: none; font-size: 0.875rem; transition: border-color 160ms ease, box-shadow 160ms ease; }.modal-input::placeholder { color: #64748b; }.modal-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 1px #f59e0b, 0 0 12px rgba(245,158,11,0.25); }.world-edit-modal-panel { animation: world-edit-modal-in 180ms cubic-bezier(.22,.8,.35,1) both; transform-origin: center; }@keyframes world-edit-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }@media (prefers-reduced-motion: reduce) { .world-edit-modal-panel { animation: none; } }`}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) { return <div><label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">{label}{required && <span className="text-amber-400 ml-1">*</span>}</label>{children}</div>; }
function PhotoPicker({ previewUrl, onChange, label }: { previewUrl: string; onChange: (file: File | null) => void; label: string }) { return <label className="relative min-h-[44px] w-14 shrink-0 cursor-pointer overflow-hidden border-2 border-slate-700 bg-[#141824] flex items-center justify-center text-amber-400 hover:border-amber-400 hover:text-amber-300 transition-colors" title={label}>{previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" /> : <Camera className="h-5 w-5" />}<input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>; }
async function fetchPhotoBlob(storagePath: string): Promise<Blob> { const url = await getPhotoUrl(storagePath); const response = await fetch(url); if (!response.ok) throw new Error('既存写真を読み込めませんでした'); const blob = await response.blob(); if (url.startsWith('blob:')) URL.revokeObjectURL(url); return blob; }
