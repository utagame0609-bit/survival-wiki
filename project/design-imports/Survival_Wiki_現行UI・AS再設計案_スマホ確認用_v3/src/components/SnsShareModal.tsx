import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, ExternalLink, Check, Youtube, MapPin, Hash, Share2 } from 'lucide-react';
import { LocationWithPhotos, WorldWithMembers } from '../types';
import { generateSnsContent } from '../lib/geminiClient';
import { playConfirmSound, playModalCloseSound, playHoverSound, playAddSound, playSuccessSound } from '../lib/soundEngine';

interface SnsShareModalProps {
  world: WorldWithMembers;
  location: LocationWithPhotos;
  onClose: () => void;
}

export function SnsShareModal({ world, location, onClose }: SnsShareModalProps) {
  const [postText, setPostText] = useState('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Initialize post content
  useEffect(() => {
    const coordsStr = `(X:${location.x} Y:${location.y} Z:${location.z})`;
    const cleanWorldTag = `#${world.name.replace(/[\s-]/g, '')}`;
    const cleanLocTag = `#${location.name.replace(/[\s-]/g, '')}`;
    const tagsList = location.tags.length > 0 ? location.tags.join(' ') : `${cleanWorldTag} ${cleanLocTag} #サバイバル日記 #UTAPEDIA`;

    const initial = `【冒険記録】${location.name} ${coordsStr}\n${location.detail_memo || '新しい拠点を記録！'}\n\n${tagsList}${
      location.youtube_url ? `\n\n🎬 動画: ${location.youtube_url}` : ''
    }`;

    setPostText(initial);
  }, [world, location]);

  // Character counter
  const charCount = postText.length;
  const maxChars = 280;
  const isOverLimit = charCount > maxChars;

  const handleAiRegenerate = async () => {
    playHoverSound();
    setGenerating(true);
    try {
      const data = await generateSnsContent({
        worldName: world.name,
        locationName: location.name,
        memo: location.detail_memo,
        x: location.x,
        y: location.y,
        z: location.z,
      });

      let full = data.text;
      if (location.youtube_url && !full.includes(location.youtube_url)) {
        full += `\n\n🎬 ${location.youtube_url}`;
      }

      setPostText(full);
      playAddSound();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      playSuccessSound();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const handleOpenX = () => {
    playConfirmSound();
    const encoded = encodeURIComponent(postText);
    const xUrl = `https://twitter.com/intent/tweet?text=${encoded}`;
    window.open(xUrl, '_blank', 'noopener,noreferrer');
  };

  const primaryPhoto = location.photos[0]?.storage_path;

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
      <div className="w-full max-w-lg bg-[#161a25] border-2 border-cyan-500 shadow-[0_0_35px_rgba(6,182,212,0.4)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0d1522] border-b-2 border-cyan-500/60">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs">
              𝕏
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              SNS共有 // X (Twitter) ポスト作成
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

        {/* Content Box */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* AI Re-generate Bar */}
          <div className="flex items-center justify-between bg-[#111827] border border-cyan-500/40 p-2.5 rounded-xs">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI ポスト文・ハッシュタグ自動最適化</span>
            </div>
            <button
              type="button"
              onClick={handleAiRegenerate}
              disabled={generating}
              onMouseEnter={playHoverSound}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs font-mono disabled:opacity-50 flex items-center gap-1 cursor-pointer"
            >
              {generating ? '生成中...' : '再生成'}
            </button>
          </div>

          {/* Post Textarea (Twitter Composer feel) */}
          <div className="space-y-1.5">
            <div className="relative">
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={5}
                className="w-full p-3.5 bg-[#0b0f19] border-2 border-slate-700 text-white text-xs sm:text-sm focus:border-cyan-400 outline-none leading-relaxed resize-none font-sans"
                placeholder="いまどうしてる？"
              />
              <div
                className={`absolute bottom-2 right-3 font-mono text-xs font-bold ${
                  isOverLimit ? 'text-rose-400' : 'text-slate-400'
                }`}
              >
                {charCount} / {maxChars}
              </div>
            </div>
          </div>

          {/* Media Attachments Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Photo Card */}
            {primaryPhoto && (
              <div className="border border-slate-700 bg-[#0f1422] p-2 space-y-1 rounded-xs">
                <div className="text-[10px] font-mono text-slate-400">添付画像 (チェスト写真)</div>
                <div className="h-28 bg-black overflow-hidden border border-slate-800">
                  <img src={primaryPhoto} alt="Chest Media" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {/* YouTube Card */}
            {location.youtube_url && (
              <div className="border border-red-500/40 bg-red-950/20 p-2 space-y-1 rounded-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-red-400 font-bold">
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube リンク連携中</span>
                  </div>
                  <p className="text-xs text-white font-bold mt-1 line-clamp-2">
                    {location.youtube_title || location.name}
                  </p>
                </div>
                <span className="text-[9px] font-mono text-slate-400 truncate">
                  {location.youtube_url}
                </span>
              </div>
            )}
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            ※ XのAPI制限やログイン状況に依存せず、ブラウザまたはアプリのX投稿画面が直接起動します。画像は投稿画面側で簡単に添付できます。
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleCopy}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[44px] border-2 border-slate-700 bg-[#121724] text-slate-200 font-bold hover:border-cyan-400 hover:text-white flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'クリップボードにコピー完了！' : '投稿文をコピー'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenX}
              onMouseEnter={playHoverSound}
              className="flex-1 min-h-[44px] bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-black flex items-center justify-center gap-2 text-xs sm:text-sm border-b-3 border-[#0d7ac0] active:translate-y-0.5 cursor-pointer shadow-[0_2px_12px_rgba(29,155,240,0.3)] transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>X に投稿する (Post to X)</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
