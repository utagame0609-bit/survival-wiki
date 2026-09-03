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
    name: 'WORLD SELECT',
    nameJa: 'トップ／ワールド選択',
    description: 'ASで完成ミックス化したトップ／ワールド選択画面用BGM。R2上の本番OGGをそのまま試聴します。',
    toneInfo: '88 BPM / 1 LOOP / R2 OGG',
    keyCharacteristic: '本番と同じ完成音源を試聴します。',
  },
  {
    id: 'npc_bgm_wikipedia',
    name: "HERNAN / THE COMPILER'S STUDY",
    nameJa: 'エルナン',
    description: '民俗学者エルナン用の完成ミックスBGM。R2上の本番OGGをそのまま試聴します。',
    toneInfo: '30 SEC LOOP / R2 OGG',
    keyCharacteristic: '編纂官エルナンの本番BGMです。',
  },
  {
    id: 'npc_bgm_scp',
    name: 'ARK / ANOMALY INVESTIGATION',
    nameJa: 'Dr.アーク',
    description: '研究員Dr.アーク用の完成ミックスBGM。R2上の本番OGGをそのまま試聴します。',
    toneInfo: '64 BPM / 30 SEC / R2 OGG',
    keyCharacteristic: '研究員アークの本番BGMです。',
  },
  {
    id: 'npc_bgm_ancient',
    name: 'ROSE / WASTELAND TAVERN SWING',
    nameJa: 'マダム・ロゼ',
    description: 'マダム・ロゼ用の完成ミックスBGM。R2上の本番OGGをそのまま試聴します。',
    toneInfo: '21 SEC LOOP / R2 OGG',
    keyCharacteristic: 'マダム・ロゼの本番BGMです。',
  },
];
