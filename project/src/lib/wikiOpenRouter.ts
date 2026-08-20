import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { supabase } from './supabase';

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations } = input;
    const message = [
      'これはWiki生成の最小AIテストです。以下の記録情報だけを使って短い日本語の文章を作成してください。まだ本番用Wiki記事は作りません。',
      `ワールド名: ${world.name}`,
      `ワールド概要: ${world.memo || 'なし'}`,
      `プレイヤー: ${world.player || 'なし'}`,
      `ロケーション数: ${locations.length}`,
      ...locations.map((location) => `ロケーション名: ${location.name}\n座標: ${location.x}, ${location.y}, ${location.z}\n詳細メモ: ${location.detail_memo || 'なし'}\n作成日時: ${location.created_at}\n関連メンバー: ${location.members.map((m) => m.name).join('・') || 'なし'}`),
    ].join('\n');

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', { body: { message } });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
    return { content: data.message || '' };
  },
};
