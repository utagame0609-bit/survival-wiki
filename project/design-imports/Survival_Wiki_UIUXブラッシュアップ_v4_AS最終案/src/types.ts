export type Coordinates = {
  x: number;
  y: number;
  z: number;
};

export type PartyMember = {
  id: string;
  name: string;
  avatar: string;
};

export type World = {
  id: string;
  slotNumber: number;
  name: string;
  leaderName: string;
  leaderAvatar: string;
  createdAt: string;
  memo: string;
  partyMembers: PartyMember[];
  daysCount: number;
  recordsCount: number;
  lastRecordAt: string;
};

export type LocationRecord = {
  id: string;
  worldId: string;
  title: string;
  memo: string;
  photoUrl?: string;
  photos?: string[];
  createdAt: string; // ISO date-time string
  dayNumber: number;
  hasExplicitCoordinates: boolean; // True if user explicitly entered coordinates (even 0,0,0)
  coordinates?: Coordinates;
  companions: string[];
};

export type WikiStyle = 'encyclopedia' | 'scp' | 'ancient';

export type WikiNpc = {
  id: string;
  style: WikiStyle;
  name: string;
  shortStyleName: string;
  role: string;
  title: string;
  avatar: string;
  color: 'amber' | 'cyan' | 'emerald';
  greeting: string;
  compilingQuote: string[];
  finishedQuote: string;
  description: string;
};

export type WikiArticle = {
  id: string;
  worldId: string;
  style: WikiStyle;
  npcId: string;
  title: string;
  subtitle: string;
  summary: string;
  keyStats: { label: string; value: string }[];
  contentMarkdown: string;
  photoUrls: string[];
  generatedAt: string;
  featuredRecordIds?: string[];
};

export type BgmChannels = {
  ch1: boolean;
  ch2: boolean;
  ch3: boolean;
  ch4: boolean;
};

export type AudioSettings = {
  masterVolume: number;
  reverbLevel: number;
  isMuted: boolean;
  seVolume: number;
  seEnabled: boolean;
  bgmChannels: BgmChannels;
};

export type SoundEffectMeta = {
  id: string;
  name: string;
  category: 'menu' | 'record' | 'wiki' | 'action';
  description: string;
  synthType: string;
};

export type SoundEffect = SoundEffectMeta;
