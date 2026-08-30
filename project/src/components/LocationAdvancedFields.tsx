import { Check, ChevronDown, MapPin, Users } from 'lucide-react';
import type { WorldMember } from '@/lib/types';
import { playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';

type LocationAdvancedFieldsProps = {
  open: boolean;
  coordsText: string;
  coordsError: string;
  members: WorldMember[];
  selectedMembers: Set<string>;
  createdAt: string;
  onToggleOpen: () => void;
  onCoordsChange: (value: string) => void;
  onCoordsError: (value: string) => void;
  onToggleMember: (id: string) => void;
  onCreatedAtChange: (value: string) => void;
};

function splitCoords(coordsText: string): [string, string, string] {
  const parts = coordsText.trim().split(/\s+/).filter(Boolean);
  return [parts[0] ?? '', parts[1] ?? '', parts[2] ?? ''];
}

function joinCoords(next: [string, string, string]) {
  return next.join(' ').trimEnd();
}

export function LocationAdvancedFields({
  open,
  coordsText,
  coordsError,
  members,
  selectedMembers,
  createdAt,
  onToggleOpen,
  onCoordsChange,
  onCoordsError,
  onToggleMember,
  onCreatedAtChange,
}: LocationAdvancedFieldsProps) {
  const coords = splitCoords(coordsText);

  const changeCoord = (index: number, value: string) => {
    const next = [...coords] as [string, string, string];
    next[index] = value;
    onCoordsChange(joinCoords(next));
    if (coordsError) onCoordsError('');
  };

  return (
    <div className="pt-2 border-t border-[#1E293B]">
      <button
        type="button"
        onClick={() => {
          onToggleOpen();
          playConfirmSound();
        }}
        onMouseEnter={playHoverSound}
        className="w-full flex items-center justify-between py-2 text-xs game-ui-font text-[#94A3B8] hover:text-[#06B6D4] transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
          <span>詳細オプション（座標・同行者）</span>
          <span className="hidden sm:inline text-[10px] font-mono text-[#64748B]">
            {open ? '展開中' : '未設定時は座標非表示'}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-2.5 space-y-3.5 bg-[#0B1018]/60 p-3 rounded-lg border border-[#1E293B]">
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="text-xs game-ui-font text-[#94A3B8] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#F59E0B]" />
                空間座標 (X / Y / Z)
              </label>
              <span className="text-[10px] font-mono text-[#64748B]">
                空欄なら座標情報なし
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, index) => (
                <div key={axis}>
                  <div className="text-[10px] font-mono text-[#64748B] mb-0.5">
                    {axis === 'Y' ? 'Y 軸 (高度)' : `${axis} 軸`}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={coords[index]}
                    onChange={(event) => changeCoord(index, event.target.value)}
                    onFocus={playInputFocusSound}
                    placeholder={axis === 'Y' ? '例: 64' : axis === 'X' ? '例: 120' : '例: -310'}
                    className="location-input w-full px-2.5 py-1.5 text-xs font-mono text-[#F8FAFC]"
                  />
                </div>
              ))}
            </div>
            {coordsError && <p className="mt-1 text-xs text-[#EF4444]">{coordsError}</p>}
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-xs game-ui-font text-[#94A3B8] mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-[#06B6D4]" />
                同行メンバーを選択
              </label>
              <div className="flex flex-wrap gap-1.5">
                {members.map((member) => {
                  const checked = selectedMembers.has(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => {
                        playConfirmSound();
                        onToggleMember(member.id);
                      }}
                      onMouseEnter={playHoverSound}
                      className={`px-2.5 py-1 rounded text-xs transition-colors border cursor-pointer flex items-center gap-1 ${
                        checked
                          ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#38BDF8] font-bold'
                          : 'bg-[#161F30] border-[#334155] text-[#94A3B8] hover:text-[#E2E8F0]'
                      }`}
                    >
                      {checked && <Check className="w-3 h-3" />}
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs game-ui-font text-[#94A3B8] mb-1.5">
              記録日時
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(event) => onCreatedAtChange(event.target.value)}
              onFocus={playInputFocusSound}
              className="location-input w-full text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
