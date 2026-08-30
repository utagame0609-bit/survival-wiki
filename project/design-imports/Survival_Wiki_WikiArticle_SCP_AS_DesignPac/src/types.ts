export type ProposalId = 'proposal-a' | 'proposal-b' | 'proposal-c';

export type ViewportMode = 'pc' | 'mobile' | 'direct_mobile' | 'split';

export type PhotoCountOption = 0 | 1 | 3 | 5;

export interface EvidencePhoto {
  id: string;
  code: string;
  url: string;
  title: string;
  caption: string;
  timestamp: string;
  coordinates?: { x: number; y: number; z: number };
  sector?: string;
  status: 'VERIFIED' | 'CORRUPTED' | 'ANOMALOUS';
  aspectRatio?: string;
}

export interface SectionContent {
  id: string;
  number: string;
  title: string;
  subTitle?: string;
  paragraphs: string[];
  callout?: {
    type: 'WARNING' | 'PROTOCOL' | 'NOTE' | 'REDACTED';
    label: string;
    text: string;
  };
  evidenceAttached?: string[]; // photo ids
  logEntries?: {
    time: string;
    speaker?: string;
    text: string;
    severity?: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  }[];
}

export interface AnomalyArticleData {
  itemNumber: string;
  caseId: string;
  objectClass: 'SAFE' | 'EUCLID' | 'KETER' | 'ANOMALOUS';
  securityClearance: number;
  locationName: string; // unaltered user location
  recordingDate: string;
  coordinates?: { x: number; y: number; z: number };
  player: string;
  companions?: string[];
  totalRecordsCount: number;
  doctorComment: string;
  doctorName: string;
  doctorTitle: string;
  warningNotice: string;
  executiveSummary: string;
  sections: SectionContent[];
  shortExecutiveSummary: string;
  shortSections: SectionContent[];
  photos: EvidencePhoto[];
}

export interface ProposalDesignSpec {
  id: ProposalId;
  nameJa: string;
  nameEn: string;
  catchphrase: string;
  themeColor: string;
  accentBg: string;
  paperTypeJa: string;
  coreConcept: string;
  paperStructure: string;
  photoRole: string;
  scrollExperience: {
    pc: string;
    mobile: string;
  };
  scores: {
    mobileReadability: number; // 1-5
    scpImmersion: number;      // 1-5
    missingDataResilience: number; // 1-5
    systemIntegration: number; // 1-5
    implementationCost: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  pros: string[];
  cons: string[];
  mobileReadingFlow: string[];
  photoHandling: {
    count5: string;
    count3: string;
    count1: string;
    count0: string;
  };
  recommendationRating: number; // e.g. 96/100
  isRecommended?: boolean;
}

export interface ActiveSimulationState {
  proposal: ProposalId;
  viewport: ViewportMode;
  photoCount: PhotoCountOption;
  hasCoordinates: boolean;
  hasParty: boolean;
  textLength: 'full' | 'short';
  activeSectionId?: string;
}
