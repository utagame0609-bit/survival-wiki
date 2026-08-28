import React, { useState } from 'react';
import { X, Volume2, Sparkles, Sliders, Music, Radio } from 'lucide-react';
import { soundEngine, playModalCloseSound, playHoverSound, playConfirmSound } from '../lib/soundEngine';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [config, setConfig] = useState(soundEngine.config);

  const handleMasterVolChange = (val: number) => {
    soundEngine.setMasterVolume(val);
    setConfig({ ...soundEngine.config });
  };

  const handleReverbChange = (val: number) => {
    soundEngine.setReverbWet(val);
    setConfig({ ...soundEngine.config });
  };

  const handleSeVolChange = (val: number) => {
    soundEngine.setSeVolume(val);
    setConfig({ ...soundEngine.config });
  };

  const handleToggleChannel = (ch: 'melody' | 'arpeggio' | 'bass' | 'drums') => {
    playHoverSound();
    soundEngine.toggleBgmChannel(ch);
    setConfig({ ...soundEngine.config });
  };

  const handleClose = () => {
    playModalCloseSound();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-md bg-[#0f1629] border-2 border-amber-500/80 shadow-[0_0_35px_rgba(0,0,0,0.85)] overflow-hidden font-sans rounded-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0a101d] border-b-2 border-amber-500/60">
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono font-bold text-emerald-400 tracking-wider">
              ~ SYSTEM CONFIGURATION // 設定
            </p>
            <h2 className="text-sm sm:text-base font-bold text-white">システム環境設定</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            onMouseEnter={playHoverSound}
            className="text-slate-400 hover:text-white p-1 cursor-pointer"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Controls */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* BGM Master */}
          <div className="p-3.5 bg-[#1a202e] border border-slate-700/80 rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Music className="w-4 h-4" />
                <span>BGM MASTER</span>
              </div>
              <span className="font-bold text-cyan-400">{Math.round(config.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.masterVolume}
              onChange={(e) => handleMasterVolChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <p className="text-[10px] text-slate-400 font-sans">
              セーブ画面・探索中に合成されるBGM全体の音量です。
            </p>
          </div>

          {/* Reverb */}
          <div className="p-3.5 bg-[#1a202e] border border-slate-700/80 rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-bold">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>残響リバーブ効果（REVERB）</span>
              </div>
              <span className="font-bold text-purple-400">{Math.round(config.reverbWet * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.reverbWet}
              onChange={(e) => handleReverbChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
            />
            <p className="text-[10px] text-slate-400 font-sans">
              地下ダンジョンや洞窟のような空間残響音を付与します。
            </p>
          </div>

          {/* SE Volume */}
          <div className="p-3.5 bg-[#1a202e] border border-slate-700/80 rounded-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>SE 効果音音量</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xs">
                  ACTIVE
                </span>
                <span className="font-bold text-amber-400">{Math.round(config.seVolume * 100)}%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={config.seVolume}
              onChange={(e) => handleSeVolChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* 4 Channels Toggles */}
          <div className="p-3.5 bg-[#1a202e] border border-slate-700/80 rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>WORLD SELECT BGM</span>
              </div>
              <span className="text-[10px] text-slate-400">4 CHANNELS</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleChannel('melody')}
                className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                  config.bgmChannels.melody
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px]">メロディ</div>
                  <div className="text-[9px] opacity-70">CH1 // PULSE LEAD</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    config.bgmChannels.melody ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => handleToggleChannel('arpeggio')}
                className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                  config.bgmChannels.arpeggio
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px]">アルペジオ</div>
                  <div className="text-[9px] opacity-70">CH2 // ARPEGGIO</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    config.bgmChannels.arpeggio ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => handleToggleChannel('bass')}
                className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                  config.bgmChannels.bass
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px]">ベース</div>
                  <div className="text-[9px] opacity-70">CH3 // TRIANGLE BASS</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    config.bgmChannels.bass ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => handleToggleChannel('drums')}
                className={`p-2 border flex items-center justify-between cursor-pointer transition-all ${
                  config.bgmChannels.drums
                    ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300'
                    : 'border-slate-800 bg-slate-900/60 text-slate-500'
                }`}
              >
                <div>
                  <div className="font-bold text-[11px]">ドラム</div>
                  <div className="text-[9px] opacity-70">CH4 // NOISE DRUMS</div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${
                    config.bgmChannels.drums ? 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]' : 'bg-slate-700'
                  }`}
                />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              メロディ・アルペジオ・ベース・ドラムを個別にON/OFFできます。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a101d] border-t-2 border-slate-700/80 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playConfirmSound();
              onClose();
            }}
            onMouseEnter={playHoverSound}
            className="px-5 py-2 bg-amber-500/90 hover:bg-amber-400 text-black font-bold text-xs border-b-2 border-amber-700 cursor-pointer rounded-xs shadow-sm transition-all"
          >
            完了 (OK)
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  // Redundant floating button removed per user request (header already contains the settings control)
  return null;
}
