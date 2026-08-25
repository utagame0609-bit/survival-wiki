import React, { useState, useEffect } from 'react';
import { GeneratedTrack } from './types';
import { RetroVisualizer } from './components/RetroVisualizer';
import { LyriaGenerator } from './components/LyriaGenerator';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { SaveSlotLibrary } from './components/SaveSlotLibrary';
import { SoundEffectsPad } from './components/SoundEffectsPad';
import { MiniSynthesizer } from './components/MiniSynthesizer';
import { globalSequencer, RetroSoundFX } from './audio/chiptuneEngine';
import { 
  Music, 
  Disc3, 
  Gamepad2, 
  Piano, 
  Sparkles, 
  Terminal, 
  Radio, 
  HelpCircle,
  HardDrive,
  Flame
} from 'lucide-react';

const INITIAL_TRACKS: GeneratedTrack[] = [
  {
    id: 'track-user-requested-01',
    title: 'SAVE MENU 01: NEON SYNTHWAVE & CHIPTUNE',
    prompt: '8bit chiptune, retro game save menu theme, neon synthwave, mysterious atmospheric, catchy electronic melody, seamless loop, 16bit video game BGM, medium tempo',
    model: 'lyria-3-clip-preview',
    audioUrl: '', // Ready for live generation or synthesizer
    mimeType: 'audio/wav',
    createdAt: Date.now() - 1000 * 60 * 15,
    tags: ['8-bit', 'Save Menu', 'Neon Synthwave', 'Atmospheric', 'Loop'],
    tempo: 'Medium 112 BPM',
    source: 'lyria-ai'
  },
  {
    id: 'track-safe-room-02',
    title: 'MEMORY CARD: TRANQUIL SAVE SANCTUARY',
    prompt: 'tranquil 8-bit chiptune, retro game save room theme, gentle soothing square wave melody, warm triangle bass, tape delay, safe sanctuary ambiance, seamless loop, medium tempo 108 BPM',
    model: 'lyria-3-clip-preview',
    audioUrl: '',
    mimeType: 'audio/wav',
    createdAt: Date.now() - 1000 * 60 * 45,
    tags: ['Save Room', '8-bit', 'Tranquil', 'NES'],
    tempo: 'Medium 108 BPM',
    source: 'lyria-ai'
  },
  {
    id: 'track-cyberpunk-03',
    title: '16-BIT CYBERPUNK OVERWORLD BGM',
    prompt: '16-bit video game BGM, neon synthwave, catchy electronic melody, mysterious atmospheric pads, Yamaha YM2612 FM synthesis, analog synthesizer bass, medium tempo, seamless loop',
    model: 'lyria-3-pro-preview',
    audioUrl: '',
    mimeType: 'audio/wav',
    createdAt: Date.now() - 1000 * 60 * 120,
    tags: ['16-bit', 'FM Synth', 'Synthwave', 'Overworld'],
    tempo: 'Medium 118 BPM',
    source: 'lyria-ai'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'fx_sequencer' | 'keyboard'>('generator');
  const [tracks, setTracks] = useState<GeneratedTrack[]>(() => {
    const saved = localStorage.getItem('chiptune_studio_tracks');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TRACKS;
      }
    }
    return INITIAL_TRACKS;
  });

  const [activeTrack, setActiveTrack] = useState<GeneratedTrack | null>(tracks[0] || null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isSequencerPlaying, setIsSequencerPlaying] = useState<boolean>(false);
  const [activeSequencerPresetId, setActiveSequencerPresetId] = useState<string>('save-menu-theme');
  const [sequencerTitle, setSequencerTitle] = useState<string>('');

  // Persist tracks
  useEffect(() => {
    try {
      const serializable = tracks.map(({ audioBlob, ...rest }) => rest);
      localStorage.setItem('chiptune_studio_tracks', JSON.stringify(serializable));
    } catch (e) {
      console.warn('Storage limit reached or failed');
    }
  }, [tracks]);

  // Handle newly generated Lyria track
  const handleTrackGenerated = (newTrack: GeneratedTrack) => {
    // If sequencer is playing, stop it so new audio can play
    if (isSequencerPlaying) {
      globalSequencer.stop();
      setIsSequencerPlaying(false);
    }
    setTracks((prev) => [newTrack, ...prev]);
    setActiveTrack(newTrack);
    setIsPlayingAudio(true);
  };

  const handleSelectTrack = (track: GeneratedTrack) => {
    if (isSequencerPlaying) {
      globalSequencer.stop();
      setIsSequencerPlaying(false);
    }

    if (activeTrack?.id === track.id) {
      setIsPlayingAudio(!isPlayingAudio);
    } else {
      setActiveTrack(track);
      setIsPlayingAudio(true);
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    if (activeTrack?.id === trackId) {
      setIsPlayingAudio(false);
      setActiveTrack(null);
    }
  };

  const handleSequencerStateChange = (playing: boolean, title: string) => {
    setIsSequencerPlaying(playing);
    setSequencerTitle(title);
    if (playing) {
      setIsPlayingAudio(false);
    }
  };

  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeString(d.toTimeString().split(' ')[0]);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isAnySoundActive = isPlayingAudio || isSequencerPlaying;
  const currentVisualizerTitle = isSequencerPlaying
    ? `SYNTHESIZER: ${sequencerTitle || '2A03 8-BIT LIVE SEQUENCER'}`
    : activeTrack?.title || 'IDLE // SELECT A TRACK OR GENERATE WITH LYRIA';

  return (
    <div className="min-h-screen immersive-bg text-[#00f0ff] font-mono flex flex-col relative selection:bg-[#ff00ff] selection:text-[#050010] border-[6px] sm:border-[10px] md:border-[12px] border-[#1a0033] shadow-[inset_0_0_90px_rgba(0,240,255,0.18)]">
      {/* Top Header */}
      <header className="border-b-2 border-[#ff00ff] bg-[#050010]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-[0_4px_20px_rgba(255,0,255,0.15)]">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-[#1a0033] border-2 border-[#ff00ff] p-0.5 shadow-[0_0_12px_rgba(255,0,255,0.4)] flex items-center justify-center">
            <span className="text-[#ff00ff] font-bold text-sm tracking-tighter">8B</span>
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-[0.18em] text-[#ff00ff] drop-shadow-[0_0_10px_#ff00ff] flex items-center gap-2">
              NEON_CHIP V.08
              <span className="text-[10px] tracking-normal uppercase px-2 py-0.5 bg-[#1a0033] text-[#00f0ff] border border-[#00f0ff]/60">
                LYRIA-3 + 2A03 SYNTH
              </span>
            </h1>
            <p className="text-[11px] text-[#00f0ff] mt-0.5 opacity-80 flex items-center gap-2">
              <span>SYSTEM STATUS: SYNCED</span>
              <span>//</span>
              <span className="text-[#ff00ff]">ATMOSPHERE: ACTIVE</span>
            </p>
          </div>
        </div>

        {/* Center/Right Nav & Digital Clock */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#0a001a] p-1 border-2 border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]">
            <button
              id="tab-generator"
              onClick={() => {
                RetroSoundFX.playMenuCursor();
                setActiveTab('generator');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all ${
                activeTab === 'generator'
                  ? 'bg-[#ff00ff] text-[#050010] shadow-[0_0_12px_rgba(255,0,255,0.5)]'
                  : 'text-[#00f0ff] hover:text-[#ff00ff] hover:bg-[#1a0033]/60'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>[ F1 ] GENERATOR</span>
            </button>

            <button
              id="tab-fx-sequencer"
              onClick={() => {
                RetroSoundFX.playMenuCursor();
                setActiveTab('fx_sequencer');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all ${
                activeTab === 'fx_sequencer'
                  ? 'bg-[#00f0ff] text-[#050010] shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                  : 'text-[#00f0ff] hover:text-[#ff00ff] hover:bg-[#1a0033]/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>[ F2 ] SOUND FX</span>
            </button>

            <button
              id="tab-keyboard"
              onClick={() => {
                RetroSoundFX.playMenuCursor();
                setActiveTab('keyboard');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-mono uppercase font-bold transition-all ${
                activeTab === 'keyboard'
                  ? 'bg-[#ff00ff] text-[#050010] shadow-[0_0_12px_rgba(255,0,255,0.5)]'
                  : 'text-[#00f0ff] hover:text-[#ff00ff] hover:bg-[#1a0033]/60'
              }`}
            >
              <Piano className="w-3.5 h-3.5" />
              <span>[ F3 ] CHIP KEYS</span>
            </button>
          </div>

          {/* Clock & Memory Display */}
          <div className="hidden lg:block text-right border-l-2 border-[#00f0ff]/30 pl-4">
            <p className="text-xl font-bold tracking-widest text-[#00f0ff] drop-shadow-[0_0_6px_#00f0ff]">
              {timeString || '12:00:00'}
            </p>
            <p className="text-[10px] tracking-[0.2em] text-[#ff00ff] opacity-90">MEMORY_BANK_04</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 z-10">
        {/* Retro CRT Spectrum Visualizer Header */}
        <RetroVisualizer
          isPlaying={isAnySoundActive}
          activeTrackTitle={currentVisualizerTitle}
          bpm={activeTrack?.tempo?.split(' ')[1] || '112'}
          sourceType={isSequencerPlaying ? 'chiptune-synth' : 'lyria-ai'}
        />

        {/* Dynamic View by Selected Tab */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            {/* Lyria Music Generation Workspace */}
            <LyriaGenerator onTrackGenerated={handleTrackGenerated} />

            {/* Save Slot Library */}
            <SaveSlotLibrary
              tracks={tracks}
              activeTrack={activeTrack}
              isPlaying={isPlayingAudio}
              onSelectTrack={handleSelectTrack}
              onDeleteTrack={handleDeleteTrack}
              onPlaySynthesizerPreset={(presetId) => {
                globalSequencer.play(presetId);
                setIsSequencerPlaying(true);
                setIsPlayingAudio(false);
              }}
            />
          </div>
        )}

        {activeTab === 'fx_sequencer' && (
          <div className="space-y-6">
            <SoundEffectsPad
              onSequencerStateChange={handleSequencerStateChange}
              isSequencerPlaying={isSequencerPlaying}
              activePresetId={activeSequencerPresetId}
            />

            {/* Quick Link back to Save Directory */}
            <SaveSlotLibrary
              tracks={tracks}
              activeTrack={activeTrack}
              isPlaying={isPlayingAudio}
              onSelectTrack={handleSelectTrack}
              onDeleteTrack={handleDeleteTrack}
              onPlaySynthesizerPreset={(presetId) => {
                globalSequencer.play(presetId);
                setIsSequencerPlaying(true);
                setIsPlayingAudio(false);
              }}
            />
          </div>
        )}

        {activeTab === 'keyboard' && (
          <div className="space-y-6">
            <MiniSynthesizer />
            <SoundEffectsPad
              onSequencerStateChange={handleSequencerStateChange}
              isSequencerPlaying={isSequencerPlaying}
              activePresetId={activeSequencerPresetId}
            />
          </div>
        )}
      </main>

      {/* Sticky Player Bar */}
      <div className="sticky bottom-0 z-30 bg-[#050010]/95 border-t-2 border-[#00f0ff]/50 backdrop-blur-lg p-3 shadow-[0_-4px_20px_rgba(0,240,255,0.15)]">
        <div className="max-w-7xl mx-auto">
          <AudioPlayerBar
            currentTrack={activeTrack}
            isPlaying={isPlayingAudio}
            onPlayToggle={() => setIsPlayingAudio(!isPlayingAudio)}
            onTrackEnd={() => setIsPlayingAudio(false)}
          />
        </div>
      </div>

      {/* Cyberpunk Telemetry Footer */}
      <footer className="bg-[#050010] border-t border-[#1a0033] px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#00f0ff]/70 z-10">
        <div className="flex gap-4 sm:gap-6 uppercase font-bold text-[11px]">
          <span 
            onClick={() => setActiveTab('generator')} 
            className="cursor-pointer text-[#ff00ff] hover:underline underline-offset-4"
          >
            [ F1 ] GENERATOR
          </span>
          <span 
            onClick={() => setActiveTab('fx_sequencer')} 
            className="cursor-pointer text-[#00f0ff] hover:text-[#ff00ff]"
          >
            [ F2 ] SOUND FX & LOOPS
          </span>
          <span 
            onClick={() => setActiveTab('keyboard')} 
            className="cursor-pointer text-[#00f0ff] hover:text-[#ff00ff]"
          >
            [ F3 ] SOUND CHIP PIANO
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] tracking-widest mt-1 sm:mt-0">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff00ff] animate-pulse shadow-[0_0_8px_#ff00ff]" />
          <span>MASTER_OUTPUT: {isAnySoundActive ? 'ACTIVE_TRANSMISSION' : 'NOMINAL_IDLE'}</span>
        </div>
      </footer>
    </div>
  );
}
