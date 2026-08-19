import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
import type { NavigateFn } from '@/components/Navigation';

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
  const isEdit = Boolean(worldId);
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<string[]>(['']);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!worldId) return;
    fetchWorld(worldId)
      .then((w) => {
        if (!w) return;
        setName(w.name);
        setPlayer(w.player ?? '');
        setMemo(w.memo ?? '');
        setMembers(w.members.length > 0 ? w.members.map((m) => m.name) : ['']);
      })
      .catch((e) => setError(e.message))
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
      const memberNames = members.map((m) => m.trim()).filter(Boolean);
      if (isEdit && worldId) {
        await updateWorld(worldId, { name, player, memo, members: memberNames });
        goBack();
      } else {
        await createWorld(gameId, { name, player, memo, members: memberNames });
        goBack();
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header title={isEdit ? 'ワールド編集' : 'ワールド作成'} onBack={goBack} />
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header title={isEdit ? 'ワールド編集' : 'ワールド作成'} onBack={goBack} />
      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        {error && <ErrorBanner message={error} />}

        <Field label="ワールド名">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: サバイバル第1ワールド"
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </Field>

        <Field label="プレイヤー">
          <input
            type="text"
            value={player}
            onChange={(e) => setPlayer(e.target.value)}
            placeholder="あなたの名前"
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-stone-700">関連メンバー</label>
            <button
              onClick={() => setMembers([...members, ''])}
              className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-4 h-4" /> 追加
            </button>
          </div>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={m}
                  onChange={(e) => {
                    const next = [...members];
                    next[i] = e.target.value;
                    setMembers(next);
                  }}
                  placeholder={`メンバー${i + 1}`}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {members.length > 1 && (
                  <button
                    onClick={() => setMembers(members.filter((_, idx) => idx !== i))}
                    className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50"
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
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </Field>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-medium shadow-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
