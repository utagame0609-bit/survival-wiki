import React, { useState } from 'react';
import { X, Camera, Plus, MapPin, Sparkles, Trash2, Calendar, Clock, Users, Tag } from 'lucide-react';
import { World, AdventureRecord, RecordCategory, RecordPhoto } from '../../types';
import { playCloseSound, playHoverSound, playNewRecordSound, playSaveSound, playConfirmSound } from '../../audio/soundEngine';

interface RecordCreateModalProps {
  world: World;
  existingRecord?: AdventureRecord | null;
  onSave: (record: AdventureRecord) => void;
  onClose: () => void;
  suggestedDay?: number;
  recentLocations?: string[];
}

const SAMPLE_PHOTO_PRESETS = [
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
];

export const RecordCreateModal: React.FC<RecordCreateModalProps> = ({
  world,
  existingRecord,
  onSave,
  onClose,
  suggestedDay = 1,
  recentLocations = [],
}) => {
  const isEdit = Boolean(existingRecord);

  const [dayNumber, setDayNumber] = useState<number>(existingRecord?.dayNumber ?? suggestedDay);
  const [recordedAt, setRecordedAt] = useState<string>(
    existingRecord?.recordedAt ??
      new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [locationName, setLocationName] = useState(existingRecord?.locationName ?? '');
  const [areaTag, setAreaTag] = useState(existingRecord?.areaTag ?? '');
  const [coordX, setCoordX] = useState<string>(existingRecord?.coords?.x?.toString() ?? '');
  const [coordY, setCoordY] = useState<string>(existingRecord?.coords?.y?.toString() ?? '');
  const [coordZ, setCoordZ] = useState<string>(existingRecord?.coords?.z?.toString() ?? '');
  const [memo, setMemo] = useState(existingRecord?.memo ?? '');
  const [category, setCategory] = useState<RecordCategory>(existingRecord?.category ?? 'exploration');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    existingRecord?.memberIds ?? world.members.map((m) => m.id)
  );
  const [photos, setPhotos] = useState<RecordPhoto[]>(existingRecord?.photos ?? []);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [error, setError] = useState('');

  const toggleMember = (memId: string) => {
    playConfirmSound();
    if (selectedMemberIds.includes(memId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memId]);
    }
  };

  const handleAddPhoto = (urlToAdd: string, captionToAdd?: string) => {
    if (!urlToAdd.trim()) return;
    playConfirmSound();
    const newPhoto: RecordPhoto = {
      id: `photo-${Date.now()}`,
      url: urlToAdd.trim(),
      caption: captionToAdd || locationName || '探検記録スナップ',
      takenAt: recordedAt,
    };
    setPhotos([...photos, newPhoto]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
    setShowPhotoPicker(false);
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) {
      setError('場所の名前を入力してください');
      return;
    }
    if (!memo.trim()) {
      setError('メモ（何をしたか）を入力してください');
      return;
    }

    const xNum = coordX !== '' ? parseFloat(coordX) : undefined;
    const yNum = coordY !== '' ? parseFloat(coordY) : undefined;
    const zNum = coordZ !== '' ? parseFloat(coordZ) : undefined;

    const recordToSave: AdventureRecord = {
      id: existingRecord?.id || `rec-${Date.now()}`,
      worldId: world.id,
      dayNumber: Number(dayNumber) || 1,
      recordedAt,
      locationName: locationName.trim(),
      areaTag: areaTag.trim() || undefined,
      coords:
        xNum !== undefined || yNum !== undefined || zNum !== undefined
          ? { x: xNum, y: yNum, z: zNum }
          : undefined,
      memo: memo.trim(),
      photos,
      memberIds: selectedMemberIds,
      category,
      importance: category === 'battle' || category === 'discovery' ? 'major' : 'normal',
    };

    if (isEdit) {
      playSaveSound();
    } else {
      playNewRecordSound();
    }
    onSave(recordToSave);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl max-h-[95vh] bg-[#141414] border border-[#D4AF37]/50 shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              LOG ENTRY
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono">
              {isEdit ? '冒険記録を編集' : '新しい冒険・体験を記録'}
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

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-sm">
              {error}
            </div>
          )}

          {/* 1. When: Day & Time */}
          <div className="grid grid-cols-2 gap-3 bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm">
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#A3A3A3] mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>経過日数 (DAY)</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono font-bold text-[#D4AF37]">DAY</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={dayNumber}
                  onChange={(e) => setDayNumber(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#2A2A2A] text-[#E5E5E5] font-mono font-bold rounded-sm text-sm focus:border-[#D4AF37] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold text-[#A3A3A3] mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>記録日時</span>
              </label>
              <input
                type="text"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                placeholder="2026-08-21 19:47"
                className="w-full px-2.5 py-1.5 bg-[#141414] border border-[#2A2A2A] text-[#E5E5E5] font-mono text-xs rounded-sm focus:border-[#D4AF37] focus:outline-none"
                required
              />
            </div>
          </div>

          {/* 2. Where: Location & Coordinates */}
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>場所の名前 (LOCATION) <span className="text-[#D4AF37]">*</span></span>
                </span>
                {recentLocations.length > 0 && (
                  <span className="text-[10px] text-[#737373] font-normal">過去の記録から選ぶ</span>
                )}
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="例: 浅めの洞窟 / 通天閣 / 断崖の洞窟前"
                className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] font-bold text-sm rounded-sm focus:border-[#D4AF37] focus:outline-none"
                required
              />

              {/* Quick suggestion chips */}
              {recentLocations.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {recentLocations.slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        playConfirmSound();
                        setLocationName(loc);
                      }}
                      className="px-2 py-0.5 text-[10px] font-mono bg-[#1F1F1F] hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-[#A3A3A3] border border-[#2A2A2A] rounded-sm transition-colors cursor-pointer"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Coordinates / Area tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#737373] mb-1">
                  エリアタグ / 地方名
                </label>
                <input
                  type="text"
                  value={areaTag}
                  onChange={(e) => setAreaTag(e.target.value)}
                  placeholder="例: 地下洞窟 / 大阪・新世界 / 峡谷"
                  className="w-full px-2.5 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] text-xs rounded-sm focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#737373] mb-1">
                  空間座標 (X / Y / Z)
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <input
                    type="number"
                    value={coordX}
                    onChange={(e) => setCoordX(e.target.value)}
                    placeholder="X"
                    className="px-1.5 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] font-mono text-xs rounded-sm text-center focus:border-[#D4AF37] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={coordY}
                    onChange={(e) => setCoordY(e.target.value)}
                    placeholder="Y"
                    className="px-1.5 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] font-mono text-xs rounded-sm text-center focus:border-[#D4AF37] focus:outline-none"
                  />
                  <input
                    type="number"
                    value={coordZ}
                    onChange={(e) => setCoordZ(e.target.value)}
                    placeholder="Z"
                    className="px-1.5 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] font-mono text-xs rounded-sm text-center focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Category selector */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-[#A3A3A3] mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>活動カテゴリー</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'exploration', label: '探索・踏破' },
                { id: 'discovery', label: '発見・調査' },
                { id: 'battle', label: '遭遇・戦闘' },
                { id: 'building', label: '建築・設営' },
                { id: 'gourmet', label: 'グルメ・食' },
                { id: 'culture', label: '文化・観光' },
                { id: 'misc', label: 'その他' },
              ].map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      playConfirmSound();
                      setCategory(c.id as RecordCategory);
                    }}
                    onMouseEnter={playHoverSound}
                    className={`px-2.5 py-1 text-xs font-mono font-medium rounded-sm border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                        : 'border-[#262626] bg-[#0A0A0A] text-[#737373] hover:border-[#333333]'
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. What: Detailed Memo */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#A3A3A3] mb-1">
              体験・出来事メモ (ACTIVITY LOG) <span className="text-[#D4AF37]">*</span>
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              placeholder="例: ゾンビ2体を目視。初めての洞窟なので探索してみたが、そう深くはない。松明を立てつつ石炭が少量手に入った。"
              className="w-full px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] text-[#E5E5E5] rounded-sm text-xs sm:text-sm leading-relaxed focus:border-[#D4AF37] focus:outline-none resize-y min-h-[90px]"
              required
            />
          </div>

          {/* 5. Party Members Involved */}
          {world.members.length > 0 && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#A3A3A3] mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>参加・同行メンバー</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {world.members.map((m) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleMember(m.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm border text-xs font-mono transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                          : 'border-[#262626] bg-[#0A0A0A] text-[#737373]'
                      }`}
                    >
                      <span>@{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Photos (Screenshots & Memory Snaps) */}
          <div className="border-t border-[#262626] pt-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold text-[#A3A3A3] flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>添付写真・スクリーンショット ({photos.length}枚)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPhotoPicker(!showPhotoPicker)}
                onMouseEnter={playHoverSound}
                className="text-[11px] font-mono font-bold text-[#D4AF37] hover:text-[#E5C158] cursor-pointer"
              >
                {showPhotoPicker ? '✕ 閉じる' : '+ 写真を追加'}
              </button>
            </div>

            {/* Photo Picker Drawer */}
            {showPhotoPicker && (
              <div className="p-3 mb-3 bg-[#0A0A0A] border border-[#D4AF37]/40 rounded-sm space-y-2.5">
                <div className="text-[11px] text-[#A3A3A3] font-bold">画像URLを入力またはプリセットから選択:</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-2.5 py-1.5 bg-[#141414] border border-[#2A2A2A] text-xs text-[#E5E5E5] rounded-sm focus:border-[#D4AF37] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddPhoto(newPhotoUrl, newPhotoCaption)}
                    disabled={!newPhotoUrl.trim()}
                    className="px-3 py-1.5 bg-[#D4AF37] text-black font-mono text-xs font-bold rounded-sm disabled:opacity-40 cursor-pointer"
                  >
                    追加
                  </button>
                </div>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="写真のキャプション (任意)"
                  className="w-full px-2.5 py-1 bg-[#141414] border border-[#2A2A2A] text-xs text-[#A3A3A3] rounded-sm focus:border-[#D4AF37] focus:outline-none"
                />

                <div className="pt-1">
                  <div className="text-[10px] text-[#737373] mb-1 font-mono">サンプル写真から即座に追加:</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {SAMPLE_PHOTO_PRESETS.map((pUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddPhoto(pUrl, `${locationName || '冒険'} スナップ写真 ${idx + 1}`)}
                        className="relative w-14 h-11 shrink-0 rounded-sm overflow-hidden border border-[#2A2A2A] hover:border-[#D4AF37] transition-transform active:scale-95 cursor-pointer"
                      >
                        <img src={pUrl} alt="sample" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photos Preview Grid */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="relative group bg-[#0A0A0A] border border-[#262626] rounded-sm overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'photo'}
                      className="w-full h-24 object-cover"
                    />
                    <div className="p-1.5 text-[10px] text-[#A3A3A3] truncate font-mono">
                      {photo.caption || 'キャプションなし'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-900/90 text-white rounded-sm opacity-90 hover:opacity-100 cursor-pointer"
                      title="写真を削除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            className="flex-1 py-2.5 bg-[#141414] hover:bg-[#1F1F1F] text-[#A3A3A3] font-mono text-xs font-medium border border-[#2A2A2A] rounded-sm transition-all cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            onMouseEnter={playHoverSound}
            className="flex-1 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-black font-mono text-xs sm:text-sm font-bold border-b-2 border-[#A68824] active:border-b-0 active:translate-y-0.5 rounded-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 fill-black stroke-none" />
            <span>▶ {isEdit ? '記録を更新' : '冒険日誌に記録する'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
