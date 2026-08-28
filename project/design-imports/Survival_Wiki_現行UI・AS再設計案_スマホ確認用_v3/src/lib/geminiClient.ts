import { LocationWithPhotos, WorldWithMembers } from '../types';

export async function generateAiWiki({
  world,
  locations,
  style,
}: {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  style: 'wikipedia' | 'scp' | 'ancient';
}): Promise<{ content: string; fallback?: boolean }> {
  try {
    const res = await fetch('/api/gemini/wiki', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        worldName: world.name,
        player: world.player,
        members: world.members.map((m) => m.name),
        locations: locations.map((l) => ({
          name: l.name,
          x: l.x,
          y: l.y,
          z: l.z,
          detail_memo: l.detail_memo,
          created_at: l.created_at,
        })),
        style,
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return { content: data.content, fallback: data.fallback };
  } catch (e: any) {
    console.warn('API error, using local generator:', e);
    return {
      content: getLocalWikiFallback(world, locations, style),
      fallback: true,
    };
  }
}

export async function generateSnsContent({
  worldName,
  locationName,
  memo,
  x,
  y,
  z,
}: {
  worldName: string;
  locationName: string;
  memo: string;
  x?: number;
  y?: number;
  z?: number;
}): Promise<{ text: string; hashtags: string[] }> {
  try {
    const res = await fetch('/api/gemini/sns-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worldName, locationName, memo, x, y, z }),
    });

    if (!res.ok) throw new Error('Failed to generate SNS content');
    return await res.json();
  } catch {
    const cleanWorldTag = `#${worldName.replace(/[\s-]/g, '')}`;
    const cleanLocTag = `#${locationName.replace(/[\s-]/g, '')}`;
    return {
      text: `【冒険記録】${locationName} (X:${x ?? 0} Y:${y ?? 64} Z:${z ?? 0})\n${memo || '新しい拠点を記録！'}\n\n${cleanWorldTag} ${cleanLocTag} #サバイバル日記 #UTAPEDIA`,
      hashtags: [cleanWorldTag, cleanLocTag, '#サバイバル日記', '#冒険の記録', '#UTAPEDIA'],
    };
  }
}

function getLocalWikiFallback(
  world: WorldWithMembers,
  locations: LocationWithPhotos[],
  style: 'wikipedia' | 'scp' | 'ancient'
): string {
  const memberList = world.members.map((m) => m.name).join('、') || '単独調査員';
  const locCount = locations.length;
  const nowStr = new Date().toLocaleDateString('ja-JP');

  if (style === 'wikipedia') {
    return `# ${world.name}
**${world.name}**（英: *${world.name} Chronicle*）は、探検者**${world.player || '名もなき生存者'}**および同行メンバー（${memberList}）によって開拓・記録されたサバイバル冒険領域である。${nowStr}時点で全${locCount}箇所の重要拠点が確認されている。

---

## 概要
本領域は多様な地形と未踏のダンジョン、天然資源を有する開拓地である。記録者**${world.player || '調査員'}**の初期活動は生存基盤の確保から始まり、段階的に広域探査網が構築された。

## 開拓と調査の歴史
${locations
  .map(
    (loc, i) => `### ${i + 1}. ${loc.name}（座標: X:${loc.x} Y:${loc.y} Z:${loc.z}）
- **記録日時:** ${loc.created_at ? new Date(loc.created_at).toLocaleDateString('ja-JP') : '記録初期'}
- **概要:** ${loc.detail_memo || '探検ログが保存されている重要地点。周囲の資源状況および安全性が確認された。'}
`
  )
  .join('\n')}

## 参加調査員・メンバー
- **主開拓者:** ${world.player || '名もなき生存者'}
- **協力開拓員:** ${memberList}

## 学術的総括
現在までに登録された${locCount}箇所の座標データは、この世界における生存戦略の確固たる足跡を示している。今後の深部探査とさらなる遺構調査が期待される。
`;
  } else if (style === 'scp') {
    return `# アイテム番号: SCP-7729-JP "${world.name}"
**オブジェクトクラス:** Euclid

**特別収容プロトコル:**
SCP-7729-JPは現在、指定調査員**[${world.player || 'REDACTED'}]**および随伴班（${memberList}）による現地調査下に置かれています。記録された全${locCount}箇所の特異座標群は定期的な監視下に置かれ、事象の拡大が抑止されています。

---

## 説明:
SCP-7729-JPは、未知のアルゴリズムに従って自己拡張を続ける開拓空間です。内部には複数の人工的・自然発生的特異地点が存在し、調査員による定期的なログ収集が行われています。

## 観測・探査ログ要約:
${locations
  .map(
    (loc, i) => `### [事象記録 #${i + 1}] 観測地点: 【${loc.name}】
- **座標値:** [X:${loc.x} / Y:${loc.y} / Z:${loc.z}]
- **事象メモ:** ${loc.detail_memo || '現地における異常性および生体反応の調査が完了。'}
`
  )
  .join('\n')}

## 付録 7729-A: 主任研究員コメント
「観測ログが示す通り、この世界における調査員の適応能力は極めて高い。これ以上の変異がない限り、現在の観測体制を維持する。」
`;
  } else {
    return `# 滅びし世界年代記: 《${world.name}の遺訓》

遥かなる時が流れ、星々がその輝きを失う頃、かつて**${world.player || '巡礼者'}**と呼ばれし者が踏み固めた大地**【${world.name}】**の記録がここに残された。

${memberList !== '単独調査員' ? `その傍らには、過酷なる風雪を共にした同胞たち（${memberList}）の足跡も確かに刻まれている。\n` : ''}

---

## 第一章: 刻まれし${locCount}の座標
${locations
  .map(
    (loc, i) => `### 其の${i + 1}: 【${loc.name}】の章
*「彼らは座標 [X:${loc.x}, Y:${loc.y}, Z:${loc.z}] へと至り、土を掘り、火を灯した。」*
${loc.detail_memo ? `> *${loc.detail_memo}*` : '> *静寂のなかに築かれた小さき砦よ。*'}
`
  )
  .join('\n')}

## 終章: 冒険者へ捧ぐ祈り
風は拠点の跡を吹き抜け、かつて燃え盛った松明の灰を散らす。
しかし、この冒険の書に刻まれた記憶は、世界が何度滅びようとも色褪せることはない。
`;
  }
}
