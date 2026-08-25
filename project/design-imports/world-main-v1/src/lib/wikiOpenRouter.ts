import type { LocationWithPhotos, WorldWithMembers } from './types';

export const openRouterTestProvider = {
  generate: async ({
    world,
    locations,
    style
  }: {
    world: WorldWithMembers;
    locations: LocationWithPhotos[];
    style: string;
  }): Promise<{ content: string }> => {
    // Artificial brief delay for RPG calculation feel
    await new Promise((resolve) => setTimeout(resolve, 1400));

    const locationSummaries = locations
      .map(
        (loc) =>
          `### ${loc.name} (X: ${loc.x}, Y: ${loc.y}, Z: ${loc.z})\n` +
          `* **記録日時:** ${new Date(loc.created_at).toLocaleString('ja-JP')}\n` +
          `* **概要・記録メモ:** ${loc.detail_memo || '詳細な記録は残されていない。周囲は静寂に包まれていた。'}\n` +
          (loc.members.length > 0
            ? `* **同行メンバー:** ${loc.members.map((m) => m.name).join(', ')}\n`
            : '')
      )
      .join('\n\n');

    if (style === 'wikipedia') {
      return {
        content: `# ${world.name}\n\n` +
          `**${world.name}**（英: *${world.name} Realm*）は、探検者 **${world.player || '名無しの冒険者'}** によって踏破・観測された広大な大地である。\n\n` +
          `## 概要\n` +
          `本作戦領域には計 **${locations.length} 箇所** の主要拠点が記録されており、未知の地形や遺構が点在している。気候や生態系は多様で、初期観測から多数の資源と危険が報告されている。\n\n` +
          `## 観測された主要地点\n\n` +
          locationSummaries +
          `\n\n## 調査総括\n` +
          `現在も周辺宙域および地下坑道の調査が進行中である。記録の完全性は保証されておらず、更なる踏破が推奨される。\n\n` +
          `## 関連項目\n` +
          `* [ウタペディア地理学大系]\n` +
          `* [サバイバル探索白書]\n` +
          `* [次元座標系標準規格]`
      };
    }

    if (style === 'scp') {
      return {
        content: `# アイテム番号: AREA-${world.id.slice(0, 6).toUpperCase()}\n\n` +
          `**オブジェクトクラス:** Euclid / Keter 境界観測\n\n` +
          `**特別収容プロトコル:** 対象領域「${world.name}」への一般人の立ち入りは厳重に制限される。調査担当官 **${world.player || 'Agent Unknown'}** 指揮下の機動部隊のみが観測端末を用いた接近を許可されている。\n\n` +
          `**説明:** 対象は異常な空間歪曲と不連続な地形生成を伴う領域である。現時点で確認された特異地点は以下の通り。\n\n` +
          locationSummaries +
          `\n\n**補遺 AREA-${world.id.slice(0, 6).toUpperCase()}-1:**\n` +
          `観測機器のログによると、これらの地点間を移動する際、通常の物理法則とは異なる時空跳躍が観測されている。全調査員は座標ロガーを常時携帯せよ。`
      };
    }

    // Ancient style (絶望古文書)
    return {
      content: `# 遺されし書: 『${world.name} 滅亡の残響』\n\n` +
        `ああ……神よ、なぜ我らを見捨てたもうたのか……。\n` +
        `この呪われし地 **${world.name}** に足を踏み入れた者たちは、皆その光を失っていった。\n` +
        `旅人 **${world.player || '名もなき亡霊'}** よ、もしこの書を読む時が来たのなら、直ちに引き返すがよい……。\n\n` +
        `## 刻まれた災禍の跡\n\n` +
        locationSummaries +
        `\n\n## 最後の祈り\n` +
        `火は消え、星々は凍てついた。この座標に何が眠るのか、我らには知る由もない。\n` +
        `ただ風だけが、忘れ去られた過去の叫びを運んでいる……。`
    };
  }
};
