export interface WikiStyle {
  id: string;
  name: string;
  description: string;
}

export const WIKI_STYLES: WikiStyle[] = [
  {
    id: 'wikipedia',
    name: 'ウタペディア (百科事典・民俗学者)',
    description: '客観的な事実と皮肉混じりの詳細な学術記録。',
  },
  {
    id: 'scp',
    name: 'SCP FOUNDATION (機密報告・特異点研究員)',
    description: '冷徹なオブジェクト番号と隔離手順、生存限界報告書。',
  },
  {
    id: 'ancient',
    name: 'LOST CHRONICLE (絶望古文書・老吟遊詩人)',
    description: '滅びゆく世界と無謀な旅人の足跡を語り継ぐ哀愁の叙事詩。',
  },
];
