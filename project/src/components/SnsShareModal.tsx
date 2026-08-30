import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Share2, X } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playHoverSound, playInputFocusSound, playModalCloseSound } from '@/lib/sound';
import { LocationPhotoImage } from '@/components/LocationPhotoImage';

type SnsShareModalProps = {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onClose: () => void;
};

function buildTags(world: WorldWithMembers, location: LocationWithPhotos) {
  const candidates = [
    '#SurvivalWiki',
    `#${world.name.replace(/[\s#]/g, '')}`,
    `#${location.name.replace(/[\s#]/g, '')}`,
  ];
  const memo = location.detail_memo ?? '';
  if (memo.includes('洞窟')) candidates.push('#洞窟探索');
  if (memo.includes('廃坑')) candidates.push('#廃坑');
  if (memo.includes('建築') || memo.includes('拠点')) candidates.push('#建築');
  if (memo.includes('採掘') || memo.includes('鉱')) candidates.push('#採掘');
  if (memo.includes('探索')) candidates.push('#探索');
  return Array.from(new Set(candidates)).slice(0, 6).join(' ');
}

export function SnsShareModal({ world, location, onClose }: SnsShareModalProps) {
  const tags = useMemo(() => buildTags(world, location), [world, location]);
  const [postText, setPostText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const coordinateLine = location.has_coordinates
      ? `📍 X:${location.x} Y:${location.y} Z:${location.z}`
      : null;
    setPostText([
      `【冒険記録】${location.name}`,
      location.detail_memo || '新しい冒険記録を追加しました。',
      ...(coordinateLine ? [coordinateLine] : []),
      '',
      tags,
    ].join('\n'));
  }, [location, tags]);

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      playConfirmSound();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in some browser contexts.
    }
  };

  const handleOpenX = () => {
    playConfirmSound();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(postText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const primaryPhoto = location.photos[0]?.storage_path;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#05080E]/85 p-3 backdrop-blur-md sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="hud-bracket relative my-auto w-full max-w-lg overflow-hidden rounded-xl border border-[#1E293B] bg-[#0F172A] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] bg-[#0B1018] px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            <Share2 className="h-4 w-4 shrink-0 text-[#06B6D4]" />
            <h2 className="truncate text-sm font-bold tracking-wider text-[#F8FAFC] game-ui-font">
              X (Twitter) 共有テキスト
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="rounded p-1 text-[#94A3B8] transition-colors hover:bg-[#1E293B] hover:text-[#F8FAFC] cursor-pointer"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs text-[#94A3B8] game-ui-font">
              <span>投稿文の確認・編集</span>
              <span className="font-mono text-[10px] text-[#64748B]">{postText.length} 文字</span>
            </label>
            <textarea
              rows={6}
              value={postText}
              onChange={(event) => setPostText(event.target.value)}
              onFocus={playInputFocusSound}
              className="w-full rounded border border-[#334155] bg-[#0B1018] px-3 py-2 text-xs leading-relaxed text-[#F8FAFC] outline-none transition-colors focus:border-[#06B6D4] resize-none"
            />
          </div>

          {primaryPhoto && (
            <div className="flex items-center gap-3 rounded border border-[#334155]/60 bg-[#161F30] p-2.5">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-[#334155] bg-black">
                <LocationPhotoImage
                  storagePath={primaryPhoto}
                  alt={location.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-[11px] leading-snug text-[#94A3B8]">
                ※画像はXの投稿画面で手動添付してください。
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 border-t border-[#1E293B] pt-2">
            <button
              type="button"
              onClick={handleCopy}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-1.5 rounded border border-[#334155] bg-[#161F30] px-3.5 py-2 text-xs text-[#F8FAFC] transition-colors hover:bg-[#1E293B] game-ui-font cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span className="text-[#10B981]">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-[#06B6D4]" />
                  <span>本文をコピー</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenX}
              onMouseEnter={playHoverSound}
              className="flex items-center gap-1.5 rounded bg-[#06B6D4] px-4 py-2 text-xs font-bold tracking-wider text-[#0B1018] shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all hover:bg-[#0891B2] active:scale-95 game-ui-font cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>X で共有する</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
