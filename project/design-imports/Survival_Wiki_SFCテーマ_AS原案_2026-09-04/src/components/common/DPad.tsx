import React from 'react';

interface DPadProps {
  onDirection?: (dir: 'up' | 'down' | 'left' | 'right') => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DPad: React.FC<DPadProps> = ({ onDirection, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }[size];

  const handlePress = (dir: 'up' | 'down' | 'left' | 'right') => {
    if (onDirection) onDirection(dir);
  };

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
      {/* Horizontal Bar */}
      <div 
        className="absolute w-full h-[34%] rounded-[3px] border-2 border-[var(--border-dark)] flex justify-between items-center px-1"
        style={{
          backgroundColor: 'var(--dpad-bg)',
          boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.4), inset -1px -1px 0px rgba(0,0,0,0.6), 0 2px 3px rgba(0,0,0,0.35)'
        }}
      >
        <button
          type="button"
          onClick={() => handlePress('left')}
          className="w-4 h-full flex items-center justify-center text-[var(--dpad-highlight)] hover:text-white active:scale-90 transition-transform"
          title="Left"
        >
          ◀
        </button>
        <button
          type="button"
          onClick={() => handlePress('right')}
          className="w-4 h-full flex items-center justify-center text-[var(--dpad-highlight)] hover:text-white active:scale-90 transition-transform"
          title="Right"
        >
          ▶
        </button>
      </div>

      {/* Vertical Bar */}
      <div 
        className="absolute h-full w-[34%] rounded-[3px] border-2 border-[var(--border-dark)] flex flex-col justify-between items-center py-1 z-10"
        style={{
          backgroundColor: 'var(--dpad-bg)',
          boxShadow: 'inset 1px 1px 0px rgba(255,255,255,0.4), inset -1px -1px 0px rgba(0,0,0,0.6)'
        }}
      >
        <button
          type="button"
          onClick={() => handlePress('up')}
          className="h-4 w-full flex items-center justify-center text-[var(--dpad-highlight)] hover:text-white active:scale-90 transition-transform"
          title="Up"
        >
          ▲
        </button>
        {/* Center dimple */}
        <div className="w-3 h-3 rounded-full bg-[#1e1e22] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.9)]" />
        <button
          type="button"
          onClick={() => handlePress('down')}
          className="h-4 w-full flex items-center justify-center text-[var(--dpad-highlight)] hover:text-white active:scale-90 transition-transform"
          title="Down"
        >
          ▼
        </button>
      </div>
    </div>
  );
};
