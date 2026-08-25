export type SoundCandidateCategory = 'system' | 'screen' | 'action' | 'wiki';

export type SoundCandidate = {
  id: string;
  name: string;
  nameJa: string;
  category: SoundCandidateCategory;
  categoryJa: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
  isLooping?: boolean;
};

export const SOUND_CANDIDATES: SoundCandidate[] = [
  {
    id: 'cursor_move',
    name: 'Cursor Move',
    nameJa: 'カーソル移動音',
    category: 'system',
    categoryJa: '1. システム・基本操作音',
    description: '軽やかで快適な「ピコッ」。Switch風の素早いレスポンスと小気味よい高域のパルス。',
    toneInfo: 'Square (1320Hz → 1980Hz) / High-shelf Air / 45ms',
    keyCharacteristic: '短時間の高域ピッチスイープと繊細なリバーブで極めて低遅延な操作感を実現。',
  },
  {
    id: 'confirm',
    name: 'Confirm / Load',
    nameJa: '決定・ロード音',
    category: 'system',
    categoryJa: '1. システム・基本操作音',
    description: '芯のある「ピポッ」。明るい2音アルペジオで確実な決定フィードバックを提供。',
    toneInfo: 'Dual Square (A5 880Hz → A6 1760Hz) / Stereo Delay / 140ms',
    keyCharacteristic: 'ファミコンらしい矩形波の力強さにSwitch風の滑らかなディレイ残響をブレンド。',
  },
  {
    id: 'cancel',
    name: 'Cancel / Back',
    nameJa: 'キャンセル・戻る音',
    category: 'system',
    categoryJa: '1. システム・基本操作音',
    description: '低めの「ピピッ / ポッ」。耳に刺さらない柔らかな三角波と減衰ピッチ。',
    toneInfo: 'Square + Triangle (E5 659Hz → E4 330Hz) / 1.2kHz Lowpass / 110ms',
    keyCharacteristic: '丸みを帯びた下降ピッチで、誤操作感を与えない優しいキャンセル音。',
  },
  {
    id: 'warning',
    name: 'Warning / Delete',
    nameJa: '警告・削除音',
    category: 'system',
    categoryJa: '1. システム・基本操作音',
    description: '重厚な「デンッ / ブブー」。不協和音デチューンとサブベースの低音アタック。',
    toneInfo: 'Detuned Saw/Square (Bb2 116Hz + B2 123Hz) + Sub Kick 65Hz / 280ms',
    keyCharacteristic: '警告・危険を瞬時に伝える重厚な低音キックとアナログレトロな歪み感。',
  },
  {
    id: 'tab_switch',
    name: 'Tab Switch',
    nameJa: 'タブ切り替え音',
    category: 'screen',
    categoryJa: '2. 画面切替・演出音',
    description: 'サッとした「ピコッ」。風切りノイズと透明感のある高音パルスの融合。',
    toneInfo: 'Square Pitch Slide (950Hz → 1600Hz) + Bandpass Air Noise / 55ms',
    keyCharacteristic: '風を切るような微小ノイズを重ね、画面スライドの物理的な軽やかさを表現。',
  },
  {
    id: 'modal_open_close',
    name: 'Modal Open / Close',
    nameJa: 'モーダル開閉音',
    category: 'screen',
    categoryJa: '2. 画面切替・演出音',
    description: '心地よい「トンッ」。モダンUIの触感（ハプティクス）を思わせるポップな低域。',
    toneInfo: 'Sine Pitch Drop (480Hz → 110Hz) + Resonant Click / 120ms',
    keyCharacteristic: 'Switchのメニュー展開のような、丸く弾むポップなアタック感。',
  },
  {
    id: 'dialogue_char',
    name: 'Dialogue Character Blip',
    nameJa: 'キャラセリフ表示音',
    category: 'screen',
    categoryJa: '2. 画面切替・演出音',
    description: 'レトロRPG風「ポポポポポ…」。テキスト送り1文字ごとのドット音。',
    toneInfo: 'Triangle (880Hz ± Jitter) / Snappy Envelope / 35ms',
    keyCharacteristic: '長時間の文字送りでも耳が疲れない温かな三角波とわずかなピッチの揺らぎ。',
  },
  {
    id: 'new_record',
    name: 'New Record / Discovery',
    nameJa: '新規記録音',
    category: 'action',
    categoryJa: '3. アクション・体験音',
    description: '爽快な「ピキーン！」。超高域クリスタルアルペジオと煌めくレゾナンス。',
    toneInfo: 'Triple Square Sweep (E6 → A6 → E7) + Shimmer 3.5kHz / 480ms',
    keyCharacteristic: 'ハイスコアや新アイテム発見を祝う、突き抜けるような高域の透明感。',
  },
  {
    id: 'chest_open',
    name: 'Chest Open',
    nameJa: 'チェスト開閉音',
    category: 'action',
    categoryJa: '3. アクション・体験音',
    description: '木箱が開く「パカッ」。ノック音、木の胴鳴り、チャイムの3層サウンド。',
    toneInfo: 'Layered Wood Click + Triangle Resonator (260Hz) + Chime (C5 → C6) / 200ms',
    keyCharacteristic: '宝箱や木箱の蓋が持ち上がる立体的なメカニカル感と期待感。',
  },
  {
    id: 'achievement',
    name: 'Achievement Unlocked',
    nameJa: '実績達成音',
    category: 'action',
    categoryJa: '3. アクション・体験音',
    description: 'テンションの上がる「ティロリローン！」。凱旋の5音ファンファーレ。',
    toneInfo: '5-Note Major Arpeggio (C5-E5-G5-B5-C6-E6) + Wide Stereo Reverb / 600ms',
    keyCharacteristic: '16-bit黄金期のRPGを彷彿とさせる輝かしいアルペジオとモダンリバーブ。',
  },
  {
    id: 'wiki_generating_noise',
    name: 'Wiki Generating Noise',
    nameJa: 'Wiki生成中ノイズ',
    category: 'wiki',
    categoryJa: '4. 生成・解析演出音',
    description: 'CRT走査線風の連続環境音「ジー…」。走査線ノイズとCPU処理の電子つぶやき。',
    toneInfo: 'Bandpass CRT Raster Noise (1.45kHz) + 60Hz Power Hum + Digital Pulses (Loop)',
    keyCharacteristic: 'ON/OFFトグルでシームレスループ。データ解析中やAI生成中の心地よいレトロ環境音。',
    isLooping: true,
  },
  {
    id: 'wiki_complete',
    name: 'Wiki Complete / Book Finished',
    nameJa: 'Wiki完成音',
    category: 'wiki',
    categoryJa: '4. 生成・解析演出音',
    description: '冒険の書が完成した感動的な「ピロリロリーン！」。ハープ風の上昇グリッサンド。',
    toneInfo: '8-Note Major Pentatonic Harp Glissando (C5~G6) + Crystal Bell C7 (1.2s)',
    keyCharacteristic: '記事や本がパッと完成した瞬間を飾る、ドラマチックで神聖なアルペジオ。',
  },
];
