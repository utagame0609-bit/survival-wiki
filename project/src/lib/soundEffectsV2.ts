/**
 * Survival Wiki - Sound Effects V2 master definitions
 *
 * V2原本。アプリ本番の再生配管は変更せず、AS「音源候補v2_プレビュー」で
 * 確定した新規SE 16種 + NPC専用BGM 3種の定義を管理する。
 *
 * NOTE:
 * - sound.ts の既存配管はこのファイルでは参照・変更しない。
 * - 既存12音は soundEffectsV1.ts を原本とする。
 */

export type SoundV2Category = 'new_high' | 'new_medium' | 'npc_bgm';
export type SoundV2Priority = '★★★' | '★★' | '★';

export interface NPCPersonaV2 {
  roleName: string;
  characterQuote: string;
  archetype: string;
  atmosphere: string;
  tempo: string;
  musicalTraits: string[];
}

export interface SoundEffectV2 {
  id: string;
  name: string;
  nameJa: string;
  category: SoundV2Category;
  categoryJa: string;
  priority: SoundV2Priority;
  usage: string;
  description: string;
  toneInfo: string;
  keyCharacteristic: string;
  isLooping?: boolean;
  isBgm?: boolean;
  npcPersona?: NPCPersonaV2;
}

export const SOUND_EFFECTS_V2: SoundEffectV2[] = [
  {
    id: 'footstep', name: 'Footstep', nameJa: 'フットステップ音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★',
    usage: '画面内の移動・ナビゲーション操作など、歩行感を演出したい場面で使用する軽いステップ音。',
    description: '乾いた地面を踏みしめるような「トッ / コッ」。三角波の低音パンチと極小の砂利ノイズ。',
    toneInfo: 'Low Triangle Punch (140Hz → 65Hz) + Soft Noise Filter (1.8kHz) / 65ms',
    keyCharacteristic: '連続移動で連打しても耳が疲れない、丸みと程よい硬さを持つリアルなステップ音。',
  },
  {
    id: 'hover', name: 'Hover / Cursor Focus', nameJa: 'ホバー・フォーカス音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: 'アイコンやボタンにカーソルが乗った際、またはフォーカス時に鳴る極めて軽量なフィードバック音。',
    description: '触れた瞬間に光るような極小「チッ / プッ」。高域の澄んだマイクロパルス。',
    toneInfo: 'Ultra-fast Square Pulse (2200Hz) / Soft Gain / 22ms',
    keyCharacteristic: 'マウスを素早く動かしても不快な連打音にならず、UIの質感だけを高める空気のような軽量設計。',
  },
  {
    id: 'card_open', name: 'Card Open', nameJa: 'カード・パネル展開音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: 'カードや詳細パネルを開く・アコーディオンを展開する際の、シャキッとした展開音。',
    description: 'スッと開く「シュパッ」。上昇レゾナンススイープとクリスプな立ち上がり。',
    toneInfo: 'Dual Square Sweep (520Hz → 1480Hz) + Resonant Air (4.2kHz) / 95ms',
    keyCharacteristic: 'カードが手前に立体的に飛び出してくるような視覚的快感と同期する、エッジの効いた展開音。',
  },
  {
    id: 'card_close', name: 'Card Close', nameJa: 'カード・パネル収納音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: 'カードや詳細パネルを閉じる・アコーディオンを収納する際の、滑らかな閉じ音。',
    description: 'スッと収まる「シュポッ」。下降フィルターと柔らかな三角波の着地。',
    toneInfo: 'Triangle Pitch Drop (980Hz → 320Hz) + Lowpass Sweep (1.5kHz) / 85ms',
    keyCharacteristic: 'card_openと対になる音像。開く時よりもやや低く収束し、整然と閉じられた感覚を与える。',
  },
  {
    id: 'add', name: 'Add Entry / Create', nameJa: '新規追加・登録音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: '新規データ登録・ロケーション追加・新しい要素をリストに加えた時の、明るく弾むエフェクト音。',
    description: 'ポンポンッと弾ける「ピポパッ！」。3連アップビートの爽快なメジャーアルペジオ。',
    toneInfo: '3-Step Square (G5 → C6 → E6) / 130ms',
    keyCharacteristic: '何かが新しく誕生した喜びを感じさせる、軽快で弾力のある16bitポップサウンド。',
  },
  {
    id: 'save', name: 'Save / Commit', nameJa: '保存完了音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: '編集内容の保存完了・データベース書き込み完了時に鳴る、確信の持てる澄んだ達成音。',
    description: 'スッキリ整う「ピンッ / チャイム」。高域の完全5度ハーモニーと穏やかなディレイ。',
    toneInfo: 'Harmonic Sine/Square (C6 + G6) + Crystal Resonance / 240ms',
    keyCharacteristic: '「確実に保存された」という心理的安心感・安全感を与える、澄み切った高品位チャイム。',
  },
  {
    id: 'toggle', name: 'Toggle Switch', nameJa: 'トグル・スイッチ切替音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: 'スイッチのON/OFF切り替え・チェックボックス・モード反転時の、パチッとしたレトロスイッチ音。',
    description: 'カチッと小気味よい「パチッ」。メカニカルなトグルスイッチのクリック感。',
    toneInfo: 'Dual Biquad Click (1800Hz / 850Hz) + Fast Square Transient / 40ms',
    keyCharacteristic: '物理的なトグルスイッチを跳ね上げたような、心地よい触感フィードバック。',
  },
  {
    id: 'error', name: 'Error / Denied', nameJa: 'エラー・拒絶音',
    category: 'new_high', categoryJa: '新規SE候補【優先度：大】', priority: '★★★',
    usage: '入力不備・通信失敗・権限不足など、本当にエラーが発生した際に使用する、重厚だが不快すぎない警告音。',
    description: 'ズシッと重い「ブッブッ」。減衰する不協和ノコギリ波とローパス歪み。',
    toneInfo: 'Twin Sawtooth (F#3 + G3) + Lowpass 900Hz / 220ms',
    keyCharacteristic: '不快な耳鳴りを避けつつ、操作が拒絶されたことを確実に伝えるコントロールされた重低音。',
  },
  {
    id: 'danger_confirm', name: 'Danger Confirm', nameJa: '危険操作・確認音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★★',
    usage: 'データ全削除・アカウントリセットなど、「危険な操作を実行する前の確認」を促す重厚な確認音。',
    description: '緊張感走る「ドォン…ピキッ」。重厚なサブベースパルスと高域の警戒シマー。',
    toneInfo: 'Deep Sub Drop (90Hz → 45Hz) + Dual Detuned Square (D4/D#4) / 380ms',
    keyCharacteristic: 'プレイヤーに一度手を止めさせ、重大な決断を意識させる緊迫感のある低音。',
  },
  {
    id: 'record_select', name: 'Record Select', nameJa: '記録・アイテム選択音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★★',
    usage: 'Timeline等の記録やサバイバル日誌の特定カードを選択・ハイライトした際に鳴る、軽いクリック音。',
    description: '乾いた「コツッ」。カセットテープやカードスロットを選択したような触感音。',
    toneInfo: 'Triangle Pluck (680Hz → 340Hz) + Wood Transient Filter / 50ms',
    keyCharacteristic: '日誌やレコードをめくるような自然な物理感があり、連続選択しても軽快。',
  },
  {
    id: 'ai_generate_start', name: 'AI Generate Start', nameJa: 'AI生成開始・起動音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★★',
    usage: 'AI Wiki記事の生成開始時に鳴る、データ解析・システム起動を感じさせるサイバー音。',
    description: '電力が充填される「キュイィィン！」。高周波の上昇スイープとデジタルチャージ音。',
    toneInfo: 'Sawtooth Exponential Sweep (320Hz → 2400Hz) + Bitcrush Pulse / 320ms',
    keyCharacteristic: 'スーパーコンピュータが起動してAIコアが計算を開始したようなサイバー感。',
  },
  {
    id: 'ai_generate_complete', name: 'AI Generate Complete', nameJa: 'AI生成完了・祝福音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★★',
    usage: 'AI Wiki記事の生成完了時に鳴る、記事完成を祝福する幻想的なフィードバック音。',
    description: '光が拡散する「ティン・シャララ〜ン」。ホログラフィックな結晶音と空間残響。',
    toneInfo: 'Quad Square Harmony (E5-G#5-B5-E6) + Shimmer Delay / 750ms',
    keyCharacteristic: 'AI解析から結晶化された情報がWikiに刻印された瞬間を彩る未来的な響き。',
  },
  {
    id: 'chest_close', name: 'Chest Close', nameJa: 'チェスト収納・閉め音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★',
    usage: 'チェスト系UIや保管庫・ギャラリーを閉じる際の、「カチャン」という収納音。',
    description: '錠前がカチッと掛かる「ガチャン / カチッ」。木箱と金属ラッチの噛み合わせ。',
    toneInfo: 'Metal Latch Click (1.4kHz) + Wood Decay Box (180Hz) / 140ms',
    keyCharacteristic: 'chest_openの対。しっかりと蓋が閉まりアイテムが安全に保管された確信を与える。',
  },
  {
    id: 'screen_transition', name: 'Screen Transition', nameJa: '大画面遷移・空間移動音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★',
    usage: 'ページ間の大きな画面遷移やワールド切替時に鳴る、空間が切り替わるようなディープな遷移音。',
    description: '空間がねじれる「フォシュゥゥン…」。深いバンドパスノイズとピッチドロップ。',
    toneInfo: 'Bandpass Noise Sweep + Sub Sine Body (85Hz) / 360ms',
    keyCharacteristic: '別の記録層へ潜り込むようなシネマティックな没入感。',
  },
  {
    id: 'notification', name: 'Notification Pop', nameJa: 'ポップアップ通知音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★★',
    usage: '保存完了・処理完了・トースト通知などの、ポップアップ通知に使用する短い通知音。',
    description: '愛らしい「ピロン♪」。高音2音の丸いベルチャイム。',
    toneInfo: 'Dual Sine / Soft Square (C6 → E6) / 160ms',
    keyCharacteristic: '作業の集中を遮らず、画面の隅で発生したイベントを優しく知らせる。',
  },
  {
    id: 'input_focus', name: 'Input Focus', nameJa: '入力欄フォーカス音',
    category: 'new_medium', categoryJa: '新規SE候補【優先度：中】', priority: '★',
    usage: '入力欄や編集対象をクリック・フォーカスした際の、小さなパルス音。',
    description: '極小の「プッ」。編集モードへの切り替わりを伝える繊細なパルス。',
    toneInfo: 'Sine Micro-chirp (1600Hz → 800Hz) / 28ms',
    keyCharacteristic: 'テキスト入力を始める準備が整ったことを示す、邪魔にならない極小クリック。',
  },
  {
    id: 'npc_bgm_wikipedia', name: 'Encyclopedia Folklorist', nameJa: 'ウタペディア（百科事典・民俗学者）',
    category: 'npc_bgm', categoryJa: 'WIKI生成NPC専用BGM', priority: '★★★',
    usage: '「ウタペディア（百科事典・民俗学者）」記事閲覧・生成時の背景BGM。',
    description: 'クラシカル × レトロサイバー。几帳面なチェンバロ風アルペジオと不穏な半音階。',
    toneInfo: 'Square Harpsichord (A minor Arpeggio) + Polyphonic Triangle Bass + Digital Pulse Hum',
    keyCharacteristic: '学術的で整然としながらも、プレイヤーを知的に小馬鹿にする冷ややかで不穏なバロック旋律。',
    isLooping: true, isBgm: true,
    npcPersona: {
      roleName: 'ウタペディア（百科事典・民俗学者）',
      characterQuote: '「ふむ、これがあなたの言う“生存記録”ですか。実に原始的で興味深い。」',
      archetype: '非常にプライドが高く皮肉屋な「天才民俗学者」',
      atmosphere: '学術的・客観的で整然としているが、どこか不穏。クラシカル × レトロサイバー。',
      tempo: '112 BPM (Moderato Baroque)',
      musicalTraits: ['ハープシコード風16bit矩形波アルペジオ（Aマイナー主調）','知的な冷徹さを表す整然とした8分音符シーケンス','時折挟まれる不穏な減衰半音','冷静沈着な通奏低音（Triangle Bass）'],
    },
  },
  {
    id: 'npc_bgm_scp', name: 'SCP Foundation Senior Researcher', nameJa: 'SCP FOUNDATION（機密報告・特異点研究員）',
    category: 'npc_bgm', categoryJa: 'WIKI生成NPC専用BGM', priority: '★★★',
    usage: '「SCP FOUNDATION（機密報告・特異点研究員）」記事閲覧・生成時の背景BGM。',
    description: 'ミリタリー × サイバー × インダストリアル。重厚なドローンと無機質なパルス。',
    toneInfo: 'Industrial Saw Bass (55Hz) + Geiger Noise Pulses + Metallic Filter Ping + Cold Lead',
    keyCharacteristic: '異常存在を隔離する冷酷な研究施設。プレイヤーをDクラス職員のように客観視する緊張感。',
    isLooping: true, isBgm: true,
    npcPersona: {
      roleName: 'SCP FOUNDATION（機密報告・特異点研究員）',
      characterQuote: '「対象のバイタル確認。異常性の発現ログを記録する。Dクラス、無駄な感情の表出は研究のノイズになる。」',
      archetype: '異常存在を調査・隔離する秘密組織の「冷徹な上級研究員」',
      atmosphere: '無機質・重厚・冷酷。ミリタリー × サイバー × インダストリアル 16bitアンビエント。',
      tempo: '96 BPM (Industrial Strict)',
      musicalTraits: ['重厚な低周波ノコギリ波ドローン（55Hz / A1）','ガイガーカウンター風の不規則な微小ノイズパルス','無機質で金属的な冷たいステップシーケンス','感情を一切排除したミニマルなインターバル展開'],
    },
  },
  {
    id: 'npc_bgm_ancient', name: 'Lost Chronicle Wandering Bard', nameJa: 'LOST CHRONICLE（絶望古文書・老吟遊詩人）',
    category: 'npc_bgm', categoryJa: 'WIKI生成NPC専用BGM', priority: '★★★',
    usage: '「LOST CHRONICLE（絶望古文書・老吟遊詩人）」記事閲覧・生成時の背景BGM。',
    description: 'レトロファンタジー × 16bitアンビエント。哀愁を帯びたマイナー旋律と滅びゆく世界の鐘。',
    toneInfo: 'Triangle Ancient Lute + Distant Tubular Bell + Ominous Wind Resonator + Minor Echoes',
    keyCharacteristic: '滅びゆく終末世界を記録し、プレイヤーの儚い足掻きを遠くから静かに嘲笑する美しくも哀しい旋律。',
    isLooping: true, isBgm: true,
    npcPersona: {
      roleName: 'LOST CHRONICLE（絶望古文書・老吟遊詩人）',
      characterQuote: '「ああ…またひとつ、灰となって消えゆく物語か。愚かな旅人よ、せめてこの古文書にその哀しき末路を刻んでやろう…」',
      archetype: '滅びゆく終末世界を記録する「老いた吟遊詩人」または「狂人の学者」',
      atmosphere: '悲壮感・哀愁・狂気。マイナー調を軸に、レトロファンタジー × 16bitアンビエント。',
      tempo: '78 BPM (Largo Elegiac)',
      musicalTraits: ['哀愁を帯びた三角波リュート（Eマイナーペンタトニック旋律）','遠くの廃墟で打ち鳴らされるような不気味な鐘の響き','滅びゆく風のようなアンビエント・レゾネーター','狂気と美しさが交差する物悲しいドローンベース'],
    },
  },
];
