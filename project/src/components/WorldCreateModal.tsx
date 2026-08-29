import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, ChevronUp, Plus, Shield, Sparkles, Trash2, User, Users, X } from 'lucide-react';
import { createWorld, fetchWorld, getPhotoUrl, saveWorldMemberPhoto, saveWorldPlayerPhoto, updateWorld } from '@/lib/db';
import { playAchievementSound, playAddSound, playCloseSound, playDeleteSound, playHoverSound, playInputFocusSound, playModalCloseSound, playSaveSound } from '@/lib/sound';
import { ErrorBanner, Spinner } from '@/components/Feedback';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';

type MemberDraft = {
  name: string;
  photo: File | null;
  previewUrl: string;
  existingPath: string | null;
};

const EMPTY_MEMBER: MemberDraft = { name: '', photo: null, previewUrl: '', existingPath: null };

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
  const [members, setMembers] = useState<MemberDraft[]>([{ ...EMPTY_MEMBER }]);
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

  const namedMembers = members.filter((member) => member.name.trim());

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
            <>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-xs font-game text-[#F8FAFC]">
                  <span>ワールド名（冒険の書タイトル）</span>
                  <span className="rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#F59E0B]">必須</span>
                </label>
                <input
                  autoFocus={!isEdit}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onFocus={playInputFocusSound}
                  placeholder="例: エメラルド諸島開拓記、天空古城の探索"
                  className="w-full rounded border border-[#334155] bg-[#0B1018] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-game text-[#94A3B8]">主開拓者 / プレイヤー名</label>
                  <input
                    type="text"
                    value={player}
                    onChange={(event) => setPlayer(event.target.value)}
                    onFocus={playInputFocusSound}
                    placeholder="例: Uta_Adventurer"
                    className="w-full rounded border border-[#334155] bg-[#0B1018] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-game text-[#94A3B8]">プレイヤーアバター / 写真</label>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <PhotoPicker previewUrl={playerPreview} onChange={setPlayerPhotoFile} label="プレイヤー写真" accent="amber" />
                    {WORLD_PRESET_AVATAR_LIST.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => handlePlayerPreset(preset.src)}
                        onMouseEnter={playHoverSound}
                        className="h-9 w-9 shrink-0 overflow-hidden rounded border-2 border-[#334155] bg-[#0B1018] opacity-70 transition-all hover:border-[#F59E0B] hover:opacity-100 cursor-pointer"
                        aria-label={`${preset.alt}プリセット`}
                        title={`${preset.alt}プリセット`}
                      >
                        <img src={preset.src} alt={preset.alt} className="h-full w-full object-cover pixelated" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-[#1E293B] pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playHoverSound();
                    setShowOptionalSection((current) => !current);
                  }}
                  className="flex w-full items-center justify-between py-2 text-left text-xs font-game text-[#94A3B8] transition-colors hover:text-[#06B6D4] cursor-pointer"
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
                    <span className="truncate">任意設定（同行メンバー・探検メモ）</span>
                    <span className="shrink-0 text-[10px] font-mono text-[#64748B]">同行 {namedMembers.length}名</span>
                  </div>
                  {showOptionalSection ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>

                {showOptionalSection && (
                  <div className="mt-3 space-y-3.5 rounded-lg border border-[#1E293B] bg-[#0B1018]/60 p-3">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <label className="text-xs font-game text-[#94A3B8]">同行メンバー（パーティ）</label>
                        <span className="text-[10px] font-mono text-[#64748B]">写真対応</span>
                      </div>

                      {namedMembers.length > 0 && (
                        <div className="mb-2 flex flex-wrap gap-1.5">
                          <PartyChip name={player || '自分'} photoUrl={playerPreview} player />
                          {members.map((member, index) => member.name.trim() ? (
                            <PartyChip key={`${member.name}-${index}`} name={member.name} photoUrl={member.previewUrl} />
                          ) : null)}
                        </div>
                      )}

                      <div className="space-y-2">
                        {members.map((member, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <PhotoPicker
                              previewUrl={member.previewUrl}
                              onChange={(file) => setMemberPhotoFile(index, file)}
                              label={`メンバー${index + 1}写真`}
                              accent="cyan"
                            />
                            <input
                              type="text"
                              value={member.name}
                              onChange={(event) => setMembers((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))}
                              onFocus={playInputFocusSound}
                              placeholder={`メンバー${index + 1} (例: リリス)`}
                              className="min-w-0 flex-1 rounded border border-[#334155] bg-[#161F30] px-3 py-1.5 text-xs text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#06B6D4]"
                            />
                            {members.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMember(index)}
                                onMouseEnter={playHoverSound}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#334155] bg-[#161F30] text-[#64748B] transition-colors hover:border-[#EF4444]/50 hover:bg-[#2A161C] hover:text-[#EF4444] cursor-pointer"
                                aria-label="メンバーを削除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={addMember}
                        onMouseEnter={playHoverSound}
                        className="mt-2 flex min-h-[38px] w-full items-center justify-center gap-1 rounded border border-[#06B6D4]/50 bg-[#06B6D4]/10 px-3 text-xs font-game text-[#06B6D4] transition-colors hover:bg-[#06B6D4]/20 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        同行メンバー枠を追加
                      </button>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-game text-[#94A3B8]">探検概要・目標メモ</label>
                      <textarea
                        value={memo}
                        onChange={(event) => setMemo(event.target.value)}
                        onFocus={playInputFocusSound}
                        rows={2}
                        placeholder="例: 東部沿岸の拠点設営と古代水没神殿の解明を目指す探検プロジェクト。"
                        className="w-full resize-none rounded border border-[#334155] bg-[#161F30] px-3 py-2 text-xs text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </>
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

function PartyChip({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 rounded border px-2 py-1 ${player ? 'border-[#F59E0B]/60 bg-[#F59E0B]/10 text-[#FDE68A]' : 'border-[#06B6D4]/40 bg-[#0E2030] text-[#A5F3FC]'}`}>
      <div className={`flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border bg-[#0B1018] ${player ? 'border-[#F59E0B]' : 'border-[#06B6D4]/70'}`}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover pixelated" /> : player ? <User className="h-3.5 w-3.5 text-[#F59E0B]" /> : <Users className="h-3.5 w-3.5 text-[#06B6D4]" />}
      </div>
      <span className="max-w-[90px] truncate text-[10px] font-bold">{player ? `★ ${name}` : `@${name}`}</span>
    </div>
  );
}

function PhotoPicker({ previewUrl, onChange, label, accent }: { previewUrl: string; onChange: (file: File | null) => void; label: string; accent: 'amber' | 'cyan' }) {
  const accentClass = accent === 'amber'
    ? 'border-[#F59E0B] text-[#F59E0B] hover:border-[#FDE68A]'
    : 'border-[#06B6D4] text-[#06B6D4] hover:border-[#A5F3FC]';

  return (
    <label
      onMouseEnter={playHoverSound}
      className={`relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded border-2 bg-[#0B1018] transition-all ${accentClass}`}
      title={label}
    >
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" /> : <Camera className="h-4 w-4" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
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