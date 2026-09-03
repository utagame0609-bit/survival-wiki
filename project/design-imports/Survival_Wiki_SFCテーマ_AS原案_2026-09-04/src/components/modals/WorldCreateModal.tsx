import React, { useState } from 'react';
import { X, Save, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { World, WorldMember } from '../../types';

interface WorldCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (worldData: Partial<World>) => void;
  editWorld?: World | null;
}

export const WorldCreateModal: React.FC<WorldCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editWorld,
}) => {
  const [name, setName] = useState(editWorld?.name || '');
  const [player, setPlayer] = useState(editWorld?.player || '');
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState(editWorld?.playerPhotoUrl || '');
  const [memo, setMemo] = useState(editWorld?.memo || '');
  const [members, setMembers] = useState<WorldMember[]>(editWorld?.members || []);
  const [newMemberName, setNewMemberName] = useState('');

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    setMembers((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: newMemberName.trim(),
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      },
    ]);
    setNewMemberName('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !player.trim()) return;

    onSave({
      name: name.trim(),
      player: player.trim(),
      playerPhotoUrl: playerPhotoUrl.trim() || undefined,
      memo: memo.trim(),
      members,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="sfc-window w-full max-w-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] border border-black" />
            <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
              {editWorld ? '冒険の書を編集 (EDIT SAVE SLOT)' : '新規冒険の書を作成 (NEW SAVE SLOT)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1 rounded"
            title="閉じる"
          >
            <X className="w-4 h-4 text-[var(--text-main)]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* World Name */}
          <div className="space-y-1">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              ワールド名（冒険の書タイトル）*
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 30日サバイバル記録 - 第壱要塞線"
              className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
            />
          </div>

          {/* Player Name & Avatar URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                主人公／指揮官名 *
              </label>
              <input
                type="text"
                required
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                placeholder="例: ウタ (Uta)"
                className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                主人公アバター画像URL（任意）
              </label>
              <input
                type="url"
                value={playerPhotoUrl}
                onChange={(e) => setPlayerPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
              />
            </div>
          </div>

          {/* World Memo */}
          <div className="space-y-1">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              ワールド概要・方針メモ
            </label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="拠点の目標、サバイバルのルールや防衛ラインなど..."
              className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-sans leading-relaxed focus:outline-none focus:border-[var(--accent-blue)] shadow-inner resize-none"
            />
          </div>

          {/* Companion Members List */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-groove)]">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              同行メンバー一覧
            </label>

            <div className="flex items-center gap-2">
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
                placeholder="同行者名を入力して追加..."
                className="flex-1 p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="sfc-btn sfc-btn-convex sfc-btn-b px-3 py-2 text-xs font-dot flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>追加</span>
              </button>
            </div>

            {members.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--surface-2)] border border-[var(--border-main)] text-xs font-dot text-[var(--text-main)]"
                  >
                    <span>{m.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.id)}
                      className="text-[var(--accent-red)] hover:opacity-80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions (ABXY Buttons) */}
          <div className="pt-4 border-t border-[var(--border-main)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-2 text-xs font-dot"
            >
              キャンセル (CANCEL)
            </button>
            <button
              type="submit"
              className="sfc-btn sfc-btn-convex sfc-btn-b px-5 py-2 text-xs font-dot flex items-center gap-1.5 font-bold"
            >
              <Save className="w-4 h-4" />
              <span>保存して記録 (SAVE SLOT)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
