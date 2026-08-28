import React, { useState } from 'react';
import { X, Play, Square, Music, Volume2, Sparkles, Terminal, Info } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface SoundStudioModalProps {
  onClose: () => void;
}

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({ onClose }) => {
  const [activeBgm, setActiveBgm] = useState<string | null>(null);

  const SE_EFFECTS = [
    { name: '決定音 (Confirm)', action: () => sound.playConfirm(), type: 'Square Arpeggio' },
    { name: 'キャンセル音 (Cancel)', action: () => sound.playCancel(), type: 'Square Down' },
    { name: 'カーソル音 (Hover)', action: () => sound.playHover(), type: 'Triangle Click' },
    { name: '記録保存音 (LevelUp)', action: () => sound.playSaveLog(), type: 'Chime Chord' },
    { name: 'シャッター音 (Shutter)', action: () => sound.playShutter(), type: 'Noise HighPass' },
    { name: '削除音 (Delete)', action: () => sound.playDelete(), type: 'Sawtooth Drop' },
    { name: 'ページめくり (PageTurn)', action: () => sound.playPageTurn(), type: 'Triangle Sweep' },
    { name: 'Wiki編纂音 (Compile)', action: () => sound.playWikiCompile(), type: 'Synth Fanfare' },
  ];

  const BGM_TRACKS: { id: 'world-select' | 'wikipedia' | 'scp' | 'ancient'; name: string; style: string }[] = [
    { id: 'world-select', name: 'ワールド選択画面 BGM', style: '16-bit ノスタルジア冒険曲 (C Major / BPM 102)' },
    { id: 'wikipedia', name: 'ウタペディア BGM', style: 'クラシカル × レトロ学術調 (A Minor / BPM 102)' },
    { id: 'scp', name: 'SCP 機密報告 BGM', style: 'サイバーインダストリアル ドローン (BPM 84)' },
    { id: 'ancient', name: '絶望古文書 BGM', style: '哀愁のレトロファンタジー リュート (BPM 76)' },
  ];

  const handlePlayBgm = (trackId: 'world-select' | 'wikipedia' | 'scp' | 'ancient') => {
    if (activeBgm === trackId) {
      sound.stopBgm();
      setActiveBgm(null);
    } else {
      sound.playBgm(trackId);
      setActiveBgm(trackId);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          sound.playCancel();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-2xl bg-[#0a0a0c] border-2 border-[#ff8c00] shadow-[8px_8px_0px_#000000] rounded-xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-[#121214] border-b-2 border-[#333338]">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] terminal-font font-bold bg-[#ff8c00]/20 text-[#ff8c00] border border-[#ff8c00]">
              AUDIO LAB // 16-BIT SYNTH
            </span>
            <h3 className="text-sm sm:text-base font-black text-white terminal-font">
              サウンド開発スタジオ
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playCancel();
              onClose();
            }}
            className="p-1.5 text-[#888888] hover:text-white rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 text-[#dcdcdc] bg-[#0e0e11]">
          {/* Concept explanation */}
          <div className="p-3.5 rounded-lg bg-[#141417] border-2 border-[#333338] text-xs leading-relaxed text-[#aaaaaa] flex items-start gap-2.5 shadow-[3px_3px_0px_#000000]">
            <Sparkles className="w-4 h-4 text-[#ff8c00] shrink-0 mt-0.5" />
            <p>
              外部音声ファイル（MP3/WAV）を一切使わず、オシレーター（矩形波・三角波・ノイズ）とプロシージャルリバーブ残響フィルターをブラウザ上で完全合成しています。
            </p>
          </div>

          {/* BGM Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 terminal-font text-xs font-bold text-[#ff8c00]">
              <Music className="w-4 h-4" />
              <span>BGM CANDIDATES // 背景音楽 ({BGM_TRACKS.length}曲)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BGM_TRACKS.map((t) => {
                const isPlaying = activeBgm === t.id;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-lg border-2 transition shadow-[3px_3px_0px_#000000] ${
                      isPlaying
                        ? 'bg-[#18181c] border-[#ff8c00] shadow-[3px_3px_0px_#ff8c00]'
                        : 'bg-[#141417] border-[#333338]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-bold text-white terminal-font">{t.name}</h5>
                      <button
                        type="button"
                        onClick={() => handlePlayBgm(t.id)}
                        className={`px-2.5 py-1 rounded text-xs terminal-font font-bold flex items-center gap-1 cursor-pointer transition shadow-[2px_2px_0px_#000000] ${
                          isPlaying
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#ff8c00] text-black hover:bg-[#ffa500]'
                        }`}
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-black" />}
                        <span>{isPlaying ? 'STOP' : 'PLAY'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-[#888888] terminal-font">{t.style}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SE Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 terminal-font text-xs font-bold text-[#00ff41]">
              <Volume2 className="w-4 h-4" />
              <span>SOUND EFFECTS // 効果音一覧 ({SE_EFFECTS.length}種)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SE_EFFECTS.map((se) => (
                <button
                  key={se.name}
                  type="button"
                  onClick={se.action}
                  className="p-2.5 rounded-lg bg-[#141417] hover:bg-[#18181c] border-2 border-[#333338] hover:border-[#00ff41] text-left transition cursor-pointer active:scale-95 group shadow-[2px_2px_0px_#000000]"
                >
                  <div className="text-xs font-bold text-[#dcdcdc] group-hover:text-[#00ff41] truncate terminal-font">
                    {se.name}
                  </div>
                  <div className="text-[10px] terminal-font text-[#666666] mt-0.5">{se.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#121214] border-t-2 border-[#333338] flex justify-end">
          <button
            type="button"
            onClick={() => {
              sound.playConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-[#ff8c00] hover:bg-[#ffa500] text-black font-bold terminal-font text-xs rounded-lg cursor-pointer shadow-[2px_2px_0px_#000000]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
