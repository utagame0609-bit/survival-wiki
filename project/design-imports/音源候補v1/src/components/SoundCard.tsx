import React, { useState } from 'react';
import { SoundEffectDef } from '../types';
import { soundEngine } from '../audio/soundEngine';
import { exportSoundToWav } from '../audio/offlineRenderer';
import { Play, Square, Download, Code2, Sparkles, Volume2, Loader2, Check } from 'lucide-react';

interface SoundCardProps {
  sound: SoundEffectDef;
  onOpenCode: (sound: SoundEffectDef) => void;
}

export const SoundCard: React.FC<SoundCardProps> = ({ sound, onOpenCode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handlePlay = () => {
    switch (sound.id) {
      case 'cursor_move':
        soundEngine.playCursorMove();
        break;
      case 'confirm':
        soundEngine.playConfirm();
        break;
      case 'cancel':
        soundEngine.playCancel();
        break;
      case 'warning':
        soundEngine.playWarning();
        break;
      case 'tab_switch':
        soundEngine.playTabSwitch();
        break;
      case 'modal_open_close':
        soundEngine.playModalOpenClose();
        break;
      case 'dialogue_char':
        soundEngine.playDialogueCharacter();
        break;
      case 'new_record':
        soundEngine.playNewRecord();
        break;
      case 'chest_open':
        soundEngine.playChestOpen();
        break;
      case 'achievement':
        soundEngine.playAchievement();
        break;
      case 'wiki_generating_noise': {
        const active = soundEngine.toggleWikiGeneratingNoise();
        setIsPlaying(active);
        return;
      }
      case 'wiki_complete':
        soundEngine.playWikiComplete();
        break;
    }

    setIsPlaying(true);
    setTimeout(() => {
      if (sound.id !== 'wiki_generating_noise') {
        setIsPlaying(false);
      }
    }, sound.id === 'achievement' ? 700 : sound.id === 'wiki_complete' ? 1200 : 250);
  };

  const handleExportWav = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsExporting(true);
      await exportSoundToWav(sound.id, `${sound.id}.wav`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error('WAV export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getCategoryColor = () => {
    switch (sound.category) {
      case 'system':
        return 'border-cyan-500/30 text-cyan-400 bg-cyan-950/30';
      case 'screen':
        return 'border-indigo-500/30 text-indigo-400 bg-indigo-950/30';
      case 'action':
        return 'border-amber-500/30 text-amber-400 bg-amber-950/30';
      case 'wiki':
        return 'border-emerald-500/30 text-emerald-400 bg-emerald-950/30';
      default:
        return 'border-slate-700 text-slate-300 bg-slate-800/40';
    }
  };

  const getPlayBtnStyle = () => {
    if (isPlaying) {
      return 'bg-gradient-to-r from-red-500 to-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.6)] text-white scale-95 border-red-400';
    }
    switch (sound.category) {
      case 'system':
        return 'bg-slate-900 border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-950/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]';
      case 'screen':
        return 'bg-slate-900 border-indigo-500/50 hover:border-indigo-400 text-indigo-300 hover:bg-indigo-950/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]';
      case 'action':
        return 'bg-slate-900 border-amber-500/50 hover:border-amber-400 text-amber-300 hover:bg-amber-950/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]';
      case 'wiki':
        return 'bg-slate-900 border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:bg-emerald-950/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]';
      default:
        return 'bg-slate-900 border-slate-700 text-slate-200';
    }
  };

  return (
    <div
      id={`sound-card-${sound.id}`}
      className={`group relative rounded-xl border bg-slate-900/90 p-4 transition-all duration-200 hover:bg-slate-900 hover:border-slate-700 shadow-md ${
        isPlaying ? 'border-cyan-400/80 shadow-[0_0_16px_rgba(6,182,212,0.2)]' : 'border-slate-800'
      }`}
    >
      {/* Top row: Name & Category badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-100 text-base tracking-tight group-hover:text-white">
              {sound.nameJa}
            </h4>
            {sound.isLooping && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Loop ON/OFF
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">{sound.name}</p>
        </div>

        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getCategoryColor()}`}>
          {sound.category.toUpperCase()}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed mb-3 min-h-[32px]">
        {sound.description}
      </p>

      {/* Tone details tag */}
      <div className="rounded-md bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 mb-3.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400/90 truncate">
          <Sparkles className="w-3 h-3 shrink-0 text-cyan-400" />
          <span className="truncate">{sound.toneInfo}</span>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        {/* Play / Loop Trigger Button */}
        <button
          id={`play-btn-${sound.id}`}
          onClick={handlePlay}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg border font-medium text-xs tracking-wide transition-all active:scale-95 ${getPlayBtnStyle()}`}
        >
          {sound.isLooping ? (
            isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>停止 (Stop Loop)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>ループ再生 (Loop)</span>
              </>
            )
          ) : (
            <>
              {isPlaying ? (
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>試聴 (Test Play)</span>
            </>
          )}
        </button>

        {/* WAV Download button */}
        <button
          id={`wav-btn-${sound.id}`}
          onClick={handleExportWav}
          disabled={isExporting}
          title="16bit 44.1kHz WAV形式でダウンロード"
          className="flex items-center justify-center p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : downloaded ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Download className="w-4 h-4" />
          )}
        </button>

        {/* Code inspect button */}
        <button
          id={`code-btn-${sound.id}`}
          onClick={() => onOpenCode(sound)}
          title="Web Audio API コードを見る"
          className="flex items-center justify-center p-2 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-colors"
        >
          <Code2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
