import React from 'react';

interface ABXYClusterProps {
  onA?: () => void;
  onB?: () => void;
  onX?: () => void;
  onY?: () => void;
  size?: 'sm' | 'md';
  labels?: {
    a?: string;
    b?: string;
    x?: string;
    y?: string;
  };
  className?: string;
}

export const ABXYCluster: React.FC<ABXYClusterProps> = ({
  onA,
  onB,
  onX,
  onY,
  size = 'md',
  labels = { a: 'A', b: 'B', x: 'X', y: 'Y' },
  className = '',
}) => {
  const btnSize = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  const containerSize = size === 'sm' ? 'w-20 h-20' : 'w-24 h-24';

  return (
    <div 
      className={`relative ${containerSize} rounded-full bg-[var(--surface-recessed)] border border-[var(--border-main)] flex items-center justify-center shadow-[inset_1px_1px_3px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* X Button (Top - Blue) */}
      <button
        type="button"
        onClick={onX}
        className={`absolute top-1 left-1/2 -translate-x-1/2 ${btnSize} rounded-full sfc-btn sfc-btn-convex sfc-btn-x font-dot flex items-center justify-center`}
        title={`X: ${labels.x}`}
      >
        <span>{labels.x}</span>
      </button>

      {/* Y Button (Left - Yellow) */}
      <button
        type="button"
        onClick={onY}
        className={`absolute left-1 top-1/2 -translate-y-1/2 ${btnSize} rounded-full sfc-btn sfc-btn-convex sfc-btn-y font-dot flex items-center justify-center`}
        title={`Y: ${labels.y}`}
      >
        <span>{labels.y}</span>
      </button>

      {/* A Button (Right - Red) */}
      <button
        type="button"
        onClick={onA}
        className={`absolute right-1 top-1/2 -translate-y-1/2 ${btnSize} rounded-full sfc-btn sfc-btn-convex sfc-btn-a font-dot flex items-center justify-center`}
        title={`A: ${labels.a}`}
      >
        <span>{labels.a}</span>
      </button>

      {/* B Button (Bottom - Green) */}
      <button
        type="button"
        onClick={onB}
        className={`absolute bottom-1 left-1/2 -translate-x-1/2 ${btnSize} rounded-full sfc-btn sfc-btn-convex sfc-btn-b font-dot flex items-center justify-center`}
        title={`B: ${labels.b}`}
      >
        <span>{labels.b}</span>
      </button>
    </div>
  );
};
