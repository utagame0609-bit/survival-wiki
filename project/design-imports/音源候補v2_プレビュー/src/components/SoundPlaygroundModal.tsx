import React, { useState } from 'react';
import {
  playSoundCandidatePreview,
  stopActiveAudio,
} from '../audio/soundEngine';
import {
  X,
  Play,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  FolderPlus,
  Save,
  ToggleLeft,
  ToggleRight,
  Archive,
  ArrowRight,
  Bot,
  Layers,
  Flame,
  ShieldAlert,
} from 'lucide-react';

interface SoundPlaygroundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundPlaygroundModal: React.FC<SoundPlaygroundModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [toggleState, setToggleState] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const [isChestOpen, setIsChestOpen] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<'wikipedia' | 'scp' | 'ancient'>('wikipedia');
  const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'done'>('idle');
  const [dangerConfirmOpen, setDangerConfirmOpen] = useState(false);

  if (!isOpen) return null;

  // AI Wiki生成シミュレーション
  const handleSimulateAiGeneration = () => {
    if (generationState === 'generating') return;

    setGenerationState('generating');
    // 1. 生成開始音
    playSoundCandidatePreview('ai_generate_start');

    // 2. 0.4秒後にNPC専用BGMまたは生成ノイズを開始
    setTimeout(() => {
      playSoundCandidatePreview(`npc_bgm_${selectedPersona}`);
    }, 400);

    // 3. 3.5秒後に生成完了
    setTimeout(() => {
      stopActiveAudio();
      playSoundCandidatePreview('ai_generate_complete');
      setGenerationState('done');
    }, 3600);
  };

  const handleResetGeneration = () => {
    stopActiveAudio();
    playSoundCandidatePreview('cancel');
    setGenerationState('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        id="sound-playground-modal"
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-cyan-800/60 bg-[#070b14] shadow-2xl overflow-hidden text-slate-100"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2D333B] bg-[#14171D]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#4AF626] rounded-sm flex items-center justify-center text-black font-bold text-xs font-mono">
              S2
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#E0E2E5] flex items-center gap-2 font-mono">
                UI_PLAYGROUND <span className="text-[#4AF626] text-xs">// INTERACTION_SANDBOX</span>
              </h2>
              <p className="text-[11px] text-[#8B949E]">
                実機操作を模したUIで、各新旧SE・BGMの繋がりと手触りをテスト可能
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopActiveAudio();
              onClose();
            }}
            className="p-1.5 rounded border border-[#2D333B] bg-[#1C2128] text-[#8B949E] hover:text-white hover:border-[#4AF626] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0A0B0D]">
          {/* 1. ナビゲーション & フォーカス・移動 */}
          <section className="p-4 rounded border border-[#2D333B] bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4AF626] font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                1. NAV & FOCUS [footstep, hover, input_focus, tab_switch]
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => playSoundCandidatePreview('footstep')}
                className="px-3 py-1.5 rounded-sm border border-[#30363D] bg-[#21262D] hover:border-[#4AF626] hover:text-[#4AF626] text-[#E0E2E5] text-xs font-bold transition-all cursor-pointer font-mono"
              >
                👣 #footstep
              </button>

              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => playSoundCandidatePreview('tab_switch')}
                className="px-3 py-1.5 rounded-sm border border-[#30363D] bg-[#21262D] hover:border-[#4AF626] hover:text-[#4AF626] text-[#E0E2E5] text-xs font-medium transition-all cursor-pointer font-mono"
              >
                🔄 #tab_switch
              </button>

              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => playSoundCandidatePreview('screen_transition')}
                className="px-3 py-1.5 rounded-sm border border-[#30363D] bg-[#21262D] hover:border-[#FFB000] hover:text-[#FFB000] text-[#E0E2E5] text-xs font-medium transition-all cursor-pointer font-mono"
              >
                🌌 #screen_transition
              </button>

              <input
                type="text"
                placeholder="フォーカス音テスト (input_focus)"
                onFocus={() => playSoundCandidatePreview('input_focus')}
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                className="flex-1 min-w-[220px] px-3 py-1.5 rounded-sm bg-[#0A0B0D] border border-[#2D333B] text-xs text-[#E0E2E5] placeholder:text-[#8B949E] focus:outline-none focus:border-[#4AF626]"
              />
            </div>
          </section>

          {/* 2. カード展開・トグル・データ操作 */}
          <section className="p-4 rounded border border-[#2D333B] bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4AF626] font-mono flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5" />
                2. CARD & DATA ACTIONS [card_open/close, toggle, add, save]
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* カード展開テスト */}
              <div className="p-3 rounded border border-[#30363D] bg-[#0F1218] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#E0E2E5]">
                    詳細パネル展開
                  </span>
                  <button
                    onMouseEnter={() => playSoundCandidatePreview('hover')}
                    onClick={() => {
                      if (!isCardExpanded) {
                        playSoundCandidatePreview('card_open');
                      } else {
                        playSoundCandidatePreview('card_close');
                      }
                      setIsCardExpanded(!isCardExpanded);
                    }}
                    className="px-2.5 py-1 rounded-sm bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#4AF626] text-xs font-mono cursor-pointer"
                  >
                    {isCardExpanded ? '#card_close' : '#card_open'}
                  </button>
                </div>
                {isCardExpanded && (
                  <div className="p-2 rounded bg-[#0A0B0D] border border-[#21262D] text-[11px] text-[#4AF626] font-mono">
                    ✓ PANEL_EXPANDED: Details loaded
                  </div>
                )}
              </div>

              {/* トグルスイッチ */}
              <div className="p-3 rounded border border-[#30363D] bg-[#0F1218] flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#E0E2E5] block">
                    レトロスイッチ (#toggle)
                  </span>
                  <span className="text-[10px] font-mono text-[#8B949E]">
                    STATE: {toggleState ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>
                <button
                  onMouseEnter={() => playSoundCandidatePreview('hover')}
                  onClick={() => {
                    playSoundCandidatePreview('toggle');
                    setToggleState(!toggleState);
                  }}
                  className="p-1 rounded hover:bg-[#21262D] text-[#4AF626] cursor-pointer"
                >
                  {toggleState ? (
                    <ToggleRight className="w-8 h-8 text-[#4AF626]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-[#8B949E]" />
                  )}
                </button>
              </div>

              {/* 新規登録 / 保存 / チェスト */}
              <div className="sm:col-span-2 flex flex-wrap gap-2.5">
                <button
                  onMouseEnter={() => playSoundCandidatePreview('hover')}
                  onClick={() => playSoundCandidatePreview('add')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#4AF626] border border-[#30363D] text-[#4AF626] text-xs font-mono font-bold cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  #add (新規登録)
                </button>

                <button
                  onMouseEnter={() => playSoundCandidatePreview('hover')}
                  onClick={() => playSoundCandidatePreview('save')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#4AF626] border border-[#30363D] text-[#4AF626] text-xs font-mono font-bold cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  #save (保存完了)
                </button>

                <button
                  onMouseEnter={() => playSoundCandidatePreview('hover')}
                  onClick={() => playSoundCandidatePreview('notification')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#FFB000] border border-[#30363D] text-[#FFB000] text-xs font-mono font-bold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  #notification (通知)
                </button>

                <button
                  onMouseEnter={() => playSoundCandidatePreview('hover')}
                  onClick={() => {
                    if (!isChestOpen) {
                      playSoundCandidatePreview('chest_open');
                    } else {
                      playSoundCandidatePreview('chest_close');
                    }
                    setIsChestOpen(!isChestOpen);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#FFB000] border border-[#30363D] text-[#FFB000] text-xs font-mono font-bold cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5" />
                  {isChestOpen ? '#chest_close' : '#chest_open'}
                </button>
              </div>
            </div>
          </section>

          {/* 3. エラー・警告・危険操作確認 */}
          <section className="p-4 rounded border border-[#2D333B] bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F85149] font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                3. ERROR & SAFETY DIALOG [warning, error, danger_confirm]
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => playSoundCandidatePreview('warning')}
                className="px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#FFB000] border border-[#30363D] text-[#FFB000] text-xs font-mono font-bold cursor-pointer"
              >
                ⚠️ #warning
              </button>

              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => playSoundCandidatePreview('error')}
                className="px-3 py-1.5 rounded-sm bg-[#21262D] hover:border-[#F85149] border border-[#30363D] text-[#F85149] text-xs font-mono font-bold cursor-pointer"
              >
                ❌ #error
              </button>

              <button
                onMouseEnter={() => playSoundCandidatePreview('hover')}
                onClick={() => {
                  playSoundCandidatePreview('danger_confirm');
                  setDangerConfirmOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#F85149]/10 hover:bg-[#F85149]/20 border border-[#F85149]/50 text-[#F85149] text-xs font-mono font-bold cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                🚨 #danger_confirm (危険操作確認)
              </button>
            </div>

            {dangerConfirmOpen && (
              <div className="p-3 rounded border border-[#F85149]/60 bg-[#0A0B0D] text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#F85149] font-medium">
                  <Flame className="w-4 h-4 text-[#F85149]" />
                  <span>【警告】サバイバルログを完全消去しますか？</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      playSoundCandidatePreview('cancel');
                      setDangerConfirmOpen(false);
                    }}
                    className="px-2.5 py-1 rounded bg-[#1C2128] hover:bg-[#2D333B] text-[#8B949E] text-xs font-mono cursor-pointer"
                  >
                    #cancel
                  </button>
                  <button
                    onClick={() => {
                      playSoundCandidatePreview('warning');
                      setDangerConfirmOpen(false);
                    }}
                    className="px-2.5 py-1 rounded bg-[#F85149] text-black font-bold text-xs font-mono cursor-pointer"
                  >
                    EXECUTE
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* 4. AI Wiki生成フロー & NPC BGM シミュレーター */}
          <section className="p-4 rounded border border-[#2D333B] bg-[#161B22] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4AF626] font-mono flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#4AF626]" />
                4. AI WIKI FLOW & NPC BGM [start → loop → complete]
              </span>
            </div>

            {/* 人格セレクター */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  playSoundCandidatePreview('record_select');
                  setSelectedPersona('wikipedia');
                }}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  selectedPersona === 'wikipedia'
                    ? 'border-[#4AF626] bg-[#0A0B0D] text-[#4AF626]'
                    : 'border-[#30363D] bg-[#0F1218] text-[#8B949E] hover:text-[#E0E2E5]'
                }`}
              >
                <div className="font-bold text-xs font-mono">ウタペディア</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">天才民俗学者 (バロック風)</div>
              </button>

              <button
                onClick={() => {
                  playSoundCandidatePreview('record_select');
                  setSelectedPersona('scp');
                }}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  selectedPersona === 'scp'
                    ? 'border-[#4AF626] bg-[#0A0B0D] text-[#4AF626]'
                    : 'border-[#30363D] bg-[#0F1218] text-[#8B949E] hover:text-[#E0E2E5]'
                }`}
              >
                <div className="font-bold text-xs font-mono">SCP FOUNDATION</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">特異点研究員 (インダストリアル)</div>
              </button>

              <button
                onClick={() => {
                  playSoundCandidatePreview('record_select');
                  setSelectedPersona('ancient');
                }}
                className={`p-2.5 rounded border text-left transition-all cursor-pointer ${
                  selectedPersona === 'ancient'
                    ? 'border-[#4AF626] bg-[#0A0B0D] text-[#4AF626]'
                    : 'border-[#30363D] bg-[#0F1218] text-[#8B949E] hover:text-[#E0E2E5]'
                }`}
              >
                <div className="font-bold text-xs font-mono">LOST CHRONICLE</div>
                <div className="text-[10px] text-[#8B949E] mt-0.5">絶望古文書 (哀愁リュート)</div>
              </button>
            </div>

            {/* シミュレーション実行ボタン & 結果 */}
            <div className="p-3 rounded bg-[#0A0B0D] border border-[#21262D] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-[#E0E2E5]">
                  {selectedPersona === 'wikipedia' && 'ウタペディアによる民俗学的解釈記事の生成'}
                  {selectedPersona === 'scp' && 'SCP報告書形式による異常存在プロトコル作成'}
                  {selectedPersona === 'ancient' && '絶望の古文書に滅びの記録を刻印'}
                </div>
                <p className="text-[10px] font-mono text-[#8B949E] mt-0.5">
                  #ai_generate_start → #npc_bgm_{selectedPersona} → #ai_generate_complete
                </p>
              </div>

              <div className="flex items-center gap-2">
                {generationState === 'generating' ? (
                  <button
                    onClick={handleResetGeneration}
                    className="px-3 py-1.5 rounded-sm bg-[#F85149] text-black text-xs font-bold font-mono transition-all animate-pulse cursor-pointer"
                  >
                    STOPPING...
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateAiGeneration}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#4AF626] hover:bg-[#4AF626]/90 text-black text-xs font-bold font-mono cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    RUN AI FLOW
                  </button>
                )}
              </div>
            </div>

            {generationState === 'done' && (
              <div className="p-2.5 rounded border border-[#4AF626]/50 bg-[#4AF626]/10 text-xs text-[#4AF626] font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4AF626] shrink-0" />
                <span>
                  ✓ GENERATION_COMPLETE: #ai_generate_complete triggered
                </span>
              </div>
            )}
          </section>
        </div>

        {/* フッター */}
        <div className="px-6 py-2.5 bg-[#14171D] border-t border-[#2D333B] text-xs text-[#8B949E] flex items-center justify-between font-mono">
          <span className="text-[10px] text-[#4AF626]">
            SANDBOX_ACTIVE // NON-DESTRUCTIVE
          </span>
          <button
            onClick={() => {
              stopActiveAudio();
              onClose();
            }}
            className="px-3 py-1 rounded bg-[#1C2128] hover:bg-[#2D333B] text-[#E0E2E5] text-xs font-medium border border-[#2D333B] cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
