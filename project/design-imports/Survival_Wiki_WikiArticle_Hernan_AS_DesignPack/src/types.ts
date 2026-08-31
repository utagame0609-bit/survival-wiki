/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ArticleCoordinate {
  x: number;
  y: number;
  z: number;
}

export interface ArticlePhoto {
  id: string;
  url: string;
  caption?: string;
  alt: string;
  location?: string;
  timestamp?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | '3:2';
}

export interface CitationFootnote {
  id: number;
  text: string;
  sourceType: 'observation' | 'log_record' | 'hernan_hypothesis';
  originalRef?: string;
}

export interface RelatedRecord {
  id: string;
  title: string;
  location?: string;
  date?: string;
  snippet?: string;
}

export interface HernanArticleData {
  id: string;
  title: string;
  subtitle?: string;
  leadParagraph: string;
  contentMarkdown: string;
  
  // Optional metadata (all strictly conditional - zero fake fallbacks)
  locationName?: string;
  timestamp?: string;
  memo?: string;
  companions?: string[];
  coordinates?: ArticleCoordinate;
  
  // Media (0 to 5 photos)
  photos: ArticlePhoto[];
  
  // Footnotes & Citations
  citations?: CitationFootnote[];
  
  // Post-compilation note by Hernan
  hernanPostComment?: string;
  
  // Categories & metadata
  categories?: string[];
  lastEditedDate?: string;
  revisionNumber?: number;
  
  // Related Survival Wiki records
  relatedRecords?: RelatedRecord[];
}

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
  numberPrefix: string;
  subItems?: TocItem[];
}

export type ViewportMode = 'responsive' | 'desktop-1440' | 'pc-1280' | 'tablet-1024' | 'mobile-390' | 'narrow-320';
export type PhotoCountVariant = '5_photos' | '3_photos' | '1_photo' | '0_photos';
export type MetadataVariant = 'all_present' | 'no_coords' | 'explicit_zero_coords' | 'no_companions' | 'no_timestamp' | 'all_minimal';
export type InfoboxPositionMode = 'infobox_right' | 'figures_inline';
export type MobileTocMode = 'inline_accordion' | 'quick_sheet';
