const STORAGE_KEY = 'survival-wiki:reverb-amount';
let currentReverbAmount = 0.25;

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) {
    const parsed = parseFloat(stored);
    if (!isNaN(parsed)) {
      currentReverbAmount = Math.max(0, Math.min(1, parsed));
    }
  }
} catch {
  // Local storage unavailable
}

const listeners = new Set<(val: number) => void>();

export function getStoredReverbAmount(): number {
  return currentReverbAmount;
}

export function setStoredReverbAmount(amount: number): void {
  currentReverbAmount = Math.max(0, Math.min(1, amount));
  try {
    localStorage.setItem(STORAGE_KEY, String(currentReverbAmount));
  } catch {
    // ignore
  }
  listeners.forEach((fn) => fn(currentReverbAmount));
}

export function subscribeToReverbAmount(listener: (val: number) => void): () => void {
  listeners.add(listener);
  listener(currentReverbAmount);
  return () => listeners.delete(listener);
}
