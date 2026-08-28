import React, { useState } from 'react';
import { X, Volume2, Music, Radio, RotateCcw, Sparkles, Sliders, Shield, VolumeX } from 'lucide-react';
import { SoundConfig } from '../../types';
import { StorageService } from '../../lib/storage';
import {
  playCloseSound,
  playConfirmSound,
  playHoverSound,
  soundEngine,
} from '../../audio/soundEngine';

interface SettingsModalProps {
  onClose: () => void;
  onOpenSoundStudio: () => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  onOpenSoundStudio,
  onResetData,
}) => {
  const [config, setConfig] = useState<SoundConfig>(soundEngine.getConfig());
  const [confirmReset, setConfirmReset] = useState(false);

  const handleUpdateVolume = (field: keyof SoundConfig, value: number | boolean) => {
    const next = { ...config, [field]: value };
    setConfig(next);
    soundEngine.setConfig(next);
    StorageService.saveSoundConfig(next);
  };

  const handleToggleChannel = (channel: keyof SoundConfig['channels']) => {
    playConfirmSound();
    const nextChannels = { ...config.channels, [channel]: !config.channels[channel] };
    const next = { ...config, channels: nextChannels };
    setConfig(next);
    soundEngine.setConfig(next);
    StorageService.saveSoundConfig(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-sm font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-lg bg-[#141414] border border-[#D4AF37]/50 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              SYSTEM
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono">
              環境設定 // SOUND & STORAGE
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="p-1 text-[#737373] hover:text-[#E5E5E5] cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[80vh] text-xs">
          {/* Master Volume */}
          <div className="bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-mono font-bold text-[#E5E5E5] flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                <span>マスター音量 (MASTER VOLUME)</span>
              </label>
              <span className="font-mono text-[#D4AF37] font-bold">
                {Math.round(config.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.masterVolume}
              onChange={(e) => handleUpdateVolume('masterVolume', parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* BGM & SE Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#A3A3A3] flex items-center gap-1">
                  <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>BGM 音量</span>
                </span>
                <span className="font-mono text-[#D4AF37] font-bold">
                  {Math.round(config.bgmVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.bgmVolume}
                onChange={(e) => handleUpdateVolume('bgmVolume', parseFloat(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>

            <div className="bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#A3A3A3] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>効果音 (SE) 音量</span>
                </span>
                <span className="font-mono text-[#D4AF37] font-bold">
                  {Math.round(config.seVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.seVolume}
                onChange={(e) => handleUpdateVolume('seVolume', parseFloat(e.target.value))}
                className="w-full accent-[#D4AF37] cursor-pointer"
              />
            </div>
          </div>

          {/* 16-Bit Residual Reverb */}
          <div className="bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#A3A3A3] flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>残響リバーブ深度 (RESIDUAL REVERB)</span>
              </span>
              <span className="font-mono text-[#D4AF37] font-bold">
                {Math.round(config.reverbWet * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={config.reverbWet}
              onChange={(e) => handleUpdateVolume('reverbWet', parseFloat(e.target.value))}
              className="w-full accent-[#D4AF37] cursor-pointer"
            />
          </div>

          {/* 4-Channel BGM Mixer */}
          <div className="bg-[#0A0A0A] p-3 border border-[#262626] rounded-sm space-y-2">
            <div className="font-mono font-bold text-[#A3A3A3] mb-1 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>4-CHANNEL BGM MIXER</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'melody', label: 'CH1: 主旋律' },
                { id: 'arpeggio', label: 'CH2: 分散和音' },
                { id: 'bass', label: 'CH3: ベース' },
                { id: 'drums', label: 'CH4: リズム' },
              ].map((ch) => {
                const isActive = config.channels[ch.id as keyof typeof config.channels];
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => handleToggleChannel(ch.id as keyof typeof config.channels)}
                    className={`py-1.5 px-2 rounded-sm border text-[11px] font-mono transition-colors cursor-pointer text-center ${
                      isActive
                        ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                        : 'border-[#262626] bg-[#141414] text-[#525252] line-through'
                    }`}
                  >
                    {ch.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Studio Test Lab */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                playConfirmSound();
                onOpenSoundStudio();
              }}
              onMouseEnter={playHoverSound}
              className="w-full py-2.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 border border-[#D4AF37]/40 text-[#E5E5E5] font-mono font-bold rounded-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <Radio className="w-4 h-4 text-[#D4AF37]" />
              <span>▶ 16-BIT SOUND STUDIO (音響テスト室を開く)</span>
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="border-t border-[#262626] pt-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono font-bold text-[#A3A3A3]">初期サンプルデータへ復元</div>
                <div className="text-[10px] text-[#737373]">マインクラフト第1期と関西探訪ログの初期状態に戻します</div>
              </div>

              {confirmReset ? (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-red-800 text-white font-mono font-bold text-[11px] rounded-sm cursor-pointer"
                  >
                    実行
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="px-2 py-1 bg-[#262626] text-[#A3A3A3] font-mono text-[11px] rounded-sm cursor-pointer"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="px-2.5 py-1 bg-[#141414] hover:bg-red-950/60 hover:text-red-300 border border-[#262626] text-[#737373] font-mono text-[11px] rounded-sm transition-colors cursor-pointer"
                >
                  初期化
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 bg-[#0A0A0A] border-t border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={() => {
              playCloseSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="px-5 py-2 bg-[#141414] hover:bg-[#1F1F1F] text-[#E5E5E5] border border-[#262626] font-mono text-xs font-bold rounded-sm transition-colors cursor-pointer"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
