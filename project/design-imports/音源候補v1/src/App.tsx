import React, { useState } from 'react';
import { SOUND_EFFECTS } from './audio/soundList';
import { SoundCategory, SoundEffectDef } from './types';
import { soundEngine } from './audio/soundEngine';
import { Header } from './components/Header';
import { Visualizer } from './components/Visualizer';
import { SoundCard } from './components/SoundCard';
import { DialogueTester } from './components/DialogueTester';
import { BgmPlayer } from './components/BgmPlayer';
import { CodeExportModal } from './components/CodeExportModal';
import { Sparkles, Terminal, ShieldCheck, Gamepad2, Info } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<'all' | SoundCategory | 'bgm'>('all');
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [reverbWet, setReverbWet] = useState(0.35);
  const [selectedSoundForCode, setSelectedSoundForCode] = useState<SoundEffectDef | null>(null);

  const handleVolumeChange = (val: number) => {
    setMasterVolume(val);
    soundEngine.setMasterVolume(val);
  };

  const handleReverbChange = (val: number) => {
    setReverbWet(val);
    soundEngine.setReverbWet(val);
  };

  const filteredSounds = SOUND_EFFECTS.filter((sound) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'bgm') return false;
    return sound.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        masterVolume={masterVolume}
        onVolumeChange={handleVolumeChange}
        reverbWet={reverbWet}
        onReverbChange={handleReverbChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Concept Banner */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  16-BIT RETRO NOSTALGIA
                </span>
                <span className="text-slate-600 text-xs font-mono">×</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  SWITCH RESIDUAL REVERB
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                Web Audio API 動的シンセサイズ音響エンジン
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                外部音声ファイル（MP3/WAV）を一切使わず、オシレーター（矩形波・三角波・ホワイトノイズ）とプロシージャルリバーブ／ディレイ残響フィルターをブラウザ上で完全合成。すべてのSE・BGMを即座に試聴・WAV書き出し・ソースコード取得できます。
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero File Dependency</span>
              </div>
            </div>
          </div>
        </section>

        {/* Real-time Oscilloscope & Frequency Spectrum Visualizer */}
        <section>
          <Visualizer />
        </section>

        {/* Section 1: Background Music (BGM Deck) */}
        {(activeCategory === 'all' || activeCategory === 'bgm') && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  背景音楽 (BGM) - セーブ/ワールド選択画面
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                約30秒シームレスループ (12 Bars / BPM 96)
              </span>
            </div>
            <BgmPlayer />
          </section>
        )}

        {/* Section 2: Sound Effects (SE Grid) */}
        {activeCategory !== 'bgm' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  効果音 (SE) 一覧 ({filteredSounds.length}種)
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                全12種（システム・画面切替・アクション・生成解析）
              </span>
            </div>

            {/* SE Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSounds.map((sound) => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  onOpenCode={(s) => setSelectedSoundForCode(s)}
                />
              ))}
            </div>

            {/* Interactive RPG Dialogue Typing Tester */}
            {(activeCategory === 'all' || activeCategory === 'screen') && (
              <div className="mt-8">
                <DialogueTester />
              </div>
            )}
          </section>
        )}

        {/* Technical Architecture Specs Card */}
        <section className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5 text-xs text-slate-400 space-y-3 font-mono">
          <div className="flex items-center gap-2 text-slate-200 font-bold font-sans">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Web Audio API 実装仕様と特徴</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-[11px] leading-relaxed">
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
              <div className="text-cyan-300 font-bold font-sans flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5" /> 16bit レトロオシレーター
              </div>
              <p>
                Square（矩形波）50%/25%パルス、Triangle（三角波）ベースライン、White/Periodic Noiseによるパーカッション合成。
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
              <div className="text-rose-300 font-bold font-sans flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Switch風 空間残響系
              </div>
              <p>
                ConvolverNodeによる1.8秒のプロシージャルインパルスリバーブ＋Stereo Delay（フィードバック35%）で現代的な軽さと空気感を付与。
              </p>
            </div>
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 space-y-1">
              <div className="text-emerald-300 font-bold font-sans flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> 100% オフラインWAV出力
              </div>
              <p>
                OfflineAudioContextを用いてブラウザ単体で44.1kHz / 16bit PCM WAVファイルを直接レンダリング＆ダウンロード可能。
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Code Export Modal */}
      <CodeExportModal
        sound={selectedSoundForCode}
        onClose={() => setSelectedSoundForCode(null)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        16bit Retro × Nintendo Switch Style Sound Engine | Powered by Web Audio API
      </footer>
    </div>
  );
}
