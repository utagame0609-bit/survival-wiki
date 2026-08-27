const DEFAULT_REVERB = 0.18;
const REVERB_AMOUNT_KEY = 'survival-wiki-se-reverb';
const REVERB_CHANGE_EVENT = 'survival-wiki-reverb-change';

export function getStoredReverbAmount(): number {
  if (typeof window === 'undefined') return DEFAULT_REVERB;
  const stored = window.localStorage.getItem(REVERB_AMOUNT_KEY);
  if (stored === null) return DEFAULT_REVERB;
  const value = Number(stored);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : DEFAULT_REVERB;
}

export function subscribeToReverbAmount(listener: (value: number) => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handleChange = (event: Event) => {
    const value = (event as CustomEvent<number>).detail;
    if (typeof value === 'number' && Number.isFinite(value)) listener(Math.min(1, Math.max(0, value)));
  };
  window.addEventListener(REVERB_CHANGE_EVENT, handleChange);
  return () => window.removeEventListener(REVERB_CHANGE_EVENT, handleChange);
}

function storeReverbAmount(value: number): number {
  const normalized = Math.min(1, Math.max(0, value));
  if (typeof window !== 'undefined') window.localStorage.setItem(REVERB_AMOUNT_KEY, String(normalized));
  return normalized;
}

export function setStoredReverbAmount(value: number): number {
  const normalized = storeReverbAmount(value);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<number>(REVERB_CHANGE_EVENT, { detail: normalized }));
  }
  return normalized;
}
