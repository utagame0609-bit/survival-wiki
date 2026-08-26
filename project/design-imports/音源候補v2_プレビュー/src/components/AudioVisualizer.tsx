import React, { useEffect, useRef } from 'react';
import { getAnalyser } from '../audio/soundEngine';
import { Activity, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  activeId: string | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying, activeId }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localAnalyser = getAnalyser();

    const draw = () => {
      animIdRef.current = requestAnimationFrame(draw);
      localAnalyser = getAnalyser();

      const width = canvas.width;
      const height = canvas.height;

      // 暗めのサイバー背景
      ctx.fillStyle = '#0A0B0D';
      ctx.fillRect(0, 0, width, height);

      // グリッド線
      ctx.strokeStyle = 'rgba(74, 246, 38, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (!localAnalyser) {
        // アイドル時のフラットライン
        ctx.strokeStyle = '#2D333B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = localAnalyser.frequencyBinCount;
      const timeData = new Uint8Array(bufferLength);
      const freqData = new Uint8Array(bufferLength);

      localAnalyser.getByteTimeDomainData(timeData);
      localAnalyser.getByteFrequencyData(freqData);

      // 1. 周波数スペクトラム・バー (VUメーターグラデーション)
      const barCount = 32;
      const barWidth = (width / barCount) - 2;
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.7);
        const val = freqData[dataIndex] || 0;
        const barHeight = (val / 255) * (height * 0.75);

        if (barHeight > 2) {
          const isHigh = i > barCount * 0.75;
          const isMid = i > barCount * 0.4;

          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          if (isHigh) {
            grad.addColorStop(0, 'rgba(248, 81, 73, 0.2)');
            grad.addColorStop(1, 'rgba(248, 81, 73, 0.85)');
          } else if (isMid) {
            grad.addColorStop(0, 'rgba(255, 176, 0, 0.2)');
            grad.addColorStop(1, 'rgba(255, 176, 0, 0.85)');
          } else {
            grad.addColorStop(0, 'rgba(74, 246, 38, 0.2)');
            grad.addColorStop(1, 'rgba(74, 246, 38, 0.85)');
          }

          ctx.fillStyle = grad;
          ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);

          // ピークドット
          ctx.fillStyle = isHigh ? '#f85149' : isMid ? '#ffb000' : '#4af626';
          ctx.fillRect(i * (barWidth + 2), height - barHeight - 2, barWidth, 2);
        }
      }

      // 2. オシロスコープ波形 (サイバーグリーン)
      ctx.lineWidth = 2;
      ctx.strokeStyle = isPlaying ? '#4AF626' : '#2D333B';
      ctx.shadowBlur = isPlaying ? 8 : 0;
      ctx.shadowColor = '#4AF626';

      ctx.beginPath();
      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // リセット
    };

    draw();

    return () => {
      if (animIdRef.current) {
        cancelAnimationFrame(animIdRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div
      id="sound-visualizer-container"
      className="relative w-full rounded-md border border-[#2D333B] bg-[#14171D] p-3.5 shadow-xl overflow-hidden"
    >
      {/* 上部ステータスバー */}
      <div className="flex items-center justify-between mb-2 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1C2128] border border-[#2D333B] text-[#4AF626]">
            <Radio className={`w-3.5 h-3.5 ${isPlaying ? 'text-[#4AF626] animate-pulse' : 'text-[#8B949E]'}`} />
            <span className="font-bold tracking-wider text-[10px]">DSP_MONITOR</span>
          </div>
          <span className="text-[#8B949E] text-[11px]">
            {activeId ? (
              <span className="text-[#4AF626] font-bold bg-[#161B22] px-2 py-0.5 rounded border border-[#30363D]">
                ACTIVE: {activeId}
              </span>
            ) : (
              <span className="text-[#8B949E]">STANDBY // READY</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-[#8B949E]">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-[#4AF626]" />
            16-BIT REALTIME DSP
          </span>
          <span className="text-[#2D333B]">|</span>
          <span className="text-[#4AF626]">WEB AUDIO SYNTH</span>
        </div>
      </div>

      {/* キャンバス */}
      <div className="relative w-full h-20 rounded overflow-hidden border border-[#2D333B] bg-[#0A0B0D]">
        <canvas
          ref={canvasRef}
          width={640}
          height={80}
          className="w-full h-full block"
        />
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-30" />

        {/* 基準線ラベル */}
        <div className="absolute left-2 top-1.5 text-[9px] font-mono text-[#4AF626]/50 select-none">
          +1.0 FS
        </div>
        <div className="absolute left-2 bottom-1.5 text-[9px] font-mono text-[#4AF626]/50 select-none">
          -1.0 FS
        </div>
        <div className="absolute right-2 top-1.5 text-[9px] font-mono text-[#8B949E]/70 select-none">
          128-FFT DUAL-PLANE
        </div>
      </div>
    </div>
  );
};
