import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { fetchWikiArticle, getPhotoUrl } from './db';
import { supabase } from './supabase';

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations, style } = input;

    const existingArticle = await fetchWikiArticle(world.id, style);
    if (existingArticle) {
      const confirmed = window.confirm(
        '現在の記事を新しいAI生成結果で置き換えます。\n\n現在の記事は、生成に成功した場合に新しい記事へ置き換わります。\n再生成しますか？'
      );
      if (!confirmed) {
        throw new Error('再生成をキャンセルしました。現在の記事はそのままです。');
      }
    }

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
    const imageUrl = mainPhoto ? getPhotoUrl(mainPhoto.storage_path) : undefined;

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', {
      body: {
        systemPrompt,
        message: imageUrl
          ? `${message}\n\n【画像について】\n添付画像はロケーション1「${locations[0]?.name}」の代表写真です。画像そのものを確認し、写真に写っている内容をロケーション1の情報と関連付けてWiki記事を作成してください。`
          : message,
        ...(imageUrl ? { imageUrl } : {}),
      },
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
    return { content: data.message || '' };
  },
};
