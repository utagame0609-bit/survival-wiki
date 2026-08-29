import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Shield,
  Sparkles,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { createWorld, updateWorld, fetchWorld, getPhotoUrl } from '@/lib/db';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import {
  playAchievementSound,
  playAddSound,
  playCloseSound,
  playDeleteSound,
  playHoverSound,
  playInputFocusSound,
  playModalCloseSound,
  playSaveSound,
} from '@/lib/sound';
import { playWorldBgm, stopWorldBgm } from '@/lib/bgm';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';

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
  goBack: _goBack,
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
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberPhotoState[]>([
    { name: '', file: null, previewUrl: '', existingPath: null },
  ]);
  const [showOptionalSection, setShowOptionalSection] = useState(isEdit);
  const [selectedPresetKey, setSelectedPresetKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  const configuredMembers = useMemo(() => members.filter((member) => member.name.trim()), [members]);

  useEffect(() => {
    playWorldBgm();
    const resumeBgm = () => playWorldBgm();
    window.addEventListener('survival-wiki:settings-closed', resumeBgm);
    window.addEventListener('survival-wiki:sound-studio-closed', resumeBgm);
    return () => {
      window.removeEventListener('survival-wiki:settings-closed', resumeBgm);
      window.removeEventListener('survival-wiki:sound-studio-closed', resumeBgm);
      stopWorldBgm(300);
    };
  }, []);

  useEffect(() => {
    if (!worldId) return;

    let active = true;
    setLoading(true);
    setError('');

    fetchWorld(worldId)
      .then(async (world) => {
        if (!world || !active) return;

        setName(world.name);
        setPlayer(world.player ?? '');
        setMemo(world.memo ?? '');
        setShowOptionalSection(true);

        if (world.player_photo_path) {
          setPlayerPhotoPreview(await getPhotoUrl(world.player_photo_path).catch(() => ''));
        } else {
          setPlayerPhotoPreview('');
        }

        const loadedMembers = await Promise.all(
          world.members.map(async (member) => ({
            name: member.name,
            file: null,
            previewUrl: member.photo_path ? await getPhotoUrl(member.photo_path).catch(() => '') : '',
            existingPath: member.photo_path ?? null,
          })),
        );

        if (!active) return;
        setMembers(
          loadedMembers.length > 0
            ? loadedMembers
            : [{ name: '', file: null, previewUrl: '', existingPath: null }],
        );
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

  const setPlayerPhoto = (file: File | null, presetKey: string | null = null) => {
    if (!file) return;
    if (playerPhotoPreview.startsWith('blob:')) URL.revokeObjectURL(playerPhotoPreview);
    setPlayerPhotoFile(file);
    setPlayerPhotoPreview(URL.createObjectURL(file));
    setSelectedPresetKey(presetKey);
  };

  const setPlayerPreset = (src: string, key: string) => {
    try {
      setPlayerPhoto(dataUrlToFile(src, 'player-preset.svg'), key);
    } catch {
      setError('プリセット画像を読み込めませんでした');
    }
  };

  const setMemberPhoto = (index: number, file: File | null) => {
    if (!file) return;
    setMembers((current) =>
      current.map((member, memberIndex) => {
        if (memberIndex !== index) return member;
        if (member.previewUrl.startsWith('blob:')) URL.revokeObjectURL(member.previewUrl);
        return { ...member, file, previewUrl: URL.createObjectURL(file) };
      }),
    );
  };

  const updateMemberName = (index: number, value: string) => {
    setMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, name: value } : member,
      ),
    );
  };

  const addMember = () => {
    playAddSound();
    setMembers((current) => [
      ...current,
      { name: '', file: null, previewUrl: '', existingPath: null },
    ]);
  };

  const removeMember = (index: number) => {
    playDeleteSound();
    setMembers((current) => {
      const target = current[index];
      if (target?.previewUrl.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl);
      const next = current.filter((_, memberIndex) => memberIndex !== index);
      return next.length > 0
        ? next
        : [{ name: '', file: null, previewUrl: '', existingPath: null }];
    });
  };

  const returnToWorldList = () => {
    navigate({ name: 'worldList', gameId, gameName });
  };

  const closeModal = (modalSound = false) => {
    if (modalSound) playModalCloseSound();
    else playCloseSound();
    returnToWorldList();
  };

  const buildMemberInputs = async () => {
    const namedMembers = members.filter((member) => member.name.trim());

    return Promise.all(
      namedMembers.map(async (member, index) => {
        if (member.file) {
          return { name: member.name.trim(), photoFile: member.file };
        }

        if (member.existingPath && member.previewUrl) {
          const blob = await fetchPreviewBlob(member.previewUrl);
          return {
            name: member.name.trim(),
            photoFile: new File([blob], `member-${index + 1}.webp`, {
              type: blob.type || 'image/webp',
            }),
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
      const memberInputs = await buildMemberInputs();
      const payload = {
        name: name.trim(),
        player: player.trim(),
        memo: memo.trim(),
        members: memberInputs,
        playerPhotoFile,
      };

      if (isEdit && worldId) {
        await updateWorld(worldId, payload);
        playSaveSound();
      } else {
        await createWorld(gameId, payload);
        playAchievementSound();
      }

      returnToWorldList();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05080E]/80 p-3 backdrop-blur-sm sm:p-4">
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#05080E]/80 p-3 backdrop-blur-sm sm:p-4 font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal(true);
      }}
    >
      <div className="world-edit-modal-panel hud-bracket relative my-auto flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-[#1E293B] bg-[#0F172A] text-[#F8FAFC] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-[#F59E0B]" />
            <h2 className="truncate text-sm font-black tracking-wider text-[#F8FAFC]">
              {isEdit ? 'ワールド設定の編集' : '新規冒険の書の作成'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => closeModal()}
            onMouseEnter={playHoverSound}
            className="rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-3.5">
            <div>
              <label className="mb-1.5 flex items-center justify-between gap-2 text-xs font-bold text-[#F8FAFC]">
                <span>ワールド名（冒険の書タイトル）</span>
                <span className="shrink-0 rounded border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                  必須
                </span>
              </label>
              <input
                autoFocus={!isEdit}
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onFocus={playInputFocusSound}
                placeholder="例: エメラルド諸島開拓記、天空古城の探索"
                className="world-modal-input text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#94A3B8]">
                  主開拓者 / プレイヤー名
                </label>
                <input
                  type="text"
                  value={player}
                  onChange={(event) => setPlayer(event.target.value)}
                  onFocus={playInputFocusSound}
                  placeholder="例: Uta_Adventurer"
                  className="world-modal-input text-sm"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#94A3B8]">
                  プレイヤーアバター / 写真
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <PhotoPicker
                    previewUrl={playerPhotoPreview}
                    onChange={(file) => setPlayerPhoto(file)}
                    label="プレイヤー写真"
                    accent="amber"
                    size="preset"
                  />
                  {WORLD_PRESET_AVATAR_LIST.map((preset) => {
                    const selected = selectedPresetKey === preset.key;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setPlayerPreset(preset.src, preset.key)}
                        onMouseEnter={playHoverSound}
                        className={`relative h-9 w-9 shrink-0 overflow-hidden rounded border-2 transition-all cursor-pointer ${
                          selected
                            ? 'scale-105 border-[#F59E0B] ring-2 ring-[#F59E0B]/30'
                            : 'border-[#334155] opacity-60 hover:opacity-100'
                        }`}
                        aria-label={`${preset.alt}プリセット`}
                        title={`${preset.alt}プリセット`}
                      >
                        <img src={preset.src} alt={preset.alt} className="h-full w-full object-cover pixelated" />
                        {selected && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#F59E0B]/20">
                            <Check className="h-3 w-3 text-[#F59E0B] stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
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
              onMouseEnter={playHoverSound}
              className="flex w-full items-center justify-between gap-2 py-2 text-left text-xs font-bold text-[#94A3B8] transition-colors hover:text-[#06B6D4] cursor-pointer"
            >
              <div className="flex min-w-0 items-center gap-1.5">
                <Users className="h-3.5 w-3.5 shrink-0 text-[#06B6D4]" />
                <span className="min-w-0">任意設定（同行メンバー・探検メモ）</span>
                <span className="hidden shrink-0 font-mono text-[10px] text-[#64748B] min-[390px]:inline">
                  ({configuredMembers.length} 名設定中)
                </span>
              </div>
              {showOptionalSection ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>

            {showOptionalSection && (
              <div className="mt-3 space-y-3.5 rounded-lg border border-[#1E293B] bg-[#0B1018]/60 p-3">
                <div>
                  <label className="mb-2 flex items-center justify-between gap-2 text-xs font-bold text-[#94A3B8]">
                    <span>同行メンバー（パーティ）</span>
                    <span className="whitespace-nowrap font-mono text-[10px] text-[#64748B]">
                      同行 {configuredMembers.length}名
                    </span>
                  </label>

                  <div className="space-y-2">
                    {members.map((member, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <PhotoPicker
                          previewUrl={member.previewUrl}
                          onChange={(file) => setMemberPhoto(index, file)}
                          label={`メンバー${index + 1}写真`}
                          accent="cyan"
                        />
                        <input
                          type="text"
                          value={member.name}
                          onChange={(event) => updateMemberName(index, event.target.value)}
                          onFocus={playInputFocusSound}
                          placeholder={`メンバー${index + 1} (例: Alisa)`}
                          className="world-modal-input min-w-0 flex-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => removeMember(index)}
                          onMouseEnter={playHoverSound}
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#334155] bg-[#161F30] text-[#64748B] transition-colors hover:border-[#EF4444]/60 hover:bg-[#2A161C] hover:text-[#EF4444] cursor-pointer"
                          aria-label={`メンバー${index + 1}を削除`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addMember}
                      onMouseEnter={playHoverSound}
                      className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded border border-[#06B6D4]/50 bg-[#06B6D4]/10 px-3 text-xs font-bold text-[#06B6D4] transition-colors hover:bg-[#06B6D4]/20 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>同行メンバーを追加</span>
                    </button>
                  </div>

                  {configuredMembers.length === 0 && (
                    <p className="mt-2 text-[11px] text-[#64748B]">同行メンバーなし（単独開拓モード）</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#94A3B8]">
                    探検概要・目標メモ
                  </label>
                  <textarea
                    rows={2}
                    value={memo}
                    onChange={(event) => setMemo(event.target.value)}
                    onFocus={playInputFocusSound}
                    placeholder="例: 東部沿岸の拠点設営と古代水没神殿の解明を目指す探検プロジェクト。"
                    className="world-modal-input resize-none text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2.5 border-t border-[#1E293B] bg-[#0B1018] px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => closeModal()}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="whitespace-nowrap rounded px-3.5 py-2 text-xs font-bold text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] disabled:opacity-50 cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="flex items-center gap-1.5 whitespace-nowrap rounded bg-[#F59E0B] px-4 sm:px-5 py-2 text-xs font-black tracking-wider text-[#0B1018] shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all hover:bg-[#D97706] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 shrink-0 fill-current" />
            <span>{saving ? '保存中...' : isEdit ? 'ワールドを更新' : '作成して冒険を開始'}</span>
          </button>
        </div>
      </div>

      <style>{`
        .world-modal-input {
          width: 100%;
          min-height: 40px;
          padding: 0.55rem 0.75rem;
          border: 1px solid #334155;
          border-radius: 0.375rem;
          background: #0B1018;
          color: #F8FAFC;
          outline: none;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .world-modal-input::placeholder { color: #64748B; }
        .world-modal-input:focus {
          border-color: #F59E0B;
          box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.28);
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

function PhotoPicker({
  previewUrl,
  onChange,
  label,
  accent,
  size = 'normal',
}: {
  previewUrl: string;
  onChange: (file: File | null) => void;
  label: string;
  accent: 'amber' | 'cyan';
  size?: 'normal' | 'preset';
}) {
  const accentClass =
    accent === 'amber'
      ? 'border-[#F59E0B] text-[#F59E0B] hover:border-[#FBBF24]'
      : 'border-[#06B6D4] text-[#06B6D4] hover:border-[#67E8F9]';
  const sizeClass = size === 'preset' ? 'h-9 w-9 rounded' : 'h-9 w-10 rounded';

  return (
    <label
      onMouseEnter={playHoverSound}
      className={`relative ${sizeClass} flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border-2 bg-[#05080E] transition-all ${accentClass}`}
      title={label}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" />
      ) : accent === 'amber' ? (
        <User className="h-4 w-4" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
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

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mime });
}

async function fetchPreviewBlob(previewUrl: string): Promise<Blob> {
  const response = await fetch(previewUrl);
  if (!response.ok) throw new Error('既存写真を読み込めませんでした');
  return response.blob();
}