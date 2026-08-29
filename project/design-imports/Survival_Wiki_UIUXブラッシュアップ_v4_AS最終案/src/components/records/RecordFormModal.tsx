import React, { useState, useRef } from 'react';
import { LocationRecord, Coordinates } from '../../types';
import { X, Camera, MapPin, Users, Save, Sparkles, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface RecordFormModalProps {
  recordToEdit?: LocationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (recordData: Partial<LocationRecord>) => void;
  availableCompanions: string[];
}

export const RecordFormModal: React.FC<RecordFormModalProps> = ({
  recordToEdit,
  isOpen,
  onClose,
  onSave,
  availableCompanions,
}) => {
  if (!isOpen) return null;

  const isEditing = !!recordToEdit;
  const [title, setTitle] = useState(recordToEdit?.title || '');
  const [memo, setMemo] = useState(recordToEdit?.memo || '');
  const [photoUrl, setPhotoUrl] = useState(recordToEdit?.photoUrl || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Coordinate states
  const [coordX, setCoordX] = useState<string>(
    recordToEdit?.hasExplicitCoordinates && recordToEdit.coordinates
      ? String(recordToEdit.coordinates.x)
      : ''
  );
  const [coordY, setCoordY] = useState<string>(
    recordToEdit?.hasExplicitCoordinates && recordToEdit.coordinates
      ? String(recordToEdit.coordinates.y)
      : ''
  );
  const [coordZ, setCoordZ] = useState<string>(
    recordToEdit?.hasExplicitCoordinates && recordToEdit.coordinates
      ? String(recordToEdit.coordinates.z)
      : ''
  );

  // Companions
  const [selectedCompanions, setSelectedCompanions] = useState<string[]>(
    recordToEdit?.companions || []
  );

  // Collapsible detailed options: default closed for new, open for edit
  const [showDetails, setShowDetails] = useState(
    isEditing || (recordToEdit?.hasExplicitCoordinates ?? false)
  );

  const toggleCompanion = (name: string) => {
    soundEngine.playSe('menu_cursor');
    setSelectedCompanions((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        soundEngine.playSe('menu_select');
        setPhotoUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Check if coordinates were explicitly filled
    const hasCoordinatesInput = coordX.trim() !== '' || coordY.trim() !== '' || coordZ.trim() !== '';
    let coordinates: Coordinates | undefined = undefined;
    let hasExplicit = false;

    if (hasCoordinatesInput) {
      const numX = coordX.trim() === '' ? 0 : Number(coordX);
      const numY = coordY.trim() === '' ? 0 : Number(coordY);
      const numZ = coordZ.trim() === '' ? 0 : Number(coordZ);

      if (!isNaN(numX) && !isNaN(numY) && !isNaN(numZ)) {
        coordinates = { x: numX, y: numY, z: numZ };
        hasExplicit = true;
      }
    }

    if (isEditing) {
      soundEngine.playSe('save_record');
    } else {
      soundEngine.playSe('new_record');
    }

    onSave({
      title: title.trim(),
      memo: memo.trim(),
      photoUrl: photoUrl || undefined,
      photos: photoUrl ? [photoUrl] : [],
      hasExplicitCoordinates: hasExplicit,
      coordinates: coordinates,
      companions: selectedCompanions,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider">
              {isEditing ? '探索記録の編集' : 'QUICK LOG // 新規記録'}
            </h3>
          </div>

          <button
            id="btn-close-record-form"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: CORE FIELDS (Title, Memo, Real Photo Upload) */}
          <div className="space-y-3.5">
            {/* Title / Location Name */}
            <div>
              <label className="block text-xs font-game text-[#F8FAFC] mb-1.5 flex items-center justify-between">
                <span>タイトル / 発見場所の名称</span>
                <span className="text-[10px] font-mono text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-1.5 py-0.5 rounded border border-[#F59E0B]/30">
                  必須
                </span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 第一前哨基地の完成、海中鍾乳洞の発見"
                className="w-full px-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#F59E0B] rounded text-sm text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors"
              />
            </div>

            {/* Experience Memo */}
            <div>
              <label className="block text-xs font-game text-[#94A3B8] mb-1.5">
                体験メモ・発見の物語
              </label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="その場所で起きた出来事、見つけた資材、周囲の状況などを自由にメモ..."
                className="w-full px-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#F59E0B] rounded text-xs text-[#F8FAFC] placeholder-[#64748B] outline-none transition-colors resize-none font-jp leading-relaxed"
              />
            </div>

            {/* Real Photo Upload UI Only (Direct file selection & Drag/Drop) */}
            <div>
              <label className="block text-xs font-game text-[#94A3B8] mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-[#06B6D4]" />
                  記録写真（端末から写真を選択）
                </span>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-[10px] text-[#EF4444] hover:underline flex items-center gap-0.5"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    写真を解除
                  </button>
                )}
              </label>

              {/* Hidden native file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="photo-file-upload-input"
              />

              {photoUrl ? (
                /* Selected Photo Preview */
                <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-[#F59E0B]/60 bg-[#0B1018] group">
                  <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded bg-[#161F30] text-xs font-game text-[#F8FAFC] border border-[#334155] hover:border-[#F59E0B]"
                    >
                      写真を変更
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3 py-1.5 rounded bg-[#2A161C] text-xs font-game text-[#EF4444] border border-[#EF4444]/40"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                /* Photo Dropzone & Picker Button */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 px-4 rounded-lg border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? 'border-[#F59E0B] bg-[#F59E0B]/10'
                      : 'border-[#334155] hover:border-[#06B6D4]/60 bg-[#0B1018]/60 hover:bg-[#101926]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#161F30] border border-[#334155] flex items-center justify-center text-[#06B6D4]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-game text-[#F1F5F9] font-bold">
                      写真ファイルを選択またはドラッグ＆ドロップ
                    </div>
                    <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
                      PNG / JPG / WEBP に対応
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: DETAILED OPTIONS (Coordinates, Companions) */}
          <div className="pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_cursor');
                setShowDetails(!showDetails);
              }}
              className="w-full flex items-center justify-between py-2 text-xs font-game text-[#94A3B8] hover:text-[#06B6D4] transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>詳細オプション（座標・同行者）</span>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {showDetails ? '展開中' : '未設定時は座標非表示'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">{showDetails ? '▲' : '▼'}</span>
            </button>

            {showDetails && (
              <div className="mt-2.5 space-y-3.5 bg-[#0B1018]/60 p-3 rounded-lg border border-[#1E293B]">
                {/* 3-Axis Coordinates X, Y, Z (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-game text-[#94A3B8] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F59E0B]" />
                      空間座標 (X / Y / Z)
                    </label>
                    <span className="text-[10px] font-mono text-[#64748B]">
                      空欄なら座標情報なし
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <div className="text-[10px] font-mono text-[#64748B] mb-0.5">X 軸</div>
                      <input
                        type="number"
                        value={coordX}
                        onChange={(e) => setCoordX(e.target.value)}
                        placeholder="例: 120 (0も可)"
                        className="w-full px-2.5 py-1.5 bg-[#161F30] border border-[#334155] focus:border-[#F59E0B] rounded text-xs font-mono text-[#F8FAFC] outline-none"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#64748B] mb-0.5">Y 軸 (高度)</div>
                      <input
                        type="number"
                        value={coordY}
                        onChange={(e) => setCoordY(e.target.value)}
                        placeholder="例: 64"
                        className="w-full px-2.5 py-1.5 bg-[#161F30] border border-[#334155] focus:border-[#F59E0B] rounded text-xs font-mono text-[#F8FAFC] outline-none"
                      />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-[#64748B] mb-0.5">Z 軸</div>
                      <input
                        type="number"
                        value={coordZ}
                        onChange={(e) => setCoordZ(e.target.value)}
                        placeholder="例: -310"
                        className="w-full px-2.5 py-1.5 bg-[#161F30] border border-[#334155] focus:border-[#F59E0B] rounded text-xs font-mono text-[#F8FAFC] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Companions Checkbox Chips */}
                {availableCompanions.length > 0 && (
                  <div>
                    <label className="block text-xs font-game text-[#94A3B8] mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3 text-[#06B6D4]" />
                      同行メンバーを選択
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableCompanions.map((companion) => {
                        const isSelected = selectedCompanions.includes(companion);
                        return (
                          <button
                            key={companion}
                            type="button"
                            onClick={() => toggleCompanion(companion)}
                            className={`px-2.5 py-1 rounded text-xs font-jp transition-colors border ${
                              isSelected
                                ? 'bg-[#06B6D4]/20 border-[#06B6D4] text-[#38BDF8] font-bold'
                                : 'bg-[#161F30] border-[#334155] text-[#94A3B8] hover:text-[#E2E8F0]'
                            }`}
                          >
                            {companion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_back');
                onClose();
              }}
              className="px-3.5 py-2 rounded text-xs font-game text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
            >
              キャンセル
            </button>

            <button
              id="btn-save-record-form"
              type="submit"
              className="px-5 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] flex items-center gap-1.5 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isEditing ? '変更を保存' : '記録を保存する'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
