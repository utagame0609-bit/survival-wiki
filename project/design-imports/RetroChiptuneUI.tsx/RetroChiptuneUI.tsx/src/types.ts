export type LyriaModelType = 'lyria-3-clip-preview' | 'lyria-3-pro-preview';

export interface GeneratedTrack {
  id: string;
  title: string;
  prompt: string;
  model: LyriaModelType | 'web-audio-synth';
  audioUrl: string;
  audioBlob?: Blob;
  mimeType: string;
  duration?: number;
  lyrics?: string;
  createdAt: number;
  tags: string[];
  tempo: string;
  source: 'lyria-ai' | 'chiptune-synth';
  saveSlot?: number;
}

export interface PromptPreset {
  id: string;
  title: string;
  subtitle: string;
  category: 'Save Menu' | 'Synthwave' | 'Chiptune' | 'Dungeon' | 'Action' | 'Cozy';
  prompt: string;
  tempo: string;
  tags: string[];
  recommendedModel: LyriaModelType;
}

export interface ChiptuneNote {
  note: string;
  freq: number;
  duration: number; // in sixteenth notes or beats
  channel: 'pulse1' | 'pulse2' | 'triangle' | 'noise';
  volume?: number;
}

export interface SynthPreset {
  id: string;
  name: string;
  bpm: number;
  description: string;
  tags: string[];
  notes: {
    pulse1: Array<[string, number, number]>; // [note, startBeat, durationBeats]
    pulse2: Array<[string, number, number]>;
    triangle: Array<[string, number, number]>;
    noise: Array<[string, number, number]>;
  };
}
