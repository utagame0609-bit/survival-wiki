import React, { useState } from 'react';
import { X, Plus, Trash2, User, Users, Image as ImageIcon, Upload, Camera } from 'lucide-react';
import { WorldWithMembers, Member } from '../types';
import { createWorld, updateWorld, SAMPLE_IMAGES } from '../lib/db';
import { playSaveSound, playModalCloseSound, playHoverSound, playAddSound, playDeleteSound } from '../lib/soundEngine';

interface WorldCreateModalProps {
  worldToEdit?: WorldWithMembers | null;
  onClose: () => void;
  onSaved: (world: WorldWithMembers) => void;
}

export function WorldCreateModal({
  worldToEdit,
  onClose,
  onSaved,
}: WorldCreateModalProps) {
  const isEdit = Boolean(worldToEdit);
  const [name, setName] = useState(worldToEdit?.name || '');
  const [player, setPlayer] = useState(worldToEdit?.player || 'ウタ');
  const [playerPhoto, setPlayerPhoto] = useState(worldToEdit?.player_photo_path || SAMPLE_IMAGES.player_uta);
  const [memo, setMemo] = useState(worldToEdit?.memo || '');

  // Co-members list with name + photo
  const [members, setMembers] = useState<{ id?: string; name: string; photo_path: string }[]>(
    worldToEdit
      ? worldToEdit.members
          .filter((m) => m.name !== worldToEdit.player)
          .map((m) => ({ id: m.id, name: m.name, photo_path: m.photo_path || SAMPLE_IMAGES.member_golem }))
      : [
          { name: 'ゴーレム', photo_path: SAMPLE_IMAGES.member_golem },
          { name: 'アレイ', photo_path: SAMPLE_IMAGES.member_allay },
        ]
  );

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState<string>(SAMPLE_IMAGES.member_golem);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    playAddSound();
    setMembers([
      ...members,
      {
        name: newMemberName.trim(),
        photo_path: newMemberPhoto,
      },
    ]);
    setNewMemberName('');
    setNewMemberPhoto(SAMPLE_IMAGES.member_golem);
  };

  const handleRemoveMember = (idx: number) => {
    playDeleteSound();
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleAvatarPreset = (presetUrl: string) => {
    playHoverSound();
    setPlayerPhoto(presetUrl);
  };

  const handlePlayerPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        playAddSound();
        setPlayerPhoto(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNewMemberPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        playAddSound();
        setNewMemberPhoto(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('ワールド名を入力してください');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const fullMembersList = [
        { name: player.trim(), photo_path: playerPhoto },
        ...members.map((m) => ({ name: m.name.trim(), photo_path: m.photo_path })),
      ];

      let result: WorldWithMembers;
      if (isEdit && worldToEdit) {
        result = await updateWorld(worldToEdit.id, {
          name: name.trim(),
          player: player.trim(),
          player_photo_path: playerPhoto,
          memo: memo.trim(),
          members: fullMembersList.map((m, i) => ({
            id: worldToEdit.members[i]?.id || `mem-${Date.now()}-${i}`,
            name: m.name,
            photo_path: m.photo_path,
          })),
        });
      } else {
        result = await createWorld({
          name: name.trim(),
          player: player.trim(),
          player_photo_path: playerPhoto,
          memo: memo.trim(),
          members: fullMembersList.map((m) => m.name),
        });
        // Ensure photo paths are stored correctly
        result.members = fullMembersList.map((m, i) => ({
          id: `mem-${result.id}-${i}`,
          name: m.name,
          photo_path: m.photo_path,
        }));
        await updateWorld(result.id, { members: result.members });
      }
      playSaveSound();
      onSaved(result);
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#141b2d] border-2 border-amber-500 shadow-[0_0_35px_rgba(0,0,0,0.85)] overflow-hidden rounded-xs">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0d1220] border-b-2 border-amber-500/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 border border-amber-400 bg-amber-500/20 text-amber-300 font-bold rounded-xs">
              WORLD CONFIG
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {isEdit ? 'ワールド冒険の書を編集' : '新しいワールド冒険の書を作成'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playModalCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto overflow-x-hidden">
          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* World Name */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">
              ワールド名 <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: サバイバル開拓記 第1世界"
              className="w-full min-h-[42px] px-3 py-2 bg-[#0a101d] border-2 border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none transition-colors rounded-xs"
              required
            />
          </div>

          {/* Player Name & Avatar (Unified clean photo upload) */}
          <div className="p-3 bg-[#0a101d] border border-slate-700/80 rounded-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-amber-300">
                主開拓者（プレイヤー名＋アバター/写真）
              </label>
              <span className="text-[10px] text-slate-400 font-mono">写真タップで変更</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Single Clear Player Avatar Button */}
              <label
                className="relative w-12 h-12 shrink-0 border-2 border-amber-400 bg-black overflow-hidden rounded-xs cursor-pointer shadow-md group flex items-center justify-center"
                title="タップして写真を変更"
              >
                <img src={playerPhoto} alt="Player avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[8px] text-amber-300 font-mono transition-opacity">
                  <Camera className="w-4 h-4" />
                  <span>変更</span>
                </div>
                <input type="file" accept="image/*" onChange={handlePlayerPhotoUpload} className="hidden" />
              </label>

              {/* Name Input & Action Button */}
              <div className="flex-1 min-w-0 space-y-1">
                <input
                  type="text"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  placeholder="例: ウタ"
                  className="w-full min-h-[38px] px-3 py-1.5 bg-[#12192c] border border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none rounded-xs"
                />
              </div>

              {/* Upload trigger label */}
              <label className="min-h-[38px] px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 text-xs font-mono flex items-center gap-1.5 cursor-pointer rounded-xs shrink-0">
                <Camera className="w-3.5 h-3.5" />
                <span className="text-[11px]">写真変更</span>
                <input type="file" accept="image/*" onChange={handlePlayerPhotoUpload} className="hidden" />
              </label>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono">プリセット:</span>
              <button
                type="button"
                onClick={() => handleAvatarPreset(SAMPLE_IMAGES.player_uta)}
                className={`w-7 h-7 border overflow-hidden cursor-pointer rounded-xs ${
                  playerPhoto === SAMPLE_IMAGES.player_uta ? 'border-amber-400 scale-105 shadow-sm' : 'border-slate-700 opacity-70'
                }`}
              >
                <img src={SAMPLE_IMAGES.player_uta} alt="Uta" className="w-full h-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => handleAvatarPreset(SAMPLE_IMAGES.member_golem)}
                className={`w-7 h-7 border overflow-hidden cursor-pointer rounded-xs ${
                  playerPhoto === SAMPLE_IMAGES.member_golem ? 'border-amber-400 scale-105 shadow-sm' : 'border-slate-700 opacity-70'
                }`}
              >
                <img src={SAMPLE_IMAGES.member_golem} alt="Golem" className="w-full h-full object-cover" />
              </button>
              <button
                type="button"
                onClick={() => handleAvatarPreset(SAMPLE_IMAGES.member_allay)}
                className={`w-7 h-7 border overflow-hidden cursor-pointer rounded-xs ${
                  playerPhoto === SAMPLE_IMAGES.member_allay ? 'border-amber-400 scale-105 shadow-sm' : 'border-slate-700 opacity-70'
                }`}
              >
                <img src={SAMPLE_IMAGES.member_allay} alt="Allay" className="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          {/* Members List (Friends with Name + Photo, Never overflows) */}
          <div className="space-y-2.5 border border-slate-700/80 bg-[#0a101d] p-3 rounded-xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200">
                同行メンバー / 仲間（友達・ペット・NPC）
              </label>
              <span className="text-[10px] text-slate-400 font-mono">{members.length + 1}人パーティ</span>
            </div>

            {/* Current Members with Thumbnails */}
            <div className="flex flex-wrap gap-1.5 mb-1">
              {/* Leader / Player */}
              <div className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold flex items-center gap-1.5 rounded-xs">
                <div className="w-5 h-5 rounded-xs overflow-hidden border border-amber-400 shrink-0">
                  <img src={playerPhoto} alt="" className="w-full h-full object-cover" />
                </div>
                <span>★ {player || '自分'}</span>
              </div>

              {/* Friends */}
              {members.map((mem, idx) => (
                <div
                  key={idx}
                  className="px-2 py-1 bg-[#141e33] text-slate-200 border border-cyan-500/50 text-xs font-mono flex items-center gap-1.5 rounded-xs"
                >
                  <div className="w-5 h-5 rounded-xs overflow-hidden border border-cyan-400 shrink-0">
                    <img src={mem.photo_path} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="truncate max-w-[90px]">@{mem.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer ml-0.5"
                    title="メンバーを解除"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Member Box (Responsive 2-line layout that NEVER overflows) */}
            <div className="p-2 bg-[#12192c] border border-slate-700/80 rounded-xs space-y-2">
              <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between">
                <span>＋ 新しい仲間を追加</span>
                <span className="text-[10px] text-slate-400">スクショ/写真対応</span>
              </div>

              <div className="flex items-center gap-2">
                {/* Friend Avatar preview & upload */}
                <label
                  className="relative w-9 h-9 shrink-0 border-2 border-cyan-400 bg-black overflow-hidden rounded-xs cursor-pointer group flex items-center justify-center"
                  title="友達の写真/スクショを設定"
                >
                  <img src={newMemberPhoto} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <input type="file" accept="image/*" onChange={handleNewMemberPhotoUpload} className="hidden" />
                </label>

                {/* Friend Name Input */}
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
                  placeholder="友達の名前・ペット名..."
                  className="flex-1 min-w-0 min-h-[36px] px-3 py-1 bg-[#0a101d] border border-slate-700 text-white text-xs focus:border-cyan-400 outline-none rounded-xs"
                />

                {/* Add Button */}
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="min-h-[36px] px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-mono text-xs cursor-pointer rounded-xs shrink-0 flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>追加</span>
                </button>
              </div>
            </div>
          </div>

          {/* Memo / Objectives */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">
              ワールド概要・目標メモ
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: エンドラ討伐と巨大桜拠点の建築を目指すワールド。"
              rows={3}
              className="w-full px-3 py-2 bg-[#0a101d] border-2 border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none resize-none rounded-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                playModalCloseSound();
                onClose();
              }}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[42px] border-2 border-slate-700 bg-[#0d1220] text-slate-300 font-bold hover:text-white text-xs sm:text-sm cursor-pointer rounded-xs"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[42px] bg-amber-500 text-black font-black text-xs sm:text-sm border-b-3 border-amber-700 hover:bg-amber-400 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer shadow-[0_2px_10px_rgba(245,158,11,0.25)] rounded-xs"
            >
              {saving ? '保存中...' : isEdit ? '更新する' : '作成する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

