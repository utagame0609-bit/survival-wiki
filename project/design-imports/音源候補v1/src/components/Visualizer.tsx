import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { Activity, BarChart2, Radio } from 'lucide-react';

export const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'wave' | 'spectrum'>('wave');
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animIdRef.current = requestAnimationFrame(render);

      const analyser = soundEngine.getAnalyser();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      for (let x = 0; x < width; x += 30) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Center baseline
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!analyser) {
        // Idle line
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      if (mode === 'wave') {
        const bufferLength = analyser.fftSize;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);

        ctx.lineWidth = 2.5;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#00e5ff');
        gradient.addColorStop(0.5, '#7000ff');
        gradient.addColorStop(1, '#ff0055');
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Glow layer
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00e5ff';
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 48;
        const barWidth = (width / barCount) - 2;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] || 0;
          const barHeight = (value / 255) * (height - 12);
          const x = i * (barWidth + 2);
          const y = height - barHeight;

          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, '#00e5ff');
          grad.addColorStop(0.6, '#a855f7');
          grad.addColorStop(1, '#ff0055');

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top peak dot
          if (barHeight > 4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y - 2, barWidth, 2);
          }
        }
      }
    };

    render();

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
    };
  }, [mode]);

  return (
    <div id="visualizer-container" className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </div>
          <span className="text-xs font-mono tracking-wider font-semibold text-slate-300 uppercase">
            Realtime Oscilloscope / Spectrum
          </span>
        </div>

        <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800 text-xs">
          <button
            id="vis-mode-wave-btn"
            onClick={() => setMode('wave')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              mode === 'wave'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            波形 (Wave)
          </button>
          <button
            id="vis-mode-spec-btn"
            onClick={() => setMode('spectrum')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
              mode === 'spectrum'
                ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            周波数 (Spectrum)
          </button>
        </div>
      </div>

      <div className="w-full relative h-28 rounded-xl overflow-hidden border border-slate-800/80 bg-[#070b12]">
        <canvas
          ref={canvasRef}
          width={800}
          height={112}
          className="w-full h-full block"
        />
        <div className="absolute bottom-2 right-3 flex items-center gap-2 pointer-events-none">
          <span className="text-[10px] font-mono text-cyan-400/60 flex items-center gap-1">
            <Radio className="w-3 h-3" /> Web Audio Engine Active (44.1kHz / 16-bit Emulation)
          </span>
        </div>
      </div>
    </div>
  );
};
