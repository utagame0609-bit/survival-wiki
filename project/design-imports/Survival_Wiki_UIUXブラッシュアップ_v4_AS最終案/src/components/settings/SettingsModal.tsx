import React from 'react';
import { AudioSettings } from '../../types';
import { X, Volume2, VolumeX, Sliders, Music, Radio, Sparkles, Smartphone, Download, LogOut, Check } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface SettingsModalProps {
  settings: AudioSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<AudioSettings>) => void;
  onOpenSoundStudio: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdateSettings,
  onOpenSoundStudio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#05080E]/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden my-auto hud-bracket">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-game font-bold text-[#F8FAFC] tracking-wider">
              SYSTEM CONFIG // 設定
            </h3>
          </div>

          <button
            id="btn-close-settings"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="p-1 rounded text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-4 sm:p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: AUDIO & SOUND SYSTEM */}
          <div className="space-y-3.5 bg-[#0B1018]/80 p-3.5 rounded-lg border border-[#1E293B]">
            <div className="flex items-center justify-between">
              <div className="text-xs font-game text-[#F59E0B] font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>16-bit 音響システム設定</span>
              </div>

              {/* Master Sound On/Off */}
              <button
                type="button"
                onClick={() => {
                  const newMuted = !settings.isMuted;
                  onUpdateSettings({ isMuted: newMuted });
                  if (newMuted) {
                    soundEngine.mute();
                  } else {
                    soundEngine.unmute();
                    soundEngine.playSe('menu_select');
                  }
                }}
                className={`px-2.5 py-1 rounded text-xs font-mono border transition-all flex items-center gap-1 ${
                  settings.isMuted
                    ? 'bg-[#1E293B] text-[#64748B] border-[#334155]'
                    : 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/50'
                }`}
              >
                {settings.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                <span>{settings.isMuted ? 'MUTE (消音)' : 'SOUND ON'}</span>
              </button>
            </div>

            {/* Master Volume Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] mb-1">
                <span>MASTER VOLUME (全体音量)</span>
                <span className="text-[#F59E0B]">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ masterVolume: val });
                  soundEngine.setMasterVolume(val);
                }}
                className="w-full h-1.5 bg-[#161F30] rounded-lg appearance-none cursor-pointer accent-[#F59E0B]"
              />
            </div>

            {/* Reverb Ambient Depth Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#94A3B8] mb-1">
                <span>REVERB DEPTH (空間残響)</span>
                <span className="text-[#06B6D4]">{Math.round(settings.reverbLevel * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.reverbLevel}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onUpdateSettings({ reverbLevel: val });
                  soundEngine.setReverbLevel(val);
                }}
                className="w-full h-1.5 bg-[#161F30] rounded-lg appearance-none cursor-pointer accent-[#06B6D4]"
              />
            </div>

            {/* 4-Channel BGM Tracker Mixer */}
            <div className="pt-2 border-t border-[#1E293B]">
              <div className="text-[11px] font-mono text-[#64748B] mb-2 flex items-center justify-between">
                <span>4-CH BGM TRACKER CHANNELS</span>
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.toggleBgm();
                  }}
                  className="text-[#06B6D4] hover:underline flex items-center gap-1"
                >
                  <Music className="w-3 h-3" />
                  <span>BGM 再生 / 停止</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-center">
                {(['ch1', 'ch2', 'ch3', 'ch4'] as const).map((ch, idx) => {
                  const active = settings.bgmChannels[ch];
                  const labels = ['CH1 Lead', 'CH2 Chd', 'CH3 Bass', 'CH4 Noise'];
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => {
                        const newChannels = { ...settings.bgmChannels, [ch]: !active };
                        onUpdateSettings({ bgmChannels: newChannels });
                        soundEngine.setBgmChannel(ch, !active);
                      }}
                      className={`p-1.5 rounded border text-[10px] font-mono transition-all ${
                        active
                          ? 'bg-[#0E2030] text-[#06B6D4] border-[#06B6D4]/60 font-bold'
                          : 'bg-[#161F30] text-[#64748B] border-[#334155]'
                      }`}
                    >
                      {labels[idx]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Launch Sound Studio */}
            <div className="pt-1">
              <button
                id="btn-launch-sound-studio"
                type="button"
                onClick={() => {
                  soundEngine.playSe('menu_select');
                  onOpenSoundStudio();
                }}
                className="w-full py-2 px-3 rounded bg-[#161F30] hover:bg-[#1E293B] border border-[#F59E0B]/40 hover:border-[#F59E0B] text-[#F59E0B] text-xs font-game flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>SOUND STUDIO // 28種効果音テスト室を開く</span>
              </button>
            </div>
          </div>

          {/* SECTION 2: APP INFO & PWA INSTALLATION */}
          <div className="space-y-3 bg-[#0B1018]/60 p-3.5 rounded-lg border border-[#1E293B]">
            <div className="text-xs font-game text-[#94A3B8] flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>スマートフォン・PWA対応</span>
            </div>

            <div className="text-xs text-[#64748B] font-jp leading-relaxed">
              ブラウザの「ホーム画面に追加」を行うことで、フルスクリーン起動・オフライン動作対応のネイティブアプリ感覚でご利用いただけます。
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0B1018] border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span>UTAPEDIA SURVIVAL WIKI v3.16</span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-[#F59E0B] hover:bg-[#D97706] text-[#0B1018] font-game font-bold text-xs transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};
