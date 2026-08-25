import React, { useState, useEffect } from 'react';
import { playSynthNote, getFreq, RetroSoundFX } from '../audio/chiptuneEngine';
import { Piano, Radio, SlidersHorizontal, Volume2 } from 'lucide-react';

export const MiniSynthesizer: React.FC = () => {
  const [waveform, setWaveform] = useState<OscillatorType>('square');
  const [octave, setOctave] = useState<number>(4);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeys: { note: string; offset: number }[] = [
    { note: 'C#', offset: 1 },
    { note: 'D#', offset: 2 },
    { note: 'F#', offset: 4 },
    { note: 'G#', offset: 5 },
    { note: 'A#', offset: 6 },
  ];

  const handlePlayNote = (noteName: string) => {
    const fullNote = `${noteName}${octave}`;
    const freq = getFreq(fullNote);
    setActiveKey(fullNote);
    playSynthNote(freq, waveform, 0.45);
    setTimeout(() => setActiveKey(null), 250);
  };

  // Keyboard shortcut support
  useEffect(() => {
    const keyMap: Record<string, string> = {
      'a': 'C', 'w': 'C#', 's': 'D', 'e': 'D#', 'd': 'E',
      'f': 'F', 't': 'F#', 'g': 'G', 'y': 'G#', 'h': 'A',
      'u': 'A#', 'j': 'B', 'k': 'C'
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        handlePlayNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [octave, waveform]);

  return (
    <div id="mini-synthesizer-panel" className="bg-[#1a0033]/50 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)] p-5 text-[#00f0ff]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b-2 border-[#00f0ff]/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#0a001a] text-[#00f0ff] border-2 border-[#00f0ff] shadow-[0_0_8px_#00f0ff]">
            <Piano className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono tracking-[0.15em] uppercase text-[#00f0ff] drop-shadow-[0_0_6px_#00f0ff] flex items-center gap-2">
              [ 8-BIT PIANO ROLL & SOUND CHIP KEYBOARD ]
            </h2>
            <p className="text-xs text-[#00f0ff]/70 font-mono">
              Interactive monophonic synthesizer for drafting chiptune melodies.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Octave Controls */}
          <div className="flex items-center space-x-1 bg-[#0a001a] px-2 py-1 border border-[#00f0ff]/50 text-xs font-mono">
            <span className="text-[#00f0ff]/60 text-[10px]">OCTAVE:</span>
            {[3, 4, 5].map((oct) => (
              <button
                key={oct}
                onClick={() => {
                  RetroSoundFX.playMenuCursor();
                  setOctave(oct);
                }}
                className={`px-2 py-0.5 text-xs font-bold transition-colors ${
                  octave === oct
                    ? 'bg-[#ff00ff] text-[#050010] shadow-[0_0_6px_#ff00ff]'
                    : 'text-[#00f0ff] hover:text-[#ff00ff]'
                }`}
              >
                {oct}
              </button>
            ))}
          </div>

          {/* Waveform Selector */}
          <div className="flex items-center space-x-1 bg-[#0a001a] px-2 py-1 border border-[#00f0ff]/50 text-xs font-mono">
            <span className="text-[#00f0ff]/60 text-[10px]">CHIP WAVE:</span>
            {(['square', 'sawtooth', 'triangle', 'sine'] as OscillatorType[]).map((wave) => (
              <button
                key={wave}
                onClick={() => {
                  RetroSoundFX.playMenuCursor();
                  setWaveform(wave);
                }}
                className={`px-2 py-0.5 text-xs uppercase font-bold transition-colors ${
                  waveform === wave
                    ? 'bg-[#00f0ff] text-[#050010] shadow-[0_0_6px_#00f0ff]'
                    : 'text-[#00f0ff]/70 hover:text-[#00f0ff]'
                }`}
              >
                {wave === 'square' ? '2A03 Pulse' : wave === 'sawtooth' ? 'FM Saw' : wave === 'triangle' ? 'NES Tri' : 'Sine'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Piano Keyboard Keys */}
      <div className="relative flex justify-center py-2 select-none overflow-x-auto">
        <div className="relative flex bg-[#050010] p-3 border-2 border-[#00f0ff]/60 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
          {whiteKeys.map((note) => {
            const fullNote = `${note}${octave}`;
            const isNoteActive = activeKey === fullNote;
            return (
              <button
                key={note}
                id={`synth-key-${fullNote}`}
                onMouseDown={() => handlePlayNote(note)}
                className={`relative w-11 sm:w-12 h-36 mx-0.5 border-2 transition-all flex flex-col justify-end pb-2 items-center text-xs font-mono font-bold ${
                  isNoteActive
                    ? 'bg-[#ff00ff] border-[#ff00ff] text-[#050010] shadow-[0_0_15px_#ff00ff] scale-[0.98]'
                    : 'bg-white border-[#00f0ff]/40 text-[#050010] hover:bg-[#00f0ff]/20 active:bg-[#ff00ff]'
                }`}
              >
                <span className="font-extrabold">{note}</span>
                <span className="text-[9px] text-[#050010]/60 font-mono">{octave}</span>
              </button>
            );
          })}

          {/* Black Keys */}
          <div className="absolute top-3 left-3 flex pointer-events-none">
            {blackKeys.map(({ note, offset }) => {
              const fullNote = `${note}${octave}`;
              const isNoteActive = activeKey === fullNote;
              // Precise offset math for black keys
              const leftPixels = offset * 48 - (offset > 2 ? 30 : 26);

              return (
                <button
                  key={note}
                  id={`synth-key-${fullNote}`}
                  style={{ left: `${leftPixels}px` }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    handlePlayNote(note);
                  }}
                  className={`pointer-events-auto absolute w-7 sm:w-8 h-22 border-2 transition-all flex flex-col justify-end pb-1.5 items-center text-[10px] font-mono font-bold shadow-lg ${
                    isNoteActive
                      ? 'bg-[#00f0ff] border-[#00f0ff] text-[#050010] shadow-[0_0_12px_#00f0ff] scale-[0.96]'
                      : 'bg-[#0a001a] border-[#ff00ff]/60 text-[#ff00ff] hover:bg-[#1a0033]'
                  }`}
                >
                  <span className="text-[#ff00ff] font-bold">{note}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-center mt-3 text-[11px] font-mono text-[#00f0ff]/70">
        💡 KEYBOARD CONTROLS: KEYS <code className="text-[#ff00ff]">A S D F G H J</code> FOR NATURALS, <code className="text-[#ff00ff]">W E T Y U</code> FOR SHARPS.
      </div>
    </div>
  );
};
