import React, { useState } from 'react';
import { GeneratedTrack, LyriaModelType, PromptPreset } from '../types';
import { RetroSoundFX } from '../audio/chiptuneEngine';
import { 
  Sparkles, 
  Disc, 
  Flame, 
  Music, 
  Sliders, 
  RotateCw, 
  Layers, 
  CheckCircle2, 
  Volume2, 
  Info,
  Zap,
  Wand2,
  ListMusic
} from 'lucide-react';

const PRESET_TEMPLATES: PromptPreset[] = [
  {
    id: 'user-default-prompt',
    title: 'Retro Save Menu & Neon Synthwave (Featured)',
    subtitle: '8-bit chiptune with mysterious atmospheric melody',
    category: 'Save Menu',
    prompt: '8bit chiptune, retro game save menu theme, neon synthwave, mysterious atmospheric, catchy electronic melody, seamless loop, 16bit video game BGM, medium tempo',
    tempo: 'Medium 112 BPM',
    tags: ['8-bit', 'Save Menu', 'Neon Synthwave', 'Atmospheric', 'Loop'],
    recommendedModel: 'lyria-3-clip-preview'
  },
  {
    id: 'safe-room-sanctuary',
    title: 'Memory Card Slot 01: Safe Room',
    subtitle: 'Peaceful resident save sanctuary, calming square wave',
    category: 'Save Menu',
    prompt: 'tranquil 8-bit chiptune, retro game save room theme, gentle soothing square wave melody, warm triangle bass, tape delay, safe sanctuary ambiance, seamless loop, medium tempo 108 BPM',
    tempo: 'Medium 108 BPM',
    tags: ['Save Room', '8-bit', 'Tranquil', 'NES'],
    recommendedModel: 'lyria-3-clip-preview'
  },
  {
    id: 'neon-cyberpunk-bgm',
    title: '16-Bit Cyberpunk Neon Overworld',
    subtitle: 'FM synth brass, outrun retro drums, driving arpeggios',
    category: 'Synthwave',
    prompt: '16-bit video game BGM, neon synthwave, catchy electronic melody, mysterious atmospheric pads, Yamaha YM2612 FM synthesis, analog synthesizer bass, medium tempo, seamless loop',
    tempo: 'Medium 118 BPM',
    tags: ['16-bit', 'FM Synth', 'Synthwave', 'Overworld'],
    recommendedModel: 'lyria-3-pro-preview'
  },
  {
    id: 'mysterious-crystal-dungeon',
    title: 'Crystal Cavern Dungeon Rest Point',
    subtitle: 'Shimmering glass arpeggios, atmospheric pulse waves',
    category: 'Dungeon',
    prompt: '8-bit chiptune, mysterious atmospheric video game dungeon save point theme, sparkling glass bell arpeggios, pulsing pulse wave chords, subtle reverb, medium tempo, seamless video game loop',
    tempo: 'Medium 105 BPM',
    tags: ['Dungeon', 'Mysterious', 'Chiptune', '8-bit'],
    recommendedModel: 'lyria-3-clip-preview'
  },
  {
    id: 'cozy-rpg-inn',
    title: 'Cozy Pixel Village Inn & Save Haven',
    subtitle: 'Warm nostalgic 8-bit lullaby, comforting melody',
    category: 'Cozy',
    prompt: 'nostalgic 8-bit RPG inn music, retro game menu theme, warm acoustic-style square wave, cozy village save point, cheerful yet relaxing electronic melody, medium tempo 100 BPM, seamless loop',
    tempo: 'Medium 100 BPM',
    tags: ['Cozy RPG', 'Inn Theme', 'Nostalgic', 'Loop'],
    recommendedModel: 'lyria-3-clip-preview'
  },
  {
    id: 'arcade-boss-rush',
    title: '16-Bit Arcade Stage Select',
    subtitle: 'High energy chiptune, fast arpeggios, punchy beats',
    category: 'Action',
    prompt: '16-bit arcade title screen and stage select theme, punchy retro drums, fast catchy electronic synthesizer melody, neon synthwave bassline, medium fast tempo, loopable video game BGM',
    tempo: 'Medium-Fast 128 BPM',
    tags: ['Arcade', 'Stage Select', '16-bit', 'Catchy'],
    recommendedModel: 'lyria-3-clip-preview'
  }
];

interface LyriaGeneratorProps {
  onTrackGenerated: (track: GeneratedTrack) => void;
  onPreviewPlay?: (audioUrl: string, title: string) => void;
}

export const LyriaGenerator: React.FC<LyriaGeneratorProps> = ({ onTrackGenerated }) => {
  const [prompt, setPrompt] = useState<string>(
    '8bit chiptune, retro game save menu theme, neon synthwave, mysterious atmospheric, catchy electronic melody, seamless loop, 16bit video game BGM, medium tempo'
  );
  const [model, setModel] = useState<LyriaModelType>('lyria-3-clip-preview');
  const [tempo, setTempo] = useState<string>('Medium 112 BPM');
  const [mood, setMood] = useState<string>('Mysterious Atmospheric');
  const [isSeamlessLoop, setIsSeamlessLoop] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState<boolean>(false);
  const [customSuggestions, setCustomSuggestions] = useState<any[]>([]);

  const handleSelectPreset = (preset: PromptPreset) => {
    RetroSoundFX.playMenuCursor();
    setPrompt(preset.prompt);
    setTempo(preset.tempo);
    setModel(preset.recommendedModel);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    RetroSoundFX.playMenuConfirm();
    setIsGenerating(true);
    setErrorMessage(null);

    // Dynamic generation progress messages
    const steps = [
      'INITIALIZING LYRIA AUDIO ENGINE...',
      'SYNTHESIZING 8-BIT & 16-BIT WAVEFORMS...',
      'HARMONIZING RETRO SAVE MENU ATMOSPHERE...',
      'ENCODING SEAMLESS LOOPING WAV DATA...'
    ];

    let stepIdx = 0;
    setGenerationStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 2800);

    try {
      const res = await fetch('/api/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          model,
          tempo,
          mood,
          isLoop: isSeamlessLoop
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate music');
      }

      // Convert base64 audio to object URL
      const binary = atob(data.audioBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const mimeType = data.mimeType || 'audio/wav';
      const blob = new Blob([bytes], { type: mimeType });
      const audioUrl = URL.createObjectURL(blob);

      // Create new track record
      const newTrack: GeneratedTrack = {
        id: `track-${Date.now()}`,
        title: extractTrackTitle(prompt),
        prompt: data.prompt || prompt,
        model,
        audioUrl,
        audioBlob: blob,
        mimeType,
        lyrics: data.lyrics,
        createdAt: Date.now(),
        tags: ['Lyria AI', model === 'lyria-3-clip-preview' ? 'Clip (30s)' : 'Pro Track', tempo.split(' ')[0], mood.split(' ')[0]],
        tempo,
        source: 'lyria-ai'
      };

      RetroSoundFX.playSaveChime();
      onTrackGenerated(newTrack);
    } catch (err: any) {
      console.error('Generation Error:', err);
      RetroSoundFX.playMenuCancel();
      setErrorMessage(err.message || 'An error occurred during Lyria music generation.');
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleFetchAiSuggestions = async () => {
    try {
      setSuggesting(true);
      RetroSoundFX.playMenuCursor();
      const res = await fetch('/api/suggest-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'save_menu_synthwave' })
      });
      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        setCustomSuggestions(data.suggestions);
        RetroSoundFX.playItemGet();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSuggesting(false);
    }
  };

  function extractTrackTitle(text: string): string {
    const firstPart = text.split(',')[0].trim();
    if (firstPart.length > 3 && firstPart.length < 35) {
      return firstPart.toUpperCase();
    }
    return 'SAVE MENU SYNTHWAVE THEME';
  }

  return (
    <div id="lyria-generator-panel" className="bg-[#1a0033]/50 border-2 border-[#00f0ff] p-5 shadow-[0_0_20px_rgba(0,240,255,0.2)] text-[#00f0ff]">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b-2 border-[#00f0ff]/40">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#0a001a] text-[#ff00ff] border-2 border-[#ff00ff] shadow-[0_0_8px_#ff00ff]">
              <Disc className="w-5 h-5 animate-[spin_6s_linear_infinite]" />
            </span>
            <h2 className="text-lg font-bold tracking-[0.15em] text-[#ff00ff] font-mono drop-shadow-[0_0_8px_#ff00ff] flex items-center gap-2">
              [ NEURAL MUSIC SYNTHESIZER ]
              <span className="text-[10px] uppercase px-2 py-0.5 bg-[#0a001a] text-[#00f0ff] border border-[#00f0ff]/60">
                GOOGLE LYRIA-3
              </span>
            </h2>
          </div>
          <p className="text-xs text-[#00f0ff]/80 mt-1 font-mono">
            Synthesize authentic 8-bit chiptune, 16-bit video game BGM, and neon synthwave audio loops using <code className="text-[#ff00ff]">lyria-3-clip-preview</code> and <code className="text-[#ff00ff]">lyria-3-pro-preview</code>.
          </p>
        </div>

        <button
          id="btn-ai-suggest-prompts"
          onClick={handleFetchAiSuggestions}
          disabled={suggesting}
          className="flex items-center space-x-1.5 text-xs font-mono font-bold px-3 py-1.5 bg-[#0a001a] hover:bg-[#1a0033] text-[#00f0ff] hover:text-[#ff00ff] border-2 border-[#00f0ff]/60 hover:border-[#ff00ff] transition-all"
          title="Ask Gemini for retro music prompt inspirations"
        >
          <Wand2 className={`w-3.5 h-3.5 ${suggesting ? 'animate-spin' : ''}`} />
          <span>{suggesting ? 'IDEATING...' : '[ F4 ] AI PROMPT IDEAS'}</span>
        </button>
      </div>

      {/* Preset Bank Carousel */}
      <div className="mb-5">
        <label className="block text-[11px] font-mono uppercase tracking-wider text-[#ff00ff] mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ListMusic className="w-3.5 h-3.5 text-[#00f0ff]" />
            CURATED RETRO PRESETS & SAVE MENU THEMES
          </span>
          <span className="text-[10px] text-[#00f0ff]/60">[ 1-CLICK LOAD ]</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_TEMPLATES.map((preset) => {
            const isSelected = prompt === preset.prompt;
            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3 border-2 transition-all ${
                  isSelected
                    ? 'bg-[#1a0033] border-[#ff00ff] shadow-[0_0_12px_rgba(255,0,255,0.4)] text-white'
                    : 'bg-[#0a001a] border-[#00f0ff]/40 hover:border-[#ff00ff] text-[#00f0ff] hover:bg-[#1a0033]/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold font-mono">
                  <span className={`truncate ${isSelected ? 'text-[#ff00ff]' : 'text-[#00f0ff]'}`}>{preset.title}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#ff00ff] flex-shrink-0" />}
                </div>
                <p className="text-[11px] text-[#00f0ff]/70 line-clamp-1 mt-0.5">{preset.subtitle}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {preset.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-[#050010] text-[#00f0ff]/70 border border-[#00f0ff]/30 font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* AI Suggested Prompts (if fetched) */}
        {customSuggestions.length > 0 && (
          <div className="mt-3 p-3 bg-[#0a001a] border-2 border-[#ff00ff]/40">
            <div className="text-[11px] font-mono text-[#ff00ff] font-bold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              GEMINI GENERATED RETRO INSPIRATIONS:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {customSuggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    RetroSoundFX.playMenuCursor();
                    setPrompt(s.prompt);
                    if (s.tempo) setTempo(s.tempo);
                  }}
                  className="text-left p-2.5 bg-[#050010] border border-[#00f0ff]/50 hover:border-[#ff00ff] text-xs font-mono text-[#00f0ff] transition-colors"
                >
                  <strong className="text-[#ff00ff] block mb-0.5">{s.title}</strong>
                  <span className="text-[10px] text-[#00f0ff]/70 line-clamp-2">{s.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Prompt Input Area */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-mono uppercase tracking-wider text-[#ff00ff] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            MUSIC GENERATION PROMPT
          </label>
          <span className="text-[10px] font-mono text-[#00f0ff]/60">
            {prompt.length} CHARS
          </span>
        </div>
        <textarea
          id="music-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="w-full bg-[#0a001a] border-2 border-[#00f0ff]/60 focus:border-[#ff00ff] focus:shadow-[0_0_15px_rgba(255,0,255,0.3)] p-3 text-xs font-mono text-[#00f0ff] placeholder-[#00f0ff]/40 outline-none transition-all resize-none"
          placeholder="Describe your 8-bit chiptune or 16-bit video game music (e.g. 8bit chiptune, retro game save menu theme, neon synthwave, mysterious atmospheric, catchy electronic melody, seamless loop, 16bit video game BGM, medium tempo)..."
        />
      </div>

      {/* Control Knobs & Settings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {/* Model Selection */}
        <div className="bg-[#0a001a] p-2.5 border-2 border-[#00f0ff]/40">
          <label className="block text-[10px] font-mono uppercase text-[#ff00ff] mb-1">
            LYRIA MODEL
          </label>
          <select
            id="select-lyria-model"
            value={model}
            onChange={(e) => {
              RetroSoundFX.playMenuCursor();
              setModel(e.target.value as LyriaModelType);
            }}
            className="w-full bg-[#050010] border border-[#00f0ff]/60 p-1.5 text-xs font-mono text-[#00f0ff] outline-none focus:border-[#ff00ff]"
          >
            <option value="lyria-3-clip-preview">lyria-3-clip-preview (Clip ~30s)</option>
            <option value="lyria-3-pro-preview">lyria-3-pro-preview (Full Track)</option>
          </select>
          <span className="text-[9px] text-[#00f0ff]/60 block mt-1">
            {model === 'lyria-3-clip-preview' ? '⚡ Fast short game clip & loop' : '🎶 High fidelity studio track'}
          </span>
        </div>

        {/* Tempo Selection */}
        <div className="bg-[#0a001a] p-2.5 border-2 border-[#00f0ff]/40">
          <label className="block text-[10px] font-mono uppercase text-[#ff00ff] mb-1">
            TEMPO / SPEED
          </label>
          <select
            id="select-tempo"
            value={tempo}
            onChange={(e) => {
              RetroSoundFX.playMenuCursor();
              setTempo(e.target.value);
            }}
            className="w-full bg-[#050010] border border-[#00f0ff]/60 p-1.5 text-xs font-mono text-[#00f0ff] outline-none focus:border-[#ff00ff]"
          >
            <option value="Slow 92 BPM">Slow 92 BPM (Calm Ambient)</option>
            <option value="Medium 112 BPM">Medium 112 BPM (Save Menu)</option>
            <option value="Medium-Fast 128 BPM">Medium-Fast 128 BPM (Overworld)</option>
            <option value="Fast 148 BPM">Fast 148 BPM (Arcade Action)</option>
          </select>
          <span className="text-[9px] text-[#00f0ff]/60 block mt-1">Rhythmic meter & pacing</span>
        </div>

        {/* Mood Profile */}
        <div className="bg-[#0a001a] p-2.5 border-2 border-[#00f0ff]/40">
          <label className="block text-[10px] font-mono uppercase text-[#ff00ff] mb-1">
            ATMOSPHERE & MOOD
          </label>
          <select
            id="select-mood"
            value={mood}
            onChange={(e) => {
              RetroSoundFX.playMenuCursor();
              setMood(e.target.value);
            }}
            className="w-full bg-[#050010] border border-[#00f0ff]/60 p-1.5 text-xs font-mono text-[#00f0ff] outline-none focus:border-[#ff00ff]"
          >
            <option value="Mysterious Atmospheric">Mysterious Atmospheric</option>
            <option value="Tranquil Save Haven">Tranquil Save Haven</option>
            <option value="Neon Cyberpunk Synthwave">Neon Cyberpunk Synthwave</option>
            <option value="Catchy Electronic Melodic">Catchy Electronic Melodic</option>
            <option value="Nostalgic 8-Bit NES">Nostalgic 8-Bit NES</option>
          </select>
          <span className="text-[9px] text-[#00f0ff]/60 block mt-1">Instrument tone & vibe</span>
        </div>

        {/* Seamless Loop Toggle */}
        <div className="bg-[#0a001a] p-2.5 border-2 border-[#00f0ff]/40 flex flex-col justify-between">
          <label className="block text-[10px] font-mono uppercase text-[#ff00ff] mb-1">
            LOOP CONFIGURATION
          </label>
          <button
            id="btn-toggle-seamless-loop"
            type="button"
            onClick={() => {
              RetroSoundFX.playMenuCursor();
              setIsSeamlessLoop(!isSeamlessLoop);
            }}
            className={`w-full py-1.5 px-2 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors border ${
              isSeamlessLoop
                ? 'bg-[#1a0033] text-[#00f0ff] border-[#00f0ff] shadow-[0_0_8px_#00f0ff]'
                : 'bg-[#050010] text-[#00f0ff]/60 border-[#00f0ff]/30'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${isSeamlessLoop ? 'text-[#ff00ff]' : 'text-[#00f0ff]/40'}`} />
            <span>{isSeamlessLoop ? 'SEAMLESS LOOP: ON' : 'SINGLE PLAY: OFF'}</span>
          </button>
          <span className="text-[9px] text-[#00f0ff]/60 block mt-1">Optimized for video game BGM</span>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-[#1a0033] border-2 border-[#ff00ff] text-white text-xs font-mono flex items-start gap-2 shadow-[0_0_12px_rgba(255,0,255,0.4)]">
          <Info className="w-4 h-4 text-[#ff00ff] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block text-[#ff00ff] font-bold mb-0.5">GENERATION NOTICE</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Generation Trigger Button */}
      <button
        id="btn-generate-lyria-music"
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className={`w-full py-4 px-6 font-mono text-sm font-bold tracking-[0.2em] uppercase transition-all flex items-center justify-center gap-2 border-2 ${
          isGenerating
            ? 'bg-[#1a0033] text-[#ff00ff] border-[#ff00ff] cursor-wait shadow-[0_0_15px_rgba(255,0,255,0.4)] animate-pulse'
            : 'bg-[#ff00ff] text-[#050010] border-[#ff00ff] hover:bg-[#00f0ff] hover:border-[#00f0ff] hover:text-[#050010] shadow-[0_0_20px_rgba(255,0,255,0.4)] cursor-pointer'
        }`}
      >
        {isGenerating ? (
          <>
            <RotateCw className="w-4 h-4 animate-spin text-[#ff00ff]" />
            <span>{generationStep || 'INITIALIZING NEURAL TRANSMISSION...'}</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-[#050010] fill-current" />
            <span>CONTINUE JOURNEY // SYNTHESIZE RETRO TRACK</span>
          </>
        )}
      </button>
    </div>
  );
};
