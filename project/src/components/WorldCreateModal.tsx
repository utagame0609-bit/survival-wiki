import { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, X } from 'lucide-react';
import { createWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, updateWorld } from '@/lib/db';
import { playAchievementSound, playAddSound, playCloseSound, playDeleteSound, playHoverSound, playModalCloseSound, playSaveSound } from '@/lib/sound';
import { ErrorBanner, Spinner } from '@/components/Feedback';
import { WorldCreateFormBody, type WorldMemberDraft } from '@/components/WorldCreateFormBody';

const EMPTY_MEMBER: WorldMemberDraft = { name: '', photo: null, previewUrl: '', existingPath: null };

export function WorldCreateModal({
  gameId,
  worldId,
  onClose,
  onCreated,
}: {
  gameId: string;
  worldId?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const isEdit = Boolean(worldId);
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const [playerPreview, setPlayerPreview] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<WorldMemberDraft[]>([{ ...EMPTY_MEMBER }]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [showOptionalSection, setShowOptionalSection] = useState(isEdit);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const rememberObjectUrl = (url: string) => {
    if (url.startsWith('blob:')) objectUrlsRef.current.add(url);
    return url;
  };

  const revokeObjectUrl = (url: string) => {
    if (!url.startsWith('blob:')) return;
    URL.revokeObjectURL(url);
    objectUrlsRef.current.delete(url);
  };

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!worldId) return;

    let active = true;
    setLoading(true);
    setError('');

    fetchWorld(worldId)
      .then(async (world) => {
        if (!world || !active) {
          if (active) setError('ワールド情報を読み込めませんでした');
          return;
        }

        setName(world.name);
        setPlayer(world.player ?? '');
        setMemo(world.memo ?? '');
        setShowOptionalSection(true);

        if (world.player_photo_path) {
          const playerUrl = await getPhotoUrl(world.player_photo_path).catch(() => '');
          if (!active) {
            if (playerUrl.startsWith('blob:')) URL.revokeObjectURL(playerUrl);
            return;
          }
          setPlayerPreview(rememberObjectUrl(playerUrl));
        }

        const loadedMembers = await Promise.all(
          world.members.map(async (member) => ({
            name: member.name,
            photo: null,
            previewUrl: member.photo_path ? await getPhotoUrl(member.photo_path).catch(() => '') : '',
            existingPath: member.photo_path ?? null,
          })),
        );

        if (!active) {
          loadedMembers.forEach((member) => {
            if (member.previewUrl.startsWith('blob:')) URL.revokeObjectURL(member.previewUrl);
          });
          return;
        }

        loadedMembers.forEach((member) => rememberObjectUrl(member.previewUrl));
        setMembers(loadedMembers.length > 0 ? loadedMembers : [{ ...EMPTY_MEMBER }]);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'ワールド情報の読み込みに失敗しました');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [worldId]);

  const setPlayerPhotoFile = (file: File | null) => {
    if (!file) return;
    revokeObjectUrl(playerPreview);
    setPlayerPhoto(file);
    setPlayerPreview(rememberObjectUrl(URL.createObjectURL(file)));
  };

  const handlePlayerPreset = (src: string) => {
    try {
      setPlayerPhotoFile(dataUrlToFile(src, 'player-preset.svg'));
    } catch {
      setError('プリセット画像を読み込めませんでした');
    }
  };

  const setMemberPhotoFile = (index: number, file: File | null) => {
    if (!file) return;
    setMembers((current) => current.map((member, i) => {
      if (i !== index) return member;
      revokeObjectUrl(member.previewUrl);
      return { ...member, photo: file, previewUrl: rememberObjectUrl(URL.createObjectURL(file)) };
    }));
  };

  const addMember = () => {
    playAddSound();
    setMembers((current) => [...current, { ...EMPTY_MEMBER }]);
  };

  const removeMember = (index: number) => {
    playDeleteSound();
    setMembers((current) => {
      const target = current[index];
      if (target) revokeObjectUrl(target.previewUrl);
      const next = current.filter((_, i) => i !== index);
      return next.length > 0 ? next : [{ ...EMPTY_MEMBER }];
    });
  };

  const buildEditMemberInputs = async () => {
    const namedMembers = members.filter((member) => member.name.trim());

    return Promise.all(
      namedMembers.map(async (member, index) => {
        if (member.photo) {
          return { name: member.name.trim(), photoFile: member.photo };
        }

        if (member.existingPath && member.previewUrl) {
          const response = await fetch(member.previewUrl);
          if (!response.ok) throw new Error('既存メンバー写真を保持できませんでした');
          const blob = await response.blob();
          return {
            name: member.name.trim(),
            photoFile: new File([blob], `member-${index + 1}.webp`, { type: blob.type || 'image/webp' }),
          };
        }

        return { name: member.name.trim(), photoFile: null };
      }),
    );
  };

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && worldId) {
        const memberInputs = await buildEditMemberInputs();
        await updateWorld(worldId, {
          name: name.trim(),
          player: player.trim(),
          memo: memo.trim(),
          members: memberInputs,
          playerPhotoFile: playerPhoto,
        });
        playSaveSound();
      } else {
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

        playAchievementSound();
      }

      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : isEdit ? 'ワールドの更新に失敗しました' : 'ワールドの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05080E]/80 p-3 sm:p-4 backdrop-blur-sm font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="world-create-modal-panel hud-bracket relative my-auto flex w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3.5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#F59E0B]" />
            <h2 className="font-game text-sm font-bold tracking-wider text-[#F8FAFC]">
              {isEdit ? 'ワールド設定の編集' : '新規冒険の書の作成'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => { playModalCloseSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] disabled:opacity-50 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {loading && <Spinner label="ワールド情報を読み込み中..." />}
          {error && <ErrorBanner message={error} />}

          {!loading && (
            <WorldCreateFormBody
              isEdit={isEdit}
              name={name}
              player={player}
              playerPreview={playerPreview}
              memo={memo}
              members={members}
              showOptionalSection={showOptionalSection}
              onNameChange={setName}
              onPlayerChange={setPlayer}
              onPlayerPhotoChange={setPlayerPhotoFile}
              onPlayerPreset={handlePlayerPreset}
              onToggleOptionalSection={() => setShowOptionalSection((current) => !current)}
              onMemberPhotoChange={setMemberPhotoFile}
              onMemberNameChange={(index, value) => setMembers((current) => current.map((item, i) => i === index ? { ...item, name: value } : item))}
              onAddMember={addMember}
              onRemoveMember={removeMember}
              onMemoChange={setMemo}
            />
          )}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#1E293B] bg-[#0B1018] px-4 py-3.5 sm:px-5">
          <button
            type="button"
            onClick={() => { playCloseSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="min-h-[40px] whitespace-nowrap rounded px-3.5 py-2 text-xs font-game text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] disabled:opacity-50 cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            onMouseEnter={playHoverSound}
            disabled={saving || loading}
            className="flex min-h-[40px] items-center gap-1.5 whitespace-nowrap rounded bg-[#F59E0B] px-5 py-2 text-xs font-game font-bold tracking-wider text-[#0B1018] shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all hover:bg-[#D97706] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>{saving ? (isEdit ? '更新中...' : '作成中...') : (isEdit ? 'ワールドを更新' : '作成して冒険を開始')}</span>
          </button>
        </div>
      </div>
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
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], filename, { type: mime });
}
