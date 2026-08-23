import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { World } from '@/lib/types';
import { createWorld, fetchWorld, updateWorld } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';
import { playSaveSound } from '@/lib/sound';

export function WorldCreateScreen({
  gameId,
  gameName,
  worldId,
  navigate,
  goBack,
}: {
  gameId: string;
  gameName: string;
  worldId?: string;
  navigate: NavigateFn;
  goBack: () => void;
}) {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [loading, setLoading] = useState(Boolean(worldId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!worldId) return;
    fetchWorld(worldId)
      .then((world) => {
        if (!world) {
          setError('ワールドが見つかりません');
          return;
        }
        setName(world.name);
        setPlayer(world.player);
        setMemo(world.memo);
        setMembers(world.members.length ? world.members : ['']);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'ワールドの読み込みに失敗しました'))
      .finally(() => setLoading(false));
  }, [worldId]);

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        player: player.trim(),
        memo: memo.trim(),
        members: members.map((m) => m.trim()).filter(Boolean),
      };
      if (worldId) {
        await updateWorld(worldId, payload);
        playSaveSound();
      } else {
        await createWorld(gameId, payload);
      }
      goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11120f] text-stone-100">
        <Header title={`${gameName} - ワールド編集`} onBack={goBack} />
        <div className="p-6 text-center text-stone-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11120f] text-stone-100">
      <Header title={`${gameName} - ${worldId ? 'ワールド編集' : 'ワールド作成'}`} onBack={goBack} />
      <div className="px-4 py-5 max-w-2xl mx-auto">
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 shadow-[0_0_24px_rgba(0,0,0,0.25)]">
          {error && <ErrorBanner message={error} />}

          <div className="space-y-5">
            <Field label="ワールド名" required>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: サバイバル第1ワールド"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none focus:border-emerald-700"
              />
            </Field>

            <Field label="プレイヤー">
              <input
                type="text"
                value={player}
                onChange={(e) => setPlayer(e.target.value)}
                placeholder="あなたの名前"
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none focus:border-emerald-700"
              />
            </Field>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-zinc-300">関連メンバー</label>
                <button
                  type="button"
                  onClick={() => setMembers([...members, ''])}
                  className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  追加
                </button>
              </div>
              <div className="space-y-2">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => {
                        const next = [...members];
                        next[index] = e.target.value;
                        setMembers(next);
                      }}
                      placeholder={`メンバー${index + 1}`}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none focus:border-emerald-700"
                    />
                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMembers(members.filter((_, i) => i !== index))}
                        className="w-10 h-10 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-red-950/30 flex items-center justify-center transition-colors"
                        aria-label="メンバーを削除"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Field label="メモ">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="ワールドの概要や目標など"
                rows={4}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 outline-none focus:border-emerald-700 resize-none"
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium hover:bg-zinc-750 disabled:opacity-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/15 disabled:opacity-50 transition-colors"
              >
                {saving ? '保存中...' : worldId ? '更新する' : '作成する'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
