import React, { useState } from 'react';
import { LocationRecord, World } from '../../types';
import { X, Copy, Check, ExternalLink, Share2, Twitter } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface SnsShareModalProps {
  record: LocationRecord | null;
  world: World;
  isOpen: boolean;
  onClose: () => void;
}

export const SnsShareModal: React.FC<SnsShareModalProps> = ({
  record,
  world,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !record) return null;

  const [copied, setCopied] = useState(false);

  // Build the tweet text with proper coordinate handling
  const coordinateText =
    record.hasExplicitCoordinates && record.coordinates
      ? `\n📍 座標: X:${record.coordinates.x} Y:${record.coordinates.y} Z:${record.coordinates.z}`
      : '';

  const initialShareText = `【${world.name} // 探索ログ】
DAY ${String(record.dayNumber).padStart(2, '0')} : ${record.title}${coordinateText}

${record.memo ? record.memo.substring(0, 80) + (record.memo.length > 80 ? '…' : '') : ''}

#SurvivalWiki #冒険の書`;

  const [shareText, setShareText] = useState(initialShareText);

  const handleCopy = () => {
    soundEngine.playSe('copy_success');
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTwitter = () => {
    soundEngine.playSe('menu_select');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider">
              X (Twitter) 共有テキスト
            </h3>
          </div>

          <button
            id="btn-close-sns-share"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-game text-[#94A3B8] mb-1.5 flex items-center justify-between">
              <span>投稿文の確認・編集</span>
              <span className="text-[10px] font-mono text-[#64748B]">
                {shareText.length} 文字
              </span>
            </label>
            <textarea
              rows={6}
              value={shareText}
              onChange={(e) => setShareText(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B1018] border border-[#334155] focus:border-[#06B6D4] rounded text-xs text-[#F8FAFC] font-jp leading-relaxed outline-none transition-colors"
            />
          </div>

          {/* Photo attachment reminder notice */}
          {record.photoUrl && (
            <div className="flex items-center gap-3 p-2.5 bg-[#161F30] rounded border border-[#334155]/60">
              <img
                src={record.photoUrl}
                alt=""
                className="w-12 h-12 rounded object-cover border border-[#334155]"
                referrerPolicy="no-referrer"
              />
              <p className="text-[11px] text-[#94A3B8] font-jp leading-snug">
                ※画像はXの投稿画面で手動添付してください。
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1E293B]">
            <button
              id="btn-copy-sns-text"
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#161F30] hover:bg-[#1E293B] border border-[#334155] text-xs font-game text-[#F8FAFC] transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#06B6D4]" />
                  <span>本文をコピー</span>
                </>
              )}
            </button>

            <button
              id="btn-open-x-intent"
              type="button"
              onClick={handleOpenTwitter}
              className="flex items-center gap-1.5 px-4 py-2 rounded bg-[#06B6D4] hover:bg-[#0891B2] text-[#0B1018] font-game font-bold text-xs tracking-wider transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)] active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>X で共有する</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
