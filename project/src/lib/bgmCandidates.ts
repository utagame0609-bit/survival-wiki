export type BgmCandidate = {
  id: 'bgm_world_select' | 'npc_bgm_wikipedia' | 'npc_bgm_scp' | 'npc_bgm_ancient';
  name: string;
  nameJa: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
};

export const BGM_CANDIDATES: BgmCandidate[] = [
  {
    id: 'bgm_world_select',
    name: 'WORLD SELECT / SAVE',
    nameJa: 'セーブ／ワールド選択画面BGM',
    description: 'セーブやワールド選択画面に使用している、16-bitレトロゲーム風のシームレスループBGM。',
    toneInfo: 'BPM 96 / 30秒ループ / Pulse Lead + Triangle Bass + Chiptune Arp + Noise Drums',
    keyCharacteristic: '現在のワールド選択画面で使用しているBGMを、そのまま試聴できます。',
  },
  {
    id: 'npc_bgm_wikipedia',
    name: 'WUTAPEDIA',
    nameJa: 'ウタペディア',
    description: '百科事典・民俗学者をイメージした、クラシカル × レトロサイバーの知的なBGM。',
    toneInfo: 'A Minor / 112 BPM / Square Arpeggio + Triangle Bass',
    keyCharacteristic: '整然としたアルペジオに半音階の不穏さを混ぜた、洗練された学術系サウンド。',
  },
  {
    id: 'npc_bgm_scp',
    name: 'SCP FOUNDATION',
    nameJa: 'SCP FOUNDATION',
    description: '機密報告・特異点研究員をイメージした、ミリタリー × サイバー × インダストリアルBGM。',
    toneInfo: 'A / 96 BPM / Saw Drone + Industrial Pulse',
    keyCharacteristic: '55Hzの重低音ドローンと金属的パルス、ランダムなノイズで無機質な緊張感を演出。',
  },
  {
    id: 'npc_bgm_ancient',
    name: 'LOST CHRONICLE',
    nameJa: 'LOST CHRONICLE',
    description: '絶望古文書・老吟遊詩人をイメージした、レトロファンタジー × 16bitアンビエントBGM。',
    toneInfo: 'E Minor / 78 BPM / Triangle Lute + Ruin Bell',
    keyCharacteristic: '哀愁の古楽器旋律、遠くの鐘、風のノイズで「失われた世界」の空気を表現。',
  },
];
