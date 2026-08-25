import { AlertTriangle } from 'lucide-react';

export function Spinner({ label = '読み込み中...' }: { label?: string }) {
  return (
    <div className="my-8 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-4 h-10 w-10">
        <div className="absolute inset-0 animate-ping rounded-[2px] border-2 border-emerald-400/50" />
        <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border-2 border-emerald-400 bg-[#0c1424] font-pixel text-xs text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
          ■
        </div>
      </div>
      <div className="font-dot text-sm font-bold tracking-widest text-emerald-400/90 animate-pulse">
        {label}
      </div>
      <div className="mt-1 font-pixel text-[9px] tracking-widest text-slate-500">PLEASE WAIT...</div>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="my-4 rounded-[2px] border-2 border-rose-500/70 bg-rose-950/40 p-4 shadow-[0_0_20px_rgba(244,63,94,0.15)]">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border border-rose-500 bg-rose-900/60 text-rose-300">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-pixel text-[9px] tracking-wider text-rose-400">SYSTEM ERROR</div>
          <div className="mt-0.5 font-dot text-sm text-rose-200">{message}</div>
        </div>
      </div>
    </div>
  );
}
