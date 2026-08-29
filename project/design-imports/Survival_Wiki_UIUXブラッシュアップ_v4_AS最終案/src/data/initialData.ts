import { World, LocationRecord, WikiNpc, WikiArticle, SoundEffectMeta, AudioSettings } from '../types';

export const INITIAL_WORLDS: World[] = [
  {
    id: 'world-1',
    slotNumber: 1,
    name: 'エメラルド諸島開拓記',
    leaderName: 'Uta_Adventurer',
    leaderAvatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-12',
    memo: '東部沿岸の拠点設営と古代水没神殿の解明を目指す探検プロジェクト。',
    daysCount: 14,
    recordsCount: 6,
    lastRecordAt: '2026-08-29 18:45',
    partyMembers: [
      { id: 'p1', name: 'Alisa (偵察)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
      { id: 'p2', name: 'Garrick (建築)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
      { id: 'p3', name: 'Kael (採取)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'world-2',
    slotNumber: 2,
    name: '第7地下大空洞調査隊',
    leaderName: 'Valen_Geologist',
    leaderAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01',
    memo: '深度Y=-54に広がる発光キノコバイオームと溶岩回廊の鉱脈マッピング。',
    daysCount: 28,
    recordsCount: 12,
    lastRecordAt: '2026-08-28 22:10',
    partyMembers: [
      { id: 'p4', name: 'Nixie (採掘)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80' },
      { id: 'p5', name: 'Thorin (防衛)', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'world-3',
    slotNumber: 3,
    name: '星屑の天空古城',
    leaderName: 'Mira_Skywalker',
    leaderAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-20',
    memo: '高度Y=240に浮かぶ古代遺構の修復とグリフィン営巣地の保全。',
    daysCount: 42,
    recordsCount: 15,
    lastRecordAt: '2026-08-25 15:30',
    partyMembers: [
      { id: 'p6', name: 'Elysia (魔導)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80' },
    ],
  },
];

export const INITIAL_RECORDS: Record<string, LocationRecord[]> = {
  'world-1': [
    {
      id: 'rec-1',
      worldId: 'world-1',
      title: '第一前哨基地・灯台テラスの完成',
      memo: '海岸沿いの断崖に木造監視塔とビーコンを設置。夜間の航行とモンスター襲撃に対する防衛視界が大幅に確保された。',
      photoUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      ],
      createdAt: '2026-08-29T18:45:00Z',
      dayNumber: 14,
      hasExplicitCoordinates: true,
      coordinates: { x: 342, y: 78, z: -128 },
      companions: ['Garrick (建築)', 'Alisa (偵察)'],
    },
    {
      id: 'rec-2',
      worldId: 'world-1',
      title: 'エメラルド珊瑚礁と海中洞窟の入口',
      memo: '浅瀬の底に青く輝く裂け目を発見。海中呼吸ポーションを携帯して内部の鍾乳石群を探索予定。',
      photoUrl: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-08-29T14:20:00Z',
      dayNumber: 14,
      hasExplicitCoordinates: true,
      coordinates: { x: 410, y: 46, z: -90 },
      companions: ['Alisa (偵察)'],
    },
    {
      id: 'rec-3',
      worldId: 'world-1',
      title: '原初の樹海中央：巨大ツリーハウス',
      memo: '巨木の幹を螺旋階段で囲み、3層構造の食料備蓄庫と観測フロアを設営。野生のオウムが生息している。',
      photoUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      photos: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop&q=80',
      ],
      createdAt: '2026-08-28T17:15:00Z',
      dayNumber: 13,
      hasExplicitCoordinates: true,
      coordinates: { x: 0, y: 0, z: 0 }, // Explicit 0,0,0 coordinate test case!
      companions: ['Garrick (建築)', 'Kael (採取)'],
    },
    {
      id: 'rec-4',
      worldId: 'world-1',
      title: '古びた沈没船の積荷回収',
      memo: '砂浜に打ち上げられたキャラベル船の船室から金塊6個と水没した宝の地図の断片を発見。',
      photoUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-08-28T11:00:00Z',
      dayNumber: 13,
      hasExplicitCoordinates: false, // Omitted coordinates test case!
      companions: ['Kael (採取)'],
    },
    {
      id: 'rec-5',
      worldId: 'world-1',
      title: '玄武岩の峡谷と溶岩滝',
      memo: '黒く切り立った断崖の奥からマグマが流出。黒曜石の採掘ポイントとしてマーク。周囲は高熱につき耐火装備が必須。',
      photoUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-08-25T16:40:00Z',
      dayNumber: 10,
      hasExplicitCoordinates: true,
      coordinates: { x: -185, y: 32, z: 540 },
      companions: ['Alisa (偵察)', 'Garrick (建築)'],
    },
    {
      id: 'rec-6',
      worldId: 'world-1',
      title: '初期スポーン地点の木造仮拠点',
      memo: '上陸初日に建てた丸太小屋。現在は予備の作業台と簡易チェストのみ残し、補給ポイントとして運用。',
      photoUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-08-12T09:30:00Z',
      dayNumber: 1,
      hasExplicitCoordinates: true,
      coordinates: { x: 12, y: 64, z: -5 },
      companions: [],
    },
  ],
  'world-2': [],
  'world-3': [],
};

export const INITIAL_NPCS: WikiNpc[] = [
  {
    id: 'hernan',
    style: 'encyclopedia',
    name: '民俗学者 エルナン',
    shortStyleName: '百科事典',
    role: '帝国学術院 百科事典編纂官',
    title: '百科事典スタイル',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80',
    color: 'amber',
    greeting: '「日々の記録こそが人類の叡智です。客観的かつ体系的な百科事典として、この諸島の歴史を編纂いたしましょう。」',
    compilingQuote: [
      '「各拠点の地理データと採取ログを照合中……」',
      '「沿岸部の水文学的記録および建築史料を体系化しています。」',
      '「客観的記述に統一し、学術典籍としての索引を作成中……」',
      '「編纂完了。正式な百科事典記事として製本されました。」',
    ],
    finishedQuote: '「諸君の足跡が、見事な百科事典の一章として定着いたしました。どうぞご査収ください。」',
    description: '白基調の格式あるWikipedia風レイアウト。地理・建築・生態系・歴史的経緯を論理的かつ網羅的に記録します。',
  },
  {
    id: 'ark',
    style: 'scp',
    name: '特異点研究員 Dr.アーク',
    shortStyleName: 'SCP調',
    role: '最高機密研究班 主任調査員',
    title: 'SCP風アーカイブ',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80',
    color: 'cyan',
    greeting: '「対象海域における異常現象および構造体の観測ログを受領した。セキュリティクリアランスに基づき記録を文書化する。」',
    compilingQuote: [
      '「異常存在（Anomaly）の分類プロトコルを実行中……」',
      '「特別収容プロトコル（Special Containment Procedures）の草案作成中……」',
      '「機密事項の墨塗り処理および脅威度査定中……」',
      '「文書アーカイブ完了。クリアランスレベル3を付与。」',
    ],
    finishedQuote: '「調査報告書 [ITEM-EMERALD-09] の作成を完了した。閲覧には機密保持契約が適用される。」',
    description: '暗色シアンの機密文書レイアウト。脅威度・収容プロトコル・実験記録の文体で探検の未知を鋭く切り取ります。',
  },
  {
    id: 'gildas',
    style: 'ancient',
    name: '老吟遊詩人 ギルダス',
    shortStyleName: '古代伝承',
    role: '狂学者・古文書の語り部',
    title: '古代伝承・叙事詩',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80',
    color: 'emerald',
    greeting: '「風が歌い、波が囁く……。古き神々の眠る島へ足を踏み入れた勇者たちの物語を、叙事詩として紡ごうではないか。」',
    compilingQuote: [
      '「羊皮紙に古文字を刻み、星々の配列を読み解いております……」',
      '「風の精霊が語る開拓者たちの軌跡を詩句へと昇華中……」',
      '「神話の幕開けにふさわしい韻律を整えております……」',
      '「叙事詩の章句が完成いたしました。語り継がれよ！」',
    ],
    finishedQuote: '「讃えよ、幾多の苦難を越えた開拓者たちよ！ 汝らの軌跡は永遠の詩として刻まれたのだ！」',
    description: '琥珀色の羊皮紙と古文書フォントによる詩的クロニクル。神話や叙事詩のトーンで開拓の冒険譚をドラマチックに描きます。',
  },
];

export const WIKI_NPCS = INITIAL_NPCS;

export const INITIAL_ARTICLES: Record<string, WikiArticle> = {
  'world-1_encyclopedia': {
    id: 'art-1',
    worldId: 'world-1',
    style: 'encyclopedia',
    npcId: 'hernan',
    title: 'エメラルド諸島開拓史：東部沿岸域と海中遺構の総合知見',
    subtitle: '学術編纂資料 第XIV巻 // 編纂官 エルナン監修',
    summary: 'エメラルド諸島（Emerald Archipelago）は、熱帯性海洋気候と豊富な鉱物資源を有する未開群島である。本項ではUta_Adventurer率いる開拓隊による14日間の開拓活動、重要拠点、生態調査について総括する。',
    keyStats: [
      { label: '総探索日数', value: '14 DAYS' },
      { label: '確認登録拠点', value: '6 箇所' },
      { label: '主要構成メンバー', value: 'Uta, Alisa, Garrick, Kael' },
      { label: '最高到達標高', value: 'Y=78 (監視灯台)' },
      { label: '最深到達深度', value: 'Y=46 (海中鍾乳洞)' },
      { label: '開拓ステータス', value: '第1期沿岸防衛完了' },
    ],
    contentMarkdown: `## 1. 地理的概要と開拓の端緒

**エメラルド諸島**は、温暖な海洋生態系と複雑な玄武岩質地形が融合した未踏海域群島である。調査隊は2026年8月12日に[初期スポーン地点の木造仮拠点]へ初上陸を果たし、沿岸部に仮設の補給拠点を構築した。

初期段階においては木材および基礎石材の確保を最優先とし、野生生物の襲撃に備えた簡素な防壁が設けられた。

---

## 2. 主要建築物および観測施設

開拓隊の土木技師Garrick主導のもと、海岸線沿いの戦略的要所において以下の重要施設が完成している。

* **[第一前哨基地・灯台テラスの完成]**:
  断崖絶壁（標高Y=78）にそびえる木造石混交の灯台。海上の視界確保および夜間帰還時のビーコンとして機能し、半径500m圏内の安全保障を確立した。
* **[原初の樹海中央：巨大ツリーハウス]**:
  原初の樹海中央にそびえる巨大樹の幹を活用した3層構造拠点。中層は乾物・採取種子の備蓄庫、最上層は天候観測フロアとして運用されている。

---

## 3. 海洋調査と未解明遺構

偵察員Alisaおよび採取班Kaelの潜水調査により、浅瀬海底に大規模な[エメラルド珊瑚礁と海中洞窟の入口]が確認された。洞窟深部からは微弱な発光現象が観測されており、古代海洋文明の祭祀跡である可能性が指摘されている。

また、北西浜辺においては[古びた沈没船の積荷回収]が実施され、金塊および未解読の古地図断片が学術保管された。

---

## 4. 結論および今後の展望

エメラルド諸島における第1期開拓は所期の目標を上回る成果を収めた。今後は玄武岩峡谷の鉱物採掘網の確立と、海中神殿への本格的潜水探査が期待される。`,
    photoUrls: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80',
    ],
    generatedAt: '2026-08-29 19:00',
    featuredRecordIds: ['rec-1', 'rec-2', 'rec-3', 'rec-4'],
  },
  'world-1_scp': {
    id: 'art-2',
    worldId: 'world-1',
    style: 'scp',
    npcId: 'ark',
    title: '文書アーカイブ：ITEM-EMERALD-09「諸島海域異常構造群」',
    subtitle: 'クリアランスレベル 3/EMERALD 機密分類 // 担当研究員：Dr.アーク',
    summary: '対象はエメラルド海域周辺に突如発現した非ユークリッド構造物群および局所的生息環境である。開拓工作員（指定コード：Uta-01）の行動記録をもとに暫定収容プロトコルを策定。',
    keyStats: [
      { label: 'アイテム番号', value: 'ITEM-EMD-009' },
      { label: 'オブジェクトクラス', value: 'Euclid / 警戒' },
      { label: '管轄サイト', value: '臨時前哨セクター-A' },
      { label: '空間座標', value: 'X: 342, Y: 78, Z: -128' },
      { label: '観測特異点数', value: '4 事象' },
    ],
    contentMarkdown: `## 特別収容プロトコル (Special Containment Procedures)

ITEM-EMD-009に指定された各異常構造物は、現地駐留部隊（コードネーム: 開拓団）により常時監視される。

対象領域の周囲には[第一前哨基地・灯台テラスの完成]を中継施設とする電磁観測網を展開し、民間船舶および未知勢力の接近を阻止せよ。海底深度Y=46に存在する[エメラルド珊瑚礁と海中洞窟の入口]への侵入は、認可された潜水装備を持つ人員のみに制限される。

---

## 説明 (Description)

ITEM-EMD-009は、自然発生した生態系を模倣しながらも、物理法則に反する構造的安定性を示す一連の建造物および自然地形の総称である。

* **事例09-A (ツリーハウス)**:
  巨大樹木の中央に設けられた構造体。中央座標(X:0, Y:0, Z:0)において重力歪曲が微小に観測されるが、現時点で開拓隊の生活活動に致命的影響は確認されていない。
* **事例09-B (海底裂溝)**:
  海水圧に抵抗して発光を放つ未知の鍾乳石結晶。結晶から放出される音響波は精神影響を誘発する恐れがあるため、長時間の潜水は禁じられている。

---

## 補遺: 探査ログ抜粋 (Addendum)

> **記録日 2026-08-28**: 浜辺にて漂着した未登録帆船の残骸（[古びた沈没船の積荷回収]）を調査。船内より回収された地図には、現行の海洋図に存在しない第4の大陸が明記されていた。Dr.アークによる更なる暗号解読が進行中である。`,
    photoUrls: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?w=800&auto=format&fit=crop&q=80',
    ],
    generatedAt: '2026-08-29 19:15',
    featuredRecordIds: ['rec-1', 'rec-2', 'rec-3'],
  },
};

export const INITIAL_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.75,
  reverbLevel: 0.3,
  isMuted: false,
  seVolume: 0.8,
  seEnabled: true,
  bgmChannels: {
    ch1: true,
    ch2: true,
    ch3: true,
    ch4: true,
  },
};

export const SOUND_EFFECTS_CATALOG: SoundEffectMeta[] = [
  // 1. SYSTEM / UI
  { id: 'menu_select', name: '決定音 (DECIDE)', category: 'menu', description: '琥珀ボタンの確定・選択音', synthType: '2-Pulse Chime' },
  { id: 'menu_cursor', name: 'カーソル移動 (CURSOR)', category: 'menu', description: 'フォーカス移動時の軽いクリック', synthType: 'Square Click' },
  { id: 'menu_back', name: '戻る (CANCEL)', category: 'menu', description: 'キャンセル・階層戻りの下降音', synthType: 'Desc-Square' },
  { id: 'tab_switch', name: 'タブ切替 (TAB FLIP)', category: 'menu', description: '記録とWikiのメインタブ切替音', synthType: 'Sine Gliss' },
  { id: 'sys_toggle', name: 'スイッチ切替 (SWITCH)', category: 'menu', description: 'トグルスイッチ操作音', synthType: 'Fast Pip' },
  { id: 'sys_error', name: 'システム警告 (ERROR)', category: 'menu', description: '無効操作・エラーの短い警告音', synthType: 'Low Buzz' },
  { id: 'danger_delete', name: '危険操作 (DANGER)', category: 'menu', description: 'ワールド削除・リセットの警告音', synthType: 'Low-Saw Alarm' },

  // 2. RECORD / LOG
  { id: 'new_record', name: 'クイックログ作成 (LOG)', category: 'record', description: '新規記録登録時の軽快な上昇和音', synthType: 'Up-Square' },
  { id: 'save_record', name: '記録セーブ (SAVE)', category: 'record', description: '冒険の書へ書き込まれたファンファーレ', synthType: '4-Arp Triangle' },
  { id: 'chest_open', name: '宝箱開放 (CHEST OPEN)', category: 'record', description: 'CHESTを開けたときの重厚な開放音', synthType: 'Saw-Tri Blend' },
  { id: 'photo_shutter', name: 'カメラ撮影 (SHUTTER)', category: 'record', description: '写真追加時のシャッター効果音', synthType: 'Mechanical Click' },
  { id: 'pos_ping', name: '座標ピン (COORDINATES)', category: 'record', description: 'X/Y/Z座標入力・照合時の電子音', synthType: 'Double Sine Ping' },
  { id: 'marker_set', name: 'マーカー設置 (MARKER)', category: 'record', description: '地図・ログ位置固定音', synthType: 'Hi-Pulse' },

  // 3. WIKI & NPC
  { id: 'wiki_npc_select', name: 'NPC対話 (NPC TALK)', category: 'wiki', description: '3NPCカード選択時のシグネチャ音', synthType: 'Triangle Major' },
  { id: 'compile_start', name: '編纂開始 (COMPILE START)', category: 'wiki', description: 'AI自動編纂開始のチャージ音', synthType: 'Sweep Arp' },
  { id: 'typewriter_beep', name: '文字送り (TYPEWRITER)', category: 'wiki', description: '編纂待機中の16bitタイピング音', synthType: 'Noise-Tone' },
  { id: 'wiki_ready', name: 'Wiki完成 (WIKI READY)', category: 'wiki', description: 'AI編纂が完了し記事が読める状態の歓喜音', synthType: 'Victory Chime' },
  { id: 'speech_bubble', name: '吹き出し表示 (BUBBLE)', category: 'wiki', description: 'NPCセリフ表示時のポップ音', synthType: 'Soft Bubble' },

  // 4. ACTION & FEEDBACK
  { id: 'copy_success', name: 'テキスト複写 (CLIPBOARD)', category: 'action', description: 'SNS文・記事コピー成功のキラリ音', synthType: 'High Sine Bell' },
  { id: 'share_post', name: 'SNSシェア (POST)', category: 'action', description: 'X投稿インテント起動音', synthType: 'Ascend Bell' },
  { id: 'search_filter', name: '絞り込み (FILTER)', category: 'action', description: 'キーワード検索ヒット音', synthType: 'Micro Blip' },
  { id: 'level_up', name: 'レベルアップ (LEVEL UP)', category: 'action', description: '開拓度・達成度上昇時のファンファーレ', synthType: 'Maj Arp' },
  { id: 'quest_clear', name: '目標達成 (QUEST CLEAR)', category: 'action', description: '調査目標完了時のジングル', synthType: 'Bright Fanfare' },
  { id: 'time_tick', name: 'タイムスタンプ (CLOCK)', category: 'action', description: '日付・時刻更新音', synthType: 'Wood Click' },
];

export const SOUND_EFFECTS_LIST = SOUND_EFFECTS_CATALOG;
