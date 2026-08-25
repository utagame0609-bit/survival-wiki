import { AlertTriangle, Loader2, Sparkles } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center text-[#ffb000]">
      <Loader2 className="w-8 h-8 animate-spin text-[#ffb000] mb-3" />
      {label && <p className="font-dot text-sm tracking-wide font-mono">{label}...</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 my-3 p-3.5 rounded-sm bg-red-950/80 border-2 border-red-700 text-red-200 text-xs font-mono flex items-start gap-2.5 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <span className="font-bold text-red-300 font-dot">【SYSTEM ERROR】</span> {message}
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="my-8 mx-auto max-w-md p-8 rounded-sm border-2 border-dashed border-[#1a2333] bg-[#0d1627] text-center text-zinc-400 flex flex-col items-center justify-center">
      <div className="w-12 h-12 rounded-sm bg-[#1a2333] border border-[#334155] flex items-center justify-center text-[#ffb000] mb-3">
        <Sparkles className="w-6 h-6" />
      </div>
      <p className="font-dot text-sm text-zinc-300 leading-relaxed max-w-xs">{message}</p>
    </div>
  );
}
