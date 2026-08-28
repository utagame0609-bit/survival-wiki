import { World, AdventureRecord, WikiArticle } from '../types';

export const INITIAL_WORLDS: World[] = [
  {
    id: 'world-mc-01',
    name: 'テストプレイ // マインクラフト第1期',
    genre: 'game',
    player: 'ウタ',
    playerPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    memo: 'サバイバル初見攻略。拠点作りと地下要塞探索、エンド討伐を目指す長期プロジェクト。',
    createdAt: '2026-08-21T10:00:00.000Z',
    updatedAt: '2026-08-24T20:06:00.000Z',
    themeColor: '#f59e0b',
    members: [
      { id: 'mem-1', name: 'ウタ (CMD)', role: '隊長・開拓主', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'mem-2', name: 'ゴーレム', role: '防衛・採掘担当', avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80' },
      { id: 'mem-3', name: 'アレイ', role: 'アイテム回収係', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'world-travel-01',
    name: '関西探訪 ぶらり食べ歩き記録',
    genre: 'travel',
    player: 'ウタ',
    playerPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    memo: '大阪〜京都〜奈良を巡る2泊3日のグルメ・寺社仏閣写真ログ。美味しい串カツと路地裏の名店を発掘する。',
    createdAt: '2026-07-15T09:00:00.000Z',
    updatedAt: '2026-07-17T18:30:00.000Z',
    themeColor: '#06b6d4',
    members: [
      { id: 'mem-t1', name: 'ウタ', role: 'カメラ・ナビ', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
      { id: 'mem-t2', name: '旅の相棒', role: 'グルメ嗅覚担当', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80' },
    ],
  },
];

export const INITIAL_RECORDS: AdventureRecord[] = [
  // --- World 1: Minecraft ---
  {
    id: 'rec-01',
    worldId: 'world-mc-01',
    dayNumber: 1,
    recordedAt: '2026-08-21 19:47',
    locationName: '浅めの洞窟',
    areaTag: '初期スポーン地点東部',
    coords: { x: -177, y: 62, z: 168 },
    memo: 'ゾンビ2体を目視、初めての洞窟なので探索してみたが、そう深くはない。松明を立てつつ石炭が少量手に入った。夜になる前に一旦土ブロックで入り口を塞ぐ。',
    category: 'exploration',
    memberIds: ['mem-1'],
    importance: 'normal',
    photos: [
      {
        id: 'p-01',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: '浅めの洞窟入口。ゾンビの唸り声が響く。',
        takenAt: '2026-08-21 19:48',
      },
    ],
  },
  {
    id: 'rec-02',
    worldId: 'world-mc-01',
    dayNumber: 2,
    recordedAt: '2026-08-22 14:15',
    locationName: 'どこだろう。平原の果て',
    areaTag: '未踏の平原地帯',
    coords: { x: 37, y: 64, z: 62 },
    memo: '集落や村を探して歩き続けているが、生き物の気配は皆無である。羊を見つけてベッドを作りたいが、遠くに牛が1頭いるのみ。夜が来る前に簡易拠点を設営するか悩ましい。',
    category: 'discovery',
    memberIds: ['mem-1', 'mem-2'],
    importance: 'normal',
    photos: [
      {
        id: 'p-02',
        url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&auto=format&fit=crop&q=80',
        caption: '果てしなく広がる平原。村は見当たらず。',
        takenAt: '2026-08-22 14:16',
      },
    ],
  },
  {
    id: 'rec-03',
    worldId: 'world-mc-01',
    dayNumber: 3,
    recordedAt: '2026-08-23 11:30',
    locationName: '断崖の洞窟前',
    areaTag: '峡谷バイオーム',
    coords: { x: 116, y: 72, z: 342 },
    memo: '大きな亀裂が入った断崖がある。村を探すのは一旦ストップしよう。急造の胴装備では心許ないが、探索しない選択は無い。鉄鉱石の鉱脈が露出しているのを発見した。',
    category: 'battle',
    memberIds: ['mem-1', 'mem-2'],
    importance: 'major',
    photos: [
      {
        id: 'p-03',
        url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
        caption: '急造の鉄装備と巨大な渓谷の亀裂。',
        takenAt: '2026-08-23 11:35',
      },
      {
        id: 'p-03-2',
        url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        caption: '底から見上げた断崖の光景。',
        takenAt: '2026-08-23 11:42',
      },
    ],
  },
  {
    id: 'rec-04',
    worldId: 'world-mc-01',
    dayNumber: 3,
    recordedAt: '2026-08-23 16:50',
    locationName: '深層巨大空洞 // マグマ溜まり',
    areaTag: '深度Y=-32 地下空洞',
    coords: { x: 120, y: -32, z: 355 },
    memo: '断崖の奥深くを掘り進めたところ、突然巨大な溶岩湖に突き当たった。水バケツで黒曜石化させながら足場を確保。スケルトンの狙撃を間一髪で盾でガードした。',
    category: 'exploration',
    memberIds: ['mem-1', 'mem-3'],
    importance: 'legendary',
    photos: [
      {
        id: 'p-04',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
        caption: '地下深くに広がる溶岩湖の熱気。',
        takenAt: '2026-08-23 16:52',
      },
    ],
  },
  {
    id: 'rec-05',
    worldId: 'world-mc-01',
    dayNumber: 4,
    recordedAt: '2026-08-24 20:06',
    locationName: '第一拠点 時計塔前広場',
    areaTag: 'ホームベース',
    coords: { x: 0, y: 75, z: 0 },
    memo: '集めた石レンガと木材で初期拠点の時計塔を完成させた！夜でも遠くから光が見えるように頂上にグロウストーンを設置。チェストをカテゴリ別に整理して保管体制が整った。',
    category: 'building',
    memberIds: ['mem-1', 'mem-2', 'mem-3'],
    importance: 'major',
    photos: [
      {
        id: 'p-05',
        url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
        caption: '完成した第一拠点時計塔の夕景。',
        takenAt: '2026-08-24 20:08',
      },
    ],
  },

  // --- World 2: Travel ---
  {
    id: 'rec-t01',
    worldId: 'world-travel-01',
    dayNumber: 1,
    recordedAt: '2026-07-15 12:30',
    locationName: '通天閣と新世界本通り',
    areaTag: '大阪市浪速区恵美須東',
    coords: { x: 34.652, y: 100, z: 135.506, rawText: '北緯34.652 / 東経135.506' },
    memo: '新世界に到着。昭和レトロな看板が立ち並び圧倒される。名物の串カツ屋で紅生姜と牛カツを堪能。ソースの二度づけ禁止ルールを遵守しながら熱々を頬張る。',
    category: 'gourmet',
    memberIds: ['mem-t1', 'mem-t2'],
    importance: 'major',
    photos: [
      {
        id: 'pt-01',
        url: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?w=800&auto=format&fit=crop&q=80',
        caption: 'そびえ立つ通天閣と賑やかな新世界の街並み。',
        takenAt: '2026-07-15 12:35',
      },
    ],
  },
  {
    id: 'rec-t02',
    worldId: 'world-travel-01',
    dayNumber: 2,
    recordedAt: '2026-07-16 08:45',
    locationName: '伏見稲荷大社 千本鳥居',
    areaTag: '京都市伏見区',
    coords: { x: 34.967, y: 150, z: 135.772, rawText: '京都 稲荷山山麓' },
    memo: '早朝の静寂の中、千本鳥居の朱色のトンネルをくぐる。木漏れ日が鳥居の朱色に反射して幻想的な雰囲気。山頂までは行かず四ツ辻でお茶を飲んで引き返す。',
    category: 'culture',
    memberIds: ['mem-t1', 'mem-t2'],
    importance: 'major',
    photos: [
      {
        id: 'pt-02',
        url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80',
        caption: '朝霧に包まれる千本鳥居の朱色の回廊。',
        takenAt: '2026-07-16 08:50',
      },
    ],
  },
];

export const INITIAL_WIKI_ARTICLES: Record<string, WikiArticle> = {
  'world-mc-01-wikipedia': {
    id: 'art-mc-wiki',
    worldId: 'world-mc-01',
    style: 'wikipedia',
    title: 'マインクラフト第1期開拓史 (Minecraft Period I Chronicle)',
    summary: '西暦2026年8月、開拓者ウタ率いる調査隊が未踏平原および断崖地帯にて展開した一連の地殻調査と生存活動の記録。',
    generatedAt: '2026-08-25T12:00:00.000Z',
    stats: {
      recordsCount: 5,
      daysCount: 4,
      photosCount: 5,
      locationsCount: 5,
    },
    content: `# マインクラフト第1期開拓史

**マインクラフト第1期開拓史**（英: *Minecraft Period I Expedition Chronicle*）は、2026年8月21日から24日にかけて、自称・調査主**ウタ**およびその従属個体（ゴーレム、アレイ）によって行われた一連の開拓・生存記録である。

---

## 概要と時代背景

本開拓期は、資源の極度な欠乏と、無計画な遠征方針によって特徴づけられる。開拓隊は初日より**「浅めの洞窟」**（座標 X:-177 / Z:168）においてゾンビ複数体と遭遇。十分な装備を持たないまま石炭を採掘し、夜間を土壁に籠城して過ごすという、極めて典型的な初心者防衛プロトコルを実行した。

---

## 主要な地理と出来事

### 1. 浅めの洞窟と初期籠城（DAY 01）
開拓隊が最初に接触した天然地下構造。ゾンビ2体を目視するも、戦闘を最小限にとどめ石炭数個を回収。隊長ウタの「浅い洞窟だから大丈夫」という主観的判断が生存につながった稀有な例とされる。

### 2. 平原迷走と補給の失敗（DAY 02）
村落および羊毛の捜索を目的として座標 X:37 / Z:62 へ進出。しかし目撃された生物は牛1頭のみであり、捜索は完全な徒労に終わった。当時の調査日誌には「生き物の気配は皆無である」との悲観的なメモが残されている。

### 3. 断崖の亀裂と溶岩湖到達（DAY 03）
村落捜索を突如放棄し、巨大渓谷（X:116 / Z:342）へと侵入。急造の鉄装備を身につけ、深度 Y:-32 の**「深層巨大空洞」**において大規模なマグマ溜まりと接触。水バケツによる黒曜石化を行い、スケルトンの遠距離射撃を盾で防ぐなど、開拓史における最大の軍事作戦が展開された。

### 4. 第一拠点時計塔の竣工（DAY 04）
座標 X:0 / Y:75 / Z:0 にて、石レンガと木材を用いた高層建築「時計塔」が完成。夜間誘導用のグロウストーンが冠され、チェストの整理整頓が行われたことで、本格的な文明化への第一歩が刻まれた。

---

## 学術的評価と民俗学的考察

民俗学者ウタペディアの見解によれば：
> 「本遠征隊の行動パターンは、合理的計画性よりも『その場のノリと直感』に大きく依存している。しかしながら、DAY 03の渓谷突入から溶岩湖制圧、そしてDAY 04の時計塔建造に至る生存率は、統計学的な死線を見事に回避しており、極めて興味深い民俗記録である。」
`,
  },
};
