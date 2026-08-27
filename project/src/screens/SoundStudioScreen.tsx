import { useEffect, useState } from 'react';
import { Volume2, Play, Waves, Radio, ArrowLeft } from 'lucide-react';
import { Header } from '@/components/Navigation';
import { SOUND_CANDIDATES, type SoundCandidate } from '@/lib/soundCandidates';
import { isAudioPlaying, playSoundCandidatePreview, stopActiveAudio, subscribeSoundState } from '@/lib/soundCandidatePreviewEngine';
import { getStoredReverbAmount, setStoredReverbAmount, subscribeToReverbAmount } from '@/lib/soundReverb';
import { isWorldBgmPlaying, playWorldBgm, stopWorldBgm } from '@/lib/bgm';
import { playCancelSound, playConfirmSound, playCursorMoveSound, playNewRecordSound } from '@/lib/sound';

type BgmCandidate = {
  id: 'bgm_world_select' | 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
  name: string;
  nameJa: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
};

const BGM_CANDIDATES: BgmCandidate[] = [
  {
    id: 'bgm_world_select',
    name: 'WORLD SELECT / SAVE',
    nameJa: 'セーブ／ワールド選択画面BGM',
    description: 'セーブやワールド選択画面に使用している、16-bitレトロゲーム風のシームレスループBGM。',
    toneInfo: 'BPM 96 / 30秒ループ / Pulse Lead + Triangle Bass + Chiptune Arp + Noise Drums',
    keyCharacteristic: '現在のワールド選択画面で使用しているBGMを、そのまま試聴できます。',
  },
  {
    id: 'npc_bgm_wikipedia',
    name: 'WUTAPEDIA',
    nameJa: 'ウタペディア',
    description: '百科事典・民俗学者をイメージした、クラシカル × レトロサイバーの知的なBGM。',
    toneInfo: 'A Minor / 112 BPM / Square Arpeggio + Triangle Bass',
    keyCharacteristic: '整然としたアルペジオに半音階の不穏さを混ぜた、洗練された学術系サウンド。',
  },
  {
    id: 'npc_bgm_scp',
    name: 'SCP FOUNDATION',
    nameJa: 'SCP FOUNDATION',
    description: '機密報告・特異点研究員をイメージした、ミリタリー × サイバー × インダストリアルBGM。',
    toneInfo: 'A / 96 BPM / Saw Drone + Industrial Pulse',
    keyCharacteristic: '55Hzの重低音ドローンと金属的パルス、ランダムなノイズで無機質な緊張感を演出。',
  },
  {
    id: 'npc_bgm_ancient',
    name: 'LOST CHRONICLE',
    nameJa: 'LOST CHRONICLE',
    description: '絶望古文書・老吟遊詩人をイメージした、レトロファンタジー × 16bitアンビエントBGM。',
    toneInfo: 'E Minor / 78 BPM / Triangle Lute + Ruin Bell',
    keyCharacteristic: '哀愁の古楽器旋律、遠くの鐘、風のノイズで「失われた世界」の空気を表現。',
  },
];

export function SoundStudioScreen({ onBack }: { onBack: () => void }) {
  const [reverb, setReverb] = useState<number>(() => Math.round(getStoredReverbAmount() * 100));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);

  useEffect(() => subscribeToReverbAmount((value) => setReverb(Math.round(value * 100))), []);
  useEffect(() => subscribeSoundState((id, isPlaying) => setActivePlayingId(isPlaying ? id : null)), []);

  const handleReverbChange = (value: number) => {
    setReverb(value);
    setStoredReverbAmount(value / 100);
  };

  const categories = [
    { id: 'all', label: '全SE (ALL)' },
    { id: 'system', label: 'システム操作音' },
    { id: 'screen', label: '画面・ナビゲーション音' },
    { id: 'action', label: 'キャラクター＆アクション音' },
    { id: 'wiki', label: 'Wiki編纂・AI演出音' },
    { id: 'new_high', label: 'V2新規SE【大】' },
    { id: 'bgm', label: 'BGM候補' },
  ];

  const filteredCandidates = SOUND_CANDIDATES.filter((candidate) =>
    selectedCategory === 'all' || selectedCategory === 'bgm'
      ? selectedCategory === 'all'
      : candidate.category === selectedCategory,
  );
  const showBgm = selectedCategory === 'all' || selectedCategory === 'bgm';

  const handlePlay = (candidate: SoundCandidate) => {
    if (isWorldBgmPlaying()) stopWorldBgm(0);
    setActivePlayingId(candidate.id);
    if (candidate.id === 'cursor_move') {
      playCursorMoveSound();
    } else if (candidate.id === 'new_record') {
      playNewRecordSound();
    } else {
      playSoundCandidatePreview(candidate.id);
    }
    window.setTimeout(() => {
      if (!isAudioPlaying(candidate.id)) setActivePlayingId(null);
    }, 500);
  };

  const handleBgmPlay = (candidate: BgmCandidate) => {
    if (candidate.id === 'bgm_world_select') {
      if (isWorldBgmPlaying()) {
        stopWorldBgm(0);
        setActivePlayingId(null);
        return;
      }
      stopActiveAudio();
      playWorldBgm();
      setActivePlayingId(candidate.id);
      return;
    }

    if (isWorldBgmPlaying()) stopWorldBgm(0);
    playSoundCandidatePreview(candidate.id);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#161922] text-[#f0f0f0] font-sans flex flex-col select-none overflow-x-hidden">
      <div className="scanline-overlay" />
      <Header title="SOUND STUDIO // 16BIT 音響研究所" onBack={onBack} />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-3.5 py-4 sm:py-6 sm:px-8 flex-1 flex flex-col space-y-5">
        <div className="bg-[#1e2330] border-2 border-amber-500/70 p-4 sm:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-emerald-400 font-mono uppercase">
                WEB AUDIO API 16BIT SYNTHESIS ENGINE
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white">効果音・BGM デザインコンソール</h1>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              本番アプリへ移植可能な各UI・画面アクション用SEの試聴・検証用スタジオです。
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playCancelSound();
              onBack();
            }}
            className="min-h-[42px] px-4 py-2 bg-[#141824] border-2 border-slate-700 text-slate-200 hover:text-amber-400 hover:border-amber-500 text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>アプリへ戻る</span>
          </button>
        </div>

        <div className="p-4 sm:p-5 bg-[#1e2330] border-2 border-[#2d3548] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Waves className="w-4 h-4" />
              <span>グローバル空間反響 (MASTER REVERB)</span>
            </div>
            <span className="text-sm font-bold text-amber-400 font-mono">{reverb}%</span>
          </div>
          <input
            aria-label="サウンドスタジオの残響量"
            type="range"
            min="0"
            max="100"
            value={reverb}
            onChange={(event) => handleReverbChange(Number(event.target.value))}
            className="w-full h-2 bg-[#12151f] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-400 font-mono">
            <span>DRY (0% - クリスプ・直接音)</span>
            <span>DUNGEON (50% - 地下洞窟)</span>
            <span>CATHEDRAL (100% - 深宇宙)</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-b-2 border-[#2d3548] pb-3">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  playConfirmSound();
                  setSelectedCategory(category.id);
                }}
                className={`min-h-[40px] px-3.5 py-2 text-xs sm:text-sm font-bold transition-all border-2 cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'border-slate-700 bg-[#1e2330] text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {showBgm && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 border-b border-cyan-500/30 pb-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm sm:text-base font-black text-cyan-300">BGM CANDIDATES // 4 TRACKS</h2>
              <span className="text-[10px] text-slate-500 font-mono">LOOP / PREVIEW</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {BGM_CANDIDATES.map((candidate) => {
                const isPlaying = activePlayingId === candidate.id;
                return (
                  <div
                    key={candidate.id}
                    className={`bg-[#1e2330] border-2 p-4 flex flex-col justify-between transition-all ${
                      isPlaying
                        ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)] bg-[#12262d]'
                        : 'border-cyan-500/30 hover:border-cyan-500/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] px-2 py-0.5 bg-[#141824] border border-cyan-500/30 text-cyan-300 font-bold">
                            {candidate.id === 'bgm_world_select' ? 'WORLD / SAVE BGM' : 'NPC PERSONALITY BGM'}
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-white mt-1.5">{candidate.nameJa}</h3>
                          <p className="text-[10px] text-cyan-400 font-mono">{candidate.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleBgmPlay(candidate)}
                          className={`min-h-[44px] min-w-[44px] p-3 border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            isPlaying
                              ? 'border-cyan-400 bg-cyan-400 text-black scale-105 shadow-[0_0_12px_#22d3ee]'
                              : 'border-cyan-500 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-400 hover:text-black active:scale-95'
                          }`}
                          title={isPlaying ? '停止' : 'ループ試聴'}
                        >
                          <Play className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed mb-3">{candidate.description}</p>
                    </div>
                    <div className="pt-2.5 border-t border-[#2d3548] space-y-1 text-[10px] sm:text-xs font-mono text-slate-300">
                      <div className="flex items-center justify-between text-cyan-400 font-bold">
                        <span>TONE: {candidate.toneInfo}</span>
                      </div>
                      <div className="text-slate-400">演出: {candidate.keyCharacteristic}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {selectedCategory !== 'bgm' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredCandidates.map((candidate) => {
              const isPlaying = activePlayingId === candidate.id;
              return (
                <div
                  key={candidate.id}
                  className={`bg-[#1e2330] border-2 p-4 flex flex-col justify-between transition-all ${
                    isPlaying
                      ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)] bg-[#142820]'
                      : 'border-[#2d3548] hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] px-2 py-0.5 bg-[#141824] border border-slate-700 text-slate-300 font-bold">
                          {candidate.categoryJa}
                        </span>
                        <h3 className="font-bold text-sm sm:text-base text-white mt-1.5">{candidate.nameJa}</h3>
                        <p className="text-[10px] text-slate-400 font-mono">{candidate.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlay(candidate)}
                        className={`min-h-[44px] min-w-[44px] p-3 border-2 flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isPlaying
                            ? 'border-emerald-400 bg-emerald-400 text-black scale-105 shadow-[0_0_12px_#34d399]'
                            : 'border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-400 hover:text-black active:scale-95'
                        }`}
                        title="試聴・再生"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed mb-3">{candidate.description}</p>
                  </div>
                  <div className="pt-2.5 border-t border-[#2d3548] space-y-1 text-[10px] sm:text-xs font-mono text-slate-300">
                    <div className="flex items-center justify-between text-emerald-400 font-bold">
                      <span>TONE: {candidate.toneInfo}</span>
                    </div>
                    <div className="text-slate-400">演出: {candidate.keyCharacteristic}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
