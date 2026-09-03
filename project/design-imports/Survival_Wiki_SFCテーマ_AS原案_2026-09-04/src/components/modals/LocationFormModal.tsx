import React, { useState } from 'react';
import { X, Save, Plus, MapPin, Calendar, Clock, Image as ImageIcon, Trash2 } from 'lucide-react';
import { RecordItem, WorldMember } from '../../types';

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: Partial<RecordItem>) => void;
  editRecord?: RecordItem | null;
  worldMembers: WorldMember[];
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editRecord,
  worldMembers,
}) => {
  const [name, setName] = useState(editRecord?.name || '');
  const [x, setX] = useState<string>(editRecord?.x !== undefined ? String(editRecord.x) : '');
  const [y, setY] = useState<string>(editRecord?.y !== undefined ? String(editRecord.y) : '');
  const [z, setZ] = useState<string>(editRecord?.z !== undefined ? String(editRecord.z) : '');
  const [detailMemo, setDetailMemo] = useState(editRecord?.detail_memo || '');
  const [date, setDate] = useState(editRecord?.date || '2026/08/30');
  const [time, setTime] = useState(editRecord?.time || '15:30');
  const [category, setCategory] = useState<RecordItem['category']>(editRecord?.category || 'base');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(editRecord?.members || []);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string; caption?: string }[]>(
    editRecord?.photos || []
  );

  if (!isOpen) return null;

  const handleToggleMember = (memberName: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberName) ? prev.filter((m) => m !== memberName) : [...prev, memberName]
    );
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    setPhotos((prev) => [
      ...prev,
      {
        id: `p-${Date.now()}`,
        url: photoUrl.trim(),
        caption: photoCaption.trim() || undefined,
      },
    ]);
    setPhotoUrl('');
    setPhotoCaption('');
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const hasCoords = x.trim() !== '' && y.trim() !== '' && z.trim() !== '';

    onSave({
      name: name.trim(),
      x: hasCoords ? Number(x) : undefined,
      y: hasCoords ? Number(y) : undefined,
      z: hasCoords ? Number(z) : undefined,
      has_coordinates: hasCoords,
      detail_memo: detailMemo.trim(),
      date,
      time,
      category,
      members: selectedMembers,
      photos,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="sfc-window w-full max-w-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] border border-black" />
            <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
              {editRecord ? '冒険記録の編集 (EDIT RECORD)' : '新しい冒険記録を刻む (ADD RECORD)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1 rounded"
            title="閉じる"
          >
            <X className="w-4 h-4 text-[var(--text-main)]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Location Title */}
          <div className="space-y-1">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              地点・出来事の名称 (LOCATION / EVENT NAME) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 第壱主拠点「オロチ砦」本丸"
              className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none focus:border-[var(--accent-blue)] shadow-inner"
            />
          </div>

          {/* Coordinates X, Y, Z Matrix */}
          <div className="space-y-1">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-red)]" />
              空間座標 (COORDINATES: X / Y / Z)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center gap-1 bg-[var(--surface-recessed)] px-2 py-1 rounded border-2 border-[var(--border-main)] shadow-inner">
                <span className="font-dot text-xs font-bold text-[var(--text-muted)]">X:</span>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  placeholder="120"
                  className="w-full text-xs bg-transparent text-[var(--text-main)] font-dot focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-[var(--surface-recessed)] px-2 py-1 rounded border-2 border-[var(--border-main)] shadow-inner">
                <span className="font-dot text-xs font-bold text-[var(--text-muted)]">Y:</span>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  placeholder="64"
                  className="w-full text-xs bg-transparent text-[var(--text-main)] font-dot focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-[var(--surface-recessed)] px-2 py-1 rounded border-2 border-[var(--border-main)] shadow-inner">
                <span className="font-dot text-xs font-bold text-[var(--text-muted)]">Z:</span>
                <input
                  type="number"
                  value={z}
                  onChange={(e) => setZ(e.target.value)}
                  placeholder="-320"
                  className="w-full text-xs bg-transparent text-[var(--text-main)] font-dot focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Date, Time & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                記録日
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="2026/08/30"
                className="w-full p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                時刻
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="14:20"
                className="w-full p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none shadow-inner"
              />
            </div>
            <div className="space-y-1">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                分類カテゴリ
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none shadow-inner"
              >
                <option value="base">拠点設営 (Base)</option>
                <option value="resource">鉱脈・資源 (Resource)</option>
                <option value="structure">古代遺跡 (Structure)</option>
                <option value="hazard">危険地帯 (Hazard)</option>
                <option value="exploration">未知探査 (Exploration)</option>
              </select>
            </div>
          </div>

          {/* Detail Memo */}
          <div className="space-y-1">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              記録詳細・サバイバル行動ログ
            </label>
            <textarea
              rows={4}
              value={detailMemo}
              onChange={(e) => setDetailMemo(e.target.value)}
              placeholder="発見した物資、遭遇した生物、建造物の構造、今後の課題など..."
              className="w-full p-2.5 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-sans leading-relaxed focus:outline-none focus:border-[var(--accent-blue)] shadow-inner resize-none"
            />
          </div>

          {/* Companions Select */}
          {worldMembers && worldMembers.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[var(--border-groove)]">
              <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
                同行メンバー選択
              </label>
              <div className="flex flex-wrap gap-2">
                {worldMembers.map((m) => {
                  const isChecked = selectedMembers.includes(m.name);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleMember(m.name)}
                      className={`px-3 py-1 text-xs font-dot rounded border transition-all ${
                        isChecked
                          ? 'bg-[var(--accent-blue)] text-white border-black font-bold'
                          : 'bg-[var(--surface-recessed)] text-[var(--text-muted)] border-[var(--border-main)]'
                      }`}
                    >
                      {isChecked ? '✓ ' : ''}{m.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photo Attachments */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-groove)]">
            <label className="font-dot text-xs text-[var(--text-muted)] font-bold block">
              写真・スクリーンショット添付 (PHOTO LOGS)
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="画像URL (https://...)"
                className="w-full sm:flex-1 p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none shadow-inner"
              />
              <input
                type="text"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="キャプション（任意）"
                className="w-full sm:w-44 p-2 text-xs bg-[var(--surface-recessed)] border-2 border-[var(--border-main)] rounded text-[var(--text-main)] font-dot focus:outline-none shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="sfc-btn sfc-btn-convex sfc-btn-y px-3 py-2 text-xs font-dot flex items-center gap-1 w-full sm:w-auto justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>写真追加</span>
              </button>
            </div>

            {/* Photos Preview Thumbnails */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative rounded border-2 border-[var(--border-dark)] overflow-hidden bg-black aspect-video group"
                  >
                    <img src={p.url} alt="thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(p.id)}
                      className="absolute top-1 right-1 p-1 rounded bg-red-600 text-white opacity-90 hover:opacity-100"
                      title="削除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {p.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] text-white font-dot truncate px-1 py-0.5">
                        {p.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[var(--border-main)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-2 text-xs font-dot"
            >
              キャンセル (CANCEL)
            </button>
            <button
              type="submit"
              className="sfc-btn sfc-btn-convex sfc-btn-b px-5 py-2 text-xs font-dot flex items-center gap-1.5 font-bold"
            >
              <Save className="w-4 h-4" />
              <span>記録を刻む (SAVE RECORD)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
