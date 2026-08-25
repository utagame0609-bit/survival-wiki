import React, { useState } from 'react';
import { SoundEffectDef } from '../types';
import { getCodeSnippetForSound } from '../audio/codeSnippets';
import { X, Copy, Check, Code2, Sparkles } from 'lucide-react';

interface CodeExportModalProps {
  sound: SoundEffectDef | null;
  onClose: () => void;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({ sound, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!sound) return null;

  const codeSnippet = getCodeSnippetForSound(sound.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="code-export-modal"
        className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{sound.nameJa}</span>
                <span className="text-xs font-mono font-normal text-slate-400">({sound.name})</span>
              </h3>
              <p className="text-xs font-mono text-cyan-400/90">{sound.toneInfo}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Web Audio API (Vanilla JS / TypeScript)
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 hover:border-slate-600 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">コピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>コードをコピー</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-cyan-200/90 overflow-x-auto max-h-[380px] leading-relaxed shadow-inner">
            <pre className="whitespace-pre">{codeSnippet}</pre>
          </div>

          <p className="text-xs text-slate-400 mt-4 leading-relaxed">
            ※ 外部音声ファイル（mp3/wav）の読み込みなしで、ブラウザの
            <code className="text-cyan-300 font-mono mx-1">new AudioContext()</code>
            にそのまま渡すだけで直接発音できます。
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-800 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
