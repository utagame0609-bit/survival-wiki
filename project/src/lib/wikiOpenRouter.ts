import type { WikiGenerationInput, WikiGenerationResult, WikiProvider } from './wiki';
import { getWikiSystemPrompt } from './wiki';
import { parseScpAiResponse, SCP_STRUCTURED_OUTPUT_INSTRUCTIONS } from './wikiScp';
import { GILDAS_STRUCTURED_OUTPUT_INSTRUCTIONS, parseGildasAiResponse } from './wikiGildas';
import { HERNAN_STRUCTURED_OUTPUT_INSTRUCTIONS, parseHernanAiResponse } from './wikiHernan';
import { supabase } from './supabase';

const DEFAULT_MAX_WIKI_AI_PHOTOS = 5;

type WikiPhotoCandidate = {
  key: string;
  storagePath: string;
  createdAt: string;
  locationId: string;
  locationName: string;
};

type WikiPhotoInput = {
  storagePath: string;
  label: string;
};

type WikiPlanSection = {
  title: string;
  primaryRecordKeys: string[];
  supportingRecordKeys: string[];
  purpose: string;
};

type WikiSourcePlan = {
  storyArc: string;
  importantRecordKeys: string[];
  selectedPhotoKeys: string[];
  sections: WikiPlanSection[];
};

const PLANNING_LENS_BY_STYLE: Record<WikiGenerationInput['style'], string> = {
  wikipedia: '歴史・文化・地理・生活・技術上の変化や発見を重視し、百科事典として整理しやすい節目を選ぶ。',
  scp: '観測上の変化、原因と結果、危険・失敗・反証・管理判断につながる節目を重視する。ただし異常事象を捏造しない。',
  ancient: '旅の転機、発見、達成、失敗、帰還、再会、土地や記憶の変化など、年代記として流れが生まれる節目を重視する。',
};

function buildSourcePlanningSystemPrompt(maxAiPhotos: number) {
  return `
あなたはSurvival Wikiの記事を書く前段階を担当する資料編集者です。
この段階では記事本文を書きません。全記録のテキスト、時系列、メイン写真の有無とメタデータだけを読み、最終記事の編集計画と「実画像を確認する価値が高いメイン写真」を選びます。

最優先ルール:
- 入力にない出来事、感情、写真内容を事実として追加しない。
- この段階では写真の実画像は見えていない。写真に何が写っているか推測・断定しない。
- 記録全体の時系列を把握し、記事の導入・展開・転機・着地点が自然につながる大枠を作る。
- importantRecordKeys は、最終記事で特に重点を置く価値がある記録だけを選ぶ。
- sections は、全体を読みやすく整理するための編集設計である。同じ記録を理由なく複数章へ重複させない。
- 写真候補は記事全体を代表できるよう、同じ時期や同じ記録へ不必要に偏らせない。
- 写真候補は最大${maxAiPhotos}枚。候補が存在する場合は1枚以上選ぶ。
- 写真キーは入力に存在する P1, P2... のみ使用する。
- 記録キーは入力に存在する R1, R2... のみ使用する。
- 追加写真・サブ写真は候補として与えられない。存在を推測しない。

次のJSONだけを返す。Markdownコードフェンスや説明文は付けない。
{
  "storyArc": "確認事実だけを土台にした記事全体の流れを2〜4文で記述",
  "importantRecordKeys": ["R1", "R2"],
  "selectedPhotoKeys": ["P1", "P2"],
  "sections": [
    {
      "title": "章の役割が分かる短い仮タイトル",
      "primaryRecordKeys": ["R1"],
      "supportingRecordKeys": ["R2"],
      "purpose": "この章で何を伝えるかを1文で記述"
    }
  ]
}
`;
}

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
    .flatMap((location) => location.photos
      .filter((photo) => photo.is_main)
      .map((photo) => ({ location, photo })))
    .filter((entry, index, list) => list.findIndex((item) => item.photo.storage_path === entry.photo.storage_path) === index)
    .sort((a, b) => a.photo.created_at.localeCompare(b.photo.created_at))
    .map(({ location, photo }, index) => ({
      key: `P${index + 1}`,
      storagePath: photo.storage_path,
      createdAt: photo.created_at,
      locationId: location.id,
      locationName: location.name,
    }));
}

function buildSourcePlanningMessage(input: WikiGenerationInput, candidates: WikiPhotoCandidate[]) {
  const locations = chronologicalLocations(input);
  const candidateByLocation = new Map(candidates.map((candidate) => [candidate.locationId, candidate]));

  return [
    `記事スタイル: ${input.style}`,
    `スタイル別の編集観点: ${PLANNING_LENS_BY_STYLE[input.style]}`,
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `総記録数: ${locations.length}`,
    `AI参照候補のメイン写真数: ${candidates.length}`,
    '',
    ...locations.map((location, index) => {
      const photo = candidateByLocation.get(location.id);
      return [
        `【記録R${index + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        photo
          ? `メイン写真候補 ${photo.key}: 撮影記録日時 ${photo.createdAt}`
          : 'メイン写真候補: なし',
        '',
      ].join('\n');
    }),
  ].join('\n');
}

function stringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function parseSourcePlan(raw: string): WikiSourcePlan | null {
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;

  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1)) as Partial<WikiSourcePlan>;
    const sections = Array.isArray(parsed.sections)
      ? parsed.sections
        .filter((section): section is WikiPlanSection => Boolean(section) && typeof section === 'object')
        .map((section) => ({
          title: typeof section.title === 'string' ? section.title.trim() : '',
          primaryRecordKeys: stringArray(section.primaryRecordKeys),
          supportingRecordKeys: stringArray(section.supportingRecordKeys),
          purpose: typeof section.purpose === 'string' ? section.purpose.trim() : '',
        }))
        .filter((section) => section.title || section.purpose || section.primaryRecordKeys.length > 0)
      : [];

    return {
      storyArc: typeof parsed.storyArc === 'string' ? parsed.storyArc.trim() : '',
      importantRecordKeys: stringArray(parsed.importantRecordKeys),
      selectedPhotoKeys: stringArray(parsed.selectedPhotoKeys),
      sections,
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

async function selectWikiSources(
  input: WikiGenerationInput,
  candidates: WikiPhotoCandidate[],
  maxAiPhotos = DEFAULT_MAX_WIKI_AI_PHOTOS,
) {
  if (candidates.length <= maxAiPhotos) {
    return { photos: candidates, plan: null as WikiSourcePlan | null };
  }

  try {
    const raw = await invokeWikiAi({
      task: 'photo_selection',
      systemPrompt: buildSourcePlanningSystemPrompt(maxAiPhotos),
      message: buildSourcePlanningMessage(input, candidates),
    });
    const plan = parseSourcePlan(raw);
    if (!plan) throw new Error('資料編集計画を解析できませんでした。');

    const candidateByKey = new Map(candidates.map((candidate) => [candidate.key, candidate]));
    const selected = Array.from(new Set(plan.selectedPhotoKeys))
      .map((key) => candidateByKey.get(key))
      .filter((candidate): candidate is WikiPhotoCandidate => Boolean(candidate))
      .slice(0, maxAiPhotos)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    if (selected.length === 0) throw new Error('資料編集計画に有効なメイン写真がありませんでした。');
    return { photos: selected, plan };
  } catch (error) {
    console.warn('[wiki] source planning failed; using chronological main-photo fallback', error);
    return { photos: candidates.slice(0, maxAiPhotos), plan: null as WikiSourcePlan | null };
  }
}

function buildArticleMessage(
  input: WikiGenerationInput,
  selectedPhotos: WikiPhotoCandidate[],
  plan: WikiSourcePlan | null,
) {
  const locations = chronologicalLocations(input);
  const allMainPhotoCandidates = collectWikiPhotoCandidates(input);
  const mainPhotoByLocation = new Map(allMainPhotoCandidates.map((photo) => [photo.locationId, photo]));
  const photoNumberByPath = new Map(selectedPhotos.map((photo, index) => [photo.storagePath, index + 1]));
  const selectedByLocation = new Map(selectedPhotos.map((photo) => [photo.locationId, photo]));

  const planningContext = plan
    ? [
        '【第1段階の資料編集計画】',
        `記事全体の大枠: ${plan.storyArc || '指定なし'}`,
        `重点記録候補: ${plan.importantRecordKeys.join('・') || '指定なし'}`,
        ...(plan.sections.length > 0
          ? [
              '章構成案:',
              ...plan.sections.map((section, index) => [
                `  ${index + 1}. ${section.title || '無題'}`,
                `     主記録: ${section.primaryRecordKeys.join('・') || 'なし'}`,
                `     補助記録: ${section.supportingRecordKeys.join('・') || 'なし'}`,
                `     目的: ${section.purpose || '指定なし'}`,
              ].join('\n')),
            ]
          : []),
        'この計画は実画像を見る前の編集案です。入力事実と実画像で確認できる内容を最優先し、人格固有の正式出力構造に合わせて必要なら章名や配分を調整してください。',
        '',
      ]
    : [];

  return [
    `ワールド名: ${input.world.name}`,
    `ワールド概要: ${input.world.memo || 'なし'}`,
    `プレイヤー: ${input.world.player || 'なし'}`,
    `ロケーション数: ${locations.length}`,
    `AI参照候補のメイン写真数: ${allMainPhotoCandidates.length}`,
    `AIへ実画像として添付する選定メイン写真数: ${selectedPhotos.length}`,
    selectedPhotos.length > 0
      ? `実画像は写真1〜写真${selectedPhotos.length}として添付します。本文のphotoIndexes等で写真へ言及する場合は、この番号だけを使用してください。`
      : '添付写真はありません。',
    '追加写真・サブ写真はAI資料として扱いません。入力に存在すると推測したり、本文で言及したりしないでください。',
    '',
    ...planningContext,
    ...locations.map((location, locationIndex) => {
      const mainPhoto = mainPhotoByLocation.get(location.id);
      const selectedPhoto = selectedByLocation.get(location.id);
      return [
        `【記録R${locationIndex + 1}】`,
        `ロケーション名: ${location.name}`,
        `座標: ${location.has_coordinates ? `${location.x}, ${location.y}, ${location.z}` : '未入力'}`,
        `詳細メモ: ${location.detail_memo || 'なし'}`,
        `作成日時: ${location.created_at}`,
        `関連メンバー: ${location.members.map((member) => member.name).join('・') || 'なし'}`,
        `AI参照対象のメイン写真: ${mainPhoto ? 'あり' : 'なし'}`,
        selectedPhoto
          ? `今回実画像を確認するメイン写真: 写真${photoNumberByPath.get(selectedPhoto.storagePath)} / 撮影記録日時 ${selectedPhoto.createdAt}`
          : '今回実画像を確認するメイン写真: なし',
        '',
      ].join('\n');
    }),
  ].join('\n');
}

function toWikiPhotoInputs(selectedPhotos: WikiPhotoCandidate[]): WikiPhotoInput[] {
  return selectedPhotos.map((photo, index) => ({
    storagePath: photo.storagePath,
    label: `写真${index + 1} / ロケーション「${photo.locationName}」 / メイン写真 / 撮影記録日時 ${photo.createdAt}`,
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
    const { photos: selectedPhotos, plan } = await selectWikiSources(input, allPhotoCandidates);
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