export type SoundType =
  | 'confirm'
  | 'cancel'
  | 'hover'
  | 'tabSwitch'
  | 'footstep'
  | 'cardOpen'
  | 'cardClose'
  | 'modalOpen'
  | 'modalClose'
  | 'add'
  | 'save'
  | 'delete'
  | 'toggle'
  | 'error';

type SoundProfile = {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
  endFrequency?: number;
  secondFrequency?: number;
  secondDelay?: number;
};

const SOUND_PROFILES: Record<SoundType, SoundProfile> = {
  confirm: {
    frequency: 880,
    endFrequency: 440,
    duration: 0.08,
    volume: 0.15,
    type: 'sine',
  },
  cancel: {
    frequency: 440,
    endFrequency: 220,
    duration: 0.1,
    volume: 0.12,
    type: 'sine',
  },
  hover: {
    frequency: 1200,
    endFrequency: 600,
    duration: 0.03,
    volume: 0.05,
    type: 'triangle',
  },
  tabSwitch: {
    frequency: 320,
    endFrequency: 640,
    duration: 0.06,
    volume: 0.18,
    type: 'triangle',
  },
  footstep: {
    frequency: 700,
    duration: 0.08,
    volume: 0.22,
    type: 'sine',
  },
  cardOpen: {
    frequency: 250,
    endFrequency: 500,
    duration: 0.09,
    volume: 0.15,
    type: 'sine',
  },
  cardClose: {
    frequency: 450,
    endFrequency: 200,
    duration: 0.07,
    volume: 0.12,
    type: 'sine',
  },
  modalOpen: {
    frequency: 523.25,
    duration: 0.14,
    volume: 0.12,
    type: 'sine',
    secondFrequency: 659.25,
    secondDelay: 0.05,
  },
  modalClose: {
    frequency: 659.25,
    duration: 0.1,
    volume: 0.1,
    type: 'sine',
    secondFrequency: 440,
    secondDelay: 0.04,
  },
  add: {
    frequency: 587.33,
    duration: 0.18,
    volume: 0.15,
    type: 'sine',
    secondFrequency: 880,
    secondDelay: 0.07,
  },
  save: {
    frequency: 783.99,
    duration: 0.11,
    volume: 0.12,
    type: 'sine',
    secondFrequency: 1046.5,
    secondDelay: 0.06,
  },
  delete: {
    frequency: 220,
    endFrequency: 110,
    duration: 0.12,
    volume: 0.15,
    type: 'triangle',
  },
  toggle: {
    frequency: 900,
    endFrequency: 300,
    duration: 0.02,
    volume: 0.08,
    type: 'square',
  },
  error: {
    frequency: 180,
    endFrequency: 110,
    duration: 0.15,
    volume: 0.15,
    type: 'sawtooth',
  },
};

let audioContext: AudioContext | null = null;
let enabled = true;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return null;

    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function playTone(profile: SoundProfile): void {
  const context = getAudioContext();

  if (!context) return;

  if (context.state === 'suspended') {
    void context.resume();
  }

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
  gain.gain.exponentialRampToValueAtTime(
    profile.volume,
    now + 0.008,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    now + profile.duration,
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + profile.duration + 0.01);

  if (
    profile.secondFrequency !== undefined &&
    profile.secondDelay !== undefined
  ) {
    const secondOscillator = context.createOscillator();
    const secondGain = context.createGain();

    const secondStart = now + profile.secondDelay;
    const secondDuration = Math.max(
      0.04,
      profile.duration - profile.secondDelay,
    );

    secondOscillator.type = profile.type;
    secondOscillator.frequency.setValueAtTime(
      profile.secondFrequency,
      secondStart,
    );

    secondGain.gain.setValueAtTime(0.0001, secondStart);
    secondGain.gain.exponentialRampToValueAtTime(
      profile.volume,
      secondStart + 0.008,
    );
    secondGain.gain.exponentialRampToValueAtTime(
      0.0001,
      secondStart + secondDuration,
    );

    secondOscillator.connect(secondGain);
    secondGain.connect(context.destination);

    secondOscillator.start(secondStart);
    secondOscillator.stop(
      secondStart + secondDuration + 0.01,
    );
  }
}

export function playSound(sound: SoundType): void {
  if (!enabled) return;

  playTone(SOUND_PROFILES[sound]);
}

export function toggleSound(state?: boolean): boolean {
  enabled = state === undefined ? !enabled : state;
  return enabled;
}

export const playConfirmSound = () => playSound('confirm');
export const playCancelSound = () => playSound('cancel');
export const playHoverSound = () => playSound('hover');
export const playTapSound = () => playSound('hover');
export const playTabSwitchSound = () => playSound('tabSwitch');
export const playFootstepSound = () => playSound('footstep');
export const playCardOpenSound = () => playSound('cardOpen');
export const playCardCloseSound = () => playSound('cardClose');
export const playCloseSound = () => playSound('cancel');
export const playModalOpenSound = () => playSound('modalOpen');
export const playModalCloseSound = () => playSound('modalClose');
export const playAddSound = () => playSound('add');
export const playSaveSound = () => playSound('save');
export const playDeleteSound = () => playSound('delete');
export const playToggleSound = () => playSound('toggle');
export const playErrorSound = () => playSound('error');
