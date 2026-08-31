import { Camera, ChevronDown, ChevronUp, Plus, Trash2, User, Users } from 'lucide-react';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';
import { playHoverSound, playInputFocusSound } from '@/lib/sound';

export type WorldMemberDraft = {
  name: string;
  photo: File | null;
  previewUrl: string;
  existingPath: string | null;
};

type Props = {
  isEdit: boolean;
  name: string;
  player: string;
  playerPreview: string;
  memo: string;
  members: WorldMemberDraft[];
  showOptionalSection: boolean;
  onNameChange: (value: string) => void;
  onPlayerChange: (value: string) => void;
  onPlayerPhotoChange: (file: File | null) => void;
  onPlayerPreset: (src: string) => void;
  onToggleOptionalSection: () => void;
  onMemberPhotoChange: (index: number, file: File | null) => void;
  onMemberNameChange: (index: number, value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
  onMemoChange: (value: string) => void;
};

export function WorldCreateFormBody({
  isEdit,
  name,
  player,
  playerPreview,
  memo,
  members,
  showOptionalSection,
  onNameChange,
  onPlayerChange,
  onPlayerPhotoChange,
  onPlayerPreset,
  onToggleOptionalSection,
  onMemberPhotoChange,
  onMemberNameChange,
  onAddMember,
  onRemoveMember,
  onMemoChange,
}: Props) {
  const namedMembers = members.filter((member) => member.name.trim());

  return (
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
          onChange={(event) => onNameChange(event.target.value)}
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
            onChange={(event) => onPlayerChange(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="例: Uta_Adventurer"
            className="w-full rounded border border-[#334155] bg-[#0B1018] px-3 py-2 text-sm text-[#F8FAFC] outline-none transition-colors placeholder:text-[#64748B] focus:border-[#F59E0B]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-game text-[#94A3B8]">プレイヤーアバター / 写真</label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <PhotoPicker previewUrl={playerPreview} onChange={onPlayerPhotoChange} label="プレイヤー写真" accent="amber" />
            {WORLD_PRESET_AVATAR_LIST.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => onPlayerPreset(preset.src)}
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
            onToggleOptionalSection();
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
                      onChange={(file) => onMemberPhotoChange(index, file)}
                      label={`メンバー${index + 1}写真`}
                      accent="cyan"
                    />
                    <input
                      type="text"
                      value={member.name}
                      onChange={(event) => onMemberNameChange(index, event.target.value)}
                      onFocus={playInputFocusSound}
                      placeholder={`メンバー${index + 1} (例: リリス)`}
                      className="min-w-0 flex-1 rounded border border-[#334155] bg-[#161F30] px-3 py-1.5 text-xs text-[#F8FAFC] outline-none placeholder:text-[#64748B] focus:border-[#06B6D4]"
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(index)}
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
                onClick={onAddMember}
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
                onChange={(event) => onMemoChange(event.target.value)}
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
