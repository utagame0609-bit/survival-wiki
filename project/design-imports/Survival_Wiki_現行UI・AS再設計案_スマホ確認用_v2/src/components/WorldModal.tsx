import React, { useState } from 'react';
import { X, Gamepad2, Compass, Heart, Sparkles, UserPlus, Trash2, Check, Camera } from 'lucide-react';
import { World, WorldCategory } from '../types';
import { sound } from '../audio/soundEngine';

interface WorldModalProps {
  worldToEdit?: World | null;
  onSave: (worldData: Omit<World, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

const CATEGORIES: { id: WorldCategory; label: string; icon: any; color: string }[] = [
  { id: 'game', label: 'ゲームサバイバル', icon: Gamepad2, color: 'text-[#ff8c00] border-[#ff8c00] bg-[#ff8c00]/10 shadow-[2px_2px_0px_#000000]' },
  { id: 'travel', label: '旅行・探訪', icon: Compass, color: 'text-[#00ff41] border-[#00ff41] bg-[#00ff41]/10 shadow-[2px_2px_0px_#000000]' },
  { id: 'hobby', label: '趣味・研究', icon: Sparkles, color: 'text-[#ffa500] border-[#ffa500] bg-[#ffa500]/10 shadow-[2px_2px_0px_#000000]' },
  { id: 'life', label: '日常・ライフログ', icon: Heart, color: 'text-[#00e5ff] border-[#00e5ff] bg-[#00e5ff]/10 shadow-[2px_2px_0px_#000000]' },
];

export const WorldModal: React.FC<WorldModalProps> = ({ worldToEdit, onSave, onClose }) => {
  const [name, setName] = useState(worldToEdit?.name || '');
  const [player, setPlayer] = useState(worldToEdit?.player || 'ウタ');
  const [memo, setMemo] = useState(worldToEdit?.memo || '');
  const [category, setCategory] = useState<WorldCategory>(worldToEdit?.category || 'game');
  const [members, setMembers] = useState<{ id: string; name: string; role?: string }[]>(
    worldToEdit?.members || [{ id: 'm1', name: '探索仲間', role: '同行' }]
  );
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    sound.playConfirm();
    setMembers([
      ...members,
      { id: 'm-' + Date.now().toString(36), name: newMemberName.trim(), role: 'メンバー' },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    sound.playCancel();
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sound.playSaveLog();
    const catObj = CATEGORIES.find((c) => c.id === category);
    onSave({
      name: name.trim(),
      player: player.trim() || '名無しの探索者',
      memo: memo.trim(),
      category,
      categoryLabel: catObj?.label || 'WORLD',
      members: members.filter((m) => m.name.trim()),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          sound.playCancel();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#0a0a0c] border-2 border-[#ff8c00] shadow-[8px_8px_0px_#000000] rounded-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#121214] border-b-2 border-[#333338]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] terminal-font font-bold bg-[#ff8c00]/20 text-[#ff8c00] border border-[#ff8c00]">
              SAVE SLOT CONFIG
            </span>
            <h3 className="text-sm sm:text-base font-black text-white terminal-font">
              {worldToEdit ? 'ワールド・冒険の書を編集' : '新しい冒険の書を作成'}
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playCancel();
              onClose();
            }}
            className="p-1.5 text-[#888888] hover:text-white rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[75vh] bg-[#0e0e11]">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5 terminal-font">
              CATEGORY // 記録のジャンル
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playConfirm();
                      setCategory(cat.id);
                    }}
                    className={`p-2.5 rounded-lg border-2 text-left flex items-center gap-2.5 transition cursor-pointer ${
                      isSelected
                        ? `${cat.color} font-bold ring-1 ring-[#ff8c00]`
                        : 'bg-[#141417] border-[#333338] text-[#888888] hover:text-[#dcdcdc] shadow-[2px_2px_0px_#000000]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-xs terminal-font">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* World Name */}
          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5 terminal-font">
              WORLD NAME // ワールド・旅の名前 <span className="text-[#ff8c00]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 第1サバイバル期、大阪〜京都食べ歩き、など"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181c] border-2 border-[#333338] text-white text-sm focus:border-[#ff8c00] outline-none transition terminal-font shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5 terminal-font">
              PLAYER // 記録者・プレイヤー名
            </label>
            <input
              type="text"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              placeholder="あなたの名前やニックネーム"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181c] border-2 border-[#333338] text-white text-sm focus:border-[#ff8c00] outline-none transition terminal-font shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Members / Companions */}
          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5 terminal-font">
              MEMBERS // 同行者・探検仲間
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {members.map((m) => (
                <span
                  key={m.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18181c] border border-[#333338] text-xs text-[#dcdcdc] terminal-font shadow-[1px_1px_0px_#000000]"
                >
                  <span>@{m.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(m.id)}
                    className="text-[#888888] hover:text-rose-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              {members.length === 0 && (
                <span className="text-xs text-[#666666] terminal-font">メンバーなし（単独）</span>
              )}
            </div>
            <div className="flex gap-2">
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
                placeholder="新しいメンバー名を入力"
                className="flex-1 px-3 py-2 rounded-lg bg-[#18181c] border-2 border-[#333338] text-white text-xs focus:border-[#ff8c00] outline-none transition terminal-font shadow-[2px_2px_0px_#000000]"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-2 bg-[#18181c] hover:bg-[#202026] text-[#dcdcdc] text-xs rounded-lg border-2 border-[#333338] flex items-center gap-1 cursor-pointer font-bold terminal-font shadow-[2px_2px_0px_#000000]"
              >
                <UserPlus className="w-3.5 h-3.5 text-[#ff8c00]" /> 追加
              </button>
            </div>
          </div>

          {/* Memo / Description */}
          <div>
            <label className="block text-xs font-bold text-[#aaaaaa] mb-1.5 terminal-font">
              MEMO // 冒険の概要・目的
            </label>
            <textarea
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="このワールドの目標や、旅の予定などを記録できます"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#18181c] border-2 border-[#333338] text-white text-xs focus:border-[#ff8c00] outline-none transition resize-none terminal-font shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t-2 border-[#202026] flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                sound.playCancel();
                onClose();
              }}
              className="px-4 py-2.5 rounded-lg bg-[#18181c] hover:bg-[#202026] text-[#888888] hover:text-white text-xs font-bold transition cursor-pointer border border-[#333338] terminal-font"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#ff8c00] hover:bg-[#ffa500] text-black font-extrabold text-xs active:scale-95 transition shadow-[3px_3px_0px_#000000] flex items-center gap-1.5 cursor-pointer terminal-font"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {worldToEdit ? '▶ 冒険の書を更新' : '▶ 冒険の書を作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
