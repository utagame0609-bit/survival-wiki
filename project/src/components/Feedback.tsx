import { AlertTriangle, Terminal } from 'lucide-react';

export function Spinner({ label = '読み込み中...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 font-mono">
      <div className="relative w-10 h-10 border-2 border-[#1a2333] border-t-[#ffb000] rounded-full animate-spin shadow-[0_0_12px_rgba(255,176,0,0.3)]" />
      <p className="text-xs text-[#ffb000] tracking-widest uppercase animate-pulse">{label}</p>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="my-3 rounded-sm border-2 border-red-500 bg-red-950/40 p-3.5 text-xs text-red-200 flex items-start gap-3 shadow-[0_0_15px_rgba(239,68,68,0.2)] font-mono">
      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-bold text-red-400">SYSTEM ERROR // エラーが発生しました</p>
        <p className="mt-1 text-red-200">{message}</p>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="my-6 rounded-sm border-2 border-dashed border-[#1a2333] bg-[#0d1627]/60 p-8 text-center font-mono">
      <Terminal className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
      <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">{message}</p>
    </div>
  );
}
