import { useState } from 'react';
import { Plus, X, Camera } from 'lucide-react';
import { createWorld, fetchWorld, saveWorldMemberPhoto, saveWorldPlayerPhoto } from '@/lib/db';
import { playAddSound, playCloseSound, playDeleteSound, playModalCloseSound, playNewRecordSound } from '@/lib/sound';
import { ErrorBanner } from '@/components/Feedback';

type MemberDraft = { name: string; photo: File | null };

export function WorldCreateModal({
  gameId,
  onClose,
  onCreated,
}: {
  gameId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [player, setPlayer] = useState('');
  const [playerPhoto, setPlayerPhoto] = useState<File | null>(null);
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([{ name: '', photo: null }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }

    setSaving(true);
    try {
      const memberNames = members.map((member) => member.name.trim()).filter(Boolean);
      const world = await createWorld(gameId, {
        name: name.trim(),
        player: player.trim(),
        memo: memo.trim(),
        members: memberNames,
      });

      if (playerPhoto) await saveWorldPlayerPhoto(world.id, playerPhoto);

      const createdWorld = await fetchWorld(world.id);
      if (createdWorld) {
        const namedDrafts = members.filter((member) => member.name.trim());
        for (let index = 0; index < namedDrafts.length; index += 1) {
          const photo = namedDrafts[index].photo;
          const createdMember = createdWorld.members[index];
          if (photo && createdMember) await saveWorldMemberPhoto(createdMember.id, photo);
        }
      }

      playNewRecordSound();
      onCreated();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ワールドの作成に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-mono"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="world-create-modal-panel w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto rounded-sm bg-[#0a1120] border-2 border-amber-500/80 shadow-[0_0_35px_rgba(245,158,11,0.25)] text-slate-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0d1627]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.4)]">W</div>
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">INITIALIZE ENVIRONMENT</p>
              <h2 className="text-sm sm:text-base font-bold text-amber-400 uppercase tracking-wider">新規ワールド作成</h2>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {error && <ErrorBanner message={error} />}

          <Field label="WORLD NAME // ワールド名" required>
            <input autoFocus type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="例: アストリア古王国・忘却の地" className="modal-input text-sm text-slate-100 placeholder-slate-600" />
          </Field>

          <Field label="PLAYER PROFILE // プレイヤー名とアバター">
            <div className="flex items-center gap-3">
              <PhotoPicker file={playerPhoto} onChange={setPlayerPhoto} label="プレイヤー写真" />
              <input type="text" value={player} onChange={(event) => setPlayer(event.target.value)} placeholder="あなたの名前 (例: 探索者アルト)" className="modal-input flex-1 text-sm text-slate-100 placeholder-slate-600" />
            </div>
          </Field>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">COMPANION MEMBERS // 関連同行メンバー</label>
              <button type="button" onClick={() => { playAddSound(); setMembers([...members, { name: '', photo: null }]); }} className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider cursor-pointer"><Plus className="w-3.5 h-3.5" />スロット追加</button>
            </div>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2 bg-[#090d16] p-2 rounded-sm border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 font-bold w-6 text-center">#{index + 1}</span>
                  <PhotoPicker file={member.photo} onChange={(photo) => { const next = [...members]; next[index] = { ...next[index], photo }; setMembers(next); }} label={`メンバー${index + 1}写真`} />
                  <input type="text" value={member.name} onChange={(event) => { const next = [...members]; next[index] = { ...next[index], name: event.target.value }; setMembers(next); }} placeholder={`メンバー${index + 1} (例: リリス)`} className="modal-input flex-1 text-xs" />
                  {members.length > 1 && <button type="button" onClick={() => { playDeleteSound(); setMembers(members.filter((_, i) => i !== index)); }} className="w-8 h-8 rounded-sm text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 flex items-center justify-center transition-colors cursor-pointer" aria-label="メンバーを削除"><X className="w-4 h-4" /></button>}
                </div>
              ))}
            </div>
          </div>

          <Field label="WORLD MEMO // 探検概要・目標">
            <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="ワールドの概要、難易度、攻略目標など" rows={3} className="modal-input resize-none text-xs text-slate-200" />
          </Field>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-slate-800 bg-[#0d1627]">
          <button type="button" onClick={() => { playCloseSound(); onClose(); }} disabled={saving} className="flex-1 py-2.5 rounded-sm bg-[#1a2333] border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:border-slate-600 disabled:opacity-50 transition-all text-xs uppercase tracking-wider cursor-pointer">キャンセル</button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-sm bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:bg-amber-400 disabled:opacity-50 transition-all text-xs uppercase tracking-wider cursor-pointer">{saving ? 'GENERATING... // 作成中' : '▶ 作成して開始 (START)'}</button>
        </div>
      </div>

      <style>{`
        .modal-input { width: 100%; padding: 0.65rem 0.75rem; border-radius: 0.25rem; border: 1px solid #334155; background: #090d16; color: #f1f5f9; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease; }
        .modal-input::placeholder { color: #64748b; }
        .modal-input:focus { border-color: #38bdf8; background: #0d1627; box-shadow: 0 0 0 1px #38bdf8, 0 0 14px rgba(56, 189, 248, 0.15); }
        .world-create-modal-panel { animation: world-create-modal-in 180ms cubic-bezier(.22,.8,.35,1) both; transform-origin: center; }
        @keyframes world-create-modal-in { from { opacity: 0; transform: translateY(8px) scale(0.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .world-create-modal-panel { animation: none; } }
      `}</style>
    </div>
  );
}

function PhotoPicker({ file, onChange, label }: { file: File | null; onChange: (file: File | null) => void; label: string }) {
  const [preview, setPreview] = useState<string>('');

  const handleChange = (nextFile: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    const nextPreview = nextFile ? URL.createObjectURL(nextFile) : '';
    setPreview(nextPreview);
    onChange(nextFile);
  };

  return (
    <label className="relative h-11 w-14 shrink-0 cursor-pointer overflow-hidden rounded-sm border border-slate-700 bg-[#050a14] flex items-center justify-center text-slate-500 hover:border-amber-500 hover:text-amber-400 transition-colors" title={label}>
      {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div><label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">{label}{required && <span className="text-rose-400 ml-1">*</span>}</label>{children}</div>;
}