import React, { useState } from 'react';
import { X, Play, Square, Volume2, Sparkles, Music, Activity } from 'lucide-react';
import { SOUND_LIST } from '../../audio/soundList';
import {
  soundEngine,
  playCloseSound,
  playHoverSound,
  playConfirmSound,
  playCancelSound,
  playSaveSound,
  playDeleteSound,
  playNewRecordSound,
  playMilestoneSound,
  playCardOpenSound,
} from '../../audio/soundEngine';

interface SoundStudioModalProps {
  onClose: () => void;
}

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({ onClose }) => {
  const [activeBgm, setActiveBgm] = useState<string | null>(null);

  const handlePlaySE = (seKey: string) => {
    switch (seKey) {
      case 'confirm':
        playConfirmSound();
        break;
      case 'cancel':
        playCancelSound();
        break;
      case 'save':
        playSaveSound();
        break;
      case 'delete':
        playDeleteSound();
        break;
      case 'new_record':
        playNewRecordSound();
        break;
      case 'milestone':
        playMilestoneSound();
        break;
      case 'card_open':
        playCardOpenSound();
        break;
      default:
        playConfirmSound();
    }
  };

  const handleToggleBGM = (trackId: string) => {
    if (activeBgm === trackId) {
      soundEngine.stopBgm();
      setActiveBgm(null);
    } else {
      soundEngine.playBgm(trackId);
      setActiveBgm(trackId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          playCloseSound();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl bg-[#141414] border border-[#D4AF37]/50 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 bg-[#0A0A0A] border-b border-[#262626]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 rounded-sm">
              SOUND LAB
            </span>
            <h2 className="text-sm sm:text-base font-bold text-[#E5E5E5] font-mono flex items-center gap-2">
              <span>16-BIT SOUND ENGINE // 音響実験室</span>
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

        {/* Studio Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 max-h-[80vh] text-xs">
          {/* Realtime Audio Signal Visualizer Box */}
          <div className="p-3 bg-[#0A0A0A] border border-[#262626] rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#D4AF37] animate-pulse" />
              <span className="font-mono text-[#D4AF37] font-bold">
                PROCEDURAL SYNTHESIZER // 4-OPERATOR RESIDUAL ENGINE
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 font-bold">
              AUDIO_CTX: ACTIVE
            </span>
          </div>

          {/* Sound Effects List */}
          <div>
            <div className="flex items-center gap-1.5 font-mono font-bold text-[#A3A3A3] mb-2">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>効果音テスト (SOUND EFFECTS // 8-BIT PROCEDURAL)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOUND_LIST.filter((s) => s.category === 'se').map((se) => (
                <button
                  key={se.id}
                  type="button"
                  onClick={() => handlePlaySE(se.id)}
                  onMouseEnter={playHoverSound}
                  className="p-2.5 bg-[#0A0A0A] hover:bg-[#1A1A1A] border border-[#262626] hover:border-[#D4AF37]/60 text-left rounded-sm transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-mono font-bold text-[#E5E5E5] group-hover:text-[#D4AF37] text-xs">
                      {se.name}
                    </div>
                    <div className="text-[10px] text-[#737373] font-mono line-clamp-1 mt-0.5">
                      {se.description}
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-[#D4AF37] mt-2 flex items-center justify-between">
                    <span>{se.pitchHz}</span>
                    <Play className="w-3 h-3 fill-[#D4AF37] stroke-none" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* BGM Candidate Tracks */}
          <div className="border-t border-[#262626] pt-4">
            <div className="flex items-center gap-1.5 font-mono font-bold text-[#A3A3A3] mb-2">
              <Music className="w-4 h-4 text-[#D4AF37]" />
              <span>BGM トラック試聴 (PROCEDURAL LOOP MUSIC)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SOUND_LIST.filter((s) => s.category === 'bgm').map((bgm) => {
                const isPlaying = activeBgm === bgm.id;
                return (
                  <button
                    key={bgm.id}
                    type="button"
                    onClick={() => handleToggleBGM(bgm.id)}
                    className={`p-3 text-left rounded-sm border transition-all cursor-pointer flex items-center justify-between ${
                      isPlaying
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                        : 'border-[#262626] bg-[#0A0A0A] hover:border-[#333333] text-[#A3A3A3]'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-bold text-xs">
                        {bgm.name}
                      </div>
                      <div className="text-[10px] text-[#737373] font-mono mt-0.5">
                        {bgm.description}
                      </div>
                    </div>
                    <div className="p-1.5 rounded-sm bg-black/60 border border-current">
                      {isPlaying ? (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </div>
                  </button>
                );
              })}
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
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
