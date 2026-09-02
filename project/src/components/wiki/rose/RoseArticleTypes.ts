export type RoseHazardLevel = 'Mild' | 'Moderate' | 'Critical' | 'Saloon Rumor';

export type RoseMastheadData = {
  volume: string;
  issueNumber: string;
  date: string;
  weatherCondition?: string;
  saloonLocation?: string;
  priceTag?: string;
  editionSubtitle?: string;
};

export type RosePortraitData = {
  imageUrl: string;
  name: string;
  roleTitle: string;
  caption?: string;
  badge?: string;
};

export type RoseEditorCommentData = {
  title?: string;
  message: string;
  signature?: string;
  stampText?: string;
  subNotice?: string;
  date?: string;
};

export type RoseArticle = {
  id: string;
  title: string;
  category?: string;
  hazardLevel?: RoseHazardLevel;
  masthead: RoseMastheadData;
  portrait: RosePortraitData;
  contentMarkdown: string;
  editorComment: RoseEditorCommentData;
  tags?: string[];
};
