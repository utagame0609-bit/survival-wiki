import { useEffect, useState } from 'react';
import { Plus, X, Camera, User, Users } from 'lucide-react';
import { createWorld, fetchWorld, saveWorldMemberPhoto, saveWorldPlayerPhoto } from '@/lib/db';
import { playAddSound, playCloseSound, playDeleteSound, playHoverSound, playInputFocusSound, playModalCloseSound, playNewRecordSound } from '@/lib/sound';
import { ErrorBanner } from '@/components/Feedback';
import { WORLD_PRESET_AVATAR_LIST } from '@/assets/worldPresetAvatars';

type MemberDraft = { name: string; photo: File | null; previewUrl: string };

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
  const [playerPreview, setPlayerPreview] = useState('');
  const [memo, setMemo] = useState('');
  const [members, setMembers] = useState<MemberDraft[]>([{ name: '', photo: null, previewUrl: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => {
    if (playerPreview.startsWith('blob:')) URL.revokeObjectURL(playerPreview);
    members.forEach((member) => {
      if (member.previewUrl.startsWith('blob:')) URL.revokeObjectURL(member.previewUrl);
    });
  }, [playerPreview, members]);

  const setPlayerPhotoFile = (file: File | null) => {
    if (!file) return;
    if (playerPreview.startsWith('blob:')) URL.revokeObjectURL(playerPreview);
    setPlayerPhoto(file);
    setPlayerPreview(URL.createObjectURL(file));
  };

  const handlePlayerPreset = (src: string) => {
    try {
      setPlayerPhotoFile(dataUrlToFile(src, 'player-preset.svg'));
    } catch {
      setError('プリセット画像を読み込めませんでした');
    }
  };

  const setMemberPhotoFile = (index: number, file: File | null) => {
    if (!file) return;
    setMembers((current) => current.map((member, i) => {
      if (i !== index) return member;
      if (member.previewUrl.startsWith('blob:')) URL.revokeObjectURL(member.previewUrl);
      return { ...member, photo: file, previewUrl: URL.createObjectURL(file) };
    }));
  };

  const addMember = () => {
    playAddSound();
    setMembers((current) => [...current, { name: '', photo: null, previewUrl: '' }]);
  };

  const removeMember = (index: number) => {
    playDeleteSound();
    setMembers((current) => current.filter((_, i) => i !== index));
  };

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

  const namedMembers = members.filter((member) => member.name.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-4 font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="world-create-modal-panel flex w-full max-w-lg max-h-[calc(100vh-1.5rem)] sm:max-h-[calc(100vh-2rem)] flex-col overflow-hidden border-2 border-amber-500 bg-[#141b2d] text-slate-100 shadow-[0_0_35px_rgba(245,158,11,0.25)]">
        <div className="flex shrink-0 items-center justify-between border-b-2 border-amber-500/60 bg-[#0d1627] px-4 sm:px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center bg-amber-500 text-xs font-black text-slate-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]">W</div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">INITIALIZE ENVIRONMENT</p>
              <h2 className="text-sm sm:text-base font-bold tracking-wide text-amber-400">新規ワールド作成</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { playModalCloseSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            className="flex h-8 w-8 items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4">
          {error && <ErrorBanner message={error} />}

          <Field label="WORLD NAME // ワールド名" required>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onFocus={playInputFocusSound}
              placeholder="例: アストリア古王国・忘却の地"
              className="modal-input text-sm"
            />
          </Field>

          <section className="border border-slate-700/80 bg-[#0a101d] p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-amber-300">主開拓者（プレイヤー名＋アバター/写真）</label>
              <span className="text-[10px] text-slate-500 font-mono">写真タップで変更</span>
            </div>

            <div className="flex items-center gap-3">
              <PhotoPicker
                previewUrl={playerPreview}
                onChange={setPlayerPhotoFile}
                label="プレイヤー写真"
                accent="amber"
                size="large"
              />
              <input
                type="text"
                value={player}
                onChange={(event) => setPlayer(event.target.value)}
                onFocus={playInputFocusSound}
                placeholder="あなたの名前 (例: 探索者アルト)"
                className="modal-input flex-1 text-sm"
              />
              <label className="hidden sm:flex min-h-[42px] shrink-0 items-center gap-1.5 border border-slate-600 bg-slate-800 px-2.5 text-[11px] font-mono font-bold text-amber-300 cursor-pointer hover:border-amber-400 transition-colors">
                <Camera className="h-3.5 w-3.5" />
                写真変更
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => setPlayerPhotoFile(event.target.files?.[0] ?? null)} />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">プリセット:</span>
              {WORLD_PRESET_AVATAR_LIST.map((preset) => {
                const selected = playerPreview === preset.src;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePlayerPreset(preset.src)}
                    onMouseEnter={playHoverSound}
                    className={`h-7 w-7 overflow-hidden border bg-[#050a14] transition-all cursor-pointer ${selected ? 'border-amber-400 scale-105 shadow-[0_0_8px_rgba(245,158,11,0.28)]' : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'}`}
                    aria-label={`${preset.alt}プリセット`}
                    title={`${preset.alt}プリセット`}
                  >
                    <img src={preset.src} alt={preset.alt} className="h-full w-full object-cover pixelated" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-slate-700/80 bg-[#0a101d] p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-black text-slate-200">同行メンバー / 仲間（友達・ペット・NPC）</label>
              <span className="text-[10px] text-slate-500 font-mono">{1 + namedMembers.length}人パーティ</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <PartyChip name={player || '自分'} photoUrl={playerPreview} player />
              {namedMembers.map((member, index) => (
                <PartyChip key={`${member.name}-${index}`} name={member.name} photoUrl={member.previewUrl} />
              ))}
            </div>

            <div className="border border-slate-700/80 bg-[#12192c] p-2.5 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                <span>＋ 新しい仲間を追加</span>
                <span className="text-[10px] text-slate-500">スクショ/写真対応</span>
              </div>

              {members.map((member, index) => (
                <div key={index} className="flex items-center gap-2">
                  <PhotoPicker
                    previewUrl={member.previewUrl}
                    onChange={(file) => setMemberPhotoFile(index, file)}
                    label={`メンバー${index + 1}写真`}
                    accent="cyan"
                  />
                  <input
                    type="text"
                    value={member.name}
                    onChange={(event) => setMembers((current) => current.map((item, i) => i === index ? { ...item, name: event.target.value } : item))}
                    onFocus={playInputFocusSound}
                    placeholder={`メンバー${index + 1} (例: リリス)`}
                    className="modal-input flex-1 text-xs"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      onMouseEnter={playHoverSound}
                      className="flex h-10 w-10 shrink-0 items-center justify-center border border-slate-700 bg-[#141824] text-slate-400 hover:border-rose-500 hover:text-rose-300 transition-colors cursor-pointer"
                      aria-label="メンバーを削除"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addMember}
                onMouseEnter={playHoverSound}
                className="flex min-h-[38px] w-full items-center justify-center gap-1 border border-cyan-500/60 bg-cyan-950/20 px-3 text-xs font-black text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                スロット追加
              </button>
            </div>
          </section>

          <Field label="WORLD MEMO // 探検概要・目標">
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              onFocus={playInputFocusSound}
              placeholder="ワールドの概要、難易度、攻略目標など"
              rows={3}
              className="modal-input resize-none text-xs sm:text-sm"
            />
          </Field>
        </div>

        <div className="flex shrink-0 gap-3 border-t border-slate-800 bg-[#0d1627] px-4 sm:px-5 py-4">
          <button
            type="button"
            onClick={() => { playCloseSound(); onClose(); }}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="flex-1 min-h-[44px] border border-slate-700 bg-[#1a2333] py-2.5 text-xs sm:text-sm font-bold text-slate-300 hover:bg-slate-800 hover:border-slate-600 disabled:opacity-50 transition-all cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            onMouseEnter={playHoverSound}
            disabled={saving}
            className="flex-1 min-h-[44px] border-b-2 border-amber-700 bg-amber-500 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-[0_0_16px_rgba(245,158,11,0.2)] hover:bg-amber-400 disabled:opacity-50 transition-all cursor-pointer"
          >
            ▶ {saving ? '作成中...' : '作成して開始 (START)'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-input { width: 100%; min-height: 42px; padding: 0.65rem 0.75rem; border: 1px solid #334155; background: #090d16; color: #f1f5f9; outline: none; transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease; }
        .modal-input::placeholder { color: #64748b; }
        .modal-input:focus { border-color: #38bdf8; background: #0d1627; box-shadow: 0 0 0 1px #38bdf8, 0 0 14px rgba(56,189,248,0.15); }
        .world-create-modal-panel { animation: world-create-modal-in 180ms cubic-bezier(.22,.8,.35,1) both; transform-origin: center; }
        @keyframes world-create-modal-in { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @media (prefers-reduced-motion: reduce) { .world-create-modal-panel { animation: none; } }
      `}</style>
    </div>
  );
}

function PartyChip({ name, photoUrl, player = false }: { name: string; photoUrl: string; player?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 border px-2 py-1 ${player ? 'border-amber-500/60 bg-amber-500/15 text-amber-300' : 'border-cyan-500/50 bg-[#141e33] text-cyan-200'}`}>
      <div className={`flex h-5 w-5 items-center justify-center overflow-hidden border bg-[#090d16] ${player ? 'border-amber-400' : 'border-cyan-400/70'}`}>
        {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover pixelated" /> : player ? <User className="h-3.5 w-3.5 text-amber-400" /> : <Users className="h-3.5 w-3.5 text-cyan-400" />}
      </div>
      <span className="max-w-[90px] truncate text-[10px] font-bold">{player ? `★ ${name}` : `@${name}`}</span>
    </div>
  );
}

function PhotoPicker({ previewUrl, onChange, label, accent, size = 'normal' }: { previewUrl: string; onChange: (file: File | null) => void; label: string; accent: 'amber' | 'cyan'; size?: 'normal' | 'large' }) {
  const accentClass = accent === 'amber' ? 'border-amber-400 text-amber-400 hover:border-amber-300' : 'border-cyan-400 text-cyan-300 hover:border-cyan-300';
  const sizeClass = size === 'large' ? 'h-14 w-14' : 'h-10 w-12';
  return (
    <label className={`relative ${sizeClass} shrink-0 cursor-pointer overflow-hidden border-2 bg-[#050a14] flex items-center justify-center transition-colors ${accentClass}`} title={label}>
      {previewUrl ? <img src={previewUrl} alt="" className="h-full w-full object-cover pixelated" /> : <Camera className="h-5 w-5" />}
      <input type="file" accept="image/*" className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
    </label>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-300">
        {label}{required && <span className="ml-1 text-amber-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) throw new Error('Invalid data URL');
  const header = dataUrl.slice(0, commaIndex);
  const payload = dataUrl.slice(commaIndex + 1);
  const mime = /^data:(.*?);/.exec(header)?.[1] ?? 'image/svg+xml';
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], filename, { type: mime });
}
