import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Tv,
  Smartphone,
  Palette,
  Info,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="sfc-window w-full max-w-lg animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[var(--surface-1)] border-b-2 border-[var(--border-main)] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)] border border-black" />
            <h3 className="font-dot text-sm font-bold text-[var(--text-main)]">
              システム環境設定 (SYSTEM CONFIG / SOUND STUDIO)
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
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Section 1: Sound & Audio */}
          <div className="sfc-panel p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-groove)] pb-2">
              <div className="flex items-center gap-2 font-dot text-xs font-bold text-[var(--text-main)]">
                <Volume2 className="w-4 h-4 text-[var(--accent-green)]" />
                <span>サウンド・音響設定 (BGM / SE STUDIO)</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`px-2.5 py-1 text-xs font-dot rounded sfc-btn ${
                  settings.soundEnabled ? 'sfc-btn-b text-white' : 'sfc-btn-neutral text-[var(--text-muted)]'
                }`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* BGM Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-dot text-[var(--text-muted)]">
                <span>BGM ボリューム</span>
                <span>{settings.bgmVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.bgmVolume}
                disabled={!settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ bgmVolume: Number(e.target.value) })}
                className="w-full accent-[var(--accent-blue)]"
              />
            </div>

            {/* SE Volume Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-dot text-[var(--text-muted)]">
                <span>SE 効果音ボリューム</span>
                <span>{settings.seVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.seVolume}
                disabled={!settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ seVolume: Number(e.target.value) })}
                className="w-full accent-[var(--accent-yellow)]"
              />
            </div>
          </div>

          {/* Section 2: Visual & Theme */}
          <div className="sfc-panel p-4 space-y-3">
            <div className="flex items-center gap-2 font-dot text-xs font-bold text-[var(--text-main)] border-b border-[var(--border-groove)] pb-2">
              <Palette className="w-4 h-4 text-[var(--accent-yellow)]" />
              <span>外装テーマ切り替え (SKIN / THEME TOKENS)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* SFC 16-Bit Light (Target Theme) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'sfc' })}
                className={`p-3 rounded-lg border-2 text-left space-y-1 transition-all ${
                  settings.theme === 'sfc'
                    ? 'border-[var(--accent-blue)] bg-[var(--surface-1)] shadow ring-2 ring-[var(--accent-blue)]'
                    : 'border-[var(--border-main)] bg-[var(--surface-recessed)] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-dot text-xs font-bold text-[var(--text-main)]">
                    SFC 16-bit Light
                  </span>
                  {settings.theme === 'sfc' && (
                    <span className="w-2 h-2 rounded-full sfc-led-green" />
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  成型プラスチック＆ABXYカラーのライトグレー外装
                </p>
              </button>

              {/* FC Dark Theme (Comparison) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'fc_dark' })}
                className={`p-3 rounded-lg border-2 text-left space-y-1 transition-all ${
                  settings.theme === 'fc_dark'
                    ? 'border-[var(--accent-blue)] bg-[#222228] shadow ring-2 ring-[var(--accent-blue)] text-white'
                    : 'border-[var(--border-main)] bg-[var(--surface-recessed)] opacity-70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-dot text-xs font-bold text-[var(--text-main)]">
                    FC 8-bit Dark
                  </span>
                  {settings.theme === 'fc_dark' && (
                    <span className="w-2 h-2 rounded-full sfc-led-red" />
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight">
                  クラシックレトロ端末風ダーク外装
                </p>
              </button>
            </div>

            {/* CRT Micro-Scanlines Toggle */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-groove)]">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-xs font-dot text-[var(--text-main)]">
                  微小CRT走査線エフェクト
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ crtScanlines: !settings.crtScanlines })}
                className={`px-2.5 py-1 text-xs font-dot rounded sfc-btn ${
                  settings.crtScanlines ? 'sfc-btn-b text-white' : 'sfc-btn-neutral text-[var(--text-muted)]'
                }`}
              >
                {settings.crtScanlines ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Section 3: App Specifications & Non-destructive status */}
          <div className="sfc-panel p-4 space-y-2 text-[11px] text-[var(--text-muted)] leading-relaxed">
            <div className="flex items-center gap-1.5 font-dot text-xs text-[var(--text-main)] font-bold">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-green)]" />
              <span>Survival Wiki テーマエンジン仕様</span>
            </div>
            <p>
              ・CSS Token集約構造（<code>data-theme="sfc"</code>）により、既存データ構造やCRUD通信ロジックを非破壊で維持しながら外装のみを瞬時切り替え可能。
            </p>
            <p>
              ・本番配管マップ準拠: Auth / Navigation / Storage / AI Wiki / BGM再生の各契約に対応。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[var(--surface-1)] border-t-2 border-[var(--border-main)] px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="sfc-btn sfc-btn-convex sfc-btn-neutral px-5 py-1.5 text-xs font-dot font-bold"
          >
            完了 (DONE)
          </button>
        </div>
      </div>
    </div>
  );
};
