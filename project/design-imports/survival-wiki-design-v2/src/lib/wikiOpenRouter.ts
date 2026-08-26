import type { LocationWithPhotos, WorldWithMembers } from './types';

export const openRouterTestProvider = {
  generate: async ({
    world,
    locations,
    style,
  }: {
    world: WorldWithMembers;
    locations: LocationWithPhotos[];
    style: string;
  }): Promise<{ content: string }> => {
    // Artificial latency for 16-bit cyber generation effect
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const locNames = locations.map((l) => l.name).join('、');
    const memberNames = world.members.map((m) => m.name).join('、') || '単独行動';
    const player = world.player || '名無しの生存者';

    if (style === 'wikipedia') {
      return {
        content: `# ${world.name}

**${world.name}**（英: *${world.name.replace(/[^\w\s]/gi, '') || 'Sector Chronicle'}*）は、探検者 **${player}** およびその同行者ら（${memberNames}）によって開拓・調査された未踏領域の総称である。本項では、当地における探査記録、主要な拠点座標、および学術的考察について記述する。

---

## 概要と地理的環境

本領域は極めて過酷な環境下にあり、生存資源の枯渇と通信障害が常態化している。探検者 ${player} らの活動記録によれば、初期の移動ルートは著しく無計画でありながらも、偶然にも複数の重要拠点が確保されている点が民俗学者らの強い関心を引いている。

> 「ふむ、記録を精査する限り、彼らは行き当たりばったりで前進したに過ぎないが、結果として驚くべき生存日数を叩き出しているようだね。」
> ―― *民俗学者 エルナン『荒野編纂録』第4巻より*

---

## 主要な調査拠点

現在までに以下の **${locations.length} 箇所** の座標が正式に確認されている。

${locations
  .map(
    (loc, i) => `### ${i + 1}. ${loc.name}
- **空間座標**: \`X: ${loc.x} / Y: ${loc.y} / Z: ${loc.z}\`
- **初回記録日時**: ${new Date(loc.created_at).toLocaleString('ja-JP')}
- **調査メモ**:
  ${loc.detail_memo ? `> ${loc.detail_memo}` : '*(特記事項なし)*'}
- **同行者**: ${loc.members.length > 0 ? loc.members.map((m) => m.name).join(', ') : '単独'}
`
  )
  .join('\n')}

---

## 生存活動の考察

探索班は、各地点において物資の備蓄および防衛ラインの設営を行っている。しかしながら、記録に残るメモの大半は「空腹」「残弾数への不安」「迷子」に関する記述で占められており、高度な戦略的意図を見出すことは困難である。

それにもかかわらず、本セクターで得られた環境サンプルと座標データは、後続の生存者ギルドにとってかけがえのない道標となっている。

---

## 関連項目
- ウタペディア冒険アーカイブ
- サバイバル工学概論
- 旧文明地下シェルター群
`,
      };
    }

    if (style === 'scp') {
      return {
        content: `# アイテム番号: LOG-AREA-${world.id.slice(-4).toUpperCase()}

**オブジェクトクラス**: Euclid / Active Sector

**特別収容プロトコル**:
対象領域 **${world.name}** への一般職員の無断進入は厳禁とする。対象地点には常時、観測者 **${player}** および指定被験体班（${memberNames}）が駐留し、定期的な座標テレメトリを送信しなければならない。異常空間歪曲が検知された場合は、直ちに最寄りの防護バンカーへ退避すること。

---

## 説明

本オブジェクトは、座標軸が著しく不安定な終末隔離区画である。記録班 ${player} の送信ログに基づき、以下の特異地点が登録されている。

${locations
  .map(
    (loc) => `### 特異地点: ${loc.name}
- **空間位置特定パラメータ**: \`[X:${loc.x}, Y:${loc.y}, Z:${loc.z}]\`
- **タイムスタンプ**: \`${loc.created_at}\`
- **現場観測ログ**:
  \`\`\`
  ${loc.detail_memo || '詳細観測データは暗号化されています。'}
  \`\`\`
`
  )
  .join('\n')}

---

## 補遺: 上級研究員 Dr.アークの所見

> 「……記録を再読した。探検班は自らが特異現象の渦中にいる自覚が薄いようだが、彼らが生存し続けている事実こそが最大の異常現象と言える。次期サバイバルフェーズへの移行を許可する。」
`,
      };
    }

    // Ancient style
    return {
      content: `# 《滅びの年代記：${world.name}の章》

かつて天が裂け、大地が冷え切った時代――
名もなき旅人 **${player}** と、その影に寄り添う者たち（${memberNames}）は、救いなき荒野へと歩みを進めた。

風は過去の栄華を砂へと変え、ただ錆びた鉄柱と凍てつく水晶だけが、世界の終焉を静かに見守っていた。

---

## 第一節：刻まれし足跡

旅人たちが遺した石板には、幾重にも重なる座標と、震える手で刻まれた言葉が残されている。

${locations
  .map(
    (loc) => `### ◆ ${loc.name}
*「天の標 X:${loc.x}、地の深さ Y:${loc.y}、遥かなる Z:${loc.z}」*

${loc.detail_memo ? `> 『${loc.detail_memo}』` : '*(風化により言葉は失われている)*'}
`
  )
  .join('\n\n')}

---

## 結び：滅びゆく世界の片隅で

彼らが何を求め、どこへ消えたのかを知る者はもういない。
だが、この古文書を開く旅人よ。
彼らの灯した小さな焚き火の温もりだけは、今もこの荒野のどこかで、静かに息づいているのだ。

―― *老吟遊詩人 ギルダス 記す*
`,
      };
  },
};
