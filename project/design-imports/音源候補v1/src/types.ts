export type SoundCategory = 'system' | 'screen' | 'action' | 'wiki';

export interface SoundEffectDef {
  id: string;
  name: string;
  nameJa: string;
  category: SoundCategory;
  categoryJa: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
  isLooping?: boolean;
}

export interface BgmChannelState {
  lead: boolean;
  harmony: boolean;
  bass: boolean;
  drums: boolean;
}

export interface AudioEngineSettings {
  masterVolume: number;
  reverbWet: number;
  retroDrive: boolean;
}
