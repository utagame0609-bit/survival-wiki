import { useState } from 'react';
import type React from 'react';
import { X, Plus, Sparkles, User } from 'lucide-react';
import { createWorld } from '@/lib/db';
import { playConfirmSound, playCancelSound } from '@/lib/sound';

export function WorldCreateModal({
  gameId,
  onClose,
  onCreated,
}: {
  gameId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [worldName, setWorldName] = useState('');
  const [playerName, setPlayerName] = useState('ウタ');
  const [members, setMembers] = useState<Array<{ name: string; photo_path: string | null }>>([
    { name: 'ゴーレム', photo_path: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80' },
    { name: 'アレイ', photo_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    if (members.length >= 4) {
      setError('メンバーは最大4名まで追加できます（プレイヤー含め計5名）');
      return;
    }
    playConfirmSound();
    setMembers([...members, { name: newMemberName.trim(), photo_path: null }]);
    setNewMemberName('');
    setError('');
  };

  const handleRemoveMember = (idx: number) => {
    playCancelSound();
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldName.trim()) {
      setError('ワールド名を入力してください');
      return;
    }
    setSaving(true);
    setError('');
    playConfirmSound();
    try {
      await createWorld(gameId, worldName, playerName, members);
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCancelSound();
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="double-border w-full max-w-lg bg-[#0a1120] p-6 text-[#f0f0f0] shadow-[0_0_40px_rgba(0,0,0,0.9)]"
      >
        {/* Window Header */}
        <div className="flex items-center justify-between border-b border-white/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-white bg-[#1a2333] flex items-center justify-center text-amber-400">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div>
              <div className="pixel-font text-[8px] tracking-widest amber-text">NEW SAVE SLOT</div>
              <h2 className="retro-font text-lg font-bold text-[#f0f0f0]">新しいワールドを作成</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onClose();
            }}
            className="w-7 h-7 border border-zinc-600 bg-[#0a1120] text-zinc-400 hover:border-white hover:text-white flex items-center justify-center text-xs"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 border border-red-500 bg-red-950/60 p-2.5 retro-font text-xs text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 retro-font">
          {/* World Name */}
          <div>
            <label className="block text-xs font-bold tracking-wider amber-text uppercase">
              ▶ ワールド名 <span className="pixel-font text-[8px] text-red-400">*REQ</span>
            </label>
            <input
              type="text"
              required
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              placeholder="例: テストプレイ：はじまりの森"
              className="mt-1 w-full border-2 border-white/30 bg-[#0f172a] px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-zinc-600 focus:border-white focus:outline-none"
            />
          </div>

          {/* Player Name */}
          <div>
            <label className="block text-xs font-bold tracking-wider green-text uppercase">
              ▶ 主人公（プレイヤー名）
            </label>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center border border-white/40 bg-[#162032] text-[#3df30b] shrink-0">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="プレイヤー名 (例: ウタ)"
                className="w-full border-2 border-white/30 bg-[#0f172a] px-3 py-2 text-sm text-[#f0f0f0] placeholder:text-zinc-600 focus:border-[#3df30b] focus:outline-none"
              />
            </div>
          </div>

          {/* Party Members (Max 4 additional = 5 total) */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold tracking-wider blue-text uppercase">
                ▶ 同行メンバー（最大4名 / 現在 {members.length} 名）
              </label>
              <span className="pixel-font text-[8px] text-zinc-400">PARTY ROSTER</span>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {/* Player Tag */}
              <div className="flex items-center gap-1.5 border border-white/40 bg-[#162032] px-2 py-1 text-xs text-[#3df30b]">
                <span className="pixel-font text-[8px] text-[#3df30b]">P1</span>
                <span>{playerName || '主人公'}</span>
              </div>

              {members.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 border border-white/20 bg-[#10192d] px-2 py-1 text-xs text-[#00d4ff]"
                >
                  <span className="pixel-font text-[8px] text-[#00d4ff]">M{idx + 1}</span>
                  <span>{m.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="ml-1 text-zinc-400 hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {members.length < 4 && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="追加するメンバー名 (例: ルーン, ポポ)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                  className="flex-1 border border-white/20 bg-[#0f172a] px-3 py-1.5 text-xs text-[#f0f0f0] placeholder:text-zinc-600 focus:border-[#00d4ff] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="pixel-btn px-3 py-1.5 text-[10px] flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> 追加
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-4">
            <button
              type="button"
              onClick={() => {
                playCancelSound();
                onClose();
              }}
              className="pixel-btn bg-zinc-800 text-white hover:bg-zinc-700 py-3 text-xs"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={saving}
              className="pixel-btn bg-white text-[#0a1120] hover:bg-emerald-400 py-3 text-xs font-bold disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
