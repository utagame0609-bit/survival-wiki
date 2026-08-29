import { Check, ChevronDown, Compass, Users } from 'lucide-react';
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
    <>
      <button
        type="button"
        onClick={() => { onToggleOpen(); playConfirmSound(); }}
        onMouseEnter={playHoverSound}
        className="flex w-full items-center justify-between gap-2 border border-amber-500/30 bg-amber-950/10 px-3 py-2.5 text-xs font-bold text-amber-400 transition-all hover:-translate-y-[2px] hover:border-amber-400/60 hover:text-amber-300 cursor-pointer"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
          <span className="truncate">{open ? '詳細オプションを閉じる' : '詳細オプションを開く'}</span>
        </span>
        <span className="shrink-0 text-[9px] font-normal text-slate-500">座標・仲間・日時</span>
      </button>

      {open && (
        <div className="space-y-4 border border-slate-800 bg-[#090d16] p-3.5 sm:p-4">
          <div>
            <label className="mb-1.5 flex flex-col gap-0.5 text-xs font-bold uppercase tracking-wider text-slate-300 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400"><Compass className="h-4 w-4" /><span>COORDINATES // 座標</span></span>
              <span className="text-[9px] font-normal text-slate-500">X / Y / Z を入力（任意）</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['X', 'Y', 'Z'] as const).map((axis, index) => (
                <div key={axis} className="min-w-0">
                  <div className="mb-1 text-[9px] font-mono font-bold text-slate-500">{axis}</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={coords[index]}
                    onChange={(event) => changeCoord(index, event.target.value)}
                    onFocus={playInputFocusSound}
                    placeholder={axis === 'Y' ? '64' : '0'}
                    className="location-input w-full text-sm font-mono tabular-nums text-emerald-300 placeholder-slate-600"
                  />
                </div>
              ))}
            </div>
            {coordsError && <p className="mt-1 text-xs text-rose-400">{coordsError}</p>}
          </div>

          {members.length > 0 && (
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                <Users className="h-4 w-4 text-cyan-400" /> COMPANIONS // 同行メンバー
              </label>
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const checked = selectedMembers.has(member.id);
                  return (
                    <button
                      type="button"
                      key={member.id}
                      onClick={() => { playConfirmSound(); onToggleMember(member.id); }}
                      onMouseEnter={playHoverSound}
                      className={`flex min-h-[40px] items-center gap-1.5 rounded-sm border-2 px-3 py-1.5 text-xs font-mono transition-all hover:-translate-y-[2px] cursor-pointer ${checked ? 'border-cyan-400 bg-cyan-950/50 font-bold text-cyan-200 shadow-[0_0_10px_rgba(34,211,238,0.18)]' : 'border-slate-800 bg-[#0d1627] text-slate-400 hover:border-slate-600 hover:text-slate-200'}`}
                    >
                      {checked && <Check className="h-3.5 w-3.5 text-cyan-400 stroke-[3]" />}{member.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">TIMESTAMP // 記録日時</label>
            <input type="datetime-local" value={createdAt} onChange={(event) => onCreatedAtChange(event.target.value)} onFocus={playInputFocusSound} className="location-input w-full text-xs" />
          </div>
        </div>
      )}
    </>
  );
}
