import React, { useState, useRef } from 'react';
import { X, Camera, MapPin, Hash, Sparkles, Plus, Image as ImageIcon, Check, Navigation } from 'lucide-react';
import { World, LogEntry, PhotoItem } from '../types';
import { sound } from '../audio/soundEngine';

interface QuickLogModalProps {
  world: World;
  logToEdit?: LogEntry | null;
  onSave: (logData: Omit<LogEntry, 'id' | 'worldId' | 'createdAt'>) => void;
  onClose: () => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  world,
  logToEdit,
  onSave,
  onClose,
}) => {
  const [locationName, setLocationName] = useState(logToEdit?.locationName || '');
  const [isCoordinatesMode, setIsCoordinatesMode] = useState(
    logToEdit?.coordinates !== undefined || world.category === 'game'
  );
  const [posX, setPosX] = useState<string>(logToEdit?.coordinates?.x !== undefined ? String(logToEdit.coordinates.x) : '');
  const [posY, setPosY] = useState<string>(logToEdit?.coordinates?.y !== undefined ? String(logToEdit.coordinates.y) : '');
  const [posZ, setPosZ] = useState<string>(logToEdit?.coordinates?.z !== undefined ? String(logToEdit.coordinates.z) : '');
  const [area, setArea] = useState(logToEdit?.area || '');
  const [memo, setMemo] = useState(logToEdit?.memo || '');
  const [dayNumber, setDayNumber] = useState<number>(logToEdit?.dayNumber || 1);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    logToEdit?.memberIds || world.members.map((m) => m.id)
  );
  const [photos, setPhotos] = useState<PhotoItem[]>(logToEdit?.photos || []);
  const [tags, setTags] = useState<string[]>(logToEdit?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common quick tags suggestions
  const SUGGESTED_TAGS = world.category === 'game'
    ? ['採掘', '拠点', '探検', '農業', '建築', 'ネザー', 'ボス戦', 'チェスト']
    : ['グルメ', '観光', '写真', '散歩', 'カフェ', '買い物', '絶景', '記念'];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    sound.playShutter();

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setPhotos((prev) => [
            ...prev,
            {
              id: 'p-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
              url: result,
              caption: file.name.replace(/\.[^/.]+$/, ''),
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    sound.playCancel();
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const handleToggleMember = (memberId: string) => {
    sound.playHover();
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().replace(/^#/, '');
    if (!clean || tags.includes(clean)) return;
    sound.playConfirm();
    setTags([...tags, clean]);
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    sound.playCancel();
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    sound.playSaveLog();

    const now = new Date();
    const formattedTimestamp = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onSave({
      dayNumber: Number(dayNumber) || 1,
      timestamp: logToEdit?.timestamp || formattedTimestamp,
      locationName: locationName.trim(),
      coordinates:
        isCoordinatesMode && posX !== '' && posZ !== ''
          ? {
              x: Number(posX) || 0,
              y: Number(posY) || 64,
              z: Number(posZ) || 0,
            }
          : undefined,
      area: !isCoordinatesMode || area ? area.trim() : undefined,
      memo: memo.trim(),
      photos,
      memberIds: selectedMemberIds,
      tags,
      starred: logToEdit?.starred || false,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          sound.playCancel();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#0a0a0c] border-2 border-[#ff8c00] shadow-[8px_8px_0px_#000000] rounded-xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#121214] border-b-2 border-[#333338] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#ff8c00] animate-pulse shadow-[0_0_8px_#ff8c00]" />
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide terminal-font">
              {logToEdit ? 'EDIT RECORD // 記録を編集' : 'QUICK LOG // 冒険を記録する'}
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playCancel();
              onClose();
            }}
            className="p-1.5 text-[#888888] hover:text-white rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 bg-[#0e0e11]">
          {/* Day & Location Row */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-24 shrink-0">
                <label className="block text-[11px] font-bold text-[#ff8c00] terminal-font mb-1">
                  DAY NUMBER
                </label>
                <div className="flex items-center bg-[#141417] border-2 border-[#333338] rounded-lg px-2 py-2 shadow-[2px_2px_0px_#000000]">
                  <span className="text-xs terminal-font font-bold text-[#888888] mr-1">DAY</span>
                  <input
                    type="number"
                    min="1"
                    value={dayNumber}
                    onChange={(e) => setDayNumber(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs terminal-font font-bold text-white bg-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-[11px] font-bold text-[#dcdcdc] terminal-font mb-1">
                  LOCATION NAME // 地点・場所名 <span className="text-[#ff8c00]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#ff8c00] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="例: 浅めの洞窟、通天閣、など"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#141417] border-2 border-[#333338] text-white text-sm focus:border-[#ff8c00] outline-none transition font-bold shadow-[2px_2px_0px_#000000]"
                  />
                </div>
              </div>
            </div>

            {/* Coordinates vs Area Toggle */}
            <div className="p-3 bg-[#121214] rounded-lg border-2 border-[#333338] space-y-2 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] terminal-font font-bold text-[#aaaaaa] flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5 text-[#00ff41]" /> 位置情報 (座標 または エリア名)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sound.playHover();
                    setIsCoordinatesMode(!isCoordinatesMode);
                  }}
                  className="text-[10px] terminal-font font-bold text-[#ff8c00] hover:underline cursor-pointer"
                >
                  {isCoordinatesMode ? '→ エリア名形式に切替' : '→ X/Y/Z座標形式に切替'}
                </button>
              </div>

              {isCoordinatesMode ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center bg-[#18181c] border-2 border-[#333338] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0px_#000000]">
                    <span className="text-xs terminal-font font-bold text-rose-400 mr-1.5">X:</span>
                    <input
                      type="number"
                      placeholder="-177"
                      value={posX}
                      onChange={(e) => setPosX(e.target.value)}
                      className="w-full text-xs terminal-font text-white bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-[#18181c] border-2 border-[#333338] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0px_#000000]">
                    <span className="text-xs terminal-font font-bold text-[#00ff41] mr-1.5">Y:</span>
                    <input
                      type="number"
                      placeholder="62"
                      value={posY}
                      onChange={(e) => setPosY(e.target.value)}
                      className="w-full text-xs terminal-font text-white bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex items-center bg-[#18181c] border-2 border-[#333338] rounded-lg px-2.5 py-1.5 shadow-[2px_2px_0px_#000000]">
                    <span className="text-xs terminal-font font-bold text-[#ffa500] mr-1.5">Z:</span>
                    <input
                      type="number"
                      placeholder="168"
                      value={posZ}
                      onChange={(e) => setPosZ(e.target.value)}
                      className="w-full text-xs terminal-font text-white bg-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="例: 大阪市浪速区、拠点北東の山脈"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#18181c] border-2 border-[#333338] text-white text-xs focus:border-[#ff8c00] outline-none shadow-[2px_2px_0px_#000000]"
                />
              )}
            </div>
          </div>

          {/* Memo / Experience details */}
          <div>
            <label className="block text-[11px] font-bold text-[#dcdcdc] terminal-font mb-1">
              EXPERIENCE MEMO // 何をした？ 体験メモ <span className="text-[#ff8c00]">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="例: ゾンビ2体を目視。初めての洞窟なので探索してみたが、石炭が手に入った。 / 串カツを食べた。サクサクで美味しかった！"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#141417] border-2 border-[#333338] text-white text-sm focus:border-[#ff8c00] outline-none transition leading-relaxed resize-none shadow-[2px_2px_0px_#000000]"
            />
          </div>

          {/* Photos Upload & Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-[#dcdcdc] terminal-font flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-[#ff8c00]" />
                PHOTOS // 写真・スクリーンショット ({photos.length})
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#ff8c00] hover:text-[#ffa500] font-bold flex items-center gap-1 cursor-pointer terminal-font"
              >
                <Plus className="w-3.5 h-3.5" /> 写真を追加
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              multiple
              accept="image/*"
              className="hidden"
            />

            {photos.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-lg border-2 border-dashed border-[#333338] bg-[#141417] hover:bg-[#18181c] hover:border-[#ff8c00] text-center cursor-pointer transition shadow-[2px_2px_0px_#000000]"
              >
                <ImageIcon className="w-6 h-6 text-[#666666] mx-auto mb-1" />
                <p className="text-xs text-[#888888] terminal-font">タップして写真・スクショを選択または撮影</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative aspect-[4/3] rounded-lg overflow-hidden border-2 border-[#333338] group bg-black shadow-[2px_2px_0px_#000000]"
                  >
                    <img src={p.url} alt="Uploaded" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="absolute top-1 right-1 p-1 rounded bg-black/80 text-white hover:bg-rose-600 cursor-pointer transition border border-white/20"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] rounded-lg border-2 border-dashed border-[#333338] bg-[#141417] flex flex-col items-center justify-center text-[#888888] hover:text-[#ff8c00] hover:border-[#ff8c00] cursor-pointer transition shadow-[2px_2px_0px_#000000]"
                >
                  <Plus className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] terminal-font">追加</span>
                </button>
              </div>
            )}
          </div>

          {/* Members / Companions Selection */}
          {world.members.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-[#dcdcdc] terminal-font mb-1.5">
                COMPANIONS // 一緒にいた仲間
              </label>
              <div className="flex flex-wrap gap-1.5">
                {world.members.map((m) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleMember(m.id)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-xs terminal-font font-bold flex items-center gap-1.5 transition cursor-pointer shadow-[2px_2px_0px_#000000] ${
                        isChecked
                          ? 'bg-[#ff8c00]/20 text-[#ff8c00] border-[#ff8c00]'
                          : 'bg-[#141417] border-[#333338] text-[#888888]'
                      }`}
                    >
                      <span>@{m.name}</span>
                      {isChecked && <Check className="w-3 h-3 text-[#ff8c00] stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-bold text-[#dcdcdc] terminal-font mb-1.5">
              TAGS // タグ分類
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#18181c] border-2 border-[#333338] text-xs text-[#00ff41] terminal-font shadow-[2px_2px_0px_#000000]"
                >
                  <Hash className="w-3 h-3 text-[#00ff41]" />
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="text-[#888888] hover:text-rose-400 ml-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(newTagInput);
                  }
                }}
                placeholder="タグを入力してEnter"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#141417] border-2 border-[#333338] text-white text-xs focus:border-[#ff8c00] outline-none shadow-[2px_2px_0px_#000000]"
              />
              <button
                type="button"
                onClick={() => handleAddTag(newTagInput)}
                className="px-3 py-1.5 bg-[#1e1e24] hover:bg-[#282830] text-[#dcdcdc] text-xs rounded-lg border-2 border-[#333338] font-bold cursor-pointer terminal-font shadow-[2px_2px_0px_#000000]"
              >
                追加
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t))
                .slice(0, 5)
                .map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleAddTag(st)}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#18181c] border border-[#333338] text-[#888888] hover:text-[#ff8c00] hover:border-[#ff8c00] terminal-font transition cursor-pointer"
                  >
                    +{st}
                  </button>
                ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t-2 border-[#333338] flex gap-2 justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                sound.playCancel();
                onClose();
              }}
              className="px-4 py-3 rounded-lg bg-[#18181c] hover:bg-[#202026] text-[#888888] hover:text-white border-2 border-[#333338] text-xs font-bold transition cursor-pointer terminal-font shadow-[2px_2px_0px_#000000]"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-lg bg-[#ff8c00] hover:bg-[#ffa500] text-black font-black text-sm active:scale-95 transition shadow-[3px_3px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer terminal-font"
            >
              <Sparkles className="w-4 h-4 stroke-[3]" />
              {logToEdit ? '▶ 記録を保存 (UPDATE)' : '▶ 冒険を記録 (SAVE LOG)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
