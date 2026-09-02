import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { parseScpAiResponse, SCP_STRUCTURED_OUTPUT_INSTRUCTIONS } from './wikiScp';
import { GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS, parseGildasAiResponse } from './wikiGildas';
import { HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS, parseHernanAiResponse } from './wikiHernan';
import { supabase } from './supabase';

const MAX_WIKI_AI_PHOTOS = 5;

type WikiPhotoCandidate = {
  key: string;
  storagePath: string;
  createdAt: string;
  isMain: boolean;
  locationId: string;
  locationName: string;
};

type WikiPhotoInput = {
  storagePath: string;
  label: string;
};

type WikiSourcePlan = {
  storyArc: string;
  importantRecordKeys: string[];
  selectedPhotoKeys: string[];
};

const PHOTO_SELECTION_SYSTEM_PROMPT = `
あなたはSurvival Wikiの記事を書く前段階を担当する資料編集者です。
この段階では記事本文を書きません。全記録のテキスト、時系列、写真の有無と写真メタデータだけを読み、最終記事の大枠と「実画像を確認する価値が高い写真」を選びます。

最優先ルール:
- 入力にない出来事、感情、写真内容を事実として追加しない。
- この段階では写真の実画像は見えていない。写真に何が写っているか推測・断定しない。
- 記録全体の時系列を把握し、序盤・変化・転機・達成・最新状況など、記事として重要な流れを簡潔に整理する。
- 写真候補は記事全体を代表できるよう、同じ時期や同じ記録へ不必要に偏らせない。
- 写真候補は最大5枚。写真候補が存在する場合は1枚以上選ぶ。
- 写真キーは入力に存在する P1, P2... のみ使用する。
- 記録キーは入力に存在する R1, R2... のみ使用する。

次のJSONだけを返す。Markdownコードフェンスや説明文は付けない。
{
  "storyArc": "確認事実だけを土台にした記事全体の流れを2〜4文で記述",
  "importantRecordKeys": ["R1", "R2"],
  "selectedPhotoKeys": ["P1", "P2"]
}
`;

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

function chronologicalLocations(input: WikiGenerationInput) {
  return [...input.locations].sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function collectWikiPhotoCandidates(input: WikiGenerationInput): WikiPhotoCandidate[] {
  return chronologicalLocations(input)
    .flatMap((location) => location.photos.map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .map(({ location, photo }, index) => ({
      key: `P${index + 1}`,
      storagePath: photo.storage_path,
      createdAt: photo.created_at,
      isMain: photo.is_main,
      locationId: location.id,
      locationName: location.name,
    }));
}

function buildPhotoSelectionMessage(input: WikiGenerationInput, candidates: WikiPhotoCandidate[]) {
  const locations = chronologicalLocations(input);
  const candidatesByLocation = new Map<string, WikiPhotoCandidate[]>();
  candidates.forEach((candidate) => {
    const current = candidatesByLocation.get(candidate.locationId) ?? [];
    current.push(candidate);
    candidatesByLocation.set(candidate.locationId, current);
  });

  return [
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `総記録数: ${locations.length}`,
    `総写真数: ${candidates.length}`,
    '',
    ...locations.map((location, index) => {
      const photos = candidatesByLocation.get(location.id) ?? [];
      return [
        `【記録R${index + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        `写真数: ${photos.length}`,
        ...(photos.length > 0
          ? photos.map((photo) => `写真候補 ${photo.key}: ${photo.isMain ? '代表写真' : '追加写真'} / 撮影記録日時 ${photo.createdAt}`)
          : ['写真候補: なし']),
        '',
      ].join('\n');
    }),
  ].join('\n');
}

function parseSourcePlan(raw: string): WikiSourcePlan | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<WikiSourcePlan>;
    return {
      storyArc: typeof parsed.storyArc === 'string' ? parsed.storyArc.trim() : '',
      importantRecordKeys: Array.isArray(parsed.importantRecordKeys)
        ? parsed.importantRecordKeys.filter((value): value is string => typeof value === 'string')
        : [],
      selectedPhotoKeys: Array.isArray(parsed.selectedPhotoKeys)
        ? parsed.selectedPhotoKeys.filter((value): value is string => typeof value === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

async function invokeWikiAi(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('wiki-ai-test', { body });
  if (error) throw error;
  if (!data?.ok) throw new Error(data?.error || 'AIから正常な応答がありません。');
  return String(data.message || '').trim();
}

async function selectWikiPhotos(input: WikiGenerationInput, candidates: WikiPhotoCandidate[]) {
  if (candidates.length <= MAX_WIKI_AI_PHOTOS) {
    return { photos: candidates, plan: null as WikiSourcePlan | null };
  }

  try {
    const raw = await invokeWikiAi({
      task: 'photo_selection',
      systemPrompt: PHOTO_SELECTION_SYSTEM_PROMPT,
      message: buildPhotoSelectionMessage(input, candidates),
    });
    const plan = parseSourcePlan(raw);
    if (!plan) throw new Error('写真選定結果を解析できませんでした。');

    const candidateByKey = new Map(candidates.map((candidate) => [candidate.key, candidate]));
    const selected = Array.from(new Set(plan.selectedPhotoKeys))
      .map((key) => candidateByKey.get(key))
      .filter((candidate): candidate is WikiPhotoCandidate => Boolean(candidate))
      .slice(0, MAX_WIKI_AI_PHOTOS)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    if (selected.length === 0) throw new Error('写真選定結果に有効な写真がありませんでした。');
    return { photos: selected, plan };
  } catch (error) {
    console.warn('[wiki] photo selection failed; using chronological fallback', error);
    return { photos: candidates.slice(0, MAX_WIKI_AI_PHOTOS), plan: null as WikiSourcePlan | null };
  }
}

function buildArticleMessage(
  input: WikiGenerationInput,
  selectedPhotos: WikiPhotoCandidate[],
  plan: WikiSourcePlan | null,
) {
  const locations = chronologicalLocations(input);
  const photoNumberByPath = new Map(selectedPhotos.map((photo, index) => [photo.storagePath, index + 1]));
  const selectedByLocation = new Map<string, WikiPhotoCandidate[]>();
  selectedPhotos.forEach((photo) => {
    const current = selectedByLocation.get(photo.locationId) ?? [];
    current.push(photo);
    selectedByLocation.set(photo.locationId, current);
  });

  const planningContext = plan
    ? [
        '【第1段階の資料編集計画】',
        `記事全体の大枠: ${plan.storyArc || '指定なし'}`,
        `重要記録候補: ${plan.importantRecordKeys.join('・') || '指定なし'}`,
        'この計画は実画像を見る前の暫定案です。添付された実画像で確認できる事実を優先し、必要なら構成を調整してください。',
        '',
      ]
    : [];

  return [
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `ロケーション数: ${locations.length}`,
    `ワールド内の総写真数: ${collectWikiPhotoCandidates(input).length}`,
    `AIへ実画像として添付する選定写真数: ${selectedPhotos.length}`,
    selectedPhotos.length > 0
      ? `実画像は写真1〜写真${selectedPhotos.length}として添付します。本文のphotoIndexes等で写真へ言及する場合は、この番号だけを使用してください。`
      : '添付写真はありません。',
    '',
    ...planningContext,
    ...locations.map((location, locationIndex) => {
      const selectedForLocation = selectedByLocation.get(location.id) ?? [];
      return [
        `【記録R${locationIndex + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        `紐づく写真数: ${location.photos.length}`,
        ...(selectedForLocation.length > 0
          ? [
              '今回実画像を確認する写真:',
              ...selectedForLocation.map((photo) => {
                const photoNumber = photoNumberByPath.get(photo.storagePath);
                return `  写真${photoNumber}: ${photo.isMain ? '代表写真' : '追加写真'} / 撮影記録日時: ${photo.createdAt}`;
              }),
            ]
          : ['今回実画像を確認する写真: なし']),
        '',
      ].join('\n');
    }),
  ].join('\n');
}

function toWikiPhotoInputs(selectedPhotos: WikiPhotoCandidate[]): WikiPhotoInput[] {
  return selectedPhotos.map((photo, index) => ({
    storagePath: photo.storagePath,
    label: `写真${index + 1} / ロケーション「${photo.locationName}」 / ${photo.isMain ? '代表写真' : '追加写真'} / 撮影記録日時 ${photo.createdAt}`,
  }));
}

function withPhotoPathMarker(content: string, selectedPhotos: WikiPhotoCandidate[]) {
  if (selectedPhotos.length === 0) return content;
  return `${content}\n\n<!--WIKI_PHOTO_PATHS:${JSON.stringify(selectedPhotos.map((photo) => photo.storagePath))}-->`;
}

export const openRouterTestProvider: WikiProvider = {
  async generate(input: WikiGenerationInput): Promise<WikiGenerationResult> {
    const { style } = input;
    const allPhotoCandidates = collectWikiPhotoCandidates(input);
    const { photos: selectedPhotos, plan } = await selectWikiPhotos(input, allPhotoCandidates);
    const wikiPhotos = toWikiPhotoInputs(selectedPhotos);

    const structuredInstructions = style === 'scp'
      ? SCP_STRUCTURED_OUTPUT_INSTRUCTIONS
      : style === 'ancient'
        ? GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS
        : HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS;

    const systemPrompt = `${getWikiSystemPrompt(style)}\n\n${structuredInstructions}\n\n${NARRATOR_LINE_TONE_INSTRUCTIONS[style]}`;
    const raw = await invokeWikiAi({
      task: 'article',
      systemPrompt,
      message: buildArticleMessage(input, selectedPhotos, plan),
      imageInputs: wikiPhotos,
    });

    if (style === 'scp') {
      const { dossier, narratorLine } = parseScpAiResponse(raw);
      return {
        content: withPhotoPathMarker(`${JSON.stringify(dossier)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
      };
    }

    if (style === 'ancient') {
      const { chronicle, narratorLine } = parseGildasAiResponse(raw);
      return {
        content: withPhotoPathMarker(`${JSON.stringify(chronicle)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
      };
    }

    const { article, narratorLine } = parseHernanAiResponse(raw);
    return {
      content: withPhotoPathMarker(`${JSON.stringify(article)}\n\n<!--WIKI_NARRATOR:${narratorLine}-->`, selectedPhotos),
    };
  },
};
