import { AnomalyArticleData } from '../types';

export const samplePhotos = [
  {
    id: 'ev-01',
    code: 'EV-01 // PRIME',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    title: '特異空間開口部：初期侵入地点',
    caption: '対象「ウタ」が警戒プロトコルを無視して掘削・突入した地下第1空洞の垂直開口部。異常な微弱発光が確認される。',
    timestamp: '2026-08-21 14:02:18 (JST)',
    coordinates: { x: 142, y: 64, z: -312 },
    sector: '第4地下境界区（セクターC）',
    status: 'VERIFIED' as const,
  },
  {
    id: 'ev-02',
    code: 'EV-02 // TRACE',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    title: '不審遺留物：放棄された簡易拠点',
    caption: '深度-48m地点にて回収された木製工作物。対象が一時的な作業場として構築した痕跡。周囲に知的活動の急激な低下を示す粗雑な投棄物が散乱。',
    timestamp: '2026-08-21 16:45:09 (JST)',
    coordinates: { x: 156, y: 16, z: -380 },
    sector: '深度-48m 岩盤層',
    status: 'VERIFIED' as const,
  },
  {
    id: 'ev-03',
    code: 'EV-03 // PHENOMENON',
    url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    title: '幾何学的異常構造：非ユークリッド回廊',
    caption: '採掘坑道の最深部で突如現出した規則的結晶構造。対象はこれを「鉱脈」と誤認し、危険認知を完全に失った状態で接触を試みた。',
    timestamp: '2026-08-21 19:12:44 (JST)',
    coordinates: { x: 189, y: -12, z: -440 },
    sector: '最深部 特異点コア周辺',
    status: 'ANOMALOUS' as const,
  },
  {
    id: 'ev-04',
    code: 'EV-04 // CORRUPTION',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    title: '生体反応撹乱：同行者の迷走軌跡',
    caption: '同行実体群が異常精神汚染下で描いた不規則な周回軌跡。空間のトポロジーが局所的に崩壊している可能性を排除できない。',
    timestamp: '2026-08-21 21:05:30 (JST)',
    coordinates: { x: 204, y: -28, z: -495 },
    sector: '深度-64m 磁気異常空洞',
    status: 'CORRUPTED' as const,
  },
  {
    id: 'ev-05',
    code: 'EV-05 // RESIDUAL',
    url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=1200&q=80',
    title: '事象収束痕：消失境界の残存テクスチャ',
    caption: '事象終了後の現地調査班による光学観測。対象個体の生体反応は一時断絶したものの、端末通信ログのみが一方的に受信され続けた。',
    timestamp: '2026-08-21 23:58:12 (JST)',
    coordinates: { x: 210, y: -30, z: -510 },
    sector: '事象消失境界ポイント',
    status: 'ANOMALOUS' as const,
  },
];

export const sampleArcArticle: AnomalyArticleData = {
  itemNumber: 'ARCH-7042',
  caseId: 'CASE-UTAPEDIA-0821-X',
  objectClass: 'EUCLID',
  securityClearance: 4,
  locationName: 'テストプレイ',
  recordingDate: '2026-08-21 14:02:18 EST',
  coordinates: { x: 142, y: 64, z: -312 },
  player: 'ウタ',
  companions: ['タロウ (D-7712)', 'NPC-09', '自動追尾型探査球'],
  totalRecordsCount: 6,
  doctorName: 'Dr. アーク',
  doctorTitle: '特異点観測・異常実体隔離部門 上級研究員',
  doctorComment:
    '「観察対象としての愚行は極めて純粋だ。あてもなく地表を穿ち、空間歪曲に触れてなお歓声を上げる。危機認知が完全に欠落した個体の末路を、貴重な反面教師データとして永久凍結保存する。」',
  warningNotice:
    '警告：本報告書は特異点事象監視機構（SOCO）保安規約第4条に基づきレベル4機密に指定されています。無許可の複写・外部端末への転送・閲覧権限の偽装は、即時クラスC記憶処理または隔離処分の対象となります。',
  executiveSummary:
    '本件は、未開拓特異領域『テストプレイ』内部にて発生した単独個体「ウタ」および随伴実体群による無統制な地底侵入事象（事象コード：ARC-EV-0821）の冷徹な観測記録である。被検体は環境の異常兆候を一切警戒せず、知的判断力の喪失に伴い特異点中心部へ接近。当機構の隔離介入直前における不可解な行動ログを整理・保管する。',
  sections: [
    {
      id: 'sec-01',
      number: '§ 1.0',
      title: '特別観測・隔離プロトコル (Special Containment Protocols)',
      subTitle: '空間封鎖要領及び被検体監視規程',
      paragraphs: [
        '対象領域『テストプレイ』の外周半径500m圏内は、物理的遮蔽フェンス及び低周波干渉装置により恒常的に隔離される。被検体「ウタ」が所持する記録端末との通信チャネルは、傍受プロトコル【PROTO-7042-ALPHA】によりリアルタイムでミラーリングされ、データ欠落が発生した場合は推測補完を行わず［解析不能］として即座に処理される。',
        '現地研究員は被検体との直接的な言語接触を厳禁とする。被検体は自己の行動を「探索」「開発」「遊戯」などと認識しているが、これは初期段階の認識阻害または軽度の現実歪曲暴露による精神弛緩症状である可能性を排除できない。万一、被検体が異常回廊から地上へ脱出を試みた場合は、遠隔催眠ガスおよび［編集済］を用いて速やかに原点へ再移送すること。',
      ],
      callout: {
        type: 'PROTOCOL',
        label: '指令書抜粋：ARCH-DOC-704',
        text: '「被検体への慈悲や助言は一切不要。愚かな試行錯誤のプロセスそのものが、空間異常の反応閾値を測るための最良の触媒である。」 —— Dr. アーク',
      },
    },
    {
      id: 'sec-02',
      number: '§ 2.0',
      title: '対象概要及び事象空間特性 (Description & Spatial Properties)',
      subTitle: '深度低下に伴う空間トポロジーの崩壊',
      paragraphs: [
        '対象領域『テストプレイ』は、外見上は典型的な低密度山岳森林地帯の体裁をとっているが、深度15m以深において明らかな局所的ユークリッド幾何学の破綻が観測されている。被検体「ウタ」は2026年8月21日14時頃、初歩的な物理掘削器具を用いて地表を垂直に掘削。地殻構造を無視した無謀な直下掘りを開始した。',
        '当該行動は地質力学的に極めて初歩的な自殺行為であるが、対象は落下死の危険を顧みず無灯火の空洞群へ侵入。深度が深まるにつれ、被検体の生体モニタリング値には著しい集中力の散漫と、論理的思考能力の段階的崩壊（以降、「知的迷走期」と呼称）が記録された。',
      ],
      evidenceAttached: ['ev-01'],
    },
    {
      id: 'sec-03',
      number: '§ 3.0',
      title: '時系列観測記録：事象ログ ARC-0821-L (Observation Timeline Logs)',
      subTitle: '知的崩壊の進行と非合理的行動の時系列推移',
      paragraphs: [
        '以下のログは、被検体の記録端末から自動吸い上げられた断片情報及び定点観測センサーの記録を照合した時系列調書である。被検体の発言は文法的一貫性を急速に失っており、言語中枢に対する特異空間の影響が強く示唆されている。',
      ],
      logEntries: [
        {
          time: '14:02:18 [深度 -12m]',
          speaker: '被検体「ウタ」',
          text: '「とりあえず真下に掘れば何かあるだろ。石炭見つけたから松明作るわ。」',
          severity: 'NORMAL',
        },
        {
          time: '16:45:09 [深度 -48m]',
          speaker: '被検体「ウタ」',
          text: '「あれ、どっから降りてきたっけ……まあいいや、もっと下に変なブロックあるし。」',
          severity: 'CAUTION',
        },
        {
          time: '19:12:44 [深度 -64m]',
          speaker: '観測班記録',
          text: '対象は幾何学的異常結晶体に接触。被検体の瞳孔散大及び脈拍急増を観測。言語的発声は途絶え、意味不明な奇声のみがマイクに記録される。',
          severity: 'CRITICAL',
        },
        {
          time: '21:05:30 [深度 不明]',
          speaker: '被検体「ウタ」',
          text: '「█████……あ、これ、戻れないやつだ……でもなんか光ってるから拾う……」',
          severity: 'CRITICAL',
        },
      ],
      evidenceAttached: ['ev-02', 'ev-03'],
    },
    {
      id: 'sec-04',
      number: '§ 4.0',
      title: '同行実体群の挙動及び二次汚染評価 (Auxiliary Entity Dynamics)',
      subTitle: '随伴ユニットの異常同期現象',
      paragraphs: [
        '被検体に随伴していた実体群（識別コード：タロウ、NPC-09）に関しても、主被検体と同様の危機認知欠如が確認された。通常、知性体であれば環境崩壊の予兆を感知して退避行動をとるはずであるが、同行者らは被検体「ウタ」の迷走に無批判に追従。狭小な岩盤亀裂内において互いに衝突を繰り返すなど、低知性AI特有のスタック行動を示した。',
        'この現象は空間異常による集団パニック誘発の一種か、あるいは単に個体群の基礎判断能力が極度に低劣であった結果と推察される。現時点では詳細不明。',
      ],
      evidenceAttached: ['ev-04'],
    },
    {
      id: 'sec-05',
      number: '§ 5.0',
      title: '結論及び研究主任付記 (Analytical Conclusion & Addendum)',
      subTitle: '特異点収束と次期実験体選定に関する提言',
      paragraphs: [
        '事象ARC-0821を通じて得られたデータは、人類の一般的な一般個体がいかに容易に警告シグナルを軽視し、自滅的な探索衝動に呑まれるかを如実に示している。被検体が遺したログの支離滅裂さは喜劇的ですらあるが、空間歪曲の実効深度測定には一定の貢献を果たした。',
        '今後の運用方針として、領域『テストプレイ』の封鎖壁を現行のまま維持し、被検体「ウタ」の生体シグナルが再検知された場合は速やかに再隔離を行うものとする。これ以上の無知な侵入者による汚染拡大は許容されない。',
      ],
      callout: {
        type: 'WARNING',
        label: '最高機密付記：Dr. アーク直筆サイン',
        text: '「彼らは自分が神聖な冒険者であると錯覚している。だが実際には、瓶の中に自ら飛び込んで蓋を閉めた虫に過ぎない。この調書を永久機密アーカイブへ格納せよ。」',
      },
      evidenceAttached: ['ev-05'],
    },
  ],
  shortExecutiveSummary:
    '本件は、未開拓領域『テストプレイ』において観測された被検体「ウタ」の無統制な地底掘削及び知的迷走事象の緊急要約記録である。',
  shortSections: [
    {
      id: 'short-sec-01',
      number: '§ 1.0',
      title: '特別観測プロトコル (Special Containment Protocols)',
      paragraphs: [
        '対象領域『テストプレイ』の外周は常時隔離され、被検体「ウタ」の記録端末通信はリアルタイムでミラーリングされる。直接接触は厳禁とする。',
      ],
    },
    {
      id: 'short-sec-02',
      number: '§ 2.0',
      title: '対象概要及び事象推移 (Description & Incident Summary)',
      paragraphs: [
        '被検体は深度-64m地点まで無謀な垂直採掘を強行。空間トポロジーの崩壊に巻き込まれつつも、危険認知を完全に失った状態で探索を継続した。',
      ],
      evidenceAttached: ['ev-01'],
    },
  ],
  photos: samplePhotos,
};
