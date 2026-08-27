export type SoundCandidateCategory = 'system' | 'screen' | 'action' | 'wiki' | 'new_high' | 'new_medium';

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
    id: 'cursor_move', name: 'Cursor Move', nameJa: 'カーソル移動音', category: 'system', categoryJa: '1. システム・基本操作音', description: '軽やかで快適な「ピコッ」。Switch風の素早いレスポンスと小気味よい高域のパルス。', toneInfo: 'Square (1320Hz → 1980Hz) / High-shelf Air / 45ms', keyCharacteristic: '短時間の高域ピッチスイープと繊細なリバーブで極めて低遅延な操作感を実現。',
  },
  {
    id: 'confirm', name: 'Confirm / Load', nameJa: '決定・ロード音', category: 'system', categoryJa: '1. システム・基本操作音', description: '芯のある「ピポッ」。明るい2音アルペジオで確実な決定フィードバックを提供。', toneInfo: 'Dual Square (A5 880Hz → A6 1760Hz) / Stereo Delay / 140ms', keyCharacteristic: 'ファミコンらしい矩形波の力強さにSwitch風の滑らかなディレイ残響をブレンド。',
  },
  {
    id: 'cancel', name: 'Cancel / Back', nameJa: 'キャンセル・戻る音', category: 'system', categoryJa: '1. システム・基本操作音', description: '低めの「ピピッ / ポッ」。耳に刺さらない柔らかな三角波と減衰ピッチ。', toneInfo: 'Square + Triangle (E5 659Hz → E4 330Hz) / 1.2kHz Lowpass / 110ms', keyCharacteristic: '丸みを帯びた下降ピッチで、誤操作感を与えない優しいキャンセル音。',
  },
  {
    id: 'warning', name: 'Warning / Delete', nameJa: '警告・削除音', category: 'system', categoryJa: '1. システム・基本操作音', description: '重厚な「デンッ / ブブー」。不協和音デチューンとサブベースの低音アタック。', toneInfo: 'Detuned Saw/Square (Bb2 116Hz + B2 123Hz) + Sub Kick 65Hz / 280ms', keyCharacteristic: '警告・危険を瞬時に伝える重厚な低音キックとアナログレトロな歪み感。',
  },
  {
    id: 'tab_switch', name: 'Tab Switch', nameJa: 'タブ切り替え音', category: 'screen', categoryJa: '2. 画面切替・演出音', description: 'サッとした「ピコッ」。風切りノイズと透明感のある高音パルスの融合。', toneInfo: 'Square Pitch Slide (950Hz → 1600Hz) + Bandpass Air Noise / 55ms', keyCharacteristic: '風を切るような微小ノイズを重ね、画面スライドの物理的な軽やかさを表現。',
  },
  {
    id: 'modal_open_close', name: 'Modal Open / Close', nameJa: 'モーダル開閉音', category: 'screen', categoryJa: '2. 画面切替・演出音', description: '心地よい「トンッ」。モダンUIの触感（ハプティクス）を思わせるポップな低域。', toneInfo: 'Sine Pitch Drop (480Hz → 110Hz) + Resonant Click / 120ms', keyCharacteristic: 'Switchのメニュー展開のような、丸く弾むポップなアタック感。',
  },
  {
    id: 'dialogue_char', name: 'Dialogue Character Blip', nameJa: 'キャラセリフ表示音', category: 'screen', categoryJa: '2. 画面切替・演出音', description: 'レトロRPG風「ポポポポポ…」。テキスト送り1文字ごとのドット音。', toneInfo: 'Triangle (880Hz ± Jitter) / Snappy Envelope / 35ms', keyCharacteristic: '長時間の文字送りでも耳が疲れない温かな三角波とわずかなピッチの揺らぎ。',
  },
  {
    id: 'new_record', name: 'New Record / Discovery', nameJa: '新規記録音', category: 'action', categoryJa: '3. アクション・体験音', description: '爽快な「ピキーン！」。超高域クリスタルアルペジオと煌めくレゾナンス。', toneInfo: 'Triple Square Sweep (E6 → A6 → E7) + Shimmer 3.5kHz / 480ms', keyCharacteristic: 'ハイスコアや新アイテム発見を祝う、突き抜けるような高域の透明感。',
  },
  {
    id: 'chest_open', name: 'Chest Open', nameJa: 'チェスト開閉音', category: 'action', categoryJa: '3. アクション・体験音', description: '木箱が開く「パカッ」。ノック音、木の胴鳴り、チャイムの3層サウンド。', toneInfo: 'Layered Wood Click + Triangle Resonator (260Hz) + Chime (C5 → C6) / 200ms', keyCharacteristic: '宝箱や木箱の蓋が持ち上がる立体的なメカニカル感と期待感。',
  },
  {
    id: 'achievement', name: 'Achievement Unlocked', nameJa: '実績達成音', category: 'action', categoryJa: '3. アクション・体験音', description: 'テンションの上がる「ティロリローン！」。凱旋の5音ファンファーレ。', toneInfo: '5-Note Major Arpeggio (C5-E5-G5-B5-C6-E6) + Wide Stereo Reverb / 600ms', keyCharacteristic: '16-bit黄金期のRPGを彷彿とさせる輝かしいアルペジオとモダンリバーブ。',
  },
  {
    id: 'wiki_generating_noise', name: 'Wiki Generating Noise', nameJa: 'Wiki生成中ノイズ', category: 'wiki', categoryJa: '4. 生成・解析演出音', description: 'CRT走査線風の連続環境音「ジー…」。走査線ノイズとCPU処理の電子つぶやき。', toneInfo: 'Bandpass CRT Raster Noise (1.45kHz) + 60Hz Power Hum + Digital Pulses (Loop)', keyCharacteristic: 'ON/OFFトグルでシームレスループ。データ解析中やAI生成中の心地よいレトロ環境音。', isLooping: true,
  },
  {
    id: 'wiki_complete', name: 'Wiki Complete / Book Finished', nameJa: 'Wiki完成音', category: 'wiki', categoryJa: '4. 生成・解析演出音', description: '冒険の書が完成した感動的な「ピロリロリーン！」。ハープ風の上昇グリッサンド。', toneInfo: '8-Note Major Pentatonic Harp Glissando (C5~G6) + Crystal Bell C7 (1.2s)', keyCharacteristic: '記事や本がパッと完成した瞬間を飾る、ドラマチックで神聖なアルペジオ。',
  },
  // V2 新規SE候補：優先度【大】 8音
  {
    id: 'footstep', name: 'Footstep', nameJa: 'フットステップ音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: '乾いた地面を踏みしめるような「トッ / コッ」。三角波の低音パンチと極小の砂利ノイズ。', toneInfo: 'Low Triangle Punch (140Hz → 65Hz) + Soft Noise Filter (1.8kHz) / 65ms', keyCharacteristic: '連続移動で連打しても耳が疲れない、丸みと程よい硬さを持つリアルなステップ音。',
  },
  {
    id: 'hover', name: 'Hover / Cursor Focus', nameJa: 'ホバー・フォーカス音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: '触れた瞬間に光るような極小「チッ / プッ」。高域の澄んだマイクロパルス。', toneInfo: 'Ultra-fast Square Pulse (2200Hz) / Soft Gain / 22ms', keyCharacteristic: 'マウスを素早く動かしても不快な連打音にならず、UIの質感だけを高める空気のような軽量設計。',
  },
  {
    id: 'card_open', name: 'Card Open', nameJa: 'カード・パネル展開音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'スッと開く「シュパッ」。上昇レゾナンススイープとクリスプな立ち上がり。', toneInfo: 'Dual Square Sweep (520Hz → 1480Hz) + Resonant Air (4.2kHz) / 95ms', keyCharacteristic: 'カードが手前に立体的に飛び出してくるような視覚的快感と同期する、エッジの効いた展開音。',
  },
  {
    id: 'card_close', name: 'Card Close', nameJa: 'カード・パネル収納音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'スッと収まる「シュポッ」。下降フィルターと柔らかな三角波の着地。', toneInfo: 'Triangle Pitch Drop (980Hz → 320Hz) + Lowpass Sweep (1.5kHz) / 85ms', keyCharacteristic: 'card_openと対になる音像。開く時よりもやや低く収束し、整然と閉じられた感覚を与える。',
  },
  {
    id: 'add', name: 'Add Entry / Create', nameJa: '新規追加・登録音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'ポンポンッと弾ける「ピポパッ！」。3連アップビートの爽快なメジャーアルペジオ。', toneInfo: '3-Step Square (G5 784Hz → C6 1046.5Hz → E6 1318.5Hz) / 130ms', keyCharacteristic: '何かが新しく誕生した喜びを感じさせる、軽快で弾力のある16bitポップサウンド。',
  },
  {
    id: 'save', name: 'Save / Commit', nameJa: '保存完了音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'スッキリ整う「ピンッ / チャイム」。高域の完全5度ハーモニーと穏やかなディレイ。', toneInfo: 'Harmonic Sine/Square (C6 1046.5Hz + G6 1568Hz) + Crystal Resonance / 240ms', keyCharacteristic: '「確実に保存された」という心理的安心感・安全感を与える、澄み切った高品位チャイム。',
  },
  {
    id: 'toggle', name: 'Toggle Switch', nameJa: 'トグル・スイッチ切替音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'カチッと小気味よい「パチッ」。メカニカルなトグルスイッチのクリック感。', toneInfo: 'Dual Biquad Click (1800Hz / 850Hz) + Fast Square Transient / 40ms', keyCharacteristic: '物理的なトグルスイッチを跳ね上げたような、心地よい触感フィードバック。',
  },
  {
    id: 'error', name: 'Error / Denied', nameJa: 'エラー・拒絶音', category: 'new_high', categoryJa: '5. V2新規SE候補【優先度：大】', description: 'ズシッと重い「ブッブッ」。減衰する不協和ノコギリ波とローパス歪み。', toneInfo: 'Twin Sawtooth (F#3 185Hz + G3 196Hz) + Lowpass 900Hz / 220ms', keyCharacteristic: '不快な耳鳴りを避けつつ、操作が拒絶されたことを確実に伝えるコントロールされた重低音。',
  },
  // V2 新規SE候補：優先度【中】 8音
  {
    id: 'danger_confirm', name: 'Danger Confirm', nameJa: '危険操作・確認音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'データ全削除・アカウントリセットなど、「危険な操作を実行する前の確認」を促す重厚な確認音。（※errorと明確に区別）', toneInfo: 'Deep Sub Drop (90Hz → 45Hz) + Dual Detuned Square (D4/D#4) / 380ms', keyCharacteristic: 'プレイヤーに一度手を止めさせ、重大な決断を意識させる緊迫感のある低音ドラムロール。',
  },
  {
    id: 'record_select', name: 'Record Select', nameJa: '記録・アイテム選択音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'Timeline等の記録やサバイバル日誌の特定カードを選択・ハイライトした際に鳴る、軽いクリック音。', toneInfo: 'Triangle Pluck (680Hz → 340Hz) + Wood Transient Filter / 50ms', keyCharacteristic: '日誌やレコードをめくるような自然な物理感があり、連続選択しても軽快。',
  },
  {
    id: 'ai_generate_start', name: 'AI Generate Start', nameJa: 'AI生成開始・起動音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'AI Wiki記事の生成開始時に鳴る、データ解析・システム起動を感じさせるサイバー音。', toneInfo: 'Sawtooth Exponential Sweep (320Hz → 2400Hz) + Bitcrush Pulse / 320ms', keyCharacteristic: '巨大なスーパーコンピュータが起動してAIコアが計算を開始したようなサイバー感。',
  },
  {
    id: 'ai_generate_complete', name: 'AI Generate Complete', nameJa: 'AI生成完了・祝福音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'AI Wiki記事の生成完了時に鳴る、記事完成を祝福する幻想的なフィードバック音。', toneInfo: 'Quad Square Harmony (E5-G#5-B5-E6) + Shimmer Delay / 750ms', keyCharacteristic: '高度なAI解析から結晶化された真実がWikiに刻印された瞬間を彩る、神聖で未来的な響き。',
  },
  {
    id: 'chest_close', name: 'Chest Close', nameJa: 'チェスト収納・閉め音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'チェスト系UIや保管庫・ギャラリーを閉じる際の、「カチャン」という収納音。', toneInfo: 'Metal Latch Click (1.4kHz) + Wood Decay Box (180Hz) / 140ms', keyCharacteristic: 'chest_openの対。しっかりと蓋が閉まりアイテムが安全に保管された確信を与える。',
  },
  {
    id: 'screen_transition', name: 'Screen Transition', nameJa: '大画面遷移・空間移動音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: 'ページ間の大きな画面遷移やワールド切替時に鳴る、空間が切り替わるようなディープな遷移音。', toneInfo: 'Bandpass Noise Sweep (4.5kHz → 600Hz) + Sub Sine Body (85Hz) / 360ms', keyCharacteristic: 'UIの枠を超えて別の次元や別の記録層へ潜り込むような、シネマティックな没入感。',
  },
  {
    id: 'notification', name: 'Notification Pop', nameJa: 'ポップアップ通知音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: '保存完了・処理完了・トースト通知などの、ポップアップ通知に使用する短い通知音。', toneInfo: 'Dual Sine / Soft Square (C6 1046.5Hz → E6 1318.5Hz) / 160ms', keyCharacteristic: '作業の集中を遮らず、画面の隅で控えめに発生したイベントを優しく知らせる。',
  },
  {
    id: 'input_focus', name: 'Input Focus', nameJa: '入力欄フォーカス音', category: 'new_medium', categoryJa: '6. V2新規SE候補【優先度：中】', description: '入力欄や編集対象をクリック・フォーカスした際の、小さなパルス音。', toneInfo: 'Sine Micro-chirp (1600Hz → 800Hz) / 28ms', keyCharacteristic: 'テキスト入力を始める準備が整ったことを示す、邪魔にならない極小クリック。',
  },
];
