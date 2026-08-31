export interface PhotoItem {
  id: string;
  url: string;
  title: string;
  locationTag?: string;
  timestamp?: string;
  aspect?: 'landscape' | 'portrait' | 'square';
  alt: string;
}

export interface Coordinates {
  x: number;
  y: number;
  z: number;
}

export interface ArticleChapter {
  id: string;
  numeral: string;
  title: string;
  subtitle?: string;
  paragraphs: string[];
  bardMarginalia?: string; // Short note by Gildas
  keyMoment?: string; // Poetic fragment
  assignedPhotoIndex?: number;
}

export interface GildasPostComment {
  verse: string;
  commentary: string;
  bardName: string;
  bardTitle: string;
  epilogueNote: string;
}

export interface WikiArticleData {
  title: string;
  chronicleCode?: string;
  locationName?: string;
  timestamp?: string;
  memo?: string;
  companions?: string[];
  coordinates?: Coordinates | null;
  photos: PhotoItem[];
  chapters: ArticleChapter[];
  gildasComment: GildasPostComment;
}

export type ProposalType = 'proposalA' | 'proposalB' | 'proposalC';

export type ContentScenarioType = 'achievement-return' | 'daily-legend' | 'precious-memory';

export type PhotoFilterCount = 0 | 1 | 3 | 5;

export type CoordinateState = 'present' | 'none' | 'zero';

export type CompanionState = 'present' | 'none';

export type DateState = 'present' | 'none';

export type DeviceViewportMode = 'desktop' | 'mobile-390' | 'fluid';
