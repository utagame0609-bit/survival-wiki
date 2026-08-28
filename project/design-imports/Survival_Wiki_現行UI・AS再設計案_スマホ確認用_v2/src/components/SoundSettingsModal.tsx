import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Sparkles, Sliders, Music, Disc3, Check } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { storage } from '../lib/storage';
import { SoundConfig } from '../types';

interface SoundSettingsModalProps {
  onClose: () => void;
  onOpenSoundStudio?: () => void;
}

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  onClose,
  onOpenSoundStudio,
}) => {
  const [config, setConfig] = useState<SoundConfig>(storage.getSoundConfig());

  useEffect(() => {
    sound.setMasterVolume(config.masterVolume);
    sound.setBgmVolume(config.bgmVolume);
    sound.setSeVolume(config.seVolume);
    sound.setReverbWet(config.reverbWet);
  }, [config]);

  const updateConfig = (key: keyof SoundConfig, value: any) => {
    const next = { ...config, [key]: value };
    setConfig(next);
    storage.saveSoundConfig(next);
  };

  const handleTestSE = () => {
    sound.playConfirm();
  };

  const handleTestLevelUp = () => {
    sound.playSaveLog();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          sound.playCancel();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-[#0a0a0c] border-2 border-[#ff8c00] shadow-[8px_8px_0px_#000000] rounded-xl overflow-hidden flex flex-col font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#121214] border-b-2 border-[#333338]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#ff8c00]" />
            <h3 className="text-sm font-black text-white tracking-wide terminal-font">
              SYSTEM CONFIG // サウンド設定
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playCancel();
              onClose();
            }}
            className="p-1 text-[#888888] hover:text-white rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-sm text-[#dcdcdc] overflow-y-auto max-h-[75vh] bg-[#0e0e11]">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between terminal-font text-xs">
              <span className="flex items-center gap-1.5 text-[#ff8c00] font-bold">
                <Volume2 className="w-4 h-4" /> MASTER VOLUME
              </span>
              <span className="text-[#888888]">{Math.round(config.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.masterVolume}
              onChange={(e) => updateConfig('masterVolume', parseFloat(e.target.value))}
              className="w-full accent-[#ff8c00] bg-[#18181c] h-2 rounded cursor-pointer"
            />
          </div>

          {/* BGM Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between terminal-font text-xs">
              <span className="flex items-center gap-1.5 text-[#00ff41] font-bold">
                <Music className="w-4 h-4" /> BGM 音量
              </span>
              <span className="text-[#888888]">{Math.round(config.bgmVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.bgmVolume}
              onChange={(e) => updateConfig('bgmVolume', parseFloat(e.target.value))}
              className="w-full accent-[#00ff41] bg-[#18181c] h-2 rounded cursor-pointer"
            />
          </div>

          {/* SE Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between terminal-font text-xs">
              <span className="flex items-center gap-1.5 text-[#ffa500] font-bold">
                <Disc3 className="w-4 h-4" /> 効果音 (SE) 音量
              </span>
              <span className="text-[#888888]">{Math.round(config.seVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.seVolume}
              onChange={(e) => updateConfig('seVolume', parseFloat(e.target.value))}
              className="w-full accent-[#ffa500] bg-[#18181c] h-2 rounded cursor-pointer"
            />
          </div>

          {/* Reverb */}
          <div className="space-y-2">
            <div className="flex items-center justify-between terminal-font text-xs">
              <span className="flex items-center gap-1.5 text-[#ff8c00] font-bold">
                <Sparkles className="w-4 h-4" /> 空間残響 (REVERB)
              </span>
              <span className="text-[#888888]">{Math.round(config.reverbWet * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={config.reverbWet}
              onChange={(e) => updateConfig('reverbWet', parseFloat(e.target.value))}
              className="w-full accent-[#ff8c00] bg-[#18181c] h-2 rounded cursor-pointer"
            />
            <p className="text-[11px] text-[#888888]">
              洞窟や大聖堂のような残響感をWeb Audioプロシージャルリバーブで合成します。
            </p>
          </div>

          {/* Sound Test Buttons */}
          <div className="pt-2 border-t-2 border-[#202026]">
            <div className="text-xs terminal-font text-[#888888] mb-2">SE TEST // 効果音テスト</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleTestSE}
                className="px-3 py-2 bg-[#18181c] hover:bg-[#202026] text-xs terminal-font text-[#ff8c00] rounded-lg border-2 border-[#333338] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-[2px_2px_0px_#000000]"
              >
                ▶ 決定音 (Confirm)
              </button>
              <button
                type="button"
                onClick={handleTestLevelUp}
                className="px-3 py-2 bg-[#18181c] hover:bg-[#202026] text-xs terminal-font text-[#00ff41] rounded-lg border-2 border-[#333338] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition shadow-[2px_2px_0px_#000000]"
              >
                ★ 記録保存 (LevelUp)
              </button>
            </div>
          </div>

          {/* Sound Studio Link */}
          {onOpenSoundStudio && (
            <div className="pt-2 border-t-2 border-[#202026]">
              <button
                type="button"
                onClick={() => {
                  sound.playConfirm();
                  onOpenSoundStudio();
                  onClose();
                }}
                className="w-full py-2.5 bg-[#141417] hover:bg-[#18181c] text-[#ff8c00] border-2 border-[#ff8c00] rounded-lg text-xs terminal-font font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-[3px_3px_0px_#000000]"
              >
                <Sliders className="w-4 h-4" />
                サウンド開発スタジオを開く
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-[#121214] border-t-2 border-[#333338] flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-[#ff8c00] hover:bg-[#ffa500] text-black font-bold terminal-font text-xs rounded-lg active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#000000]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            設定完了 (OK)
          </button>
        </div>
      </div>
    </div>
  );
};
