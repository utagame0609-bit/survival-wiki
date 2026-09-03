import React, { useState } from 'react';
import { X, Share2, Copy, Check, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';
import { RecordItem, World } from '../../types';

interface SnsShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordItem | null;
  world: World | null;
}

export const SnsShareModal: React.FC<SnsShareModalProps> = ({
  isOpen,
  onClose,
  record,
  world,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record || !world) return null;

  const shareText = `【Survival Wiki 冒険日誌】\n🌍 ワールド: ${world.name}\n📍 地点: ${record.name} (${record.has_coordinates ? `X:${record.x}, Y:${record.y}, Z:${record.z}` : ''})\n📅 日時: ${record.date} ${record.time}\n📝 メモ: ${record.detail_memo.slice(0, 80)}...\n#SurvivalWiki #16bitSFC #サバイバルゲーム`;

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="sfc-window w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[var(--accent-blue)]" />
            <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
              SNS共有カード生成 (PIXEL SHARE CARD)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral p-1 rounded"
          >
            <X className="w-4 h-4 text-[var(--text-main)]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Visual 16-bit Retro Card Preview */}
          <div className="rounded-xl border-3 border-[var(--border-dark)] bg-gradient-to-br from-[#2a2d34] to-[#1a1b1f] text-white p-4 sm:p-5 shadow-2xl relative overflow-hidden space-y-3">
            {/* Header / Logo */}
            <div className="flex items-center justify-between border-b border-white/20 pb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a6f97]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e9c46a]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#2a9d8f]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#e63946]" />
                <span className="font-sfc-title text-xs font-bold tracking-wider ml-1">
                  SURVIVAL WIKI
                </span>
              </div>
              <span className="font-dot text-[9px] text-amber-300">
                16-BIT MEMORY
              </span>
            </div>

            {/* Photo & Record info */}
            {record.photos && record.photos.length > 0 && (
              <div className="relative rounded border-2 border-white/30 overflow-hidden aspect-video bg-black">
                <img
                  src={record.photos[0].url}
                  alt={record.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-1 font-dot">
              <h4 className="text-base sm:text-lg font-bold text-amber-300">
                {record.name}
              </h4>
              <div className="flex items-center gap-3 text-xs text-slate-300 flex-wrap">
                <span>{record.date} {record.time}</span>
                {record.has_coordinates && (
                  <span>[XYZ: {record.x}, {record.y}, {record.z}]</span>
                )}
              </div>
              <p className="text-xs text-slate-200 line-clamp-2 pt-1 font-sans">
                {record.detail_memo}
              </p>
            </div>

            {/* Footer stamp */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-dot text-slate-400">
              <span>WORLD: {world.name}</span>
              <span>COMMANDER: {world.player}</span>
            </div>
          </div>

          {/* Copy Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="sfc-btn sfc-btn-convex sfc-btn-x w-full py-2.5 text-xs font-dot flex items-center justify-center gap-2 shadow"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>共有テキストをコピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>共有用テキストをコピー (COPY TEXT)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral px-4 py-1.5 text-xs font-dot"
          >
            閉じる (CLOSE)
          </button>
        </div>
      </div>
    </div>
  );
};
