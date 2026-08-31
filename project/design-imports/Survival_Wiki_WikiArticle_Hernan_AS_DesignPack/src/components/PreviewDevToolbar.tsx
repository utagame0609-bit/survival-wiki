/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ViewportMode,
  PhotoCountVariant,
  MetadataVariant,
  InfoboxPositionMode,
  MobileTocMode
} from '../types';
import {
  Monitor,
  Smartphone,
  Tablet,
  Image,
  Layers,
  Sparkles,
  X,
  FileText,
  Sliders,
  Check
} from 'lucide-react';

interface PreviewDevToolbarProps {
  viewportMode: ViewportMode;
  onSelectViewport: (mode: ViewportMode) => void;
  photoVariant: PhotoCountVariant;
  onSelectPhotoVariant: (variant: PhotoCountVariant) => void;
  metadataVariant: MetadataVariant;
  onSelectMetadataVariant: (variant: MetadataVariant) => void;
  infoboxMode: InfoboxPositionMode;
  onSelectInfoboxMode: (mode: InfoboxPositionMode) => void;
  mobileTocMode: MobileTocMode;
  onSelectMobileTocMode: (mode: MobileTocMode) => void;
  selectedArticleKey: string;
  onSelectArticleKey: (key: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewDevToolbar: React.FC<PreviewDevToolbarProps> = ({
  viewportMode,
  onSelectViewport,
  photoVariant,
  onSelectPhotoVariant,
  metadataVariant,
  onSelectMetadataVariant,
  infoboxMode,
  onSelectInfoboxMode,
  mobileTocMode,
  onSelectMobileTocMode,
  selectedArticleKey,
  onSelectArticleKey,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="preview-dev-toolbar"
      className="fixed top-12 right-2 sm:right-6 z-50 w-[94vw] sm:w-[380px] bg-zinc-900/95 border border-zinc-700 shadow-2xl rounded-xs p-3.5 sm:p-4 text-zinc-200 text-[12px] font-mono backdrop-blur-md max-h-[88vh] overflow-y-auto"
      role="dialog"
      aria-label="UI/UX 検証コントローラー"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-amber-400" />
          <span className="font-bold text-zinc-100 text-[13px]">
            AI Studio 検証コントローラー
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-xs hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 cursor-pointer"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3.5">
        {/* 1. Viewport Simulation */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Monitor className="h-3 w-3 text-blue-400" />
            <span>表示幅シミュレーター (Viewport)</span>
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'responsive', label: '100% 自由幅', icon: Monitor },
              { id: 'desktop-1440', label: '1440px (PC大)', icon: Monitor },
              { id: 'pc-1280', label: '1280px (標準)', icon: Monitor },
              { id: 'tablet-1024', label: '1024px (中幅)', icon: Tablet },
              { id: 'mobile-390', label: '390px (スマホ)', icon: Smartphone },
              { id: 'narrow-320', label: '320px (極小幅)', icon: Smartphone }
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectViewport(v.id as ViewportMode)}
                className={`py-1 px-1.5 rounded-xs text-[11px] text-center transition-colors cursor-pointer border ${
                  viewportMode === v.id
                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Photo Count Variant */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Image className="h-3 w-3 text-emerald-400" />
            <span>写真点数（図版0〜5枚の条件分岐）</span>
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: '5_photos', label: '5枚 (分散配置)' },
              { id: '3_photos', label: '3枚 (標準)' },
              { id: '1_photo', label: '1枚 (代表図版)' },
              { id: '0_photos', label: '0枚 (空枠なし)' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPhotoVariant(p.id as PhotoCountVariant)}
                className={`py-1 px-1 rounded-xs text-[10.5px] text-center transition-colors cursor-pointer border ${
                  photoVariant === p.id
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Metadata & Missing Data Variant */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Layers className="h-3 w-3 text-purple-400" />
            <span>欠損データ・可変長条件の検証</span>
          </label>
          <div className="grid grid-cols-2 gap-1 text-[10.5px]">
            {[
              { id: 'all_present', label: '全メタデータあり' },
              { id: 'no_coords', label: '座標なし (行ごと非表示)' },
              { id: 'explicit_zero_coords', label: '明示的 (0,0,0) 座標' },
              { id: 'no_companions', label: '同行者なし (非表示)' },
              { id: 'no_timestamp', label: '日時なし (非表示)' },
              { id: 'all_minimal', label: '全欠損 (本文のみ)' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMetadataVariant(m.id as MetadataVariant)}
                className={`py-1 px-1.5 rounded-xs text-left transition-colors cursor-pointer border truncate ${
                  metadataVariant === m.id
                    ? 'bg-purple-600 text-white border-purple-500 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Article Selection */}
        <div>
          <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText className="h-3 w-3 text-amber-400" />
            <span>エルナン編纂記事サンプル</span>
          </label>
          <div className="space-y-1">
            {[
              { id: 'article-1', label: '本命: 同一景観五度撮影（2,800字・学術大げさ解釈）' },
              { id: 'article-2', label: '第2: 極小仮設居住の逐次増築（2,500字）' },
              { id: 'article-long', label: '第3: 超長大タイトル＆超長大ロケーション名' }
            ].map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onSelectArticleKey(a.id)}
                className={`w-full text-left py-1.5 px-2 rounded-xs text-[11px] transition-colors cursor-pointer border flex items-center justify-between ${
                  selectedArticleKey === a.id
                    ? 'bg-amber-600/90 text-white border-amber-500 font-bold'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-750'
                }`}
              >
                <span className="truncate">{a.label}</span>
                {selectedArticleKey === a.id && <Check className="h-3.5 w-3.5 shrink-0 ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* 5. PC / Mobile Layout Modes */}
        <div className="pt-2 border-t border-zinc-800 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[10px] text-zinc-400 block mb-1">PC補助欄配置</span>
            <button
              type="button"
              onClick={() =>
                onSelectInfoboxMode(
                  infoboxMode === 'infobox_right' ? 'figures_inline' : 'infobox_right'
                )
              }
              className="w-full py-1 px-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xs text-zinc-200 cursor-pointer"
            >
              {infoboxMode === 'infobox_right' ? 'インフォボックス右' : '図版本文統合'}
            </button>
          </div>

          <div>
            <span className="text-[10px] text-zinc-400 block mb-1">スマホ目次形式</span>
            <button
              type="button"
              onClick={() =>
                onSelectMobileTocMode(
                  mobileTocMode === 'inline_accordion' ? 'quick_sheet' : 'inline_accordion'
                )
              }
              className="w-full py-1 px-1.5 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 rounded-xs text-zinc-200 cursor-pointer"
            >
              {mobileTocMode === 'inline_accordion' ? 'インライン開閉' : 'クイックシート'}
            </button>
          </div>
        </div>

        {/* Info Note */}
        <div className="p-2 bg-zinc-950/80 border border-zinc-800 rounded-xs text-[10.5px] text-zinc-400 leading-normal">
          💡 <span className="text-zinc-300">ASプレビュー専用です。</span>本番移植時は純粋なReact propsと親HUDコンポーネントのみが渡されます。
        </div>
      </div>
    </div>
  );
};
