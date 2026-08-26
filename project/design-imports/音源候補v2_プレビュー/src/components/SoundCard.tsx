import React, { useState } from 'react';
import { SoundCandidate } from '../types/sound';
import {
  Play,
  Square,
  Copy,
  Check,
  Code,
  Sparkles,
  Music,
  Waves,
  Cpu,
  Info,
  Quote,
} from 'lucide-react';

interface SoundCardProps {
  sound: SoundCandidate;
  isPlaying: boolean;
  onPlay: (id: string) => void;
  onOpenCode: (sound: SoundCandidate) => void;
}

export const SoundCard: React.FC<SoundCardProps> = ({
  sound,
  isPlaying,
  onPlay,
  onOpenCode,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sound.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      id={`sound-card-${sound.id}`}
      className={`group relative rounded-md border bg-[#161B22] p-4 flex flex-col transition-all duration-200 shadow-md ${
        isPlaying
          ? 'border-[#4AF626] ring-1 ring-[#4AF626]/40 bg-[#161B22]'
          : 'border-[#30363D] hover:border-[#4AF626]'
      }`}
    >
      {/* 上部ヘッダー：ID / カテゴリ / 優先度 */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* IDタグ */}
          <span className="text-[10px] font-mono text-[#4AF626] font-bold">
            #{sound.id}
          </span>

          {/* カテゴリバッジ */}
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#1C2128] border border-[#2D333B] text-[#8B949E] font-medium">
            {sound.categoryJa}
          </span>

          {/* 新規マーク */}
          {sound.isNew && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#4AF626]/10 text-[#4AF626] border border-[#4AF626]/30">
              <Sparkles className="w-2.5 h-2.5 text-[#4AF626]" />
              NEW
            </span>
          )}

          {sound.isBgm && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#FFB000]/10 text-[#FFB000] border border-[#FFB000]/30">
              <Music className="w-2.5 h-2.5 text-[#FFB000]" />
              BGM
            </span>
          )}
        </div>

        {/* 優先度 & コードボタン */}
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-mono text-[#FFB000] font-bold tracking-wider"
            title={`優先度: ${sound.priority}`}
          >
            {sound.priority}
          </span>

          {/* コード確認ボタン */}
          <button
            id={`btn-code-${sound.id}`}
            onClick={() => onOpenCode(sound)}
            className="p-1 rounded border border-[#2D333B] bg-[#1C2128] text-[#8B949E] hover:text-[#4AF626] hover:border-[#4AF626] transition-colors cursor-pointer"
            title="TypeScript定義 / Web Audio実装コードを確認"
          >
            <Code className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* タイトル & 日本語名 */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold tracking-tight text-[#E0E2E5] group-hover:text-white">
            {sound.nameJa}
          </h3>

          {/* IDコピーボタン */}
          <button
            id={`btn-copy-${sound.id}`}
            onClick={handleCopyId}
            className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C2128] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B] transition-colors cursor-pointer"
            title="IDをクリップボードにコピー"
          >
            {copied ? (
              <>
                <Check className="w-2.5 h-2.5 text-[#4AF626]" />
                <span className="text-[#4AF626]">COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-2.5 h-2.5" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] text-[#8B949E] font-mono mt-0.5">{sound.name}</p>
      </div>

      {/* 用途説明 */}
      <div className="mb-3 rounded bg-[#0A0B0D] border border-[#21262D] p-2.5">
        <div className="flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#4AF626] shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-mono text-[#8B949E] uppercase tracking-wider block mb-0.5">
              USAGE // 用途
            </span>
            <p className="text-xs text-[#E0E2E5] leading-relaxed">
              {sound.usage}
            </p>
          </div>
        </div>
      </div>

      {/* NPC専用BGM用 詳細プロファイル */}
      {sound.npcPersona && (
        <div className="mb-3 rounded bg-[#0F1218] border border-[#2D333B] p-2.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-[#E0E2E5]">
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#4AF626]">
              <Quote className="w-3 h-3 text-[#4AF626]" />
              NPC PROFILE // {sound.npcPersona.roleName}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#1C2128] border border-[#2D333B] text-[9px] font-mono text-[#8B949E]">
              {sound.npcPersona.tempo}
            </span>
          </div>

          <p className="text-[11px] italic text-[#8B949E] bg-[#0A0B0D] p-2 rounded border-l-2 border-[#4AF626]">
            {sound.npcPersona.characterQuote}
          </p>

          <div className="space-y-0.5 text-[11px] text-[#8B949E]">
            <div className="flex gap-2">
              <span className="text-[#8B949E] shrink-0 font-medium">特性:</span>
              <span className="text-[#E0E2E5]">{sound.npcPersona.archetype}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[#8B949E] shrink-0 font-medium">演出:</span>
              <span className="text-[#E0E2E5]">{sound.npcPersona.atmosphere}</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-[#21262D]">
            <span className="text-[10px] font-mono text-[#8B949E] block mb-1">
              TRAITS:
            </span>
            <div className="flex flex-wrap gap-1">
              {sound.npcPersona.musicalTraits.map((trait, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1C2128] border border-[#2D333B] text-[#8B949E]"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 音響スペック & 特徴 */}
      <div className="space-y-1.5 mb-3 text-[10px] font-mono">
        <div className="p-2 rounded bg-[#0A0B0D] border border-[#21262D] text-[#8B949E]">
          <div className="flex items-center gap-1.5 text-[#8B949E] mb-0.5">
            <Cpu className="w-2.5 h-2.5 text-[#4AF626]" />
            <span className="uppercase">OSCILLATOR & FREQ</span>
          </div>
          <p className="text-[#E0E2E5] break-all">{sound.toneInfo}</p>
        </div>

        <div className="p-2 rounded bg-[#0A0B0D] border border-[#21262D] text-[#8B949E]">
          <div className="flex items-center gap-1.5 text-[#8B949E] mb-0.5">
            <Waves className="w-2.5 h-2.5 text-[#FFB000]" />
            <span className="uppercase">ACOUSTIC CHARACTER</span>
          </div>
          <p className="text-[#E0E2E5] font-sans text-xs">{sound.keyCharacteristic}</p>
        </div>
      </div>

      {/* 再生 / 停止 アクションボタン */}
      <div className="mt-auto pt-1">
        <button
          id={`btn-play-${sound.id}`}
          onClick={() => onPlay(sound.id)}
          className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-sm font-bold transition-all text-xs cursor-pointer border ${
            isPlaying
              ? 'bg-[#F85149]/20 hover:bg-[#F85149]/30 text-[#F85149] border-[#F85149]/50 animate-pulse'
              : sound.badgeType === 'new_high'
              ? 'bg-[#4AF626]/10 hover:bg-[#4AF626]/20 text-[#4AF626] border-[#4AF626]/40'
              : 'bg-[#21262D] hover:bg-[#30363D] text-[#E0E2E5] border-[#30363D]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>STOP AUDITION</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{sound.isLooping || sound.isBgm ? 'AUDITION (LOOP)' : 'AUDITION'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
