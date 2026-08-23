import { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { createWorld, updateWorld, fetchWorld } from '@/lib/db';
import { Header } from '@/components/Navigation';
import { Spinner, ErrorBanner } from '@/components/Feedback';
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
        playSaveSound();
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

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-emerald-950/70 bg-zinc-900/80 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-700/70 transition-colors';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#11120f] text-zinc-100">
        <Header title={isEdit ? 'ワールド編集' : 'ワールド作成'} onBack={goBack} />
        <Spinner label="読み込み中" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#11120f] text-zinc-100">
      <Header title={isEdit ? 'ワールド編集' : 'ワールド作成'} onBack={goBack} />
      <div className="px-4 py-4 max-w-3xl mx-auto space-y-4">
        {error && <ErrorBanner message={error} />}

        <div className="rounded-xl border border-emerald-900/60 bg-gradient-to-r from-emerald-950/55 via-zinc-900/90 to-zinc-900/85 p-4 shadow-[0_0_18px_rgba(16,185,129,0.08)]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <div>
              <p className="text-xs font-extrabold tracking-widest text-zinc-100 uppercase font-mono">WORLD SETUP</p>
              <p className="text-xs text-emerald-100/60 mt-0.5">この世界の基本情報を登録</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/65 p-4 shadow-lg shadow-black/20">
          <Field label="ワールド名">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="例: サバイバル第1ワールド" className={inputClass} />
          </Field>

          <Field label="プレイヤー">
            <input type="text" value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="あなたの名前" className={inputClass} />
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-zinc-300">関連メンバー</label>
              <button onClick={() => setMembers([...members, ''])} className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                <Plus className="w-4 h-4" /> 追加
              </button>
            </div>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" value={m} onChange={(e) => { const next = [...members]; next[i] = e.target.value; setMembers(next); }} placeholder={`メンバー${i + 1}`} className={inputClass} />
                  {members.length > 1 && (
                    <button onClick={() => setMembers(members.filter((_, idx) => idx !== i))} className="p-2 rounded-lg text-zinc-500 hover:text-red-300 hover:bg-red-950/30 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Field label="メモ">
            <textarea value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="ワールドの概要や目標など" rows={3} className={`${inputClass} resize-none`} />
          </Field>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-bold shadow-[0_0_16px_rgba(16,185,129,0.08)] hover:bg-emerald-500/15 hover:border-emerald-400/60 active:scale-[0.99] transition-all disabled:opacity-50">
          {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
