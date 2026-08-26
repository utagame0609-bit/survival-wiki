import React, { useState, useEffect, useMemo } from 'react';
import {
  SOUND_CANDIDATES,
  SoundCandidate,
} from './types/sound';
import {
  playSoundCandidatePreview,
  stopActiveAudio,
  subscribeSoundState,
  setMasterVolume,
  getMasterVolume,
  toggleMute,
  getIsMuted,
} from './audio/soundEngine';
import { AudioVisualizer } from './components/AudioVisualizer';
import { SoundCard } from './components/SoundCard';
import { CodeInspectorModal } from './components/CodeInspectorModal';
import { SoundPlaygroundModal } from './components/SoundPlaygroundModal';
import {
  Volume2,
  VolumeX,
  Square,
  Search,
  Sparkles,
  Music,
  Layers,
  Code,
  ShieldCheck,
  Zap,
  PlaySquare,
  Filter,
  Play,
  Terminal,
  Activity,
} from 'lucide-react';

interface SystemLog {
  time: string;
  text: string;
  type: 'info' | 'play' | 'stop' | 'bgm';
}

export default function App() {
  // 再生ステート
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 音量ステート
  const [volume, setVolume] = useState<number>(getMasterVolume());
  const [muted, setMuted] = useState<boolean>(getIsMuted());

  // フィルタリング
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // モーダル
  const [codeModalSound, setCodeModalSound] = useState<SoundCandidate | null>(null);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

  // システムログ
  const [logs, setLogs] = useState<SystemLog[]>([
    { time: '00:00:01', text: 'Audio Context Initialized (44.1kHz)', type: 'info' },
    { time: '00:00:02', text: 'Loaded 31 sound presets [16-bit synth]', type: 'info' },
    { time: '00:00:03', text: 'Ready for candidate audition.', type: 'info' },
  ]);

  // 音声ステートのサブスクライブ
  useEffect(() => {
    const unsubscribe = subscribeSoundState((id, playing) => {
      setActiveSoundId(id);
      setIsPlaying(playing);

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      if (playing && id) {
        const soundObj = SOUND_CANDIDATES.find((s) => s.id === id);
        const name = soundObj ? soundObj.nameJa : id;
        const isBgm = soundObj?.isBgm;
        setLogs((prev) => [
          {
            time: timeStr,
            text: `PLAY #${id} (${name})`,
            type: isBgm ? 'bgm' : 'play',
          },
          ...prev.slice(0, 19),
        ]);
      } else if (!playing) {
        setLogs((prev) => [
          {
            time: timeStr,
            text: 'STOP all audio channels',
            type: 'stop',
          },
          ...prev.slice(0, 19),
        ]);
      }
    });
    return unsubscribe;
  }, []);

  // 音量変更
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMasterVolume(val);
    if (muted && val > 0) {
      setMuted(false);
    }
  };

  // ミュート切替
  const handleToggleMute = () => {
    const newMuted = toggleMute();
    setMuted(newMuted);
  };

  // 音源再生ハンドラ
  const handlePlaySound = (id: string) => {
    playSoundCandidatePreview(id);
  };

  // 全停止
  const handleStopAll = () => {
    stopActiveAudio();
  };

  // フィルタリング計算
  const filteredSounds = useMemo(() => {
    return SOUND_CANDIDATES.filter((s) => {
      // 1. カテゴリフィルタ
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'new_high' && s.badgeType !== 'new_high') return false;
        if (selectedCategory === 'new_medium' && s.badgeType !== 'new_medium') return false;
        if (selectedCategory === 'npc_bgm' && s.badgeType !== 'npc_bgm') return false;
        if (selectedCategory === 'existing' && s.badgeType !== 'existing') return false;
      }

      // 2. 優先度フィルタ
      if (selectedPriority !== 'all' && s.priority !== selectedPriority) {
        return false;
      }

      // 3. 検索クエリ
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = s.id.toLowerCase().includes(q);
        const matchName = s.name.toLowerCase().includes(q);
        const matchNameJa = s.nameJa.toLowerCase().includes(q);
        const matchUsage = s.usage.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchTone = s.toneInfo.toLowerCase().includes(q);
        const matchKey = s.keyCharacteristic.toLowerCase().includes(q);
        const matchPersona = s.npcPersona?.roleName.toLowerCase().includes(q);
        return (
          matchId ||
          matchName ||
          matchNameJa ||
          matchUsage ||
          matchDesc ||
          matchTone ||
          matchKey ||
          Boolean(matchPersona)
        );
      }

      return true;
    });
  }, [selectedCategory, selectedPriority, searchQuery]);

  // カウント統計
  const stats = useMemo(() => {
    return {
      total: SOUND_CANDIDATES.length,
      newHigh: SOUND_CANDIDATES.filter((s) => s.badgeType === 'new_high').length,
      newMedium: SOUND_CANDIDATES.filter((s) => s.badgeType === 'new_medium').length,
      npcBgm: SOUND_CANDIDATES.filter((s) => s.badgeType === 'npc_bgm').length,
      existing: SOUND_CANDIDATES.filter((s) => s.badgeType === 'existing').length,
    };
  }, []);

  // NPC BGM リスト
  const npcBgms = useMemo(() => {
    return SOUND_CANDIDATES.filter((s) => s.isBgm);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#E0E2E5] flex flex-col font-sans selection:bg-[#4AF626]/20 selection:text-[#4AF626]">
      {/* ============================================================ */}
      {/* 1. 最上部 マスターコンソール ヘッダー */}
      {/* ============================================================ */}
      <header className="h-14 bg-[#14171D] border-b border-[#2D333B] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4AF626] rounded-sm flex items-center justify-center text-black font-bold text-xs font-mono shadow-sm">
            S2
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wider text-[#E0E2E5] font-mono flex items-center gap-2">
              SOUND STUDIO <span className="text-[#4AF626] text-xs font-normal">// PREVIEW_CONSOLE</span>
            </h1>
            <p className="text-[10px] text-[#8B949E] font-mono">SURVIVAL WIKI • 16-BIT RETRO AUDIO ARCHITECTURE</p>
          </div>
        </div>

        {/* コントロール: VUメーター / 音量 / ミュート / 全停止 / プレイグラウンド / コード */}
        <div className="flex items-center gap-3 font-mono text-xs">
          {/* VUメーター */}
          <div className="hidden lg:flex items-center gap-2 bg-[#0A0B0D] px-3 py-1 rounded border border-[#21262D]">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-[9px] text-[#8B949E]">
                <span>L</span>
                <div className="w-16 h-1.5 bg-[#1C2128] rounded-xs overflow-hidden flex">
                  <div
                    className="h-full bg-[#4AF626] transition-all duration-75"
                    style={{ width: isPlaying && !muted ? `${Math.min(100, Math.max(15, volume * 90))}%` : '0%' }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-[#8B949E]">
                <span>R</span>
                <div className="w-16 h-1.5 bg-[#1C2128] rounded-xs overflow-hidden flex">
                  <div
                    className="h-full bg-[#4AF626] transition-all duration-75"
                    style={{ width: isPlaying && !muted ? `${Math.min(100, Math.max(20, volume * 95))}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* マスターボリューム */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#0A0B0D] border border-[#21262D]">
            <button
              onClick={handleToggleMute}
              className="text-[#8B949E] hover:text-[#4AF626] transition-colors cursor-pointer"
              title={muted ? 'ミュート解除' : 'ミュート'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-[#F85149]" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#4AF626]" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={muted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 sm:w-20 accent-[#4AF626] cursor-pointer h-1 bg-[#1C2128] rounded"
              title={`マスター音量: ${Math.round(volume * 100)}%`}
            />
            <span className="text-[10px] text-[#4AF626] font-bold w-6 text-right">
              {muted ? '0%' : `${Math.round(volume * 100)}%`}
            </span>
          </div>

          {/* 全停止ボタン */}
          <button
            id="btn-stop-all"
            onClick={handleStopAll}
            disabled={!isPlaying && !activeSoundId}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm border text-xs font-bold transition-all cursor-pointer ${
              isPlaying || activeSoundId
                ? 'border-[#F85149]/60 bg-[#F85149]/15 text-[#F85149] hover:bg-[#F85149]/25 animate-pulse'
                : 'border-[#21262D] bg-[#0A0B0D] text-[#8B949E] opacity-50 cursor-not-allowed'
            }`}
          >
            <Square className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">STOP</span>
          </button>

          {/* UI動作テスト (プレイグラウンド) */}
          <button
            id="btn-open-playground"
            onClick={() => setIsPlaygroundOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#4AF626] hover:bg-[#4AF626]/90 text-black text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>UI TEST</span>
          </button>

          {/* コード出力 / 定義確認 */}
          <button
            id="btn-open-code-all"
            onClick={() => {
              setCodeModalSound(null);
              setIsCodeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#1C2128] hover:bg-[#21262D] border border-[#2D333B] text-[#E0E2E5] text-xs font-medium transition-all cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-[#4AF626]" />
            <span className="hidden sm:inline">GIT CODE</span>
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. メイン 2カラム レイアウト */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* 左側：BGM Candidate Rack & Live System Log */}
        <aside className="w-full lg:w-[320px] bg-[#0F1218] border-b lg:border-b-0 lg:border-r border-[#2D333B] flex flex-col p-4 gap-4 shrink-0 overflow-y-auto max-h-[40vh] lg:max-h-none">
          {/* NPC BGM Quick Rack */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-[#8B949E] uppercase font-mono flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-[#FFB000]" />
                NPC BGM CANDIDATES
              </span>
              <span className="text-[10px] font-mono text-[#FFB000] bg-[#FFB000]/10 px-1.5 py-0.5 rounded border border-[#FFB000]/30">
                3 TRACKS
              </span>
            </div>

            <div className="space-y-2">
              {npcBgms.map((bgm) => {
                const isBgmPlaying = activeSoundId === bgm.id && isPlaying;
                return (
                  <div
                    key={bgm.id}
                    className={`p-3 rounded border transition-all ${
                      isBgmPlaying
                        ? 'border-[#4AF626] bg-[#161B22] shadow-sm'
                        : 'border-[#2D333B] bg-[#14171D] hover:border-[#4AF626]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#E0E2E5] font-mono">
                        {bgm.npcPersona?.roleName || bgm.nameJa}
                      </span>
                      <span className="text-[9px] font-mono text-[#8B949E] bg-[#0A0B0D] px-1.5 py-0.5 rounded border border-[#21262D]">
                        {bgm.npcPersona?.tempo || '16-BIT'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] line-clamp-1 mb-2">
                      {bgm.npcPersona?.atmosphere || bgm.usage}
                    </p>
                    <button
                      onClick={() => handlePlaySound(bgm.id)}
                      className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-sm text-xs font-bold font-mono transition-colors cursor-pointer border ${
                        isBgmPlaying
                          ? 'bg-[#F85149]/20 hover:bg-[#F85149]/30 text-[#F85149] border-[#F85149]/50 animate-pulse'
                          : 'bg-[#21262D] hover:bg-[#30363D] text-[#4AF626] border-[#30363D]'
                      }`}
                    >
                      {isBgmPlaying ? (
                        <>
                          <Square className="w-3 h-3 fill-current" />
                          <span>STOP LOOP</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>AUDITION LOOP</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Terminal Log */}
          <div className="flex-1 flex flex-col min-h-[160px] bg-[#0A0B0D] rounded border border-[#21262D] p-3 font-mono text-[11px] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#21262D] pb-1.5 mb-2 text-[#8B949E]">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#4AF626]">
                <Terminal className="w-3 h-3 text-[#4AF626]" />
                SYSTEM_LOG // DSP
              </span>
              <span className="flex items-center gap-1 text-[9px] text-[#4AF626]">
                <Activity className="w-2.5 h-2.5 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 text-[#8B949E]">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-1.5 leading-tight">
                  <span className="text-[#8B949E] shrink-0">[{log.time}]</span>
                  <span
                    className={
                      log.type === 'play'
                        ? 'text-[#4AF626]'
                        : log.type === 'bgm'
                        ? 'text-[#FFB000]'
                        : log.type === 'stop'
                        ? 'text-[#F85149]'
                        : 'text-[#8B949E]'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 右側：メインスタジオ エリア */}
        <main className="flex-1 flex flex-col p-4 sm:p-6 bg-[radial-gradient(circle_at_50%_50%,#14171C_0%,#0A0B0D_100%)] overflow-y-auto space-y-5">
          {/* リアルタイム Web Audio オシロスコープ & スペクトラム */}
          <AudioVisualizer isPlaying={isPlaying} activeId={activeSoundId} />

          {/* セキュリティ・安全制約 & クイック統計 */}
          <div className="rounded border border-[#2D333B] bg-[#14171D] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#4AF626] font-bold text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-[#4AF626]" />
                <span>NON-DESTRUCTIVE PASS // 既存システム完全非破壊</span>
              </div>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                既存Web Audioオシレーター構成・既存配管を100%維持したまま、
                <strong className="text-[#FFB000] mx-1">新規SE候補 16音</strong>
                および
                <strong className="text-[#4AF626] mx-1">WIKI生成NPC専用BGM 3曲</strong>
                を追加定義しています。
              </p>
            </div>

            {/* 統計バッジ */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono shrink-0">
              <span className="px-2 py-0.5 rounded bg-[#0A0B0D] border border-[#21262D] text-[#8B949E]">
                TOTAL: <strong className="text-[#E0E2E5]">{stats.total}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#4AF626]/10 border border-[#4AF626]/30 text-[#4AF626]">
                HIGH: <strong>{stats.newHigh}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#1C2128] border border-[#2D333B] text-[#8B949E]">
                MED: <strong>{stats.newMedium}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-[#FFB000]/10 border border-[#FFB000]/30 text-[#FFB000]">
                BGM: <strong>{stats.npcBgm}</strong>
              </span>
            </div>
          </div>

          {/* 検索 & フィルタリングコントロール */}
          <div className="space-y-3 bg-[#14171D] p-3.5 rounded border border-[#2D333B]">
            {/* カテゴリタブ */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-sm transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#4AF626] text-black font-bold'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
                }`}
              >
                ALL ({stats.total})
              </button>

              <button
                onClick={() => setSelectedCategory('new_high')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all cursor-pointer ${
                  selectedCategory === 'new_high'
                    ? 'bg-[#4AF626] text-black font-bold'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#4AF626] border border-[#2D333B]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#FFB000]" />
                NEW HIGH ({stats.newHigh})
              </button>

              <button
                onClick={() => setSelectedCategory('new_medium')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all cursor-pointer ${
                  selectedCategory === 'new_medium'
                    ? 'bg-[#4AF626] text-black font-bold'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
                }`}
              >
                <Zap className="w-3 h-3 text-[#4AF626]" />
                NEW MED ({stats.newMedium})
              </button>

              <button
                onClick={() => setSelectedCategory('npc_bgm')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all cursor-pointer ${
                  selectedCategory === 'npc_bgm'
                    ? 'bg-[#4AF626] text-black font-bold'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#FFB000] border border-[#2D333B]'
                }`}
              >
                <Music className="w-3 h-3 text-[#FFB000]" />
                NPC BGM ({stats.npcBgm})
              </button>

              <button
                onClick={() => setSelectedCategory('existing')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-sm transition-all cursor-pointer ${
                  selectedCategory === 'existing'
                    ? 'bg-[#4AF626] text-black font-bold'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
                }`}
              >
                <Layers className="w-3 h-3 text-[#8B949E]" />
                EXISTING ({stats.existing})
              </button>
            </div>

            {/* サブフィルタ: 優先度 & 検索バー */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#21262D]">
              {/* 優先度セレクター */}
              <div className="flex items-center gap-2 w-full sm:w-auto text-xs font-mono">
                <span className="text-[#8B949E] flex items-center gap-1">
                  <Filter className="w-3 h-3 text-[#4AF626]" />
                  PRIORITY:
                </span>
                <div className="flex items-center gap-1">
                  {(['all', '★★★', '★★', '★'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPriority(p)}
                      className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                        selectedPriority === p
                          ? 'bg-[#4AF626] text-black font-bold'
                          : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
                      }`}
                    >
                      {p === 'all' ? 'ALL' : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* 検索入力欄 */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8B949E]" />
                <input
                  id="search-sound-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="FILTER BY ID, NAME, TONE, USAGE..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-sm bg-[#0A0B0D] border border-[#2D333B] text-xs text-[#E0E2E5] placeholder:text-[#8B949E] focus:outline-none focus:border-[#4AF626] font-mono transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#8B949E] hover:text-[#4AF626]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* 3. 音源カード グリッド */}
          {/* ============================================================ */}
          {filteredSounds.length === 0 ? (
            <div className="p-10 text-center rounded border border-dashed border-[#2D333B] bg-[#0A0B0D] space-y-2">
              <Search className="w-6 h-6 text-[#8B949E] mx-auto" />
              <h3 className="text-sm font-bold text-[#8B949E] font-mono">
                NO_PRESET_MATCHED
              </h3>
              <p className="text-xs text-[#8B949E]">
                条件に一致する音源が見つかりませんでした。フィルターを解除してください。
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedPriority('all');
                  setSearchQuery('');
                }}
                className="px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#4AF626] text-xs font-mono font-bold cursor-pointer mt-2"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSounds.map((sound) => (
                <SoundCard
                  key={sound.id}
                  sound={sound}
                  isPlaying={activeSoundId === sound.id}
                  onPlay={handlePlaySound}
                  onOpenCode={(s) => {
                    setCodeModalSound(s);
                    setIsCodeModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. ハードウェアステータス ラック (Bottom Telemetry) */}
          {/* ============================================================ */}
          <div className="h-16 bg-[#14171D] border border-[#2D333B] rounded flex items-center justify-between px-4 sm:px-6 shrink-0 font-mono text-xs text-[#8B949E]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4AF626] inline-block animate-pulse"></span>
                <span className="text-[#E0E2E5]">OSC: WebAudio 44.1kHz</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFB000] inline-block"></span>
                <span className="text-[#E0E2E5]">MODE: 16-Bit Retro</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4AF626] inline-block"></span>
                <span className="text-[#E0E2E5]">BYPASS: Non-Destructive Pass</span>
              </div>
            </div>
            <div className="text-[11px] text-[#4AF626]">
              SURVIVAL WIKI // SOUND ARCHITECTURE v2.0
            </div>
          </div>
        </main>
      </div>

      {/* コード検査モーダル */}
      <CodeInspectorModal
        sound={codeModalSound}
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* UI動作テスト（プレイグラウンド） */}
      <SoundPlaygroundModal
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
      />
    </div>
  );
}

