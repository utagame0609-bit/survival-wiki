import React, { useState } from 'react';
import { X, Camera, Plus, MapPin, Youtube, Hash, ChevronDown, ChevronUp, Sparkles, Check, Upload } from 'lucide-react';
import { WorldWithMembers, LocationWithPhotos } from '../types';
import { createLocation, updateLocation, SAMPLE_IMAGES } from '../lib/db';
import { playNewRecordSound, playSaveSound, playModalCloseSound, playHoverSound, playAddSound } from '../lib/soundEngine';

interface RecordFormModalProps {
  world: WorldWithMembers;
  locationToEdit?: LocationWithPhotos | null;
  onClose: () => void;
  onSaved: (loc: LocationWithPhotos) => void;
}

export function RecordFormModal({
  world,
  locationToEdit,
  onClose,
  onSaved,
}: RecordFormModalProps) {
  const isEdit = Boolean(locationToEdit);

  // Quick core fields (Lightweight!)
  const [name, setName] = useState(locationToEdit?.name || '');
  const [detailMemo, setDetailMemo] = useState(locationToEdit?.detail_memo || '');
  const [photos, setPhotos] = useState<string[]>(
    locationToEdit?.photos.map((p) => p.storage_path) || [SAMPLE_IMAGES.cave]
  );

  // Expandable optional fields
  const [showAdvanced, setShowAdvanced] = useState(
    isEdit || Boolean(locationToEdit?.youtube_url) || (locationToEdit && (locationToEdit.x !== 0 || locationToEdit.z !== 0))
  );
  const [x, setX] = useState<number | ''>(locationToEdit ? locationToEdit.x : 0);
  const [y, setY] = useState<number | ''>(locationToEdit ? locationToEdit.y : 64);
  const [z, setZ] = useState<number | ''>(locationToEdit ? locationToEdit.z : 0);
  const [youtubeUrl, setYoutubeUrl] = useState(locationToEdit?.youtube_url || '');
  const [youtubeTitle, setYoutubeTitle] = useState(locationToEdit?.youtube_title || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    locationToEdit?.member_ids || (world.members.length > 0 ? [world.members[0].id] : [])
  );
  const [tags, setTags] = useState<string[]>(locationToEdit?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isCheckpoint, setIsCheckpoint] = useState(locationToEdit?.is_checkpoint ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Auto-generate tags based on content
  const handleAutoTags = () => {
    playAddSound();
    const newTags: string[] = [];
    if (name.trim()) newTags.push(`#${name.trim().replace(/[\s-]/g, '')}`);
    if (name.includes('洞窟')) newTags.push('#洞窟探検', '#採掘');
    if (name.includes('拠点') || name.includes('家')) newTags.push('#本拠点', '#建築');
    if (name.includes('廃坑')) newTags.push('#廃坑', '#お宝チェスト');
    if (name.includes('桜')) newTags.push('#桜バイオーム');
    if (name.includes('平原')) newTags.push('#平原探索');
    newTags.push('#サバイバル日記', `#${world.name.replace(/[\s-]/g, '')}`);

    const merged = Array.from(new Set([...tags, ...newTags]));
    setTags(merged);
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    playAddSound();
    const formatted = tagInput.trim().startsWith('#') ? tagInput.trim() : `#${tagInput.trim()}`;
    setTags(Array.from(new Set([...tags, formatted])));
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        playAddSound();
        setPhotos([...photos, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetPhoto = (preset: string) => {
    playHoverSound();
    if (!photos.includes(preset)) {
      setPhotos([...photos, preset]);
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const toggleMember = (memId: string) => {
    playHoverSound();
    if (selectedMemberIds.includes(memId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('場所の名前（タイトル）を入力してください');
      return;
    }
    setSaving(true);
    setError('');

    try {
      let saved: LocationWithPhotos;
      if (isEdit && locationToEdit) {
        saved = await updateLocation(locationToEdit.id, {
          name: name.trim(),
          detail_memo: detailMemo.trim(),
          x: typeof x === 'number' ? x : 0,
          y: typeof y === 'number' ? y : 64,
          z: typeof z === 'number' ? z : 0,
          newPhotos: photos,
          youtube_url: youtubeUrl.trim() || undefined,
          youtube_title: youtubeTitle.trim() || (youtubeUrl ? 'YouTube冒険動画' : undefined),
          member_ids: selectedMemberIds,
          tags,
          is_checkpoint: isCheckpoint,
        });
        playSaveSound();
      } else {
        saved = await createLocation(world.id, {
          name: name.trim(),
          detail_memo: detailMemo.trim(),
          x: typeof x === 'number' ? x : 0,
          y: typeof y === 'number' ? y : 64,
          z: typeof z === 'number' ? z : 0,
          photos,
          youtube_url: youtubeUrl.trim() || undefined,
          youtube_title: youtubeTitle.trim() || (youtubeUrl ? 'YouTube冒険動画' : undefined),
          member_ids: selectedMemberIds,
          tags,
          is_checkpoint: isCheckpoint,
        });
        playNewRecordSound();
      }
      onSaved(saved);
    } catch (err: any) {
      setError(err.message || '記録の保存に失敗しました');
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
      <div className="w-full max-w-lg bg-[#161a25] border-2 border-amber-500 shadow-[0_0_35px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#11141e] border-b-2 border-amber-500/60">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 border border-amber-400 bg-amber-500/20 text-amber-300 font-bold">
              QUICK LOG // 冒険記録
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {isEdit ? '冒険記録を編集' : '新しい場所・体験を記録する'}
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

        {/* Composer Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          {error && (
            <div className="p-2.5 bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* 1. Location / Title (Core) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">
              場所名・発見したこと <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 浅めの洞窟、桜の丘、砂漠の寺院..."
              className="w-full min-h-[44px] px-3.5 py-2 bg-[#10141f] border-2 border-slate-700 text-white text-sm focus:border-amber-400 outline-none transition-colors"
              required
              autoFocus
            />
          </div>

          {/* 2. Experience Memo (Core - Twitter style) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-200">
              体験メモ・発見の物語
            </label>
            <textarea
              value={detailMemo}
              onChange={(e) => setDetailMemo(e.target.value)}
              placeholder="思いついたこと、何が起きたか、手に入れたアイテムなどを自由に記録..."
              rows={3}
              className="w-full px-3.5 py-2 bg-[#10141f] border-2 border-slate-700 text-white text-xs sm:text-sm focus:border-amber-400 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* 3. Photo Attachment (Core - Instant Chest Storage) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>写真・スクリーンショット ({photos.length}枚)</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-400">CHEST PHOTO AUTO-SAVE</span>
            </div>

            {/* Thumbnail Carousel / List */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-16 h-12 shrink-0 border-2 border-amber-500/80 bg-black overflow-hidden group">
                  <img src={p} alt="Photo" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute top-0 right-0 p-0.5 bg-rose-600 text-white opacity-90 hover:opacity-100 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              <label className="w-16 h-12 shrink-0 border-2 border-dashed border-slate-600 hover:border-amber-400 bg-[#10141f] flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-[9px] font-mono mt-0.5">追加</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preset Game Scenes Selector */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-mono">プリセット写真:</span>
              <button
                type="button"
                onClick={() => handleSelectPresetPhoto(SAMPLE_IMAGES.cave)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer rounded-xs"
              >
                +洞窟
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetPhoto(SAMPLE_IMAGES.cliff)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer rounded-xs"
              >
                +断崖
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetPhoto(SAMPLE_IMAGES.mineshaft)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer rounded-xs"
              >
                +廃坑
              </button>
              <button
                type="button"
                onClick={() => handleSelectPresetPhoto(SAMPLE_IMAGES.cherry)}
                className="px-2 py-0.5 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer rounded-xs"
              >
                +桜の丘
              </button>
            </div>
          </div>

          {/* 4. Expandable Details (Coordinates, Members, YouTube, Tags) */}
          <div className="border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => {
                playHoverSound();
                setShowAdvanced(!showAdvanced);
              }}
              className="flex items-center justify-between w-full text-xs font-bold text-amber-400/90 hover:text-amber-300 py-1 cursor-pointer font-mono"
            >
              <span>{showAdvanced ? '▼ 詳細オプションを折りたたむ' : '▶ 座標・YouTube・仲間・タグを追加する (任意)'}</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 space-y-3.5 bg-[#121622] p-3.5 border border-slate-800 rounded-xs">
                {/* Coordinates (X, Y, Z) */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>POS 座標 (X, Y, Z)</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="flex items-center bg-[#10141f] border border-slate-700 px-2 py-1.5">
                      <span className="text-slate-500 font-bold mr-1.5">X:</span>
                      <input
                        type="number"
                        value={x}
                        onChange={(e) => setX(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-transparent text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-[#10141f] border border-slate-700 px-2 py-1.5">
                      <span className="text-slate-500 font-bold mr-1.5">Y:</span>
                      <input
                        type="number"
                        value={y}
                        onChange={(e) => setY(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        placeholder="64"
                        className="w-full bg-transparent text-white outline-none"
                      />
                    </div>
                    <div className="flex items-center bg-[#10141f] border border-slate-700 px-2 py-1.5">
                      <span className="text-slate-500 font-bold mr-1.5">Z:</span>
                      <input
                        type="number"
                        value={z}
                        onChange={(e) => setZ(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-transparent text-white outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* YouTube URL Integration */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                    <Youtube className="w-3.5 h-3.5 text-red-400" />
                    <span>YouTube 動画リンク (任意)</span>
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full min-h-[38px] px-3 py-1.5 bg-[#10141f] border border-slate-700 text-white text-xs focus:border-amber-400 outline-none"
                  />
                  {youtubeUrl && (
                    <input
                      type="text"
                      value={youtubeTitle}
                      onChange={(e) => setYoutubeTitle(e.target.value)}
                      placeholder="動画タイトル（SNS共有時に使用されます）"
                      className="w-full min-h-[34px] px-3 py-1 bg-[#10141f] border border-slate-700 text-slate-300 text-xs focus:border-amber-400 outline-none"
                    />
                  )}
                </div>

                {/* Members Selection */}
                {world.members.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      同行メンバー
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {world.members.map((m) => {
                        const isSelected = selectedMemberIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => toggleMember(m.id)}
                            className={`px-2.5 py-1 text-xs font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-950/50 text-cyan-300'
                                : 'border-slate-700 bg-[#10141f] text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                            <span>@{m.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Hashtags (Auto-generate or Manual) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300 flex items-center gap-1 font-mono">
                      <Hash className="w-3.5 h-3.5 text-amber-400" />
                      <span>ハッシュタグ (自動生成可能)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAutoTags}
                      className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI自動生成</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-1.5">
                    {tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-600 text-xs font-mono flex items-center gap-1"
                      >
                        <span>{t}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="例: #サバイバル日記"
                      className="flex-1 min-h-[34px] px-3 py-1 bg-[#10141f] border border-slate-700 text-white text-xs focus:border-amber-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-1 bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono hover:text-white cursor-pointer"
                    >
                      追加
                    </button>
                  </div>
                </div>

                {/* Important Checkpoint Flag */}
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCheckpoint}
                    onChange={(e) => setIsCheckpoint(e.target.checked)}
                    className="w-4 h-4 accent-amber-400 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-300">
                    重要チェックポイント / 本拠点として登録する
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t-2 border-slate-800">
            <button
              type="button"
              onClick={() => {
                playModalCloseSound();
                onClose();
              }}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[44px] border-2 border-slate-700 bg-[#12151e] text-slate-300 font-bold hover:text-white text-xs sm:text-sm cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[44px] bg-amber-500 text-black font-black text-xs sm:text-sm border-b-3 border-amber-700 hover:bg-amber-400 active:translate-y-0.5 disabled:opacity-50 transition-all cursor-pointer shadow-[0_2px_12px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{saving ? '保存中...' : isEdit ? '更新を保存する' : 'この体験を記録する'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
