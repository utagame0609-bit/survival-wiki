import React, { useState, useEffect } from 'react';
import { bgmSequencer } from '../audio/bgmSequencer';
import { exportBgmToWav } from '../audio/offlineRenderer';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Music,
  Disc3,
  Sparkles,
  Loader2,
  Check,
  Repeat
} from 'lucide-react';

export const BgmPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [totalSteps] = useState(192); // 12 bars * 16 steps = 192 (30.00s)
  const [channels, setChannels] = useState({
    lead: true,
    harmony: true,
    bass: true,
    drums: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalDurationSec = 30.0; // 12 bars at BPM 96

  useEffect(() => {
    bgmSequencer.setOnStep((step, _total, timeSec) => {
      setCurrentStep(step);
      setCurrentTimeSec(timeSec);
    });

    bgmSequencer.setOnStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      bgmSequencer.stop();
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      bgmSequencer.pause();
    } else {
      bgmSequencer.play();
    }
  };

  const handleReset = () => {
    bgmSequencer.stop();
    setCurrentStep(0);
    setCurrentTimeSec(0);
  };

  const toggleChannel = (key: keyof typeof channels) => {
    const next = { ...channels, [key]: !channels[key] };
    setChannels(next);
    bgmSequencer.channels = next;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = Number(e.target.value);
    bgmSequencer.seek(step);
    setCurrentStep(step);
    setCurrentTimeSec((step / totalSteps) * totalDurationSec);
  };

  const handleExportWav = async () => {
    try {
      setIsExporting(true);
      setExportProgress(10);
      await exportBgmToWav((p) => setExportProgress(p));
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('BGM WAV export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const currentBar = Math.floor(currentStep / 16) + 1;
  const currentBeatInBar = Math.floor((currentStep % 16) / 4) + 1;

  return (
    <div id="bgm-player-card" className="rounded-2xl border border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl border transition-all ${
            isPlaying
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}>
            <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3.5s' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                セーブ / ワールド選択画面BGM
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                <Repeat className="w-3 h-3 text-cyan-400" /> 30秒シームレスループ
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              BPM: 96 | 16-bit Pulse Lead, Triangle Bass, Chiptune Arp & Noise Drums
            </p>
          </div>
        </div>

        {/* WAV Download button */}
        <button
          id="bgm-wav-download-btn"
          onClick={handleExportWav}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-200 hover:text-white text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>レンダリング中 ({exportProgress}%)...</span>
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>ダウンロード完了！</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>30秒BGM (WAV) を保存</span>
            </>
          )}
        </button>
      </div>

      {/* Musical Timeline & Bar Progress */}
      <div className="my-6 space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">現在時間:</span>
            <span className="text-cyan-300 font-bold text-sm bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              {formatTime(currentTimeSec)} / 00:30.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-500">小節:</span>
              <span className="text-white font-bold">{currentBar}</span>
              <span className="text-slate-500">/ 12</span>
              <span className="text-slate-500 ml-2">拍:</span>
              <span className="text-cyan-400 font-bold">{currentBeatInBar}</span>
              <span className="text-slate-500">/ 4</span>
            </div>
          </div>
        </div>

        {/* Step Scrubber Bar */}
        <div className="relative">
          <input
            id="bgm-timeline-scrubber"
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStep}
            onChange={handleSeek}
            className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-slate-800"
          />
          {/* Bar divider markers */}
          <div className="flex justify-between px-1 pointer-events-none mt-1">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className={`text-[9px] font-mono ${
                  currentBar === i + 1 ? 'text-cyan-400 font-bold' : 'text-slate-600'
                }`}
              >
                M{i + 1}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Playback Bar & Channel Toggles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10 pt-2">
        {/* Playback Transport controls */}
        <div className="lg:col-span-4 flex items-center gap-2.5">
          <button
            id="bgm-play-toggle-btn"
            onClick={togglePlay}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-red-500/25 border border-red-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 border border-cyan-300'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>一時停止 (Pause)</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>BGM ループ再生 (Play)</span>
              </>
            )}
          </button>

          <button
            id="bgm-reset-btn"
            onClick={handleReset}
            title="曲の先頭に戻る"
            className="p-3 rounded-xl border border-slate-800 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Channel Mixer Matrix (Lead, Harmony, Bass, Drums) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Channel 1: Lead */}
          <button
            onClick={() => toggleChannel('lead')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              channels.lead
                ? 'bg-cyan-950/50 border-cyan-500/60 text-cyan-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold">CH1: メロディ</span>
              {channels.lead ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">16bit 矩形波 + ビブラート</p>
          </button>

          {/* Channel 2: Harmony */}
          <button
            onClick={() => toggleChannel('harmony')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              channels.harmony
                ? 'bg-indigo-950/50 border-indigo-500/60 text-indigo-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold">CH2: アルペジオ</span>
              {channels.harmony ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">煌めく16分音符コード</p>
          </button>

          {/* Channel 3: Bass */}
          <button
            onClick={() => toggleChannel('bass')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              channels.bass
                ? 'bg-amber-950/50 border-amber-500/60 text-amber-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold">CH3: ベース</span>
              {channels.bass ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">温かな16bit 三角波</p>
          </button>

          {/* Channel 4: Drums */}
          <button
            onClick={() => toggleChannel('drums')}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              channels.drums
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-sm'
                : 'bg-slate-950/40 border-slate-800/80 text-slate-600 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-mono font-bold">CH4: ドラム</span>
              {channels.drums ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            </div>
            <p className="text-[10px] font-mono text-slate-400 truncate">キック・スネア・ハット</p>
          </button>
        </div>
      </div>
    </div>
  );
};
