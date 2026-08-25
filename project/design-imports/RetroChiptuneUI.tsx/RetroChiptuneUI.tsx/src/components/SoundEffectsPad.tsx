import React, { useState } from 'react';
import { RetroSoundFX, globalSequencer, BUILT_IN_CHIPTUNE_PRESETS } from '../audio/chiptuneEngine';
import { 
  Bell, 
  MousePointer, 
  Check, 
  X, 
  Trophy, 
  Sparkles, 
  Play, 
  Square, 
  Music2,
  Gamepad2,
  Layers
} from 'lucide-react';

interface SoundEffectsPadProps {
  onSequencerStateChange: (isPlaying: boolean, title: string) => void;
  isSequencerPlaying: boolean;
  activePresetId: string;
}

export const SoundEffectsPad: React.FC<SoundEffectsPadProps> = ({
  onSequencerStateChange,
  isSequencerPlaying,
  activePresetId
}) => {
  const [activeFX, setActiveFX] = useState<string | null>(null);

  const triggerFX = (name: string, fn: () => void) => {
    setActiveFX(name);
    fn();
    setTimeout(() => setActiveFX(null), 300);
  };

  const handleTogglePreset = (presetId: string, name: string) => {
    if (isSequencerPlaying && activePresetId === presetId) {
      globalSequencer.stop();
      onSequencerStateChange(false, name);
    } else {
      globalSequencer.play(presetId);
      onSequencerStateChange(true, name);
    }
  };

  return (
    <div id="sound-effects-panel" className="bg-[#1a0033]/50 border-2 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.2)] p-5 text-[#00f0ff]">
      {/* Title */}
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b-2 border-[#ff00ff]/40">
        <div className="p-2 bg-[#0a001a] text-[#ff00ff] border-2 border-[#ff00ff] shadow-[0_0_8px_#ff00ff]">
          <Gamepad2 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold font-mono tracking-[0.15em] uppercase text-[#ff00ff] drop-shadow-[0_0_6px_#ff00ff] flex items-center gap-2">
            [ 2A03 RETRO SOUND FX & LIVE SEQUENCER ]
          </h2>
          <p className="text-xs text-[#00f0ff]/70 font-mono">
            Trigger real-time synthesized 8-bit game menu sound effects and multi-channel chiptune loops.
          </p>
        </div>
      </div>

      {/* Built-in Live Sequencer Loops */}
      <div className="mb-5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#ff00ff] mb-2.5 flex items-center gap-1.5">
          <Music2 className="w-3.5 h-3.5 text-[#00f0ff]" />
          REAL-TIME 8-BIT / 16-BIT CHIPTUNE SEQUENCER PRESETS
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BUILT_IN_CHIPTUNE_PRESETS.map((preset) => {
            const isPlayingThis = isSequencerPlaying && activePresetId === preset.id;
            return (
              <div
                key={preset.id}
                className={`p-3.5 border-2 transition-all ${
                  isPlayingThis
                    ? 'bg-[#1a0033] border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.4)] text-white'
                    : 'bg-[#0a001a] border-[#00f0ff]/40 hover:border-[#00f0ff] text-[#00f0ff]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`text-xs font-bold font-mono truncate ${isPlayingThis ? 'text-[#ff00ff]' : 'text-[#00f0ff]'}`}>
                    {preset.name}
                  </h4>
                  <span className="text-[10px] font-mono text-[#00f0ff]/60">
                    {preset.bpm} BPM
                  </span>
                </div>
                <p className="text-[10px] text-[#00f0ff]/70 line-clamp-1 mb-3 font-mono">
                  {preset.mood}
                </p>

                <button
                  id={`btn-sequencer-${preset.id}`}
                  onClick={() => handleTogglePreset(preset.id, preset.name)}
                  className={`w-full py-2 px-3 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-2 ${
                    isPlayingThis
                      ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_10px_#ff00ff]'
                      : 'bg-[#050010] text-[#00f0ff] border-[#00f0ff]/60 hover:border-[#ff00ff] hover:text-[#ff00ff]'
                  }`}
                >
                  {isPlayingThis ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>[ STOP SEQUENCER ]</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                      <span>[ LIVE SYNTHESIZE ]</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retro Game Sound FX Board */}
      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#ff00ff] mb-2.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#00f0ff]" />
          INTERACTIVE 8-BIT MENU SOUND FX SOUNDBOARD
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Save Chime */}
          <button
            id="fx-save-chime"
            onClick={() => triggerFX('save', RetroSoundFX.playSaveChime)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === 'save'
                ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_12px_#ff00ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <Bell className="w-4 h-4 text-[#ff00ff]" />
            <span className="text-[11px]">[ SAVE CHIME ]</span>
          </button>

          {/* Cursor Beep */}
          <button
            id="fx-menu-cursor"
            onClick={() => triggerFX('cursor', RetroSoundFX.playMenuCursor)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === 'cursor'
                ? 'bg-[#00f0ff] text-[#050010] border-[#00f0ff] shadow-[0_0_12px_#00f0ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <MousePointer className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-[11px]">[ CURSOR BLIP ]</span>
          </button>

          {/* Menu Confirm */}
          <button
            id="fx-menu-confirm"
            onClick={() => triggerFX('confirm', RetroSoundFX.playMenuConfirm)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === 'confirm'
                ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_12px_#ff00ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <Check className="w-4 h-4 text-[#ff00ff]" />
            <span className="text-[11px]">[ CONFIRM ]</span>
          </button>

          {/* Menu Cancel */}
          <button
            id="fx-menu-cancel"
            onClick={() => triggerFX('cancel', RetroSoundFX.playMenuCancel)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === 'cancel'
                ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_12px_#ff00ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <X className="w-4 h-4 text-[#ff00ff]" />
            <span className="text-[11px]">[ CANCEL ]</span>
          </button>

          {/* Item Get Fanfare */}
          <button
            id="fx-item-get"
            onClick={() => triggerFX('item', RetroSoundFX.playItemGet)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === 'item'
                ? 'bg-[#00f0ff] text-[#050010] border-[#00f0ff] shadow-[0_0_12px_#00f0ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <Trophy className="w-4 h-4 text-[#00f0ff]" />
            <span className="text-[11px]">[ ITEM GET ]</span>
          </button>

          {/* 1-Up Chime */}
          <button
            id="fx-1up-chime"
            onClick={() => triggerFX('1up', RetroSoundFX.play1Up)}
            className={`p-3 border-2 font-mono text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
              activeFX === '1up'
                ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_12px_#ff00ff] scale-95'
                : 'bg-[#0a001a] border-[#00f0ff]/50 hover:border-[#ff00ff] text-[#00f0ff] hover:text-[#ff00ff]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#ff00ff]" />
            <span className="text-[11px]">[ 1-UP JINGLE ]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
