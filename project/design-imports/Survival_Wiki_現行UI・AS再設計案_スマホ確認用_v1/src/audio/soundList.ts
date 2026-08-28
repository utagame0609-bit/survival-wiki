export interface SoundItemDef {
  id: string;
  name: string;
  category: 'se' | 'bgm';
  description: string;
  pitchHz?: string;
  icon?: string;
}

export const SOUND_LIST: SoundItemDef[] = [
  {
    id: 'hover',
    name: 'フォーカス / HOVER',
    category: 'se',
    description: 'ボタンやカードにカーソルを合わせたときの微小レトロパルス',
    pitchHz: '880Hz → 1320Hz',
    icon: 'MousePointer',
  },
  {
    id: 'confirm',
    name: '決定 / CONFIRM',
    category: 'se',
    description: 'コマンド選択時のクリアな2音和音（C5 → G5）',
    pitchHz: '523Hz / 784Hz',
    icon: 'CheckCircle2',
  },
  {
    id: 'cancel',
    name: 'キャンセル・戻る / CANCEL',
    category: 'se',
    description: '画面戻り・モーダル閉じ時の低域ピッチベンド下降音',
    pitchHz: '330Hz → 131Hz',
    icon: 'Undo2',
  },
  {
    id: 'card_open',
    name: '日誌展開 / OPEN_LOG',
    category: 'se',
    description: 'タイムライン日誌を開くときのレトロな上昇分散和音',
    pitchHz: 'C5-E5-G5-C6',
    icon: 'FolderOpen',
  },
  {
    id: 'new_record',
    name: '記録完了・宝箱入手 / NEW_RECORD',
    category: 'se',
    description: '新たな記録や宝箱写真を追加したときの8-bitアイテム取得ファンファーレ',
    pitchHz: 'A4-C#5-E5-A5',
    icon: 'Sparkles',
  },
  {
    id: 'save',
    name: '冒険の書セーブ / SAVE_WORLD',
    category: 'se',
    description: 'ワールド設定やデータの保存が完了した際の残響リバーブチャイム',
    pitchHz: '587Hz → 880Hz',
    icon: 'Save',
  },
  {
    id: 'delete',
    name: 'データ消去 / DELETE',
    category: 'se',
    description: 'ログ削除・初期化時の低域アラート音',
    pitchHz: '294Hz → 220Hz',
    icon: 'Trash2',
  },
  {
    id: 'milestone',
    name: 'マイルストーン達成 / MILESTONE',
    category: 'se',
    description: 'DAY 05や10件記録などの節目をアンロックした瞬間の祝福チャイム',
    pitchHz: 'C5-E5-G5-C6-E6',
    icon: 'Trophy',
  },
  {
    id: 'world_select',
    name: 'BGM: ワールドセレクト / 冒険の旅立ち',
    category: 'bgm',
    description: '96 BPM 4-チャンネル レトロチップチューン（分散和音＋ベース）',
    pitchHz: 'C Major 96BPM',
    icon: 'Music',
  },
  {
    id: 'npc_wikipedia',
    name: 'BGM: 百科事典・民俗学者',
    category: 'bgm',
    description: 'A minor バロック風アルペジオの知的な学術旋律',
    pitchHz: 'A Minor 120BPM',
    icon: 'BookOpen',
  },
  {
    id: 'npc_scp',
    name: 'BGM: SCP 機密報告',
    category: 'bgm',
    description: '低域のこぎり波と残響リバーブによるダークアンビエント・ドローン',
    pitchHz: '55Hz Low Drone',
    icon: 'Shield',
  },
  {
    id: 'npc_ancient',
    name: 'BGM: 滅びの叙事詩',
    category: 'bgm',
    description: 'E minor モーダルリュートによる哀愁漂う神話旋律',
    pitchHz: 'E Minor Modal',
    icon: 'Scroll',
  },
];
