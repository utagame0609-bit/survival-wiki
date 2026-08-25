import React, { useEffect, useRef, useState } from 'react';
import { GeneratedTrack } from '../types';
import { getAudioContext, RetroSoundFX } from '../audio/chiptuneEngine';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Repeat, 
  Gauge, 
  Music,
  Share2,
  Check
} from 'lucide-react';

interface AudioPlayerBarProps {
  currentTrack: GeneratedTrack | null;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onTrackEnd?: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentTrack,
  isPlaying,
  onPlayToggle,
  onTrackEnd,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);

  // Wire HTMLAudioElement into the shared Web Audio Analyser for visualizer
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (!sourceNodeRef.current) {
        const { ctx, master } = getAudioContext();
        const source = ctx.createMediaElementSource(audio);
        source.connect(master);
        sourceNodeRef.current = source;
      }
    } catch (e) {
      // Ignore if already connected
    }
  }, []);

  // Update track source when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack && currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      audio.load();
      audio.playbackRate = playbackRate;
      audio.loop = isLooping;

      if (isPlaying) {
        audio.play().catch(console.warn);
      }
    } else {
      audio.pause();
    }
  }, [currentTrack]);

  // Handle Play/Pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.warn('Playback prevented or interrupted:', e);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle volume & loop & speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.loop = isLooping;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, isLooping, playbackRate]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleDownload = () => {
    if (!currentTrack || !currentTrack.audioUrl) return;
    RetroSoundFX.playMenuConfirm();
    const link = document.createElement('a');
    link.href = currentTrack.audioUrl;
    link.download = `${currentTrack.title.toLowerCase().replace(/\s+/g, '_')}_8bit_chiptune.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    if (!currentTrack) return;
    RetroSoundFX.playItemGet();
    navigator.clipboard.writeText(currentTrack.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) {
    return (
      <div id="audio-player-bar-idle" className="bg-[#0a001a] border-2 border-[#00f0ff]/40 p-4 text-center text-[#00f0ff]/60 text-xs font-mono">
        <span className="text-[#ff00ff] font-bold">[ AUDIO ENGINE IDLE ]</span> — Generate a retro track above or select a save slot to stream.
      </div>
    );
  }

  return (
    <div id="audio-player-bar" className="bg-[#1a0033]/60 border-2 border-[#00f0ff] p-4 shadow-[0_0_20px_rgba(0,240,255,0.25)] text-[#00f0ff]">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={() => {
          if (!isLooping) {
            onTrackEnd?.();
          }
        }}
        crossOrigin="anonymous"
      />

      {/* Track Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-3 min-w-0">
          <div className={`p-2 border-2 ${isPlaying ? 'bg-[#0a001a] border-[#ff00ff] text-[#ff00ff] shadow-[0_0_10px_#ff00ff]' : 'bg-[#0a001a] border-[#00f0ff]/40 text-[#00f0ff]'}`}>
            <Music className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold font-mono tracking-wider text-white truncate max-w-md">
              {currentTrack.title}
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#00f0ff]/70">
              <span className="px-1.5 py-0.5 bg-[#0a001a] text-[#ff00ff] border border-[#ff00ff]/60 text-[10px] font-bold">
                {currentTrack.source === 'lyria-ai' ? 'LYRIA-3 NEURAL AI' : 'CHIPTUNE SYNTH'}
              </span>
              <span>//</span>
              <span className="text-[#00f0ff] truncate max-w-xs">{currentTrack.tempo}</span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-copy-prompt"
            onClick={handleCopyPrompt}
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#0a001a] hover:bg-[#1a0033] text-[#00f0ff] hover:text-[#ff00ff] text-xs font-mono font-bold transition-all border-2 border-[#00f0ff]/60 hover:border-[#ff00ff]"
            title="Copy prompt to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#ff00ff]" /> : <Share2 className="w-3.5 h-3.5 text-[#00f0ff]" />}
            <span>{copied ? '[ COPIED! ]' : '[ SHARE PROMPT ]'}</span>
          </button>

          <button
            id="btn-download-wav"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#ff00ff] hover:bg-[#00f0ff] text-[#050010] text-xs font-mono font-bold transition-all border-2 border-[#ff00ff] hover:border-[#00f0ff] shadow-[0_0_10px_#ff00ff]"
            title="Download high-quality WAV audio loop"
          >
            <Download className="w-3.5 h-3.5" />
            <span>[ EXPORT WAV ]</span>
          </button>
        </div>
      </div>

      {/* Waveform / Scrubber Bar */}
      <div className="space-y-1.5 mb-3">
        <input
          id="audio-progress-scrubber"
          type="range"
          min={0}
          max={duration || 30}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-[#050010] rounded-none appearance-none cursor-pointer accent-[#ff00ff]"
        />
        <div className="flex justify-between text-[10px] font-mono text-[#00f0ff]/70">
          <span>{formatTime(currentTime)}</span>
          <span className="text-[#ff00ff] font-bold">{isLooping ? '♾️ SEAMLESS LOOP ACTIVE' : 'SINGLE PLAY'}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls & Speed/Pitch */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t-2 border-[#00f0ff]/30">
        {/* Main Transport */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-main-play-pause"
            onClick={() => {
              RetroSoundFX.playMenuCursor();
              onPlayToggle();
            }}
            className="p-3 bg-[#ff00ff] hover:bg-[#00f0ff] text-[#050010] border-2 border-[#ff00ff] hover:border-[#00f0ff] shadow-[0_0_12px_#ff00ff] transition-transform active:scale-95 cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            id="btn-toggle-loop"
            onClick={() => {
              RetroSoundFX.playMenuCursor();
              setIsLooping(!isLooping);
            }}
            className={`p-2 border-2 text-xs font-mono font-bold flex items-center space-x-1 transition-colors ${
              isLooping
                ? 'bg-[#1a0033] text-[#00f0ff] border-[#00f0ff] shadow-[0_0_8px_#00f0ff]'
                : 'bg-[#0a001a] text-[#00f0ff]/50 border-[#00f0ff]/30'
            }`}
            title="Toggle Seamless Loop"
          >
            <Repeat className="w-4 h-4" />
            <span className="hidden sm:inline">LOOP</span>
          </button>

          <button
            id="btn-restart-track"
            onClick={() => {
              RetroSoundFX.playMenuCursor();
              if (audioRef.current) audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }}
            className="p-2 bg-[#0a001a] hover:bg-[#1a0033] text-[#00f0ff] hover:text-[#ff00ff] border-2 border-[#00f0ff]/50 hover:border-[#ff00ff] transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed / Pitch Bender (Retro Chip FX) */}
        <div className="flex items-center space-x-2 bg-[#0a001a] px-3 py-1.5 border border-[#00f0ff]/50 text-xs font-mono">
          <Gauge className="w-3.5 h-3.5 text-[#ff00ff]" />
          <span className="text-[#00f0ff]/80 text-[11px]">CHIP SPEED:</span>
          <div className="flex items-center space-x-1">
            {[0.75, 1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => {
                  RetroSoundFX.playMenuCursor();
                  setPlaybackRate(rate);
                }}
                className={`px-1.5 py-0.5 text-[10px] font-bold ${
                  playbackRate === rate
                    ? 'bg-[#00f0ff] text-[#050010] shadow-[0_0_6px_#00f0ff]'
                    : 'text-[#00f0ff]/60 hover:text-[#00f0ff]'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="text-[#00f0ff] hover:text-[#ff00ff] transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#ff00ff]" /> : <Volume2 className="w-4 h-4 text-[#00f0ff]" />}
          </button>
          <input
            id="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false);
              setVolume(parseFloat(e.target.value));
            }}
            className="w-20 h-1.5 bg-[#050010] appearance-none cursor-pointer accent-[#00f0ff]"
          />
        </div>
      </div>
    </div>
  );
};
