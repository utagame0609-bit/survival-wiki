import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, deleteWorldMemberPhoto } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { playCloseSound, playModalCloseSound, playSaveSound, playNewRecordSound, playHoverSound, playInputFocusSound } from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';
import { WorldMemberFields, type MemberPhotoState } from '@/components/WorldMemberFields';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';

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
  const [members, setMembers] = useState<MemberPhotoState[]>([
    { name: '', file: null, previewUrl: '', existingPath: null },
  ]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    playWorldBgm();
    const resumeBgm = () => playWorldBgm();
    window.addEventListener('survival-wiki:settings-closed', resumeBgm);
    return () => {
      window.removeEventListener('survival-wiki:settings-closed', resumeBgm);
      stopWorldBgm(300);
    };
  }, []);

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
          try {
            setPlayerPhotoPreview(await getPhotoUrl(w.player_photo_path));
          } catch {
            setPlayerPhotoPreview('');
          }
        }

        const loadedMembers = await Promise.all(
          w.members.map(async (m) => ({
            name: m.name,
            file: null,
            previewUrl: m.photo_path ? await getPhotoUrl(m.photo_path).catch(() => '') : '',
            existingPath: m.photo_path ?? null,
          })),
        );

        setMembers([
          ...loadedMembers,
          { name: '', file: null, previewUrl: '', existingPath: null },
        ]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [worldId]);

  const setPlayerPhoto = (file: File | null) => {
    if (!file) return;
    if (playerPhotoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(playerPhotoPreview);
    }
    setPlayerPhotoFile(file);
    setPlayerPhotoPreview(URL.createObjectURL(file));
  };

  const setPlayerPreset = async (src: string) => {
    try {
      const file = dataUrlToFile(src, 'player-preset.svg');
      setPlayerPhoto(file);
    } catch {
      setError('プリセット画像を読み込めませんでした');
    }
  };

  const setMemberPhoto = (index: number, file: File | null) => {
    if (!file) return;

    setMembers((current) =>
      current.map((member, i) => {
        if (i !== index) return member;
        if (member.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(member.previewUrl);
        }
        return {
          ...member,
          file,
          previewUrl: URL.createObjectURL(file),
        };
      }),
    );
  };

  const updateMemberName = (index: number, value: string) =>
    setMembers((current) =>
      current.map((member, i) => (i === index ? { ...member, name: value } : member)),
    );

  const addMember = () =>
    setMembers((current) => [
      ...current,
      { name: '', file: null, previewUrl: '', existingPath: null },
    ]);

  const removeMember = (index: number) =>
    setMembers((current) => current.filter((_, i) => i !== index));

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
        for (const member of members.filter((m) => m.name.trim() && m.existingPath && !m.file)) {
          if (member.existingPath) {
            existingMemberBlobs.set(member.existingPath, await fetchPhotoBlob(member.existingPath));
          }
        }
      }

      let savedWorldId = worldId;

      if (isEdit && worldId) {
        await updateWorld(worldId, {
          name,
          player,
          memo,
          members: memberNames,
        });
        savedWorldId = worldId;
      } else {
        const created = await createWorld(gameId, {
          name,
          player,
          memo,
          members: memberNames,
        });
        savedWorldId = created.id;
      }

      const refreshed = savedWorldId ? await fetchWorld(savedWorldId) : null;
      if (!refreshed) {
        throw new Error('保存したワールドを確認できませんでした');
      }

      if (playerPhotoFile) {
        await saveWorldPlayerPhoto(savedWorldId as string, playerPhotoFile);
      } else if (oldPlayerPath) {
        const blob = await fetchPhotoBlob(oldPlayerPath);
        await saveWorldPlayerPhoto(
          savedWorldId as string,
          new File([blob], 'player.webp', { type: 'image/webp' }),
        );
        if (oldPlayerPath !== refreshed.player_photo_path) {
          await deleteWorldMemberPhoto(oldPlayerPath).catch(() => undefined);
        }
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
          if (!blob) {
            throw new Error('既存メンバー写真を保持できませんでした');
          }
          await saveWorldMemberPhoto(
            savedMember.id,
            new File([blob], 'member.webp', { type: 'image/webp' }),
          );
          oldPathsToDelete.push(memberState.existingPath);
        }
      }

      for (const path of oldPathsToDelete) {
        await deleteWorldMemberPhoto(path).catch(() => undefined);
      }

      if (isEdit) playSaveSound();
      else playNewRecordSound();

      goBack();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4">
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playModalCloseSound();
          navigate({ name: 'worldList', gameId, gameName });
        }
      }}
    >
      <div className="world-edit-modal-panel flex w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex-col overflow-hidden bg-[#141b2d] border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.22)] text-slate-100">
        <div className="flex shrink-0 items-center justify-between px-4 sm:px-5 py-3.5 border-b-2 border-amber-500/60 bg-[#0d1627]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 border border-amber-400 bg-amber-500/20 text-amber-300 font-bold">
              WORLD CONFIG
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {isEdit ? 'ワールド冒険の書を編集' : '新しいワールド冒険の書を作成'}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              playCloseSound();
              goBack();
            }}
            onMouseEnter={playHoverSound}
            className="flex h-8 w-8 items-center justify-center text-slate-300 hover:text-white cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {error && <ErrorBanner message={error} />}

          <Field label="WORLD NAME // ワールド名" required>
            <input
              autoFocus={!isEdit}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onFocus={playInputFocusSound}
              placeholder="例: サバイバル開拓記 第1世界"
              className="modal-input text-sm"
            />
          </Field>

          <WorldMemberFields
            player={player}
            playerPhotoPreview={playerPhotoPreview}
            members={members}
            onPlayerChange={setPlayer}
            onPlayerPhotoChange={setPlayerPhoto}
            onPlayerPresetChange={setPlayerPreset}
            onMemberPhotoChange={setMemberPhoto}
            onMemberNameChange={updateMemberName}
            onAddMember={addMember}
            onRemoveMember={removeMember}
          />

          <Field label="WORLD MEMO // 探検概要・目標">
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              onFocus={playInputFocusSound}
              placeholder="ワールドの概要、難易度、攻略目標など"
              rows={3}
              className="modal-input resize-none text-xs sm:text-sm"
            />
          </Field>
        </div>

        <div className="flex shrink-0 gap-3 px-4 sm:px-5 py-4 border-t-2 border-amber-500/20 bg-[#0d1627]">
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              goBack();
            }}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="flex-1 min-h-[44px] py-2.5 bg-[#1a2333] border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:border-slate-600 disabled:opacity-50 transition-all text-xs sm:text-sm cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="flex-1 min-h-[44px] py-2.5 bg-amber-500 text-slate-950 font-black border-b-2 border-amber-700 shadow-[0_0_16px_rgba(245,158,11,0.2)] hover:bg-amber-400 disabled:opacity-50 transition-all text-xs sm:text-sm cursor-pointer"
          >
            ▶ {saving ? '保存中...' : isEdit ? '更新する' : '作成して開始'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-input {
          width: 100%;
          min-height: 42px;
          padding: 0.65rem 0.75rem;
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
          box-shadow: 0 0 0 1px #38bdf8, 0 0 14px rgba(56,189,248,0.15);
        }
        .world-edit-modal-panel {
          animation: world-edit-modal-in 180ms cubic-bezier(.22,.8,.35,1) both;
          transform-origin: center;
        }
        @keyframes world-edit-modal-in {
          from { opacity: 0; transform: translateY(8px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .world-edit-modal-panel { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) throw new Error('Invalid data URL');

  const header = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  const mime = /^data:(.*?);/.exec(header)?.[1] ?? 'image/svg+xml';
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

async function fetchPhotoBlob(storagePath: string): Promise<Blob> {
  const url = await getPhotoUrl(storagePath);
  const response = await fetch(url);
  if (!response.ok) throw new Error('既存写真を読み込めませんでした');
  return response.blob();
}
