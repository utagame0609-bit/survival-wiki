import { Check, ChevronDown, Users } from 'lucide-react';
import type { WorldMember } from '@/lib/types';
import { playConfirmSound, playHoverSound, playInputFocusSound } from '@/lib/sound';

type LocationAdvancedFieldsProps = {
  open: boolean;
  detailMemo: string;
  members: WorldMember[];
  selectedMembers: Set<string>;
  createdAt: string;
  onToggleOpen: () => void;
  onDetailMemoChange: (value: string) => void;
  onToggleMember: (id: string) => void;
  onCreatedAtChange: (value: string) => void;
};

export function LocationAdvancedFields({
  open,
  detailMemo,
  members,
  selectedMembers,
  createdAt,
  onToggleOpen,
  onDetailMemoChange,
  onToggleMember,
  onCreatedAtChange,
}: LocationAdvancedFieldsProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => {
          onToggleOpen();
          playConfirmSound();
        }}
        onMouseEnter={playHoverSound}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-sm border border-sky-500/30 bg-sky-950/10 text-xs font-bold text-sky-400 hover:text-sky-300 hover:border-sky-400/60 transition-colors pt-2 cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          EXPAND PARAMETERS // 詳細メモ・仲間
        </span>
        <span className="text-[10px] text-slate-500">{open ? 'OPEN' : 'CLOSED'}</span>
      </button>

      {open && (
        <div className="space-y-4 p-4 rounded-sm bg-[#090d16] border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              FIELD NOTES // 詳細メモ
            </label>
            <textarea
              value={detailMemo}
              onChange={(event) => onDetailMemoChange(event.target.value)}
              onFocus={playInputFocusSound}
              placeholder="この場所についての地形・資源・魔物などのメモ"
              rows={3}
              className="location-input resize-none text-xs leading-relaxed text-slate-200"
            />
          </div>

          {members.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                COMPANIONS // 同行メンバー
              </label>
              <div className="flex flex-wrap gap-2">
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
                      className={`min-h-[40px] px-3 py-1.5 rounded-sm text-xs font-mono border-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        checked
                          ? 'bg-cyan-950/50 text-cyan-200 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.18)] font-bold'
                          : 'bg-[#0d1627] text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {checked && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                      {member.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              TIMESTAMP // 記録日時
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(event) => onCreatedAtChange(event.target.value)}
              onFocus={playInputFocusSound}
              className="location-input text-xs"
            />
          </div>
        </div>
      )}
    </>
  );
}
