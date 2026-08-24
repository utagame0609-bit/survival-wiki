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
      '',
      ...locations.map((location, locationIndex) => [
        `【ロケーション${locationIndex + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.x}, ${location.y}, ${location.z}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((m) => m.name).join('・') || 'なし'}`,
        `紐づく写真数: ${location.photos.length}`,
        ...(location.photos.length > 0
          ? [
              '紐づく写真:',
              ...location.photos.map((photo, photoIndex) =>
                `  写真${photoIndex + 1}: ${photo.is_main ? '代表写真' : '追加写真'} / 撮影記録日時: ${photo.created_at} / 保存先: ${photo.storage_path}`
              ),
            ]
          : ['紐づく写真: なし']),
        '',
      ].join('\n')),
    ].join('\n');

    const systemPrompt = getWikiSystemPrompt(style);
    const mainPhoto = locations[0]?.photos.find((photo) => photo.is_main) ?? null;
    const imageStoragePath = mainPhoto?.storage_path;

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', {
      body: {
        systemPrompt,
        message: imageStoragePath
          ? `${message}\n\n【画像について】\n添付画像はロケーション1「${locations[0]?.name}」の代表写真です。画像そのものを確認し、写真に写っている内容をロケーション1の情報と関連付けてWiki記事を作成してください。`
          : message,
        ...(imageStoragePath ? { imageStoragePath } : {}),
      },
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
    return { content: data.message || '' };
  },
};