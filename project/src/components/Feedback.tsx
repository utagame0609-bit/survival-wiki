import { Loader2 } from 'lucide-react';

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-stone-400">
      <Loader2 className="w-6 h-6 animate-spin" />
      {label && <p className="mt-2 text-sm">{label}</p>}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mx-4 my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center text-stone-400">
      <p className="text-sm">{message}</p>
    </div>
  );
}
