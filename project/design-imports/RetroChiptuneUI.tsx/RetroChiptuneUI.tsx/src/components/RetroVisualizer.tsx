import React, { useEffect, useRef, useState } from 'react';
import { getAudioContext } from '../audio/chiptuneEngine';
import { Activity, Radio, Cpu, Sparkles, Monitor } from 'lucide-react';

interface RetroVisualizerProps {
  isPlaying: boolean;
  activeTrackTitle?: string;
  bpm?: number | string;
  sourceType?: 'lyria-ai' | 'chiptune-synth';
}

export const RetroVisualizer: React.FC<RetroVisualizerProps> = ({
  isPlaying,
  activeTrackTitle = 'SYSTEM IDLE // AWAITING AUDIO',
  bpm = 112,
  sourceType = 'lyria-ai',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [visualMode, setVisualMode] = useState<'retro-bars' | 'oscilloscope' | 'neon-matrix'>('retro-bars');
  const [crtEffect, setCrtEffect] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let { analyser } = getAudioContext();
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDomainArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, width, height);

      // Grid Lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!isPlaying) {
        // Subtle resting pulse
        const now = Date.now() * 0.003;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.03 + now) * 4 * Math.sin(now * 0.5);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Idle text overlay
        ctx.fillStyle = '#34d399';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('• 8-BIT AUDIO SYNTHESIZER & LYRIA ENGINE READY •', width / 2, height / 2 - 18);
        return;
      }

      analyser.getByteFrequencyData(dataArray);
      analyser.getByteTimeDomainData(timeDomainArray);

      if (visualMode === 'retro-bars') {
        // Pixel segmented LED retro spectrum in Magenta & Cyan with glow
        const numBars = 36;
        const barWidth = (width - numBars * 3) / numBars;
        const step = Math.floor(bufferLength / numBars);

        for (let i = 0; i < numBars; i++) {
          const value = dataArray[i * step] || 0;
          const percent = value / 255;
          const barHeight = percent * (height - 24);
          const x = i * (barWidth + 3) + 4;

          // Segmented blocks (8-bit style)
          const blockSize = 5;
          const numBlocks = Math.floor(barHeight / blockSize);

          for (let b = 0; b < numBlocks; b++) {
            const blockY = height - 4 - (b + 1) * blockSize;
            const normalizedY = 1 - (b / (height / blockSize));

            // Neon gradient color based on frequency height
            if (normalizedY < 0.35) {
              ctx.fillStyle = '#ff00ff'; // Bright Neon Magenta top peaks
              ctx.shadowColor = '#ff00ff';
              ctx.shadowBlur = 4;
            } else if (normalizedY < 0.7) {
              ctx.fillStyle = '#00f0ff'; // Neon Cyan mids
              ctx.shadowColor = '#00f0ff';
              ctx.shadowBlur = 2;
            } else {
              ctx.fillStyle = '#a855f7'; // Purple low/base
              ctx.shadowColor = 'transparent';
              ctx.shadowBlur = 0;
            }

            ctx.fillRect(x, blockY, barWidth, blockSize - 1.5);
          }
        }
        ctx.shadowBlur = 0;
      } else if (visualMode === 'oscilloscope') {
        // High fidelity pulse oscilloscope wave in neon cyan with glow
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeDomainArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Neon Matrix Waveform
        const barCount = 48;
        const barW = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const freq = dataArray[i * 2] || 0;
          const h = (freq / 255) * (height / 2);
          const cx = i * barW + barW / 2;
          const cy = height / 2;

          ctx.fillStyle = i % 2 === 0 ? '#ff00ff' : '#00f0ff';
          ctx.shadowColor = i % 2 === 0 ? '#ff00ff' : '#00f0ff';
          ctx.shadowBlur = 4;
          ctx.fillRect(cx - barW * 0.35, cy - h, barW * 0.7, h * 2);
        }
        ctx.shadowBlur = 0;
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, visualMode]);

  // Handle auto-resizing canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateDimensions = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = 140;
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div id="retro-visualizer-container" className="relative w-full bg-[#1a0033]/60 border-2 border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)] overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-[#0a001a] border-b-2 border-[#00f0ff]/40 text-xs font-mono text-[#00f0ff]">
        <div className="flex items-center space-x-2">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-[#ff00ff] animate-pulse shadow-[0_0_8px_#ff00ff]' : 'bg-[#1a0033]'}`} />
          <span className="font-bold tracking-wider uppercase text-[11px] text-[#ff00ff] drop-shadow-[0_0_6px_#ff00ff]">
            {sourceType === 'lyria-ai' ? 'LYRIA-3 NEURAL ENGINE' : '2A03 SOUND CHIP SYNTH'}
          </span>
          <span className="text-[#00f0ff]/40">|</span>
          <span className="text-[#00f0ff] truncate max-w-[200px] sm:max-w-xs">{activeTrackTitle}</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-1 text-[10px] text-[#00f0ff] bg-[#1a0033] px-2 py-0.5 border border-[#00f0ff]/40">
            <Cpu className="w-3 h-3 text-[#ff00ff]" />
            <span>BPM: <strong className="text-[#ff00ff]">{bpm}</strong></span>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#050010] p-0.5 border border-[#00f0ff]/40">
            <button
              id="btn-vis-bars"
              onClick={() => setVisualMode('retro-bars')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors ${visualMode === 'retro-bars' ? 'bg-[#ff00ff] text-[#050010] shadow-[0_0_8px_#ff00ff]' : 'text-[#00f0ff] hover:text-[#ff00ff]'}`}
              title="8-Bit LED Spectrum"
            >
              Spectrum
            </button>
            <button
              id="btn-vis-osc"
              onClick={() => setVisualMode('oscilloscope')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors ${visualMode === 'oscilloscope' ? 'bg-[#00f0ff] text-[#050010] shadow-[0_0_8px_#00f0ff]' : 'text-[#00f0ff] hover:text-[#ff00ff]'}`}
              title="Oscilloscope Wave"
            >
              Wave
            </button>
            <button
              id="btn-vis-matrix"
              onClick={() => setVisualMode('neon-matrix')}
              className={`px-2 py-0.5 text-[10px] uppercase font-bold transition-colors ${visualMode === 'neon-matrix' ? 'bg-[#ff00ff] text-[#050010] shadow-[0_0_8px_#ff00ff]' : 'text-[#00f0ff] hover:text-[#ff00ff]'}`}
              title="Synthwave Matrix"
            >
              Matrix
            </button>
          </div>

          <button
            id="btn-toggle-crt"
            onClick={() => setCrtEffect(!crtEffect)}
            className={`p-1 text-xs transition-colors border ${crtEffect ? 'text-[#ff00ff] bg-[#1a0033] border-[#ff00ff]' : 'text-[#00f0ff]/40 border-transparent hover:text-[#00f0ff]'}`}
            title="Toggle CRT Scanline Overlay"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Display */}
      <div className="relative w-full h-[140px] bg-[#050010] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* CRT Scanline Overlay */}
        {crtEffect && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-80" />
        )}
      </div>

      {/* Retro Channel Footer Readout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 bg-[#0a001a] border-t-2 border-[#00f0ff]/30 text-[10px] font-mono text-[#00f0ff]">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-[#ff00ff] shadow-[0_0_6px_#ff00ff]" />
          <span className="text-[#ff00ff] opacity-80">FREQ_RANGE:</span>
          <span className="text-[#00f0ff] font-bold">20HZ - 22KHZ</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          <span className="text-[#ff00ff] opacity-80">CHIP_TYPE:</span>
          <span className="text-[#00f0ff] font-bold">YM2612 / 2A03</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-[#ff00ff] shadow-[0_0_6px_#ff00ff]" />
          <span className="text-[#ff00ff] opacity-80">BIT_DEPTH:</span>
          <span className="text-[#00f0ff] font-bold">12-BIT RESAMPLED</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
          <span className="text-[#ff00ff] opacity-80">ATMOSPHERE:</span>
          <span className="text-[#00f0ff] font-bold">SEAMLESS LOOP</span>
        </div>
      </div>
    </div>
  );
};
