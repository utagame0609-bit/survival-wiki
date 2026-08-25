import { AlertCircle, Compass, Loader2 } from 'lucide-react';

export function Spinner({ label = '読み込み中...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center font-mono">
      <div className="relative mb-3 flex h-12 w-12 items-center justify-center rounded-sm border-2 border-amber-500/40 bg-[#0d1627]">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
      <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-sm border-2 border-rose-500/60 bg-rose-950/40 p-4 font-mono text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)] flex items-start gap-3">
      <AlertCircle className="h-5 w-5 shrink-0 text-rose-400 mt-0.5" />
      <div className="text-xs leading-relaxed break-words">
        <strong className="block font-bold text-rose-300 mb-1">[SYSTEM ALERT // ERROR]</strong>
        {message}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="my-6 rounded-sm border-2 border-[#1a2333] bg-[#0d1627] p-8 text-center font-mono shadow-md">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-sm border border-slate-700 bg-[#050a14] text-slate-500">
        <Compass className="h-6 w-6 text-amber-500/50" />
      </div>
      <p className="text-xs sm:text-sm font-bold text-slate-300 leading-relaxed max-w-md mx-auto">{message}</p>
    </div>
  );
}
