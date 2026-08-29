import React, { useState } from 'react';
import { World, PartyMember } from '../../types';
import { X, Shield, Users, Plus, Trash2, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface WorldModalProps {
  worldToEdit?: World | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (worldData: Partial<World>) => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

const COMPANION_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
];

export const WorldModal: React.FC<WorldModalProps> = ({
  worldToEdit,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!worldToEdit;
  const [name, setName] = useState(worldToEdit?.name || '');
  const [leaderName, setLeaderName] = useState(worldToEdit?.leaderName || '開拓者');
  const [leaderAvatar, setLeaderAvatar] = useState(
    worldToEdit?.leaderAvatar || PRESET_AVATARS[0]
  );
  const [memo, setMemo] = useState(worldToEdit?.memo || '');
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>(
    worldToEdit?.partyMembers || []
  );
  const [newMemberName, setNewMemberName] = useState('');
  const [showOptionalSection, setShowOptionalSection] = useState(
    isEditing || (worldToEdit?.partyMembers && worldToEdit.partyMembers.length > 0) || false
  );

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    soundEngine.playSe('menu_cursor');
    const randomAvatar = COMPANION_AVATARS[partyMembers.length % COMPANION_AVATARS.length];
    setPartyMembers((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        name: newMemberName.trim(),
        avatar: randomAvatar,
      },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    soundEngine.playSe('menu_cursor');
    setPartyMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEngine.playSe('save_record');
    onSave({
      name: name.trim(),
      leaderName: leaderName.trim() || '開拓者',
      leaderAvatar,
      memo: memo.trim(),
      partyMembers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-lg shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider">
              {isEditing ? 'ワールド設定の編集' : '新規冒険の書の作成'}
            </h3>
          </div>

          <button
            id="btn-close-world-modal"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: REQUIRED CORE INFO */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-game text-[#F8FAFC] mb-1.5 flex items-center justify-between">
                <span>ワールド名（冒険の書タイトル）</span>
                <span className="text-[10px] font-mono text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                  必須
                </span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: エメラルド諸島開拓記、天空古城の探索"
                className="w-full px-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#F59E0B] rounded text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
              />
            </div>

            {/* Leader Info & Avatar Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-game text-[#94A3B8] mb-1.5">
                  主開拓者 / プレイヤー名
                </label>
                <input
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="例: Uta_Adventurer"
                  className="w-full px-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#F59E0B] rounded text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-game text-[#94A3B8] mb-1.5">
                  プレイヤーアバター
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((avatar, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundEngine.playSe('menu_cursor');
                        setLeaderAvatar(avatar);
                      }}
                      className={`relative w-9 h-9 rounded shrink-0 overflow-hidden border-2 transition-all ${
                        leaderAvatar === avatar
                          ? 'border-[#F59E0B] ring-2 ring-[#F59E0B]/30 scale-105'
                          : 'border-[#334155] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={avatar} alt="Preset" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {leaderAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#F59E0B]/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-[#F59E0B] stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: OPTIONAL DETAILS TOGGLE */}
          <div className="pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_cursor');
                setShowOptionalSection(!showOptionalSection);
              }}
              className="w-full flex items-center justify-between py-2 text-xs font-game text-[#94A3B8] hover:text-[#06B6D4] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>任意設定（同行メンバー・探検メモ）</span>
                <span className="text-[10px] font-mono text-[#64748B]">
                  ({partyMembers.length} 名設定中)
                </span>
              </div>
              {showOptionalSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showOptionalSection && (
              <div className="mt-3 space-y-3.5 bg-[#0B1018]/60 p-3 rounded-lg border border-[#1E293B]">
                {/* Party Members Section */}
                <div>
                  <label className="block text-xs font-game text-[#94A3B8] mb-1.5 flex items-center justify-between">
                    <span>同行メンバー（パーティ）</span>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      最大5名まで
                    </span>
                  </label>

                  {/* Member Add Field */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddMember();
                        }
                      }}
                      placeholder="例: Alisa (偵察員)"
                      className="flex-1 px-3 py-1.5 bg-[#161F30] border border-[#334155] focus:border-[#06B6D4] rounded text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 bg-[#06B6D4]/20 hover:bg-[#06B6D4]/30 border border-[#06B6D4]/50 text-[#06B6D4] rounded text-xs font-game flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>追加</span>
                    </button>
                  </div>

                  {/* Members list chips */}
                  {partyMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {partyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1.5 px-2 py-1 bg-[#161F30] border border-[#334155] rounded text-xs text-[#E2E8F0]"
                        >
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-4 h-4 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[11px] font-jp">{member.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-[#64748B] hover:text-[#EF4444] ml-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#64748B] font-jp">
                      同行メンバーなし（単独開拓モード）
                    </p>
                  )}
                </div>

                {/* World Memo / Objective */}
                <div>
                  <label className="block text-xs font-game text-[#94A3B8] mb-1.5">
                    探検概要・目標メモ
                  </label>
                  <textarea
                    rows={2}
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="例: 東部沿岸の拠点設営と古代水没神殿の解明を目指す探検プロジェクト。"
                    className="w-full px-3 py-2 bg-[#161F30] border border-[#334155] focus:border-[#F59E0B] rounded text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors resize-none font-jp"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_back');
                onClose();
              }}
              className="px-3.5 py-2 rounded text-xs font-game text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            >
              キャンセル
            </button>

            <button
              id="btn-submit-world-form"
              type="submit"
              className="px-5 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>{isEditing ? 'ワールドを更新' : '作成して冒険を開始'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
