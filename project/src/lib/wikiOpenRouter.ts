import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { supabase } from './supabase';

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations, style } = input;

    const message = [
      `ワールド名: ${world.name}`,
      `ワールド概要: ${world.memo || 'なし'}`,
      `プレイヤー: ${world.player || 'なし'}`,
      `ロケーション数: ${locations.length}`,
      ...locations.map((location) => [
        `ロケーション名: ${location.name}`,
        `座標: ${location.x}, ${location.y}, ${location.z}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((m) => m.name).join('・') || 'なし'}`,
      ].join('\n')),
    ].join('\n');

    const systemPrompt = getWikiSystemPrompt(style);

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', {
      body: {
        systemPrompt,
        message,
      },
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
    return { content: data.message || '' };
  },
};
