import React, { useState } from 'react';
import { SOUND_EFFECTS_CATALOG } from '../../data/initialData';
import { SoundEffectMeta } from '../../types';
import { X, Volume2, Sparkles, Play, Music, Radio } from 'lucide-react';
import { soundEngine } from '../../services/soundEngine';

interface SoundStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundStudioModal: React.FC<SoundStudioModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'ALL (全28種)' },
    { id: 'menu', label: 'SYSTEM / UI' },
    { id: 'record', label: 'RECORD / LOG' },
    { id: 'wiki', label: 'WIKI & NPC' },
    { id: 'action', label: 'ACTION & FX' },
  ];

  const filteredEffects = SOUND_EFFECTS_CATALOG.filter((se) =>
    activeCategory === 'all' ? true : se.category === activeCategory
  );

  const handlePlay = (effect: SoundEffectMeta) => {
    setPlayingId(effect.id);
    soundEngine.playSe(effect.id);
    setTimeout(() => setPlayingId(null), 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#05080E]/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0F172A] border-2 border-[#F59E0B] rounded-2xl shadow-2xl overflow-hidden my-auto hud-scanlines">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#0B1018] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#161F30] border border-[#F59E0B] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-[#06B6D4] tracking-widest uppercase leading-none">
                16-BIT CHIP-SYNTH CONSOLE
              </div>
              <h3 className="text-sm sm:text-base font-game font-bold text-[#F8FAFC] tracking-wider mt-0.5">
                SOUND STUDIO // 28種レトロ効果音検証室
              </h3>
            </div>
          </div>

          <button
            id="btn-close-sound-studio"
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 bg-[#0D1424] border-b border-[#1E293B] flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundEngine.playSe('tab_switch');
                setActiveCategory(cat.id);
              }}
              className={`px-3 py-1.5 rounded text-xs font-game transition-all whitespace-nowrap ${
                activeCategory === cat.id
                  ? 'bg-[#F59E0B] text-[#0B1018] font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                  : 'bg-[#161F30] text-[#94A3B8] hover:text-[#F8FAFC] border border-[#334155]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 28 Sound Buttons Grid */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {filteredEffects.map((effect) => {
              const isPlaying = playingId === effect.id;

              return (
                <button
                  key={effect.id}
                  id={`se-btn-${effect.id}`}
                  type="button"
                  onClick={() => handlePlay(effect)}
                  className={`group text-left p-3 rounded-lg border transition-all duration-150 relative overflow-hidden flex flex-col justify-between ${
                    isPlaying
                      ? 'bg-[#F59E0B]/20 border-[#F59E0B] scale-[0.98] shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                      : 'bg-[#0B1018]/90 hover:bg-[#131E35] border-[#1E293B] hover:border-[#06B6D4]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-game font-bold text-[#F8FAFC] group-hover:text-[#FDE68A] transition-colors line-clamp-1">
                      {effect.name}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                        isPlaying
                          ? 'bg-[#F59E0B] text-[#0B1018] border-[#F59E0B]'
                          : 'bg-[#161F30] text-[#06B6D4] border-[#334155] group-hover:border-[#06B6D4]'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    </div>
                  </div>

                  <p className="text-[11px] font-jp text-[#94A3B8] line-clamp-1">
                    {effect.description}
                  </p>

                  <div className="flex items-center justify-between text-[9px] font-mono text-[#64748B] mt-2 pt-1 border-t border-[#1E293B]">
                    <span>ID: {effect.id}</span>
                    <span className="text-[#06B6D4] uppercase">{effect.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0B1018] border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span>WEB AUDIO API // HARDWARE ACCELERATED CHIPTUNE</span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSe('menu_back');
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-[#161F30] hover:bg-[#1E293B] text-[#F8FAFC] font-game text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
