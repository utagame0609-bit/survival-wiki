import React, { useState } from 'react';
import { LocationRecord } from '../../types';
import { X, Clock, MapPin, Users, Share2, Edit3, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface RecordDetailModalProps {
  record: LocationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (record: LocationRecord) => void;
  onDelete: (recordId: string) => void;
  onShare: (record: LocationRecord) => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onShare,
}) => {
  if (!isOpen || !record) return null;

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const allPhotos = record.photos && record.photos.length > 0 
    ? record.photos 
    : record.photoUrl ? [record.photoUrl] : [];

  const currentPhoto = allPhotos[activePhotoIdx] || record.photoUrl;

  const formattedDateTime = record.createdAt.replace('T', ' ').substring(0, 16);

  const handleDelete = () => {
    soundEngine.playSe('danger_delete');
    onDelete(record.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#F59E0B] font-bold bg-[#F59E0B]/10 px-2 py-0.5 rounded border border-[#F59E0B]/30">
              DAY {String(record.dayNumber).padStart(2, '0')}
            </span>
            <span className="text-xs font-mono text-[#64748B]">// 記録詳細</span>
          </div>

          <button
            id="btn-close-record-detail"
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

        {/* Content Body: Photo + Title + Memo (Hero) */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Main Hero Photo Showcase */}
          {currentPhoto && (
            <div className="space-y-2">
              <div className="relative w-full aspect-video sm:aspect-[16/10] max-h-[360px] rounded-lg overflow-hidden bg-[#0B1018] border border-[#1E293B]">
                <img
                  src={currentPhoto}
                  alt={record.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />

                {/* Multi-Photo Carousel Controls */}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSe('menu_cursor');
                        setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playSe('menu_cursor');
                        setActivePhotoIdx((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-[#0B1018]/80 text-[#F8FAFC] hover:bg-[#F59E0B] hover:text-[#0B1018] transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-[#0B1018]/90 text-[10px] font-mono text-[#06B6D4] border border-[#06B6D4]/30">
                      {activePhotoIdx + 1} / {allPhotos.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnails if multiple photos */}
              {allPhotos.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {allPhotos.map((photo, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundEngine.playSe('menu_cursor');
                        setActivePhotoIdx(idx);
                      }}
                      className={`relative w-14 h-14 rounded overflow-hidden shrink-0 border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-[#F59E0B] scale-105'
                          : 'border-[#334155] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Record Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-game font-bold text-[#F8FAFC] tracking-wide leading-snug">
              {record.title}
            </h2>
          </div>

          {/* Discovery Story / Memo (Prominent & readable) */}
          <div className="bg-[#0B1018]/80 p-3.5 sm:p-4 rounded-lg border border-[#1E293B]">
            <div className="text-[11px] font-mono text-[#F59E0B] mb-1.5 font-bold uppercase tracking-wider">
              // DISCOVERY LOG / MEMO
            </div>
            <p className="text-sm text-[#E2E8F0] font-jp whitespace-pre-wrap leading-relaxed">
              {record.memo || 'メモの記録はありません。'}
            </p>
          </div>

          {/* Compact Metadata Row (Datetime + Compact Coordinates if present + Companions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Datetime Info */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#334155]/60 text-xs font-mono text-[#94A3B8]">
              <Clock className="w-4 h-4 text-[#06B6D4] shrink-0" />
              <span>{formattedDateTime}</span>
            </div>

            {/* Compact Coordinates (ONLY displayed if explicitly provided by user) */}
            {record.hasExplicitCoordinates && record.coordinates ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#F59E0B]/40 text-xs font-mono text-[#F59E0B]">
                <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>
                  POS: X:{record.coordinates.x} Y:{record.coordinates.y} Z:{record.coordinates.z}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#161F30]/50 rounded border border-[#334155]/30 text-xs font-mono text-[#64748B]">
                <MapPin className="w-4 h-4 text-[#64748B] shrink-0" />
                <span>座標未設定（任意）</span>
              </div>
            )}

            {/* Companions Info */}
            {record.companions.length > 0 && (
              <div className="sm:col-span-2 flex items-center gap-2 px-3 py-2 bg-[#161F30] rounded border border-[#334155]/60 text-xs font-mono text-[#94A3B8]">
                <Users className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <span>同行者: {record.companions.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Delete Confirmation Warning Drawer */}
          {showDeleteConfirm && (
            <div className="p-3 bg-[#2A1218] border border-[#EF4444]/60 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-xs font-game text-[#EF4444] font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>この探索記録を削除しますか？ この操作は取り消せません。</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 rounded text-xs font-game text-[#94A3B8] hover:bg-[#1E293B]"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded bg-[#EF4444] hover:bg-[#DC2626] text-[#FFFFFF] font-game text-xs font-bold"
                >
                  削除を実行
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls Footer: Edit (Primary), Share (Secondary), Delete (Tertiary / weak) */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-t border-[#1E293B]">
          {/* Left: Weak Tertiary Delete trigger */}
          <button
            id="btn-delete-record"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_cursor');
              setShowDeleteConfirm(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-game text-[#64748B] hover:text-[#EF4444] hover:bg-[#2A161C]/50 transition-colors opacity-70 hover:opacity-100"
            title="探索記録を削除"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">削除</span>
          </button>

          {/* Right: Share (Secondary) + Edit (Primary) */}
          <div className="flex items-center gap-2">
            {/* Secondary: Share action */}
            <button
              id="btn-share-record"
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_select');
                onShare(record);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#161F30] hover:bg-[#1E293B] text-[#94A3B8] hover:text-[#06B6D4] border border-[#334155]/70 font-game text-xs transition-colors active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>共有</span>
            </button>

            {/* Primary: Edit action */}
            <button
              id="btn-edit-record"
              type="button"
              onClick={() => {
                soundEngine.playSe('menu_select');
                onEdit(record);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>編集する</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
