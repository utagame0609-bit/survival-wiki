import { Camera, Plus, X } from 'lucide-react';
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
  return (
    <>
      <Field label="プレイヤー">
        <div className="flex items-center gap-3">
          <PhotoPicker previewUrl={playerPhotoPreview} onChange={onPlayerPhotoChange} label="プレイヤー写真" />
          <input
            type="text"
            value={player}
            onChange={(event) => onPlayerChange(event.target.value)}
            onFocus={playInputFocusSound}
            placeholder="あなたの名前"
            className="modal-input flex-1"
          />
        </div>
      </Field>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs sm:text-sm font-bold text-slate-200">関連メンバー</label>
          <button
            type="button"
            onClick={() => {
              playAddSound();
              onAddMember();
            }}
            onMouseEnter={playHoverSound}
            className="min-h-[36px] px-2.5 flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            <Plus className="w-4 h-4" />追加
          </button>
        </div>

        <div className="space-y-2.5">
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-2">
              <PhotoPicker
                previewUrl={member.previewUrl}
                onChange={(file) => onMemberPhotoChange(index, file)}
                label={`メンバー${index + 1}写真`}
              />
              <input
                type="text"
                value={member.name}
                onChange={(event) => onMemberNameChange(index, event.target.value)}
                onFocus={playInputFocusSound}
                placeholder={`メンバー${index + 1}`}
                className="modal-input flex-1"
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    playDeleteSound();
                    onRemoveMember(index);
                  }}
                  onMouseEnter={playHoverSound}
                  className="min-h-[44px] min-w-[44px] border-2 border-slate-700 bg-[#141824] text-slate-400 hover:border-rose-500 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="メンバーを削除"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-bold text-slate-200 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PhotoPicker({ previewUrl, onChange, label }: { previewUrl: string; onChange: (file: File | null) => void; label: string }) {
  return (
    <label
      className="relative min-h-[44px] w-14 shrink-0 cursor-pointer overflow-hidden border-2 border-slate-700 bg-[#141824] flex items-center justify-center text-amber-400 hover:border-amber-400 hover:text-amber-300 transition-colors"
      title={label}
      onMouseEnter={playHoverSound}
    >
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}
