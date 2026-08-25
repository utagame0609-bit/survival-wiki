import React, { useState, useRef, useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { MessageSquare, Play, Square, FastForward, Sliders, RefreshCw } from 'lucide-react';

const PRESET_LINES = [
  'ゆうしゃよ、よくぞ まいられた！ このせかいに へいわを とりもどすのじゃ！',
  'Nintendo Switch風の なめらかなそうさかん と 16bitレトロな おんがくが ゆうごう！',
  'Wikiデータを かいせきちゅう… ぼうけんのしょを さくせいしています。',
  'アイテム【でんせつの つるぎ】を てにいれた！ だいじに つかおう！'
];

export const DialogueTester: React.FC = () => {
  const [text, setText] = useState(PRESET_LINES[0]);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [speedMs, setSpeedMs] = useState(55);
  const [pitchJitter, setPitchJitter] = useState(true);

  const typingTimerRef = useRef<number | null>(null);

  const startTyping = (textToType: string = text) => {
    stopTyping();
    setDisplayedText('');
    setIsTyping(true);

    let currentIndex = 0;

    typingTimerRef.current = window.setInterval(() => {
      if (currentIndex < textToType.length) {
        const char = textToType[currentIndex];
        setDisplayedText(textToType.slice(0, currentIndex + 1));

        // Skip sound on whitespace / punctuation pauses
        if (char !== ' ' && char !== '　' && char !== '…' && char !== '、' && char !== '。') {
          const jitter = pitchJitter ? (Math.random() * 40 - 20) : 0;
          soundEngine.playDialogueCharacter(jitter);
        }

        currentIndex++;
      } else {
        stopTyping();
      }
    }, speedMs);
  };

  const stopTyping = () => {
    if (typingTimerRef.current !== null) {
      clearInterval(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setIsTyping(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimerRef.current !== null) {
        clearInterval(typingTimerRef.current);
      }
    };
  }, []);

  return (
    <div id="dialogue-tester-card" className="rounded-2xl border border-indigo-500/30 bg-slate-900/90 p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <span>キャラセリフ表示音・タイピングテスト</span>
              <span className="text-[11px] font-mono font-normal px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800">
                ポポポポ…
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              レトロRPG風テキスト送りと1文字ごとの三角波ドット音の連続実機テスト
            </p>
          </div>
        </div>

        {/* Speed / Pitch Controls */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">文字送り速度:</span>
            <span className="font-mono text-indigo-300">{speedMs}ms</span>
            <input
              type="range"
              min="25"
              max="120"
              step="5"
              value={speedMs}
              onChange={(e) => setSpeedMs(Number(e.target.value))}
              className="w-16 accent-indigo-500 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 select-none">
            <input
              type="checkbox"
              checked={pitchJitter}
              onChange={(e) => setPitchJitter(e.target.checked)}
              className="rounded accent-indigo-500"
            />
            <span className="text-xs">ピッチ揺らぎ</span>
          </label>
        </div>
      </div>

      {/* RPG Message Box Display */}
      <div className="relative rounded-xl border-2 border-slate-700 bg-black/90 p-4 min-h-[90px] mb-4 shadow-inner">
        <div className="text-xs font-mono text-slate-500 mb-1 flex items-center justify-between">
          <span>RPG DIALOGUE WINDOW</span>
          <span className="text-[10px] text-cyan-400/80 font-mono">
            {isTyping ? '▶ TYPING IN PROGRESS...' : '▼ WAITING'}
          </span>
        </div>
        <p className="font-mono text-sm sm:text-base text-slate-100 leading-relaxed tracking-wide min-h-[44px]">
          {displayedText}
          {isTyping && <span className="inline-block w-2 h-4 bg-indigo-400 ml-1 animate-pulse" />}
        </p>
      </div>

      {/* Input Text & Preset Pills */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            id="dialogue-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="テストしたいセリフを入力してください..."
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
          <button
            id="dialogue-play-btn"
            onClick={() => (isTyping ? stopTyping() : startTyping())}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs border transition-all ${
              isTyping
                ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-md hover:shadow-indigo-500/20'
            }`}
          >
            {isTyping ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>停止</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>セリフ再生</span>
              </>
            )}
          </button>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <FastForward className="w-3 h-3 text-indigo-400" /> プリセット:
          </span>
          {PRESET_LINES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setText(preset);
                startTyping(preset);
              }}
              className="text-[11px] px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/50 transition-colors truncate max-w-[200px]"
            >
              #{idx + 1} {preset.slice(0, 14)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
