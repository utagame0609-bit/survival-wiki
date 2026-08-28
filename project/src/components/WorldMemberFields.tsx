import { Camera, Plus, X, User, Users } from 'lucide-react';
import { playAddSound, playDeleteSound, playHoverSound, playInputFocusSound } from '@/lib/sound';

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
  onMemberPhotoChange,
  onMemberNameChange,
  onAddMember,
  onRemoveMember,
}: WorldMemberFieldsProps) {
  const namedMembers = members.filter((member) => member.name.trim());

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
          <label className="hidden sm:flex min-h-[42px] shrink-0 items-center gap-1.5 border border-slate-600 bg-slate-800 px-2.5 text-[11px] font-mono font-bold text-amber-300 cursor-pointer hover:border-amber-400 transition-colors">
            <Camera className="h-3.5 w-3.5" />
            写真変更
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => onPlayerPhotoChange(event.target.files?.[0] ?? null)} />
          </label>
        </div>
      </section>

      <section className="border border-slate-700/80 bg-[#0a101d] p-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <label className="text-xs font-black text-slate-200">同行メンバー / 仲間（友達・ペット・NPC）</label>
          <span className="text-[10px] text-slate-500 font-mono">{1 + namedMembers.length}人パーティ</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <PartyChip name={player || '自分'} photoUrl={playerPhotoPreview} player />
          {namedMembers.map((member, index) => (
            <PartyChip key={`${member.name}-${index}`} name={member.name} photoUrl={member.previewUrl} />
          ))}
        </div>

        <div className="border border-slate-700/80 bg-[#12192c] p-2.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
            <span>＋ 新しい仲間を追加</span>
            <span className="text-[10px] text-slate-500">写真対応</span>
          </div>

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
                  className="modal-input flex-1 text-xs"
                />
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      playDeleteSound();
                      onRemoveMember(index);
                    }}
                    onMouseEnter={playHoverSound}
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-700 bg-[#141824] text-slate-400 hover:border-rose-500 hover:text-rose-300 transition-colors cursor-pointer"
                    aria-label="メンバーを削除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              playAddSound();
              onAddMember();
            }}
            onMouseEnter={playHoverSound}
            className="flex min-h-[38px] w-full items-center justify-center gap-1 border border-cyan-500/60 bg-cyan-950/20 px-3 text-xs font-black text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            スロット追加
          </button>
        </div>
      </section>
    </div>
  );
}

function PartyChip({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 border px-2 py-1 ${player ? 'border-amber-500/60 bg-amber-500/15 text-amber-300' : 'border-cyan-500/50 bg-[#141e33] text-cyan-200'}`}>
      <div className={`flex h-6 w-6 items-center justify-center overflow-hidden border bg-[#090d16] ${player ? 'border-amber-400' : 'border-cyan-400/70'}`}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover pixelated" /> : player ? <User className="h-3.5 w-3.5 text-amber-400" /> : <Users className="h-3.5 w-3.5 text-cyan-400" />}
      </div>
      <span className="max-w-[90px] truncate text-[10px] font-bold">{player ? `★ ${name}` : `@${name}`}</span>
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
  const accentClass = accent === 'amber' ? 'border-amber-400 text-amber-400 hover:border-amber-300' : 'border-cyan-400 text-cyan-300 hover:border-cyan-300';
  const sizeClass = size === 'large' ? 'h-14 w-14' : 'h-10 w-12';

  return (
    <label className={`relative ${sizeClass} shrink-0 cursor-pointer overflow-hidden border-2 bg-[#050a14] flex items-center justify-center transition-colors ${accentClass}`} title={label}>
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}
