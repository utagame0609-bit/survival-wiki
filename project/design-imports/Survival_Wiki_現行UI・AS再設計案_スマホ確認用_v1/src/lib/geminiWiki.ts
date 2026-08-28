import { World, AdventureRecord, WikiStyle, WikiArticle } from '../types';

export async function generateWikiChronicle(
  world: World,
  records: AdventureRecord[],
  style: WikiStyle
): Promise<WikiArticle> {
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  const uniqueDays = Array.from(new Set(records.map((r) => r.dayNumber))).length;
  const uniqueLocations = Array.from(new Set(records.map((r) => r.locationName))).length;
  const totalPhotos = records.reduce((acc, r) => acc + (r.photos?.length || 0), 0);

  // Attempt server-side Gemini API call first
  try {
    const res = await fetch('/api/wiki/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ world, records: sortedRecords, style }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.content && data.title) {
        return {
          id: `wiki-${world.id}-${style}-${Date.now()}`,
          worldId: world.id,
          style,
          title: data.title,
          summary: data.summary || `${world.name}の全${records.length}件の記録に基づく${style}スタイル編纂記録。`,
          content: data.content,
          generatedAt: new Date().toISOString(),
          stats: {
            recordsCount: records.length,
            daysCount: uniqueDays,
            photosCount: totalPhotos,
            locationsCount: uniqueLocations,
          },
        };
      }
    }
  } catch {
    // Fallback to client-side procedural generator
  }

  // High-craft procedural generation tailored to records
  return generateProceduralChronicle(world, sortedRecords, style, {
    recordsCount: records.length,
    daysCount: uniqueDays,
    photosCount: totalPhotos,
    locationsCount: uniqueLocations,
  });
}

function generateProceduralChronicle(
  world: World,
  records: AdventureRecord[],
  style: WikiStyle,
  stats: { recordsCount: number; daysCount: number; photosCount: number; locationsCount: number }
): WikiArticle {
  const memberListStr = world.members.map((m) => `${m.name}（${m.role || '同行者'}）`).join('、');
  const primaryLocations = records.slice(0, 6);

  if (style === 'wikipedia') {
    const title = `${world.name} 開拓調査年代記`;
    const summary = `記録主「${world.player}」および調査隊による、${stats.daysCount}日間にわたる全${stats.recordsCount}地点の活動記録・地理学的百科事典記事。`;

    const locationSections = primaryLocations
      .map((r) => {
        const coordsStr = r.coords ? `（座標: X:${r.coords.x ?? 0} / Y:${r.coords.y ?? 0} / Z:${r.coords.z ?? 0}）` : '';
        const photosStr = r.photos?.length ? `\n> 📷 *添付写真記録: ${r.photos.map((p) => p.caption || '現地観測図').join(', ')}*` : '';
        return `### DAY ${String(r.dayNumber).padStart(2, '0')} // ${r.locationName} ${coordsStr}
**記録日時:** ${r.recordedAt} ｜ **区分:** ${r.category.toUpperCase()} ｜ **同行者:** ${r.memberIds.map((id) => world.members.find((m) => m.id === id)?.name || id).join(', ')}

${r.memo}
${photosStr}`;
      })
      .join('\n\n');

    const content = `# ${title}

**${world.name}**（英: *${world.name} Historical Expedition Chronicle*）は、${world.player}率いる開拓隊によって記録された、全${stats.recordsCount}件の行動・地理・生存記録である。

---

## 1. 概要と参加構成員

本記録は、${world.genre === 'game' ? '未踏世界のサバイバルおよび拠点構築' : world.genre === 'travel' ? '各地の景勝地および郷土食の探訪' : '未知の領域における探求と記録'}を目的として実施された。

- **総責任者（プレイヤー）:** ${world.player}
- **同行構成員:** ${memberListStr || '単独行'}
- **記録期間:** 全 ${stats.daysCount} 日間（観測地点: ${stats.locationsCount} 箇所 / 写真資料: ${stats.photosCount} 枚）
- **活動概要メモ:** ${world.memo || '特筆すべき事前計画なし'}

---

## 2. 時系列調査記録

${locationSections}

---

## 3. 地理学的・民俗学的総括

ウタペディア民俗調査局の分析によれば、記録主**${world.player}**の行動原理は計画性よりも「好奇心に起因する即興的突撃」に重きが置かれている。
とりわけ初期の危機的状況における判断力と、困難を乗り越えて完成させた拠点・旅程の密度は、学術的にも極めて高い史料価値を有していると結論づけられる。
`;

    return {
      id: `wiki-${world.id}-wikipedia-${Date.now()}`,
      worldId: world.id,
      style: 'wikipedia',
      title,
      summary,
      content,
      generatedAt: new Date().toISOString(),
      stats,
    };
  }

  if (style === 'scp') {
    const title = `アイテム番号: SCP-LOG-${world.id.slice(-4).toUpperCase()} // 「${world.name}」`;
    const summary = `特別収容プロトコル・特異点探査記録。対象観測者「${world.player}」の行動による空間事象報告。`;

    const incidentLogs = primaryLocations
      .map((r, idx) => {
        const coordsStr = r.coords ? `[X:${r.coords.x} Y:${r.coords.y} Z:${r.coords.z}]` : '[座標隠蔽]';
        return `#### 事案記録 ${String(idx + 1).padStart(2, '0')} // DAY-${String(r.dayNumber).padStart(2, '0')} 地点: ${r.locationName}
- **発生日時:** ${r.recordedAt}
- **時空座標:** ${coordsStr}
- **関与個体:** エージェント・${world.player}, ${r.memberIds.join(', ')}
- **現地観測メモ:** 「${r.memo}」
- **研究員注記:** *対象空間において微弱な現実歪曲反応を検出。${r.importance === 'legendary' ? '【警告】特異度クラスIVに指定。' : '現状は収容下にある。'}*`;
      })
      .join('\n\n');

    const content = `# ${title}

**オブジェクトクラス:** Euclid (暫定)

**特別収容プロトコル:**
SCP-LOG-${world.id.slice(-4).toUpperCase()} に関連する観測記録は、財団サイト-81UT の耐火防護アーカイブ内に電磁暗号化して保管されます。対象（エージェント・${world.player}）が新たな地点記録を開始した場合、特異点研究班は直ちにドローンによる遠隔監視体制を確立してください。

---

## 説明

本件は、未特定の次元領域「${world.name}」において、エージェント・${world.player}（および随伴個体: ${memberListStr}）が引き起こした一連の時空間事象の総体です。
対象者は自覚のないまま特異点へと接近し、記録（全${stats.recordsCount}件）を残し続けています。

---

## 観測事案タイムライン

${incidentLogs}

---

## 研究主任 Dr. アークによる評価

> 「エージェント・${world.player} の生存執着および記録行動は異常な反復性を示している。特に DAY-${stats.daysCount} 時点における行動ログを見る限り、彼自身がこの異常世界の法則を書き換えている可能性すら否定できない。引き続き注意深く経過を観察する。」
`;

    return {
      id: `wiki-${world.id}-scp-${Date.now()}`,
      worldId: world.id,
      style: 'scp',
      title,
      summary,
      content,
      generatedAt: new Date().toISOString(),
      stats,
    };
  }

  // style === 'ancient'
  const title = `滅びの叙事詩 // 『${world.name} 踏破録』`;
  const summary = `古の吟遊詩人が紡ぐ、流浪の旅人「${world.player}」が遺した${stats.daysCount}の日々と足跡の哀歌。`;

  const verses = primaryLocations
    .map((r) => {
      return `### ［第${r.dayNumber}章］ 黄昏の${r.locationName}にて
*「${r.recordedAt}、風は西から吹き荒び、旅人は歩みを止めず」*

${r.memo}

> *(古の注釈: かの地 ${r.coords ? `[X:${r.coords.x} Z:${r.coords.z}]` : ''} に刻まれた足跡は、永劫の時を経て石へと変わったという)*`;
    })
    .join('\n\n');

  const content = `# ${title}

*――星々の囁きが途絶え、世界の果てに静寂が訪れるとき、この書を開け。*

---

## 序詩：忘れ去られし開拓者たちの影

かつてこの地を歩んだ旅人ありき。その名を **${world.player}** と呼ぶ。
彼（彼女）は虚無の荒野に光を求め、仲間たち（${memberListStr}）と共に、誰一人歩まぬ断崖と闇の深淵を征服せんと誓いぬ。

ここに、${stats.daysCount}の昼夜と${stats.recordsCount}の軌跡を記したる古文書の断片を遺す。

---

## 本文：踏破の詩節

${verses}

---

## 終詩：消えざる篝火

旅人の歩みは止まらず、築かれし時計塔と拠点は、夜の帳を裂く篝火となりて今も輝く。
彼らが残した ${stats.photosCount} 枚の記憶の絵姿は、滅びゆく世界の片隅で、永遠に語り継がれるであろう。

*(古文書 完)*
`;

  return {
    id: `wiki-${world.id}-ancient-${Date.now()}`,
    worldId: world.id,
    style: 'ancient',
    title,
    summary,
    content,
    generatedAt: new Date().toISOString(),
    stats,
  };
}
