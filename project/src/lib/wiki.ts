import type { LocationWithPhotos, WorldWithMembers } from './types';

export type WikiStyle = {
  id: string;
  name: string;
  description: string;
};

export const WIKI_STYLES: WikiStyle[] = [
  { id: 'wikipedia', name: 'Wikipedia風', description: '百科事典風の客観的な記述' },
  { id: 'scp', name: 'SCP財団風', description: '機密文書風の冷徹な報告書' },
  { id: 'ancient', name: '絶望古文書風', description: '滅びゆく世界の古文書風の記録' },
];

export type WikiGenerationInput = {
  world: WorldWithMembers;
  locations: LocationWithPhotos[];
  style: string;
};

export type WikiGenerationResult = {
  content: string;
};

export type WikiProvider = {
  generate(input: WikiGenerationInput): Promise<WikiGenerationResult>;
};

// Placeholder provider — generates a structured article from the recorded data
// without calling any external AI. This keeps the AI layer swappable: replace
// this function (or inject a different WikiProvider) to connect OpenRouter,
// Gemini, or a local 4B model later. API keys must never live in the frontend.
export const placeholderProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations, style } = input;
    const memberNames = world.members.map((m) => m.name);
    const player = world.player || 'プレイヤー';

    const sorted = [...locations].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const styleHeader =
      style === 'scp'
        ? '【SCP財団 内部記録】'
        : style === 'ancient'
          ? '【絶望古文書・記録】'
          : '【百科事典記事】';

    const lines: string[] = [];
    lines.push(styleHeader);
    lines.push('');
    lines.push(`== ${world.name} ==`);
    lines.push('');
    lines.push(`概要: ${world.memo || '（概要の記録なし）'}`);
    lines.push(`主要構成員: ${[player, ...memberNames].join('、')}`);
    lines.push(`記録されたロケーション数: ${locations.length}`);
    lines.push('');

    if (sorted.length === 0) {
      lines.push('（ロケーションが記録されていません。記録を追加すると記事が充実します。）');
    } else {
      lines.push('== 記録された地点 ==');
      lines.push('');
      for (const loc of sorted) {
        const time = new Date(loc.created_at).toLocaleString('ja-JP', {
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const members = loc.members.map((m) => m.name).join('・') || '単独行動';
        lines.push(`■ ${loc.name} (${loc.x}, ${loc.y}, ${loc.z})`);
        if (loc.detail_memo) lines.push(`  ${loc.detail_memo}`);
        lines.push(`  関連: ${members} — ${time}`);
        lines.push('');
      }
    }

    lines.push('');
    lines.push('※この記事は記録された情報を基に構成されています。未記録の事象は推測・脚色を含む場合があります。');

    return { content: lines.join('\n') };
  },
};

let currentProvider: WikiProvider = placeholderProvider;

export function setWikiProvider(p: WikiProvider) {
  currentProvider = p;
}

export async function generateWiki(input: WikiGenerationInput): Promise<WikiGenerationResult> {
  return currentProvider.generate(input);
}
