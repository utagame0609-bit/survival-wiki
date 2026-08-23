export type SoundType = 'tap' | 'select' | 'open' | 'close' | 'confirm' | 'delete';

type SoundProfile = {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  endFrequency?: number;
};

const SOUND_PROFILES: Record<SoundType, SoundProfile> = {
  tap: { frequency: 520, duration: 0.045, volume: 0.035, type: 'sine' },
  select: { frequency: 680, duration: 0.06, volume: 0.04, type: 'sine' },
  open: { frequency: 420, endFrequency: 720, duration: 0.12, volume: 0.045, type: 'sine' },
  close: { frequency: 720, endFrequency: 420, duration: 0.1, volume: 0.04, type: 'sine' },
  confirm: { frequency: 560, endFrequency: 840, duration: 0.14, volume: 0.045, type: 'triangle' },
  delete: { frequency: 360, endFrequency: 220, duration: 0.13, volume: 0.04, type: 'triangle' },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioContextClass = window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return null;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

export function playSound(sound: SoundType): void {
  const context = getAudioContext();
  if (!context) return;

  const profile = SOUND_PROFILES[sound];
  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = profile.type;
  oscillator.frequency.setValueAtTime(profile.frequency, now);

  if (profile.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      profile.endFrequency,
      now + profile.duration,
    );
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(profile.volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + profile.duration + 0.01);
}

export const playTapSound = () => playSound('tap');
export const playSelectSound = () => playSound('select');
export const playOpenSound = () => playSound('open');
export const playCloseSound = () => playSound('close');
export const playConfirmSound = () => playSound('confirm');
export const playDeleteSound = () => playSound('delete');
