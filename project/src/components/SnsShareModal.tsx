import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Share2, Sparkles, X } from 'lucide-react';
import type { LocationWithPhotos, WorldWithMembers } from '@/lib/types';
import { playConfirmSound, playHoverSound, playModalCloseSound, playSuccessSound } from '@/lib/sound';
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
    const coords = `X:${location.x} Y:${location.y} Z:${location.z}`;
    setPostText([
      `【冒険記録】${location.name}`,
      location.detail_memo || '新しい冒険記録を追加しました。',
      `📍 ${coords}`,
      '',
      tags,
    ].join('\n'));
  }, [location, tags]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      playSuccessSound();
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
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm font-sans"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          playModalCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#161a25] border-2 border-cyan-500 shadow-[0_0_35px_rgba(6,182,212,0.35)] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0d1522] border-b-2 border-cyan-500/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 bg-cyan-500/15 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold shrink-0">𝕏</div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">SNS共有 // X投稿</h2>
              <p className="text-[10px] text-slate-400 font-mono truncate">記録を投稿用に整形</p>
            </div>
          </div>
          <button type="button" onClick={() => { playModalCloseSound(); onClose(); }} onMouseEnter={playHoverSound} className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer" aria-label="閉じる"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[78vh] overflow-y-auto">
          <div className="flex items-center justify-between gap-2 bg-[#111827] border border-cyan-500/40 p-2.5">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold"><Sparkles className="w-4 h-4 text-cyan-400" /><span>投稿文・ハッシュタグ自動作成</span></div>
            <button type="button" onClick={() => { setPostText((current) => `${current.split('\n\n')[0]}\n\n${tags}`); playConfirmSound(); }} onMouseEnter={playHoverSound} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs cursor-pointer">整形</button>
          </div>

          <div className="space-y-1.5">
            <textarea value={postText} onChange={(event) => setPostText(event.target.value)} rows={7} className="w-full p-3.5 bg-[#0b0f19] border-2 border-slate-700 text-white text-xs sm:text-sm focus:border-cyan-400 outline-none leading-relaxed resize-none" placeholder="投稿内容を入力..." />
            <div className="flex justify-end text-[10px] font-mono text-slate-400">{postText.length} 文字</div>
          </div>

          {primaryPhoto && (
            <div className="border border-slate-700 bg-[#0f1422] p-2">
              <div className="text-[10px] font-mono text-slate-400 mb-1.5">添付候補 // 記録写真</div>
              <div className="h-32 bg-black overflow-hidden border border-slate-800"><LocationPhotoImage storagePath={primaryPhoto} alt={location.name} className="w-full h-full object-cover" /></div>
              <p className="text-[10px] text-slate-500 mt-1.5">画像はX側の投稿画面で添付できます。</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-slate-800">
            <button type="button" onClick={handleCopy} onMouseEnter={playHoverSound} className="flex-1 min-h-[44px] border-2 border-slate-700 bg-[#121724] text-slate-200 font-bold hover:border-cyan-400 hover:text-white flex items-center justify-center gap-2 text-xs cursor-pointer">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}<span>{copied ? 'コピー完了' : '投稿文をコピー'}</span></button>
            <button type="button" onClick={handleOpenX} onMouseEnter={playHoverSound} className="flex-1 min-h-[44px] bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white font-black flex items-center justify-center gap-2 text-xs border-b-2 border-[#0d7ac0] active:translate-y-0.5 cursor-pointer"><Share2 className="w-4 h-4" /><span>Xで共有</span><ExternalLink className="w-3.5 h-3.5 opacity-80" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
