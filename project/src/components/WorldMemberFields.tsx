import { Camera, Plus, X, User, Users } from 'lucide-react';
import { playAddSound, playDeleteSound, playHoverSound, playInputFocusSound } from '@/lib/sound';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';

export type MemberPhotoState = {
  name: string;
  file: File | null;
  previewUrl: string;
  existingPath: string | null;
};

type WorldMemberFieldsProps = {
  player: string;
  playerPhotoPreview: string;
  members: MemberPhotoState[];
  onPlayerChange: (value: string) => void;
  onPlayerPhotoChange: (file: File | null) => void;
  onPlayerPresetChange?: (src: string) => void;
  onMemberPhotoChange: (index: number, file: File | null) => void;
  onMemberNameChange: (index: number, value: string) => void;
  onAddMember: () => void;
  onRemoveMember: (index: number) => void;
};

export function WorldMemberFields({
  player,
  playerPhotoPreview,
  members,
  onPlayerChange,
  onPlayerPhotoChange,
  onPlayerPresetChange,
  onMemberPhotoChange,
  onMemberNameChange,
  onAddMember,
  onRemoveMember,
}: WorldMemberFieldsProps) {
  const namedMembers = members
    .map((member, index) => ({ member, index }))
    .filter(({ member }) => member.name.trim());
  const draftMemberIndex = members.findIndex((member) => !member.name.trim());

  return (
    <div className="space-y-4">
      <section className="border border-slate-700/80 bg-[#0a101d] p-3 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-amber-300">主開拓者（プレイヤー名＋アバター/写真）</label>
          <span className="text-[10px] text-slate-500 font-mono">写真タップで変更</span>
        </div>

        <div className="flex items-center gap-3">
          <PhotoPicker
            previewUrl={playerPhotoPreview}
            onChange={onPlayerPhotoChange}
            label="プレイヤー写真"
            accent="amber"
            size="large"
          />
          <input
            type="text"
            value={player}
            onChange={(event) => onPlayerChange(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="あなたの名前 (例: 探索者アルト)"
            className="modal-input flex-1"
          />
          <label onMouseEnter={playHoverSound} className="hidden sm:flex min-h-[42px] shrink-0 items-center gap-1.5 border border-slate-600 bg-slate-800 px-2.5 text-[11px] font-mono font-bold text-amber-300 cursor-pointer hover:border-amber-400 hover:-translate-y-[3px] transition-all">
            <Camera className="h-3.5 w-3.5" />
            写真変更
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => onPlayerPhotoChange(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {onPlayerPresetChange && (
          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono">プリセット:</span>
            {WORLD_PRESET_AVATAR_LIST.map((preset) => {
              const selected = playerPhotoPreview === preset.src;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => {
                    playHoverSound();
                    onPlayerPresetChange(preset.src);
                  }}
                  onMouseEnter={playHoverSound}
                  className={`h-7 w-7 overflow-hidden border bg-[#050a14] transition-all cursor-pointer ${
                    selected
                      ? 'border-amber-400 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.28)]'
                      : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                  }`}
                  aria-label={`${preset.alt}プリセット`}
                  title={`${preset.alt}プリセット`}
                >
                  <img src={preset.src} alt={preset.alt} className="h-full w-full object-cover pixelated" />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="border border-slate-700/80 bg-[#0a101d] p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-slate-200">同行メンバー / 仲間（友達・ペット・NPC）</label>
          <span className="text-[10px] text-slate-500 font-mono">{1 + namedMembers.length}人パーティ</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <PartyChip name={player || '自分'} photoUrl={playerPhotoPreview} player />
          {namedMembers.map(({ member, index }) => (
            <PartyChip
              key={`${member.name}-${index}`}
              name={member.name}
              photoUrl={member.previewUrl}
              onRemove={() => {
                playDeleteSound();
                onRemoveMember(index);
              }}
            />
          ))}
        </div>

        <div className="border border-slate-700/80 bg-[#12192c] p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>＋ 新しい仲間を追加</span>
            <span className="text-[10px] text-slate-500">スクショ/写真対応</span>
          </div>

          {draftMemberIndex >= 0 ? (
            <div className="flex items-center gap-2">
              <PhotoPicker
                previewUrl={members[draftMemberIndex]?.previewUrl ?? ''}
                onChange={(file) => onMemberPhotoChange(draftMemberIndex, file)}
                label="新しい仲間の写真"
                accent="cyan"
              />
              <input
                type="text"
                value={members[draftMemberIndex]?.name ?? ''}
                onChange={(event) => onMemberNameChange(draftMemberIndex, event.target.value)}
                onFocus={playInputFocusSound}
                placeholder="友達の名前・ペット名..."
                className="modal-input flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!members[draftMemberIndex]?.name.trim()) return;
                  playAddSound();
                  onAddMember();
                }}
                onMouseEnter={playHoverSound}
                className="flex min-h-[42px] shrink-0 items-center justify-center gap-1 border border-cyan-500/80 bg-cyan-500 px-3 text-xs font-black text-slate-950 hover:bg-cyan-400 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                追加
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                playAddSound();
                onAddMember();
              }}
              onMouseEnter={playHoverSound}
              className="flex min-h-[40px] w-full items-center justify-center gap-1 border border-cyan-500/60 bg-cyan-950/20 px-3 text-xs font-black text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              新しい仲間を追加
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

function PartyChip({
  name,
  photoUrl,
  player = false,
  onRemove,
}: {
  name: string;
  photoUrl: string;
  player?: boolean;
  onRemove?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 border px-2 py-1 ${
        player
          ? 'border-amber-500/60 bg-amber-500/15 text-amber-300'
          : 'border-cyan-500/50 bg-[#141e33] text-cyan-200'
      }`}
    >
      <div
        className={`flex h-5 w-5 items-center justify-center overflow-hidden border bg-[#090d16] ${
          player ? 'border-amber-400' : 'border-cyan-400/70'
        }`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover pixelated" />
        ) : player ? (
          <User className="h-3.5 w-3.5 text-amber-400" />
        ) : (
          <Users className="h-3.5 w-3.5 text-cyan-400" />
        )}
      </div>
      <span className="max-w-[90px] truncate text-[10px] font-bold">
        {player ? `★ ${name}` : `@${name}`}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          onMouseEnter={playHoverSound}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-rose-300 cursor-pointer"
          aria-label={`${name}を解除`}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function PhotoPicker({
  previewUrl,
  onChange,
  label,
  accent = 'amber',
  size = 'normal',
}: {
  previewUrl: string;
  onChange: (file: File | null) => void;
  label: string;
  accent?: 'amber' | 'cyan';
  size?: 'normal' | 'large';
}) {
  const accentClass =
    accent === 'amber'
      ? 'border-amber-400 text-amber-400 hover:border-amber-300 hover:bg-amber-500/10 hover:shadow-[0_0_14px_rgba(245,158,11,0.35)] hover:brightness-110 hover:-translate-y-[3px]'
      : 'border-cyan-400 text-cyan-300 hover:border-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_14px_rgba(34,211,238,0.32)] hover:brightness-110 hover:-translate-y-[3px]';
  const sizeClass = size === 'large' ? 'h-14 w-14' : 'h-10 w-12';

  return (
    <label
      onMouseEnter={playHoverSound}
      className={`relative ${sizeClass} shrink-0 cursor-pointer overflow-hidden border-2 bg-[#050a14] flex items-center justify-center transition-all ${accentClass}`}
      title={label}
    >
      {previewUrl ? (
        <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" />
      ) : (
        <Camera className="h-5 w-5" />
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
