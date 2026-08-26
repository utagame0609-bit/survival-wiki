import React, { useState } from 'react';
import { SoundCandidate, SOUND_CANDIDATES } from '../types/sound';
import { X, Copy, Check, FileCode, Layers } from 'lucide-react';

interface CodeInspectorModalProps {
  sound: SoundCandidate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CodeInspectorModal: React.FC<CodeInspectorModalProps> = ({
  sound,
  isOpen,
  onClose,
}) => {
  const [tab, setTab] = useState<'single' | 'all_types' | 'all_engine'>('single');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getSingleCode = (s: SoundCandidate) => {
    return `// ==========================================
// Sound Candidate: ${s.nameJa} (${s.id})
// 優先度: ${s.priority}
// 用途: ${s.usage}
// ==========================================

export const ${s.id.toUpperCase()}_DEFINITION: SoundCandidate = ${JSON.stringify(s, null, 2)};
`;
  };

  const getAllTypesCode = () => {
    return `export type SoundCandidateCategory = 'system' | 'screen' | 'action' | 'wiki' | 'new_high' | 'new_medium' | 'npc_bgm';
export type PriorityLevel = '★★★' | '★★' | '★';

export interface SoundCandidate {
  id: string;
  name: string;
  nameJa: string;
  category: SoundCandidateCategory;
  categoryJa: string;
  priority: PriorityLevel;
  usage: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
  isLooping?: boolean;
  isBgm?: boolean;
  isNew?: boolean;
}

export const SOUND_CANDIDATES: SoundCandidate[] = ${JSON.stringify(SOUND_CANDIDATES, null, 2)};
`;
  };

  const getEngineCode = () => {
    return `// Web Audio API Synthesis Engine for Git Porting
export const PREVIEW_SOUNDS: Record<string, () => void> = {
  // [既存音源 12音]
  cursor_move: () => { ... },
  confirm: () => { ... },
  cancel: () => { ... },
  warning: () => { ... },
  tab_switch: () => { ... },
  modal_open_close: () => { ... },
  dialogue_char: () => { ... },
  new_record: () => { ... },
  chest_open: () => { ... },
  achievement: () => { ... },
  wiki_generating_noise: () => { ... },
  wiki_complete: () => { ... },

  // [新規SE候補 優先度:大 8音]
  footstep: () => { ... },
  hover: () => { ... },
  card_open: () => { ... },
  card_close: () => { ... },
  add: () => { ... },
  save: () => { ... },
  toggle: () => { ... },
  error: () => { ... },

  // [新規SE候補 優先度:中 8音]
  danger_confirm: () => { ... },
  record_select: () => { ... },
  ai_generate_start: () => { ... },
  ai_generate_complete: () => { ... },
  chest_close: () => { ... },
  screen_transition: () => { ... },
  notification: () => { ... },
  input_focus: () => { ... },
};
`;
  };

  const activeContent =
    tab === 'single' && sound
      ? getSingleCode(sound)
      : tab === 'all_types'
      ? getAllTypesCode()
      : getEngineCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="code-inspector-modal"
        className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-slate-700/80 bg-[#090d16] shadow-2xl overflow-hidden text-slate-100"
      >
        {/* モーダルヘッダー */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2D333B] bg-[#14171D]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#4AF626] rounded-sm flex items-center justify-center text-black font-bold text-xs font-mono">
              S2
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E0E2E5] flex items-center gap-2 font-mono">
                CODE_INSPECTOR <span className="text-[#4AF626] text-xs">// GIT_EXPORT</span>
              </h2>
              <p className="text-[11px] text-[#8B949E] font-mono">
                {sound ? `${sound.nameJa} (#${sound.id})` : 'ALL_SOUND_DEFINITIONS'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded border border-[#2D333B] bg-[#1C2128] text-[#8B949E] hover:text-white hover:border-[#4AF626] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="flex items-center justify-between px-6 py-2 bg-[#0F1218] border-b border-[#2D333B] text-xs font-mono">
          <div className="flex items-center gap-2">
            {sound && (
              <button
                onClick={() => setTab('single')}
                className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                  tab === 'single'
                    ? 'bg-[#4AF626] text-black'
                    : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
                }`}
              >
                #{sound.id}
              </button>
            )}
            <button
              onClick={() => setTab('all_types')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                tab === 'all_types'
                  ? 'bg-[#4AF626] text-black'
                  : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
              }`}
            >
              TYPES_ARRAY (31)
            </button>
            <button
              onClick={() => setTab('all_engine')}
              className={`px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                tab === 'all_engine'
                  ? 'bg-[#4AF626] text-black'
                  : 'bg-[#1C2128] text-[#8B949E] hover:text-[#E0E2E5] border border-[#2D333B]'
              }`}
            >
              SOUND_ENGINE_MAP
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#4AF626] hover:bg-[#4AF626]/90 text-black font-bold text-xs transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>COPIED!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>COPY CODE</span>
              </>
            )}
          </button>
        </div>

        {/* コードビュー */}
        <div className="flex-1 p-4 overflow-auto bg-[#0A0B0D]">
          <pre className="text-xs text-[#4AF626]/90 font-mono leading-relaxed p-4 rounded bg-[#0F1218] border border-[#21262D] select-all overflow-x-auto">
            <code>{activeContent}</code>
          </pre>
        </div>

        {/* フッター */}
        <div className="px-6 py-2.5 bg-[#14171D] border-t border-[#2D333B] text-xs text-[#8B949E] flex items-center justify-between font-mono">
          <span className="flex items-center gap-1.5 text-[11px] text-[#4AF626]">
            <Layers className="w-3.5 h-3.5" />
            INTEGRITY: NON-DESTRUCTIVE PASS
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-[#1C2128] hover:bg-[#2D333B] text-[#E0E2E5] text-xs font-medium border border-[#2D333B] cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
