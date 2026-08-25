import React from 'react';
import { GeneratedTrack } from '../types';
import { RetroSoundFX } from '../audio/chiptuneEngine';
import { 
  Save, 
  Play, 
  Pause, 
  Trash2, 
  Download, 
  Clock, 
  HardDrive, 
  Sparkles,
  Music,
  CheckCircle,
  FileCode
} from 'lucide-react';

interface SaveSlotLibraryProps {
  tracks: GeneratedTrack[];
  activeTrack: GeneratedTrack | null;
  isPlaying: boolean;
  onSelectTrack: (track: GeneratedTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  onPlaySynthesizerPreset: (presetId: string) => void;
}

export const SaveSlotLibrary: React.FC<SaveSlotLibraryProps> = ({
  tracks,
  activeTrack,
  isPlaying,
  onSelectTrack,
  onDeleteTrack,
  onPlaySynthesizerPreset
}) => {
  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div id="save-slot-library" className="bg-[#1a0033]/50 border-2 border-[#ff00ff] shadow-[0_0_20px_rgba(255,0,255,0.2)] p-5 text-[#00f0ff]">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b-2 border-[#ff00ff]/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-[#0a001a] text-[#ff00ff] border-2 border-[#ff00ff] shadow-[0_0_8px_#ff00ff]">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm uppercase tracking-[0.15em] text-[#ff00ff] drop-shadow-[0_0_6px_#ff00ff] flex items-center gap-2">
              [ SELECT SAVE SLOT ]
              <span className="text-[10px] px-2 py-0.5 bg-[#0a001a] text-[#00f0ff] border border-[#00f0ff]/60">
                {tracks.length} / 15 MEMORY SLOTS
              </span>
            </h2>
            <p className="text-xs text-[#00f0ff]/70 font-mono">
              SAVED MEMORY BANK DATA // LYRIA NEURAL WAV & CHIPTUNE BGM
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-[#00f0ff] uppercase bg-[#0a001a] px-2.5 py-1 border border-[#00f0ff]/40">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
          <span>STATUS: SCROLL_UNLOCKED</span>
        </div>
      </div>

      {/* Save Slots List */}
      <div className="space-y-3">
        {tracks.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-[#00f0ff]/30 bg-[#0a001a]">
            <Save className="w-8 h-8 text-[#ff00ff]/60 mx-auto mb-2" />
            <p className="text-sm font-mono text-[#ff00ff]">NO SAVE DATA FOUND IN MEMORY CARD</p>
            <p className="text-xs text-[#00f0ff]/60 mt-1">Generate your first chiptune or save menu theme above.</p>
          </div>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackActive = activeTrack?.id === track.id;
            const slotNumber = String(index + 1).padStart(2, '0');

            return (
              <div
                key={track.id}
                id={`save-slot-${track.id}`}
                className={`p-4 border-2 transition-all flex flex-wrap items-center justify-between gap-4 ${
                  isThisTrackActive
                    ? 'bg-[#1a0033] border-[#ff00ff] shadow-[0_0_15px_rgba(255,0,255,0.3)]'
                    : 'bg-[#0a001a] border-[#00f0ff]/60 hover:border-[#ff00ff] hover:opacity-100 opacity-80'
                }`}
              >
                {/* Slot Number & Track Info */}
                <div className="flex items-center space-x-4 min-w-0 flex-1">
                  <span className={`text-2xl font-bold font-mono ${
                    isThisTrackActive ? 'text-[#ff00ff] drop-shadow-[0_0_8px_#ff00ff]' : 'text-[#00f0ff]/40'
                  }`}>
                    {slotNumber}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold font-mono text-white tracking-wide truncate">
                        {track.title}
                      </h4>
                      {isThisTrackActive && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[#ff00ff] text-[#050010] font-bold font-mono flex items-center gap-1">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#00f0ff]/80 font-mono line-clamp-1 mt-0.5">
                      {track.prompt}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-[10px] font-mono text-[#00f0ff]/60">
                      <span className="flex items-center gap-1 text-[#00f0ff]/80">
                        <Clock className="w-3 h-3 text-[#ff00ff]" />
                        {formatTimestamp(track.createdAt)}
                      </span>
                      <span>//</span>
                      <span className="text-[#ff00ff] font-bold">{track.tempo}</span>
                      <span>//</span>
                      <span className="px-1.5 py-0.5 bg-[#050010] border border-[#00f0ff]/40 text-[#00f0ff]">
                        {track.source === 'lyria-ai' ? 'LYRIA-3 NEURAL' : '2A03 SYNTH'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Status & Controls */}
                <div className="flex items-center space-x-3">
                  {isThisTrackActive && isPlaying && (
                    <div className="hidden sm:block text-right pr-2">
                      <p className="text-xs text-[#ff00ff] font-bold tracking-widest animate-pulse">PLAYING...</p>
                      <div className="w-20 h-1 bg-[#00f0ff] mt-1 shadow-[0_0_6px_#00f0ff]" />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      id={`btn-play-slot-${track.id}`}
                      onClick={() => {
                        RetroSoundFX.playMenuConfirm();
                        onSelectTrack(track);
                      }}
                      className={`flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono font-bold transition-all border-2 ${
                        isThisTrackActive && isPlaying
                          ? 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] shadow-[0_0_10px_#ff00ff]'
                          : 'bg-[#050010] text-[#00f0ff] border-[#00f0ff]/60 hover:border-[#ff00ff] hover:text-[#ff00ff]'
                      }`}
                    >
                      {isThisTrackActive && isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>[ PAUSE ]</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>[ LOAD ]</span>
                        </>
                      )}
                    </button>

                    {track.audioUrl && (
                      <button
                        id={`btn-download-slot-${track.id}`}
                        onClick={() => {
                          RetroSoundFX.playMenuCursor();
                          const a = document.createElement('a');
                          a.href = track.audioUrl;
                          a.download = `${track.title.toLowerCase().replace(/\s+/g, '_')}.wav`;
                          a.click();
                        }}
                        className="p-1.5 bg-[#050010] text-[#00f0ff] border-2 border-[#00f0ff]/60 hover:border-[#ff00ff] hover:text-[#ff00ff] transition-colors"
                        title="Download Track WAV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      id={`btn-delete-slot-${track.id}`}
                      onClick={() => {
                        RetroSoundFX.playMenuCancel();
                        onDeleteTrack(track.id);
                      }}
                      className="p-1.5 bg-[#050010] text-[#ff00ff]/60 border-2 border-[#ff00ff]/40 hover:border-[#ff00ff] hover:text-[#ff00ff] hover:bg-[#1a0033] transition-colors"
                      title="Erase Save Slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
