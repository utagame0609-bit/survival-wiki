import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { parseScpAiResponse, SCP_STRUCTURED_OUTPUT_INSTRUCTIONS } from './wikiScp';
import { GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS, parseGildasAiResponse } from './wikiGildas';
import { HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS, parseHernanAiResponse } from './wikiHernan';
import { supabase } from './supabase';

const MAX_WIKI_AI_PHOTOS = 5;

type WikiPhotoInput = {
  storagePath: string;
  label: string;
  createdAt: string;
};

const NARRATOR_LINE_TONE_INSTRUCTIONS: Record<WikiGenerationInput['style'], string> = {
  wikipedia: `
【生成後のエルナン本人の一言 / 口調固定】
- narratorLine は民俗学者エルナン本人の発話として書く。
- 本文と同じ人格を維持し、落ち着いた「〜である」「〜だ」「〜と考える」「〜と見てよい」等の常体を基本にする。
- 一般的なAI応答・接客文の「〜です」「〜ます」「〜いたします」「〜ございます」へ勝手に丁寧化しない。
- 学者としての自信、学術的な過剰分析、今回固有の小さな事実との落差を短く残す。
`,
  scp: `
【生成後のDr.アーク本人の一言 / 口調固定】
- narratorLine はDr.アーク本人の発話として書く。
- 簡潔で冷静な機密報告・判定口調を維持し、「〜と判断する」「〜で十分だ」「案件は終了する」「記録は残す」等の常体を基本にする。
- 一般的なAI応答・接客文の「〜です」「〜ます」「〜いたします」「〜ございます」へ勝手に丁寧化しない。
- 大声のホラーや感情的な語尾ではなく、真顔の判断と今回固有の事実の落差を短く残す。
`,
  ancient: `
【生成後のギルダス本人の一言 / 口調固定】
- narratorLine は老吟遊詩人ギルダス本人の発話として書く。
- 本文と同じ古風だが読みやすい語り口を維持し、「〜であった」「〜であろう」「〜なのだ」「〜おる」等を自然に使う。
- 一般的なAI応答・接客文の「〜です」「〜ます」「〜いたします」「〜ございます」へ勝手に丁寧化しない。
- 本人は最後まで真面目であり、自分の語りを「大げさだった」「盛りすぎた」とメタ的に説明しない。
- 今回固有の記録を一つ拾い、記録を残す価値への愛着・祝福・余韻を短く残す。
`,
};

function collectWikiPhotos(input: WikiGenerationInput): WikiPhotoInput[] {
  const { locations } = input;
  return locations
    .flatMap((location) => location.photos.map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .slice(0, MAX_WIKI_AI_PHOTOS)
    .map(({ location, photo }, index) => ({
      storagePath: photo.storage_path,
      createdAt: photo.created_at,
      label: `写真${index + 1} / ロケーション「${location.name}」 / ${photo.is_main ? '代表写真' : '追加写真'} / 撮影記録日時 ${photo.created_at}`,
    }));
}

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { world, locations, style } = input;
    const wikiPhotos = collectWikiPhotos(input);
    const photoNumberByPath = new Map(wikiPhotos.map((photo, index) => [photo.storagePath, index + 1]));

    const message = [
      `ワールド名: ${world.name}`,
      `ワールド概要: ${world.memo || 'なし'}`,
      `プレイヤー: ${world.player || 'なし'}`,
      `ロケーション数: ${locations.length}`,
      `AIへ実画像として添付する写真数: ${wikiPhotos.length}`,
      wikiPhotos.length > 0 ? '写真番号は、後続の実画像ラベル「写真1〜写真5」と一致します。本文で写真へ言及する場合はこの番号対応を守ってください。' : '添付写真はありません。',
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
              ...location.photos.map((photo) => {
                const globalNumber = photoNumberByPath.get(photo.storage_path);
                const numberLabel = globalNumber ? `写真${globalNumber}` : 'AI実画像添付対象外';
                return `  ${numberLabel}: ${photo.is_main ? '代表写真' : '追加写真'} / 撮影記録日時: ${photo.created_at}`;
              }),
            ]
          : ['紐づく写真: なし']),
        '',
      ].join('\n')),
    ].join('\n');

    const structuredInstructions = style === 'scp'
      ? SCP_STRUCTURED_OUTPUT_INSTRUCTIONS
      : style === 'ancient'
        ? GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS
        : HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS;

    const systemPrompt = `${getWikiSystemPrompt(style)}\n\n${structuredInstructions}\n\n${NARRATOR_LINE_TONE_INSTRUCTIONS[style]}`;

    const { data, error } = await supabase.functions.invoke('wiki-ai-test', {
      body: {
        systemPrompt,
        message,
        imageInputs: wikiPhotos.map((photo) => ({
          storagePath: photo.storagePath,
          label: photo.label,
        })),
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

    if (style === 'ancient') {
      const { chronicle, narratorLine } = parseGildasAiResponse(raw);
      return {
        content: `${JSON.stringify(chronicle)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`,
      };
    }

    const { article, narratorLine } = parseHernanAiResponse(raw);
    return {
      content: `${JSON.stringify(article)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`,
    };
  },
};