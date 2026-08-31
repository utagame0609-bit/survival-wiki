import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { parseScpAiResponse, SCP_STRUCTURED_OUTPUT_INSTRUCTIONS } from './wikiScp';
import { supabase } from './supabase';

const NARRATOR_MARKER = '<!--NARRATOR_LINE:';

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
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
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

    const narratorInstruction = style === 'wikipedia'
      ? `【NPCの一言出力ルール】\n記事本文を書き終えたあと、最後の1行だけに、百科事典編纂を終えた民俗学者エルナン本人からプレイヤーへ向けた1〜2文・80文字以内の短評を追加してください。記事の要約ではなく、今回の実際の記録から一つだけ拾い、自分の分析への強い自信を見せつつ、ときどき記録上の小さな現実によってその自信にわずかな綻びが出る内容にしてください。本文にない新事実は追加せず、プレイヤー本人の人格・知性・能力・容姿を侮辱しないでください。同じ導入句や同じオチを繰り返さないでください。形式は必ず <!--NARRATOR_LINE:ここに一言--> とし、このマーカー以外の補足は付けないでください。`
      : `【NPCの一言出力ルール】\n記事本文を書き終えたあと、最後の1行だけに、今回の記録を読んだ編纂官本人からプレイヤーへ向けた40〜70文字程度の短い一言を追加してください。記事本文の要約ではなく、今回実際に記録された行動・結果・写真の状況のどれか一つを軽く拾い、その人格らしい明快なツッコミや感想にしてください。プレイヤー本人の知性・能力・容姿・人格を否定する表現は禁止です。編纂官本人の大げささやズレが少し見える一言を優先してください。形式は必ず <!--NARRATOR_LINE:ここに一言--> とし、このマーカー以外の補足は付けないでください。`;

    const systemPrompt = style === 'scp'
      ? `${getWikiSystemPrompt(style)}\n\n${SCP_STRUCTURED_OUTPUT_INSTRUCTIONS}`
      : `${getWikiSystemPrompt(style)}\n\n${narratorInstruction}`;
    const mainPhoto = locations[0]?.photos.find((photo) => photo.is_main) ?? null;
    const imageStoragePath = mainPhoto?.storage_path;

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', {
      body: {
        systemPrompt,
        message: imageStoragePath
          ? `${message}\n\n【画像について】\n添付画像はロケーション1「${locations[0]?.name}」の代表写真です。画像そのものを確認し、写真に写っている内容をロケーション1の情報と関連付けて記事を作成してください。`
          : message,
        ...(imageStoragePath ? { imageStoragePath } : {}),
      },
    });

    if (error) throw error;
    if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');

    const raw = String(data.message || '').trim();

    if (style === 'scp') {
      const { dossier, narratorLine } = parseScpAiResponse(raw);
      return {
        content: `${JSON.stringify(dossier)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`,
      };
    }

    const markerIndex = raw.lastIndexOf(NARRATOR_MARKER);
    if (markerIndex < 0) return { content: raw };

    const markerEnd = raw.indexOf('-->', markerIndex);
    if (markerEnd < 0) return { content: raw };

    const narratorLine = raw.slice(markerIndex + NARRATOR_MARKER.length, markerEnd).trim();
    const content = `${raw.slice(0, markerIndex)}${raw.slice(markerEnd + 3)}`.trim();
    return { content: narratorLine ? `${content}\n\n<!--WIKI_NARRATOR:${narratorLine}-->` : content };
  },
};