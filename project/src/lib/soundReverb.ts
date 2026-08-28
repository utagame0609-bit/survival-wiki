const DEFAULT_REVERB = 0.3;
const REVERB_AMOUNT_KEY = 'survival-wiki-se-reverb';
const REVERB_CHANGE_EVENT = 'survival-wiki-reverb-change';

export type SoundReverb = {
  input: GainNode;
  output: GainNode;
  wet: GainNode;
  dry: GainNode;
  setAmount: (value: number) => void;
  getAmount: () => number;
};

let activeReverb: SoundReverb | null = null;

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
  if (activeReverb) activeReverb.setAmount(normalized);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<number>(REVERB_CHANGE_EVENT, { detail: normalized }));
  }
  return normalized;
}

function createImpulseResponse(context: AudioContext): AudioBuffer {
  const duration = 0.32;
  const decay = 2.8;
  const length = Math.floor(context.sampleRate * duration);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      const time = i / context.sampleRate;
      const envelope = Math.pow(1 - time / duration, decay);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
  }

  return impulse;
}

export function createSwitchStyleReverb(context: AudioContext): SoundReverb {
  const input = context.createGain();
  const output = context.createGain();
  const dry = context.createGain();
  const wet = context.createGain();
  const convolver = context.createConvolver();
  const filter = context.createBiquadFilter();

  let amount = getStoredReverbAmount();

  convolver.buffer = createImpulseResponse(context);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(5200, context.currentTime);

  input.connect(dry);
  dry.connect(output);
  input.connect(convolver);
  convolver.connect(filter);
  filter.connect(wet);
  wet.connect(output);

  const applyAmount = () => {
    wet.gain.setTargetAtTime(amount, context.currentTime, 0.015);
    dry.gain.setTargetAtTime(1, context.currentTime, 0.015);
  };

  applyAmount();

  const reverb: SoundReverb = {
    input,
    output,
    wet,
    dry,
    setAmount(value: number) {
      amount = Math.min(1, Math.max(0, value));
      applyAmount();
    },
    getAmount() {
      return amount;
    },
  };

  activeReverb = reverb;
  return reverb;
}
