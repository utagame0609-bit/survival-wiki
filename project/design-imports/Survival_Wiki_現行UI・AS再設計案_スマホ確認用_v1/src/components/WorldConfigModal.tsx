import React, { useState } from 'react';
import { X, Plus, Trash2, Shield, User, Image, Compass, Gamepad2, Sparkles, Calendar } from 'lucide-react';
import { World, ActivityGenre, PartyMember } from '../types';
import { playCloseSound, playHoverSound, playSaveSound, playConfirmSound } from '../audio/soundEngine';

interface WorldConfigModalProps {
  initialWorld?: World | null;
  onSave: (world: World) => void;
  onClose: () => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

export const WorldConfigModal: React.FC<WorldConfigModalProps> = ({
  initialWorld,
  onSave,
  onClose,
}) => {
  const isEdit = Boolean(initialWorld);

  const [name, setName] = useState(initialWorld?.name || '');
  const [genre, setGenre] = useState<ActivityGenre>(initialWorld?.genre || 'game');
  const [player, setPlayer] = useState(initialWorld?.player || 'ウタ');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(initialWorld?.playerPhotoUrl || SAMPLE_AVATARS[0]);
  const [memo, setMemo] = useState(initialWorld?.memo || '');
  const [members, setMembers] = useState<PartyMember[]>(
    initialWorld?.members || [
      { id: 'mem-1', name: 'ゴーレム', role: '採掘・護衛', avatarUrl: SAMPLE_AVATARS[1] },
      { id: 'mem-2', name: 'アレイ', role: 'アイテム回収', avatarUrl: SAMPLE_AVATARS[2] },
    ]
  );
  const [error, setError] = useState('');

  const handleAddMember = () => {
    playConfirmSound();
    const newId = `mem-${Date.now()}`;
    const randAvatar = SAMPLE_AVATARS[members.length % SAMPLE_AVATARS.length];
    setMembers([...members, { id: newId, name: `仲間${members.length + 1}`, role: '同行者', avatarUrl: randAvatar }]);
  };

  const handleRemoveMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleUpdateMember = (idx: number, field: keyof PartyMember, val: string) => {
    setMembers(
      members.map((m, i) => (i === idx ? { ...m, [field]: val } : m))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }
    if (!player.trim()) {
      setError('プレイヤー名を入力してください');
      return;
    }

    const savedWorld: World = {
      id: initialWorld?.id || `world-${Date.now()}`,
      name: name.trim(),
      genre,
      player: player.trim(),
      playerPhotoUrl: playerPhotoUrl.trim() || undefined,
      memo: memo.trim() || undefined,
      createdAt: initialWorld?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      members: members.filter((m) => m.name.trim().length > 0),
    };

    playSaveSound();
    onSave(savedWorld);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg max-h-[90vh] bg-[#141414] border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              CONFIG
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono">
              {isEdit ? '冒険の書を編集' : '新しい冒険の書を作成'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="p-1 text-[#737373] hover:text-[#E5E5E5] transition-colors cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-2.5 bg-red-950/70 border border-red-500/50 text-red-300 text-xs rounded-sm">
              {error}
            </div>
          )}

          {/* Genre selection */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1.5">
              記録カテゴリー (GENRE)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'game', label: 'ゲーム', icon: Gamepad2 },
                { id: 'travel', label: '旅行・探訪', icon: Compass },
                { id: 'hobby', label: '趣味・創作', icon: Sparkles },
                { id: 'daily', label: '日常・ログ', icon: Calendar },
              ].map((g) => {
                const Icon = g.icon;
                const isSelected = genre === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      playConfirmSound();
                      setGenre(g.id as ActivityGenre);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`py-2 px-2 border text-center rounded-sm transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                        : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* World Name */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1.5">
              冒険の書 / ワールド名 <span className="text-[#D4AF37]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: マインクラフト サバイバル第1期 / 関西探訪記"
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] text-[#E5E5E5] placeholder-[#525252] rounded-sm text-sm focus:border-[#D4AF37] focus:outline-none"
              required
            />
          </div>

          {/* Player Name & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1.5">
                記録主 / プレイヤー名 <span className="text-[#D4AF37]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  placeholder="例: ウタ"
                  className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] text-[#E5E5E5] placeholder-[#525252] rounded-sm text-sm focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1.5">
                プレイヤー画像URL
              </label>
              <input
                type="text"
                value={playerPhotoUrl}
                onChange={(e) => setPlayerPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] text-[#E5E5E5] placeholder-[#525252] rounded-sm text-xs font-mono focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1.5">
              冒険の概要・目標メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="例: サバイバル初見攻略。地下要塞探索とエンド討伐を目指す。"
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#262626] text-[#E5E5E5] placeholder-[#525252] rounded-sm text-xs focus:border-[#D4AF37] focus:outline-none resize-none"
            />
          </div>

          {/* Party Members */}
          <div className="border-t border-[#262626] pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-[#A3A3A3]">
                同行メンバー ({members.length}名)
              </label>
              <button
                type="button"
                onClick={handleAddMember}
                onMouseEnter={playHoverSound}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#D4AF37] hover:text-[#E5C158] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ メンバー追加</span>
              </button>
            </div>

            <div className="space-y-2">
              {members.map((member, idx) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 p-2 bg-[#0A0A0A] border border-[#262626] rounded-sm"
                >
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleUpdateMember(idx, 'name', e.target.value)}
                    placeholder="メンバー名"
                    className="flex-1 px-2.5 py-1 bg-[#141414] border border-[#262626] text-xs text-[#E5E5E5] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={member.role || ''}
                    onChange={(e) => handleUpdateMember(idx, 'role', e.target.value)}
                    placeholder="役割 (例: 採掘・ナビ)"
                    className="w-28 px-2.5 py-1 bg-[#141414] border border-[#262626] text-xs text-[#A3A3A3] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-1 text-[#737373] hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 bg-[#0A0A0A] border-t border-[#262626]">
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="flex-1 py-2.5 bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] font-mono text-xs font-bold border border-[#262626] rounded-sm transition-all cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            onMouseEnter={playHoverSound}
            className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono text-xs font-bold border-b-2 border-[#A68824] active:border-b-0 active:translate-y-0.5 rounded-sm transition-all shadow-md cursor-pointer"
          >
            ▶ {isEdit ? '冒険の書を更新' : '冒険の書を保存'}
          </button>
        </div>
      </div>
    </div>
  );
};
