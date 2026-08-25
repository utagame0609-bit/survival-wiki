const DEFAULT_REVERB = 0.18;

export type SoundReverb = {
  input: GainNode;
  output: GainNode;
  wet: GainNode;
  dry: GainNode;
  setAmount: (value: number) => void;
  getAmount: () => number;
};

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

  let amount = DEFAULT_REVERB;

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

  return {
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
}
